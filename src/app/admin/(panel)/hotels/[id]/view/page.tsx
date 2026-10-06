import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HotelView } from "@/components/admin/HotelView";
import { modules } from "@/config/modules";
import { requirePermission } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { loadHotelCatalog } from "@/lib/catalog-query";
import { destinationChoiceLabel } from "@/lib/destinations";
import { prisma } from "@/lib/db";
import { resolveFaqs, resolveTitles } from "@/lib/hotels/labels";
import { parseJsonArray, type GalleryItem } from "@/lib/tours/json";

export const metadata: Metadata = { title: "Hotel" };

export default async function AdminHotelViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!modules.hotels) notFound();
  const user = await requirePermission("hotels.view");
  const { id } = await params;

  const [hotel, catalog] = await Promise.all([
    prisma.hotel.findUnique({
      where: { id },
      include: {
        destination: { include: { parent: { select: { name: true } } } },
        rooms: { orderBy: { sortOrder: "asc" } },
      },
    }),
    loadHotelCatalog(),
  ]);
  if (!hotel) notFound();

  return (
    <HotelView
      canManage={can(user, "hotels.manage")}
      hotel={{
        id: hotel.id,
        name: hotel.name,
        summary: hotel.summary,
        descriptionHtml: hotel.description,
        propertyType: hotel.propertyType,
        starRating: hotel.starRating,
        checkIn: hotel.checkIn,
        checkOut: hotel.checkOut,
        currency: hotel.currency,
        address: hotel.address,
        destinationName: hotel.destination
          ? destinationChoiceLabel(hotel.destination.name, hotel.destination.parent?.name)
          : "",
        amenities: resolveTitles(hotel.amenitiesJson, catalog.amenities),
        faqs: resolveFaqs(hotel.faqsJson, catalog.faqs),
        cancellationPolicy: hotel.cancellationPolicy,
        houseRules: hotel.houseRules,
        published: hotel.published,
        isFeatured: hotel.isFeatured,
        imageUrl: hotel.imageUrl,
        bannerUrl: hotel.featuredImageUrl,
        gallery: parseJsonArray<GalleryItem>(hotel.galleryJson).flatMap((item) =>
          item?.url ? [item.url] : [],
        ),
        priceFrom: hotel.priceFrom,
        rooms: hotel.rooms.map((room) => ({
          id: room.id,
          name: room.name,
          summary: room.summary,
          occupancy: room.occupancy,
          bedType: room.bedType,
          sizeSqm: room.sizeSqm,
          quantity: room.quantity,
          pricePerNight: room.pricePerNight,
          extraGuestPrice: room.extraGuestPrice,
          mealPlan: room.mealPlan,
          features: resolveTitles(room.featuresJson, catalog.features),
          amenities: resolveTitles(room.amenitiesJson, catalog.roomAmenities),
          imageUrl: room.imageUrl,
          active: room.active,
        })),
      }}
    />
  );
}
