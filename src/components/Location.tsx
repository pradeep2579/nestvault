"use client";

import { useEffect, useRef, useState } from "react";

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

const details = [
  { icon: "🚇", title: "Metro Access",  detail: "180m walk from Madhapur Metro Station (Blue Line)" },
  { icon: "📍", title: "Address",       detail: "Road No. 36, Jubilee Hills, Hyderabad – 500033" },
  { icon: "🕐", title: "Hours",         detail: "24 × 7 member access · Reception 9 AM – 9 PM Mon–Sat" },
  { icon: "🚗", title: "Parking",       detail: "Basement parking for cars & two-wheelers" },
];

export default function Location() {
  const { ref, inView } = useInView();

  return (
    <section id="location" className="section-pad" style={{ background: "var(--warm-white)" }}>
      <div className="container">
        <div className="location-grid" ref={ref}>

          {/* Left — text */}
          <div style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateX(-24px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
            <div className="divider-gold" style={{ marginBottom: "1.25rem" }} />
            <p className="label" style={{ color: "#8b6914", marginBottom: "0.875rem" }}>Find Us</p>
            <h2 className="h-section" style={{ color: "var(--text-primary)", marginBottom: "1.25rem" }}>
              In the heart of{" "}
              <span className="text-gold-gradient">Jubilee Hills</span>
            </h2>
            <p style={{ fontFamily: "-apple-system,sans-serif", fontSize: "clamp(0.875rem,1.5vw,1rem)", lineHeight: 1.85, color: "var(--text-secondary)", fontWeight: 300, marginBottom: "2rem" }}>
              Strategically located 180 metres from Madhapur Metro Station, Nest Vault sits in Hyderabad&apos;s most coveted business district — surrounded by leading tech companies, premium restaurants, and excellent transport links.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem", marginBottom: "2rem" }}>
              {details.map(({ icon, title, detail }) => (
                <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "2px", background: "rgba(139,105,20,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(0.95rem,1.3vw,1.05rem)", flexShrink: 0 }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: "-apple-system,sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.15rem" }}>{title}</div>
                    <div style={{ fontFamily: "-apple-system,sans-serif", fontSize: "0.78rem", color: "var(--text-secondary)" }}>{detail}</div>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="https://maps.google.com/?q=Road+No+36+Jubilee+Hills+Hyderabad"
              target="_blank" rel="noopener noreferrer"
              className="btn-gold"
            >
              Open in Google Maps
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M10 4L4 10M10 4H6M10 4V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>

          {/* Right — map */}
          <div
            className="location-map"
            style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateX(24px)", transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s" }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30451.938637440267!2d78.39557237431642!3d17.43264990000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb90c4a3b3c407%3A0xfba2a63e8fd29c3a!2sJubilee%20Hills%2C%20Hyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1714904800000!5m2!1sen!2sin"
              width="100%" height="100%"
              style={{ border: 0, display: "block", filter: "grayscale(15%) contrast(1.08)" }}
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              title="Nest Vault Location"
            />
            <div style={{
              position: "absolute", top: "1.25rem", left: "1.25rem",
              padding: "0.625rem 1rem",
              background: "rgba(5,5,5,0.88)", backdropFilter: "blur(12px)",
              borderRadius: "4px", border: "1px solid rgba(201,168,76,0.25)",
            }}>
              <div style={{ fontFamily: "-apple-system,sans-serif", fontSize: "0.6rem", letterSpacing: "0.16em", color: "#c9a84c", textTransform: "uppercase", marginBottom: "0.15rem" }}>Nest Vault</div>
              <div style={{ fontFamily: "-apple-system,sans-serif", fontSize: "0.78rem", color: "white", fontWeight: 600 }}>Jubilee Hills, Hyderabad</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .location-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(2rem,5vw,5rem);
          align-items: center;
        }
        .location-map {
          position: relative;
          height: clamp(300px,50vw,520px);
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid var(--border);
        }
        @media (max-width: 768px) {
          .location-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .location-map  { height: 300px; }
        }
      `}</style>
    </section>
  );
}
