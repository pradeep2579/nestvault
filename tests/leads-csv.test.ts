import { describe, expect, it } from "vitest";
import { importColumns, leadRecord, parseCsv, readCsvLead, toCsv } from "../src/lib/leads-csv";

describe("lead CSV", () => {
  it("reads quoted commas, line breaks, and UTF-8 BOM", () => {
    expect(parseCsv('\uFEFFname,email,message\r\n"A, B",a@example.com,"First\nsecond"\r\n')).toEqual([
      ["name", "email", "message"], ["A, B", "a@example.com", "First\nsecond"],
    ]);
  });

  it("accepts phone-only offline contacts and rejects invalid stages", () => {
    const columns = importColumns(["Full name", "Mobile", "Status"]);
    expect(readCsvLead(columns, ["Asha", "+91 9876543210", "Tour Scheduled"]).stage).toBe("tour_scheduled");
    expect(() => readCsvLead(columns, ["Asha", "+91 9876543210", "unknown"])).toThrow("Invalid stage");
  });

  it("requires timezone on imported dates", () => {
    const columns = importColumns(["name", "email", "follow_up_at"]);
    expect(() => readCsvLead(columns, ["Asha", "asha@example.com", "2026-11-06T09:00"])).toThrow("timezone");
  });

  it("reads follow-up outcomes and notes, and rejects unknown outcomes", () => {
    const columns = importColumns(["name", "email", "follow_up_1", "follow_up_1_outcome", "follow_up_2_outcome", "follow_up_2_note"]);
    const lead = readCsvLead(columns, ["Asha", "asha@example.com", "2026-11-06T09:00:00+05:30", "tour booked", "Call back later", "Busy till Friday"]);
    expect(lead).toMatchObject({ follow_up_1_outcome: "Tour booked", follow_up_2_outcome: "Call back later", follow_up_2_note: "Busy till Friday", follow_up_2_at: null });
    expect(lead.follow_up_at).toBe("2026-11-06T03:30:00.000Z");
    expect(() => readCsvLead(importColumns(["name", "email", "follow_up_1_outcome"]), ["Asha", "asha@example.com", "maybe"])).toThrow("Invalid follow_up_1_outcome");
  });

  it("omits empty follow-up fields from saved records", () => {
    const lead = readCsvLead(importColumns(["name", "email"]), ["Asha", "asha@example.com"]);
    expect(Object.keys(leadRecord(lead))).not.toContain("follow_up_1_outcome");
    expect(Object.keys(leadRecord(lead))).toContain("follow_up_at");
  });

  it("reads source, start timing and budget, and rejects unknown values", () => {
    const columns = importColumns(["name", "email", "channel", "move_in", "budget"]);
    expect(readCsvLead(columns, ["Asha", "asha@example.com", "walk-in", "within 1 month", "₹5,000 - ₹15,000 / month"]))
      .toMatchObject({ channel: "Walk-in", move_in: "Within 1 month", budget: "₹5,000 - ₹15,000 / month" });
    expect(() => readCsvLead(columns, ["Asha", "asha@example.com", "billboard", "", ""])).toThrow("Invalid channel");
    expect(readCsvLead(columns, ["Asha", "asha@example.com", "Direct / unknown", "", ""]).channel).toBe("Own website");
    expect(readCsvLead(importColumns(["name", "email"]), ["Asha", "asha@example.com"])).toMatchObject({ channel: null, move_in: null, budget: null });
    expect(Object.keys(leadRecord(readCsvLead(importColumns(["name", "email"]), ["Asha", "asha@example.com"])))).not.toContain("channel");
  });

  it("escapes spreadsheet formulas in exports", () => {
    const csv = toCsv([{ name: "=HYPERLINK(\"evil\")", phone: "+919876543210" }], ["name", "phone"]);
    expect(csv).toContain("'=");
    expect(csv).toContain("'+919876543210");
  });
});
