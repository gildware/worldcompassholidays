import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { TourCatalog } from "@/components/tour-list/catalog/TourCatalog";
import { catalogToday, readCatalogQuery } from "@/components/tour-list/catalog/logic";
import { modules } from "@/config/modules";
import { getCurrentUser } from "@/lib/auth/session";
import { loadTourCatalog } from "@/lib/catalog-query";
import { favoriteIds } from "@/lib/favorites";
import { prisma } from "@/lib/db";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { toCatalogTour } from "@/lib/tours/catalog-card";

export const metadata: Metadata = pageMetadata({
  title: "Tours",
  description:
    "Search tours by date, party, price, and pace. Every card shows the total for your group, the cancellation deadline, and what you still pay on the day.",
  path: "/tours",
});

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!modules.tours) notFound();
  const params = await searchParams;
  const [rows, catalog, user] = await Promise.all([
    prisma.tour.findMany({
      where: { published: true },
      include: {
        destination: { select: { name: true, region: true, country: true } },
        destinationLinks: {
          include: { destination: { select: { name: true, region: true, country: true } } },
          take: 1,
        },
        days: { orderBy: { dayNumber: "asc" }, select: { dayNumber: true, title: true, description: true } },
        departures: { select: { id: true, startDate: true, seatsTotal: true, price: true, status: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { title: "asc" }],
    }),
    loadTourCatalog(),
    getCurrentUser(),
  ]);

  const tours = rows.map((tour) =>
    toCatalogTour(
      { ...tour, destination: tour.destination ?? tour.destinationLinks[0]?.destination ?? null },
      catalog.includes,
      catalog.excludes,
    ),
  );
  const today = catalogToday();
  const featured = tours.find((tour) => tour.featured) ?? tours[0] ?? null;
  const customer = user?.scope === "customer" ? { name: user.name, email: user.email, phone: user.phone } : null;
  const savedIds = user?.scope === "customer" ? await favoriteIds(user.id, "tour") : [];

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,650&family=Outfit:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Tours from World Compass Holidays",
          numberOfItems: tours.length,
          itemListElement: tours.map((tour, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: tour.title,
            url: absoluteUrl(tour.href),
          })),
        }}
      />
      <TourCatalog
        tours={tours}
        initial={readCatalogQuery(params, tours, today)}
        today={today}
        customer={customer}
        featured={featured ? { href: featured.href, title: featured.title } : null}
        savedIds={savedIds}
        signedIn={Boolean(customer)}
      />
    </>
  );
}
