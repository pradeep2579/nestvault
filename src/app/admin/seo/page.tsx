import { db } from "@/lib/supabase";
import { requirePageActor } from "@/lib/admin-page";
import { homeSeo } from "@/lib/public-data";
import { addRedirect, removeRedirect, saveHomeSeo } from "./actions";
import Link from "next/link";
import { seoIssues } from "@/lib/post-seo";
import CountedField from "@/components/admin/CountedField";
import SubmitButton from "@/components/admin/SubmitButton";

type Props = { searchParams: Promise<{ error?: string; saved?: string }> };
export default async function SeoPage({ searchParams }: Props) {
  await requirePageActor(true);
  const [seo, { data: redirects, error: redirectsError }, { data: posts, error: postsError }, query] = await Promise.all([homeSeo(), db().from("redirects").select("*").order("created_at", { ascending: false }),
    db().from("posts").select("id,title,slug,status,excerpt,body_html,seo_title,seo_description,cover_url,cover_alt,noindex").order("updated_at", { ascending: false }), searchParams]);
  if (redirectsError || postsError) throw new Error("Could not load SEO settings. Please refresh.");
  const audited = (posts || []).map(post => ({ ...post, issues: seoIssues(post) })).sort((a, b) => b.issues.length - a.issues.length);
  const needAttention = audited.filter(post => post.issues.length).length;
  const home = [
    { ok: seo.title.length >= 30 && seo.title.length <= 65, text: `Homepage title is ${seo.title.length} characters (aim for 30-65)` },
    { ok: seo.description.length >= 110 && seo.description.length <= 160, text: `Homepage description is ${seo.description.length} characters (aim for 110-160)` },
    { ok: !!seo.social_image, text: "A social sharing image is set" },
    { ok: !!seo.social_image_alt, text: "The social image has alt text" },
    { ok: !seo.noindex, text: "The homepage is visible to search engines" },
  ];
  return <><div className="admin-page-heading"><p className="admin-eyebrow">SEARCH PRESENCE</p><h1>SEO settings</h1><p>Shape how Nest Vault appears in search results and social shares.</p></div>{query.saved && <p className="admin-success">Changes saved.</p>}
    {query.error && <p className="admin-error">{({ json: "Business schema must be valid JSON.", path: "Use different local paths without query strings.", loop: "This redirect would make a loop.", duplicate: "That source path already exists.", url: "Use a local path or an HTTPS URL for the canonical and social image." } as Record<string,string>)[query.error] || "Could not save."}</p>}
    <section className="admin-card" style={{ marginBottom: "1.5rem" }}><h2>Search health</h2>
      <ul className="seo-checks">{home.map(item => <li key={item.text} className={item.ok ? "is-ok" : "is-warn"}><span aria-hidden="true">{item.ok ? "✓" : "!"}</span><div>{item.text}</div></li>)}</ul>
      <p className="crm-hint" style={{ marginTop: 12 }}>{audited.length ? (needAttention ? `${needAttention} of ${audited.length} articles have something to fix. Worst first:` : `All ${audited.length} articles pass the search checks.`) : "No articles to check yet."}</p>
      {needAttention > 0 && <div className="admin-table-scroll" role="region" aria-label="Article search audit" tabIndex={0}><table className="admin-table"><thead><tr><th>Article</th><th>Status</th><th>To fix</th></tr></thead><tbody>
        {audited.filter(post => post.issues.length).slice(0, 15).map(post => <tr key={post.id}><td><Link className="admin-link" href={`/admin/blog/${post.id}`}>{post.title}</Link></td>
          <td><span className={`admin-status admin-status--${post.status}`}>{post.status}</span></td><td>{post.issues.map(issue => issue.label).join(" · ")}</td></tr>)}</tbody></table></div>}
    </section>
    <section className="admin-card"><h2>Homepage search appearance</h2><form action={saveHomeSeo} className="admin-form">
      <CountedField name="title" label="SEO title" defaultValue={seo.title} min={30} max={65} required />
      <CountedField name="description" label="Meta description" defaultValue={seo.description} min={110} max={160} textarea required />
      <label>Canonical URL<input name="canonical_url" defaultValue={seo.canonical_url || ""} placeholder="https://nestvault.in/" /></label>
      <label>Social image URL<input name="social_image" defaultValue={seo.social_image || ""} /></label>
      <label>Social image alt text<input name="social_image_alt" defaultValue={seo.social_image_alt || ""} /></label>
      <label style={{ display: "flex", alignItems: "center" }}><input type="checkbox" name="noindex" defaultChecked={seo.noindex} style={{ width: "auto" }} /> Hide homepage from search engines</label>
      <label>LocalBusiness schema overrides (JSON)<textarea name="business_json" style={{ minHeight: 200, fontFamily: "monospace" }} defaultValue={JSON.stringify(seo.business_json || {}, null, 2)} /></label>
      <SubmitButton>Save homepage SEO</SubmitButton></form></section>
    <section className="admin-card" style={{ marginTop: "1.5rem" }}><h2>Redirects</h2><form action={addRedirect} className="admin-form">
      <label>Old path<input name="source_path" required placeholder="/old-page" /></label><label>New path<input name="destination_path" required placeholder="/blog" /></label>
      <label style={{ display: "flex", alignItems: "center" }}><input name="permanent" type="checkbox" defaultChecked style={{ width: "auto" }} /> Permanent (301)</label><SubmitButton pendingLabel="Adding…">Add redirect</SubmitButton>
    </form><div className="admin-table-scroll" role="region" aria-label="Redirects table" tabIndex={0} style={{ marginTop: "1rem" }}><table className="admin-table"><thead><tr><th>From</th><th>To</th><th>Type</th><th></th></tr></thead><tbody>
      {(redirects || []).map(item => <tr key={item.id}><td>{item.source_path}</td><td>{item.destination_path}</td><td>{item.permanent ? "301" : "302"}</td>
        <td><form action={removeRedirect}><input type="hidden" name="id" value={item.id} /><button className="admin-button">Remove</button></form></td></tr>)}
    </tbody></table></div></section></>;
}
