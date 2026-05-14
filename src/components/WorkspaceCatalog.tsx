"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

// Lazy-load Three.js so it never blocks the main bundle
const GLSLHills = dynamic(
  () => import("@/components/ui/glsl-hills").then(m => ({ default: m.GLSLHills })),
  { ssr: false }
);

/* ── service data ──────────────────────────────────────────────── */
const SERVICES = [
  {
    id: "cabins",
    number: "01",
    title: "Private Office Cabins",
    tagline: "Your team. Your rules. Your space.",
    caption: "2 to 17 seaters",
    photo: "/images/open-workspace-2.jpg",
    accentColor: "#c9a84c",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="2" y="2" width="18" height="18" rx="2"/>
        <path d="M2 8h18M8 8v12"/>
      </svg>
    ),
    details: [
      "Fully enclosed, glass-facade soundproof cabins",
      "Acoustic polypropylene carpet — zero noise bleed",
      "Ergonomic high-grade chairs & LED designer lighting",
      "Individual signage on the centre directory",
      "Biometric entry with 24×7 CCTV monitoring",
      "Italian marble high-glazed tile finishes",
    ],
    writeup: "Nest Vault's private cabins redefine what it means to own your workspace. Each cabin is architecturally designed with frosted glass facades, acoustic-grade polypropylene carpet flooring, and ergonomic seating — eliminating every distraction. From intimate 2-person pods to full-floor 17-seat suites, your cabin becomes a branded, secure headquarters at a fraction of traditional office costs. Biometric entry, individual directory signage, and premium Italian marble finishes communicate seriousness to every client who visits.",
  },
  {
    id: "desks",
    number: "02",
    title: "Dedicated Desks & Open Seating",
    tagline: "Your desk. Every single day.",
    caption: "Fixed workstation",
    photo: "/images/hot-desk.jpg",
    accentColor: "#4a90e2",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="1" y="13" width="20" height="3" rx="1"/>
        <path d="M7 13V7M15 13V7M4 16v3M18 16v3"/>
      </svg>
    ),
    details: [
      "Reserved desk — yours every working day",
      "Personal locker for secure storage",
      "1 Gbps WiFi + LAN port at every seat",
      "Ergonomic high-grade mesh chair",
      "100% power backup with UPS",
      "Unlimited coffee, tea & water (CCD kiosk on-site)",
    ],
    writeup: "Stop hunting for a seat every morning. Your dedicated desk at Nest Vault is reserved, set up exactly how you like it, and waiting for you 365 days a year. With a personal locker, a dual-mode 1 Gbps internet connection (WiFi + LAN), and an ergonomic chair that won't betray your spine by 3 PM, you get the comfort of a private office without the overhead. Unlimited beverages from the Coffee Day kiosk keep the focus sharp all day.",
  },
  {
    id: "meeting",
    number: "03",
    title: "Meeting Rooms & Boardrooms",
    tagline: "Make every meeting count.",
    caption: "4 to 17 seats",
    photo: "/images/boardroom.jpg",
    accentColor: "#9b59b6",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="2" y="4" width="18" height="13" rx="2"/>
        <path d="M7 17v2M15 17v2M2 9h18"/>
      </svg>
    ),
    details: [
      "Executive boardroom with white conference table",
      "4K smart TV + HDMI / wireless screen share",
      "Printer, scanner, Xerox & telephone on site",
      "Discussion room for smaller team syncs",
      "Video-conferencing ready infrastructure",
      "Tea & coffee service for guests",
    ],
    writeup: "Your pitch, your board meeting, your investor call — all deserve a room that commands respect. Nest Vault's boardrooms are fitted with premium white conference tables, 4K smart TVs, wireless presentation tech, and full reception services including printing, scanning, and telephone. Whether you're closing a deal with 10 people or doing a focused strategy session with 4, there's a room sized exactly right. Book by the hour — no long commitments.",
  },
  {
    id: "virtual",
    number: "04",
    title: "Virtual Office",
    tagline: "A prestigious address. Zero rent.",
    caption: "Address + services",
    photo: "/images/reception.jpg",
    accentColor: "#2d9e7e",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M11 2C7.13 2 4 5.13 4 9c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7z"/>
        <circle cx="11" cy="9" r="2.5"/>
      </svg>
    ),
    details: [
      "Jubilee Hills business address — GST & compliance ready",
      "Professional mail & courier handling",
      "Dedicated call answering & forwarding",
      "Access to meeting rooms on demand",
      "Individual signage on the lobby directory",
      "Reception services included",
    ],
    writeup: "Project the credibility of a Jubilee Hills office address without paying Jubilee Hills rent. Our Virtual Office plan gives your business a legitimate, GST-compliant registered address on Road No. 36 — one of Hyderabad's most recognised commercial corridors. Mail is received, logged, and forwarded by our front-desk team. Calls are answered in your company's name. Meeting rooms are available whenever clients visit. Everything a physical office does for your brand, at a fraction of the cost.",
  },
  {
    id: "events",
    number: "05",
    title: "Event Space",
    tagline: "Launch. Pitch. Celebrate. Network.",
    caption: "Up to 80 attendees",
    photo: "/images/cafeteria-wide.jpg",
    accentColor: "#e67e22",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M12 2l2.4 4.8 5.3.8-3.8 3.7.9 5.3L12 14l-4.8 2.6.9-5.3L4.3 7.6l5.3-.8z"/>
      </svg>
    ),
    details: [
      "Flexible hall configurable for 20–80 attendees",
      "Projector, PA system & stage lighting",
      "Catering coordination available on request",
      "Breakout areas for networking sessions",
      "Reception & guest registration support",
      "Fire safety compliant — extinguishers, sprinklers, detectors",
    ],
    writeup: "From startup launch nights and investor showcases to corporate workshops and networking evenings — Nest Vault's event space transforms to fit your vision. The hall accommodates up to 80 attendees in flexible configurations: theatre, classroom, or open networking. Professional AV setup, catering coordination, and full front-desk support ensure your guests walk away impressed. The space is fully fire-safety compliant with extinguishers, sprinklers, and smoke detectors, so you focus entirely on the experience.",
  },
  {
    id: "daypass",
    number: "06",
    title: "Day Passes",
    tagline: "Show up, plug in, get to work.",
    caption: "Daily access",
    photo: "/images/lounge-day.jpg",
    accentColor: "#e74c3c",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="3" y="4" width="16" height="16" rx="2"/>
        <path d="M3 9h16M8 2v4M14 2v4"/>
      </svg>
    ),
    details: [
      "Open seating on any available hot desk",
      "Full 1 Gbps internet access (WiFi + LAN)",
      "Unlimited beverages — coffee, tea & water",
      "Printing, scanning & reception services",
      "Access to common areas, lounge & café",
      "Zero commitment — pay for the day, come back anytime",
    ],
    writeup: "Not ready for a full membership? A Nest Vault Day Pass gives you everything a permanent member gets — premium internet, unlimited coffee, access to the lounge, café and common areas, printing and scanning — for a single flat daily rate. Perfect for freelancers, remote workers passing through Hyderabad, or founders who need a focused space for an important deadline. No contracts. No commitments. Just walk in, sit down, and do your best work.",
  },
];

