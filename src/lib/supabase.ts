import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server configuration is missing");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function authClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase authentication configuration is missing");
  const store = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() { return store.getAll(); },
      setAll(items) {
        try { items.forEach(({ name, value, options }) => store.set(name, value, options)); }
        catch { /* Server Components cannot write cookies. Route handlers and actions can. */ }
      },
    },
  });
}

export type Actor = { id: string; email: string; role: "owner" | "staff" };

export async function actor(): Promise<Actor | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || !(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)) return null;
  const client = await authClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;
  const { data } = await db().from("profiles").select("role,active").eq("id", user.id).maybeSingle();
  if (!data?.active || (data.role !== "owner" && data.role !== "staff")) return null;
  return { id: user.id, email: user.email ?? "", role: data.role };
}

export async function requireActor(owner = false) {
  const current = await actor();
  if (!current || (owner && current.role !== "owner")) throw new Error("Unauthorized");
  return current;
}
