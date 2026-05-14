"use client";

import { useEffect, useRef, useState } from "react";

const plans = [
  {
    name: "Day Pass",
    tagline: "Try before you commit",
    price: "₹400",
    period: "/day",
    color: "#6b7280",
    popular: false,
    features: ["Hot desk access","High-speed Wi-Fi","Unlimited café","Printing & scanning","Locker (day use)","Access to lounge & common areas"],
    cta: "Book a Day",
    note: null,
  },
  {
    name: "Flexi Desk",
    tagline: "Work your way",
    price: "₹5,000",
    period: "/month",
    color: "#2d9e7e",
    popular: false,
    features: ["Hot desk access","1 Gbps Wi-Fi & LAN","Unlimited café & pantry","Printing (100 pages)","Personal locker","2 meeting room hrs/mo"],
    cta: "Get Started",
    note: "10 hrs/day · 5-day week",
  },
  {
    name: "Dedicated Desk",
    tagline: "Your permanent seat",
    price: "₹6,000",
    period: "/month",
    color: "#c9a84c",
    popular: true,
    features: ["Fixed assigned desk","Personal locker","1 Gbps Wi-Fi & LAN","Ergonomic high-grade chair","Unlimited café & pantry","Printing (200 pages)","4 meeting room hrs/mo","Business address"],
    cta: "Claim Your Desk",
    note: "10 hrs/day · 5-day week",
  },
  {
    name: "Private Cabin",
    tagline: "For focused teams",
    price: "₹6,500",
    period: "/month",
    color: "#9b59b6",
    popular: false,
    features: ["Fully enclosed glass cabin","2–17 seat options","Dedicated AC control","Branded entry & directory","24/7 access","Unlimited café","8 meeting hrs/mo","Mail & courier handling"],
    cta: "Enquire Now",
    note: "10 hrs/day · 5-day week",
  },
  {
    name: "Virtual Office",
    tagline: "Prestigious address, zero rent",
    price: "₹1,199",
    period: "/month",
    color: "#e67e22",
    popular: false,
    features: ["Jubilee Hills business address","GST & compliance ready","Mail & courier handling","Call answering & forwarding","Meeting room access on demand","Directory signage"],
    cta: "Get Address",
    note: null,
  },
];

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

