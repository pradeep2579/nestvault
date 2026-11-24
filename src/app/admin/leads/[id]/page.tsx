import Link from "next/link";
import { notFound } from "next/navigation";
import { istDateTime } from "@/lib/format";
import { db } from "@/lib/supabase";
import { stages, followUpOutcomes, lostReasons, plans, interests, channels, moveInOptions, budgetOptions } from "@/lib/content";
import { addNote, updateLead, updateLeadDetails } from "../actions";
import { emailUrl, followUpMessage, whatsappUrl } from "@/lib/follow-up-messages";
import { attentionLabels } from "@/lib/crm";
import DeleteLeadButton from "@/components/admin/DeleteLeadButton";
import MergeLeadButton from "@/components/admin/MergeLeadButton";
import SubmitButton from "@/components/admin/SubmitButton";
import { requirePageActor } from "@/lib/admin-page";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; merged?: string; error?: string; detail?: string }> };
const inputDate = (value: string | null) => value ? new Date(new Date(value).getTime() + 330 * 60000).toISOString().slice(0,16) : "";
const needs: Record<string, string> = {
  need_tour: "Set the tour date and time below before moving this lead to Tour scheduled.",
  need_lost: "Choose why this lead was lost before marking it Lost.",
  need_won: "Add the plan and monthly value before marking this lead Won.",
};
const withCurrent = (list: readonly string[], value: string | null | undefined) => value && !list.includes(value) ? [value, ...list] : list;
const hoursBetween = (from: string, to: string) => { const h = (new Date(to).getTime() - new Date(from).getTime()) / 3600_000; return h < 1 ? `${Math.max(1, Math.round(h * 60))} min` : h < 48 ? `${h.toFixed(1)} hrs` : `${Math.round(h / 24)} days`; };

