import Link from "next/link";
import { db } from "@/lib/supabase";
import { requirePageActor } from "@/lib/admin-page";

export default async function Dashboard() {
  await requirePageActor();
  const client = db();
  const [{ count: leads }, { count: open }, { count: posts }] = await Promise.all([
    client.from("leads").select("id", { count: "exact", head: true }),
    client.from("leads").select("id", { count: "exact", head: true }).in("stage", ["new", "contacted", "tour_scheduled"]),
    client.from("posts").select("id", { count: "exact", head: true }).in("status", ["published", "scheduled"]).lte("published_at", new Date().toISOString()),
  ]);
  return <>
    <div className="admin-page-heading"><p className="admin-eyebrow">YOUR WORKSPACE AT A GLANCE</p><h1>Good work starts here.</h1><p>Stay on top of enquiries, tours, and the stories that bring people to Nest Vault.</p></div>
    <div className="admin-grid admin-stat-grid">
      <Link href="/admin/leads" className="admin-card admin-stat"><span className="admin-stat-top">01 <span aria-hidden="true">↗</span></span><strong>{leads ?? 0}</strong><span>Total enquiries</span><small>Every conversation in one place</small></Link>
      <Link href="/admin/leads" className="admin-card admin-stat"><span className="admin-stat-top">02 <span aria-hidden="true">↗</span></span><strong>{open ?? 0}</strong><span>Open leads</span><small>Ready for your next follow-up</small></Link>
      <Link href="/admin/blog" className="admin-card admin-stat"><span className="admin-stat-top">03 <span aria-hidden="true">↗</span></span><strong>{posts ?? 0}</strong><span>Published articles</span><small>Ideas live on your website</small></Link>
    </div>
    <section className="admin-card admin-quick-actions"><div><p className="admin-eyebrow">NEXT STEPS</p><h2>Keep the momentum going.</h2><p>Move a lead forward or share a new idea with your audience.</p></div><div className="admin-quick-links"><Link className="admin-button" href="/admin/leads">Manage leads <span aria-hidden="true">↗</span></Link><Link className="admin-button admin-button-outline" href="/admin/blog/new">Write an article <span aria-hidden="true">↗</span></Link></div></section>
  </>;
}
