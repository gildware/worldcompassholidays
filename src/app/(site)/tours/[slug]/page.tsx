import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { TourStay } from "@/components/tour-single/TourStay";
import type { TourStayData } from "@/components/tour-single/TourStay";
import { modules } from "@/config/modules";
import { countryIsoFromHeaders } from "@/lib/auth/countries";
import { getCurrentUser } from "@/lib/auth/session";
import { loadTourCatalog } from "@/lib/catalog-query";
import { isFavorited } from "@/lib/favorites";
import { prisma } from "@/lib/db";
import { getUserLocale } from "@/i18n/get-locale";
import { localFaqs } from "@/lib/catalog";
import {
  applyLocalFaqCopy,
  loadCopyMap,
  loadOwnerCopies,
  withCatalogCopy,
  withPlaceCopy,
  withTourCopy,
} from "@/lib/i18n/content";
import { firebaseWebConfig } from "@/lib/firebase/config";
import { cached } from "@/lib/ttl-cache";
import { formatMoney } from "@/lib/format";
import { resolveCatalogItems, resolveFaqs } from "@/lib/hotels/labels";
import { parseMapPoint } from "@/lib/maps";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  absoluteUrl,
  breadcrumbNode,
  faqNode,
  graphLd,
  offerNode,
  organizationNode,
  pageMetadata,
  plainText,
  privateMetadata,
  siteOrigin,
} from "@/lib/seo";
import { recordCatalogView } from "@/lib/catalog-views";
import {
  formatTourDuration,
  parseDurationUnit,
  parseJsonArray,
  type GalleryItem,
} from "@/lib/tours/json";

type Props = { params: Promise<{ slug: string }> };

const languageNames = ["English", "Spanish", "French", "Turkish", "German", "Chinese", "Portuguese", "Japanese", "Italian"];

function durationText(count: number, unit: string, label: string) {
  if (label.trim()) return label.trim();
  return formatTourDuration(count, parseDurationUnit(unit));
}

function galleryUrls(imageUrl: string, featuredImageUrl: string, galleryJson: string) {
  const gallery = parseJsonArray<GalleryItem>(galleryJson).flatMap((item) => (item?.url ? [item.url] : []));
  return [...new Set([imageUrl, featuredImageUrl, ...gallery].filter(Boolean))];
}

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

function departureLabel(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  const weekday = date.toLocaleDateString("en-GB", { weekday: "short" });
  const month = date.toLocaleDateString("en-GB", { month: "short" });
  return `${weekday} ${date.getDate()} ${month}`;
}

function loadTour(slug: string) {
  return cached(`tour:${slug}`, 30_000, () =>
    prisma.tour.findUnique({
      where: { slug },
      include: {
        destination: { select: { id: true, name: true, slug: true, summary: true } },
        destinationLinks: {
          include: { destination: { select: { id: true, name: true, slug: true, summary: true } } },
          take: 1,
        },
        days: { orderBy: { dayNumber: "asc" } },
        departures: { orderBy: { startDate: "asc" }, take: 12 },
      },
    }),
  );
}

