import Link from "next/link";
import {
  bookingDesks,
  fleetDesks,
  type BookingDesk,
  type FleetDesk,
} from "@/lib/booking-desks";
import type { DeskBadgeStats, FleetBadgeCounts } from "@/lib/booking-admin";
import { formatMoney } from "@/lib/format";
import "./bookings-desk.css";

type RecentRow = {
  id: string;
  reference: string;
  module: string;
  status: string;
  title: string;
  contactName: string;
  amount: number;
  currency: string;
  createdAt: string;
  href: string;
};

const statusTone: Record<string, string> = {
  enquiry: "warn",
  quoted: "info",
  confirmed: "ok",
  paid: "ok",
  completed: "ok",
  cancelled: "danger",
  pending: "warn",
  documents_required: "warn",
  documents_under_review: "info",
};

export function BookingsOverview({
  stats,
  recent,
  rentalAction,
}: {
  stats: DeskBadgeStats[];
  recent: RecentRow[];
  rentalAction: FleetBadgeCounts;
}) {
  const byModule = Object.fromEntries(stats.map((s) => [s.module, s]));
  const desks = bookingDesks.filter((d) => d.enabled);
  const fleets = fleetDesks.filter((d) => d.enabled);
  const deskAction = stats.reduce((sum, s) => sum + s.action, 0);
  const fleetAction = rentalAction.cars + rentalAction.bikes;
  const totalAction = deskAction + fleetAction;
  const totalUnassigned = stats.reduce((sum, s) => sum + s.unassignedAction, 0);
  const totalOpen =
    stats.reduce((sum, s) => sum + s.total, 0) + fleetAction;

  return (
    <div className="bk-desk bk-desk--compact grid gap-3">
      <div className="bk-kpis">
        <div className={`bk-kpi ${totalAction > 0 ? "bk-kpi--warn" : ""}`}>
          <span className="bk-kpi__label">Needs action</span>
          <span className="bk-kpi__value">{totalAction}</span>
        </div>
        <div className="bk-kpi">
          <span className="bk-kpi__label">Unassigned</span>
          <span className="bk-kpi__value">{totalUnassigned}</span>
        </div>
        <div className="bk-kpi">
          <span className="bk-kpi__label">Open</span>
          <span className="bk-kpi__value">{totalOpen}</span>
        </div>
        <div className="bk-kpi">
          <span className="bk-kpi__label">Fleet queue</span>
          <span className="bk-kpi__value">{fleetAction}</span>
        </div>
      </div>

      <div className="bk-desk-grid">
        {desks.map((desk) => (
          <DeskCard key={desk.key} desk={desk} stats={byModule[desk.key]} />
        ))}
        {fleets.map((desk) => (
          <FleetCard
            key={desk.key}
            desk={desk}
            action={desk.key === "car" ? rentalAction.cars : rentalAction.bikes}
          />
        ))}
      </div>

      <section className="bk-panel bk-panel--compact">
        <div className="flex items-center justify-between gap-2">
          <h2>Latest</h2>
          {totalAction > 0 ? (
            <span className="text-[11px] font-semibold text-muted">{totalAction} need action</span>
          ) : null}
        </div>
        {recent.length === 0 ? (
          <p className="mt-2 text-xs text-muted">No bookings yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-line">
            {recent.map((row) => (
              <li key={`${row.href}-${row.id}`} className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <Link
                    href={row.href}
                    className="text-sm font-semibold text-navy hover:text-brand hover:underline"
                  >
                    {row.contactName}
                  </Link>
                  <p className="truncate text-[11px] text-muted">
                    {row.title} · {row.reference}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className={`bk-status bk-status--${statusTone[row.status] ?? "neutral"}`}>
                    {row.status.replace(/_/g, " ")}
                  </span>
                  <span className="text-[11px] font-semibold tabular-nums text-navy">
                    {row.amount > 0 ? formatMoney(row.amount, row.currency) : "—"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function DeskCard({ desk, stats }: { desk: BookingDesk; stats?: DeskBadgeStats }) {
  const action = stats?.action ?? 0;
  const total = stats?.total ?? 0;
  const unassigned = stats?.unassignedAction ?? 0;

  return (
    <Link href={desk.href} className={`bk-desk-card ${action > 0 ? "has-action" : ""}`}>
      <div className="bk-desk-card__top">
        <h3>{desk.shortLabel}</h3>
        {action > 0 ? <span className="bk-nav-badge">{action}</span> : null}
      </div>
      <p>{desk.description}</p>
      <dl className="bk-desk-card__meta">
        <div>
          <dt>Open</dt>
          <dd>{total}</dd>
        </div>
        <div>
          <dt>Action</dt>
          <dd>{action}</dd>
        </div>
        <div>
          <dt>Free</dt>
          <dd>{unassigned}</dd>
        </div>
      </dl>
    </Link>
  );
}

function FleetCard({ desk, action }: { desk: FleetDesk; action: number }) {
  return (
    <Link href={desk.href} className={`bk-desk-card ${action > 0 ? "has-action" : ""}`}>
      <div className="bk-desk-card__top">
        <h3>{desk.shortLabel}</h3>
        {action > 0 ? <span className="bk-nav-badge">{action}</span> : null}
      </div>
      <p>{desk.description}</p>
      <dl className="bk-desk-card__meta bk-desk-card__meta--1">
        <div>
          <dt>Queue</dt>
          <dd>{action}</dd>
        </div>
      </dl>
    </Link>
  );
}
