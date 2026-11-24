import Link from "next/link";
import { db } from "@/lib/supabase";
import { stages } from "@/lib/content";
import { requirePageActor } from "@/lib/admin-page";
import { istDate, istDateTime } from "@/lib/format";
import { attentionLabels, summarize, type InsightLead } from "@/lib/crm";
import { filterNames, leadsQuery, listColumns, type FilterName } from "@/lib/lead-queries";
import LeadImport from "@/components/admin/LeadImport";
import LeadManualForm from "@/components/admin/LeadManualForm";
import LeadPipeline from "@/components/admin/LeadPipeline";
import LeadInsights from "@/components/admin/LeadInsights";

type Props = { searchParams: Promise<{ q?: string; stage?: string; page?: string; view?: string; filter?: string; deleted?: string }> };
const stageName = (stage: string) => stage.replaceAll("_", " ");
const filterLabels: Record<FilterName, string> = { due: "Due & overdue", untouched: "Untouched 24h+", unassigned: "Unassigned", test: "Test leads" };

type Row = InsightLead & { id: string; name: string; email: string; phone: string | null; interest: string | null; source: string; created_at: string; tour_at: string | null;
  follow_up_1_note: string | null; follow_up_2_note: string | null };

// The first follow-up that is scheduled but has no outcome yet, otherwise the tour.
function nextAction(lead: Row) {
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
  const { q = "", stage = "", page = "1", view = "list", filter: rawFilter = "", deleted } = await searchParams;
  const pipeline = view === "pipeline", insights = view === "insights";
  const filter = (filterNames as readonly string[]).includes(rawFilter) ? rawFilter as FilterName : "";
  const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);
  const client = db();
  const needle = q.trim().replace(/[^\p{L}\p{N}@.+\- ]/gu, "").slice(0, 80);
  const now = new Date();
  const { data: staff, error: staffError } = await client.from("profiles").select("id,email").order("email");
  if (staffError) throw staffError;
  const who = (id: string | null) => id ? (staff?.find(person => person.id === id)?.email.split("@")[0] || "Team member") : "Unassigned";

  const pipelineData = pipeline ? await Promise.all(stages.map(async currentStage => {
    const { data, count, error } = await client.from("leads").select("id,name,email,phone,interest,created_at,follow_up_at,tour_at,tour_completed_at,won_plan,won_value", { count: "exact" })
      .eq("is_test", false).eq("stage", currentStage).order("created_at", { ascending: false }).range(0, 99);
    if (error) throw error;
    return { stage: currentStage, count: count || 0, leads: data || [] };
  })) : null;

  let summary: ReturnType<typeof summarize> | null = null;
  if (insights) {
    const { data, error } = await leadsQuery(client, { columns: listColumns }).limit(5000);
    if (error) throw error;
    summary = summarize((data || []) as unknown as InsightLead[], now, who);
  }

  let leads: Row[] = [], count = 0, counts: Record<FilterName, number> | null = null;
  if (!pipeline && !insights) {
    const [list, ...chips] = await Promise.all([
      leadsQuery(client, { filter, stage, needle }).order("created_at", { ascending: false }).range((currentPage - 1) * 50, currentPage * 50 - 1),
      ...filterNames.map(name => leadsQuery(client, { filter: name, head: true })),
    ]);
    if (list.error) throw list.error;
    leads = (list.data || []) as unknown as Row[]; count = list.count || 0;
    counts = Object.fromEntries(filterNames.map((name, index) => [name, chips[index].count || 0])) as Record<FilterName, number>;
  }
  const pageUrl = (n: number) => `/admin/leads?${new URLSearchParams({ q, stage, filter, page: String(n) })}`;

  return <><div className="admin-section-header admin-row"><div className="admin-page-heading"><p className="admin-eyebrow">RELATIONSHIPS</p><h1>Leads & tours</h1><p>Every enquiry, follow-up, and visit in one clear pipeline.</p></div>
    <div className="admin-row"><a className="admin-button" href="#add-lead">Add lead</a><a className="admin-button admin-button-outline" href="#import-leads">Import CSV</a><a className="admin-button admin-button-outline" href="/api/admin/leads/export">Export all leads</a></div></div>
    {deleted && <p className="admin-success" role="status">Lead deleted.</p>}
    <nav className="admin-view-switch" aria-label="Lead views"><Link href="/admin/leads" className={!pipeline && !insights ? "is-active" : ""}>All leads</Link><Link href="/admin/leads?view=pipeline" className={pipeline ? "is-active" : ""}>Pipeline</Link><Link href="/admin/leads?view=insights" className={insights ? "is-active" : ""}>Insights</Link></nav>
    {insights && summary ? <LeadInsights s={summary} /> : pipeline ? <LeadPipeline key={pipelineData?.map(column => `${column.stage}:${column.count}:${column.leads.map(lead => lead.id).join(",")}`).join("|")} initialColumns={pipelineData || []} /> : <>
      {counts && <div className="crm-chips" aria-label="Quick filters"><Link href="/admin/leads" className={!filter ? "is-active" : ""}>All</Link>
        {filterNames.map(name => <Link key={name} href={`/admin/leads?filter=${name}`} className={`${filter === name ? "is-active" : ""}${name !== "test" && counts[name] ? " has-items" : ""}`}>{filterLabels[name]} <b>{counts[name]}</b></Link>)}</div>}
      <form className="admin-row admin-filter-bar" method="get">{filter && <input type="hidden" name="filter" value={filter} />}<input name="q" defaultValue={q} placeholder="Search name, email, phone" aria-label="Search leads" />
        <select name="stage" defaultValue={stage} aria-label="Filter stage"><option value="">All stages</option>{stages.map(s => <option key={s} value={s}>{stageName(s)}</option>)}</select>
        <button className="admin-button">Filter</button></form>
      <div className="admin-card admin-table-scroll" style={{ padding: 0 }} role="region" aria-label="Leads table" tabIndex={0}><table className="admin-table"><thead><tr><th>Name</th><th>Interest</th><th>Stage</th><th>Source</th><th>Received</th><th>Follow-up 1</th><th>Follow-up 2</th><th>Next action</th></tr></thead><tbody>
        {leads.map(lead => { const flags = attentionLabels(lead, now); return <tr key={lead.id} className={flags.includes("Overdue") ? "crm-row-overdue" : ""}><td><Link className="admin-link" href={`/admin/leads/${lead.id}`}>{lead.name}</Link><br /><small>{lead.email || lead.phone || "—"}</small><br /><small className="crm-owner">{who(lead.assigned_to)}</small>
          {flags.length > 0 && <div className="crm-flags">{flags.map(flag => <span key={flag} className={`crm-flag crm-flag--${flag === "Overdue" ? "red" : "amber"}`}>{flag}</span>)}</div>}</td>
          <td>{lead.interest || "—"}</td><td><span className={`admin-status admin-status--${lead.stage}`}>{stageName(lead.stage)}</span></td>
          <td>{lead.channel || (lead.source === "offline" ? "Offline" : "Website")}</td><td>{istDate(lead.created_at)}</td>
          <td><FollowUp at={lead.follow_up_at} outcome={lead.follow_up_1_outcome} note={lead.follow_up_1_note} /></td><td><FollowUp at={lead.follow_up_2_at} outcome={lead.follow_up_2_outcome} note={lead.follow_up_2_note} /></td>
          <td>{nextAction(lead)}</td></tr>; })}
      </tbody></table>{!leads.length && <p style={{ padding: "1rem" }}>{filter ? "Nothing here. You're all caught up." : "No matching leads."}</p>}</div>
      <div className="admin-row" style={{ marginTop: "1rem" }}><span>{count} matching leads</span>
        {currentPage > 1 && <Link className="admin-link" href={pageUrl(currentPage - 1)}>Previous</Link>}
        {currentPage * 50 < count && <Link className="admin-link" href={pageUrl(currentPage + 1)}>Next</Link>}</div>
    </>}
    <div className="admin-lead-tools"><LeadManualForm /><LeadImport /></div>
  </>;
}
