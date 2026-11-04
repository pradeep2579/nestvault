import "server-only";
import { db } from "@/lib/supabase";

export type Post = {
  id: string; title: string; slug: string; excerpt: string; body_html: string;
  cover_url: string | null; cover_alt: string | null; status: string;
  published_at: string | null; seo_title: string | null; seo_description: string | null;
  canonical_url: string | null; social_image: string | null; noindex: boolean;
  schema_type: string; updated_at: string;
};

export type HomeSeo = {
  title: string; description: string; canonical_url: string | null;
  social_image: string | null; social_image_alt: string | null;
  noindex: boolean; business_json: Record<string, unknown>;
};

const fallbackSeo: HomeSeo = {
  title: "Nest Vault — Premium Co-working Space in Hyderabad",
  description: "Private cabins, dedicated desks, meeting rooms, and virtual offices at Nest Vault in Jubilee Hills, Hyderabad.",
  canonical_url: null, social_image: "/images/lounge-wide.jpg",
  social_image_alt: "Nest Vault coworking lounge in Hyderabad", noindex: false, business_json: {},
};

export function hasDatabase() { return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)); }

export async function homeSeo(): Promise<HomeSeo> {
  if (!hasDatabase()) return fallbackSeo;
  const { data, error } = await db().from("site_seo").select("*").eq("page_key", "home").maybeSingle();
  if (error || !data) return fallbackSeo;
  return data as HomeSeo;
}

export async function publicPosts(limit?: number): Promise<Post[]> {
  if (!hasDatabase()) return [];
  let query = db().from("posts").select("*").in("status", ["published", "scheduled"])
    .lte("published_at", new Date().toISOString()).order("published_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Post[];
}

export async function publicPost(slug: string): Promise<Post | null> {
  if (!hasDatabase()) return null;
  const { data } = await db().from("posts").select("*").eq("slug", slug)
    .in("status", ["published", "scheduled"]).lte("published_at", new Date().toISOString()).maybeSingle();
  return data as Post | null;
}
