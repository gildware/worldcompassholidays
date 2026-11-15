import type { TourFormat } from "../sample-tour-classic-kashmir";

/** Wire cover / gallery / day slots from `public/uploads/tours/{slug}-*.jpg`. */
export function withLocalTourImages(tour: TourFormat): TourFormat {
  const slug = tour.slug;
  return {
    ...tour,
    itinerary: {
      ...tour.itinerary,
      days: tour.itinerary.days.map((day) => ({
        ...day,
        imageKey: `tours/${slug}-d${day.dayNumber}.jpg`,
      })),
    },
    images: {
      banner: `tours/${slug}-cover.jpg`,
      cover: `tours/${slug}-cover.jpg`,
      gallery: [
        `tours/${slug}-g1.jpg`,
        `tours/${slug}-g2.jpg`,
        `tours/${slug}-g3.jpg`,
        `tours/${slug}-g4.jpg`,
      ],
      seoImage: `tours/${slug}-cover.jpg`,
    },
  };
}
