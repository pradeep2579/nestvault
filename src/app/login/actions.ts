"use server";
import { redirect } from "next/navigation";
import { authClient, db } from "@/lib/supabase";
import { absoluteUrl } from "@/lib/content";

export type LoginState = { message: string };

export async function signIn(_previous: LoginState, formData: FormData): Promise<LoginState> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || !(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY))
    return { message: "Sign-in is unavailable. Contact the site administrator." };
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { message: "Enter your email and password." };
  const client = await authClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) return { message: error.code === "email_not_confirmed"
    ? "Please confirm your email using the invitation link before signing in."
    : "Email or password is incorrect. If you were invited, first set your password from the invitation email." };
  if (!data.user || !data.session) return { message: "Could not start a session. Please try again." };

  const { data: profile, error: profileError } = await db().from("profiles")
    .select("role,active").eq("id", data.user.id).maybeSingle();
  if (profileError) {
    await client.auth.signOut();
    return { message: "Could not check admin access. Please try again shortly." };
  }
  if (!profile?.active || !["owner", "staff"].includes(profile.role)) {
    await client.auth.signOut();
    return { message: "This account does not have active admin access." };
  }
  redirect("/admin");
}

export async function requestPasswordReset(_previous: LoginState, formData: FormData): Promise<LoginState> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY))
    return { message: "Password reset is unavailable. Contact the site administrator." };
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { message: "Enter a valid email address." };
  const client = await authClient();
  const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: absoluteUrl("/login/invite") });
  if (error) return { message: "Could not send a reset link right now. Please try again shortly." };
  return { message: "If this email has an account, check its inbox for a password reset link." };
}

export async function signOut() {
  const client = await authClient();
  await client.auth.signOut();
  redirect("/login");
}
