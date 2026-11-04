import Link from "next/link";
import type { Post } from "@/lib/public-data";

export default function BlogSection({ posts }: { posts: Post[] }) {
  return <section id="blog" className="section-pad" style={{ background: "#f6f3ed", color: "#051650" }}>
    <div className="container">
      <div className="divider-gold" style={{ marginBottom: "1.25rem" }} />
      <p className="label">From Nest Vault</p>
      <h2 className="h-section" style={{ margin: "0.75rem 0 2rem" }}>Ideas for better work</h2>
      {posts.length ? <div className="blog-cards">{posts.map(post =>
        <article key={post.id} className="blog-card">
          {post.cover_url && <div className="blog-card-image" style={{ backgroundImage: `url(${post.cover_url})` }} role="img" aria-label={post.cover_alt || post.title} />}
          <div style={{ padding: "1.5rem" }}>
            <p className="label">{post.published_at ? new Date(post.published_at).toLocaleDateString("en-IN", { dateStyle: "medium" }) : ""}</p>
            <h3 style={{ fontSize: "1.35rem", margin: "0.75rem 0" }}><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
            <p style={{ lineHeight: 1.7, opacity: 0.7 }}>{post.excerpt}</p>
            <Link href={`/blog/${post.slug}`} style={{ display: "inline-block", marginTop: "1rem", color: "#9b7934" }}>Read article →</Link>
          </div>
        </article>)}</div> : <p>New articles are coming soon.</p>}
      <Link href="/blog" className="btn-gold" style={{ marginTop: "2rem" }}>View all articles</Link>
    </div>
  </section>;
}
