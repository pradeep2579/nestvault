"use server";
import { redirect } from "next/navigation";
import { authClient, requireActor } from "@/lib/supabase";

export async function changePassword(formData: FormData) {
  const current = await requireActor();
  const existing = String(formData.get("current") || ""), next = String(formData.get("next") || ""), confirm = String(formData.get("confirm") || "");
  if (next.length < 10) redirect("/admin/account?error=short");
  if (next !== confirm) redirect("/admin/account?error=match");
  if (next === existing) redirect("/admin/account?error=same");
  const client = await authClient();
  // Prove it is really them (not just someone at an unlocked screen) before changing anything.
  const { error: verifyError } = await client.auth.signInWithPassword({ email: current.email, password: existing });
  if (verifyError) redirect("/admin/account?error=current");
  const { error } = await client.auth.updateUser({ password: next });
  if (error) redirect("/admin/account?error=update");
  redirect("/admin/account?saved=1");
}
