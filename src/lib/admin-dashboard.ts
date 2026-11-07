import { deskSegmentForModule } from "@/lib/booking-desks";
import { moduleLabel, statusLabel } from "@/lib/bookings";
import { prisma } from "@/lib/db";
import {
  customEnquiryKinds,
  enquiryIsOpen,
  enquiryStatusLabel,
  notCustomEnquiryWhere,
  toEnquiryView,
  websiteEnquiryWhere,
} from "@/lib/enquiries";
import { bookingStatusLabels as rentalStatusLabels } from "@/lib/rentals/labels";

/** Custom product requests only (excludes contact-page rows). */
export function productEnquiryWhere() {
  return {
    OR: customEnquiryKinds.map((kind) => ({
      details: { contains: `"kind":"${kind}"` },
    })),
  };
}

export type DashboardFeedRow = {
  id: string;
  reference: string;
  title: string;
  subtitle: string;
  status: string;
  statusLabel: string;
  contactName: string;
  createdAt: Date;
  href: string;
};

export type DashboardDayPoint = {
  date: string;
  volume: number;
  confirmed: number;
  enquiries: number;
  contacts: number;
};

function dayKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function emptyDaySeries(days: number, end = new Date()): DashboardDayPoint[] {
  const series: DashboardDayPoint[] = [];
  const endUtc = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(endUtc - i * 86_400_000);
    series.push({
      date: dayKey(d),
      volume: 0,
      confirmed: 0,
      enquiries: 0,
      contacts: 0,
    });
  }
  return series;
}

function isConfirmedStatus(status: string) {
  return status === "confirmed" || status === "paid" || status === "completed";
}

function bookingHref(module: string, id: string) {
  const desk = deskSegmentForModule(module);
  return desk ? `/admin/bookings/${id}?desk=${desk}` : `/admin/bookings/${id}`;
}

export async function loadDashboardFeeds(limit = 6) {
  const [enquiryRows, bookingRows, contactRows, rentalRows] = await Promise.all([
    prisma.booking.findMany({
      where: productEnquiryWhere(),
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.booking.findMany({
      where: notCustomEnquiryWhere(),
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        reference: true,
        module: true,
        status: true,
        title: true,
        contactName: true,
        createdAt: true,
      },
    }),
    prisma.booking.findMany({
      where: websiteEnquiryWhere(),
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.rentalBooking.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        reference: true,
        status: true,
        contactName: true,
        createdAt: true,
        vehicle: { select: { kind: true, name: true } },
      },
    }),
  ]);

  const enquiries: DashboardFeedRow[] = enquiryRows.flatMap((row) => {
    const view = toEnquiryView(row);
    if (!view) return [];
    return [
      {
        id: view.id,
        reference: view.reference,
        title: view.kindLabel,
        subtitle: view.summary || view.title,
        status: view.status,
        statusLabel: enquiryStatusLabel(view.status),
        contactName: view.contactName,
        createdAt: view.createdAt,
        href: `/admin/enquiries/${view.id}`,
      },
    ];
  });

  const deskBookings: DashboardFeedRow[] = bookingRows.map((row) => ({
    id: row.id,
    reference: row.reference,
    title: row.title || moduleLabel(row.module),
    subtitle: moduleLabel(row.module),
    status: row.status,
    statusLabel: statusLabel(row.status),
    contactName: row.contactName,
    createdAt: row.createdAt,
    href: bookingHref(row.module, row.id),
  }));

  const rentals: DashboardFeedRow[] = rentalRows.map((row) => ({
    id: row.id,
    reference: row.reference,
    title: row.vehicle.name,
    subtitle: row.vehicle.kind === "bike" ? "Bike rental" : "Car rental",
    status: row.status,
    statusLabel: rentalStatusLabels[row.status] ?? statusLabel(row.status),
    contactName: row.contactName,
    createdAt: row.createdAt,
    href: `/admin/rentals/bookings/${row.id}?desk=${row.vehicle.kind === "bike" ? "bikes" : "cars"}`,
  }));

  const bookings = [...deskBookings, ...rentals]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);

  const contacts: DashboardFeedRow[] = contactRows.flatMap((row) => {
    const view = toEnquiryView(row);
    if (!view) return [];
    return [
      {
        id: view.id,
        reference: view.reference,
        title: view.kindLabel,
        subtitle: view.summary || view.note || view.title,
        status: view.status,
        statusLabel: enquiryStatusLabel(view.status),
        contactName: view.contactName,
        createdAt: view.createdAt,
        href: `/admin/enquiries/${view.id}`,
      },
    ];
  });

  return { enquiries, bookings, contacts };
}

export async function loadDashboardChartSeries(days = 30) {
  const series = emptyDaySeries(days);
  const start = new Date(`${series[0]!.date}T00:00:00.000Z`);
  const index = new Map(series.map((point, i) => [point.date, i]));

  const [bookings, rentals, enquiries, contacts] = await Promise.all([
    prisma.booking.findMany({
      where: { ...notCustomEnquiryWhere(), createdAt: { gte: start } },
      select: { createdAt: true, status: true },
    }),
    prisma.rentalBooking.findMany({
      where: { createdAt: { gte: start } },
      select: { createdAt: true, status: true },
    }),
    prisma.booking.findMany({
      where: { ...productEnquiryWhere(), createdAt: { gte: start } },
      select: { createdAt: true },
    }),
    prisma.booking.findMany({
      where: { ...websiteEnquiryWhere(), createdAt: { gte: start } },
      select: { createdAt: true },
    }),
  ]);

  for (const row of bookings) {
    const i = index.get(dayKey(row.createdAt));
    if (i == null) continue;
    series[i]!.volume += 1;
    if (isConfirmedStatus(row.status)) series[i]!.confirmed += 1;
  }

  for (const row of rentals) {
    const i = index.get(dayKey(row.createdAt));
    if (i == null) continue;
    series[i]!.volume += 1;
    if (
      isConfirmedStatus(row.status) ||
      row.status === "ready_for_pickup" ||
      row.status === "active" ||
      row.status === "return_pending"
    ) {
      series[i]!.confirmed += 1;
    }
  }

  for (const row of enquiries) {
    const i = index.get(dayKey(row.createdAt));
    if (i == null) continue;
    series[i]!.enquiries += 1;
  }

  for (const row of contacts) {
    const i = index.get(dayKey(row.createdAt));
    if (i == null) continue;
    series[i]!.contacts += 1;
  }

  return series;
}

export async function loadDashboardCounts() {
  const [enquiryTotal, enquiryOpenRows, bookingTotal, contactTotal, rentalTotal, statusGroups] =
    await Promise.all([
      prisma.booking.count({ where: productEnquiryWhere() }),
      prisma.booking.findMany({
        where: productEnquiryWhere(),
        select: { status: true },
      }),
      prisma.booking.count({ where: notCustomEnquiryWhere() }),
      prisma.booking.count({ where: websiteEnquiryWhere() }),
      prisma.rentalBooking.count(),
      prisma.booking.groupBy({
        by: ["status"],
        where: notCustomEnquiryWhere(),
        _count: { _all: true },
      }),
    ]);

  const enquiryOpen = enquiryOpenRows.filter((row) => enquiryIsOpen(row.status)).length;
  const statusCount = Object.fromEntries(
    statusGroups.map((g) => [g.status, g._count._all]),
  ) as Record<string, number>;

  return {
    enquiryTotal,
    enquiryOpen,
    bookingTotal: bookingTotal + rentalTotal,
    contactTotal,
    statusCount,
  };
}
