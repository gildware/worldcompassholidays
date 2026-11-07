import Link from "next/link";
import type { CatalogOverviewData, CatalogRankRow } from "@/lib/catalog-overview";
import { formatDate } from "@/lib/format";
import { statusLabel } from "@/lib/bookings";

function statusClass(status: string) {
  switch (status) {
    case "confirmed":
    case "paid":
    case "completed":
      return "st-confirmed";
    case "quoted":
    case "under_review":
      return "st-deposit";
    case "enquiry":
    case "pending":
      return "st-pending";
    case "cancelled":
      return "st-cancelled";
    default:
      return "st-pending";
  }
}

function RankList({
  title,
  description,
  href,
  linkLabel,
  rows,
  empty,
  unit,
}: {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  rows: CatalogRankRow[];
  empty: string;
  unit: string;
}) {
  const max = Math.max(...rows.map((row) => row.count), 1);
  return (
    <article className="card card-pad">
      <div className="card-h">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <Link className="linkish" href={href}>
          {linkLabel}
        </Link>
      </div>
      {rows.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 13 }}>{empty}</p>
      ) : (
        <div className="rank-list">
          {rows.map((row, index) => (
            <Link key={row.id} href={row.href} className="rank">
              <div className="n">{index + 1}</div>
              <div>
                <h3>{row.name}</h3>
                <p>{row.subtitle}</p>
                <div className="mini-bar" aria-hidden>
                  <i style={{ width: `${Math.round((row.count / max) * 100)}%` }} />
                </div>
              </div>
              <div className="amt">
                {row.count}
                <span style={{ display: "block", fontSize: 11, fontWeight: 500, color: "var(--muted)" }}>
                  {unit}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}

export function CatalogModuleOverview({ data }: { data: CatalogOverviewData }) {
  const isTour = data.kind === "tour";
  const noun = isTour ? "tour" : "hotel";
  const nouns = isTour ? "tours" : "hotels";
  const listHref = isTour ? "/admin/tours" : "/admin/hotels";
  const newHref = `${listHref}/new`;
  const bookingHref = isTour ? "/admin/bookings/tours" : "/admin/bookings/hotels";
  const searchHref = isTour ? "/admin/searches?source=tours" : "/admin/searches?source=hotels";
  const { stats } = data;
  const converted = stats.bookings
    ? Math.round((stats.confirmedBookings / Math.max(stats.bookings, 1)) * 100)
    : 0;

  return (
    <>
      <section className="hero-grid" aria-label={`${noun} overview`}>
        <article className="card card-pad north">
          <div className="label">Catalog · {nouns}</div>
          <div className="value">{stats.total}</div>
          <div className="meta">
            <span className="delta-up">{stats.published} live</span>
            <span>·</span>
            <span>{stats.draft} draft</span>
          </div>
          <div className="progress" aria-hidden>
            <span
              style={{
                width: `${stats.total ? Math.min(100, Math.round((stats.published / stats.total) * 100)) : 0}%`,
              }}
            />
          </div>
          <div className="progress-meta">
            <span>
              {stats.total
                ? `${Math.round((stats.published / stats.total) * 100)}% published`
                : `No ${nouns} yet`}
            </span>
            <Link className="linkish" href={newHref} style={{ color: "#5eead4" }}>
              Add {noun}
            </Link>
          </div>
        </article>

        <article className="card card-pad kpi">
          <div className="k-label">Bookings</div>
          <div className="k-value">{stats.bookings}</div>
          <div className="k-foot">
            <span>
              {stats.openBookings} open · {stats.confirmedBookings} confirmed
            </span>
            <Link className="chip chip-up" href={bookingHref}>
              Desk
            </Link>
          </div>
        </article>

        <article className="card card-pad kpi">
          <div className="k-label">Page views</div>
          <div className="k-value">{stats.totalViews}</div>
          <div className="k-foot">
            <span>Public detail pages</span>
            <Link className="chip chip-flat" href={listHref}>
              Inventory
            </Link>
          </div>
        </article>

        <article className="card card-pad kpi">
          <div className="k-label">Interest</div>
          <div className="k-value">{stats.favorites}</div>
          <div className="k-foot">
            <span>{stats.searches} searches · 30d</span>
            <Link className="chip chip-flat" href={searchHref}>
              Searches
            </Link>
          </div>
        </article>
      </section>

      <section className="mid" style={{ marginTop: 14 }}>
        <RankList
          title={`Most booked ${nouns}`}
          description={`Requests matched to a catalog ${noun}`}
          href={bookingHref}
          linkLabel="All bookings"
          rows={data.topBooked}
          empty={`No ${noun} bookings matched to inventory yet.`}
          unit="bookings"
        />
        <article className="card card-pad">
          <div className="card-h">
            <div>
              <h2>Pipeline</h2>
              <p>Live statuses for {noun} desk requests</p>
            </div>
            <Link className="linkish" href={bookingHref}>
              Open desk
            </Link>
          </div>
          <div className="pipeline" aria-label="Pipeline">
            <div className="pipe-row">
              <span>Open</span>
              <div className="bar">
                <i
                  style={{
                    width: `${(stats.openBookings / Math.max(stats.openBookings, stats.confirmedBookings, 1)) * 100}%`,
                    background: "#c47a12",
                  }}
                />
              </div>
              <span>{stats.openBookings}</span>
            </div>
            <div className="pipe-row">
              <span>Confirmed</span>
              <div className="bar">
                <i
                  style={{
                    width: `${(stats.confirmedBookings / Math.max(stats.openBookings, stats.confirmedBookings, 1)) * 100}%`,
                    background: "#0e8f7a",
                  }}
                />
              </div>
              <span>{stats.confirmedBookings}</span>
            </div>
          </div>
          <div className="conv">
            <div>
              <strong>{stats.bookings ? `${converted}%` : "—"}</strong>
              <span>Confirm rate</span>
            </div>
            <div>
              <strong>{stats.totalViews}</strong>
              <span>Detail views</span>
            </div>
          </div>
        </article>
      </section>

      <section className="mid" style={{ marginTop: 14 }}>
        <RankList
          title={`Most viewed ${nouns}`}
          description="Public detail-page opens"
          href={listHref}
          linkLabel={`All ${nouns}`}
          rows={data.topViewed}
          empty={`Views will appear once customers open ${noun} pages.`}
          unit="views"
        />
        <article className="card card-pad">
          <div className="card-h">
            <div>
              <h2>Recent bookings</h2>
              <p>Latest {noun} desk activity</p>
            </div>
            <Link className="linkish" href={bookingHref}>
              All bookings
            </Link>
          </div>
          {data.recentBookings.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 13 }}>
              {noun.charAt(0).toUpperCase() + noun.slice(1)} requests will land here.
            </p>
          ) : (
            <div className="dept-list">
              {data.recentBookings.map((row) => (
                <Link key={row.id} href={row.href} className="dept">
                  <div className="date-box">
                    <b>{String(row.createdAt.getDate()).padStart(2, "0")}</b>
                    <span>
                      {row.createdAt.toLocaleString("en-IN", { month: "short" }).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3>{row.contactName}</h3>
                    <p>
                      {row.title} · {row.reference}
                    </p>
                  </div>
                  <div className="load">
                    <strong>
                      <span className={`status ${statusClass(row.status)}`}>
                        {statusLabel(row.status)}
                      </span>
                    </strong>
                    {formatDate(row.createdAt)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </article>
      </section>
    </>
  );
}
