import { db } from "@/lib/supabase";
import { requirePageActor } from "@/lib/admin-page";
import { homeSeo } from "@/lib/public-data";
import { addRedirect, removeRedirect, saveHomeSeo } from "./actions";

type Props = { searchParams: Promise<{ error?: string; saved?: string }> };
export default async function SeoPage({ searchParams }: Props) {
  await requirePageActor(true);
  const [seo, { data: redirects }, query] = await Promise.all([homeSeo(), db().from("redirects").select("*").order("created_at", { ascending: false }), searchParams]);
  return <><div className="admin-page-heading"><p className="admin-eyebrow">SEARCH PRESENCE</p><h1>SEO settings</h1><p>Shape how Nest Vault appears in search results and social shares.</p></div>{query.saved && <p className="admin-success">Changes saved.</p>}
    {query.error && <p className="admin-error">{({ json: "Business schema must be valid JSON.", path: "Use different local paths without query strings.", loop: "This redirect would make a loop.", duplicate: "That source path already exists." } as Record<string,string>)[query.error] || "Could not save."}</p>}
    <section className="admin-card"><h2>Homepage search appearance</h2><form action={saveHomeSeo} className="admin-form">
      <label>SEO title<input name="title" required defaultValue={seo.title} /></label>
      <label>Meta description<textarea name="description" required defaultValue={seo.description} /></label>
      <label>Canonical URL<input name="canonical_url" defaultValue={seo.canonical_url || ""} placeholder="https://nestvault.in/" /></label>
      <label>Social image URL<input name="social_image" defaultValue={seo.social_image || ""} /></label>
      <label>Social image alt text<input name="social_image_alt" defaultValue={seo.social_image_alt || ""} /></label>
      <label style={{ display: "flex", alignItems: "center" }}><input type="checkbox" name="noindex" defaultChecked={seo.noindex} style={{ width: "auto" }} /> Hide homepage from search engines</label>
      <label>LocalBusiness schema overrides (JSON)<textarea name="business_json" style={{ minHeight: 200, fontFamily: "monospace" }} defaultValue={JSON.stringify(seo.business_json || {}, null, 2)} /></label>
      <button>Save homepage SEO</button></form></section>
    <section className="admin-card" style={{ marginTop: "1.5rem" }}><h2>Redirects</h2><form action={addRedirect} className="admin-form">
      <label>Old path<input name="source_path" required placeholder="/old-page" /></label><label>New path<input name="destination_path" required placeholder="/blog" /></label>
      <label style={{ display: "flex", alignItems: "center" }}><input name="permanent" type="checkbox" defaultChecked style={{ width: "auto" }} /> Permanent (301)</label><button>Add redirect</button>
    </form><table className="admin-table" style={{ marginTop: "1rem" }}><thead><tr><th>From</th><th>To</th><th>Type</th><th></th></tr></thead><tbody>
      {(redirects || []).map(item => <tr key={item.id}><td>{item.source_path}</td><td>{item.destination_path}</td><td>{item.permanent ? "301" : "302"}</td>
        <td><form action={removeRedirect}><input type="hidden" name="id" value={item.id} /><button className="admin-button">Remove</button></form></td></tr>)}
    </tbody></table></section></>;
}
