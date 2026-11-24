import { istDate, istDateTime } from "@/lib/format";
import { db } from "@/lib/supabase";
import { requirePageActor } from "@/lib/admin-page";
import { openStages } from "@/lib/crm";
import { inviteTeamMember, resendInvite, updateTeamMember } from "./actions";
import SubmitButton from "@/components/admin/SubmitButton";

type Props = { searchParams: Promise<{ sent?: string; updated?: string; released?: string; error?: string }> };
const errors: Record<string, string> = { invalid: "Check the details and try again.", invite: "The invitation could not be sent. Check the email address.",
  profile: "The invitation went out but the profile could not be saved. Try again.", resend: "The invitation could not be re-sent. Try again.", update: "The change could not be saved." };

export default async function Team({ searchParams }: Props) {
  const current = await requirePageActor(true);
  const client = db();
  const [{ data: members, error: membersError }, { data: openLeads }, users, query] = await Promise.all([
    client.from("profiles").select("id,email,role,active,created_at").order("created_at"),
    client.from("leads").select("assigned_to").in("stage", openStages).not("assigned_to", "is", null),
    client.auth.admin.listUsers({ page: 1, perPage: 200 }).catch(() => null), searchParams]);
  if (membersError) throw new Error("Could not load team members. Please refresh.");
  const accounts = new Map((users?.data?.users || []).map(user => [user.id, user]));
  const load = (id: string) => (openLeads || []).filter(lead => lead.assigned_to === id).length;
  return <><div className="admin-page-heading"><p className="admin-eyebrow">PEOPLE & PERMISSIONS</p><h1>Team access</h1><p>Invite teammates and choose who can manage leads, content, and settings.</p></div>
    {query.sent && <p className="admin-success">Invitation sent.</p>}
    {query.updated && <p className="admin-success">Team access updated.{query.released ? ` ${query.released} open lead${query.released === "1" ? " was" : "s were"} unassigned so ${query.released === "1" ? "it" : "they"} can be picked up.` : ""}</p>}
    {query.error && <p className="admin-error" role="alert">{errors[query.error] || "Something went wrong."}</p>}
    <section className="admin-card"><h2>Invite a teammate</h2><form action={inviteTeamMember} className="admin-form">
      <label>Email<input name="email" type="email" required /></label><label>Role<select name="role"><option value="staff">Staff — leads and drafts</option><option value="owner">Owner — all settings and publishing</option></select></label><SubmitButton pendingLabel="Sending…">Send invitation</SubmitButton>
    </form></section><section className="admin-card" style={{ marginTop: "1.5rem" }}><h2>Team members</h2>
      <div className="admin-table-scroll" role="region" aria-label="Team members table" tabIndex={0}><table className="admin-table"><thead><tr><th>Email</th><th>Status</th><th>Last sign-in</th><th>Open leads</th><th>Access</th><th>Added</th></tr></thead><tbody>{(members || []).map(member => {
        const account = accounts.get(member.id); const accepted = !!(account?.email_confirmed_at || account?.last_sign_in_at);
        return <tr key={member.id}><td>{member.email}{member.id === current.id ? " (you)" : ""}</td>
          <td>{!member.active ? <span className="crm-pill">Deactivated</span> : accepted || !account ? <span className="crm-pill is-good">Active</span>
            : <><span className="crm-pill">Invite not accepted</span><form action={resendInvite} style={{ marginTop: 6 }}><input type="hidden" name="email" value={member.email} /><SubmitButton className="admin-button admin-button-outline" pendingLabel="Sending…">Resend invite</SubmitButton></form></>}</td>
          <td>{account?.last_sign_in_at ? istDateTime(account.last_sign_in_at) : "Never"}</td><td>{load(member.id) || "—"}</td>
          <td>{member.id === current.id ? `${member.role} · active` : <form action={updateTeamMember} className="admin-row" style={{ margin: 0 }}><input type="hidden" name="id" value={member.id} />
            <select name="role" defaultValue={member.role}><option value="staff">Staff</option><option value="owner">Owner</option></select>
            <label><input type="checkbox" name="active" defaultChecked={member.active} /> Active</label><SubmitButton className="admin-button">Save</SubmitButton></form>}</td>
          <td>{istDate(member.created_at)}</td></tr>; })}</tbody></table></div>
      <p className="crm-hint" style={{ marginTop: 12 }}>Deactivating someone signs them out of the admin and unassigns their open leads.</p>
    </section></>;
}
