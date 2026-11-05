"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Result = { imported: number; skipped: number; rejected: number; errors: { row: number; message: string }[] };

export default function LeadImport() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = input.current?.files?.[0];
    if (!file) { setMessage("Choose a CSV file first."); return; }
    setBusy(true); setMessage(""); setResult(null);
    try {
      const body = new FormData(); body.set("file", file);
      const response = await fetch("/api/admin/leads/import", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Import failed.");
      setResult(data);
      if (data.imported) { input.current!.value = ""; router.refresh(); }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Import failed."); }
    finally { setBusy(false); }
  }

  return <section id="import-leads" className="admin-card admin-import-card" aria-labelledby="lead-import-title">
    <div><p className="admin-eyebrow">OFFLINE ENQUIRIES</p><h2 id="lead-import-title">Import leads</h2>
      <p>Add leads from a spreadsheet. Name and either email or phone are required. Existing contacts are skipped.</p>
      <a className="admin-link" href="/leads-import-template.csv" download>Download CSV template</a></div>
    <form onSubmit={submit} className="admin-import-form">
      <label htmlFor="lead-csv">CSV file (up to 500 rows, 1 MB)</label>
      <input ref={input} id="lead-csv" name="file" type="file" accept=".csv,text/csv" required />
      <button className="admin-button" disabled={busy}>{busy ? "Importing…" : "Import CSV"}</button>
    </form>
    {message && <p className="admin-error" role="alert">{message}</p>}
    {result && <div className="admin-import-result" role="status"><strong>{result.imported} added · {result.skipped} duplicates skipped · {result.rejected} rejected</strong>
      {result.errors.length > 0 && <ul>{result.errors.map(error => <li key={error.row}>Row {error.row}: {error.message}</li>)}</ul>}
    </div>}
  </section>;
}
