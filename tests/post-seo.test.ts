import { describe, expect, it } from "vitest";
import { postSeoChecks, readingMinutes, seoIssues, wordCount } from "../src/lib/post-seo";

const words = (n: number) => Array.from({ length: n }, (_, i) => `word${i}`).join(" ");
const good = { title: "How a coworking desk helps freelancers stay productive", slug: "freelancer-productivity", seo_description: "x".repeat(130), cover_url: "/c.jpg", cover_alt: "A desk",
  body_html: `<h2>Intro</h2><p>${words(320)} <a href="/blog">more</a></p><img src="/a.jpg" alt="Desk">`, noindex: false };

describe("article SEO checks", () => {
  it("counts words and reading time from HTML", () => {
    expect(wordCount("<p>Hello <b>big</b> world</p>")).toBe(3);
    expect(wordCount(null)).toBe(0);
    expect(readingMinutes(0)).toBe(1);
    expect(readingMinutes(1000)).toBe(5);
  });
  it("passes a well-formed article", () => { expect(seoIssues(good)).toEqual([]); });
  it("flags each weakness", () => {
    const ids = (post: object) => seoIssues({ ...good, ...post }).map(check => check.id);
    expect(ids({ title: "Short", seo_title: "" })).toContain("title");
    expect(ids({ seo_description: "too short", excerpt: "" })).toContain("description");
    expect(ids({ cover_alt: "" })).toContain("cover");
    expect(ids({ body_html: "<p>tiny</p>" })).toEqual(expect.arrayContaining(["length", "headings", "links"]));
    expect(ids({ body_html: good.body_html + '<img src="/b.jpg">' })).toContain("alt");
    expect(ids({ slug: "a".repeat(61) })).toContain("slug");
    expect(ids({ noindex: true })).toContain("indexable");
  });
  it("uses the excerpt when there is no meta description", () => {
    expect(postSeoChecks({ ...good, seo_description: "", excerpt: "y".repeat(120) }).find(check => check.id === "description")?.ok).toBe(true);
  });
});
