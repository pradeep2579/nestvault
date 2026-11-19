"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, requireActor } from "@/lib/supabase";
import { createHash } from "node:crypto";
import { stages } from "@/lib/content";
import { leadCsvColumns, readCsvLead } from "@/lib/leads-csv";

export async function updateLead(formData: FormData) {
  await requireActor();
  const id = String(formData.get("id") || "");
  const stage = String(formData.get("stage") || "");
  if (!/^[0-9a-f-]{36}$/.test(id) || !stages.includes(stage as typeof stages[number])) throw new Error("Invalid lead");
  const date = (key: string) => {
    const raw = String(formData.get(key) || "");
    if (!raw) return null;
    const timestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw) ? Date.parse(`${raw}+05:30`) : NaN;
    if (!Number.isFinite(timestamp)) redirect(`/admin/leads/${id}?error=date`);
    return new Date(timestamp).toISOString();
  };
  const assigned = String(formData.get("assigned_to") || "");
  const { data: saved, error } = await db().from("leads").update({ stage, follow_up_at: date("follow_up_at"), tour_at: date("tour_at"),
    assigned_to: assigned || null, updated_at: new Date().toISOString() }).eq("id", id).select("id").maybeSingle();
  if (error || !saved) throw new Error("Could not save this lead. Refresh and try again.");
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

export async function moveLeadStage(id: string, stage: string) {
  await requireActor();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    || !stages.includes(stage as typeof stages[number])) throw new Error("Invalid lead or stage");
  const client = db();
  const { data: lead, error: readError } = await client.from("leads").select("stage").eq("id", id).maybeSingle();
  if (readError || !lead) throw new Error("This lead could not be found. Refresh the board.");
  if (lead.stage === stage) return;
  const { data: updated, error } = await client.from("leads").update({ stage, updated_at: new Date().toISOString() })
    .eq("id", id).eq("stage", lead.stage).select("id").maybeSingle();
  if (error || !updated) throw new Error("The lead changed while you were moving it. Refresh the board.");
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fail = (id: string, message: string): never => redirect(`/admin/leads/${id}?error=details&detail=${encodeURIComponent(message.slice(0, 120))}`);

export async function updateLeadDetails(formData: FormData) {
  await requireActor();
  const id = String(formData.get("id") || "");
  if (!uuid.test(id)) throw new Error("Invalid lead");
  // Same validation as the CSV import and manual entry.
  const columns = leadCsvColumns.filter(column => ["name", "email", "phone", "company", "interest", "team_size", "message"].includes(column));
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
  const { data: current, error: readError } = await client.from("leads").select("dedupe_key").eq("id", id).maybeSingle();
  if (readError || !current) throw new Error("This lead could not be found. Refresh and try again.");
  const patch: Record<string, unknown> = { name: lead.name, email: lead.email, phone: lead.phone, company: lead.company, interest: lead.interest,
    team_size: lead.team_size, message: lead.message, updated_at: new Date().toISOString() };
  // Keep the duplicate guard for offline leads in step with the contact details.
  if (typeof current.dedupe_key === "string" && current.dedupe_key.startsWith("offline:"))
    patch.dedupe_key = `offline:${createHash("sha256").update(identity).digest("hex")}`;
  const { data: saved, error } = await client.from("leads").update(patch).eq("id", id).select("id").maybeSingle();
  if (error || !saved) return fail(id, "Could not save this lead. Try again");
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  redirect(`/admin/leads/${id}?saved=1`);
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
