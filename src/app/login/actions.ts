"use server";
import { redirect } from "next/navigation";
import { authClient, actor } from "@/lib/supabase";

export async function signIn(formData: FormData) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) redirect("/login?error=config");
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const client = await authClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error || !(await actor())) redirect("/login?error=1");
  redirect("/admin");
}

export async function signOut() {
  const client = await authClient();
  await client.auth.signOut();
  redirect("/login");
}
