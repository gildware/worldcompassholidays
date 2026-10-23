"use client";

import { useMemo, useState } from "react";

function seriesToPath(values: number[], w: number, h: number, pad: number) {
  const max = Math.max(...values, 1) * 1.08;
  const min = Math.min(...values, 0) * 0.85;
  const step = (w - pad * 2) / (values.length - 1);
  const pts = values.map((v, i) => {
    const x = pad + i * step;
    const y = pad + (1 - (v - min) / (max - min || 1)) * (h - pad * 2);
    return [x, y] as const;
  });
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${h - pad} L${pts[0][0].toFixed(1)},${h - pad} Z`;
  return { line, area };
}

/** Demo-shaped pace chart scaled from live booking totals (visual match to Atlas Ops). */
export function OverviewCharts({
  total,
  confirmed,
  open,
}: {
  total: number;
  confirmed: number;
  open: number;
}) {
  const [mode, setMode] = useState<"volume" | "confirmed">("volume");

  const chart = useMemo(() => {
    const base = Math.max(total, 1);
    const peak = Math.max(confirmed, open, 1);
    const volume = Array.from({ length: 30 }, (_, i) => {
      const wave = Math.sin(i / 3.2) * 0.35 + 0.65;
      return Math.max(0.2, (base / 30) * wave * (0.8 + (i % 5) * 0.08));
    });
    const conf = Array.from({ length: 30 }, (_, i) => {
      const wave = Math.sin(i / 4) * 0.3 + 0.55;
      return Math.max(0.1, (peak / 30) * wave * (0.7 + (i % 4) * 0.1));
    });
    const prev = volume.map((v) => v * 0.72);
    const now = mode === "volume" ? volume : conf;
    const earlier = mode === "volume" ? prev : conf.map((v) => v * 0.75);
    return {
      now: seriesToPath(now, 640, 240, 16),
      prev: seriesToPath(earlier, 640, 240, 16),
      note:
        mode === "volume"
          ? `${total} total bookings in system`
          : `${confirmed} confirmed · ${open} still open`,
    };
  }, [total, confirmed, open, mode]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <div className="seg" role="group" aria-label="Chart metric">
          <button
            type="button"
            aria-pressed={mode === "volume"}
            onClick={() => setMode("volume")}
          >
            Volume
          </button>
          <button
            type="button"
            aria-pressed={mode === "confirmed"}
            onClick={() => setMode("confirmed")}
          >
            Confirmed
          </button>
        </div>
      </div>
      <div className="chart-wrap" role="img" aria-label="Booking pace chart">
        <svg viewBox="0 0 640 240" width="100%" height="100%" preserveAspectRatio="none">
          <defs>
            <linearGradient id="opsFillNow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0e8f7a" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#0e8f7a" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g stroke="#e2e8f0" strokeWidth="1">
            <line x1="0" y1="40" x2="640" y2="40" />
            <line x1="0" y1="90" x2="640" y2="90" />
            <line x1="0" y1="140" x2="640" y2="140" />
            <line x1="0" y1="190" x2="640" y2="190" />
          </g>
          <path fill="url(#opsFillNow)" d={chart.now.area} />
          <path
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray="5 4"
            d={chart.prev.line}
          />
          <path fill="none" stroke="#0e8f7a" strokeWidth="2.5" d={chart.now.line} />
        </svg>
      </div>
      <div className="chart-legend">
        <span>
          <i className="dot dot-a" />
          This period
        </span>
        <span>
          <i className="dot dot-b" />
          Baseline
        </span>
        <span>{chart.note}</span>
      </div>
    </>
  );
}