/* ── helpers ─────────────────────────────────────────────────── */
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ── active service card ──────────────────────────────────────── */
function ServiceDetail({ svc }: { svc: typeof SERVICES[0] }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, [svc.id]);

  return (
    <div className="ws-detail-inner" style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease" }}>
      {/* Left — photo */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <Image
          src={svc.photo}
          alt={svc.title}
          fill
          sizes="50vw"
          style={{
            objectFit: "cover",
            transform: visible ? "scale(1)" : "scale(1.06)",
            transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(5,5,5,0.6) 0%, transparent 60%)" }} />
        {/* Number overlay */}
        <div style={{
          position: "absolute", bottom: "2rem", left: "2rem",
          fontFamily: "Georgia, serif",
          fontSize: "5rem", fontWeight: 700, lineHeight: 1,
          color: "rgba(255,255,255,0.07)",
          letterSpacing: "-0.05em",
          userSelect: "none",
        }}>
          {svc.number}
        </div>
        {/* Caption badge */}
        <div style={{
          position: "absolute", top: "1.5rem", left: "1.5rem",
          padding: "0.35rem 0.9rem",
          background: "rgba(5,5,5,0.65)",
          backdropFilter: "blur(12px)",
          border: `1px solid ${svc.accentColor}40`,
          borderRadius: "2px",
          fontFamily: "-apple-system, sans-serif",
          fontSize: "0.66rem", letterSpacing: "0.14em",
          color: svc.accentColor, textTransform: "uppercase",
        }}>
          {svc.caption}
        </div>
      </div>

      {/* Right — content */}
      <div className="ws-detail-content">
        <div>
          {/* Accent line */}
          <div style={{ width: "36px", height: "2px", background: `linear-gradient(90deg, ${svc.accentColor}, transparent)`, marginBottom: "1.5rem" }} />

          <h3 style={{
            fontFamily: "Georgia, serif",
            fontSize: "1.65rem", fontWeight: 700,
            color: "white", letterSpacing: "-0.02em",
            lineHeight: 1.15, marginBottom: "0.5rem",
          }}>
            {svc.title}
          </h3>
          <p style={{
            fontFamily: "-apple-system, sans-serif",
            fontSize: "0.8rem", color: svc.accentColor,
            letterSpacing: "0.06em", textTransform: "uppercase",
            fontWeight: 500, marginBottom: "1.25rem",
          }}>
            {svc.tagline}
          </p>

          {/* Writeup */}
          <p style={{
            fontFamily: "-apple-system, sans-serif",
            fontSize: "0.85rem", lineHeight: 1.8,
            color: "rgba(255,255,255,0.5)",
            fontWeight: 300, marginBottom: "1.75rem",
          }}>
            {svc.writeup}
          </p>

          {/* Feature list */}
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {svc.details.map((d, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: "2px" }}>
                  <circle cx="7" cy="7" r="6" stroke={svc.accentColor} strokeWidth="0.8" />
                  <path d="M4.5 7l2 2 3-3" stroke={svc.accentColor} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{
                  fontFamily: "-apple-system, sans-serif",
                  fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.5,
                }}>
                  {d}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <a
          href="#contact"
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            marginTop: "2rem",
            padding: "0.75rem 1.5rem",
            background: `linear-gradient(135deg, ${svc.accentColor}22, ${svc.accentColor}11)`,
            border: `1px solid ${svc.accentColor}50`,
            borderRadius: "2px",
            fontFamily: "-apple-system, sans-serif",
            fontSize: "0.75rem", fontWeight: 600,
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: svc.accentColor, textDecoration: "none",
            alignSelf: "flex-start",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = `${svc.accentColor}22`;
            (e.currentTarget as HTMLElement).style.borderColor = svc.accentColor;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = `linear-gradient(135deg, ${svc.accentColor}22, ${svc.accentColor}11)`;
            (e.currentTarget as HTMLElement).style.borderColor = `${svc.accentColor}50`;
          }}
        >
          Enquire about this space
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </a>
      </div>
    </div>
  );
}

