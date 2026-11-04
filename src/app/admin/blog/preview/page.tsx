import { notFound } from "next/navigation";
import { db } from "@/lib/supabase";
import { requirePageActor } from "@/lib/admin-page";

type Props = { searchParams: Promise<{ id?: string }> };
export default async function Preview({ searchParams }: Props) {
  const current = await requirePageActor();
  const { id } = await searchParams;
  const { data: post } = await db().from("posts").select("*").eq("id", id || "").maybeSingle();
  if (!post || (current.role === "staff" && post.author_id !== current.id)) notFound();
  return <article className="admin-card" style={{ maxWidth: 850, margin: "0 auto" }}>
    <p className="admin-error">Preview — {post.status}. This page is only visible to admins.</p>
    <h1>{post.title}</h1><p>{post.excerpt}</p>
    {post.cover_url && <div role="img" aria-label={post.cover_alt || post.title} style={{ aspectRatio: "16/9", background: `center / cover url(${post.cover_url})` }} />}
    <div className="article-content" dangerouslySetInnerHTML={{ __html: post.body_html }} />
  </article>;
}
