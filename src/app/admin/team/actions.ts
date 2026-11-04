"use server";
import { redirect } from "next/navigation";
import { db, requireActor } from "@/lib/supabase";
import { absoluteUrl } from "@/lib/content";

export async function inviteTeamMember(formData: FormData) {
  await requireActor(true);
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const role = String(formData.get("role") || "staff");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !["owner", "staff"].includes(role)) redirect("/admin/team?error=invalid");
  const { data, error } = await db().auth.admin.inviteUserByEmail(email, { redirectTo: absoluteUrl("/login/invite") });
  if (error || !data.user) redirect("/admin/team?error=invite");
  const { error: profileError } = await db().from("profiles").upsert({ id: data.user.id, email, role, active: true });
  if (profileError) redirect("/admin/team?error=profile");
  redirect("/admin/team?sent=1");
}

export async function updateTeamMember(formData: FormData) {
  const current = await requireActor(true);
  const id = String(formData.get("id") || "");
  const role = String(formData.get("role") || "");
  const active = formData.get("active") === "on";
  if (!/^[0-9a-f-]{36}$/.test(id) || !["owner", "staff"].includes(role) || id === current.id)
    redirect("/admin/team?error=invalid");
  const { error } = await db().from("profiles").update({ role, active }).eq("id", id);
  if (error) redirect("/admin/team?error=update");
  redirect("/admin/team?updated=1");
}
