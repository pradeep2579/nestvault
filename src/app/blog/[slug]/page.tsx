import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { publicPost } from "@/lib/public-data";
import { absoluteUrl } from "@/lib/content";
import Link from "next/link";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await publicPost((await params).slug);
  if (!post) return { title: "Article not found", robots: { index: false } };
  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt;
  const url = post.canonical_url || `/blog/${post.slug}`;
  const image = post.social_image || post.cover_url || undefined;
  return { title, description, alternates: { canonical: url }, robots: { index: !post.noindex, follow: !post.noindex },
    openGraph: { type: "article", title, description, url, images: image ? [{ url: image, alt: post.cover_alt || post.title }] : [] },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] } };
}

export default async function ArticlePage({ params }: Props) {
  const post = await publicPost((await params).slug);
  if (!post) notFound();
  const jsonLd = { "@context": "https://schema.org", "@type": post.schema_type,
    headline: post.title, description: post.seo_description || post.excerpt,
    image: post.cover_url ? absoluteUrl(post.cover_url) : undefined,
    datePublished: post.published_at, dateModified: post.updated_at,
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`), publisher: { "@type": "Organization", name: "Nest Vault", logo: absoluteUrl("/images/logo-full.png") } };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <Navbar /><main style={{ padding: "8rem 1.5rem 5rem", background: "#f6f3ed", color: "#051650", minHeight: "70vh" }}>
      <article style={{ maxWidth: 800, margin: "0 auto" }}>
        <Link href="/blog" style={{ color: "#9b7934" }}>← All articles</Link>
        <h1 style={{ fontSize: "clamp(2.3rem,5vw,4rem)", lineHeight: 1.1, margin: "2rem 0 1rem" }}>{post.title}</h1>
        <p style={{ opacity: 0.65 }}>{post.published_at && new Date(post.published_at).toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
        {post.cover_url && <div role="img" aria-label={post.cover_alt || post.title} style={{ marginTop: "2rem", aspectRatio: "16 / 9", background: `center / cover url(${post.cover_url})` }} />}
        <div className="article-content" dangerouslySetInnerHTML={{ __html: post.body_html }} />
      </article>
    </main><Footer /></>;
}
