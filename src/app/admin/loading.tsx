export default function Loading() {
  return <div className="admin-loading" role="status" aria-live="polite">
    <div className="admin-loading-bar" /><div className="admin-loading-title" /><div className="admin-loading-line" /><div className="admin-loading-card" />
    <span className="admin-sr-only">Loading…</span>
  </div>;
}
