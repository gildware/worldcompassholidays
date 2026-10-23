import { deskModuleThumb } from "@/lib/bookings";
import { prisma } from "@/lib/db";

/** Resolve a hero thumb from linked catalog when possible. */
export async function resolveEnquiryThumb(
  module: string,
  details: Record<string, unknown>,
  title: string,
): Promise<string> {
  const fallback = deskModuleThumb(module);

  try {
    if (module === "tour") {
      const slug = typeof details.tourSlug === "string" ? details.tourSlug.trim() : "";
      if (slug) {
        const tour = await prisma.tour.findUnique({
          where: { slug },
          select: { imageUrl: true, featuredImageUrl: true },
        });
        const url = tour?.featuredImageUrl || tour?.imageUrl;
        if (url) return url;
      }
      const byTitle = await prisma.tour.findFirst({
        where: { title },
        select: { imageUrl: true, featuredImageUrl: true },
      });
      const url = byTitle?.featuredImageUrl || byTitle?.imageUrl;
      if (url) return url;
    }

    if (module === "hotel") {
      const slug = typeof details.hotelSlug === "string" ? details.hotelSlug.trim() : "";
      if (slug) {
        const hotel = await prisma.hotel.findUnique({
          where: { slug },
          select: { imageUrl: true, featuredImageUrl: true },
        });
        const url = hotel?.featuredImageUrl || hotel?.imageUrl;
        if (url) return url;
      }
      const byName = await prisma.hotel.findFirst({
        where: { name: title },
        select: { imageUrl: true, featuredImageUrl: true },
      });
      const url = byName?.featuredImageUrl || byName?.imageUrl;
      if (url) return url;
    }
  } catch {
    /* fall through to module default */
  }

  return fallback;
}
