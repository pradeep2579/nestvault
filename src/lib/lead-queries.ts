import { db } from "@/lib/supabase";
import { stages } from "@/lib/content";
import { phoneSearchPattern } from "@/lib/lead-search";
import { endOfTodayIST } from "@/lib/crm";

export const filterNames = ["due", "untouched", "unassigned", "test"] as const;
export type FilterName = typeof filterNames[number];

export const listColumns = "id,name,email,phone,interest,stage,source,channel,assigned_to,created_at,follow_up_at,follow_up_1_outcome,follow_up_1_note,follow_up_2_at,follow_up_2_outcome,follow_up_2_note,tour_at,first_contacted_at,tour_completed_at,lost_reason,won_value";

export function leadsQuery(client: ReturnType<typeof db>, opts: { filter?: FilterName | ""; stage?: string; needle?: string; head?: boolean; columns?: string }) {
  let query = client.from("leads").select(opts.columns || listColumns, { count: "exact", head: !!opts.head });
  query = query.eq("is_test", opts.filter === "test");
  const now = new Date();
  if (opts.filter === "due") {
    const end = endOfTodayIST(now).toISOString();
    query = query.not("stage", "in", "(won,lost)").or(`and(follow_up_at.lte.${end},follow_up_1_outcome.is.null),and(follow_up_2_at.lte.${end},follow_up_2_outcome.is.null)`);
  }
  if (opts.filter === "untouched") query = query.eq("stage", "new").lt("created_at", new Date(now.getTime() - 24 * 3600_000).toISOString());
  if (opts.filter === "unassigned") query = query.not("stage", "in", "(won,lost)").is("assigned_to", null);
  if (opts.stage && stages.includes(opts.stage as typeof stages[number])) query = query.eq("stage", opts.stage);
  if (opts.needle) {
    const filters = ["name", "email", "phone", "interest"].map(field => `${field}.ilike.%${opts.needle}%`);
    const phone = phoneSearchPattern(opts.needle);
    if (phone) filters.push(`phone.ilike.${phone}`);
    query = query.or(filters.join(","));
  }
  return query;
}
