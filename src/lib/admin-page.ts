import "server-only";
import { notFound, redirect } from "next/navigation";
import { actor } from "@/lib/supabase";

export async function requirePageActor(owner = false) {
  let current = null;
  try { current = await actor(); } catch { /* Missing configuration or expired session. */ }
  if (!current) redirect("/login");
  if (owner && current.role !== "owner") notFound();
  return current;
}
