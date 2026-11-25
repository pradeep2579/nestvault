import { channels } from "./options";

const MS_HOUR = 3600_000;
const IST_OFFSET = 330 * 60_000;
export const openStages = ["new", "contacted", "tour_scheduled", "tour_completed"];
const isOpen = (stage: string) => openStages.includes(stage);

// ---- phone ----
export const phoneDigits = (phone: string | null | undefined) => (phone || "").replace(/\D/g, "");
export const validPhone = (phone: string | null | undefined) => { const n = phoneDigits(phone).length; return n >= 10 && n <= 15; };
export const phoneKey = (phone: string | null | undefined) => phoneDigits(phone).slice(-10);

// ---- channel attribution ----
const channelRules: { channel: typeof channels[number]; tokens: RegExp }[] = [
  { channel: "Instagram", tokens: /instagram|(^|\b)ig(\b|$)/ },
  { channel: "Facebook", tokens: /facebook|(^|\b)fb(\b|$)|meta/ },
  { channel: "WhatsApp", tokens: /whatsapp|wa\.me|(^|\b)wa(\b|$)/ },
  { channel: "LinkedIn", tokens: /linkedin|lnkd/ },
  { channel: "YouTube", tokens: /youtube|youtu\.be|(^|\b)yt(\b|$)/ },
];

export function deriveChannel(input: { utm_source?: string | null; utm_medium?: string | null; referrer?: string | null; ownHost?: string }) {
  const source = (input.utm_source || "").toLowerCase(), medium = (input.utm_medium || "").toLowerCase();
  let host = "";
  try { host = input.referrer ? new URL(input.referrer).hostname.replace(/^www\./, "").toLowerCase() : ""; } catch { host = ""; }
  if (host && host.endsWith(input.ownHost || "nestvault.in")) host = "";
  const paid = /^(cpc|ppc|paid|paidsearch|paid_search|paid-social|paidsocial)$/.test(medium) || /ads/.test(source);
  if (source.includes("google") || (!source && /(^|\.)google\./.test(host))) return (paid ? "Google Ads" : "Google search") as typeof channels[number];
  for (const rule of channelRules) if (rule.tokens.test(source) || (!source && rule.tokens.test(host))) return rule.channel;
  if (source || host) return "Other website";
  return "Own website";
}

// ---- stage requirements ----
export type StageFacts = { tour_at: string | null; lost_reason: string | null; won_plan: string | null; won_value: number | null };
export function stageRequirement(stage: string, facts: StageFacts): { code: "tour" | "lost" | "won"; message: string } | null {
  if (stage === "tour_scheduled" && !facts.tour_at) return { code: "tour", message: "Set the tour date and time before moving this lead to Tour scheduled." };
  if (stage === "lost" && !facts.lost_reason) return { code: "lost", message: "Choose why this lead was lost before marking it Lost." };
  if (stage === "won" && (!facts.won_plan || !(Number(facts.won_value) > 0))) return { code: "won", message: "Add the plan and monthly value before marking this lead Won." };
  return null;
}

// ---- assignment ----
// Least open leads first; ties go to whoever comes first in the list.
export function pickAssignee(profileIds: string[], openAssignments: (string | null)[]) {
  if (!profileIds.length) return null;
  const load = new Map(profileIds.map(id => [id, 0]));
  for (const id of openAssignments) if (id && load.has(id)) load.set(id, (load.get(id) || 0) + 1);
  return profileIds.reduce((best, id) => (load.get(id)! < load.get(best)! ? id : best), profileIds[0]);
}

// ---- needs attention ----
export const endOfTodayIST = (now: Date) => {
  const shifted = new Date(now.getTime() + IST_OFFSET);
  return new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate(), 23, 59, 59, 999) - IST_OFFSET);
};

export type AttentionLead = { stage: string; created_at: string; assigned_to: string | null;
  follow_up_at: string | null; follow_up_1_outcome: string | null; follow_up_2_at: string | null; follow_up_2_outcome: string | null };

