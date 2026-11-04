import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  let response = NextResponse.next({ request });
  if (url && anon) {
    const auth = createServerClient(url, anon, { cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(items) {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    } });
    await auth.auth.getUser();
  }
  if (!url || !service) return response;
  const path = request.nextUrl.pathname.replace(/\/$/, "") || "/";
  if (path.startsWith("/api/") || path.startsWith("/admin") || path.startsWith("/login")) return response;
  const client = createClient(url, service, { auth: { persistSession: false } });
  const { data } = await client.from("redirects").select("destination_path,permanent").eq("source_path", path).maybeSingle();
  if (!data) return response;
  const redirected = NextResponse.redirect(new URL(data.destination_path, request.url), data.permanent ? 301 : 302);
  response.cookies.getAll().forEach(cookie => redirected.cookies.set(cookie));
  return redirected;
}

export const config = { matcher: "/((?!_next/|favicon.ico|icon.png|apple-icon.png|images/|videos/|manifest.json|robots.txt|sitemap.xml).*)" };
