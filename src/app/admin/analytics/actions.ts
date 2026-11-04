"use server";
import { redirect } from "next/navigation";
import { db, requireActor } from "@/lib/supabase";

export async function saveAnalyticsSettings(formData: FormData) {
  await requireActor(true);
  const searchSite = String(formData.get("search_site") || "").trim();
  const property = String(formData.get("ga4_property_id") || "").trim();
  if (searchSite && !(/^(https?:\/\/|sc-domain:)/.test(searchSite))) throw new Error("Invalid Search Console property");
  if (property && !/^\d+$/.test(property)) throw new Error("GA4 property ID must be numeric");
  const { error } = await db().from("integrations").update({ search_site: searchSite || null, ga4_property_id: property || null }).eq("name", "google");
  if (error) throw error;
  redirect("/admin/analytics?saved=1");
}

export async function disconnectGoogle() {
  await requireActor(true);
  await db().from("integrations").delete().eq("name", "google");
  redirect("/admin/analytics?disconnected=1");
}