/* ── main ────────────────────────────────────────────────────── */
export default function WorkspaceCatalog() {
  const { ref, inView } = useInView(0.08);
  const [active, setActive] = useState(0);
  const [hillsVisible, setHillsVisible] = useState(false);

  useEffect(() => {
    if (inView) setTimeout(() => setHillsVisible(true), 200);
  }, [inView]);

  return (
    <section
      id="workspaces"
      style={{ background: "#050505", color: "white", position: "relative", overflow: "hidden" }}
    >
      {/* ── GLSL Hills background ── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        opacity: hillsVisible ? 1 : 0,
        transition: "opacity 1.5s ease",
      }}>
        {hillsVisible && (
          <GLSLHills
            cameraZ={120}
            planeSize={256}
            speed={0.35}
            color="#c9a84c"
            opacity={0.22}
          />
        )}
      </div>

      {/* ── gradient fade so hills don't overpower ── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.6) 30%, rgba(5,5,5,0.6) 70%, rgba(5,5,5,0.95) 100%)",
      }} />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* ── Section header ── */}
        <div ref={ref} className="container" style={{ paddingTop: "clamp(3.5rem,8vw,7rem)", paddingBottom: "clamp(2rem,4vw,4rem)" }}>
          <div className="section-header" style={{ marginBottom: "0" }}>
            <div style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "none" : "translateY(30px)",
              transition: "opacity 0.8s ease, transform 0.8s ease",
            }}>
              <div style={{ width: "50px", height: "2px", background: "linear-gradient(90deg, #c9a84c, transparent)", marginBottom: "1.5rem" }} />
              <p style={{ fontFamily: "-apple-system, sans-serif", fontSize: "0.72rem", letterSpacing: "0.22em", color: "#c9a84c", textTransform: "uppercase", marginBottom: "1.25rem" }}>
                Our Services
              </p>
              <h2
                className="font-display"
                style={{
                  fontSize: "clamp(2.2rem, 4vw, 3.5rem)",
                  fontWeight: 700, letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                }}
              >
                Six ways to
                <br />
                <span className="text-gold-gradient">work at your best</span>
              </h2>
            </div>
            <p style={{
              fontFamily: "-apple-system, sans-serif",
              fontSize: "clamp(1rem,1.4vw,1.075rem)", lineHeight: 1.8,
              color: "rgba(255,255,255,0.45)", fontWeight: 300,
              opacity: inView ? 1 : 0,
              transition: "opacity 0.8s ease 0.2s",
            }}>
              From fully enclosed private cabins to flexible day passes — every
              offering is engineered around zero friction, premium infrastructure,
              and 24×7 access. Pick the format that fits how you work today.
            </p>
          </div>

          {/* ── Service selector tabs ── */}
          <div className="ws-tabs" style={{ marginTop: "clamp(2rem,4vw,3.5rem)", opacity: inView ? 1 : 0, transition: "opacity 0.8s ease 0.35s" }}>
            {SERVICES.map((svc, i) => (
              <button
                key={svc.id}
                onClick={() => setActive(i)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.6rem",
                  padding: "1rem 1.5rem",
                  background: "none", border: "none",
                  borderBottom: active === i ? `2px solid ${svc.accentColor}` : "2px solid transparent",
                  color: active === i ? "white" : "rgba(255,255,255,0.38)",
                  fontFamily: "-apple-system, sans-serif",
                  fontSize: "0.78rem", fontWeight: active === i ? 600 : 400,
                  letterSpacing: "0.04em", cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.3s ease",
                  marginBottom: "-1px",
                }}
                onMouseEnter={e => {
                  if (active !== i) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)";
                }}
                onMouseLeave={e => {
                  if (active !== i) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.38)";
                }}
              >
                <span style={{ color: active === i ? svc.accentColor : "inherit" }}>{svc.icon}</span>
                <span>{svc.title.split(" ")[0]}{svc.title.split(" ")[1] ? " " + svc.title.split(" ")[1] : ""}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Active service detail panel ── */}
        <div className="container" style={{ opacity: inView ? 1 : 0, transition: "opacity 0.6s ease 0.5s" }}>
          <div className="ws-detail-panel">
            <ServiceDetail key={active} svc={SERVICES[active]} />
          </div>
        </div>

        {/* ── All-services mini grid ── */}
        <div
          className="container ws-mini-grid"
          style={{ opacity: inView ? 1 : 0, transition: "opacity 0.8s ease 0.7s", marginTop: "2rem", paddingBottom: "clamp(3.5rem,8vw,7rem)" }}
        >
          {SERVICES.map((svc, i) => (
            <button
              key={svc.id}
              onClick={() => setActive(i)}
              style={{
                padding: "1.5rem 1.25rem",
                background: active === i ? `${svc.accentColor}0f` : "rgba(5,5,5,0.8)",
                border: "none",
                borderTop: active === i ? `2px solid ${svc.accentColor}` : "2px solid transparent",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={e => {
                if (active !== i) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
              }}
              onMouseLeave={e => {
                if (active !== i) (e.currentTarget as HTMLElement).style.background = "rgba(5,5,5,0.8)";
              }}
            >
              <div style={{ color: active === i ? svc.accentColor : "rgba(255,255,255,0.3)", marginBottom: "0.75rem" }}>
                {svc.icon}
              </div>
              <div style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: "0.72rem", fontWeight: 600,
                color: active === i ? "white" : "rgba(255,255,255,0.5)",
                lineHeight: 1.3, marginBottom: "0.3rem",
              }}>
                {svc.title}
              </div>
              <div style={{
                fontFamily: "-apple-system, sans-serif",
                fontSize: "0.62rem", color: active === i ? svc.accentColor : "rgba(255,255,255,0.22)",
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>
                {svc.caption}
              </div>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        /* Service detail split panel */
        .ws-detail-panel {
          height: 520px;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.55);
        }
        .ws-detail-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          height: 100%;
        }
        .ws-detail-content {
          padding: clamp(1.5rem,3vw,2.5rem);
          display: flex; flex-direction: column; justify-content: space-between;
          background: rgba(12,12,12,0.98);
          overflow-y: auto;
        }

        /* Mini grid */
        .ws-mini-grid {
          display: grid;
          grid-template-columns: repeat(6,1fr);
          gap: 1px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.05);
        }

        /* Tabs scroll */
        .ws-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .ws-tabs::-webkit-scrollbar { display: none; }

        @media (max-width: 900px) {
          .ws-detail-panel { height: auto; }
          .ws-detail-inner { grid-template-columns: 1fr; }
          .ws-detail-inner > div:first-child { height: 220px; }
        }
        @media (max-width: 768px) {
          .ws-mini-grid { grid-template-columns: repeat(3,1fr); }
        }
        @media (max-width: 480px) {
          .ws-mini-grid { grid-template-columns: repeat(2,1fr); }
        }
      `}</style>
    </section>
  );
}
