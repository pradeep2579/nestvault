"use client";

import { useEffect } from "react";

const key = "nv_attribution";
const maxAge = 30 * 24 * 3600_000;
export type Attribution = { utm_source?: string; utm_medium?: string; utm_campaign?: string; referrer?: string };

export function readAttribution(): Attribution {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "null") as (Attribution & { t?: number }) | null;
    if (!saved || !saved.t || Date.now() - saved.t > maxAge) return {};
    const { utm_source, utm_medium, utm_campaign, referrer } = saved;
    return { utm_source, utm_medium, utm_campaign, referrer };
  } catch { return {}; }
}

// Remembers where a visitor first came from (ad, search, social) so the enquiry can be credited to that channel.
export default function AttributionCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const utm = { utm_source: params.get("utm_source") || "", utm_medium: params.get("utm_medium") || "", utm_campaign: params.get("utm_campaign") || "" };
      const external = document.referrer && new URL(document.referrer).host !== location.host ? document.referrer : "";
      const existing = readAttribution();
      const hasExisting = !!(existing.utm_source || existing.referrer);
      // A tagged campaign link always wins; a plain referrer only counts if nothing is remembered yet.
      if (utm.utm_source || (external && !hasExisting)) localStorage.setItem(key, JSON.stringify({ ...utm, referrer: external.slice(0, 300), t: Date.now() }));
    } catch { /* storage can be blocked; attribution is best effort */ }
  }, []);
  return null;
}
