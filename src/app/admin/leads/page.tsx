import Link from "next/link";
import { db } from "@/lib/supabase";
import { stages } from "@/lib/content";
import { requirePageActor } from "@/lib/admin-page";
import { phoneSearchPattern } from "@/lib/lead-search";
import { istDate, istDateTime } from "@/lib/format";
import LeadImport from "@/components/admin/LeadImport";
import LeadManualForm from "@/components/admin/LeadManualForm";
import LeadPipeline from "@/components/admin/LeadPipeline";

type Props = { searchParams: Promise<{ q?: string; stage?: string; page?: string; view?: string; deleted?: string }> };
const stageName = (stage: string) => stage.replaceAll("_", " ");
type FollowUpFields = { follow_up_at: string | null; follow_up_1_outcome: string | null; follow_up_1_note: string | null; follow_up_2_at: string | null; follow_up_2_outcome: string | null; follow_up_2_note: string | null; tour_at: string | null };
// The first follow-up that is scheduled but has no outcome yet, otherwise the tour.
function nextAction(lead: FollowUpFields) {
  if (lead.follow_up_at && !lead.follow_up_1_outcome) return `Follow-up 1 · ${istDateTime(lead.follow_up_at)}`;
  if (lead.follow_up_2_at && !lead.follow_up_2_outcome) return `Follow-up 2 · ${istDateTime(lead.follow_up_2_at)}`;
  return lead.tour_at ? `Tour ${istDateTime(lead.tour_at)}` : "—";
}
function FollowUp({ at, outcome, note }: { at: string | null; outcome: string | null; note: string | null }) {
  if (!at && !outcome && !note) return <>—</>;
  return <>{at ? istDate(at) : ""}{outcome && <><br /><small><strong>{outcome}</strong></small></>}{note && <><br /><small>{note}</small></>}</>;
}

export default async function LeadsPage({ searchParams }: Props) {
  await requirePageActor();
  const { q = "", stage = "", page = "1", view = "list", deleted } = await searchParams;
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
    <div className="admin-row"><a className="admin-button" href="#add-lead">Add lead</a><a className="admin-button admin-button-outline" href="#import-leads">Import CSV</a><a className="admin-button admin-button-outline" href="/api/admin/leads/export">Export all leads</a></div></div>
    {deleted && <p className="admin-success" role="status">Lead deleted.</p>}
    <nav className="admin-view-switch" aria-label="Lead views"><Link href="/admin/leads" className={!pipeline ? "is-active" : ""}>All leads</Link><Link href="/admin/leads?view=pipeline" className={pipeline ? "is-active" : ""}>Pipeline</Link></nav>
    {pipeline ? <LeadPipeline key={pipelineData?.map(column => `${column.stage}:${column.count}:${column.leads.map(lead => lead.id).join(",")}`).join("|")} initialColumns={pipelineData || []} /> : <>
      <form className="admin-row admin-filter-bar" method="get"><input name="q" defaultValue={q} placeholder="Search name, email, phone" aria-label="Search leads" />
        <select name="stage" defaultValue={stage} aria-label="Filter stage"><option value="">All stages</option>{stages.map(s => <option key={s} value={s}>{stageName(s)}</option>)}</select>
        <button className="admin-button">Filter</button></form>
      <div className="admin-card admin-table-scroll" style={{ padding: 0 }} role="region" aria-label="Leads table" tabIndex={0}><table className="admin-table"><thead><tr><th>Name</th><th>Interest</th><th>Stage</th><th>Source</th><th>Received</th><th>Follow-up 1</th><th>Follow-up 2</th><th>Next action</th></tr></thead><tbody>
        {leads.map(lead => <tr key={lead.id}><td><Link className="admin-link" href={`/admin/leads/${lead.id}`}>{lead.name}</Link><br /><small>{lead.email || lead.phone || "—"}</small></td>
          <td>{lead.interest || "—"}</td><td><span className={`admin-status admin-status--${lead.stage}`}>{stageName(lead.stage)}</span></td>
          <td>{lead.source === "offline" ? "Offline" : "Website"}</td><td>{istDate(lead.created_at)}</td>
          <td><FollowUp at={lead.follow_up_at} outcome={lead.follow_up_1_outcome} note={lead.follow_up_1_note} /></td><td><FollowUp at={lead.follow_up_2_at} outcome={lead.follow_up_2_outcome} note={lead.follow_up_2_note} /></td>
          <td>{nextAction(lead)}</td></tr>)}
      </tbody></table>{!leads.length && <p style={{ padding: "1rem" }}>No matching leads.</p>}</div>
      <div className="admin-row" style={{ marginTop: "1rem" }}><span>{count} matching leads</span>
        {currentPage > 1 && <Link className="admin-link" href={pageUrl(currentPage - 1)}>Previous</Link>}
        {currentPage * 50 < count && <Link className="admin-link" href={pageUrl(currentPage + 1)}>Next</Link>}</div>
    </>}
    <div className="admin-lead-tools"><LeadManualForm /><LeadImport /></div>
  </>;
}

async function loadLeads(client: ReturnType<typeof db>, needle: string, stage: string, currentPage: number) {
  const base = "id,name,email,phone,interest,stage,source,created_at,follow_up_at,tour_at";
  const withFollowUps = `${base},follow_up_1_outcome,follow_up_1_note,follow_up_2_at,follow_up_2_outcome,follow_up_2_note`;
  const run = async (columns: string) => {
    let query = client.from("leads").select(columns, { count: "exact" }).order("created_at", { ascending: false });
    if (stages.includes(stage as typeof stages[number])) query = query.eq("stage", stage);
    if (needle) {
      const filters = ["name", "email", "phone", "interest"].map(field => `${field}.ilike.%${needle}%`);
      const phone = phoneSearchPattern(needle);
      if (phone) filters.push(`phone.ilike.${phone}`);
      query = query.or(filters.join(","));
    }
    return query.range((currentPage - 1) * 50, currentPage * 50 - 1);
  };
  let result = await run(withFollowUps);
  // 42703 = column missing: the follow-up migration has not been run yet, so keep the page working without those columns.
  if (result.error?.code === "42703") result = await run(base);
  if (result.error) throw result.error;
  const leads = ((result.data || []) as unknown as Partial<FollowUpFields & { id: string; name: string; email: string; phone: string | null; interest: string | null; stage: string; source: string; created_at: string }>[])
    .map(lead => ({ follow_up_1_outcome: null, follow_up_1_note: null, follow_up_2_at: null, follow_up_2_outcome: null, follow_up_2_note: null, ...lead })) as (FollowUpFields & { id: string; name: string; email: string; phone: string | null; interest: string | null; stage: string; source: string; created_at: string })[];
  return { leads, count: result.count || 0 };
}
