import Link from "next/link";
import type { Post } from "@/lib/public-data";
import { savePost } from "@/app/admin/blog/actions";
import RichEditor from "./RichEditor";
import CoverUpload from "./CoverUpload";
import CountedField from "./CountedField";
import PostEditorTools from "./PostEditorTools";
import SubmitButton from "./SubmitButton";
import ConfirmSubmit from "./ConfirmSubmit";
import DeletePostButton from "./DeletePostButton";
import { isLivePost } from "@/lib/content";

export default function PostForm({ post, role, error }: { post?: Post; role: "owner" | "staff"; error?: string }) {
  const scheduled = post?.status === "scheduled" && post.published_at ? new Date(new Date(post.published_at).getTime() + 330 * 60000).toISOString().slice(0, 16) : "";
  const live = !!post && isLivePost(post);
  return <><div className="admin-row"><Link className="admin-link" href="/admin/blog">← Articles</Link>
    {post && <Link className="admin-link" href={`/admin/blog/preview?id=${post.id}`} target="_blank">Preview draft</Link>}
    {(post?.status === "published" || (post?.status === "scheduled" && post.published_at && new Date(post.published_at) <= new Date())) && <Link className="admin-link" href={`/blog/${post.slug}`} target="_blank">View live</Link>}</div>
    <div className="admin-page-heading"><p className="admin-eyebrow">CONTENT STUDIO</p><h1>{post ? "Edit article" : "New article"}</h1><p>Craft a useful story, add accessible images, and choose when it goes live.</p></div>{error && <p className="admin-error">{({ slug: "That URL slug is already in use.", article: "Enter a title and valid URL slug.", alt: "Add cover image alt text before publishing.", schedule: "Choose a future publish time in India time.", button: "Add the button text.", url: "Use a local path or an HTTPS URL for images and the canonical URL." } as Record<string, string>)[error] || "Could not save this article."}</p>}
    <form action={savePost} className="admin-form admin-card"><input type="hidden" name="id" value={post?.id || ""} />
      <label>Title<input name="title" defaultValue={post?.title} required maxLength={180} /></label>
      <label>URL slug<input name="slug" defaultValue={post?.slug} placeholder="Generated from title when blank" /></label>
      <label>Excerpt<textarea name="excerpt" defaultValue={post?.excerpt} maxLength={500} /></label>
      <div className="admin-editor-field"><span>Article body</span><RichEditor initial={post?.body_html || ""} /></div>
      <h2>Button</h2><p className="admin-hint">Optional. Shows a button under the article that opens this URL.</p>
      <input type="hidden" name="had_button" value={post?.button_url ? "1" : ""} />
      <label>Button text<input name="button_label" defaultValue={post?.button_label || ""} maxLength={60} placeholder="e.g. Visit Nest Vault" /></label>
      <label>Button URL<input name="button_url" defaultValue={post?.button_url || ""} placeholder="https://nestvault.in" /></label>
      <h2>Images</h2><CoverUpload initial={post?.cover_url || ""} />
      <label>Cover image alt text<input name="cover_alt" defaultValue={post?.cover_alt || ""} /></label>
      <h2>Search & social</h2>
      <CountedField name="seo_title" label="SEO title" defaultValue={post?.seo_title || ""} min={30} max={65} placeholder="Leave blank to use the article title" />
      <CountedField name="seo_description" label="Meta description" defaultValue={post?.seo_description || ""} min={110} max={160} textarea placeholder="Leave blank to use the excerpt" />
      <label>Canonical URL<input name="canonical_url" defaultValue={post?.canonical_url || ""} /></label>
      <label>Social image URL<input name="social_image" defaultValue={post?.social_image || ""} /></label>
      <label style={{ display: "flex", alignItems: "center" }}><input type="checkbox" name="noindex" defaultChecked={post?.noindex} style={{ width: "auto" }} /> Hide from search engines</label>
      <PostEditorTools />
      {!live && <label>Schedule (India time)<input type="datetime-local" name="published_at" defaultValue={scheduled} /></label>}
      <div className="admin-row">{live
        ? (role === "owner" ? <><SubmitButton name="intent" value="update">Update article</SubmitButton>
            <ConfirmSubmit name="intent" value="unpublish" message="Unpublish this article? It disappears from the website and goes back to a draft.">Unpublish</ConfirmSubmit></> : null)
        : <><SubmitButton name="intent" value="draft">Save draft</SubmitButton>{role === "owner" && <><SubmitButton name="intent" value="schedule">{post?.status === "scheduled" ? "Update schedule" : "Schedule"}</SubmitButton><SubmitButton name="intent" value="publish" pendingLabel="Publishing…">Publish now</SubmitButton></>}</>}</div>
    </form>{post && role === "owner" && <DeletePostButton id={post.id} title={post.title} />}</>;
}
