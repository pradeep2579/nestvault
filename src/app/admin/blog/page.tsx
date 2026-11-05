import Link from "next/link";
import { db } from "@/lib/supabase";
import { requirePageActor } from "@/lib/admin-page";
import { canEditPost, isLivePost } from "@/lib/content";

export default async function AdminBlog() {
  const current = await requirePageActor();
  let query = db().from("posts").select("id,title,slug,status,published_at,updated_at,author_id").order("updated_at", { ascending: false });
  if (current.role === "staff") query = query.eq("author_id", current.id);
  const { data, error } = await query;
  if (error) throw error;
  return <><div className="admin-row admin-section-header"><div className="admin-page-heading"><p className="admin-eyebrow">CONTENT STUDIO</p><h1>Blog</h1><p>Write, review, and publish stories for the Nest Vault community.</p></div><Link href="/admin/blog/new" className="admin-button">New article <span aria-hidden="true">↗</span></Link></div>
    <div className="admin-card admin-table-scroll" style={{ padding: 0 }} role="region" aria-label="Articles table" tabIndex={0}><table className="admin-table"><thead><tr><th>Article</th><th>Status</th><th>Publish time</th><th>Updated</th></tr></thead><tbody>
      {(data || []).filter(post => canEditPost(current, post)).map(post => <tr key={post.id}><td><Link className="admin-link" href={`/admin/blog/${post.id}`}>{post.title}</Link></td>
        <td><span className={`admin-status admin-status--${isLivePost(post) ? "published" : post.status}`}>{isLivePost(post) ? "published" : post.status}</span></td><td>{post.published_at ? new Date(post.published_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "—"}</td>
        <td>{new Date(post.updated_at).toLocaleDateString("en-IN")}</td></tr>)}
    </tbody></table>{!data?.length && <p style={{ padding: "1rem" }}>No articles yet.</p>}</div></>;
}
