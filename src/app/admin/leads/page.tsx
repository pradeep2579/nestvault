import Link from "next/link";
import { db } from "@/lib/supabase";
import { stages } from "@/lib/content";
import { requirePageActor } from "@/lib/admin-page";

type Props = { searchParams: Promise<{ q?: string; stage?: string; page?: string }> };
export default async function LeadsPage({ searchParams }: Props) {
  await requirePageActor();
  const { q = "", stage = "", page = "1" } = await searchParams;
  const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);
  let query = db().from("leads").select("id,name,email,phone,interest,stage,created_at,follow_up_at,tour_at", { count: "exact" })
    .order("created_at", { ascending: false });
  if (stages.includes(stage as typeof stages[number])) query = query.eq("stage", stage);
  const needle = q.trim().replace(/[^\p{L}\p{N}@.+\- ]/gu, "").slice(0, 80);
  if (needle) query = query.or(["name", "email", "phone", "interest"].map(field => `${field}.ilike.%${needle}%`).join(","));
  const { data, error, count } = await query.range((currentPage - 1) * 50, currentPage * 50 - 1);
  if (error) throw error;
  const leads = data || [];
  const pageUrl = (n: number) => `/admin/leads?${new URLSearchParams({ q, stage, page: String(n) })}`;
  return <><h1>Leads & tours</h1><form className="admin-row" method="get">
    <input name="q" defaultValue={q} placeholder="Search name, email, phone" aria-label="Search leads" />
    <select name="stage" defaultValue={stage} aria-label="Filter stage"><option value="">All stages</option>{stages.map(s => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select>
    <button className="admin-button">Filter</button></form>
    <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}><table className="admin-table"><thead><tr><th>Name</th><th>Interest</th><th>Stage</th><th>Received</th><th>Next action</th></tr></thead><tbody>
      {leads.map(lead => <tr key={lead.id}><td><Link className="admin-link" href={`/admin/leads/${lead.id}`}>{lead.name}</Link><br /><small>{lead.email}</small></td>
        <td>{lead.interest || "—"}</td><td>{lead.stage.replaceAll("_", " ")}</td><td>{new Date(lead.created_at).toLocaleDateString("en-IN")}</td>
        <td>{lead.follow_up_at ? `Follow up ${new Date(lead.follow_up_at).toLocaleString("en-IN")}` : lead.tour_at ? `Tour ${new Date(lead.tour_at).toLocaleString("en-IN")}` : "—"}</td></tr>)}
    </tbody></table>{!leads.length && <p style={{ padding: "1rem" }}>No matching leads.</p>}</div>
    <div className="admin-row" style={{ marginTop: "1rem" }}><span>{count ?? 0} matching leads</span>
      {currentPage > 1 && <Link className="admin-link" href={pageUrl(currentPage - 1)}>Previous</Link>}
      {currentPage * 50 < (count ?? 0) && <Link className="admin-link" href={pageUrl(currentPage + 1)}>Next</Link>}</div>
  </>;
}
