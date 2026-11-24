"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, requireActor } from "@/lib/supabase";
import { createHash } from "node:crypto";
import { stages, followUpOutcomes, lostReasons, plans } from "@/lib/content";
import { leadCsvColumns, readCsvLead } from "@/lib/leads-csv";
import { stageRequirement } from "@/lib/crm";
import { logActivity } from "@/lib/lead-activity";
import { istDateTime } from "@/lib/format";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const label = (stage: string) => stage.replaceAll("_", " ");

export async function updateLead(formData: FormData) {
  const current = await requireActor();
  const id = String(formData.get("id") || "");
  const stage = String(formData.get("stage") || "");
  if (!uuid.test(id) || !stages.includes(stage as typeof stages[number])) throw new Error("Invalid lead");
  const date = (key: string) => {
    const raw = String(formData.get(key) || "");
    if (!raw) return null;
    const timestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw) ? Date.parse(`${raw}+05:30`) : NaN;
    if (!Number.isFinite(timestamp)) redirect(`/admin/leads/${id}?error=date`);
    return new Date(timestamp).toISOString();
  };
  const text = (key: string, max: number) => String(formData.get(key) || "").trim().slice(0, max) || null;
  const pickOf = (key: string, allowed: readonly string[]) => { const value = String(formData.get(key) || ""); return allowed.includes(value) ? value : null; };
  const assigned = String(formData.get("assigned_to") || "") || null;
  const wonValue = Number(String(formData.get("won_value") || "").replace(/,/g, ""));
  const wonSeats = Number.parseInt(String(formData.get("won_seats") || ""), 10);
  const wonStart = /^\d{4}-\d{2}-\d{2}$/.test(String(formData.get("won_start_date") || "")) ? String(formData.get("won_start_date")) : null;

  const client = db();
  const { data: before, error: readError } = await client.from("leads").select("stage,tour_at,assigned_to,follow_up_at,follow_up_1_outcome,follow_up_2_at,follow_up_2_outcome,first_contacted_at,tour_completed_at,won_plan,won_value").eq("id", id).maybeSingle();
  if (readError || !before) throw new Error("This lead could not be found. Refresh and try again.");

  const tourAt = date("tour_at"), followUp1 = date("follow_up_at"), followUp2 = date("follow_up_2_at");
  const outcome1 = pickOf("follow_up_1_outcome", followUpOutcomes), outcome2 = pickOf("follow_up_2_outcome", followUpOutcomes);
  const lostReason = stage === "lost" ? pickOf("lost_reason", lostReasons) : null;
  const wonPlan = pickOf("won_plan", plans);
  const missing = stageRequirement(stage, { tour_at: tourAt, lost_reason: lostReason, won_plan: wonPlan, won_value: Number.isFinite(wonValue) ? wonValue : null });
  if (missing) redirect(`/admin/leads/${id}?error=need_${missing.code}`);

  const now = new Date().toISOString();
  const { error } = await client.from("leads").update({
    stage, tour_at: tourAt, assigned_to: assigned, follow_up_at: followUp1, follow_up_2_at: followUp2,
    follow_up_1_outcome: outcome1, follow_up_1_note: text("follow_up_1_note", 500), follow_up_2_outcome: outcome2, follow_up_2_note: text("follow_up_2_note", 500),
    lost_reason: lostReason, won_plan: wonPlan, won_value: Number.isFinite(wonValue) && wonValue > 0 ? wonValue : null,
    won_seats: Number.isFinite(wonSeats) && wonSeats > 0 ? wonSeats : null, won_start_date: wonStart,
    first_contacted_at: before.first_contacted_at || (stage !== "new" || outcome1 || outcome2 ? now : null),
    tour_completed_at: before.tour_completed_at || (stage === "tour_completed" || stage === "won" ? now : null),
    updated_at: now }).eq("id", id);
  if (error) throw new Error("Could not save this lead. Refresh and try again.");

  // Timeline entries for what actually changed.
  const same = (a: string | null, b: string | null) => (a ? new Date(a).getTime() : null) === (b ? new Date(b).getTime() : null);
  const log = (kind: Parameters<typeof logActivity>[3], detail: string) => logActivity(client, id, current.id, kind, detail);
  const entries: Promise<void>[] = [];
  if (before.stage !== stage) entries.push(log("stage", `Stage: ${label(before.stage)} → ${label(stage)}${lostReason ? ` (${lostReason})` : ""}`));
  if (before.assigned_to !== assigned) {
    const { data: person } = assigned ? await client.from("profiles").select("email").eq("id", assigned).maybeSingle() : { data: null };
    entries.push(log("assigned", assigned ? `Assigned to ${person?.email || "a team member"}` : "Unassigned"));
  }
  if (!same(before.tour_at, tourAt)) entries.push(log("tour", tourAt ? `Tour set for ${istDateTime(tourAt)}` : "Tour time cleared"));
  if (!same(before.follow_up_at, followUp1)) entries.push(log("follow_up", followUp1 ? `Follow-up 1 set for ${istDateTime(followUp1)}` : "Follow-up 1 date cleared"));
  if ((before.follow_up_1_outcome || null) !== outcome1 && outcome1) entries.push(log("follow_up", `Follow-up 1: ${outcome1}`));
  if (!same(before.follow_up_2_at, followUp2)) entries.push(log("follow_up", followUp2 ? `Follow-up 2 set for ${istDateTime(followUp2)}` : "Follow-up 2 date cleared"));
  if ((before.follow_up_2_outcome || null) !== outcome2 && outcome2) entries.push(log("follow_up", `Follow-up 2: ${outcome2}`));
  if (stage === "won" && (before.won_plan !== wonPlan || Number(before.won_value) !== (wonValue || 0))) entries.push(log("deal", `Deal: ${wonPlan}, ₹${wonValue.toLocaleString("en-IN")}/month`));
  await Promise.all(entries);

  revalidatePath("/admin/leads");
  redirect(`/admin/leads/${id}?saved=1`);
}

