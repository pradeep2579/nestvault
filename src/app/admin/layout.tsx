import Link from "next/link";
import { redirect } from "next/navigation";
import { actor } from "@/lib/supabase";
import { signOut } from "@/app/login/actions";
import "./admin.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin | Nest Vault", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let current = null;
  try { current = await actor(); } catch { /* Configuration is shown on the login page. */ }
  if (!current) redirect("/login");
  return <div className="admin-shell">
    <aside className="admin-sidebar"><Link href="/admin" className="admin-brand">NEST VAULT <small>ADMIN</small></Link>
      <nav><Link href="/admin">Overview</Link><Link href="/admin/leads">Leads & tours</Link>
      <Link href="/admin/blog">Blog</Link>{current.role === "owner" && <><Link href="/admin/seo">SEO</Link><Link href="/admin/analytics">Analytics</Link><Link href="/admin/team">Team</Link></>}</nav>
      <div className="admin-account"><span>{current.email}<br /><small>{current.role}</small></span><form action={signOut}><button>Sign out</button></form></div>
    </aside><main className="admin-main">{children}</main>
  </div>;
}
