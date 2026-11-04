import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/public-data", () => ({
  homeSeo: async () => ({ noindex: false }),
  publicPosts: async () => [
    { slug: "visible", noindex: false, updated_at: "2026-11-04T00:00:00Z" },
    { slug: "hidden", noindex: true, updated_at: "2026-11-04T00:00:00Z" },
  ],
}));

import sitemap from "../src/app/sitemap";

describe("sitemap", () => {
  it("includes public pages and omits noindex posts and admin routes", async () => {
    const urls = (await sitemap()).map(item => item.url);
    expect(urls).toContain("https://nestvault.in");
    expect(urls).toContain("https://nestvault.in/blog/visible");
    expect(urls).not.toContain("https://nestvault.in/blog/hidden");
    expect(urls.some(url => url.includes("/admin"))).toBe(false);
  });
});
