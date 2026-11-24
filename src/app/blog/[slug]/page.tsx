import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { publicPost, publicPosts } from "@/lib/public-data";
import { absoluteUrl, safeHtml } from "@/lib/content";
import Link from "next/link";

// Cached for 5 minutes (so scheduled posts appear on time); admin saves refresh it immediately via revalidatePath.
export const revalidate = 300;
type Props = { params: Promise<{ slug: string }> };
// No posts are built ahead of time; each one is rendered on its first visit and then cached.
export async function generateStaticParams() { return []; }

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
  const more = (await publicPosts(4)).filter(item => item.slug !== post.slug).slice(0, 3);
  const shareUrl = encodeURIComponent(absoluteUrl(`/blog/${post.slug}`));
  const shareText = encodeURIComponent(post.title);
  const date = post.published_at && new Date(post.published_at).toLocaleDateString("en-IN", { dateStyle: "long" });
  const jsonLd = { "@context": "https://schema.org", "@type": post.schema_type,
    headline: post.title, description: post.seo_description || post.excerpt,
    image: post.cover_url ? absoluteUrl(post.cover_url) : undefined,
    datePublished: post.published_at, dateModified: post.updated_at,
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`), publisher: { "@type": "Organization", name: "Nest Vault", logo: absoluteUrl("/images/logo-full.png") } };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <Navbar />
    <main className="article-page">
      <article className="article-wrap">
        <Link href="/blog" className="article-back">← All articles</Link>
        <header className="article-header">
          <p className="article-eyebrow">Nest Vault Journal{date && <> · <time dateTime={post.published_at || undefined}>{date}</time></>}</p>
          <h1>{post.title}</h1>
          {post.excerpt && <p className="article-lede">{post.excerpt}</p>}
        </header>
        {post.cover_url && <figure className="article-cover" role="img" aria-label={post.cover_alt || post.title} style={{ backgroundImage: `url(${post.cover_url})` }} />}
        <div className="article-content" dangerouslySetInnerHTML={{ __html: safeHtml(post.body_html) }} />
        <div className="article-share"><span>Share this article</span>
          <a href={`https://wa.me/?text=${shareText}%20${shareUrl}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`} target="_blank" rel="noopener noreferrer">X</a></div>
        <aside className="article-cta"><div><h2>Ready to see Nest Vault in person?</h2><p>Book a tour of our Jubilee Hills coworking space and find the workspace that fits your team.</p></div>
          <div className="article-cta-actions"><Link href="/#contact" className="btn-gold">Book a tour</Link><a href="tel:+919142696666" className="article-cta-phone">+91 91426 96666</a></div></aside>
      </article>
      {more.length > 0 && <section className="article-more" aria-label="More articles"><h2>Keep reading</h2>
        <div className="article-more-grid">{more.map(item => <Link key={item.id} href={`/blog/${item.slug}`} className="article-more-card">
          {item.cover_url && <span className="article-more-img" style={{ backgroundImage: `url(${item.cover_url})` }} />}
          <strong>{item.title}</strong><span>Read article →</span></Link>)}</div></section>}
    </main><Footer /></>;
}
