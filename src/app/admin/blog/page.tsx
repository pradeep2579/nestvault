import { istDate, istDateTime } from "@/lib/format";
import Link from "next/link";
import { db } from "@/lib/supabase";
import { requirePageActor } from "@/lib/admin-page";
import { canEditPost, isLivePost } from "@/lib/content";
import { seoIssues } from "@/lib/post-seo";

type Props = { searchParams: Promise<{ status?: string; q?: string; deleted?: string }> };
const tabs = ["all", "draft", "scheduled", "published"] as const;

export default async function AdminBlog({ searchParams }: Props) {
  const current = await requirePageActor();
  const { status = "all", q = "", deleted } = await searchParams;
  let query = db().from("posts").select("id,title,slug,status,published_at,updated_at,author_id,excerpt,body_html,seo_title,seo_description,cover_url,cover_alt,noindex").order("updated_at", { ascending: false });
  if (current.role === "staff") query = query.eq("author_id", current.id);
  const [{ data, error }, { data: staff }] = await Promise.all([query, db().from("profiles").select("id,email")]);
  if (error) throw error;
  const now = new Date();
  const posts = (data || []).filter(post => canEditPost(current, post)).map(post => ({ ...post, shown: isLivePost(post, now) ? "published" : post.status as string }));
  const counts = Object.fromEntries(tabs.map(tab => [tab, tab === "all" ? posts.length : posts.filter(post => post.shown === tab).length]));
  const needle = q.trim().toLowerCase();
  const rows = posts.filter(post => (status === "all" || post.shown === status) && (!needle || post.title.toLowerCase().includes(needle) || post.slug.toLowerCase().includes(needle)));
  const author = (id: string | null) => staff?.find(person => person.id === id)?.email.split("@")[0] || "—";
  return <><div className="admin-row admin-section-header"><div className="admin-page-heading"><p className="admin-eyebrow">CONTENT STUDIO</p><h1>Blog</h1><p>Write, review, and publish stories for the Nest Vault community.</p></div><Link href="/admin/blog/new" className="admin-button">New article <span aria-hidden="true">↗</span></Link></div>
    {deleted && <p className="admin-success" role="status">Article deleted.</p>}
    <div className="crm-tabs" aria-label="Filter articles">{tabs.map(tab => <Link key={tab} href={`/admin/blog?status=${tab}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={status === tab || (!tabs.includes(status as typeof tabs[number]) && tab === "all") ? "is-active" : ""}>
      {tab[0].toUpperCase() + tab.slice(1)} <b>{counts[tab]}</b></Link>)}</div>
    <form className="admin-row admin-filter-bar" method="get"><input type="hidden" name="status" value={status} /><input name="q" defaultValue={q} placeholder="Search by title or URL" aria-label="Search articles" /><button className="admin-button">Search</button></form>
    <div className="admin-card admin-table-scroll" style={{ padding: 0 }} role="region" aria-label="Articles table" tabIndex={0}><table className="admin-table"><thead><tr><th>Article</th><th>Status</th><th>Author</th><th>Publish time</th><th>Updated</th><th>Search quality</th></tr></thead><tbody>
      {rows.map(post => { const issues = seoIssues(post).length; return <tr key={post.id}><td><Link className="admin-link" href={`/admin/blog/${post.id}`}>{post.title}</Link><br /><small>/blog/{post.slug}</small></td>
        <td><span className={`admin-status admin-status--${post.shown}`}>{post.shown}</span></td><td>{author(post.author_id)}</td><td>{post.published_at ? istDateTime(post.published_at) : "—"}</td>
        <td>{istDate(post.updated_at)}</td><td>{issues ? <span className="crm-pill">{issues} to fix</span> : <span className="crm-pill is-good">All good</span>}</td></tr>; })}
    </tbody></table>{!rows.length && <p style={{ padding: "1rem" }}>{posts.length ? "No articles match." : "No articles yet."}</p>}</div></>;
}
