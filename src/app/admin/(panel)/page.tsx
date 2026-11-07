import type { Metadata } from "next";
import Link from "next/link";
import { modules } from "@/config/modules";
import { requireStaff } from "@/lib/auth/guards";
import type { StaffPermission } from "@/lib/auth/permissions";
import { can } from "@/lib/auth/session";
import {
  loadDashboardChartSeries,
  loadDashboardCounts,
  loadDashboardFeeds,
} from "@/lib/admin-dashboard";
import { prisma } from "@/lib/db";
import { DashboardFeed } from "@/components/admin/ops/DashboardFeed";
import { OverviewCharts } from "@/components/admin/ops/OverviewCharts";

export const metadata: Metadata = { title: "Overview" };

type Stat = {
  label: string;
  href: string;
  permission: StaffPermission;
  enabled: boolean;
  hint: string;
  count: () => Promise<number>;
};

const catalogStats: Stat[] = [
  {
    label: "Destinations",
    href: "/admin/destinations",
    permission: "destinations.view",
    enabled: true,
    hint: "Places on the site",
    count: () => prisma.destination.count(),
  },
  {
    label: "Tours",
    href: "/admin/tours/overview",
    permission: "tours.view",
    enabled: modules.tours,
    hint: "Packages & treks",
    count: () => prisma.tour.count(),
  },
  {
    label: "Hotels",
    href: "/admin/hotels/overview",
    permission: "hotels.view",
    enabled: modules.hotels,
    hint: "Stay inventory",
    count: () => prisma.hotel.count(),
  },
  {
    label: "Cars",
    href: "/admin/rentals/cars/overview",
    permission: "vehicles.view",
    enabled: modules.cars,
    hint: "Fleet vehicles",
    count: () => prisma.vehicle.count({ where: { kind: "car" } }),
  },
  {
    label: "Bikes",
    href: "/admin/rentals/bikes/overview",
    permission: "vehicles.view",
    enabled: modules.bikes,
    hint: "Fleet bikes",
    count: () => prisma.vehicle.count({ where: { kind: "bike" } }),
  },
  {
    label: "Customers",
    href: "/admin/customers",
    permission: "customers.view",
    enabled: true,
    hint: "Customer accounts",
    count: () => prisma.user.count({ where: { role: { scope: "customer" } } }),
  },
];

