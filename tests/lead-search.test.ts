import { describe, expect, it } from "vitest";
import { phoneSearchPattern } from "../src/lib/lead-search";
import { istDateTime } from "../src/lib/format";

describe("lead phone search", () => {
  it("matches digits regardless of spacing or country code formatting", () => {
    expect(phoneSearchPattern("98765 43210")).toBe("%9%8%7%6%5%4%3%2%1%0%");
    expect(phoneSearchPattern("+91-98765")).toBe("%9%1%9%8%7%6%5%");
  });
  it("ignores names and very short numbers", () => {
    expect(phoneSearchPattern("asha")).toBeNull();
    expect(phoneSearchPattern("12")).toBeNull();
  });
});

describe("India time", () => {
  it("shows UTC timestamps in IST", () => {
    expect(istDateTime("2026-11-19T04:57:54Z")).toMatch(/10:27:54/);
  });
});
