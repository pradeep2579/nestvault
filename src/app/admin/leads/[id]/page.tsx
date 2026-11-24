import Link from "next/link";
import { notFound } from "next/navigation";
import { istDateTime } from "@/lib/format";
import { db } from "@/lib/supabase";
import { stages, followUpOutcomes } from "@/lib/content";
import { addNote, updateLead, updateLeadDetails } from "../actions";
import { emailUrl, followUpMessage, whatsappUrl } from "@/lib/follow-up-messages";
import DeleteLeadButton from "@/components/admin/DeleteLeadButton";
import { requirePageActor } from "@/lib/admin-page";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; notice?: string; error?: string; detail?: string }> };
const interests = ["Hot Desk (Day Pass)", "Dedicated Desk", "Private Cabin", "Meeting Room", "Virtual Office", "Event Space", "Just exploring"];
const inputDate = (value: string | null) => value ? new Date(new Date(value).getTime() + 330 * 60000).toISOString().slice(0,16) : "";

export default async function LeadDetail({ params, searchParams }: Props) {
  const current = await requirePageActor();
  const { id } = await params;
  const client = db();
  const [{ data: lead, error: leadError }, { data: notes, error: notesError }, { data: staff, error: staffError }] = await Promise.all([
    client.from("leads").select("*").eq("id", id).maybeSingle(),
    client.from("lead_notes").select("body,created_at,author_id").eq("lead_id", id).order("created_at", { ascending: false }),
    client.from("profiles").select("id,email").order("email"),
  ]);
  if (leadError || notesError || staffError) throw new Error("Could not load lead details. Please refresh.");
  if (!lead) notFound();
  const query = await searchParams;
  return <><div className="admin-row"><Link className="admin-link" href="/admin/leads">← Leads</Link></div><div className="admin-page-heading"><p className="admin-eyebrow">ENQUIRY DETAILS</p><h1>{lead.name}</h1><p>Review the conversation and plan the next step.</p></div>
    {query.saved && <p className="admin-success">Saved.</p>}
    {query.notice === "migration" && <p className="admin-error" role="alert">Stage, tour and follow-up 1 date were saved, but follow-up outcomes, notes and Follow-up 2 need a one-time database update first. Ask your developer to run the follow-up migration.</p>}
    {query.error === "details" && <p className="admin-error" role="alert">{query.detail || "Check the details and try again."}</p>}
    {query.error === "date" && <p className="admin-error">Enter a valid follow-up and tour time in India time.</p>}
    <div className="admin-grid" style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)" }}>
      <section className="admin-card"><h2>Lead details</h2><p><strong>Email:</strong> {lead.email ? <a href={`mailto:${lead.email}`}>{lead.email}</a> : "—"}</p>
      <p><strong>Phone:</strong> {lead.phone ? <a href={`tel:${lead.phone}`}>{lead.phone}</a> : "—"}</p>
      <p><strong>Company:</strong> {lead.company || "—"}</p><p><strong>Interest:</strong> {lead.interest || "—"}</p>
      <p><strong>Team size:</strong> {lead.team_size || "—"}</p><p><strong>Message:</strong> {lead.message || "—"}</p>
      <p><strong>Source:</strong> {lead.source === "offline" ? "Offline import" : "Website"}</p>
      <p><strong>Received:</strong> {istDateTime(lead.created_at)}</p>
      <details className="admin-edit-details" open={query.error === "details"}><summary className="admin-link">Edit details</summary>
        <form action={updateLeadDetails} className="admin-form"><input type="hidden" name="id" value={id} />
          <label>Name<input name="name" defaultValue={lead.name} required maxLength={120} /></label>
          <label>Email<input name="email" type="email" defaultValue={lead.email || ""} maxLength={254} /></label>
          <label>Phone<input name="phone" type="tel" defaultValue={lead.phone || ""} maxLength={50} /></label>
          <label>Company<input name="company" defaultValue={lead.company || ""} maxLength={120} /></label>
          <label>Interest<select name="interest" defaultValue={lead.interest || ""}><option value="">Not specified</option>
            {lead.interest && !interests.includes(lead.interest) && <option value={lead.interest}>{lead.interest}</option>}
            {interests.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
          <label>Team size<input name="team_size" defaultValue={lead.team_size || ""} maxLength={50} /></label>
          <label>Message<textarea name="message" defaultValue={lead.message || ""} rows={3} maxLength={2000} /></label>
          <button>Save details</button></form></details>
      {current.role === "owner" && <DeleteLeadButton id={id} name={lead.name} />}</section>
      <section className="admin-card"><h2>Pipeline & tour</h2><form action={updateLead} className="admin-form">
        <input type="hidden" name="id" value={id} />
        <label>Stage<select name="stage" defaultValue={lead.stage}>{stages.map(s => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select></label>
        <label>Assigned to<select name="assigned_to" defaultValue={lead.assigned_to || ""}><option value="">Unassigned</option>{(staff || []).map(s => <option key={s.id} value={s.id}>{s.email}</option>)}</select></label>
        {([1, 2] as const).map(n => { const at = n === 1 ? lead.follow_up_at : lead.follow_up_2_at;
          return <fieldset key={n} className="admin-form" style={{ border: "1px solid #e4e9f0", borderRadius: 8, padding: "0.75rem" }}><legend>Follow-up {n}</legend>
            <label>Date & time (India time)<input type="datetime-local" name={n === 1 ? "follow_up_at" : "follow_up_2_at"} defaultValue={inputDate(at)} /></label>
            <label>What the lead did<select name={`follow_up_${n}_outcome`} defaultValue={lead[`follow_up_${n}_outcome`] || ""}><option value="">Not yet followed up</option>
              {followUpOutcomes.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
            {(() => { const text = followUpMessage(n, lead); const wa = whatsappUrl(lead.phone, text); const mail = emailUrl(lead.email, n, text);
              return <div><div className="admin-row">{wa && <a className="admin-button admin-button-outline" href={wa} target="_blank" rel="noopener noreferrer">Send on WhatsApp</a>}
                {mail && <a className="admin-button admin-button-outline" href={mail}>Send email</a>}</div>
                {!wa && !mail && <small>Add a phone number or email to send a message.</small>}
                <details><summary className="admin-link">Preview message</summary><p style={{ whiteSpace: "pre-line" }}>{text}</p></details></div>; })()}
            <label>Note<input name={`follow_up_${n}_note`} defaultValue={lead[`follow_up_${n}_note`] || ""} maxLength={500} placeholder="e.g. Wants a tour on Saturday" /></label></fieldset>; })}
        <label>Tour time (India time)<input type="datetime-local" name="tour_at" defaultValue={inputDate(lead.tour_at)} /></label><button>Save lead</button>
      </form></section>
    </div><section className="admin-card" style={{ marginTop: "1.5rem" }}><h2>Notes</h2>
      <form action={addNote} className="admin-form"><input type="hidden" name="lead_id" value={id} /><label>Add note<textarea name="body" required maxLength={2000} /></label><button>Add note</button></form>
      {(notes || []).map((note, i) => <div key={i} style={{ borderTop: "1px solid #e4e9f0", marginTop: "1rem", paddingTop: "1rem" }}><p>{note.body}</p><small>{istDateTime(note.created_at)}</small></div>)}
    </section></>;
}
