import { describe, expect, it } from "vitest";
import { formatCount, googleErrorMessage, normalizeSearchSite, parseTokenKey, reportWindow } from "../src/lib/analytics";

describe("analytics report window", () => {
  it("covers exactly the chosen number of days, ending 3 days ago in India time", () => {
    expect(reportWindow(7, Date.parse("2026-11-19T04:00:00Z"))).toEqual({ startDate: "2026-11-10", endDate: "2026-11-16" });
    expect(reportWindow(28, Date.parse("2026-11-19T04:00:00Z"))).toEqual({ startDate: "2026-10-20", endDate: "2026-11-16" });
  });
  it("uses the India date just after midnight IST", () => {
    expect(reportWindow(7, Date.parse("2026-11-18T19:00:00Z")).endDate).toBe("2026-11-16");
  });
});

describe("analytics counts", () => {
  it("shows zero as 0 and missing values as a dash", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount("0")).toBe("0");
    expect(formatCount(null)).toBe("—");
    expect(formatCount(undefined)).toBe("—");
  });
  it("groups large numbers the Indian way", () => {
    expect(formatCount("1234567")).toBe("12,34,567");
  });
});

describe("Google error messages", () => {
  it("keeps Google's reason and adds a setup hint", () => {
    const message = googleErrorMessage(403, { error: { message: "User does not have sufficient permissions for this property.", status: "PERMISSION_DENIED" } });
    expect(message).toContain("(403): User does not have sufficient permissions");
    expect(message).toContain("API is enabled");
  });
  it("still explains the status when the body is not JSON", () => {
    expect(googleErrorMessage(500, null)).toBe("Google reporting request failed (500).");
  });
});

describe("Google token key", () => {
  const base64 = Buffer.alloc(32, 7).toString("base64");
  const hex = Buffer.alloc(32, 7).toString("hex");
  it("accepts base64 and hex keys", () => {
    expect(parseTokenKey(base64)?.length).toBe(32);
    expect(parseTokenKey(hex)?.equals(Buffer.alloc(32, 7))).toBe(true);
  });
  it("ignores pasted spaces, line breaks and quotes", () => {
    expect(parseTokenKey(` "${base64}"\n`)?.equals(Buffer.alloc(32, 7))).toBe(true);
    expect(parseTokenKey(`'${hex}'`)?.length).toBe(32);
  });
  it("rejects missing, short and non-key values", () => {
    expect(parseTokenKey(undefined)).toBeNull();
    expect(parseTokenKey(Buffer.alloc(16).toString("base64"))).toBeNull();
    expect(parseTokenKey("my secret passphrase")).toBeNull();
  });
});

describe("Search Console property", () => {
  it("turns a plain domain into a domain property", () => {
    expect(normalizeSearchSite("nestvault.in")).toBe("sc-domain:nestvault.in");
    expect(normalizeSearchSite(" www.NestVault.in/ ")).toBe("sc-domain:nestvault.in");
    expect(normalizeSearchSite("sc-domain:nestvault.in")).toBe("sc-domain:nestvault.in");
  });
  it("keeps URL-prefix properties with a trailing slash", () => {
    expect(normalizeSearchSite("https://nestvault.in")).toBe("https://nestvault.in/");
    expect(normalizeSearchSite("https://nestvault.in/")).toBe("https://nestvault.in/");
  });
  it("allows clearing and rejects junk", () => {
    expect(normalizeSearchSite("  ")).toBe("");
    expect(normalizeSearchSite("not a site")).toBeNull();
    expect(normalizeSearchSite("https://")).toBeNull();
  });
});
