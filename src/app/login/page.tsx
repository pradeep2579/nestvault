import { redirect } from "next/navigation";
import { actor } from "@/lib/supabase";
import LoginForm from "./LoginForm";
import "@/app/admin/admin.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin sign in", robots: { index: false, follow: false } };
export default async function Login() {
  let current = null;
  try { current = await actor(); } catch { /* Show setup guidance. */ }
  if (current) redirect("/admin");
  return <LoginForm />;
}
