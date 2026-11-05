import Link from "next/link";
import { db } from "@/lib/supabase";
import { stages } from "@/lib/content";
import { requirePageActor } from "@/lib/admin-page";
import LeadImport from "@/components/admin/LeadImport";
import LeadPipeline from "@/components/admin/LeadPipeline";

type Props = { searchParams: Promise<{ q?: string; stage?: string; page?: string; view?: string }> };
const stageName = (stage: string) => stage.replaceAll("_", " ");

export default async function LeadsPage({ searchParams }: Props) {
  await requirePageActor();
  const { q = "", stage = "", page = "1", view = "list" } = await searchParams;
  const pipeline = view === "pipeline";
  const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);
  const client = db();
  const needle = q.trim().replace(/[^\p{L}\p{N}@.+\- ]/gu, "").slice(0, 80);

  const pipelineData = pipeline ? await Promise.all(stages.map(async currentStage => {
    const { data, count, error } = await client.from("leads").select("id,name,email,phone,interest,created_at,follow_up_at,tour_at", { count: "exact" })
      .eq("stage", currentStage).order("created_at", { ascending: false }).range(0, 99);
    if (error) throw error;
    return { stage: currentStage, count: count || 0, leads: data || [] };
  })) : null;

  let leads: Awaited<ReturnType<typeof loadLeads>>["leads"] = [];
  let count = 0;
  if (!pipeline) ({ leads, count } = await loadLeads(client, needle, stage, currentPage));
  const pageUrl = (n: number) => `/admin/leads?${new URLSearchParams({ q, stage, page: String(n) })}`;

  return <><div className="admin-section-header admin-row"><div className="admin-page-heading"><p className="admin-eyebrow">RELATIONSHIPS</p><h1>Leads & tours</h1><p>Every enquiry, follow-up, and visit in one clear pipeline.</p></div>
    <div className="admin-row"><a className="admin-button" href="#import-leads">Import CSV</a><a className="admin-button admin-button-outline" href="/api/admin/leads/export">Export all leads</a></div></div>
    <nav className="admin-view-switch" aria-label="Lead views"><Link href="/admin/leads" className={!pipeline ? "is-active" : ""}>All leads</Link><Link href="/admin/leads?view=pipeline" className={pipeline ? "is-active" : ""}>Pipeline</Link></nav>
    {pipeline ? <LeadPipeline key={pipelineData?.map(column => `${column.stage}:${column.count}:${column.leads.map(lead => lead.id).join(",")}`).join("|")} initialColumns={pipelineData || []} /> : <>
      <form className="admin-row admin-filter-bar" method="get"><input name="q" defaultValue={q} placeholder="Search name, email, phone" aria-label="Search leads" />
        <select name="stage" defaultValue={stage} aria-label="Filter stage"><option value="">All stages</option>{stages.map(s => <option key={s} value={s}>{stageName(s)}</option>)}</select>
        <button className="admin-button">Filter</button></form>
      <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}><table className="admin-table"><thead><tr><th>Name</th><th>Interest</th><th>Stage</th><th>Source</th><th>Received</th><th>Next action</th></tr></thead><tbody>
        {leads.map(lead => <tr key={lead.id}><td><Link className="admin-link" href={`/admin/leads/${lead.id}`}>{lead.name}</Link><br /><small>{lead.email || lead.phone || "—"}</small></td>
          <td>{lead.interest || "—"}</td><td><span className={`admin-status admin-status--${lead.stage}`}>{stageName(lead.stage)}</span></td>
          <td>{lead.source === "offline" ? "Offline" : "Website"}</td><td>{new Date(lead.created_at).toLocaleDateString("en-IN")}</td>
          <td>{lead.follow_up_at ? `Follow up ${new Date(lead.follow_up_at).toLocaleString("en-IN")}` : lead.tour_at ? `Tour ${new Date(lead.tour_at).toLocaleString("en-IN")}` : "—"}</td></tr>)}
      </tbody></table>{!leads.length && <p style={{ padding: "1rem" }}>No matching leads.</p>}</div>
      <div className="admin-row" style={{ marginTop: "1rem" }}><span>{count} matching leads</span>
        {currentPage > 1 && <Link className="admin-link" href={pageUrl(currentPage - 1)}>Previous</Link>}
        {currentPage * 50 < count && <Link className="admin-link" href={pageUrl(currentPage + 1)}>Next</Link>}</div>
    </>}
    <LeadImport />
  </>;
}

async function loadLeads(client: ReturnType<typeof db>, needle: string, stage: string, currentPage: number) {
  let query = client.from("leads").select("id,name,email,phone,interest,stage,source,created_at,follow_up_at,tour_at", { count: "exact" })
    .order("created_at", { ascending: false });
  if (stages.includes(stage as typeof stages[number])) query = query.eq("stage", stage);
  if (needle) query = query.or(["name", "email", "phone", "interest"].map(field => `${field}.ilike.%${needle}%`).join(","));
  const { data, error, count } = await query.range((currentPage - 1) * 50, currentPage * 50 - 1);
  if (error) throw error;
  return { leads: data || [], count: count || 0 };
}
