import { redirect } from "next/navigation";
import { actor } from "@/lib/supabase";
import { signIn } from "./actions";
import "@/app/admin/admin.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin sign in", robots: { index: false, follow: false } };
type Props = { searchParams: Promise<{ error?: string }> };

export default async function Login({ searchParams }: Props) {
  let current = null;
  try { current = await actor(); } catch { /* Show setup guidance. */ }
  if (current) redirect("/admin");
  const { error } = await searchParams;
  return <main className="admin-login"><form action={signIn} className="admin-login-card">
    <p className="label">Nest Vault</p><h1>Admin sign in</h1>
    {error && <p role="alert" className="admin-error">{error === "config" ? "Supabase is not configured." : "Invalid credentials or no admin access."}</p>}
    {!process.env.NEXT_PUBLIC_SUPABASE_URL && <p className="admin-error">Supabase is not configured. See README.md.</p>}
    <label>Email<input name="email" type="email" required autoComplete="username" /></label>
    <label>Password<input name="password" type="password" required autoComplete="current-password" /></label>
    <button type="submit">Sign in</button>
  </form></main>;
}
