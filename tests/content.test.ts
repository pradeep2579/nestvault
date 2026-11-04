import { describe, expect, it } from "vitest";
import { canEditPost, cleanUrl, isLivePost, normalizeRedirectPath, redirectWouldLoop, safeHtml, slugify, validRedirectPath } from "../src/lib/content";

describe("blog content and permissions", () => {
  it("keeps useful formatting and removes scripts and unsafe links", () => {
    const html = safeHtml('<h2>Guide</h2><script>alert(1)</script><a href="javascript:alert(1)">click</a><img src="https://example.com/photo.jpg" alt="Desk">');
    expect(html).toContain("<h2>Guide</h2>");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("javascript:");
    expect(html).toContain('alt="Desk"');
  });
  it("validates slugs and SEO URLs", () => {
    expect(slugify("  Better Work in Hyderabad! ")).toBe("better-work-in-hyderabad");
    expect(cleanUrl("javascript:alert(1)")).toBeNull();
    expect(cleanUrl("//evil.example")).toBeNull();
    expect(cleanUrl("/blog/guide")).toBe("/blog/guide");
  });
  it("shows scheduled posts only when due and blocks staff from editing live posts", () => {
    const now = new Date("2026-11-04T12:00:00Z");
    const future = { author_id: "staff-1", status: "scheduled", published_at: "2026-11-05T12:00:00Z" };
    const due = { ...future, published_at: "2026-11-03T12:00:00Z" };
    expect(isLivePost(future, now)).toBe(false);
    expect(isLivePost(due, now)).toBe(true);
    expect(isLivePost({ ...due, status: "draft" }, now)).toBe(false);
    expect(canEditPost({ id: "staff-1", role: "staff" }, future, now)).toBe(true);
    expect(canEditPost({ id: "staff-2", role: "staff" }, future, now)).toBe(false);
    expect(canEditPost({ id: "staff-1", role: "staff" }, due, now)).toBe(false);
    expect(canEditPost({ id: "owner", role: "owner" }, due, now)).toBe(true);
  });
  it("rejects unsafe redirect paths and multi-step loops", () => {
    expect(normalizeRedirectPath("/old/")).toBe("/old");
    expect(validRedirectPath("/blog/guide")).toBe(true);
    expect(validRedirectPath("//outside.example")).toBe(false);
    expect(validRedirectPath("/admin/leads")).toBe(false);
    expect(validRedirectPath("/robots.txt")).toBe(false);
    expect(redirectWouldLoop([{ source_path: "/b", destination_path: "/c" }, { source_path: "/c", destination_path: "/a" }], "/a", "/b")).toBe(true);
    expect(redirectWouldLoop([{ source_path: "/b", destination_path: "/c" }], "/a", "/b")).toBe(false);
  });
});
