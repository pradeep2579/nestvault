import { NextRequest, NextResponse } from "next/server";
import { actor } from "@/lib/supabase";
import { googleAuthorizeUrl } from "@/lib/google";

export async function GET(req: NextRequest) {
  const current = await actor();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (current.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || Buffer.from(process.env.GOOGLE_TOKEN_ENCRYPTION_KEY || "", "base64").length !== 32)
    return NextResponse.redirect(new URL("/admin/analytics?error=config", req.url));
  const state = crypto.randomUUID();
  const response = NextResponse.redirect(googleAuthorizeUrl(state));
  response.cookies.set("google_oauth_state", state, { httpOnly: true, secure: req.nextUrl.protocol === "https:", sameSite: "lax", maxAge: 600, path: "/api/admin/google/callback" });
  return response;
}
