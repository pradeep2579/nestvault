import { siteUrl } from "./content";

const esc = (value: string) => value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

export type AlertLead = { id: string; name: string; phone: string; email: string; interest: string; move_in: string; budget: string; message: string; channel: string; assignee?: string | null };

// Emails the team when an enquiry arrives. Needs RESEND_API_KEY and LEAD_ALERT_EMAIL; without them it quietly does nothing.
export async function notifyNewLead(lead: AlertLead, repeat = false) {
  const key = process.env.RESEND_API_KEY, to = (process.env.LEAD_ALERT_EMAIL || "").split(",").map(item => item.trim()).filter(Boolean);
  if (!key || !to.length) return false;
  const link = `${siteUrl}/admin/leads/${lead.id}`;
  const digits = lead.phone.replace(/\D/g, "");
  const whatsapp = digits.length >= 10 ? `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}` : "";
  const rows = [["Phone", lead.phone], ["Email", lead.email], ["Interested in", lead.interest], ["Start", lead.move_in], ["Budget", lead.budget], ["Source", lead.channel],
    ["Message", lead.message]].filter(([, value]) => value);
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px"><h2 style="margin:0 0 4px">${repeat ? "Repeat enquiry" : "New enquiry"}: ${esc(lead.name)}</h2>
    <p style="margin:0 0 14px;color:#555">Reply within 30 minutes to win the tour.</p>
    <table style="border-collapse:collapse;width:100%">${rows.map(([label, value]) => `<tr><td style="padding:6px 10px 6px 0;color:#777;vertical-align:top">${label}</td><td style="padding:6px 0">${esc(value)}</td></tr>`).join("")}</table>
    <p style="margin-top:18px"><a href="${link}" style="background:#051650;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Open lead</a>${whatsapp ? ` <a href="${whatsapp}" style="margin-left:8px;color:#1a8a3e">WhatsApp ${esc(lead.name.split(" ")[0])}</a>` : ""}</p></div>`;
  try {
    const response = await fetch("https://api.resend.com/emails", { method: "POST", signal: AbortSignal.timeout(4000),
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.LEAD_ALERT_FROM || "Nest Vault <onboarding@resend.dev>", to,
        subject: `${repeat ? "Repeat enquiry" : "New enquiry"}: ${lead.name}${lead.interest ? ` - ${lead.interest}` : ""}`, html }) });
    return response.ok;
  } catch { return false; }
}
