"use client";

import { useEffect, useRef, useState } from "react";
import { postSeoChecks, readingMinutes, wordCount, type SeoPost } from "@/lib/post-seo";

const slugOf = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Reads the surrounding article form, shows a Google-style preview and a live SEO checklist, and warns before leaving with unsaved edits.
export default function PostEditorTools() {
  const holder = useRef<HTMLDivElement>(null);
  const [post, setPost] = useState<SeoPost | null>(null);

  useEffect(() => {
    const form = holder.current?.closest("form");
    if (!form) return;
    const read = (): SeoPost => {
      const data = new FormData(form); const text = (key: string) => String(data.get(key) || "");
      return { title: text("title"), slug: text("slug") || slugOf(text("title")), excerpt: text("excerpt"), body_html: text("body_html"), seo_title: text("seo_title"),
        seo_description: text("seo_description"), cover_url: text("cover_url"), cover_alt: text("cover_alt"), noindex: data.get("noindex") === "on" };
    };
    let last = "";
    const refresh = () => { const next = read(); const key = JSON.stringify(next); if (key !== last) { last = key; setPost(next); } };
    refresh();
    // The editor normalises the HTML once it loads, so take the "unchanged" snapshot after that settles.
    let initial: string | null = null, submitting = false;
    const settle = window.setTimeout(() => { initial = JSON.stringify(read()); }, 1500);
    const timer = window.setInterval(refresh, 1000);
    const warn = (event: BeforeUnloadEvent) => { if (!submitting && initial !== null && JSON.stringify(read()) !== initial) { event.preventDefault(); event.returnValue = ""; } };
    const submit = () => { submitting = true; };
    form.addEventListener("input", refresh); form.addEventListener("submit", submit); window.addEventListener("beforeunload", warn);
    return () => { window.clearTimeout(settle); window.clearInterval(timer); form.removeEventListener("input", refresh); form.removeEventListener("submit", submit); window.removeEventListener("beforeunload", warn); };
  }, []);

  const checks = post ? postSeoChecks(post) : [];
  const words = wordCount(post?.body_html);
  const title = (post?.seo_title || post?.title || "Your article title").trim();
  const description = (post?.seo_description || post?.excerpt || "Your meta description appears here. Write 110-160 characters that make people want to click.").trim();
  return <div ref={holder} className="seo-panel" aria-label="Search preview and checklist">
    <h2>Search preview & checklist</h2>
    <div className="seo-serp"><small>nestvault.in › blog › {post?.slug || "your-article"}</small><strong>{title.length > 65 ? `${title.slice(0, 62)}…` : title}</strong><span>{description.length > 160 ? `${description.slice(0, 157)}…` : description}</span></div>
    <p className="crm-hint">{words} words · about {readingMinutes(words)} min read</p>
    <ul className="seo-checks">{checks.map(check => <li key={check.id} className={check.ok ? "is-ok" : "is-warn"}><span aria-hidden="true">{check.ok ? "✓" : "!"}</span><div>{check.label}{!check.ok && <small>{check.hint}</small>}</div></li>)}</ul>
  </div>;
}
