import { describe, expect, it } from "vitest";
import { attention, attentionLabels, deriveChannel, endOfTodayIST, pickAssignee, stageRequirement, summarize, validPhone, phoneKey, type InsightLead } from "../src/lib/crm";
import { channels } from "../src/lib/content";

const now = new Date("2026-11-24T10:00:00Z"); // 15:30 IST
const base: InsightLead = { stage: "new", created_at: "2026-11-24T09:00:00Z", assigned_to: "a", follow_up_at: null, follow_up_1_outcome: null, follow_up_2_at: null,
  follow_up_2_outcome: null, first_contacted_at: null, tour_at: null, tour_completed_at: null, channel: "Website", lost_reason: null, won_value: null };

describe("phone helpers", () => {
  it("validates length and matches the same number written differently", () => {
    expect(validPhone("+91 98765 43210")).toBe(true);
    expect(validPhone("12345")).toBe(false);
    expect(phoneKey("+91 98765 43210")).toBe(phoneKey("9876543210"));
  });
});

describe("deriveChannel", () => {
  it("reads UTM first, then referrer, and always returns a known channel", () => {
    expect(deriveChannel({ utm_source: "instagram" })).toBe("Instagram");
    expect(deriveChannel({ utm_source: "google", utm_medium: "cpc" })).toBe("Google Ads");
    expect(deriveChannel({ referrer: "https://www.google.com/" })).toBe("Google search");
    expect(deriveChannel({ referrer: "https://l.facebook.com/x" })).toBe("Facebook");
    expect(deriveChannel({ referrer: "https://blog.example.com/post" })).toBe("Other website");
    expect(deriveChannel({ referrer: "https://nestvault.in/blog" })).toBe("Website");
    expect(deriveChannel({})).toBe("Website");
    for (const input of [{ utm_source: "x" }, { referrer: "https://t.co" }, {}]) expect(channels).toContain(deriveChannel(input));
  });
});

describe("stageRequirement", () => {
  const facts = { tour_at: null, lost_reason: null, won_plan: null, won_value: null };
  it("demands the right detail for tour, lost and won", () => {
    expect(stageRequirement("tour_scheduled", facts)?.code).toBe("tour");
    expect(stageRequirement("lost", facts)?.code).toBe("lost");
    expect(stageRequirement("won", { ...facts, won_plan: "Private Cabin" })?.code).toBe("won");
    expect(stageRequirement("won", { ...facts, won_plan: "Private Cabin", won_value: 12000 })).toBeNull();
    expect(stageRequirement("contacted", facts)).toBeNull();
  });
});

describe("pickAssignee", () => {
  it("picks the least loaded person", () => {
    expect(pickAssignee(["a", "b", "c"], ["a", "a", "b", null])).toBe("c");
    expect(pickAssignee(["a", "b"], [])).toBe("a");
    expect(pickAssignee([], ["a"])).toBeNull();
  });
});

describe("attention", () => {
  it("flags overdue, due today, untouched and unassigned, and ignores closed leads", () => {
    expect(endOfTodayIST(now).toISOString()).toBe("2026-11-24T18:29:59.999Z");
    expect(attention({ ...base, follow_up_at: "2026-11-23T05:00:00Z" }, now).overdue).toBe(true);
    expect(attention({ ...base, follow_up_at: "2026-11-24T12:00:00Z" }, now).dueToday).toBe(true);
    expect(attention({ ...base, follow_up_at: "2026-11-23T05:00:00Z", follow_up_1_outcome: "Interested" }, now).overdue).toBe(false);
    expect(attention({ ...base, created_at: "2026-11-22T00:00:00Z" }, now).untouched).toBe(true);
    expect(attention({ ...base, assigned_to: null }, now).unassigned).toBe(true);
    expect(attentionLabels({ ...base, stage: "won", assigned_to: null, follow_up_at: "2026-11-01T00:00:00Z" }, now)).toEqual([]);
  });
});

describe("summarize", () => {
  it("builds funnel, conversion, response time, channels, assignees and lost reasons", () => {
    const leads: InsightLead[] = [
      { ...base, stage: "won", first_contacted_at: "2026-11-24T10:00:00Z", tour_completed_at: "2026-11-24T10:00:00Z", won_value: 15000, channel: "Instagram" },
      { ...base, stage: "contacted", first_contacted_at: "2026-11-24T11:00:00Z", assigned_to: null },
      { ...base, stage: "lost", first_contacted_at: "2026-11-24T09:30:00Z", lost_reason: "Price too high" },
      { ...base },
    ];
    const s = summarize(leads, now, id => id === "a" ? "Asha" : "Unassigned");
    expect(s.total).toBe(4);
    expect(s.funnel.map(f => f.count)).toEqual([4, 3, 1, 1, 1]);
    expect(s.conversion).toBe(0.25);
    expect(s.wonMonthlyValue).toBe(15000);
    expect(s.medianResponseHours).toBe(1);
    expect(s.byChannel.find(c => c.channel === "Instagram")?.won).toBe(1);
    expect(s.byAssignee.map(a => a.name).sort()).toEqual(["Asha", "Unassigned"]);
    expect(s.lostReasons).toEqual([{ reason: "Price too high", count: 1 }]);
    expect(s.unassigned).toBe(1);
  });
  it("handles no leads", () => { expect(summarize([], now, () => "x").conversion).toBe(0); });
});
