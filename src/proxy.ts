import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname.replace(/\/$/, "") || "/";
  // Only signed-in areas need the session refreshed. Public pages skip this Supabase call.
  const needsSession = path.startsWith("/admin") || path.startsWith("/login") || path.startsWith("/api/admin");
  if (url && anon && needsSession) {
    const auth = createServerClient(url, anon, { cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(items) {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    } });
    await auth.auth.getClaims();
  }
  if (!url || !service) return response;
  if (path.startsWith("/api/") || path.startsWith("/admin") || path.startsWith("/login")) return response;
  const data = (await redirectTable(url, service)).get(path);
  if (!data) return response;
  const redirected = NextResponse.redirect(new URL(data.destination_path, request.url), data.permanent ? 301 : 302);
  response.cookies.getAll().forEach(cookie => redirected.cookies.set(cookie));
  return redirected;
}

// The redirects table is small and rarely changes, so keep it in memory for a minute instead of
// querying the database on every page view. New or deleted redirects take effect within a minute.
let redirectCache: { at: number; rows: Map<string, { destination_path: string; permanent: boolean }> } | null = null;
async function redirectTable(url: string, service: string) {
  if (redirectCache && Date.now() - redirectCache.at < 60_000) return redirectCache.rows;
  const client = createClient(url, service, { auth: { persistSession: false } });
  const { data, error } = await client.from("redirects").select("source_path,destination_path,permanent");
  if (error) return redirectCache?.rows || new Map();
  redirectCache = { at: Date.now(), rows: new Map((data || []).map(row => [row.source_path, row])) };
  return redirectCache.rows;
}

export const config = { matcher: "/((?!_next/|favicon.ico|icon.png|apple-icon.png|images/|videos/|manifest.json|robots.txt|sitemap.xml).*)" };
