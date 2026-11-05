import { actor, db } from "@/lib/supabase";
import { toCsv } from "@/lib/leads-csv";

const columns = ["id", "name", "email", "phone", "company", "interest", "team_size", "message", "stage", "assigned_to", "follow_up_at", "tour_at", "source", "created_at", "updated_at"];

export async function GET() {
  if (!await actor()) return new Response("Sign in to export leads.", { status: 401 });
  const client = db();
  const rows: Record<string, unknown>[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client.from("leads").select("id,name,email,phone,company,interest,team_size,message,stage,assigned_to,follow_up_at,tour_at,source,created_at,updated_at").order("created_at", { ascending: false }).order("id", { ascending: true }).range(offset, offset + 499);
    if (error) return new Response("Export failed. Please try again.", { status: 503 });
    rows.push(...(data || []));
    if (!data || data.length < 500) break;
  }
  return new Response(`\uFEFF${toCsv(rows, columns)}`, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="nestvault-leads-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "private, no-store" },
  });
}
