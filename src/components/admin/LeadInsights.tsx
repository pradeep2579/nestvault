import Link from "next/link";
import type { summarize } from "@/lib/crm";

type Summary = ReturnType<typeof summarize>;
const percent = (value: number) => `${Math.round(value * 100)}%`;
const hours = (value: number | null) => value === null ? "—" : value < 1 ? `${Math.max(1, Math.round(value * 60))} min` : `${value.toFixed(1)} hrs`;
const rupees = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`;

export default function LeadInsights({ s }: { s: Summary }) {
  const top = s.funnel[0]?.count || 0;
  return <div className="crm-insights">
    <div className="crm-cards">
      <div className="admin-card crm-card"><span>Enquiries</span><strong>{s.total}</strong><small>{s.thisMonth} this month</small></div>
      <div className="admin-card crm-card"><span>Conversion</span><strong>{percent(s.conversion)}</strong><small>{s.won} won of {s.total}</small></div>
      <div className="admin-card crm-card"><span>Typical first response</span><strong>{hours(s.medianResponseHours)}</strong><small>Aim for under 30 min</small></div>
      <div className="admin-card crm-card"><span>Won monthly value</span><strong>{rupees(s.wonMonthlyValue)}</strong><small>Across {s.won} won deals</small></div>
    </div>
    <div className="crm-cards">
      <Link href="/admin/leads?filter=due" className={`admin-card crm-card${s.overdue ? " is-alert" : ""}`}><span>Overdue follow-ups</span><strong>{s.overdue}</strong><small>{s.dueToday} more due today</small></Link>
      <Link href="/admin/leads?filter=untouched" className={`admin-card crm-card${s.untouched ? " is-alert" : ""}`}><span>Untouched 24h+</span><strong>{s.untouched}</strong><small>New and not contacted</small></Link>
      <Link href="/admin/leads?filter=unassigned" className={`admin-card crm-card${s.unassigned ? " is-alert" : ""}`}><span>Unassigned</span><strong>{s.unassigned}</strong><small>Open leads with no owner</small></Link>
      <div className="admin-card crm-card"><span>Open pipeline</span><strong>{s.open}</strong><small>{s.lost} lost</small></div>
    </div>

    <section className="admin-card"><h2>Enquiry funnel</h2><p className="crm-muted">How far each enquiry got. A lead that moved on is still counted at the earlier steps.</p>
      {s.funnel.map(step => <div className="crm-funnel-row" key={step.label}><span>{step.label}</span>
        <div className="crm-bar" role="img" aria-label={`${step.label}: ${step.count}`}><i style={{ width: `${top ? Math.max(2, step.pct * 100) : 0}%` }} /></div>
        <strong>{step.count}</strong><small>{percent(step.pct)}</small></div>)}
    </section>

    <div className="crm-two">
      <section className="admin-card"><h2>By source</h2><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Channel</th><th>Leads</th><th>Toured</th><th>Won</th></tr></thead><tbody>
        {s.byChannel.map(row => <tr key={row.channel}><td>{row.channel}</td><td>{row.leads}</td><td>{row.toured}</td><td>{row.won}</td></tr>)}
      </tbody></table></div></section>
      <section className="admin-card"><h2>By team member</h2><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Owner</th><th>Leads</th><th>Open</th><th>Won</th><th>Overdue</th></tr></thead><tbody>
        {s.byAssignee.map(row => <tr key={row.name}><td>{row.name}</td><td>{row.leads}</td><td>{row.open}</td><td>{row.won}</td><td>{row.overdue || "—"}</td></tr>)}
      </tbody></table></div></section>
    </div>

    <section className="admin-card"><h2>Why leads are lost</h2>
      {s.lostReasons.length ? <ul className="crm-list">{s.lostReasons.map(item => <li key={item.reason}><span>{item.reason}</span><strong>{item.count}</strong></li>)}</ul>
        : <p className="crm-muted">No lost leads yet.</p>}
    </section>
  </div>;
}