export default function Pricing() {
  const { ref, inView } = useInView();

  return (
    <section id="pricing" className="section-pad" style={{ background: "linear-gradient(180deg,#0a0a0a,#0d0d0d)", color: "white" }}>
      <div className="container">

        {/* Header */}
        <div ref={ref} style={{ textAlign: "center", marginBottom: "clamp(2rem,5vw,4rem)" }}>
          <div className="divider-gold" style={{ margin: "0 auto 1.25rem" }} />
          <p className="label" style={{ marginBottom: "0.875rem" }}>Transparent Pricing</p>
          <h2
            className="h-section"
            style={{
              color: "white",
              opacity: inView ? 1 : 0,
              transform: inView ? "none" : "translateY(20px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
          >
            Plans built for{" "}
            <span className="text-gold-gradient">every ambition</span>
          </h2>
          <p style={{
            fontFamily: "-apple-system,sans-serif", fontSize: "clamp(0.8rem,1.4vw,0.95rem)",
            color: "rgba(255,255,255,0.38)", marginTop: "0.875rem", fontWeight: 300,
            opacity: inView ? 1 : 0, transition: "opacity 0.7s ease 0.1s",
          }}>
            No hidden fees. No lock-in. Scale up or down as your team grows.
          </p>
        </div>

        {/* Cards */}
        <div className="pricing-grid">
          {plans.map(({ name, tagline, price, period, color, popular, features, cta, note }, i) => (
            <div
              key={name}
              className={`pricing-card ${popular ? "pricing-card--popular" : ""}`}
              style={{
                "--card-color": color,
                opacity: inView ? 1 : 0,
                transform: inView ? (popular ? "translateY(-8px)" : "none") : "translateY(24px)",
                transition: `opacity 0.6s ease ${i*0.09}s, transform 0.6s ease ${i*0.09}s`,
              } as React.CSSProperties}
            >
              {popular && <div className="pricing-card__badge">Most Popular</div>}

              <div className="pricing-card__header">
                <h3 className="font-display" style={{ fontSize: "clamp(1.1rem,2vw,1.3rem)", fontWeight: 700, color: "white" }}>{name}</h3>
                <p style={{ fontFamily: "-apple-system,sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.38)", marginTop: "0.2rem" }}>{tagline}</p>
              </div>

              <div style={{ marginBottom: "1.75rem" }}>
                <span className="font-display" style={{ fontSize: "clamp(1.8rem,3.5vw,2.5rem)", fontWeight: 700, color }}>{price}</span>
                <span style={{ fontFamily: "-apple-system,sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", marginLeft: "0.25rem" }}>{period}</span>
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.75rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {features.map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: "2px" }}>
                      <circle cx="7" cy="7" r="6" stroke={color} strokeWidth="0.8" />
                      <path d="M4.5 7l2 2 3-3" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontFamily: "-apple-system,sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.58)" }}>{f}</span>
                  </li>
                ))}
              </ul>

              {/* Conditions note */}
              {note && (
                <div style={{ marginBottom: "1.25rem", padding: "0.5rem 0.75rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "2px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5.5" stroke="rgba(255,255,255,0.25)"/><path d="M6 5v4M6 3.5v.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeLinecap="round"/></svg>
                  <span style={{ fontFamily: "-apple-system,sans-serif", fontSize: "0.65rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em" }}>{note}</span>
                </div>
              )}

              <a
                href="#contact"
                className={popular ? "btn-gold" : "pricing-card__cta-outline"}
                style={popular ? { width: "100%", justifyContent: "center" } : { borderColor: `${color}60`, color }}
              >
                {cta}
              </a>
            </div>
          ))}
        </div>

        {/* Conditions footnote */}
        <div style={{ marginTop: "2.5rem", padding: "1.25rem 1.5rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "4px", display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
            <circle cx="8" cy="8" r="7" stroke="rgba(201,168,76,0.4)" strokeWidth="1.2"/>
            <path d="M8 7v5M8 5v.5" stroke="#c9a84c" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <div>
            <p style={{ fontFamily: "-apple-system,sans-serif", fontSize: "0.82rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: "0.25rem" }}>
              * Conditions Apply
            </p>
            <p style={{ fontFamily: "-apple-system,sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
              All monthly plans are based on 10 hours per day usage, 5-day week (Mon–Sat). Additional hours and weekend access available on request. All prices exclusive of GST. Annual plans receive 15% discount.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(5,1fr);
          gap: 1.25rem;
          align-items: start;
        }
        .pricing-card {
          position: relative;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 4px;
          padding: clamp(1.5rem,3vw,2rem);
        }
        .pricing-card--popular {
          background: rgba(201,168,76,0.05);
          border-color: rgba(201,168,76,0.3);
        }
        .pricing-card__badge {
          position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
          background: linear-gradient(90deg,#8b6914,#c9a84c);
          color: white; font-family: -apple-system,sans-serif;
          font-size: 0.6rem; font-weight: 700; letter-spacing: 0.16em;
          text-transform: uppercase; padding: 0.28rem 1rem;
          border-radius: 0 0 4px 4px; white-space: nowrap;
        }
        .pricing-card__header { margin-bottom: 1.5rem; padding-top: 0.5rem; }
        .pricing-card--popular .pricing-card__header { padding-top: 1rem; }
        .pricing-card__cta-outline {
          display: block; text-align: center; text-decoration: none;
          padding: 0.8rem; border: 1px solid rgba(255,255,255,0.15);
          font-family: -apple-system,sans-serif; font-size: 0.72rem; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase; border-radius: 2px;
          transition: all 0.25s ease;
        }
        .pricing-card__cta-outline:hover { background: rgba(255,255,255,0.05); }

        @media (max-width: 1280px) { .pricing-grid { grid-template-columns: repeat(3,1fr); } }
        @media (max-width: 900px)  { .pricing-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 540px)  { .pricing-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}