export default async function LeadDetail({ params, searchParams }: Props) {
  const current = await requirePageActor();
  const { id } = await params;
  const client = db();
  const [{ data: lead, error: leadError }, { data: notes, error: notesError }, { data: staff, error: staffError }, { data: activity, error: activityError }] = await Promise.all([
    client.from("leads").select("*").eq("id", id).maybeSingle(),
    client.from("lead_notes").select("body,created_at,author_id").eq("lead_id", id).order("created_at", { ascending: false }),
    client.from("profiles").select("id,email").order("email"),
    client.from("lead_activity").select("kind,detail,created_at,actor_id").eq("lead_id", id).order("created_at", { ascending: false }).limit(100),
  ]);
  if (leadError || notesError || staffError || activityError) throw new Error("Could not load lead details. Please refresh.");
  if (!lead) notFound();

  // Possible duplicates: same email, or the same phone number written differently.
  const lookups = [];
  const select = "id,name,email,phone,stage,created_at";
  if (lead.email) lookups.push(client.from("leads").select(select).neq("id", id).eq("email", lead.email).limit(5));
  if (lead.phone_key && lead.phone_key.length >= 10) lookups.push(client.from("leads").select(select).neq("id", id).eq("phone_key", lead.phone_key).limit(5));
  const dupes = [...new Map((await Promise.all(lookups)).flatMap(result => result.data || []).map(row => [row.id, row])).values()];

  const query = await searchParams;
  const who = (userId: string | null) => userId ? (staff?.find(person => person.id === userId)?.email || "Team member") : "System";
  const timeline = [...(activity || []).map(item => ({ at: item.created_at as string, text: item.detail as string, by: who(item.actor_id), note: false })),
    ...(notes || []).map(item => ({ at: item.created_at as string, text: item.body as string, by: item.author_id ? who(item.author_id) : "Website", note: true }))]
    .sort((a, b) => b.at.localeCompare(a.at));
  const flags = attentionLabels(lead);
  const source = [lead.channel, lead.utm_campaign && `campaign: ${lead.utm_campaign}`].filter(Boolean).join(" · ") || (lead.source === "offline" ? "Offline" : "Website");

  return <><div className="admin-row"><Link className="admin-link" href="/admin/leads">← Leads</Link></div><div className="admin-page-heading"><p className="admin-eyebrow">ENQUIRY DETAILS</p>
    <h1>{lead.name}{lead.is_test && <span className="crm-flag crm-flag--amber" style={{ marginLeft: 12, verticalAlign: "middle" }}>Test lead</span>}</h1><p>Review the conversation and plan the next step.</p>
    {flags.length > 0 && <div className="crm-flags">{flags.map(flag => <span key={flag} className={`crm-flag crm-flag--${flag === "Overdue" ? "red" : "amber"}`}>{flag}</span>)}</div>}</div>
    {query.saved && <p className="admin-success">{query.merged ? "Merged. The duplicate was removed." : "Saved."}</p>}
    {query.error === "details" && <p className="admin-error" role="alert">{query.detail || "Check the details and try again."}</p>}
    {query.error === "date" && <p className="admin-error">Enter a valid follow-up and tour time in India time.</p>}
    {query.error && needs[query.error] && <p className="admin-error" role="alert">{needs[query.error]}</p>}
    <div className="admin-grid" style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)" }}>
      <div style={{ display: "grid", gap: "1.5rem", alignContent: "start" }}>
      <section className="admin-card"><h2>Lead details</h2><p><strong>Email:</strong> {lead.email ? <a href={`mailto:${lead.email}`}>{lead.email}</a> : "—"}</p>
      <p><strong>Phone:</strong> {lead.phone ? <a href={`tel:${lead.phone}`}>{lead.phone}</a> : "—"}</p>
      <p><strong>Company:</strong> {lead.company || "—"}</p><p><strong>Interest:</strong> {lead.interest || "—"}</p>
      <p><strong>Team size:</strong> {lead.team_size || "—"}</p><p><strong>Wants to start:</strong> {lead.move_in || "—"}</p><p><strong>Budget:</strong> {lead.budget || "—"}</p>
      <p><strong>Message:</strong> {lead.message || "—"}</p>
      <p><strong>Source:</strong> {source}</p>
      <p><strong>Received:</strong> {istDateTime(lead.created_at)}</p>
      {lead.first_contacted_at && <p><strong>First contacted:</strong> {istDateTime(lead.first_contacted_at)} ({hoursBetween(lead.created_at, lead.first_contacted_at)} after enquiry)</p>}
      {lead.tour_completed_at && <p><strong>Tour completed:</strong> {istDateTime(lead.tour_completed_at)}</p>}
      <details className="admin-edit-details" open={query.error === "details"}><summary className="admin-link">Edit details</summary>
        <form action={updateLeadDetails} className="admin-form"><input type="hidden" name="id" value={id} />
          <label>Name<input name="name" defaultValue={lead.name} required maxLength={120} /></label>
          <label>Email<input name="email" type="email" defaultValue={lead.email || ""} maxLength={254} /></label>
          <label>Phone<input name="phone" type="tel" defaultValue={lead.phone || ""} maxLength={50} /></label>
          <label>Company<input name="company" defaultValue={lead.company || ""} maxLength={120} /></label>
          <label>Interest<select name="interest" defaultValue={lead.interest || ""}><option value="">Not specified</option>
            {withCurrent(interests, lead.interest).map(item => <option key={item} value={item}>{item}</option>)}</select></label>
          <label>Team size<input name="team_size" defaultValue={lead.team_size || ""} maxLength={50} /></label>
          <label>Wants to start<select name="move_in" defaultValue={lead.move_in || ""}><option value="">Not specified</option>{moveInOptions.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
          <label>Monthly budget<select name="budget" defaultValue={lead.budget || ""}><option value="">Not specified</option>{budgetOptions.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
          <label>Source<select name="channel" defaultValue={lead.channel || ""}><option value="">Not specified</option>{channels.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
          <label>Message<textarea name="message" defaultValue={lead.message || ""} rows={3} maxLength={2000} /></label>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" name="is_test" defaultChecked={lead.is_test} style={{ width: "auto" }} /> Test lead (hide from lists and reports)</label>
          <SubmitButton>Save details</SubmitButton></form></details>
      {current.role === "owner" && <DeleteLeadButton id={id} name={lead.name} />}</section>

      {dupes.length > 0 && <section className="admin-card"><h2>Possible duplicates</h2><p className="crm-hint">Same email or phone number as this lead. Merging keeps this lead and moves their notes and history over.</p>
        <ul className="crm-list crm-dupes">{dupes.map(item => <li key={item.id}><div><Link className="admin-link" href={`/admin/leads/${item.id}`}>{item.name}</Link><br />
          <small>{item.email || "—"} · {item.phone || "—"} · {item.stage.replaceAll("_", " ")}</small></div><MergeLeadButton id={id} duplicateId={item.id} name={item.name} /></li>)}</ul></section>}
      </div>

      <section className="admin-card"><h2>Pipeline & tour</h2><form action={updateLead} className="admin-form">
        <input type="hidden" name="id" value={id} />
        <label>Stage<select name="stage" defaultValue={lead.stage}>{stages.map(s => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select></label>
        <label>Assigned to<select name="assigned_to" defaultValue={lead.assigned_to || ""}><option value="">Unassigned</option>{(staff || []).map(s => <option key={s.id} value={s.id}>{s.email}</option>)}</select></label>
        {([1, 2] as const).map(n => { const at = n === 1 ? lead.follow_up_at : lead.follow_up_2_at;
          return <fieldset key={n} className="admin-form crm-fieldset"><legend>Follow-up {n}</legend>
            <label>Date & time (India time)<input type="datetime-local" name={n === 1 ? "follow_up_at" : "follow_up_2_at"} defaultValue={inputDate(at)} /></label>
            <label>What the lead did<select name={`follow_up_${n}_outcome`} defaultValue={lead[`follow_up_${n}_outcome`] || ""}><option value="">Not yet followed up</option>
              {followUpOutcomes.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
            {(() => { const text = followUpMessage(n, lead); const wa = whatsappUrl(lead.phone, text); const mail = emailUrl(lead.email, n, text);
              return <div><div className="admin-row">{wa && <a className="admin-button admin-button-outline" href={wa} target="_blank" rel="noopener noreferrer">Send on WhatsApp</a>}
                {mail && <a className="admin-button admin-button-outline" href={mail}>Send email</a>}</div>
                {!wa && !mail && <small>Add a phone number or email to send a message.</small>}
                <details><summary className="admin-link">Preview message</summary><p style={{ whiteSpace: "pre-line" }}>{text}</p></details></div>; })()}
            <label>Note<input name={`follow_up_${n}_note`} defaultValue={lead[`follow_up_${n}_note`] || ""} maxLength={500} placeholder="e.g. Wants a tour on Saturday" /></label></fieldset>; })}
        <label>Tour time (India time)<input type="datetime-local" name="tour_at" defaultValue={inputDate(lead.tour_at)} /></label>
        <p className="crm-hint">Required for Tour scheduled.</p>
        <fieldset className="admin-form crm-fieldset"><legend>If lost</legend>
          <label>Why was this lead lost?<select name="lost_reason" defaultValue={lead.lost_reason || ""}><option value="">Choose a reason</option>
            {withCurrent(lostReasons, lead.lost_reason).map(item => <option key={item} value={item}>{item}</option>)}</select></label>
          <p className="crm-hint">Required when the stage is Lost.</p></fieldset>
        <fieldset className="admin-form crm-fieldset"><legend>If won</legend>
          <label>Plan taken<select name="won_plan" defaultValue={lead.won_plan || ""}><option value="">Choose a plan</option>{plans.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
          <label>Monthly value (₹)<input type="number" name="won_value" min="0" step="1" inputMode="numeric" defaultValue={lead.won_value ?? ""} /></label>
          <label>Seats<input type="number" name="won_seats" min="1" step="1" inputMode="numeric" defaultValue={lead.won_seats ?? ""} /></label>
          <label>Start date<input type="date" name="won_start_date" defaultValue={lead.won_start_date || ""} /></label>
          <p className="crm-hint">Plan and monthly value are required when the stage is Won.</p></fieldset>
        <SubmitButton>Save lead</SubmitButton>
      </form></section>
    </div><section className="admin-card" style={{ marginTop: "1.5rem" }}><h2>Notes & activity</h2>
      <form action={addNote} className="admin-form"><input type="hidden" name="lead_id" value={id} /><label>Add note<textarea name="body" required maxLength={2000} /></label><SubmitButton pendingLabel="Adding…">Add note</SubmitButton></form>
      {timeline.length ? <ul className="crm-timeline">{timeline.map((item, i) => <li key={i}><time>{istDateTime(item.at)}</time><div>{item.note && <strong>Note: </strong>}{item.text}<small>{item.by}</small></div></li>)}</ul>
        : <p className="crm-muted" style={{ marginTop: "1rem" }}>Nothing yet. Stage changes, follow-ups and notes will appear here.</p>}
    </section></>;
}
