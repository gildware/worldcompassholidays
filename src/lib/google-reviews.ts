import { mapApiKey } from "@/lib/map-key";
import { cached } from "@/lib/ttl-cache";

export type GoogleReview = {
  /** Stable id for admin show/hide (`time` from Google). */
  id: string;
  authorName: string;
  authorUrl: string;
  profilePhotoUrl: string;
  rating: number;
  relativeTime: string;
  text: string;
  time: number;
};

export function googleReviewId(time: number, authorName = "") {
  if (time > 0) return `grev-${time}`;
  const name = authorName.trim().toLowerCase().replace(/\s+/g, "-") || "guest";
  return `grev-name-${name}`;
}

export function withGoogleReviewId(
  review: Omit<GoogleReview, "id"> & { id?: string },
): GoogleReview {
  return {
    ...review,
    id: review.id && review.id.startsWith("grev-")
      ? review.id
      : googleReviewId(review.time, review.authorName),
  };
}

export type GoogleReviewsSummary = {
  name: string;
  rating: number;
  total: number;
  mapsUrl: string;
  reviews: GoogleReview[];
};

export function normalizeGooglePlaceId(value: string | null | undefined) {
  return (value || "")
    .trim()
    .replace(/^place_id=/i, "")
    .slice(0, 256);
}

type PlaceDetailsPayload = {
  status?: string;
  result?: {
    name?: string;
    rating?: number;
    user_ratings_total?: number;
    url?: string;
    reviews?: Array<{
      author_name?: string;
      author_url?: string;
      profile_photo_url?: string;
      rating?: number;
      relative_time_description?: string;
      text?: string;
      time?: number;
    }>;
  };
};

async function fetchGoogleReviews(placeId: string): Promise<GoogleReviewsSummary | null> {
  const key = mapApiKey();
  if (!key || !placeId) return null;

  const params = new URLSearchParams({
    place_id: placeId,
    fields: "name,rating,user_ratings_total,url,reviews",
    reviews_sort: "newest",
    key,
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${params}`,
    { next: { revalidate: 3600 } },
  );
  if (!response.ok) return null;

  const payload = (await response.json()) as PlaceDetailsPayload;
  if (payload.status !== "OK" || !payload.result) return null;

  const result = payload.result;
  const reviews = (result.reviews || [])
    .map((review) => {
      const authorName = (review.author_name || "Google user").trim();
      const time = typeof review.time === "number" ? review.time : 0;
      return withGoogleReviewId({
        authorName,
        authorUrl: (review.author_url || "").trim(),
        profilePhotoUrl: (review.profile_photo_url || "").trim(),
        rating: typeof review.rating === "number" ? review.rating : 0,
        relativeTime: (review.relative_time_description || "").trim(),
        text: (review.text || "").trim(),
        time,
      });
    })
    .filter((review) => review.rating > 0)
    .sort((a, b) => b.time - a.time)
    .slice(0, 5);

  const total = result.user_ratings_total || reviews.length;
  const rating = result.rating || 0;
  if (!total && !reviews.length) return null;

  return {
    name: (result.name || "Google Business Profile").trim(),
    rating,
    total,
    mapsUrl:
      (result.url || "").trim() ||
      `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${encodeURIComponent(placeId)}`,
    reviews,
  };
}

/** Live Google Business Profile reviews for a Place ID from Homepage admin. */
export async function getGoogleReviewsForPlace(
  placeIdRaw: string | null | undefined,
): Promise<GoogleReviewsSummary | null> {
  const placeId = normalizeGooglePlaceId(placeIdRaw);
  if (!placeId) return null;
  try {
    const summary = await cached(
      `google-reviews-v3:${placeId}`,
      60 * 60 * 1000,
      () => fetchGoogleReviews(placeId),
    );
    if (!summary) return null;
    return {
      ...summary,
      reviews: summary.reviews.map((review) => withGoogleReviewId(review)),
    };
  } catch {
    return null;
  }
}
