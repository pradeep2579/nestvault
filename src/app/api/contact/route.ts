import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { budgetOptions, moveInOptions } from "@/lib/content";
import { deriveChannel, openStages, phoneKey, pickAssignee, validPhone } from "@/lib/crm";
import { logActivity } from "@/lib/lead-activity";
import { notifyNewLead } from "@/lib/alerts";

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.nextUrl.host) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  if (body.website) return NextResponse.json({ success: true }); // Honeypot.
  const string = (key: string, max: number) => typeof body[key] === "string" ? (body[key] as string).trim().slice(0, max) : "";
  const oneOf = (key: string, allowed: readonly string[]) => allowed.includes(string(key, 80)) ? string(key, 80) : "";
  const name = string("name", 120), email = string("email", 254).toLowerCase(), phone = string("phone", 50);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a name and valid email" }, { status: 400 });
  if (!validPhone(phone)) return NextResponse.json({ error: "Enter a valid phone or WhatsApp number so we can reach you" }, { status: 400 });
  const dedupeKey = string("requestId", 100);
  if (!/^[0-9a-f-]{36}$/.test(dedupeKey)) return NextResponse.json({ error: "Invalid request ID" }, { status: 400 });
  try {
    const client = db();
    const { data: existing } = await client.from("leads").select("id").eq("dedupe_key", dedupeKey).maybeSingle();
    if (existing) return NextResponse.json({ success: true, duplicate: true });
    const { count } = await client.from("leads").select("id", { count: "exact", head: true }).eq("email", email)
      .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());
    if ((count ?? 0) >= 5) return NextResponse.json({ error: "Too many requests. Please contact us directly." }, { status: 429 });

    const details = { interest: string("interest", 80), move_in: oneOf("moveIn", moveInOptions), budget: oneOf("budget", budgetOptions), message: string("message", 2000) };
    const channel = deriveChannel({ utm_source: string("utm_source", 100), utm_medium: string("utm_medium", 100), referrer: string("referrer", 300) });

    // The same person enquiring again is added to their existing lead instead of becoming a duplicate.
    const { data: byEmail } = await client.from("leads").select("id,stage").eq("email", email).limit(1).maybeSingle();
    const { data: byPhone } = byEmail ? { data: null } : await client.from("leads").select("id,stage").eq("phone_key", phoneKey(phone)).limit(1).maybeSingle();
    const match = byEmail || byPhone;
    if (match) {
      await client.from("lead_notes").insert({ lead_id: match.id, author_id: null,
        body: `Enquired again on the website${details.interest ? ` about ${details.interest}` : ""}.${details.message ? ` Message: ${details.message}` : ""}` });
      await client.from("leads").update({ updated_at: new Date().toISOString(), ...(match.stage === "lost" ? { stage: "new", lost_reason: null } : {}) }).eq("id", match.id);
      await logActivity(client, match.id, null, "reenquiry", `Enquired again on the website${match.stage === "lost" ? " - reopened from Lost" : ""}`);
      await notifyNewLead({ id: match.id, name, phone, email, channel, ...details }, true);
      return NextResponse.json({ success: true, repeat: true });
    }

    // Round-robin: give the new lead to whoever has the fewest open leads.
    let assignedTo: string | null = null;
    try {
      const [{ data: staff }, { data: open }] = await Promise.all([
        client.from("profiles").select("id").eq("active", true).order("created_at"),
        client.from("leads").select("assigned_to").in("stage", openStages).not("assigned_to", "is", null),
      ]);
      assignedTo = pickAssignee((staff || []).map(item => item.id as string), (open || []).map(item => item.assigned_to as string | null));
    } catch { assignedTo = null; }

    const { data: saved, error } = await client.from("leads").insert({ name, email, phone, company: string("company", 120), team_size: string("teamSize", 50),
      ...details, dedupe_key: dedupeKey, channel, utm_source: string("utm_source", 100) || null, utm_medium: string("utm_medium", 100) || null,
      utm_campaign: string("utm_campaign", 100) || null, referrer: string("referrer", 300) || null, assigned_to: assignedTo }).select("id").maybeSingle();
    if (error && error.code !== "23505") throw error;
    if (saved) {
      await logActivity(client, saved.id, null, "created", `Enquiry received via ${channel}`);
      if (assignedTo) await logActivity(client, saved.id, null, "assigned", "Assigned automatically");
      await notifyNewLead({ id: saved.id, name, phone, email, channel, ...details });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "We could not save your enquiry. Please try again." }, { status: 503 });
  }
}
