import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.nextUrl.host) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  if (body.website) return NextResponse.json({ success: true }); // Honeypot.
  const string = (key: string, max: number) => typeof body[key] === "string" ? (body[key] as string).trim().slice(0, max) : "";
  const name = string("name", 120), email = string("email", 254).toLowerCase();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a name and valid email" }, { status: 400 });
  const dedupeKey = string("requestId", 100);
  if (!/^[0-9a-f-]{36}$/.test(dedupeKey)) return NextResponse.json({ error: "Invalid request ID" }, { status: 400 });
  try {
    const client = db();
    const { data: existing } = await client.from("leads").select("id").eq("dedupe_key", dedupeKey).maybeSingle();
    if (existing) return NextResponse.json({ success: true, duplicate: true });
    const { count } = await client.from("leads").select("id", { count: "exact", head: true }).eq("email", email)
      .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());
    if ((count ?? 0) >= 5) return NextResponse.json({ error: "Too many requests. Please contact us directly." }, { status: 429 });
    const { error } = await client.from("leads").insert({ name, email, phone: string("phone", 50), company: string("company", 120),
      interest: string("interest", 80), team_size: string("teamSize", 50), message: string("message", 2000), dedupe_key: dedupeKey });
    if (error && error.code !== "23505") throw error;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "We could not save your enquiry. Please try again." }, { status: 503 });
  }
}