export default async function AdminHomePage() {
  const user = await requireStaff();
  const visible = catalogStats.filter((s) => s.enabled && can(user, s.permission));
  const counts = await Promise.all(visible.map((s) => s.count()));
  const canSeeBookings = can(user, "bookings.view");
  const canSeeTours = modules.tours && can(user, "tours.view");

  const [dashboardCounts, feeds, chartSeries, tourCount] = await Promise.all([
    canSeeBookings
      ? loadDashboardCounts()
      : Promise.resolve({
          enquiryTotal: 0,
          enquiryOpen: 0,
          bookingTotal: 0,
          contactTotal: 0,
          statusCount: {} as Record<string, number>,
        }),
    canSeeBookings
      ? loadDashboardFeeds(6)
      : Promise.resolve({ enquiries: [], bookings: [], contacts: [] }),
    canSeeBookings ? loadDashboardChartSeries(30) : Promise.resolve([]),
    canSeeTours ? prisma.tour.count() : Promise.resolve(0),
  ]);

  const enquiry = dashboardCounts.statusCount.enquiry ?? 0;
  const quoted = dashboardCounts.statusCount.quoted ?? 0;
  const confirmed =
    (dashboardCounts.statusCount.confirmed ?? 0) +
    (dashboardCounts.statusCount.paid ?? 0) +
    (dashboardCounts.statusCount.completed ?? 0);
  const cancelled = dashboardCounts.statusCount.cancelled ?? 0;
  const needsAction = enquiry + quoted + dashboardCounts.enquiryOpen;
  const pipelineMax = Math.max(enquiry, quoted, confirmed, dashboardCounts.enquiryOpen, 1);
  const bookingTotal = dashboardCounts.bookingTotal;

  const hotelStat = visible.find((s) => s.href === "/admin/hotels/overview");
  const hotelCount = hotelStat ? counts[visible.indexOf(hotelStat)] : 0;
  const destStat = visible.find((s) => s.href === "/admin/destinations");
  const destCount = destStat ? counts[visible.indexOf(destStat)] : 0;

  const chartPeriodVolume = chartSeries.reduce((sum, point) => sum + point.volume, 0);
  const chartPeriodConfirmed = chartSeries.reduce((sum, point) => sum + point.confirmed, 0);

  return (
    <>
      {canSeeBookings && needsAction > 0 ? (
        <section className="attention" aria-label="Needs attention">
          <div className="attention-icon" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v4M12 17h.01M10.3 4.3 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
            </svg>
          </div>
          <div>
            <strong>
              {needsAction} item{needsAction === 1 ? "" : "s"} need a reply
            </strong>
            <p>
              {dashboardCounts.enquiryOpen} custom{" "}
              {dashboardCounts.enquiryOpen === 1 ? "enquiry" : "enquiries"} · {enquiry} booking{" "}
              {enquiry === 1 ? "enquiry" : "enquiries"} · {quoted} quoted ·{" "}
              {dashboardCounts.contactTotal} contact{" "}
              {dashboardCounts.contactTotal === 1 ? "request" : "requests"}
            </p>
          </div>
          <Link className="btn" href="/admin/bookings">
            Resolve queue
          </Link>
        </section>
      ) : null}

      <section className="hero-grid" aria-label="Key performance" style={{ marginTop: 16 }}>
        <article className="card card-pad north">
          <div className="label">North star · bookings</div>
          <div className="value">{bookingTotal}</div>
          <div className="meta">
            <span className="delta-up">{needsAction} open</span>
            <span>·</span>
            <span>{confirmed} confirmed / paid</span>
          </div>
          <div className="progress" aria-hidden>
            <span
              style={{
                width: `${bookingTotal ? Math.min(100, Math.round((confirmed / Math.max(bookingTotal, 1)) * 100)) : 0}%`,
              }}
            />
          </div>
          <div className="progress-meta">
            <span>
              {bookingTotal
                ? `${Math.round((confirmed / Math.max(bookingTotal, 1)) * 100)}% converted`
                : "No bookings yet"}
            </span>
            <span>{cancelled} cancelled</span>
          </div>
        </article>

        <article className="card card-pad kpi">
          <div className="k-label">Custom enquiries</div>
          <div className="k-value">{dashboardCounts.enquiryTotal}</div>
          <div className="k-foot">
            <span>{dashboardCounts.enquiryOpen} open</span>
            <Link className="chip chip-up" href="/admin/enquiries">
              Open
            </Link>
          </div>
        </article>

        <article className="card card-pad kpi">
          <div className="k-label">Contact requests</div>
          <div className="k-value">{dashboardCounts.contactTotal}</div>
          <div className="k-foot">
            <span>From /contact</span>
            <Link className="chip chip-flat" href="/admin/enquiries?type=contact">
              Open
            </Link>
          </div>
        </article>

        <article className="card card-pad kpi">
          <div className="k-label">Catalog</div>
          <div className="k-value">{tourCount + hotelCount + destCount}</div>
          <div className="k-foot">
            <span>
              {tourCount} tours · {hotelCount} hotels · {destCount} places
            </span>
            <Link className="chip chip-flat" href="/admin/tours/overview">
              Open
            </Link>
          </div>
        </article>
      </section>

      {canSeeBookings ? (
        <section className="mid" id="pipeline" style={{ marginTop: 14 }}>
          <article className="card card-pad">
            <div className="card-h">
              <div>
                <h2>Activity pace</h2>
                <p>
                  Last 30 days · {chartPeriodVolume} bookings · {chartPeriodConfirmed} confirmed
                </p>
              </div>
              <Link className="linkish" href="/admin/bookings">
                All bookings
              </Link>
            </div>
            <OverviewCharts series={chartSeries} />
          </article>

          <article className="card card-pad">
            <div className="card-h">
              <div>
                <h2>Enquiry pipeline</h2>
                <p>Live statuses from desk bookings</p>
              </div>
              <Link className="linkish" href="/admin/bookings">
                Open board
              </Link>
            </div>
            <div className="pipeline" aria-label="Pipeline stages">
              <div className="pipe-row">
                <span>Custom open</span>
                <div className="bar">
                  <i
                    style={{
                      width: `${(dashboardCounts.enquiryOpen / pipelineMax) * 100}%`,
                      background: "#c47a12",
                    }}
                  />
                </div>
                <span>{dashboardCounts.enquiryOpen}</span>
              </div>
              <div className="pipe-row">
                <span>Enquiry</span>
                <div className="bar">
                  <i style={{ width: `${(enquiry / pipelineMax) * 100}%`, background: "#94a3b8" }} />
                </div>
                <span>{enquiry}</span>
              </div>
              <div className="pipe-row">
                <span>Quoted</span>
                <div className="bar">
                  <i style={{ width: `${(quoted / pipelineMax) * 100}%`, background: "#2563eb" }} />
                </div>
                <span>{quoted}</span>
              </div>
              <div className="pipe-row">
                <span>Confirmed</span>
                <div className="bar">
                  <i
                    style={{ width: `${(confirmed / pipelineMax) * 100}%`, background: "#0e8f7a" }}
                  />
                </div>
                <span>{confirmed}</span>
              </div>
            </div>
            <div className="conv">
              <div>
                <strong>
                  {bookingTotal
                    ? `${Math.round((confirmed / Math.max(bookingTotal, 1)) * 100)}%`
                    : "—"}
                </strong>
                <span>Confirm rate</span>
              </div>
              <div>
                <strong>{dashboardCounts.contactTotal}</strong>
                <span>Contact requests</span>
              </div>
            </div>
          </article>
        </section>
      ) : null}

      {canSeeBookings ? (
        <section className="triple" style={{ marginTop: 14 }}>
          <DashboardFeed
            title="Recent enquiries"
            description="Custom tour, hotel, car, bike, and bus requests"
            href="/admin/enquiries"
            linkLabel="All enquiries"
            rows={feeds.enquiries}
            empty="Custom requests will land here."
          />
          <DashboardFeed
            title="Recent bookings"
            description="Desk and fleet bookings from the website"
            href="/admin/bookings"
            linkLabel="All bookings"
            rows={feeds.bookings}
            empty="Confirmed and open bookings will land here."
          />
          <DashboardFeed
            title="Contact requests"
            description="Messages from the contact form"
            href="/admin/enquiries?type=contact"
            linkLabel="All contacts"
            rows={feeds.contacts}
            empty="Contact form submissions will land here."
          />
        </section>
      ) : (
        <section className="card card-pad" style={{ marginTop: 14 }}>
          <div className="card-h">
            <div>
              <h2>Catalog mix</h2>
              <p>What you can manage</p>
            </div>
          </div>
          <div className="rank-list">
            {visible.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: 13 }}>
                No modules visible for your role.
              </p>
            ) : (
              visible.slice(0, 5).map((stat, index) => (
                <Link key={stat.href} href={stat.href} className="rank">
                  <div className="n">{index + 1}</div>
                  <div>
                    <h3>{stat.label}</h3>
                    <p>{stat.hint}</p>
                  </div>
                  <div className="amt">{counts[index]}</div>
                </Link>
              ))
            )}
          </div>
        </section>
      )}
    </>
  );
}
