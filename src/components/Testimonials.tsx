"use client";

import { useEffect, useRef, useState } from "react";

const testimonials = [
  { quote: "Nest Vault transformed how our team works. The private cabin feels like our own office but with the energy of a thriving community. The Italian marble interiors make every client meeting a statement.", author: "Arjun Reddy", role: "Co-founder", company: "TechScale India", initials: "AR", color: "#c9a84c" },
  { quote: "I've worked from co-working spaces across Bangalore and Hyderabad. Nest Vault is in a different league — the internet never drops, the coffee is exceptional, and the team genuinely cares.", author: "Priya Nambiar", role: "Independent Consultant", company: "Strategy & Operations", initials: "PN", color: "#2d9e7e" },
  { quote: "We moved our 12-person team here six months ago and won't look back. Our investors always comment on how impressive the space looks on Zoom calls. Worth every rupee.", author: "Vikram Chandra", role: "CEO", company: "Fintech Startup", initials: "VC", color: "#4a90e2" },
  { quote: "As a freelancer, the day pass option let me try it first. Three days later I signed up for a dedicated desk. The community events alone have brought me two major clients.", author: "Deepika Sharma", role: "UI/UX Designer", company: "Freelance", initials: "DS", color: "#9b59b6" },
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

export default function Testimonials() {
  const { ref, inView } = useInView();
  const [active, setActive] = useState(0);

  return (
    <section id="community" className="section-pad" style={{ background: "var(--warm-white)" }}>
      <div className="container">

        {/* Header */}
        <div ref={ref} style={{ marginBottom: "clamp(2rem,5vw,3.5rem)" }}>
          <div className="divider-gold" style={{ marginBottom: "1.25rem" }} />
          <p className="label" style={{ color: "#8b6914", marginBottom: "0.875rem" }}>Member Stories</p>
          <h2
            className="h-section"
            style={{
              color: "var(--text-primary)", maxWidth: "420px",
              opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(20px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
          >
            Trusted by <em style={{ fontStyle: "italic", color: "#8b6914" }}>Hyderabad&apos;s</em>
            <br />best builders
          </h2>
        </div>

        {/* Main layout */}
        <div className="testi-layout">

          {/* Author selector — vertical on desktop, horizontal scroll on mobile */}
          <div className="testi-authors">
            {testimonials.map(({ author, role, initials, color }, i) => (
              <button
                key={author}
                onClick={() => setActive(i)}
                className={`testi-author ${active === i ? "testi-author--active" : ""}`}
                style={{ "--author-color": color } as React.CSSProperties}
              >
                <div
                  className="testi-author__avatar"
                  style={{ background: active === i ? color : "var(--border)" }}
                >
                  <span style={{ fontFamily: "-apple-system,sans-serif", fontSize: "0.72rem", fontWeight: 700, color: active === i ? "white" : "var(--text-muted)" }}>
                    {initials}
                  </span>
                </div>
                <div className="testi-author__info">
                  <div style={{ fontFamily: "-apple-system,sans-serif", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2 }}>{author}</div>
                  <div style={{ fontFamily: "-apple-system,sans-serif", fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>{role}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Quote */}
          <div key={active} className="testi-quote" style={{ opacity: inView ? 1 : 0, transition: "opacity 0.5s ease" }}>
            <blockquote style={{
              fontFamily: "Georgia,serif",
              fontSize: "clamp(1rem,2vw,1.35rem)",
              lineHeight: 1.78,
              color: "var(--text-primary)",
              fontStyle: "italic",
              marginBottom: "2rem",
              position: "relative",
            }}>
              <span style={{
                position: "absolute", top: "-1rem", left: "-0.5rem",
                fontSize: "4rem", lineHeight: 1,
                color: testimonials[active].color, opacity: 0.15,
                fontFamily: "Georgia,serif", pointerEvents: "none",
              }}>&ldquo;</span>
              &ldquo;{testimonials[active].quote}&rdquo;
            </blockquote>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: testimonials[active].color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "-apple-system,sans-serif", fontSize: "0.85rem",
                fontWeight: 700, color: "white", flexShrink: 0,
              }}>
                {testimonials[active].initials}
              </div>
              <div>
                <div className="font-display" style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  {testimonials[active].author}
                </div>
                <div style={{ fontFamily: "-apple-system,sans-serif", fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                  {testimonials[active].role} · {testimonials[active].company}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "3px", marginTop: "1.25rem" }}>
              {Array.from({length:5}).map((_,i)=>(
                <svg key={i} width="14" height="14" viewBox="0 0 16 16" fill={testimonials[active].color}>
                  <path d="M8 1l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L2.2 5.2l4-.6z"/>
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .testi-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: clamp(2rem,5vw,4rem);
          align-items: start;
        }
        .testi-authors {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
        }
        .testi-author {
          display: flex; align-items: center; gap: 0.875rem;
          padding: 1rem 1.25rem;
          background: var(--warm-white);
          border: none; border-left: 3px solid transparent;
          cursor: pointer; text-align: left;
          transition: all 0.3s ease;
        }
        .testi-author--active {
          background: white;
          border-left-color: var(--author-color, #c9a84c);
        }
        .testi-author__avatar {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: background 0.3s ease;
        }
        .testi-author__info { min-width: 0; }
        .testi-quote { padding-top: 0.5rem; }

        @media (max-width: 768px) {
          .testi-layout { grid-template-columns: 1fr; gap: 2rem; }
          .testi-authors {
            flex-direction: row; overflow-x: auto;
            scrollbar-width: none; background: none; border: none;
            gap: 0.5rem;
          }
          .testi-authors::-webkit-scrollbar { display: none; }
          .testi-author {
            flex-direction: column; align-items: center; text-align: center;
            padding: 0.75rem 1rem; min-width: 100px;
            border: 1px solid var(--border); border-left: 1px solid var(--border);
            border-radius: 4px; gap: 0.5rem;
          }
          .testi-author--active { border-color: var(--author-color, #c9a84c); background: white; }
          .testi-author__info div:last-child { display: none; }
        }
        @media (max-width: 480px) {
          .testi-quote blockquote { font-size: 0.95rem; }
        }
      `}</style>
    </section>
  );
}
