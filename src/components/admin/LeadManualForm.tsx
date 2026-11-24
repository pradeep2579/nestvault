"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { interests, offlineChannels, moveInOptions, budgetOptions } from "@/lib/options";

export default function LeadManualForm() {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    setBusy(true); setMessage(""); setSaved("");
    try {
      const response = await fetch("/api/admin/leads/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save this lead.");
      setSaved(`${data.name} was added.`);
      form.current?.reset();
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save this lead."); }
    finally { setBusy(false); }
  }

  return <section id="add-lead" className="admin-card admin-import-card admin-manual-card" aria-labelledby="lead-manual-title">
    <div><p className="admin-eyebrow">WALK-INS & CALLS</p><h2 id="lead-manual-title">Add a lead</h2>
      <p>Enter one enquiry by hand. Name and either email or phone are required. Existing contacts are not duplicated.</p></div>
    <form ref={form} onSubmit={submit} className="admin-import-form admin-manual-form">
      <label htmlFor="lead-name">Name *</label><input id="lead-name" name="name" required maxLength={120} autoComplete="off" />
      <label htmlFor="lead-email">Email</label><input id="lead-email" name="email" type="email" maxLength={254} autoComplete="off" />
      <label htmlFor="lead-phone">Phone</label><input id="lead-phone" name="phone" type="tel" maxLength={50} autoComplete="off" />
      <label htmlFor="lead-company">Company</label><input id="lead-company" name="company" maxLength={120} autoComplete="off" />
      <label htmlFor="lead-interest">Interested in</label>
      <select id="lead-interest" name="interest" defaultValue=""><option value="">Not specified</option>{interests.map(item => <option key={item} value={item}>{item}</option>)}</select>
      <label htmlFor="lead-channel">How did they find you?</label>
      <select id="lead-channel" name="channel" defaultValue="Walk-in">{offlineChannels.map(item => <option key={item} value={item}>{item}</option>)}</select>
      <label htmlFor="lead-movein">Wants to start</label>
      <select id="lead-movein" name="move_in" defaultValue=""><option value="">Not specified</option>{moveInOptions.map(item => <option key={item} value={item}>{item}</option>)}</select>
      <label htmlFor="lead-budget">Monthly budget</label>
      <select id="lead-budget" name="budget" defaultValue=""><option value="">Not specified</option>{budgetOptions.map(item => <option key={item} value={item}>{item}</option>)}</select>
      <label htmlFor="lead-message">Notes</label><textarea id="lead-message" name="message" rows={3} maxLength={2000} />
      <button className="admin-button" disabled={busy}>{busy ? "Saving…" : "Add lead"}</button>
    </form>
    {message && <p className="admin-error" role="alert">{message}</p>}
    {saved && <p className="admin-import-result" role="status">{saved}</p>}
  </section>;
}
