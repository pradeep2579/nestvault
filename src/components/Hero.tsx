"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

/* ─── types ─── */
interface Particle {
  x: number; y: number; vx: number; vy: number;
  r: number; a: number; pulse: number; pSpeed: number;
}

/* ─── helpers ─── */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ─── data ─── */
const BG_PHOTOS = [
  { src: "/images/lounge-dusk.jpg",      label: "Executive Lounge" },
  { src: "/images/reception.jpg",         label: "Reception & Lobby" },
  { src: "/images/open-workspace-2.jpg",  label: "Open Workspace" },
  { src: "/images/corridor.jpg",          label: "Private Cabin Row" },
];

/* ─── 3-D tilt card ─── */
function TiltCard({ label, seats, available, color, animDelay }:
  { label: string; seats: string; available: boolean; color: string; animDelay: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const { left, top, width, height } = card.getBoundingClientRect();
    const x = ((e.clientX - left) / width  - 0.5) * 22;
    const y = ((e.clientY - top)  / height - 0.5) * 22;
    card.style.transform = `perspective(600px) rotateY(${x}deg) rotateX(${-y}deg) scale(1.04)`;
  }, []);

  const onLeave = useCallback(() => {
    if (cardRef.current)
      cardRef.current.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)";
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        padding: "1rem 1.25rem",
        minWidth: "190px",
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid rgba(255,255,255,0.1)`,
        borderRadius: "6px",
        cursor: "default",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        willChange: "transform",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        animation: `fadeInRight 0.7s cubic-bezier(0.16,1,0.3,1) ${animDelay}s both`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
        <span style={{ fontFamily: "-apple-system, sans-serif", fontSize: "0.82rem", fontWeight: 600, color: "white" }}>
          {label}
        </span>
        <span style={{
          width: 8, height: 8, borderRadius: "50%", marginTop: 3, flexShrink: 0,
          background: available ? "#4caf50" : "#ff6b35",
          boxShadow: available ? "0 0 8px rgba(76,175,80,0.7)" : "0 0 8px rgba(255,107,53,0.7)",
        }} />
      </div>
      <div style={{ fontFamily: "-apple-system, sans-serif", fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", letterSpacing: "0.05em" }}>
        {seats}
      </div>
      <div style={{
        fontFamily: "-apple-system, sans-serif", fontSize: "0.62rem",
        color: available ? "#4caf50" : "#ff6b35",
        marginTop: "0.35rem", letterSpacing: "0.1em", textTransform: "uppercase",
      }}>
        {available ? "Available now" : "Nearly full"}
      </div>
      {/* Shimmer line */}
      <div style={{
        height: "1px", marginTop: "0.75rem",
        background: `linear-gradient(90deg, transparent, ${color}60, transparent)`,
      }} />
    </div>
  );
}

/* ─── main component ─── */
export default function Hero() {
  const bgRef      = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const ambientRef = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const mouse      = useRef({ x: 0.5, y: 0.5 });
  const smoothMouse = useRef({ x: 0.5, y: 0.5 });
  const rafRef     = useRef<number>(0);
  const particles  = useRef<Particle[]>([]);

  const [photoIdx,  setPhotoIdx]  = useState(0);
  const [loaded,    setLoaded]    = useState(false);

  /* load flag — triggers text animations */
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  /* photo carousel */
  useEffect(() => {
    const iv = setInterval(() => {
      setPhotoIdx(i => (i + 1) % BG_PHOTOS.length);
    }, 6500);
    return () => clearInterval(iv);
  }, []);

  /* main animation loop */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d") ?? null;

    const resize = () => {
      if (!canvas) return;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    /* init particles */
    const N = Math.min(75, Math.floor((window.innerWidth * window.innerHeight) / 15000));
    particles.current = Array.from({ length: N }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r:  Math.random() * 1.4 + 0.4,
      a:  Math.random() * 0.35 + 0.08,
      pulse: Math.random() * Math.PI * 2,
      pSpeed: 0.012 + Math.random() * 0.018,
    }));

    const onMouse = (e: MouseEvent) => {
      mouse.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
    };
    window.addEventListener("mousemove", onMouse);

    let scrollY = 0;
    const onScroll = () => { scrollY = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });

    const loop = () => {
      smoothMouse.current.x = lerp(smoothMouse.current.x, mouse.current.x, 0.055);
      smoothMouse.current.y = lerp(smoothMouse.current.y, mouse.current.y, 0.055);
      const sx = smoothMouse.current.x;
      const sy = smoothMouse.current.y;

      /* ── background parallax + scroll zoom */
      if (bgRef.current) {
        const tx    = (sx - 0.5) * -48;
        const ty    = (sy - 0.5) * -28 + scrollY * 0.22;
        const scale = 1.1 + scrollY * 0.00025;
        bgRef.current.style.transform = `translate(${tx}px,${ty}px) scale(${scale})`;
      }

      /* ── content counter-parallax + scroll fade */
      if (contentRef.current) {
        const tx = (sx - 0.5) * 16;
        const ty = (sy - 0.5) * 9  - scrollY * 0.12;
        const op = Math.max(0, 1 - scrollY / 520);
        contentRef.current.style.transform = `translate(${tx}px,${ty}px)`;
        contentRef.current.style.opacity   = String(op);
      }

      /* ── ambient glow tracks cursor */
      if (ambientRef.current) {
        ambientRef.current.style.background =
          `radial-gradient(ellipse 55% 45% at ${sx * 100}% ${sy * 100}%, rgba(201,168,76,0.08) 0%, transparent 70%)`;
      }

      /* ── particles */
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const mx = sx * canvas.width;
        const my = sy * canvas.height;
        const ps = particles.current;

        ps.forEach(p => {
          const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy);
          if (d < 140) { p.vx += (dx / d) * 0.055; p.vy += (dy / d) * 0.055; }
          p.vx *= 0.988; p.vy *= 0.988;
          p.x += p.vx; p.y += p.vy;
          p.pulse += p.pSpeed;
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;
          const alpha = p.a * (0.65 + 0.35 * Math.sin(p.pulse));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(201,168,76,${alpha})`;
          ctx.fill();
        });

        /* connections */
        for (let i = 0; i < ps.length; i++) {
          for (let j = i + 1; j < ps.length; j++) {
            const dx = ps[i].x - ps[j].x, dy = ps[i].y - ps[j].y;
            const d = Math.hypot(dx, dy);
            if (d < 115) {
              ctx.beginPath();
              ctx.moveTo(ps[i].x, ps[i].y);
              ctx.lineTo(ps[j].x, ps[j].y);
              ctx.strokeStyle = `rgba(201,168,76,${0.11 * (1 - d / 115)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize",    resize);
      window.removeEventListener("scroll",    onScroll);
    };
  }, []);

  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", background: "#050505" }}>

      {/* ─── keyframe styles ─── */}
      <style>{`
        @keyframes wordReveal {
          from { opacity: 0; transform: translateY(60px); filter: blur(10px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes scrollPulse {
          0%,100% { opacity: 0.3; transform: scaleY(1);   }
          50%     { opacity: 0.9; transform: scaleY(1.15); }
        }
        @keyframes dotPulse {
          0%,100% { opacity: 0.6; transform: scale(1); }
          50%     { opacity: 1;   transform: scale(1.2); }
        }
        .hero-tilt-cards { display: flex; }
        @media (max-width: 900px)  { .hero-tilt-cards { display: none !important; } }

        /* Hero content responsive */
        .hero-content-inner { max-width: 680px; padding: 0 clamp(1rem,4vw,2rem); }
        .hero-stats-row {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 0;
          margin-top: clamp(2.5rem,5vw,4rem);
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: clamp(1.5rem,3vw,2rem);
        }
        .hero-stat-item {
          padding-right: 1rem;
          border-right: 1px solid rgba(255,255,255,0.08);
          padding-left: 1rem;
        }
        .hero-stat-item:first-child { padding-left: 0; }
        .hero-stat-item:last-child  { border-right: none; }

        @media (max-width: 640px) {
          .hero-stats-row { grid-template-columns: 1fr 1fr; gap: 1rem 0; }
          .hero-stat-item { padding: 0.75rem 0.5rem; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
          .hero-stat-item:nth-child(odd) { padding-left: 0; }
          .hero-stat-item:last-child, .hero-stat-item:nth-last-child(2) { border-bottom: none; }
        }
        @media (max-width: 480px) {
          .hero-content-inner { padding: 0 1rem; }
        }
      `}</style>

      {/* ─── parallax photo background ─── */}
      <div
        ref={bgRef}
        style={{ position: "absolute", inset: "-9%", zIndex: 0, willChange: "transform" }}
      >
        {BG_PHOTOS.map((p, i) => (
          <Image
            key={p.src}
            src={p.src}
            alt={p.label}
            fill
            priority={i === 0}
            sizes="120vw"
            style={{
              objectFit: "cover",
              opacity: i === photoIdx ? 0.38 : 0,
              transition: "opacity 1.6s cubic-bezier(0.4,0,0.2,1)",
              willChange: "opacity",
            }}
          />
        ))}
        {/* Layered overlays for depth */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 90% at 50% 50%, rgba(5,5,5,0.15) 0%, rgba(5,5,5,0.65) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,5,5,0.5) 0%, transparent 20%, transparent 55%, rgba(5,5,5,1) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(5,5,5,0.55) 0%, transparent 45%, transparent 70%, rgba(5,5,5,0.25) 100%)" }} />
      </div>

      {/* ─── film grain ─── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", opacity: 0.032,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "180px 180px",
      }} />

      {/* ─── ambient cursor glow ─── */}
      <div ref={ambientRef} style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }} />

      {/* ─── particles canvas ─── */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }} />

      {/* ─── main content ─── */}
      <div
        ref={contentRef}
        style={{
          position: "relative", zIndex: 3,
          maxWidth: "1400px", margin: "0 auto",
          width: "100%",
          paddingTop: "clamp(5rem,10vh,7rem)",
          paddingBottom: "clamp(4rem,8vh,5rem)",
          willChange: "transform, opacity",
        }}
      >
        <div className="hero-content-inner">

          {/* Badge */}
          {loaded && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.75rem",
              marginBottom: "2.5rem",
              animation: "fadeInUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.4rem 1.1rem",
                border: "1px solid rgba(201,168,76,0.3)",
                background: "rgba(201,168,76,0.05)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderRadius: "2px",
                fontFamily: "-apple-system, sans-serif",
                fontSize: "0.72rem", letterSpacing: "0.2em",
                color: "#c9a84c", textTransform: "uppercase",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#c9a84c", animation: "dotPulse 2s ease-in-out infinite" }} />
                Now Open · Jubilee Hills, Hyderabad
              </div>
            </div>
          )}

          {/* Kinetic headline — word-by-word reveal */}
          <h1 style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(2rem, 3.5vw, 3.5rem)",
            fontWeight: 700, lineHeight: 1.12,
            letterSpacing: "-0.025em", color: "#fff",
            marginBottom: "1.25rem",
          }}>
            {loaded && [
              { w: "Where",    d: "0.18s", gold: false },
              { w: "Ambition", d: "0.30s", gold: false },
              { w: "Finds",    d: "0.42s", gold: false },
              { w: "Its",      d: "0.54s", gold: false },
              { w: "Space",    d: "0.66s", gold: true  },
            ].map(({ w, d, gold }) => (
              <span
                key={w}
                style={{
                  display: "inline-block", marginRight: "0.28em",
                  animation: `wordReveal 1s cubic-bezier(0.16,1,0.3,1) ${d} both`,
                  ...(gold ? {
                    background: "linear-gradient(135deg, #8b6914 0%, #c9a84c 45%, #f0d880 65%, #c9a84c 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  } : {}),
                }}
              >
                {w}
              </span>
            ))}
          </h1>

          {/* Sub-headline */}
          {loaded && (
            <p style={{
              fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
              fontSize: "clamp(1rem, 1.8vw, 1.18rem)",
              lineHeight: 1.78, color: "rgba(255,255,255,0.52)",
              maxWidth: "510px", marginBottom: "3rem", fontWeight: 300,
              animation: "fadeInUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.88s both",
            }}>
              Hyderabad&apos;s most refined co-working ecosystem — private cabins,
              dedicated desks, meeting suites, and a vibrant founder community at
              Jubilee Hills.
            </p>
          )}

          {/* CTAs */}
          {loaded && (
            <div style={{
              display: "flex", gap: "1rem", flexWrap: "wrap",
              animation: "fadeInUp 0.8s cubic-bezier(0.16,1,0.3,1) 1.05s both",
            }}>
              <a href="#contact" className="btn-gold" style={{ fontSize: "0.82rem", padding: "1rem 2.25rem" }}>
                Book a Free Tour
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </a>
              <a href="#workspaces" className="btn-outline" style={{ fontSize: "0.82rem", padding: "1rem 2.25rem" }}>
                Explore Spaces
              </a>
            </div>
          )}

          {/* Stats row */}
          {loaded && (
            <div
              className="hero-stats-row"
              style={{ animation: "fadeInUp 0.8s cubic-bezier(0.16,1,0.3,1) 1.25s both" }}
            >
              {[
                { value: "500+", label: "Seats Available" },
                { value: "24/7", label: "Access" },
                { value: "180m", label: "From Metro" },
                { value: "50+",  label: "Member Companies" },
              ].map(({ value, label }) => (
                <div key={label} className="hero-stat-item">
                  <div style={{
                    fontFamily: "Georgia, serif", fontSize: "1.7rem", fontWeight: 700, lineHeight: 1,
                    background: "linear-gradient(135deg, #8b6914 0%, #c9a84c 50%, #e8c97a 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>
                    {value}
                  </div>
                  <div style={{
                    fontFamily: "-apple-system, sans-serif", fontSize: "0.67rem",
                    letterSpacing: "0.14em", color: "rgba(255,255,255,0.33)",
                    textTransform: "uppercase", marginTop: "0.4rem",
                  }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── 3-D tilt availability cards ─── */}
      <div
        className="hero-tilt-cards"
        style={{
          position: "absolute", right: "4%", top: "50%",
          transform: "translateY(-50%)",
          flexDirection: "column", gap: "0.875rem", zIndex: 4,
        }}
      >
        {[
          { label: "Private Cabin", seats: "2–17 seats", available: true,  color: "#c9a84c", delay: 1.5 },
          { label: "Meeting Room",  seats: "8–12 seats", available: true,  color: "#4a90e2", delay: 1.65 },
          { label: "Open Desk",     seats: "Hot-desk",   available: false, color: "#2d9e7e", delay: 1.8 },
        ].map(c => <TiltCard key={c.label} {...c} animDelay={c.delay} />)}
      </div>

      {/* ─── photo indicator dots ─── */}
      <div style={{
        position: "absolute", bottom: "2.5rem", left: "50%",
        transform: "translateX(-50%)", zIndex: 4,
        display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem",
      }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {BG_PHOTOS.map((_, i) => (
            <button
              key={i}
              onClick={() => setPhotoIdx(i)}
              aria-label={`Photo ${i + 1}`}
              style={{
                width: i === photoIdx ? "28px" : "6px", height: "6px",
                borderRadius: "3px", border: "none", cursor: "pointer", padding: 0,
                background: i === photoIdx ? "#c9a84c" : "rgba(255,255,255,0.2)",
                transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontFamily: "-apple-system, sans-serif", fontSize: "0.6rem", letterSpacing: "0.22em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}>
            Scroll
          </span>
          <div style={{ width: "1px", height: "44px", background: "linear-gradient(180deg, rgba(201,168,76,0.7), transparent)", animation: "scrollPulse 2.2s ease-in-out infinite" }} />
        </div>
      </div>

      {/* ─── current photo label ─── */}
      {loaded && (
        <div style={{
          position: "absolute", bottom: "2.8rem", right: "2rem", zIndex: 4,
          display: "flex", alignItems: "center", gap: "0.75rem",
          animation: "fadeInUp 0.7s ease 1.5s both",
        }}>
          <div style={{ width: "28px", height: "1px", background: "rgba(201,168,76,0.35)" }} />
          <span style={{
            fontFamily: "-apple-system, sans-serif", fontSize: "0.62rem",
            letterSpacing: "0.16em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
          }}>
            {BG_PHOTOS[photoIdx].label}
          </span>
          <span style={{
            fontFamily: "-apple-system, sans-serif", fontSize: "0.6rem",
            color: "rgba(255,255,255,0.18)", letterSpacing: "0.08em",
          }}>
            {String(photoIdx + 1).padStart(2, "0")} / {String(BG_PHOTOS.length).padStart(2, "0")}
          </span>
        </div>
      )}

    </section>
  );
}
