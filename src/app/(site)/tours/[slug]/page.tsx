import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TourSingle } from "@/components/tour-single/TourSingle";
import type { PopularTourCard, TourSingleData } from "@/components/tour-single/types";
import { modules } from "@/config/modules";
import { loadTourCatalog } from "@/lib/catalog-query";
import { prisma } from "@/lib/db";
import { formatMoney, formatDate } from "@/lib/format";
import { resolveFaqs, resolveTitles } from "@/lib/hotels/labels";
import { mapApiKey } from "@/lib/map-key";
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

  const [tour, catalog] = await Promise.all([
    prisma.tour.findUnique({
      where: { slug },
      include: {
        destination: { select: { name: true, slug: true } },
        destinationLinks: {
          include: { destination: { select: { name: true, slug: true } } },
          take: 1,
        },
        days: { orderBy: { dayNumber: "asc" } },
        departures: { orderBy: { startDate: "asc" }, take: 4 },
      },
    }),
    loadTourCatalog(),
  ]);
  if (!tour || !tour.published) notFound();

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
  const mapUrl = map
    ? `https://www.google.com/maps?q=${encodeURIComponent(`${map.lat},${map.lng}`)}`
    : "";
  const openDepartures = tour.departures.filter((item) => item.status !== "closed");
  const departureText = openDepartures.length
    ? openDepartures
        .map((item) => `Departs ${formatDate(item.startDate)}${item.endDate ? ` and returns ${formatDate(item.endDate)}` : ""}`)
        .join(". ")
    : tour.address;

  const similar: PopularTourCard[] = similarRows.map((item) => {
    const itemPlace = item.destination ?? item.destinationLinks[0]?.destination ?? null;
    const slides = galleryUrls(item.imageUrl, item.featuredImageUrl, item.galleryJson);
    return {
      id: item.id,
      href: `/tours/${item.slug}`,
      title: item.title,
      location: itemPlace?.name ?? "",
      duration: durationText(item.durationDays, item.durationUnit, item.durationLabel),
      tourType: item.category.trim(),
      price: formatMoney(item.priceFrom, item.currency || "INR"),
      tag: item.isFeatured ? "best seller" : "",
      slideImg: slides.length > 0 ? slides : ["/img/tours/5.png"],
    };
  });

  const extraNotes = [
    tour.summary.trim(),
    tour.address.trim() ? `Meeting point: ${tour.address.trim()}` : "",
    ...styles,
  ].filter(Boolean);

  const data: TourSingleData = {
    title: tour.title,
    slug: tour.slug,
    location: place?.name ?? "",
    destinationHref: place?.slug ? `/destinations/${place.slug}` : "/tours",
    address: tour.address,
    category: tour.category.trim(),
    durationLabel,
    groupSize: tour.maxGroupSize > 0 ? tour.maxGroupSize : 1,
    priceLabel: formatMoney(tour.priceFrom, tour.currency || "INR"),
    images,
    summary: tour.summary,
    descriptionHtml: tour.description,
    includes,
    excludes,
    languages,
    highlights: facilities.length > 0 ? facilities : styles,
    faqs,
    days: tour.days.map((day) => ({
      dayNumber: day.dayNumber,
      title: day.title,
      description: day.description,
      imageUrl: day.imageUrl,
    })),
    map,
    mapUrl,
    departureText,
    extraNotes,
    similar,
    freeCancellation: /free cancellation/i.test(haystack),
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
      <TourSingle tour={data} mapApiKey={mapApiKey()} />
    </>
  );
}
