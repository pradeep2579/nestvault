"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview", icon: "overview" },
  { href: "/admin/leads", label: "Leads & tours", icon: "leads" },
  { href: "/admin/blog", label: "Blog studio", icon: "blog" },
  { href: "/admin/seo", label: "SEO settings", icon: "seo", owner: true },
  { href: "/admin/analytics", label: "Analytics", icon: "analytics", owner: true },
  { href: "/admin/team", label: "Team access", icon: "team", owner: true },
] as const;

function NavIcon({ name }: { name: (typeof links)[number]["icon"] }) {
  const common = { width: 19, height: 19, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  if (name === "overview") return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
  if (name === "leads") return <svg {...common}><path d="M3 20V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v15" /><path d="M7 8h10M7 12h10M7 16h6M2 20h20" /></svg>;
  if (name === "blog") return <svg {...common}><path d="M5 3h10l4 4v14H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M14 3v5h5M7 12h8M7 16h10" /></svg>;
  if (name === "seo") return <svg {...common}><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5M8 10.5h5M10.5 8v5" /></svg>;
  if (name === "analytics") return <svg {...common}><path d="M3 20h18M5 16l5-5 4 3 5-8" /><path d="M5 20v-4M10 20v-9M14 20v-6M19 20V6" /></svg>;
  return <svg {...common}><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 4v2" /></svg>;
}

export default function AdminNav({ role }: { role: "owner" | "staff" }) {
  const pathname = usePathname();
  return <nav aria-label="Admin navigation" className="admin-nav">
    {links.filter(link => !("owner" in link && link.owner && role !== "owner")).map(link => {
      const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(`${link.href}/`));
      return <Link key={link.href} href={link.href} className={active ? "admin-nav-link is-active" : "admin-nav-link"} aria-current={active ? "page" : undefined}>
        <NavIcon name={link.icon} /><span>{link.label}</span><span className="admin-nav-arrow" aria-hidden="true">↗</span>
      </Link>;
    })}
  </nav>;
}
