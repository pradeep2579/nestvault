import Link from "next/link";

export default function AdminNotFound() {
  return <section className="admin-card" style={{ maxWidth: 680 }}>
    <p className="admin-eyebrow">NOT FOUND</p>
    <h1>We could not find that page.</h1>
    <p>It may have been deleted, or you may not have access to it.</p>
    <div className="admin-row"><Link className="admin-button" href="/admin">Admin overview</Link><Link className="admin-link" href="/admin/leads">Leads</Link></div>
  </section>;
}
