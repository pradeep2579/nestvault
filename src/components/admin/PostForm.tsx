import Link from "next/link";
import type { Post } from "@/lib/public-data";
import { savePost } from "@/app/admin/blog/actions";
import RichEditor from "./RichEditor";
import CoverUpload from "./CoverUpload";

export default function PostForm({ post, role, error }: { post?: Post; role: "owner" | "staff"; error?: string }) {
  const scheduled = post?.status === "scheduled" && post.published_at ? new Date(new Date(post.published_at).getTime() + 330 * 60000).toISOString().slice(0, 16) : "";
  return <><div className="admin-row"><Link className="admin-link" href="/admin/blog">← Articles</Link>
    {post && <Link className="admin-link" href={`/admin/blog/preview?id=${post.id}`} target="_blank">Preview draft</Link>}
    {(post?.status === "published" || (post?.status === "scheduled" && post.published_at && new Date(post.published_at) <= new Date())) && <Link className="admin-link" href={`/blog/${post.slug}`} target="_blank">View live</Link>}</div>
    <div className="admin-page-heading"><p className="admin-eyebrow">CONTENT STUDIO</p><h1>{post ? "Edit article" : "New article"}</h1><p>Craft a useful story, add accessible images, and choose when it goes live.</p></div>{error && <p className="admin-error">{error === "slug" ? "That URL slug is already in use." : error}</p>}
    <form action={savePost} className="admin-form admin-card"><input type="hidden" name="id" value={post?.id || ""} />
      <label>Title<input name="title" defaultValue={post?.title} required maxLength={180} /></label>
      <label>URL slug<input name="slug" defaultValue={post?.slug} placeholder="Generated from title when blank" /></label>
      <label>Excerpt<textarea name="excerpt" defaultValue={post?.excerpt} maxLength={500} /></label>
      <div className="admin-editor-field"><span>Article body</span><RichEditor initial={post?.body_html || ""} /></div>
      <h2>Images</h2><CoverUpload initial={post?.cover_url || ""} />
      <label>Cover image alt text<input name="cover_alt" defaultValue={post?.cover_alt || ""} /></label>
      <h2>Search & social</h2><label>SEO title<input name="seo_title" defaultValue={post?.seo_title || ""} /></label>
      <label>Meta description<textarea name="seo_description" defaultValue={post?.seo_description || ""} /></label>
      <label>Canonical URL<input name="canonical_url" defaultValue={post?.canonical_url || ""} /></label>
      <label>Social image URL<input name="social_image" defaultValue={post?.social_image || ""} /></label>
      <label style={{ display: "flex", alignItems: "center" }}><input type="checkbox" name="noindex" defaultChecked={post?.noindex} style={{ width: "auto" }} /> Hide from search engines</label>
      <label>Schedule (India time)<input type="datetime-local" name="published_at" defaultValue={scheduled} /></label>
      <div className="admin-row"><button name="intent" value="draft">Save draft</button>{role === "owner" && <><button name="intent" value="schedule">Schedule</button><button name="intent" value="publish">Publish now</button></>}</div>
    </form></>;
}
