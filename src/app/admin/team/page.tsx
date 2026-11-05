import { db } from "@/lib/supabase";
import { requirePageActor } from "@/lib/admin-page";
import { inviteTeamMember, updateTeamMember } from "./actions";
type Props = { searchParams: Promise<{ sent?: string; updated?: string; error?: string }> };
export default async function Team({ searchParams }: Props) {
  const current = await requirePageActor(true);
  const [{ data: members, error: membersError }, query] = await Promise.all([db().from("profiles").select("id,email,role,active,created_at").order("created_at"), searchParams]);
  if (membersError) throw new Error("Could not load team members. Please refresh.");
  return <><div className="admin-page-heading"><p className="admin-eyebrow">PEOPLE & PERMISSIONS</p><h1>Team access</h1><p>Invite teammates and choose who can manage leads, content, and settings.</p></div>{query.sent && <p className="admin-success">Invitation sent.</p>}
    {query.updated && <p className="admin-success">Team access updated.</p>}
    {query.error && <p className="admin-error">Could not update team access ({query.error}). Check the details and try again.</p>}
    <section className="admin-card"><h2>Invite a teammate</h2><form action={inviteTeamMember} className="admin-form">
      <label>Email<input name="email" type="email" required /></label><label>Role<select name="role"><option value="staff">Staff — leads and drafts</option><option value="owner">Owner — all settings and publishing</option></select></label><button>Send invitation</button>
    </form></section><section className="admin-card" style={{ marginTop: "1.5rem" }}><h2>Team members</h2>
      <table className="admin-table"><thead><tr><th>Email</th><th>Access</th><th>Added</th></tr></thead><tbody>{(members || []).map(member => <tr key={member.id}><td>{member.email}{member.id === current.id && " (you)"}</td>
        <td>{member.id === current.id ? `${member.role} · active` : <form action={updateTeamMember} className="admin-row" style={{ margin: 0 }}><input type="hidden" name="id" value={member.id} />
          <select name="role" defaultValue={member.role}><option value="staff">Staff</option><option value="owner">Owner</option></select>
          <label><input type="checkbox" name="active" defaultChecked={member.active} /> Active</label><button className="admin-button">Save</button></form>}</td>
        <td>{new Date(member.created_at).toLocaleDateString("en-IN")}</td></tr>)}</tbody></table>
    </section></>;
}
