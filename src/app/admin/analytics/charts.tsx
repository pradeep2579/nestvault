"use client";
import { useState } from "react";
import { chartPath, formatCount } from "@/lib/analytics";

export type Series = { key: string; label: string; total: string; points: { date: string; value: number }[] };

const width = 760, height = 220;
const shortDate = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

/** Daily trend with metric tabs, a hover crosshair and tooltip, and a table view for screen readers. */
export function TrendChart({ series }: { series: Series[] }) {
  const [active, setActive] = useState(series[0]?.key);
  const [hover, setHover] = useState<number | null>(null);
  const current = series.find(item => item.key === active) || series[0];
  if (!current) return null;
  const values = current.points.map(point => point.value);
  const { line, area, points, max } = chartPath(values, width, height);
  const ticks = [0, 0.5, 1].map(step => ({ y: 6 + (height - 12) * (1 - step), label: formatCount(Math.round(max * step)) }));
  const labelEvery = Math.max(1, Math.ceil(points.length / 6));
  const point = hover === null ? null : points[hover];
  const onMove = (event: React.PointerEvent<SVGRectElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
    setHover(Math.round(ratio * (points.length - 1)));
  };
  return <div className="an-trend">
    <div className="an-tabs" role="tablist" aria-label="Choose a metric">
      {series.map(item => <button key={item.key} type="button" role="tab" aria-selected={item.key === current.key}
        className={item.key === current.key ? "is-active" : ""} onClick={() => { setActive(item.key); setHover(null); }}>
        <span>{item.label}</span><strong>{item.total}</strong></button>)}
    </div>
    <div className="an-trend-plot">
      <div className="an-trend-axis" aria-hidden="true">{ticks.slice().reverse().map(tick => <span key={tick.y}>{tick.label}</span>)}</div>
      <div className="an-trend-canvas">
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label={`${current.label} per day`}>
          <defs><linearGradient id="an-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#2a78d6" stopOpacity=".28" /><stop offset="1" stopColor="#2a78d6" stopOpacity="0" /></linearGradient></defs>
          {ticks.map(tick => <line key={tick.y} x1="0" x2={width} y1={tick.y} y2={tick.y} className="an-grid" vectorEffect="non-scaling-stroke" />)}
          <path d={area} fill="url(#an-area)" />
          <path d={line} className="an-line" vectorEffect="non-scaling-stroke" />
          {point && <line x1={point.x} x2={point.x} y1="0" y2={height} className="an-crosshair" vectorEffect="non-scaling-stroke" />}
          <rect width={width} height={height} fill="transparent" onPointerMove={onMove} onPointerLeave={() => setHover(null)} />
        </svg>
        {point && hover !== null && <>
          <span className="an-dot" style={{ left: `${(point.x / width) * 100}%`, top: `${(point.y / height) * 100}%` }} />
          <div className={`an-tooltip${point.y / height < 0.35 ? " is-below" : ""}${point.x / width < 0.12 ? " is-start" : point.x / width > 0.88 ? " is-end" : ""}`}
            style={{ left: `${(point.x / width) * 100}%`, top: `${(point.y / height) * 100}%` }}>
            <small>{shortDate(current.points[hover].date)}</small><strong>{formatCount(current.points[hover].value)}</strong><span>{current.label.toLowerCase()}</span>
          </div></>}
        <div className="an-trend-dates" aria-hidden="true">{current.points.map((item, index) => index % labelEvery === 0 || index === points.length - 1
          ? <span key={item.date} style={{ left: `${(points[index].x / width) * 100}%` }}>{shortDate(item.date)}</span> : null)}</div>
      </div>
    </div>
    <details className="an-table-toggle"><summary>View as table</summary>
      <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Date</th><th>{current.label}</th></tr></thead>
        <tbody>{current.points.map(item => <tr key={item.date}><td>{shortDate(item.date)}</td><td>{formatCount(item.value)}</td></tr>)}</tbody></table></div>
    </details>
  </div>;
}
