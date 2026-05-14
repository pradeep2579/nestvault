"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 500, suffix: "+", label: "Workstations" },
  { value: 50,  suffix: "+", label: "Member Companies" },
  { value: 24,  suffix: "/7", label: "Access & Security" },
  { value: 180, suffix: "m", label: "From Metro" },
];

function useInView(threshold = 0.15) {
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

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView();
  useEffect(() => {
    if (!inView) return;
    const inc = target / (1800 / 16);
    let cur = 0;
    const t = setInterval(() => {
      cur += inc;
      if (cur >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(cur));
    }, 16);
    return () => clearInterval(t);
  }, [inView, target]);
  return (
    <div ref={ref}>
      <span className="font-display" style={{ fontSize: "clamp(1.8rem,3.5vw,2.75rem)", fontWeight: 700, color: "#c9a84c", lineHeight: 1 }}>
        {count}{suffix}
      </span>
    </div>
  );
}

const features = [
  { icon: "◇", title: "Premium Interiors",    desc: "Italian marble, designer LED lighting, and curated aesthetics throughout" },
  { icon: "⚡", title: "Dual Internet",         desc: "1 Gbps fibre + dedicated leased line backup for zero downtime" },
  { icon: "🔒", title: "24/7 Security",         desc: "CCTV, biometric access, and professional security personnel" },
  { icon: "☕", title: "Hospitality Suite",     desc: "Premium coffee, tea, and a fully stocked cafeteria for members" },
  { icon: "📞", title: "Reception Service",    desc: "Dedicated front-desk staff for mail, visitors, and calls" },
  { icon: "🏢", title: "Business Address",     desc: "Prestigious Jubilee Hills address for virtual or physical offices" },
];

export default function About() {
  const { ref, inView } = useInView();
  return (
    <section id="about" className="section-pad" style={{ background: "#0a0a0a", color: "white" }}>
      <div className="container">
        <div className="about-grid" ref={ref}>

          {/* Left */}
          <div style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(24px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
            <div className="divider-gold" style={{ marginBottom: "1.25rem" }} />
            <p className="label" style={{ marginBottom: "1rem" }}>About Nest Vault</p>
            <h2 className="h-section" style={{ color: "white", marginBottom: "1.5rem" }}>
              A workspace that<br />
              <span className="text-gold-gradient">elevates ambition</span>
            </h2>
            <p style={{ fontFamily: "-apple-system,sans-serif", fontSize: "clamp(0.875rem,1.5vw,1rem)", lineHeight: 1.85, color: "rgba(255,255,255,0.55)", marginBottom: "1rem", fontWeight: 300 }}>
              Nest Vault was born from a simple conviction: the space where you work shapes the quality of your thinking. Nestled 180 metres from Madhapur Metro Station in Jubilee Hills, we have crafted an environment that merges luxury hospitality with intelligent workspace infrastructure.
            </p>
            <p style={{ fontFamily: "-apple-system,sans-serif", fontSize: "clamp(0.875rem,1.5vw,1rem)", lineHeight: 1.85, color: "rgba(255,255,255,0.55)", fontWeight: 300 }}>
              Italian marble accents, designer lighting, and ergonomic furnishings coexist with enterprise-grade connectivity, 24×7 access, and a thriving community of founders, creators, and teams.
            </p>

            {/* Stats */}
            <div className="about-stats">
              {stats.map(({ value, suffix, label }) => (
                <div key={label} style={{ borderTop: "1px solid rgba(201,168,76,0.18)", paddingTop: "1.25rem" }}>
                  <Counter target={value} suffix={suffix} />
                  <div style={{ fontFamily: "-apple-system,sans-serif", fontSize: "0.68rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.38)", textTransform: "uppercase", marginTop: "0.4rem" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — feature cards */}
          <div
            className="about-features"
            style={{ opacity: inView ? 1 : 0, transition: "opacity 0.8s ease 0.25s" }}
          >
            {features.map(({ icon, title, desc }, i) => (
              <div
                key={title}
                className="about-feature-card card-hover"
                style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(20px)", transition: `opacity 0.5s ease ${i*0.06}s, transform 0.5s ease ${i*0.06}s` }}
              >
                <div style={{ fontSize: "1.1rem", marginBottom: "0.625rem" }}>{icon}</div>
                <div style={{ fontFamily: "-apple-system,sans-serif", fontSize: "0.85rem", fontWeight: 600, color: "white", marginBottom: "0.4rem" }}>{title}</div>
                <div style={{ fontFamily: "-apple-system,sans-serif", fontSize: "0.75rem", lineHeight: 1.6, color: "rgba(255,255,255,0.42)" }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(2.5rem,5vw,5rem);
          align-items: center;
        }
        .about-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-top: 2.5rem;
        }
        .about-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.875rem;
        }
        .about-feature-card {
          padding: 1.25rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 2px;
          cursor: default;
        }
        @media (max-width: 1024px) {
          .about-features { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr; gap: 3rem; }
        }
        @media (max-width: 480px) {
          .about-stats { grid-template-columns: 1fr 1fr; gap: 1rem; }
          .about-features { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </section>
  );
}
