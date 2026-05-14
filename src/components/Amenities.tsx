"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

function useInView(threshold = 0.08) {
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

const amenities = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M4 9c0 0 4-5 10-5s10 5 10 5"/>
        <path d="M7 13c0 0 3-3.5 7-3.5s7 3.5 7 3.5"/>
        <path d="M10 17c0 0 1.5-2 4-2s4 2 4 2"/>
        <circle cx="14" cy="21" r="1.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
    title: "High-Speed WiFi",
    desc: "Stay connected with lightning-fast and secure internet access available throughout the workspace. Enterprise-grade 1 Gbps fibre with leased-line backup.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <rect x="3" y="8" width="10" height="7" rx="2"/>
        <rect x="15" y="8" width="10" height="7" rx="2"/>
        <path d="M8 15v3M20 15v3M5 18h6M17 18h6"/>
        <circle cx="8" cy="11.5" r="1" fill="currentColor" stroke="none"/>
        <circle cx="20" cy="11.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
    title: "Playtime Area",
    desc: "Refresh your mind with games and recreational activities in our dedicated play zone. A well-designed break boosts creativity and focus.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M8 6h12v10a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V6z"/>
        <path d="M20 10c1.5 0 3 1 3 3s-1.5 3-3 3"/>
        <path d="M11 20v2M17 20v2M9 22h10"/>
      </svg>
    ),
    title: "Pantry",
    desc: "Enjoy access to a well-stocked pantry with coffee, snacks, and refreshments. Coffee Day kiosk on-site to keep you energized throughout the day.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <rect x="3" y="5" width="22" height="15" rx="2"/>
        <path d="M9 20v2M19 20v2M7 22h14"/>
        <path d="M7 11h14M7 14h8"/>
      </svg>
    ),
    title: "Conference & Discussion Rooms",
    desc: "Fully equipped conference rooms designed for meetings, presentations, discussions, and team collaborations. AV-ready with 4K displays.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <rect x="7" y="3" width="14" height="22" rx="2"/>
        <circle cx="14" cy="14" r="3"/>
        <path d="M14 11v-3M14 17v3M11 14H8M17 14h3"/>
      </svg>
    ),
    title: "Secure Lockers",
    desc: "Keep your belongings safe and organized with personal locker facilities. Your essentials are secure and always accessible when you need them.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <rect x="2" y="15" width="24" height="8" rx="2"/>
        <path d="M5 15V11a9 9 0 0 1 18 0v4"/>
        <path d="M8 15v-4a6 6 0 0 1 12 0v4"/>
        <circle cx="14" cy="19" r="1.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
    title: "Parking",
    desc: "Convenient on-site parking facilities for hassle-free access to the workspace. Dedicated bays for both cars and two-wheelers in the basement.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <rect x="4" y="4" width="20" height="16" rx="2"/>
        <path d="M9 20v3M19 20v3M7 23h14"/>
        <path d="M8 10h12M8 13h8"/>
        <path d="M20 13l2 2-2 2"/>
      </svg>
    ),
    title: "Printing Services",
    desc: "High-quality printing, scanning, and copying services available for all your business documentation needs. Laser printers and colour scanners on every floor.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M3 18c0-3 2-5 4-5h14c2 0 4 2 4 5v2H3v-2z"/>
        <path d="M7 13V9a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4"/>
        <path d="M10 20h8"/>
      </svg>
    ),
    title: "Lounge Area",
    desc: "Relax, recharge, or have informal discussions in our cozy lounge featuring comfortable seating, panoramic city views, and a calming ambiance.",
  },
];

