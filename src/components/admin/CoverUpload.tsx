"use client";
import { useState } from "react";

export default function CoverUpload({ initial }: { initial: string }) {
  const [url, setUrl] = useState(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function upload(file: File) {
    setBusy(true); setError("");
    try {
      const form = new FormData(); form.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed");
      setUrl(result.url);
    } catch (err) { setError(err instanceof Error ? err.message : "Upload failed"); }
    finally { setBusy(false); }
  }
  return <div className="admin-form"><label>Cover image URL<input name="cover_url" value={url} onChange={e => setUrl(e.target.value)} /></label>
    <label className="admin-button" style={{ cursor: "pointer" }}>{busy ? "Uploading…" : "Upload cover image"}<input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) void upload(e.target.files[0]); }} /></label>
    {url && <div role="img" aria-label="Cover preview" style={{ width: 240, aspectRatio: "16/9", background: `center / cover url(${url})` }} />}
    {error && <p role="alert" className="admin-error">{error}</p>}</div>;
}
