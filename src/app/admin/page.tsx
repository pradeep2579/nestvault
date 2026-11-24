import Link from "next/link";
import { db } from "@/lib/supabase";
import { requirePageActor } from "@/lib/admin-page";
import { leadsQuery } from "@/lib/lead-queries";
import { istDate, istDateTime } from "@/lib/format";

export default async function Dashboard() {
  const current = await requirePageActor();
  const client = db();
  const now = new Date();
  const draftsQuery = client.from("posts").select("id", { count: "exact", head: true }).eq("status", "draft");
  const scheduledQuery = client.from("posts").select("id", { count: "exact", head: true }).eq("status", "scheduled").gt("published_at", now.toISOString());
  const [{ count: leads }, { count: open }, { count: posts }, { count: due }, { count: untouched }, { count: unassigned },
    { data: tours }, { data: dueList }, { data: newest }, { data: activity }, { count: drafts }, { count: scheduled }] = await Promise.all([
    client.from("leads").select("id", { count: "exact", head: true }).eq("is_test", false),
    client.from("leads").select("id", { count: "exact", head: true }).eq("is_test", false).in("stage", ["new", "contacted", "tour_scheduled"]),
    client.from("posts").select("id", { count: "exact", head: true }).in("status", ["published", "scheduled"]).lte("published_at", new Date().toISOString()),
    leadsQuery(client, { filter: "due", head: true, columns: "id" }),
    leadsQuery(client, { filter: "untouched", head: true, columns: "id" }),
    leadsQuery(client, { filter: "unassigned", head: true, columns: "id" }),
    client.from("leads").select("id,name,phone,interest,tour_at").eq("is_test", false).eq("stage", "tour_scheduled").gte("tour_at", now.toISOString())
      .lte("tour_at", new Date(now.getTime() + 7 * 86400_000).toISOString()).order("tour_at").limit(6),
    leadsQuery(client, { filter: "due", columns: "id,name,phone,follow_up_at,follow_up_1_outcome,follow_up_2_at,follow_up_2_outcome" }).order("follow_up_at", { ascending: true }).limit(6),
    client.from("leads").select("id,name,interest,channel,stage,created_at").eq("is_test", false).order("created_at", { ascending: false }).limit(5),
    client.from("lead_activity").select("lead_id,detail,created_at,leads(name)").order("created_at", { ascending: false }).limit(8),
    current.role === "owner" ? draftsQuery : draftsQuery.eq("author_id", current.id),
    current.role === "owner" ? scheduledQuery : scheduledQuery.eq("author_id", current.id),
  ]);
  const nextFollowUp = (lead: { follow_up_at: string | null; follow_up_1_outcome: string | null; follow_up_2_at: string | null; follow_up_2_outcome: string | null }) => {
    const pending = [[lead.follow_up_at, lead.follow_up_1_outcome, 1], [lead.follow_up_2_at, lead.follow_up_2_outcome, 2]].filter(item => item[0] && !item[1]) as [string, null, number][];
    pending.sort((a, b) => a[0].localeCompare(b[0]));
    return pending[0] ? `Follow-up ${pending[0][2]} · ${istDateTime(pending[0][0])}` : "—";
  };
  const attention = [{ href: "/admin/leads?filter=due", n: due ?? 0, title: "Follow-ups due or overdue", hint: "Call or message these leads today" },
    { href: "/admin/leads?filter=untouched", n: untouched ?? 0, title: "New leads not contacted", hint: "Waiting more than 24 hours" },
    { href: "/admin/leads?filter=unassigned", n: unassigned ?? 0, title: "Leads with no owner", hint: "Assign someone to each one" }];
  return <>
    <div className="admin-page-heading"><p className="admin-eyebrow">YOUR WORKSPACE AT A GLANCE</p><h1>Good work starts here.</h1><p>Stay on top of enquiries, tours, and the stories that bring people to Nest Vault.</p></div>
    <div className="admin-grid admin-stat-grid">
      <Link href="/admin/leads" className="admin-card admin-stat"><span className="admin-stat-top">01 <span aria-hidden="true">↗</span></span><strong>{leads ?? 0}</strong><span>Total enquiries</span><small>Every conversation in one place</small></Link>
      <Link href="/admin/leads" className="admin-card admin-stat"><span className="admin-stat-top">02 <span aria-hidden="true">↗</span></span><strong>{open ?? 0}</strong><span>Open leads</span><small>Ready for your next follow-up</small></Link>
      <Link href="/admin/blog" className="admin-card admin-stat"><span className="admin-stat-top">03 <span aria-hidden="true">↗</span></span><strong>{posts ?? 0}</strong><span>Published articles</span><small>Ideas live on your website</small></Link>
    </div>
    <section className="admin-card" style={{ marginBottom: "1.5rem" }}><p className="admin-eyebrow">NEEDS ATTENTION</p>
      <div className="crm-cards" style={{ marginTop: 12 }}>{attention.map(item => <Link key={item.href} href={item.href} className={`admin-card crm-card${item.n ? " is-alert" : ""}`}>
        <span>{item.title}</span><strong>{item.n}</strong><small>{item.n ? item.hint : "All clear"}</small></Link>)}</div></section>
    <div className="crm-lists">
      <section className="admin-card"><h2>Tours this week</h2>
        {tours?.length ? <ul className="crm-feed">{tours.map(lead => <li key={lead.id}><span><Link className="admin-link" href={`/admin/leads/${lead.id}`}>{lead.name}</Link>{lead.interest ? ` · ${lead.interest}` : ""}</span><small>{istDateTime(lead.tour_at)}</small></li>)}</ul>
          : <p className="crm-muted" style={{ marginTop: 10 }}>No tours booked for the next 7 days.</p>}</section>
      <section className="admin-card"><h2>Follow up next</h2>
        {dueList?.length ? <ul className="crm-feed">{(dueList as unknown as { id: string; name: string; follow_up_at: string | null; follow_up_1_outcome: string | null; follow_up_2_at: string | null; follow_up_2_outcome: string | null }[]).map(lead => <li key={lead.id}><span><Link className="admin-link" href={`/admin/leads/${lead.id}`}>{lead.name}</Link></span><small>{nextFollowUp(lead)}</small></li>)}</ul>
          : <p className="crm-muted" style={{ marginTop: 10 }}>Nothing due. Everything is up to date.</p>}</section>
      <section className="admin-card"><h2>Newest enquiries</h2>
        {newest?.length ? <ul className="crm-feed">{newest.map(lead => <li key={lead.id}><span><Link className="admin-link" href={`/admin/leads/${lead.id}`}>{lead.name}</Link>{lead.interest ? ` · ${lead.interest}` : ""}<br /><small>{lead.channel || "Website"} · {lead.stage.replaceAll("_", " ")}</small></span><small>{istDate(lead.created_at)}</small></li>)}</ul>
          : <p className="crm-muted" style={{ marginTop: 10 }}>No enquiries yet.</p>}</section>
      <section className="admin-card"><h2>Recent activity</h2>
        {activity?.length ? <ul className="crm-feed">{activity.map((item, index) => { const lead = Array.isArray(item.leads) ? item.leads[0] : item.leads; return <li key={index}><span><Link className="admin-link" href={`/admin/leads/${item.lead_id}`}>{lead?.name || "Lead"}</Link><br /><small>{item.detail}</small></span><small>{istDateTime(item.created_at)}</small></li>; })}</ul>
          : <p className="crm-muted" style={{ marginTop: 10 }}>Stage changes and follow-ups will show up here.</p>}</section>
      <section className="admin-card"><h2>Content</h2>
        <ul className="crm-feed"><li><span>Published</span><strong>{posts ?? 0}</strong></li><li><span>Scheduled</span><strong>{scheduled ?? 0}</strong></li><li><span>Drafts waiting</span><strong>{drafts ?? 0}</strong></li></ul>
        <p style={{ marginTop: 12 }}><Link className="admin-link" href="/admin/blog?status=draft">Review drafts →</Link></p></section>
    </div>
    <section className="admin-card admin-quick-actions"><div><p className="admin-eyebrow">NEXT STEPS</p><h2>Keep the momentum going.</h2><p>Move a lead forward or share a new idea with your audience.</p></div><div className="admin-quick-links"><Link className="admin-button" href="/admin/leads">Manage leads <span aria-hidden="true">↗</span></Link><Link className="admin-button admin-button-outline" href="/admin/blog/new">Write an article <span aria-hidden="true">↗</span></Link></div></section>
  </>;
}
