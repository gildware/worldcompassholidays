"use client";

import { useMemo, useState } from "react";
import type { DashboardDayPoint } from "@/lib/admin-dashboard";

function seriesToPath(values: number[], w: number, h: number, pad: number) {
  const max = Math.max(...values, 1) * 1.08;
  const min = 0;
  const step = values.length > 1 ? (w - pad * 2) / (values.length - 1) : 0;
  const pts = values.map((v, i) => {
    const x = pad + i * step;
    const y = pad + (1 - (v - min) / (max - min || 1)) * (h - pad * 2);
    return [x, y] as const;
  });
  if (pts.length === 0) {
    return { line: "", area: "" };
  }
  if (pts.length === 1) {
    const [x, y] = pts[0]!;
    return {
      line: `M${x.toFixed(1)},${y.toFixed(1)}`,
      area: `M${x.toFixed(1)},${h - pad} L${x.toFixed(1)},${y.toFixed(1)} L${x.toFixed(1)},${h - pad} Z`,
    };
  }
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1]![0].toFixed(1)},${h - pad} L${pts[0]![0].toFixed(1)},${h - pad} Z`;
  return { line, area };
}

type ChartMode = "volume" | "confirmed" | "enquiries" | "contacts";

export function OverviewCharts({ series }: { series: DashboardDayPoint[] }) {
  const [mode, setMode] = useState<ChartMode>("volume");

  const chart = useMemo(() => {
    const values = series.map((point) => {
      if (mode === "confirmed") return point.confirmed;
      if (mode === "enquiries") return point.enquiries;
      if (mode === "contacts") return point.contacts;
      return point.volume;
    });
    const prev = values.map((_, i) => (i === 0 ? values[0]! : values[i - 1]!));
    const total = values.reduce((sum, n) => sum + n, 0);
    const labels: Record<ChartMode, string> = {
      volume: `${total} bookings in the last ${series.length} days`,
      confirmed: `${total} confirmed in the last ${series.length} days`,
      enquiries: `${total} custom enquiries in the last ${series.length} days`,
      contacts: `${total} contact requests in the last ${series.length} days`,
    };
    return {
      now: seriesToPath(values, 640, 240, 16),
      prev: seriesToPath(prev, 640, 240, 16),
      note: labels[mode],
      empty: total === 0,
    };
  }, [series, mode]);

  const modes: { id: ChartMode; label: string }[] = [
    { id: "volume", label: "Bookings" },
    { id: "confirmed", label: "Confirmed" },
    { id: "enquiries", label: "Enquiries" },
    { id: "contacts", label: "Contacts" },
  ];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <div className="seg" role="group" aria-label="Chart metric">
          {modes.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={mode === item.id}
              onClick={() => setMode(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-wrap" role="img" aria-label="Activity chart">
        {chart.empty ? (
          <div
            style={{
              height: "100%",
              display: "grid",
              placeItems: "center",
              color: "var(--muted)",
              fontSize: 13,
            }}
          >
            No activity in this window yet.
          </div>
        ) : (
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
        )}
      </div>
      <div className="chart-legend">
        <span>
          <i className="dot dot-a" />
          Daily count
        </span>
        <span>
          <i className="dot dot-b" />
          Prior day
        </span>
        <span>{chart.note}</span>
      </div>
    </>
  );
}
