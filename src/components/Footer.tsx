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
            <div style={{ display: "flex", gap: "0.625rem" }}>
              {[{ icon: "in", label: "LinkedIn" }, { icon: "ig", label: "Instagram" }, { icon: "yt", label: "YouTube" }].map(({ icon, label }) => (
                <a key={label} href="#" aria-label={label} className="footer-social">{icon}</a>
              ))}
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
          width: 34px; height: 34px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 2px;
          display: flex; align-items: center; justify-content: center;
          font-family: -apple-system,sans-serif; font-size: 0.6rem; font-weight: 700;
          color: rgba(255,255,255,0.35); text-decoration: none;
          letter-spacing: 0.04em; text-transform: uppercase;
          transition: all 0.25s ease;
        }
        .footer-social:hover { border-color: #c9a84c; color: #c9a84c; }
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
