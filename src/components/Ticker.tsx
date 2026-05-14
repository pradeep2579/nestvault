"use client";

const items = [
  "Private Cabins",
  "Dedicated Desks",
  "Meeting Rooms",
  "Event Spaces",
  "Virtual Offices",
  "Day Passes",
  "24/7 Access",
  "High-Speed Internet",
  "Soundproof Cabins",
  "Italian Marble Finishes",
  "Founder Community",
  "Business Address",
  "180m from Metro",
  "Jubilee Hills",
];

export default function Ticker() {
  const repeated = [...items, ...items];

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #c9a84c, #8b6914)",
        padding: "0.875rem 0",
        overflow: "hidden",
      }}
    >
      <div className="ticker-wrap">
        <div className="ticker-content">
          {repeated.map((item, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "2rem",
                padding: "0 2rem",
                fontFamily: "-apple-system, sans-serif",
                fontSize: "0.72rem",
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.9)",
                whiteSpace: "nowrap",
              }}
            >
              {item}
              <svg width="4" height="4" viewBox="0 0 4 4" fill="none">
                <circle cx="2" cy="2" r="2" fill="rgba(255,255,255,0.5)" />
              </svg>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