export async function addNote(formData: FormData) {
  const current = await requireActor();
  const leadId = String(formData.get("lead_id") || "");
  const body = String(formData.get("body") || "").trim();
  if (!/^[0-9a-f-]{36}$/.test(leadId) || !body || body.length > 2000) throw new Error("Invalid note");
  const { error } = await db().from("lead_notes").insert({ lead_id: leadId, author_id: current.id, body });
  if (error) throw error;
  revalidatePath(`/admin/leads/${leadId}`);
  redirect(`/admin/leads/${leadId}?saved=1`);
}

export async function moveLeadStage(id: string, stage: string, lostReason?: string) {
  const current = await requireActor();
  if (!uuid.test(id) || !stages.includes(stage as typeof stages[number])) throw new Error("Invalid lead or stage");
  const client = db();
  const { data: lead, error: readError } = await client.from("leads").select("stage,tour_at,lost_reason,won_plan,won_value,first_contacted_at,tour_completed_at").eq("id", id).maybeSingle();
  if (readError || !lead) throw new Error("This lead could not be found. Refresh the board.");
  if (lead.stage === stage) return;
  const reason = stage === "lost" && lostReason && (lostReasons as readonly string[]).includes(lostReason) ? lostReason : null;
  const missing = stageRequirement(stage, { tour_at: lead.tour_at, lost_reason: reason, won_plan: lead.won_plan, won_value: lead.won_value });
  if (missing) throw new Error(`${missing.message} Open the lead to fill it in.`);
  const now = new Date().toISOString();
  const { data: updated, error } = await client.from("leads").update({ stage, lost_reason: reason, updated_at: now,
    first_contacted_at: lead.first_contacted_at || (stage !== "new" ? now : null),
    tour_completed_at: lead.tour_completed_at || (stage === "tour_completed" ? now : null) })
    .eq("id", id).eq("stage", lead.stage).select("id").maybeSingle();
  if (error || !updated) throw new Error("The lead changed while you were moving it. Refresh the board.");
  await logActivity(client, id, current.id, "stage", `Stage: ${label(lead.stage)} → ${label(stage)}${reason ? ` (${reason})` : ""}`);
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
}

const fail = (id: string, message: string): never => redirect(`/admin/leads/${id}?error=details&detail=${encodeURIComponent(message.slice(0, 120))}`);

