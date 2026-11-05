import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/supabase";
import { stages } from "@/lib/content";
import { addNote, updateLead } from "../actions";
import { requirePageActor } from "@/lib/admin-page";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> };
const inputDate = (value: string | null) => value ? new Date(new Date(value).getTime() + 330 * 60000).toISOString().slice(0,16) : "";

export default async function LeadDetail({ params, searchParams }: Props) {
  await requirePageActor();
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
    {query.error === "date" && <p className="admin-error">Enter a valid follow-up and tour time in India time.</p>}
    <div className="admin-grid" style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)" }}>
      <section className="admin-card"><h2>Lead details</h2><p><strong>Email:</strong> {lead.email ? <a href={`mailto:${lead.email}`}>{lead.email}</a> : "—"}</p>
      <p><strong>Phone:</strong> {lead.phone ? <a href={`tel:${lead.phone}`}>{lead.phone}</a> : "—"}</p>
      <p><strong>Company:</strong> {lead.company || "—"}</p><p><strong>Interest:</strong> {lead.interest || "—"}</p>
      <p><strong>Team size:</strong> {lead.team_size || "—"}</p><p><strong>Message:</strong> {lead.message || "—"}</p>
      <p><strong>Source:</strong> {lead.source === "offline" ? "Offline import" : "Website"}</p>
      <p><strong>Received:</strong> {new Date(lead.created_at).toLocaleString("en-IN")}</p></section>
      <section className="admin-card"><h2>Pipeline & tour</h2><form action={updateLead} className="admin-form">
        <input type="hidden" name="id" value={id} />
        <label>Stage<select name="stage" defaultValue={lead.stage}>{stages.map(s => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select></label>
        <label>Assigned to<select name="assigned_to" defaultValue={lead.assigned_to || ""}><option value="">Unassigned</option>{(staff || []).map(s => <option key={s.id} value={s.id}>{s.email}</option>)}</select></label>
        <label>Follow up (India time)<input type="datetime-local" name="follow_up_at" defaultValue={inputDate(lead.follow_up_at)} /></label>
        <label>Tour time (India time)<input type="datetime-local" name="tour_at" defaultValue={inputDate(lead.tour_at)} /></label><button>Save lead</button>
      </form></section>
    </div><section className="admin-card" style={{ marginTop: "1.5rem" }}><h2>Notes</h2>
      <form action={addNote} className="admin-form"><input type="hidden" name="lead_id" value={id} /><label>Add note<textarea name="body" required maxLength={2000} /></label><button>Add note</button></form>
      {(notes || []).map((note, i) => <div key={i} style={{ borderTop: "1px solid #e4e9f0", marginTop: "1rem", paddingTop: "1rem" }}><p>{note.body}</p><small>{new Date(note.created_at).toLocaleString("en-IN")}</small></div>)}
    </section></>;
}