function loadSimilarTours() {
  return cached("tour-similar", 30_000, () =>
    prisma.tour.findMany({
      where: { published: true },
      include: {
        destination: { select: { id: true, name: true, summary: true } },
        destinationLinks: {
          include: { destination: { select: { id: true, name: true, summary: true } } },
          take: 1,
        },
      },
      orderBy: [{ isFeatured: "desc" }, { title: "asc" }],
      take: 12,
    }),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getUserLocale();
  const loaded = await loadTour(slug);
  const copy = loaded && locale !== "en" ? (await loadOwnerCopies("tour", loaded.id))[locale] : undefined;
  const tour = loaded ? withTourCopy(loaded, copy) : null;
  if (!tour?.published) return privateMetadata("Tour");
  const placeSource = tour.destination ?? tour.destinationLinks[0]?.destination ?? null;
  const placeCopy =
    placeSource && locale !== "en" ? (await loadOwnerCopies("destination", placeSource.id))[locale] : undefined;
  const place = placeSource ? withPlaceCopy(placeSource, placeCopy).name : undefined;
  const written = tour.seoDescription.trim() || tour.summary.trim() || plainText(tour.description);
  const fallbackTitle = place ? `${tour.title} | ${place} Tour` : `${tour.title} | India Tour`;
  return pageMetadata({
    title: tour.seoTitle.trim() || fallbackTitle,
    description:
      written ||
      `${tour.title}${place ? ` in ${place}` : ""} — a guided India tour with duration, group size, and a clear price before you pay.`,
    path: `/tours/${slug}`,
    image: tour.seoImageUrl || tour.featuredImageUrl || tour.imageUrl,
    imageAlt: tour.title,
    index: tour.seoIndex,
    openGraphTitle: tour.facebookTitle.trim() || undefined,
    openGraphDescription: tour.facebookDescription.trim() || undefined,
    twitterTitle: tour.twitterTitle.trim() || undefined,
    twitterDescription: tour.twitterDescription.trim() || undefined,
    type: "article",
  });
}

export default async function TourPage({ params }: Props) {
  if (!modules.tours) notFound();
  const { slug } = await params;
  const locale = await getUserLocale();

  const [loaded, catalog, user, similarPool] = await Promise.all([
    loadTour(slug),
    loadTourCatalog(),
    getCurrentUser(),
    loadSimilarTours(),
  ]);
  if (!loaded || !loaded.published) notFound();
  const catalogIds = [
    ...catalog.categories,
    ...catalog.styles,
    ...catalog.facilities,
    ...catalog.faqs,
    ...catalog.includes,
    ...catalog.excludes,
    ...catalog.beforeYouGo,
  ].map((item) => item.id);
  const placeIds = [
    ...new Set(
      [loaded, ...similarPool].flatMap((tour) => {
        const place = tour.destination ?? tour.destinationLinks[0]?.destination ?? null;
        return place ? [place.id] : [];
      }),
    ),
  ];
  const [copies, catalogCopies, placeCopies] = await Promise.all([
    loadCopyMap("tour", [loaded.id, ...similarPool.map((item) => item.id)], locale),
    loadCopyMap("catalog", catalogIds, locale),
    loadCopyMap("destination", placeIds, locale),
  ]);
  const spokenCatalog = {
    categories: withCatalogCopy(catalog.categories, catalogCopies),
    styles: withCatalogCopy(catalog.styles, catalogCopies),
    facilities: withCatalogCopy(catalog.facilities, catalogCopies),
    faqs: withCatalogCopy(catalog.faqs, catalogCopies),
    includes: withCatalogCopy(catalog.includes, catalogCopies),
    excludes: withCatalogCopy(catalog.excludes, catalogCopies),
    beforeYouGo: withCatalogCopy(catalog.beforeYouGo, catalogCopies),
  };
  const tour = withTourCopy(loaded, copies.get(loaded.id));
  recordCatalogView("tour", tour.id);
  const saved = user?.scope === "customer" ? await isFavorited(user.id, "tour", tour.id) : false;

  const placeSource = tour.destination ?? tour.destinationLinks[0]?.destination ?? null;
  const place = placeSource ? withPlaceCopy(placeSource, placeCopies.get(placeSource.id)) : null;
  const similarRows = similarPool.filter((row) => row.id !== tour.id).slice(0, 8);

  const images = galleryUrls(tour.imageUrl, tour.featuredImageUrl, tour.galleryJson);
  const includes = resolveCatalogItems(tour.includesJson, spokenCatalog.includes);
  const excludes = resolveCatalogItems(tour.excludesJson, spokenCatalog.excludes);
  const beforeYouGo = resolveCatalogItems(tour.beforeYouGoJson, spokenCatalog.beforeYouGo);
  const facilities = resolveCatalogItems(tour.facilitiesJson, spokenCatalog.facilities);
  const styles = resolveCatalogItems(tour.travelStylesJson, spokenCatalog.styles);
  const faqs = applyLocalFaqCopy(
    resolveFaqs(tour.faqsJson, spokenCatalog.faqs),
    localFaqs(parseJsonArray(tour.faqsJson)).length,
    copies.get(loaded.id),
  );
  const categoryOption =
    catalog.categories.find(
      (item) =>
        item.id === tour.categoryId ||
        item.title.toLowerCase() === loaded.category.trim().toLowerCase(),
    ) ?? null;
  const englishIncludes = resolveCatalogItems(loaded.includesJson, catalog.includes);
  const haystack = `${loaded.title} ${loaded.summary} ${plainText(loaded.description)} ${englishIncludes.map((item) => item.title).join(" ")}`;
  const languages = languageNames.filter((name) => haystack.toLowerCase().includes(name.toLowerCase()));
  const unit = parseDurationUnit(tour.durationUnit);
  const durationLabel = durationText(tour.durationDays, unit, tour.durationLabel);
  const map = parseMapPoint(tour.mapLat, tour.mapLng, tour.mapZoom);
  const today = new Date().toISOString().slice(0, 10);
  const openDepartures = tour.departures.filter((item) => item.status !== "closed" && isoDay(item.startDate) >= today);

  const similar = similarRows.map((row) => {
    const item = withTourCopy(row, copies.get(row.id));
    const itemPlaceSource = item.destination ?? item.destinationLinks[0]?.destination ?? null;
    const itemPlace = itemPlaceSource
      ? withPlaceCopy(itemPlaceSource, placeCopies.get(itemPlaceSource.id))
      : null;
    const slides = galleryUrls(item.imageUrl, item.featuredImageUrl, item.galleryJson);
    return {
      href: `/tours/${item.slug}`,
      title: item.title,
      location: itemPlace?.name ?? "",
      duration: durationText(item.durationDays, item.durationUnit, item.durationLabel),
      price: formatMoney(item.priceFrom, item.currency || "INR", locale),
      image: slides[0] ?? "",
    };
  });

  const data: TourStayData = {
    id: tour.id,
    title: tour.title,
    slug: tour.slug,
    location: place?.name ?? "",
    destinationHref: place?.slug ? `/destinations/${place.slug}` : "/tours",
    category: tour.category.trim() || styles[0]?.title || "",
    categoryIconUrl: categoryOption?.iconUrl ?? "",
    durationLabel,
    durationDays: tour.durationDays,
    difficulty: tour.difficulty.trim(),
    minPeople: tour.minPeople,
    maxGroupSize: tour.maxGroupSize,
    priceFrom: tour.priceFrom,
    currency: tour.currency || "INR",
    cancelDays: tour.minDayBeforeBooking && tour.minDayBeforeBooking > 0 ? tour.minDayBeforeBooking : 7,
    defaultState: tour.defaultState === "dates" ? "dates" : "always",
    availabilityFrom: tour.availabilityFrom ? isoDay(tour.availabilityFrom) : null,
    availabilityTo: tour.availabilityTo ? isoDay(tour.availabilityTo) : null,
    images,
    summary: tour.summary,
    description: plainText(tour.description),
    includes,
    excludes,
    beforeYouGo,
    facilities,
    styles,
    languages,
    faqs,
    days: tour.days.map((day) => ({
      dayNumber: day.dayNumber,
      title: day.title,
      description: plainText(day.description ?? ""),
      morning: plainText(day.morning ?? ""),
      afternoon: plainText(day.afternoon ?? ""),
      evening: plainText(day.evening ?? ""),
      imageUrl: day.imageUrl,
    })),
    departures: openDepartures.map((item) => {
      const iso = isoDay(item.startDate);
      return {
        id: item.id,
        iso,
        endIso: item.endDate ? isoDay(item.endDate) : "",
        label: departureLabel(iso),
        seats: item.seatsTotal,
        price: item.price > 0 ? item.price : tour.priceFrom,
      };
    }),
    address: tour.address,
    map: map ? { lat: map.lat, lng: map.lng } : null,
    similar,
  };

  const path = `/tours/${tour.slug}`;
  const description =
    tour.seoDescription.trim() ||
    tour.summary.trim() ||
    plainText(tour.description) ||
    `${tour.title}${place?.name ? ` in ${place.name}` : ""}.`;

  return (
    <>
      <JsonLd
        data={graphLd([
          organizationNode(),
          breadcrumbNode([
            { name: "Home", path: "/" },
            {
              name: place?.name ? `${place.name} tours` : "Tours",
              path: place?.slug ? `/destinations/${place.slug}` : "/tours",
            },
            { name: tour.title, path },
          ]),
          faqNode(faqs),
          {
            "@type": "TouristTrip",
            name: tour.title,
            description,
            url: absoluteUrl(path),
            image: images.map((image) => absoluteUrl(image)),
            ...(tour.category.trim() ? { touristType: tour.category.trim() } : {}),
            provider: { "@id": `${siteOrigin()}/#organization` },
            ...(tour.days.length
              ? {
                  itinerary: {
                    "@type": "ItemList",
                    itemListElement: tour.days.map((day) => ({
                      "@type": "ListItem",
                      position: day.dayNumber,
                      name: day.title,
                      description: plainText(day.description),
                    })),
                  },
                }
              : {}),
            offers: offerNode({
              price: tour.priceFrom,
              currency: tour.currency || "INR",
              path,
              availability: "LimitedAvailability",
            }),
          },
        ])}
      />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,560;9..144,650&family=Outfit:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <TourStay
        tour={data}
        customer={user?.scope === "customer" ? { name: user.name, email: user.email, phone: user.phone } : null}
        saved={saved}
        firebaseConfig={firebaseWebConfig()}
        defaultCountry={countryIsoFromHeaders(await headers())}
      />
    </>
  );
}
