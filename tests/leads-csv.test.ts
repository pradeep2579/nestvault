import { describe, expect, it } from "vitest";
import { importColumns, parseCsv, readCsvLead, toCsv } from "../src/lib/leads-csv";

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

  it("escapes spreadsheet formulas in exports", () => {
    const csv = toCsv([{ name: "=HYPERLINK(\"evil\")", phone: "+919876543210" }], ["name", "phone"]);
    expect(csv).toContain("'=");
    expect(csv).toContain("'+919876543210");
  });
});
