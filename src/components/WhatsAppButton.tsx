"use client";

import { useState } from "react";

export default function WhatsAppButton() {
  const [hovered, setHovered] = useState(false);

  const phone = "919142696666";
  const message = encodeURIComponent("Hi Nest Vault! I'm interested in your coworking space. Can you please share more details?");
  const url = `https://wa.me/${phone}?text=${message}`;

  return (
    <>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="wa-btn"
      >
        {/* Tooltip */}
        <span className={`wa-tooltip ${hovered ? "wa-tooltip--visible" : ""}`}>
          Chat with us
        </span>

        {/* WhatsApp SVG icon */}
        <span className="wa-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </span>

        {/* Pulse ring */}
        <span className="wa-pulse" />
      </a>

      <style>{`
        .wa-btn {
          position: fixed;
          bottom: 1.75rem;
          right: 1.75rem;
          z-index: 9999;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: linear-gradient(135deg, #25d366, #128c7e);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(37,211,102,0.45);
          text-decoration: none;
          transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease;
          cursor: pointer;
        }
        .wa-btn:hover {
          transform: scale(1.1) translateY(-2px);
          box-shadow: 0 8px 32px rgba(37,211,102,0.55);
        }

        /* Tooltip */
        .wa-tooltip {
          position: absolute;
          right: 68px;
          top: 50%;
          transform: translateY(-50%) translateX(8px);
          background: rgba(10,10,10,0.92);
          color: white;
          font-family: -apple-system, sans-serif;
          font-size: 0.78rem;
          font-weight: 500;
          white-space: nowrap;
          padding: 0.45rem 0.875rem;
          border-radius: 6px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease, transform 0.2s ease;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .wa-tooltip::after {
          content: '';
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 5px solid transparent;
          border-left-color: rgba(10,10,10,0.92);
        }
        .wa-tooltip--visible {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }

        /* Pulse ring animation */
        .wa-pulse {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid rgba(37,211,102,0.6);
          animation: waPulse 2s ease-out infinite;
          pointer-events: none;
        }
        @keyframes waPulse {
          0%   { transform: scale(1);   opacity: 0.7; }
          70%  { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        @media (max-width: 480px) {
          .wa-btn { bottom: 1.25rem; right: 1.25rem; width: 52px; height: 52px; }
          .wa-tooltip { display: none; }
        }
      `}</style>
    </>
  );
}
