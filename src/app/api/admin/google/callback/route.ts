import { NextRequest, NextResponse } from "next/server";
import { actor, db } from "@/lib/supabase";
import { encrypt, exchangeCode } from "@/lib/google";

export async function GET(req: NextRequest) {
  const current = await actor();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (current.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  if (!code || !state || state !== req.cookies.get("google_oauth_state")?.value)
    return NextResponse.redirect(new URL("/admin/analytics?error=state", req.url));
  try {
    const tokens = await exchangeCode(code);
    if (!tokens.refresh_token) throw new Error("No refresh token");
    const { data: existing } = await db().from("integrations").select("search_site,ga4_property_id").eq("name", "google").maybeSingle();
    const { error } = await db().from("integrations").upsert({ name: "google", access_token_encrypted: encrypt(tokens.access_token),
      refresh_token_encrypted: encrypt(tokens.refresh_token), expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      search_site: existing?.search_site || null, ga4_property_id: existing?.ga4_property_id || null, updated_at: new Date().toISOString() });
    if (error) throw error;
    const response = NextResponse.redirect(new URL("/admin/analytics?connected=1", req.url));
    response.cookies.delete("google_oauth_state");
    return response;
  } catch { return NextResponse.redirect(new URL("/admin/analytics?error=google", req.url)); }
}
