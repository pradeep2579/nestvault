import type { SupabaseClient } from "@supabase/supabase-js";

export type ActivityKind = "created" | "stage" | "follow_up" | "tour" | "assigned" | "deal" | "reenquiry" | "merged" | "alert" | "details";

// The timeline is a nice-to-have: a failure here must never stop the real action from saving.
export async function logActivity(client: SupabaseClient, leadId: string, actorId: string | null, kind: ActivityKind, detail: string) {
  try { await client.from("lead_activity").insert({ lead_id: leadId, actor_id: actorId, kind, detail: detail.slice(0, 500) }); }
  catch { /* ignore */ }
}
