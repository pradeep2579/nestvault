"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, requireActor } from "@/lib/supabase";
import { absoluteUrl } from "@/lib/content";
import { openStages } from "@/lib/crm";

const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export async function inviteTeamMember(formData: FormData) {
  await requireActor(true);
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const role = String(formData.get("role") || "staff");
  if (!validEmail(email) || !["owner", "staff"].includes(role)) redirect("/admin/team?error=invalid");
  const { data, error } = await db().auth.admin.inviteUserByEmail(email, { redirectTo: absoluteUrl("/login/invite") });
  if (error || !data.user) redirect("/admin/team?error=invite");
  const { error: profileError } = await db().from("profiles").upsert({ id: data.user.id, email, role, active: true });
  if (profileError) redirect("/admin/team?error=profile");
  redirect("/admin/team?sent=1");
}

// For someone who never accepted: sends the invitation email again.
export async function resendInvite(formData: FormData) {
  await requireActor(true);
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!validEmail(email)) redirect("/admin/team?error=invalid");
  const { error } = await db().auth.admin.inviteUserByEmail(email, { redirectTo: absoluteUrl("/login/invite") });
  if (error) redirect("/admin/team?error=resend");
  redirect("/admin/team?sent=1");
}

export async function updateTeamMember(formData: FormData) {
  const current = await requireActor(true);
  const id = String(formData.get("id") || "");
  const role = String(formData.get("role") || "");
  const active = formData.get("active") === "on";
  if (!/^[0-9a-f-]{36}$/.test(id) || !["owner", "staff"].includes(role) || id === current.id)
    redirect("/admin/team?error=invalid");
  const client = db();
  const { data: before } = await client.from("profiles").select("active").eq("id", id).maybeSingle();
  const { error } = await client.from("profiles").update({ role, active }).eq("id", id);
  if (error) redirect("/admin/team?error=update");
  // Someone who can no longer sign in should not keep owning open leads, or those leads go unseen.
  let released = 0;
  if (before?.active && !active) {
    const { data } = await client.from("leads").update({ assigned_to: null, updated_at: new Date().toISOString() }).eq("assigned_to", id).in("stage", openStages).select("id");
    released = data?.length || 0;
    if (released) revalidatePath("/admin/leads");
  }
  redirect(`/admin/team?updated=1${released ? `&released=${released}` : ""}`);
}
