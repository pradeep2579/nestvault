"use client";

import Link from "next/link";

export default function AdminError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <section className="admin-card" role="alert" style={{ maxWidth: 680 }}>
    <p className="admin-eyebrow">WORKSPACE ERROR</p>
    <h1>We could not load this page.</h1>
    <p>Your changes may not have been saved. Try again, or return to the admin overview.</p>
    <div className="admin-row"><button className="admin-button" onClick={retry}>Try again</button><Link className="admin-link" href="/admin">Admin overview</Link></div>
  </section>;
}