export default function Amenities() {
  const { ref: headerRef, inView: headerIn } = useInView();
  const { ref: gridRef,   inView: gridIn   } = useInView();
  const { ref: photoRef,  inView: photoIn  } = useInView();

  return (
    <section id="amenities" style={{ background: "#0a0a0a", color: "white", overflow: "hidden" }}>

      {/* ── Header ── */}
      <div className="container" style={{ paddingTop: "clamp(4rem,8vw,7rem)", paddingBottom: "clamp(2.5rem,5vw,4rem)" }}>
        <div ref={headerRef} className="am-header-grid">
          <div style={{ opacity: headerIn ? 1 : 0, transform: headerIn ? "none" : "translateY(24px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
            <div className="divider-gold" style={{ marginBottom: "1.25rem" }} />
            <p className="label" style={{ marginBottom: "1.1rem" }}>World-Class Amenities</p>
            <h2 className="h-section" style={{ color: "white" }}>
              Amenities at<br />
              <span className="text-gold-gradient">Nest Vault Coworking</span>
            </h2>
          </div>
          <p
            className="body-copy"
            style={{
              color: "rgba(255,255,255,0.55)",
              opacity: headerIn ? 1 : 0,
              transition: "opacity 0.7s ease 0.2s",
              alignSelf: "end",
            }}
          >
            Enhance your productivity with thoughtfully designed amenities that create a comfortable, professional, and inspiring work environment. Every detail has been chosen to help you focus, collaborate, and thrive.
          </p>
        </div>
      </div>

      {/* ── Amenity Cards Grid ── */}
      <div ref={gridRef} className="container" style={{ paddingBottom: "clamp(4rem,8vw,7rem)" }}>
        <div className="am-cards-grid">
          {amenities.map(({ icon, title, desc }, i) => (
            <div
              key={title}
              className="am-card"
              style={{
                opacity: gridIn ? 1 : 0,
                transform: gridIn ? "none" : "translateY(28px)",
                transition: `opacity 0.6s ease ${i * 0.07}s, transform 0.6s ease ${i * 0.07}s`,
              }}
            >
              {/* Icon */}
              <div className="am-card__icon">{icon}</div>

              {/* Number */}
              <div className="am-card__num">0{i + 1}</div>

              {/* Content */}
              <h3 className="am-card__title">{title}</h3>
              <p className="am-card__desc">{desc}</p>

              {/* Hover accent */}
              <div className="am-card__line" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Photo strip ── */}
      <div ref={photoRef} className="am-photo-strip">
        {[
          { src: "/images/lounge-dusk.jpg",      label: "Lounge Area" },
          { src: "/images/cafeteria.jpg",         label: "Pantry & Café" },
          { src: "/images/boardroom.jpg",         label: "Conference Room" },
          { src: "/images/corridor.jpg",          label: "Private Cabins" },
        ].map(({ src, label }, i) => (
          <div
            key={src}
            className="am-strip-item"
            style={{ opacity: photoIn ? 1 : 0, transform: photoIn ? "none" : "scale(0.96)", transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s` }}
          >
            <Image src={src} alt={label} fill sizes="25vw" style={{ objectFit: "cover", transition: "transform 0.6s ease" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)" }} />
            <span className="am-strip-label">{label}</span>
          </div>
        ))}
      </div>

      <style>{`
        /* Header */
        .am-header-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(2rem, 5vw, 5rem);
          align-items: start;
        }

        /* 4-column card grid */
        .am-cards-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 6px;
          overflow: hidden;
        }

        /* Individual card */
        .am-card {
          padding: clamp(1.5rem, 2.5vw, 2rem);
          background: #0d0d0d;
          position: relative;
          cursor: default;
          transition: background 0.3s ease;
          overflow: hidden;
        }
        .am-card:hover { background: #131313; }

        .am-card__icon {
          color: #c9a84c;
          margin-bottom: 1.25rem;
          transition: transform 0.3s ease;
        }
        .am-card:hover .am-card__icon { transform: scale(1.1); }

        .am-card__num {
          position: absolute;
          top: 1rem; right: 1rem;
          font-family: Georgia, serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: rgba(255,255,255,0.04);
          line-height: 1;
          pointer-events: none;
          user-select: none;
          transition: color 0.3s ease;
        }
        .am-card:hover .am-card__num { color: rgba(201,168,76,0.07); }

        .am-card__title {
          font-family: Georgia, serif;
          font-size: clamp(1rem, 1.5vw, 1.2rem);
          font-weight: 700;
          color: white;
          margin-bottom: 0.75rem;
          line-height: 1.25;
          letter-spacing: -0.01em;
        }
        .am-card__desc {
          font-family: -apple-system, sans-serif;
          font-size: clamp(0.82rem, 1.1vw, 0.9rem);
          line-height: 1.7;
          color: rgba(255,255,255,0.45);
          margin: 0;
        }
        .am-card__line {
          position: absolute;
          bottom: 0; left: 0;
          height: 2px; width: 0%;
          background: linear-gradient(90deg, #c9a84c, transparent);
          transition: width 0.4s ease;
        }
        .am-card:hover .am-card__line { width: 100%; }

        /* Photo strip */
        .am-photo-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          height: clamp(160px, 20vw, 260px);
        }
        .am-strip-item {
          position: relative;
          overflow: hidden;
          cursor: default;
        }
        .am-strip-item:hover img { transform: scale(1.06); }
        .am-strip-label {
          position: absolute;
          bottom: 1rem; left: 1rem;
          font-family: -apple-system, sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          color: white;
          letter-spacing: 0.04em;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .am-cards-grid { grid-template-columns: repeat(2, 1fr); }
          .am-photo-strip { grid-template-columns: repeat(2, 1fr); height: clamp(200px, 35vw, 300px); }
        }
        @media (max-width: 768px) {
          .am-header-grid { grid-template-columns: 1fr; gap: 1.5rem; }
          .am-photo-strip { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .am-cards-grid { grid-template-columns: 1fr 1fr; }
          .am-photo-strip { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </section>
  );
}
