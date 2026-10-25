import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TourStay } from "@/components/tour-single/TourStay";
import type { TourStayData } from "@/components/tour-single/TourStay";
import { modules } from "@/config/modules";
import { getCurrentUser } from "@/lib/auth/session";
import { loadTourCatalog } from "@/lib/catalog-query";
import { isFavorited } from "@/lib/favorites";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { resolveFaqs, resolveTitles } from "@/lib/hotels/labels";
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tour = await prisma.tour.findUnique({
    where: { slug },
    select: {
      title: true,
      summary: true,
      description: true,
      seoTitle: true,
      seoDescription: true,
      seoIndex: true,
      seoImageUrl: true,
      imageUrl: true,
      featuredImageUrl: true,
      facebookTitle: true,
      facebookDescription: true,
      twitterTitle: true,
      twitterDescription: true,
      published: true,
      destination: { select: { name: true } },
    },
  });
  if (!tour?.published) return privateMetadata("Tour");
  const place = tour.destination?.name;
  const written = tour.seoDescription.trim() || tour.summary.trim() || plainText(tour.description);
  return pageMetadata({
    title: tour.seoTitle.trim() || tour.title,
    description:
      written ||
      `${tour.title}${place ? ` in ${place}` : ""}. A guided tour with duration, group size, and a price before you pay.`,
    path: `/tours/${slug}`,
    image: tour.seoImageUrl || tour.featuredImageUrl || tour.imageUrl,
    imageAlt: tour.title,
    index: tour.seoIndex,
    openGraphTitle: tour.facebookTitle,
    openGraphDescription: tour.facebookDescription,
    twitterTitle: tour.twitterTitle,
    twitterDescription: tour.twitterDescription,
  });
}

export default async function TourPage({ params }: Props) {
  if (!modules.tours) notFound();
  const { slug } = await params;

  const [tour, catalog, user] = await Promise.all([
    prisma.tour.findUnique({
      where: { slug },
      include: {
        destination: { select: { name: true, slug: true } },
        destinationLinks: {
          include: { destination: { select: { name: true, slug: true } } },
          take: 1,
        },
        days: { orderBy: { dayNumber: "asc" } },
        departures: { orderBy: { startDate: "asc" }, take: 12 },
      },
    }),
    loadTourCatalog(),
    getCurrentUser(),
  ]);
  if (!tour || !tour.published) notFound();
  const saved = user?.scope === "customer" ? await isFavorited(user.id, "tour", tour.id) : false;

  const place = tour.destination ?? tour.destinationLinks[0]?.destination ?? null;
  const similarRows = await prisma.tour.findMany({
    where: { published: true, id: { not: tour.id } },
    include: {
      destination: { select: { name: true } },
      destinationLinks: {
        include: { destination: { select: { name: true } } },
        take: 1,
      },
    },
    orderBy: [{ isFeatured: "desc" }, { title: "asc" }],
    take: 8,
  });

  const images = galleryUrls(tour.imageUrl, tour.featuredImageUrl, tour.galleryJson);
  const includes = resolveTitles(tour.includesJson, catalog.includes);
  const excludes = resolveTitles(tour.excludesJson, catalog.excludes);
  const facilities = resolveTitles(tour.facilitiesJson, catalog.facilities);
  const styles = resolveTitles(tour.travelStylesJson, catalog.styles);
  const faqs = resolveFaqs(tour.faqsJson, catalog.faqs);
  const haystack = `${tour.title} ${tour.summary} ${plainText(tour.description)} ${includes.join(" ")}`;
  const languages = languageNames.filter((name) => haystack.toLowerCase().includes(name.toLowerCase()));
  const unit = parseDurationUnit(tour.durationUnit);
  const durationLabel = durationText(tour.durationDays, unit, tour.durationLabel);
  const map = parseMapPoint(tour.mapLat, tour.mapLng, tour.mapZoom);
  const today = new Date().toISOString().slice(0, 10);
  const openDepartures = tour.departures.filter((item) => item.status !== "closed" && isoDay(item.startDate) >= today);

  const similar = similarRows.map((item) => {
    const itemPlace = item.destination ?? item.destinationLinks[0]?.destination ?? null;
    const slides = galleryUrls(item.imageUrl, item.featuredImageUrl, item.galleryJson);
    return {
      href: `/tours/${item.slug}`,
      title: item.title,
      location: itemPlace?.name ?? "",
      duration: durationText(item.durationDays, item.durationUnit, item.durationLabel),
      price: formatMoney(item.priceFrom, item.currency || "INR"),
      image: slides[0] ?? "",
    };
  });

  const data: TourStayData = {
    id: tour.id,
    title: tour.title,
    slug: tour.slug,
    location: place?.name ?? "",
    destinationHref: place?.slug ? `/destinations/${place.slug}` : "/tours",
    category: tour.category.trim() || styles[0] || "",
    durationLabel,
    durationDays: tour.durationDays,
    difficulty: tour.difficulty.trim(),
    minPeople: tour.minPeople,
    maxGroupSize: tour.maxGroupSize,
    priceFrom: tour.priceFrom,
    currency: tour.currency || "INR",
    cancelDays: tour.minDayBeforeBooking && tour.minDayBeforeBooking > 0 ? tour.minDayBeforeBooking : 7,
    images,
    summary: tour.summary,
    description: plainText(tour.description),
    includes,
    excludes,
    facilities: facilities.length > 0 ? facilities : styles,
    languages,
    faqs,
    days: tour.days.map((day) => ({
      dayNumber: day.dayNumber,
      title: day.title,
      description: plainText(day.description),
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
      />
    </>
  );
}