export function attention(lead: AttentionLead, now = new Date()) {
  const open = isOpen(lead.stage);
  const pending = [[lead.follow_up_at, lead.follow_up_1_outcome], [lead.follow_up_2_at, lead.follow_up_2_outcome]]
    .filter(([at, outcome]) => at && !outcome).map(([at]) => new Date(at as string).getTime());
  const endToday = endOfTodayIST(now).getTime();
  return {
    overdue: open && pending.some(t => t < now.getTime()),
    dueToday: open && pending.some(t => t >= now.getTime() && t <= endToday),
    untouched: lead.stage === "new" && now.getTime() - new Date(lead.created_at).getTime() > 24 * MS_HOUR,
    unassigned: open && !lead.assigned_to,
  };
}

export function attentionLabels(lead: AttentionLead, now = new Date()) {
  const a = attention(lead, now);
  return [a.overdue && "Overdue", a.dueToday && "Due today", a.untouched && "Untouched 24h+", a.unassigned && "Unassigned"].filter(Boolean) as string[];
}

// ---- insights ----
export type InsightLead = AttentionLead & { first_contacted_at: string | null; tour_at: string | null; tour_completed_at: string | null;
  channel: string | null; lost_reason: string | null; won_value: number | null };

const median = (values: number[]) => { if (!values.length) return null; const s = [...values].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

export function summarize(leads: InsightLead[], now: Date, assigneeName: (id: string | null) => string) {
  const monthStart = (() => { const shifted = new Date(now.getTime() + IST_OFFSET); return Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), 1) - IST_OFFSET; })();
  const total = leads.length;
  const stageIn = (lead: InsightLead, ...stages: string[]) => stages.includes(lead.stage);
  const contacted = (l: InsightLead) => !!l.first_contacted_at || l.stage !== "new";
  const booked = (l: InsightLead) => !!l.tour_at || !!l.tour_completed_at || stageIn(l, "tour_scheduled", "tour_completed", "won");
  const toured = (l: InsightLead) => !!l.tour_completed_at || stageIn(l, "tour_completed", "won");
  const won = leads.filter(l => l.stage === "won");
  const counts = [total, leads.filter(contacted).length, leads.filter(booked).length, leads.filter(toured).length, won.length];
  const labels = ["Enquiries", "Contacted", "Tour booked", "Tour done", "Won"];
  const flags = leads.map(l => attention(l, now));

  const group = <K extends string>(keyOf: (l: InsightLead) => K) => {
    const map = new Map<K, InsightLead[]>();
    leads.forEach(l => map.set(keyOf(l), [...(map.get(keyOf(l)) || []), l]));
    return map;
  };
  const responseHours = leads.filter(l => l.first_contacted_at).map(l => (new Date(l.first_contacted_at!).getTime() - new Date(l.created_at).getTime()) / MS_HOUR).filter(h => h >= 0);
  const lostMap = new Map<string, number>();
  leads.filter(l => l.stage === "lost").forEach(l => lostMap.set(l.lost_reason || "Not recorded", (lostMap.get(l.lost_reason || "Not recorded") || 0) + 1));

  return {
    total, open: leads.filter(l => isOpen(l.stage)).length, won: won.length, lost: leads.filter(l => l.stage === "lost").length,
    thisMonth: leads.filter(l => new Date(l.created_at).getTime() >= monthStart).length,
    conversion: total ? won.length / total : 0,
    medianResponseHours: median(responseHours),
    overdue: flags.filter(f => f.overdue).length, dueToday: flags.filter(f => f.dueToday).length,
    untouched: flags.filter(f => f.untouched).length, unassigned: flags.filter(f => f.unassigned).length,
    wonMonthlyValue: won.reduce((sum, l) => sum + (Number(l.won_value) || 0), 0),
    funnel: labels.map((label, i) => ({ label, count: counts[i], pct: total ? counts[i] / total : 0 })),
    byChannel: [...group(l => l.channel || "Own website")].map(([channel, items]) => ({ channel, leads: items.length, toured: items.filter(toured).length, won: items.filter(l => l.stage === "won").length }))
      .sort((a, b) => b.leads - a.leads),
    byAssignee: [...group(l => assigneeName(l.assigned_to))].map(([name, items]) => ({ name, leads: items.length, open: items.filter(l => isOpen(l.stage)).length,
      won: items.filter(l => l.stage === "won").length, overdue: items.filter(l => attention(l, now).overdue).length })).sort((a, b) => b.leads - a.leads),
    lostReasons: [...lostMap].map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count),
  };
}
