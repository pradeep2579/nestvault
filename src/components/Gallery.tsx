"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const photos = [
  {
    src: "/images/reception.jpg",
    label: "Reception & Lobby",
    desc: "Marble reception desk with gold accents, arch logo wall, and lush greenery welcoming every visitor.",
    span: "col-span-2",
    height: 360,
  },
  {
    src: "/images/corridor.jpg",
    label: "Private Cabin Corridor",
    desc: "Frosted glass-walled cabins along a blue-striped carpeted corridor — privacy with an open feel.",
    span: "col-span-1",
    height: 360,
  },
  {
    src: "/images/lounge-dusk.jpg",
    label: "Lounge & Breakout",
    desc: "Royal blue velvet sofas with panoramic city views — perfect for informal meetings or a mental reset.",
    span: "col-span-1",
    height: 360,
  },
  {
    src: "/images/open-workspace-2.jpg",
    label: "Open Workspace",
    desc: "Spacious floor-to-ceiling windows, dedicated desks, and shared glass-cabin clusters for teams.",
    span: "col-span-2",
    height: 360,
  },
  {
    src: "/images/boardroom.jpg",
    label: "Executive Boardroom",
    desc: "10-seat white conference table, 4K TV, and premium AV — built for decisions that matter.",
    span: "col-span-1",
    height: 360,
  },
  {
    src: "/images/cafeteria.jpg",
    label: "Cafeteria & Pantry",
    desc: "Vibrant breakout café with colourful seating, barista station, and fully stocked pantry.",
    span: "col-span-1",
    height: 360,
  },
  {
    src: "/images/hot-desk.jpg",
    label: "Dedicated Desks",
    desc: "Yellow-panelled ergonomic workstations with personal power points — your seat, every single day.",
    span: "col-span-1",
    height: 360,
  },
  {
    src: "/images/meeting-room-small-2.jpg",
    label: "Small Meeting Room",
    desc: "Intimate 4-seat cabin with round table, red chairs, and a smart TV — ideal for quick syncs.",
    span: "col-span-1",
    height: 360,
  },
  {
    src: "/images/logo-wall.jpg",
    label: "The Signature Wall",
    desc: "Our iconic gold orbital sculpture in a backlit arch — a statement that sets the tone.",
    span: "col-span-1",
    height: 360,
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

export default function Gallery() {
  const { ref, inView } = useInView();
  const [hovered, setHovered] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <section id="gallery" className="section-pad" style={{ background: "#0a0a0a", color: "white" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 2rem" }}>
        {/* Header */}
        <div ref={ref} style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div className="divider-gold" style={{ margin: "0 auto 1.5rem" }} />
          <p style={{ fontFamily: "-apple-system, sans-serif", fontSize: "0.72rem", letterSpacing: "0.22em", color: "#c9a84c", textTransform: "uppercase", marginBottom: "1rem" }}>
            Space Tour
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(2rem, 3.5vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              opacity: inView ? 1 : 0,
              transform: inView ? "none" : "translateY(20px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
          >
            See it to <span className="text-gold-gradient">believe it</span>
          </h2>
        </div>

        {/* Grid */}
        <div className="gallery-grid">
          {photos.map(({ src, label, desc, span, height }, i) => (
            <div
              key={src}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setLightbox(i)}
              className={span === "col-span-2" ? "gallery-item gallery-item--wide" : "gallery-item"}
              style={{
                position: "relative",
                height: `clamp(200px, ${height / 4}vw, ${height}px)`,
                borderRadius: "4px",
                overflow: "hidden",
                cursor: "zoom-in",
                opacity: inView ? 1 : 0,
                transform: inView ? "none" : "scale(0.97)",
                transition: `opacity 0.6s ease ${i * 0.06}s, transform 0.6s ease ${i * 0.06}s`,
              }}
            >
              <Image
                src={src}
                alt={label}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{
                  objectFit: "cover",
                  transform: hovered === i ? "scale(1.05)" : "scale(1)",
                  transition: "transform 0.6s cubic-bezier(0.16,1,0.3,1)",
                }}
              />
              {/* Dark overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: hovered === i
                    ? "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)"
                    : "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)",
                  transition: "background 0.4s ease",
                }}
              />
              {/* Label */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "1.5rem",
                  transform: hovered === i ? "translateY(0)" : "translateY(4px)",
                  transition: "transform 0.4s ease",
                }}
              >
                <div style={{ fontFamily: "Georgia, serif", fontSize: "1rem", fontWeight: 700, color: "white", marginBottom: "0.35rem" }}>
                  {label}
                </div>
                <div
                  style={{
                    fontFamily: "-apple-system, sans-serif",
                    fontSize: "0.78rem",
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: 1.5,
                    maxHeight: hovered === i ? "60px" : "0",
                    overflow: "hidden",
                    transition: "max-height 0.4s ease",
                  }}
                >
                  {desc}
                </div>
              </div>
              {/* Gold bottom line */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  height: "2px",
                  width: hovered === i ? "100%" : "0%",
                  background: "linear-gradient(90deg, #c9a84c, transparent)",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <a href="#contact" className="btn-outline" style={{ borderColor: "rgba(201,168,76,0.4)", color: "#c9a84c" }}>
            Schedule a Physical Tour →
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.92)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            cursor: "zoom-out",
          }}
        >
          <div style={{ position: "relative", maxWidth: "1100px", width: "100%", maxHeight: "85vh" }}>
            <Image
              src={photos[lightbox].src}
              alt={photos[lightbox].label}
              width={1344}
              height={1008}
              style={{ width: "100%", height: "auto", maxHeight: "85vh", objectFit: "contain", borderRadius: "4px" }}
              onClick={(e) => e.stopPropagation()}
            />
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "white" }}>
                {photos[lightbox].label}
              </div>
            </div>
            {/* Prev / Next */}
            {lightbox > 0 && (
              <button onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }}
                style={{ position: "absolute", left: "-3.5rem", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.1)", border: "none", color: "white", width: "44px", height: "44px", borderRadius: "50%", cursor: "pointer", fontSize: "1.2rem" }}>
                ‹
              </button>
            )}
            {lightbox < photos.length - 1 && (
              <button onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }}
                style={{ position: "absolute", right: "-3.5rem", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.1)", border: "none", color: "white", width: "44px", height: "44px", borderRadius: "50%", cursor: "pointer", fontSize: "1.2rem" }}>
                ›
              </button>
            )}
            <button onClick={() => setLightbox(null)}
              style={{ position: "absolute", top: "-2.5rem", right: 0, background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "1.5rem" }}>
              ✕
            </button>
          </div>
        </div>
      )}

      <style>{`
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 10px;
        }
        .gallery-item { border-radius: 4px; overflow: hidden; cursor: zoom-in; }
        .gallery-item--wide { grid-column: span 2; }

        @media (max-width: 900px) {
          .gallery-grid { grid-template-columns: 1fr 1fr; }
          .gallery-item--wide { grid-column: span 2; }
        }
        @media (max-width: 540px) {
          .gallery-grid { grid-template-columns: 1fr; }
          .gallery-item--wide { grid-column: span 1; }
        }
      `}</style>
    </section>
  );
}
