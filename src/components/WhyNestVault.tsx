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

const reasons = [
  {
    num: "01",
    title: "Prime Location in the Heart of Hyderabad",
    photo: "/images/entrance-exterior.jpg",
    body: [
      "Hyderabad-based Nest Vault Coworking is strategically located next to the Madhapur Metro Station, offering excellent connectivity and convenience. We provide a range of flexible workspace plans designed to suit the diverse needs of freelancers, entrepreneurs, startup incubators, and small to medium-sized enterprises.",
      "Our coworking space combines comfort, accessibility, and a professional environment to help individuals and businesses work, collaborate, and grow efficiently.",
    ],
    tags: ["180m from Metro", "Road No. 36 Jubilee Hills", "24/7 Access", "360+ days a year"],
  },
  {
    num: "02",
    title: "Community & Networking Opportunities",
    photo: "/images/lounge-dusk.jpg",
    body: [
      "At Nest Vault Coworking, you become part of a vibrant and collaborative professional community where ideas, innovation, and opportunities come together. Connect with like-minded entrepreneurs, freelancers, startups, and business professionals in an environment designed to encourage networking, collaboration, and growth.",
      "Build meaningful relationships, exchange ideas, and grow your professional network while working alongside people who share your vision and ambition.",
    ],
    tags: ["50+ Member Companies", "Startup Community", "Networking Events", "Knowledge Exchange"],
  },
  {
    num: "03",
    title: "State-of-the-Art Amenities for Productivity",
    photo: "/images/open-workspace-2.jpg",
    body: [
      "Experience a modern workspace equipped with state-of-the-art amenities designed to enhance productivity, efficiency, and comfort. Nest Vault Coworking offers high-speed internet, well-designed meeting rooms, comfortable workstations, and a comprehensive range of premium facilities to support your daily business needs.",
      "Whether you are working independently or collaborating with your team, our thoughtfully designed environment helps you stay focused, connected, and productive throughout the day.",
    ],
    tags: ["1 Gbps Internet", "Premium Workstations", "Conference Rooms", "24/7 Security"],
  },
];

type Reason = typeof reasons[0];

function ReasonRow({ reason, reverse }: { reason: Reason; reverse: boolean }) {
  const { ref, inView } = useInView();
  const { num, title, photo, body, tags } = reason;
  return (
    <div ref={ref} className="why-row" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="container">
        <div
          className={`why-row__inner ${reverse ? "why-row__inner--reverse" : ""}`}
          style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(32px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}
        >
          {/* Photo */}
          <div className="why-row__photo">
            <Image src={photo} alt={title} fill sizes="(max-width:768px) 100vw,50vw" style={{ objectFit: "cover", transition: "transform 0.7s ease" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(0,0,0,0.3) 0%,transparent 65%)" }} />
            <div style={{ position: "absolute", top: "1.25rem", left: "1.5rem" }}>
              <span className="font-display" style={{ fontSize: "clamp(3.5rem,7vw,6rem)", fontWeight: 700, color: "rgba(255,255,255,0.1)", lineHeight: 1, userSelect: "none" }}>
                {num}
              </span>
            </div>
          </div>
          {/* Content */}
          <div className="why-row__content">
            <span className="font-display" style={{ fontSize: "clamp(2.5rem,5vw,4.5rem)", fontWeight: 700, color: "rgba(139,105,20,0.07)", lineHeight: 1, display: "block", marginBottom: "-0.25rem", userSelect: "none" }}>
              {num}
            </span>
            <h3 className="h-card" style={{ color: "var(--text-primary)", marginBottom: "1.25rem" }}>{title}</h3>
            {body.map((para, j) => (
              <p key={j} className="body-copy" style={{ color: "var(--text-secondary)", marginBottom: j < body.length - 1 ? "1rem" : "1.75rem" }}>{para}</p>
            ))}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {tags.map(tag => <span key={tag} className="why-tag">{tag}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WhyNestVault() {
  const { ref: headerRef, inView: headerIn } = useInView();

  return (
    <section id="why" style={{ background: "var(--warm-white)", overflow: "hidden" }}>

      {/* Header */}
      <div className="container" style={{ paddingTop: "clamp(4rem,8vw,7rem)" }}>
        <div ref={headerRef} style={{ maxWidth: "700px" }}>
          <div className="divider-gold" style={{ marginBottom: "1.25rem" }} />
          <p className="label" style={{ color: "#8b6914", marginBottom: "1.1rem" }}>Why Choose Us</p>
          <h2
            className="h-section"
            style={{
              color: "var(--text-primary)",
              opacity: headerIn ? 1 : 0,
              transform: headerIn ? "none" : "translateY(24px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
          >
            Why <em style={{ fontStyle: "italic", color: "#8b6914" }}>Nest Vault</em>
            <br />Co-working Spaces?
          </h2>
        </div>
      </div>

      {/* Reason rows */}
      <div style={{ paddingBottom: "clamp(4rem,8vw,7rem)" }}>
        {reasons.map((reason, i) => (
          <ReasonRow key={reason.num} reason={reason} reverse={i % 2 !== 0} />
        ))}
      </div>

      <style>{`
        .why-row { padding: clamp(3rem,6vw,5rem) 0; }
        .why-row__inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(2.5rem,5vw,5rem);
          align-items: center;
        }
        .why-row__inner--reverse { direction: rtl; }
        .why-row__inner--reverse > * { direction: ltr; }

        .why-row__photo {
          position: relative;
          height: clamp(260px, 40vw, 440px);
          border-radius: 6px;
          overflow: hidden;
        }
        .why-row__photo:hover img { transform: scale(1.04); }

        .why-row__content {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .why-tag {
          font-family: -apple-system, sans-serif;
          font-size: 0.78rem;
          font-weight: 500;
          color: #8b6914;
          background: rgba(139,105,20,0.08);
          border: 1px solid rgba(139,105,20,0.2);
          padding: 0.35rem 0.875rem;
          border-radius: 2px;
          letter-spacing: 0.04em;
          transition: all 0.25s ease;
        }
        .why-tag:hover {
          background: rgba(139,105,20,0.14);
          border-color: rgba(139,105,20,0.4);
        }

        @media (max-width: 768px) {
          .why-row__inner, .why-row__inner--reverse {
            grid-template-columns: 1fr;
            direction: ltr;
          }
          .why-row__photo { height: clamp(220px,55vw,320px); }
        }
      `}</style>
    </section>
  );
}
