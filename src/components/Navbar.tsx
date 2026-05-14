"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "Workspaces", href: "#workspaces" },
  { label: "Amenities",  href: "#amenities"  },
  { label: "Pricing",    href: "#pricing"    },
  { label: "Gallery",    href: "#gallery"    },
  { label: "Location",   href: "#location"   },
];


export default function Navbar() {
  const [scrolled,      setScrolled]      = useState(false);
  const [menuOpen,      setMenuOpen]       = useState(false);
  const [activeSection, setActiveSection]  = useState("");
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => setScrolled(window.scrollY > 50));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    navLinks.forEach(({ href }) => {
      const el = document.getElementById(href.slice(1));
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <nav className={`nv-nav ${scrolled ? "nv-nav--scrolled" : ""}`}>
        <div className="nv-nav__inner">

          {/* Logo — icon + wordmark */}
          <Link href="/" className="nv-nav__logo" aria-label="Nest Vault Home">
            <Image
              src="/images/logo-icon.png"
              alt="Nest Vault"
              width={60}
              height={46}
              priority
              className="nv-nav__logo-img"
            />
            <div className="nv-nav__logo-text">
              <span className="nv-nav__logo-name">Nest Vault</span>
              <span className="nv-nav__logo-sub">Coworking Space</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="nv-nav__links">
            {navLinks.map(({ label, href }) => {
              const active = activeSection === href.slice(1);
              return (
                <a
                  key={href}
                  href={href}
                  className={`nv-nav__link ${active ? "nv-nav__link--active" : ""}`}
                >
                  {label}
                </a>
              );
            })}
            <div className="nv-nav__divider" />
            <a href="tel:+919142696666" className="nv-nav__phone">+91 91426 96666</a>
            <a href="#contact" className="btn-gold nv-nav__cta">Book a Tour</a>
          </div>

          {/* Hamburger */}
          <button
            className="nv-nav__hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
              {menuOpen ? (
                <path d="M1 1l20 14M21 1L1 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              ) : (
                <>
                  <line x1="0" y1="1"  x2="22" y2="1"  stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="0" y1="8"  x2="22" y2="8"  stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="0" y1="15" x2="22" y2="15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile drawer — only rendered when open to prevent black-bar bleed */}
        {menuOpen && (
          <div className="nv-nav__drawer">
            {navLinks.map(({ label, href }) => (
              <a key={href} href={href} className="nv-nav__drawer-link" onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            ))}
            <div className="nv-nav__drawer-footer">
              <a href="tel:+919142696666" className="nv-nav__drawer-phone">📞 +91 91426 96666</a>
              <a href="#contact" className="btn-gold" style={{ justifyContent: "center" }} onClick={() => setMenuOpen(false)}>
                Book a Free Tour
              </a>
            </div>
          </div>
        )}
      </nav>

      <style>{`
        .nv-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          /* Always keep a bottom gradient scrim so logo + links always read cleanly */
          background: linear-gradient(180deg, rgba(5,5,5,0.72) 0%, rgba(5,5,5,0.3) 80%, transparent 100%);
          transition: background 0.4s ease, backdrop-filter 0.4s ease, box-shadow 0.4s ease;
        }
        .nv-nav--scrolled {
          background: rgba(5,5,5,0.94);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 1px 0 rgba(255,255,255,0.05);
        }
        .nv-nav__inner {
          max-width: 1400px; margin: 0 auto;
          padding: 0 clamp(1rem, 3vw, 2rem);
          display: flex; align-items: center; justify-content: space-between;
          height: 72px;
          transition: height 0.4s ease;
        }
        .nv-nav--scrolled .nv-nav__inner { height: 60px; }

        /* Logo */
        .nv-nav__logo {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          text-decoration: none;
          flex-shrink: 0;
        }
        .nv-nav__logo-img {
          height: 44px;
          width: auto;
          object-fit: contain;
          transition: height 0.35s ease;
          flex-shrink: 0;
        }
        .nv-nav--scrolled .nv-nav__logo-img { height: 38px; }
        .nv-nav__logo-text {
          display: flex;
          flex-direction: column;
          gap: 3px;
          line-height: 1;
        }
        .nv-nav__logo-name {
          font-family: Georgia, serif;
          font-size: 1.05rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #ffffff;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .nv-nav__logo-sub {
          font-family: -apple-system, sans-serif;
          font-size: 0.62rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          color: #c9a84c;
          text-transform: uppercase;
          white-space: nowrap;
        }

        /* Desktop links */
        .nv-nav__links {
          display: flex; align-items: center; gap: 1.75rem;
        }
        .nv-nav__link {
          font-family: -apple-system,sans-serif; font-size: 0.72rem; font-weight: 500;
          letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none;
          color: rgba(255,255,255,0.6); padding-bottom: 2px;
          border-bottom: 1px solid transparent;
          transition: color 0.2s ease, border-color 0.2s ease;
        }
        .nv-nav__link:hover,
        .nv-nav__link--active { color: #c9a84c; border-bottom-color: #c9a84c; }
        .nv-nav__divider { width:1px; height:14px; background:rgba(255,255,255,0.1); }
        .nv-nav__phone {
          font-family: -apple-system,sans-serif; font-size: 0.68rem;
          color: rgba(255,255,255,0.45); text-decoration: none;
          transition: color 0.2s ease; white-space: nowrap;
        }
        .nv-nav__phone:hover { color: #c9a84c; }
        .nv-nav__cta { padding: 0.55rem 1.25rem !important; font-size: 0.65rem !important; }

        /* Hamburger */
        .nv-nav__hamburger {
          display: none; background: none; border: none;
          cursor: pointer; padding: 0.5rem; color: white;
          align-items: center; justify-content: center;
        }

        /* Drawer — conditionally rendered, no max-height hack */
        @keyframes drawerSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nv-nav__drawer {
          display: flex; flex-direction: column;
          background: rgba(5,5,5,0.97);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 0.5rem clamp(1rem,3vw,2rem) 1.75rem;
          animation: drawerSlideDown 0.25s cubic-bezier(0.16,1,0.3,1) both;
        }
        .nv-nav__drawer-link {
          font-family: -apple-system,sans-serif; font-size: 0.875rem; font-weight: 500;
          letter-spacing: 0.07em; text-transform: uppercase;
          color: rgba(255,255,255,0.75); text-decoration: none;
          padding: 0.875rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);
          display: block;
        }
        .nv-nav__drawer-footer {
          margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.875rem;
        }
        .nv-nav__drawer-phone {
          font-family: -apple-system,sans-serif; font-size: 0.875rem;
          color: rgba(255,255,255,0.5); text-decoration: none;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .nv-nav__links     { display: none; }
          .nv-nav__hamburger { display: flex; }
          .nv-nav__logo-img  { height: 36px; }
          .nv-nav__logo-name { font-size: 0.9rem; letter-spacing: 0.1em; }
          .nv-nav__logo-sub  { font-size: 0.56rem; letter-spacing: 0.08em; }
        }
        @media (max-width: 480px) {
          .nv-nav__inner     { padding: 0 1rem; }
          .nv-nav__logo-img  { height: 30px; }
          .nv-nav__logo-name { font-size: 0.8rem; letter-spacing: 0.08em; }
          .nv-nav__logo-sub  { font-size: 0.5rem; letter-spacing: 0.06em; }
        }
        @media (max-width: 480px) {
          .nv-nav__inner { padding: 0 1rem; }
          .nv-nav__logo-name { font-size: 0.875rem; }
        }
      `}</style>
    </>
  );
}
