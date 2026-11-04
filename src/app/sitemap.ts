import type { MetadataRoute } from "next";
import { publicPosts, homeSeo } from "@/lib/public-data";
import { siteUrl } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, seo] = await Promise.all([publicPosts(), homeSeo()]);
  return [
    ...(!seo.noindex ? [{ url: siteUrl, changeFrequency: "weekly" as const, priority: 1 }] : []),
    { url: `${siteUrl}/blog`, changeFrequency: "weekly" as const, priority: 0.8 },
    ...posts.filter(post => !post.noindex).map(post => ({ url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at), changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
