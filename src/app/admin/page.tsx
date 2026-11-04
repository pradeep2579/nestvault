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
  return <><h1>Overview</h1><div className="admin-grid">
    <Link href="/admin/leads" className="admin-card"><strong>{leads ?? 0}</strong><p>Total enquiries</p></Link>
    <Link href="/admin/leads" className="admin-card"><strong>{open ?? 0}</strong><p>Open leads</p></Link>
    <Link href="/admin/blog" className="admin-card"><strong>{posts ?? 0}</strong><p>Published articles</p></Link>
  </div><div className="admin-card" style={{ marginTop: "1.5rem" }}><h2>Quick actions</h2><div className="admin-row">
    <Link className="admin-button" href="/admin/leads">Manage leads</Link><Link className="admin-button" href="/admin/blog/new">Write article</Link>
  </div></div></>;
}
