"use client";

import { useEffect, useRef, useState } from "react";

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

export default function SpaceTour() {
  const { ref, inView } = useInView();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [musicOn, setMusicOn] = useState(true);

  function fadeAudio(target: number, duration = 1500) {
    const audio = audioRef.current;
    if (!audio) return;
    const start = audio.volume;
    const startTime = performance.now();
    function step(now: number) {
      const t = Math.min((now - startTime) / duration, 1);
      audio.volume = start + (target - start) * t;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function togglePlay() {
    const v = videoRef.current;
    const a = audioRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
      if (musicOn && a) {
        a.volume = 0;
        a.play();
        fadeAudio(0.45);
      }
    } else {
      v.pause();
      setPlaying(false);
      if (a && !a.paused) {
        fadeAudio(0);
        setTimeout(() => a.pause(), 1600);
      }
    }
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  function toggleMusic() {
    const a = audioRef.current;
    if (!a) return;
    if (musicOn) {
      fadeAudio(0);
      setTimeout(() => a.pause(), 1600);
      setMusicOn(false);
    } else {
      if (playing) {
        a.volume = 0;
        a.play();
        fadeAudio(0.45);
      }
      setMusicOn(true);
    }
  }

  function handleVideoEnd() {
    const a = audioRef.current;
    setPlaying(false);
    if (a && !a.paused) {
      fadeAudio(0);
      setTimeout(() => a.pause(), 1600);
    }
  }

  return (
    <section
      style={{
        background: "#051650",
        padding: "clamp(4rem,8vw,7rem) 0",
        overflow: "hidden",
      }}
    >
      {/* Hidden audio element */}
      <audio ref={audioRef} src="/videos/tour-music.mp3" loop preload="auto" />

      <div className="container">
        {/* Header */}
        <div
          ref={ref}
          style={{
            textAlign: "center",
            marginBottom: "clamp(2rem,4vw,3.5rem)",
            opacity: inView ? 1 : 0,
            transform: inView ? "none" : "translateY(20px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <div className="divider-gold" style={{ margin: "0 auto 1.25rem" }} />
          <p className="label" style={{ color: "#8b6914", marginBottom: "0.875rem" }}>
            Virtual Tour
          </p>
          <h2 className="h-section" style={{ color: "white", marginBottom: "1rem" }}>
            See the space{" "}
            <span className="text-gold-gradient">come alive</span>
          </h2>
          <p style={{
            fontFamily: "-apple-system, sans-serif",
            fontSize: "clamp(0.875rem,1.5vw,1rem)",
            color: "rgba(255,255,255,0.45)",
            maxWidth: "480px", margin: "0 auto",
            lineHeight: 1.75, fontWeight: 300,
          }}>
            Walk through Nest Vault before you visit. Every cabin, desk, and
            lounge — exactly as it is.
          </p>
        </div>

        {/* Video player */}
        <div style={{
          position: "relative", maxWidth: "900px", margin: "0 auto",
          borderRadius: "6px", overflow: "hidden",
          border: "1px solid rgba(201,168,76,0.2)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          opacity: inView ? 1 : 0,
          transform: inView ? "none" : "translateY(32px)",
          transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
        }}>
          <video
            ref={videoRef}
            src="/videos/space-tour.mp4"
            muted
            playsInline
            preload="metadata"
            onEnded={handleVideoEnd}
            style={{ width: "100%", display: "block", aspectRatio: "16/9", objectFit: "cover", background: "#051650" }}
          />

          {/* Play overlay */}
          {!playing && (
            <button
              onClick={togglePlay}
              aria-label="Play space tour"
              style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                background: "rgba(0,0,0,0.42)",
                border: "none", cursor: "pointer",
              }}
            >
              <div style={{
                width: "clamp(64px,10vw,88px)", height: "clamp(64px,10vw,88px)",
                borderRadius: "50%",
                border: "2px solid rgba(201,168,76,0.7)",
                background: "rgba(201,168,76,0.12)",
                backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "transform 0.2s ease, background 0.2s ease",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(201,168,76,0.28)"; (e.currentTarget as HTMLDivElement).style.transform = "scale(1.07)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(201,168,76,0.12)"; (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"; }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#c9a84c" style={{ marginLeft: "3px" }}>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span style={{
                marginTop: "1rem",
                fontFamily: "-apple-system, sans-serif", fontSize: "0.72rem",
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
              }}>Watch Tour</span>
            </button>
          )}

          {/* Controls bar */}
          {playing && (
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.75rem 1.25rem",
              background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
              gap: "0.75rem",
            }}>
              {/* Pause */}
              <button onClick={togglePlay} aria-label="Pause"
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              </button>

              {/* Music toggle */}
              <button onClick={toggleMusic} aria-label={musicOn ? "Turn music off" : "Turn music on"}
                style={{
                  display: "flex", alignItems: "center", gap: "0.35rem",
                  background: musicOn ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${musicOn ? "rgba(201,168,76,0.45)" : "rgba(255,255,255,0.15)"}`,
                  borderRadius: "2px", padding: "0.25rem 0.65rem",
                  cursor: "pointer", transition: "all 0.25s ease",
                  color: musicOn ? "#c9a84c" : "rgba(255,255,255,0.45)",
                  fontFamily: "-apple-system,sans-serif", fontSize: "0.62rem",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z"/>
                </svg>
                {musicOn ? "Music On" : "Music Off"}
              </button>

              {/* Mute video */}
              <button onClick={toggleMute} aria-label={muted ? "Unmute video" : "Mute video"}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "-apple-system,sans-serif", fontSize: "0.7rem", letterSpacing: "0.1em" }}>
                {muted ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                  </svg>
                )}
                <span>{muted ? "Unmute" : "Mute"}</span>
              </button>
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{
          textAlign: "center", marginTop: "2.5rem",
          opacity: inView ? 1 : 0, transition: "opacity 0.7s ease 0.5s",
        }}>
          <a href="#contact" className="btn-gold" style={{ fontSize: "0.82rem", padding: "0.9rem 2rem" }}>
            Book a Free In-Person Tour
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
