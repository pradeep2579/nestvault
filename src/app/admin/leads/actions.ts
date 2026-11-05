"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, requireActor } from "@/lib/supabase";
import { stages } from "@/lib/content";

export async function updateLead(formData: FormData) {
  await requireActor();
  const id = String(formData.get("id") || "");
  const stage = String(formData.get("stage") || "");
  if (!/^[0-9a-f-]{36}$/.test(id) || !stages.includes(stage as typeof stages[number])) throw new Error("Invalid lead");
  const date = (key: string) => { const raw = String(formData.get(key) || ""); return raw ? new Date(`${raw}+05:30`).toISOString() : null; };
  const assigned = String(formData.get("assigned_to") || "");
  const { error } = await db().from("leads").update({ stage, follow_up_at: date("follow_up_at"), tour_at: date("tour_at"),
    assigned_to: assigned || null, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
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
