import Link from "next/link";
import { redirect } from "next/navigation";
import { actor } from "@/lib/supabase";
import { signOut } from "@/app/login/actions";
import Image from "next/image";
import AdminNav from "@/components/admin/AdminNav";
import "./admin.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin | Nest Vault", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let current = null;
  try { current = await actor(); } catch { /* Configuration is shown on the login page. */ }
  if (!current) redirect("/login");
  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <Link href="/admin" className="admin-brand" aria-label="Nest Vault admin overview">
        <Image src="/images/logo-icon.png" alt="" width={48} height={40} className="admin-brand-mark" />
        <span><strong>Nest Vault</strong><small>WORKSPACE ADMIN</small></span>
      </Link>
      <div className="admin-sidebar-rule" />
      <p className="admin-nav-caption">WORKSPACE</p>
      <AdminNav role={current.role} />
      <div className="admin-sidebar-bottom">
        <Link href="/" className="admin-website-link" target="_blank" rel="noopener noreferrer">View public site <span aria-hidden="true">↗</span></Link>
        <div className="admin-account"><span className="admin-avatar" aria-hidden="true">{current.email.slice(0, 1).toUpperCase()}</span><span className="admin-account-text"><strong>{current.email}</strong><small>{current.role}</small></span></div>
        <form action={signOut}><button className="admin-signout">Sign out <span aria-hidden="true">→</span></button></form>
      </div>
    </aside>
    <div className="admin-workspace">
      <header className="admin-topbar"><div><span className="admin-topbar-dot" /> NEST VAULT <span className="admin-topbar-separator">/</span> OPERATIONS</div><span className="admin-topbar-role">{current.role} workspace</span></header>
      <main className="admin-main">{children}</main>
    </div>
  </div>;
}
