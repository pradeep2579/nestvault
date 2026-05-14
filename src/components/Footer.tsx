"use client";

import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "#050505", color: "white", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="container">
        <div className="footer-grid">

          {/* Brand */}
          <div>
            <div style={{ marginBottom: "1.25rem" }}>
                <Image
                src="/images/logo-full.png"
                alt="Nest Vault Coworking Space"
                width={200}
                height={100}
                style={{
                  height: "72px",
                  width: "auto",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
            <p style={{ fontFamily: "-apple-system,sans-serif", fontSize: "0.82rem", lineHeight: 1.8, color: "rgba(255,255,255,0.35)", fontWeight: 300, maxWidth: "260px", marginBottom: "1.5rem" }}>
              Hyderabad&apos;s most prestigious co-working ecosystem. Where founders, creators, and enterprises thrive.
            </p>

            {/* Social Media Icons */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>

              {/* Facebook */}
              <a href="https://www.facebook.com/profile.php?id=61560417632949&mibextid=kFxxJD" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="footer-social">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a href="https://www.instagram.com/nest_vault?igsh=dGQ4NHNqOXpseWN4" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer-social">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>

              {/* Threads */}
              <a href="https://www.threads.net/@nest_vault" target="_blank" rel="noopener noreferrer" aria-label="Threads" className="footer-social">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 011.57.045c-.224-.866-.689-1.512-1.404-1.928-.943-.544-2.088-.546-3.083-.006-.645.353-1.092.88-1.33 1.568l-1.95-.634c.384-1.158 1.084-2.09 2.079-2.77 1.306-.882 2.965-1.05 4.61-.48 1.87.645 3.015 2.178 3.235 4.32.028.28.042.564.041.847.867.612 1.519 1.39 1.93 2.32.773 1.763.802 4.57-1.489 6.817-1.821 1.783-4.077 2.596-7.159 2.618zM14.7 13.72a11.3 11.3 0 00-1.378-.056c-.897.052-1.665.296-2.167.689-.417.33-.625.753-.596 1.22.057 1.04 1.167 1.624 2.61 1.544 1.123-.062 1.95-.493 2.46-1.282.35-.545.546-1.293.573-2.234a5.817 5.817 0 00-.502.12z"/>
                </svg>
              </a>

              {/* X (Twitter) */}
              <a href="https://x.com/Nestvault?t=5UWUOl2YGGlGQZ8JDW3JAA&s=09" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="footer-social">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* Pinterest */}
              <a href="https://pin.it/50EMkezlV" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="footer-social">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                </svg>
              </a>

              {/* YouTube */}
              <a href="https://youtube.com/@nestvault?si=cSbzWQUMDyUeHflo" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="footer-social">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

            </div>
          </div>

          {/* Link columns */}
          {[
            {
              heading: "Workspaces",
              links: [
                { label: "Private Cabins",    href: "#workspaces" },
                { label: "Dedicated Desks",   href: "#workspaces" },
                { label: "Hot Desks",         href: "#workspaces" },
                { label: "Meeting Rooms",     href: "#workspaces" },
                { label: "Virtual Office",    href: "#workspaces" },
                { label: "Event Space",       href: "#workspaces" },
              ],
            },
            {
              heading: "Company",
              links: [
                { label: "About Us",    href: "#about"      },
                { label: "Amenities",  href: "#amenities"  },
                { label: "Pricing",    href: "#pricing"    },
                { label: "Gallery",    href: "#gallery"    },
                { label: "Community",  href: "#community"  },
                { label: "Location",   href: "#location"   },
              ],
            },
            {
              heading: "Contact",
              links: [
                { label: "Book a Tour",          href: "#contact"                        },
                { label: "+91 91426 96666",       href: "tel:+919142696666"               },
                { label: "hello@nestvault.in",    href: "mailto:hello@nestvault.in"       },
                { label: "WhatsApp Us",           href: "https://wa.me/919142696666"      },
                { label: "Road No. 36, Jubilee Hills", href: "#location"                 },
              ],
            },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <div style={{ fontFamily: "-apple-system,sans-serif", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#c9a84c", marginBottom: "1.25rem" }}>
                {heading}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="footer-link">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p style={{ fontFamily: "-apple-system,sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.18)" }}>
            © {year} Nest Vault Co-working Space. All rights reserved. · Jubilee Hills, Hyderabad.
          </p>
          <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
            {["Privacy Policy", "Terms of Service", "Refund Policy"].map(l => (
              <a key={l} href="#" className="footer-link" style={{ fontSize: "0.68rem" }}>{l}</a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: clamp(2rem,4vw,4rem);
          padding: clamp(3rem,6vw,5rem) 0 clamp(2rem,4vw,3rem);
        }
        .footer-social {
          width: 36px; height: 36px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.4); text-decoration: none;
          transition: all 0.25s ease;
          flex-shrink: 0;
        }
        .footer-social:hover {
          border-color: #c9a84c;
          color: #c9a84c;
          background: rgba(201,168,76,0.08);
          transform: translateY(-2px);
        }
        .footer-link {
          font-family: -apple-system,sans-serif;
          font-size: 0.82rem; color: rgba(255,255,255,0.35);
          text-decoration: none; transition: color 0.2s ease;
        }
        .footer-link:hover { color: rgba(255,255,255,0.75); }
        .footer-bottom {
          padding: 1.25rem 0;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex; justify-content: space-between;
          align-items: center; flex-wrap: wrap; gap: 0.875rem;
        }

        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr; }
          .footer-grid > div:first-child { grid-column: span 2; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
          .footer-grid > div:first-child { grid-column: span 2; }
          .footer-bottom { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </footer>
  );
}