export async function updateLeadDetails(formData: FormData) {
  const current = await requireActor();
  const id = String(formData.get("id") || "");
  if (!uuid.test(id)) throw new Error("Invalid lead");
  // Same validation as the CSV import and manual entry.
  const columns = leadCsvColumns.filter(column => ["name", "email", "phone", "company", "interest", "team_size", "message", "channel", "move_in", "budget"].includes(column));
  let lead: ReturnType<typeof readCsvLead>;
  try { lead = readCsvLead([...columns], columns.map(column => String(formData.get(column) || ""))); }
  catch (error) { return fail(id, error instanceof Error ? error.message : "Check the details and try again."); }
  const identity = lead.email ? `email:${lead.email}` : `phone:${lead.phone.replace(/\D/g, "")}`;
  if (identity.startsWith("phone:") && identity.length < 13) return fail(id, "Enter a valid phone number");

  const client = db();
  for (const [field, value] of [["email", lead.email], ["phone", lead.phone]] as const) {
    if (!value) continue;
    const { data, error } = await client.from("leads").select("id").eq(field, value).neq("id", id).limit(1);
    if (error) throw new Error("Could not save this lead. Refresh and try again.");
    if (data?.length) return fail(id, `Another lead already uses this ${field}`);
  }
  const { data: before, error: readError } = await client.from("leads").select("dedupe_key,is_test").eq("id", id).maybeSingle();
  if (readError || !before) throw new Error("This lead could not be found. Refresh and try again.");
  const isTest = formData.get("is_test") === "on";
  const patch: Record<string, unknown> = { name: lead.name, email: lead.email, phone: lead.phone, company: lead.company, interest: lead.interest,
    team_size: lead.team_size, message: lead.message, channel: lead.channel, move_in: lead.move_in, budget: lead.budget, is_test: isTest, updated_at: new Date().toISOString() };
  // Keep the duplicate guard for offline leads in step with the contact details.
  if (typeof before.dedupe_key === "string" && before.dedupe_key.startsWith("offline:"))
    patch.dedupe_key = `offline:${createHash("sha256").update(identity).digest("hex")}`;
  const { data: saved, error } = await client.from("leads").update(patch).eq("id", id).select("id").maybeSingle();
  if (error || !saved) return fail(id, "Could not save this lead. Try again");
  await logActivity(client, id, current.id, "details", before.is_test !== isTest ? (isTest ? "Marked as a test lead" : "Unmarked as a test lead") : "Contact details updated");
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  redirect(`/admin/leads/${id}?saved=1`);
}

// Folds a duplicate into this lead: fills gaps, moves notes and history over, then removes the duplicate.
export async function mergeLead(formData: FormData) {
  const current = await requireActor();
  const id = String(formData.get("id") || ""), duplicateId = String(formData.get("duplicate_id") || "");
  if (!uuid.test(id) || !uuid.test(duplicateId) || id === duplicateId) throw new Error("Invalid lead");
  const client = db();
  const [{ data: keep }, { data: dupe }] = await Promise.all([
    client.from("leads").select("*").eq("id", id).maybeSingle(), client.from("leads").select("*").eq("id", duplicateId).maybeSingle()]);
  if (!keep || !dupe) throw new Error("One of these leads no longer exists. Refresh and try again.");
  const fill: Record<string, unknown> = {};
  for (const field of ["phone", "email", "company", "interest", "team_size", "message", "move_in", "budget", "assigned_to", "follow_up_at", "follow_up_1_outcome", "follow_up_1_note",
    "follow_up_2_at", "follow_up_2_outcome", "follow_up_2_note", "tour_at", "tour_completed_at"])
    if (!keep[field] && dupe[field]) fill[field] = dupe[field];
  if (dupe.first_contacted_at && (!keep.first_contacted_at || dupe.first_contacted_at < keep.first_contacted_at)) fill.first_contacted_at = dupe.first_contacted_at;
  const earliest = dupe.created_at < keep.created_at ? dupe.created_at : null;
  if (earliest) fill.created_at = earliest;
  await client.from("lead_notes").update({ lead_id: id }).eq("lead_id", duplicateId);
  await client.from("lead_activity").update({ lead_id: id }).eq("lead_id", duplicateId);
  const { error: deleteError } = await client.from("leads").delete().eq("id", duplicateId);
  if (deleteError) throw new Error("Could not merge these leads. Try again.");
  if (Object.keys(fill).length) await client.from("leads").update({ ...fill, updated_at: new Date().toISOString() }).eq("id", id);
  await logActivity(client, id, current.id, "merged", `Merged duplicate lead "${dupe.name}" (${dupe.email || dupe.phone || "no contact"})`);
  revalidatePath("/admin/leads");
  redirect(`/admin/leads/${id}?saved=1&merged=1`);
}

export async function deleteLead(formData: FormData) {
  const current = await requireActor();
  if (current.role !== "owner") throw new Error("Only the owner can delete leads.");
  const id = String(formData.get("id") || "");
  if (!uuid.test(id)) throw new Error("Invalid lead");
  const { error } = await db().from("leads").delete().eq("id", id);
  if (error) throw new Error("Could not delete this lead. Try again.");
  revalidatePath("/admin/leads");
  redirect("/admin/leads?deleted=1");
}
