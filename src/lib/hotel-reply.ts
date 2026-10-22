export const hotelReplyTopics = [
  "Location",
  "Staff",
  "Cleanliness",
  "Value for money",
  "Comfort",
  "Facilities",
  "Free WiFi",
] as const;

export type HotelReplyTopic = (typeof hotelReplyTopics)[number];

export type HotelReply = {
  ratings: Record<HotelReplyTopic, number>;
  comment: string;
  submittedAt: string;
};

export const bookedHotelStatuses = ["confirmed", "paid", "completed"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function readBookingDetails(raw: string) {
  try {
    const value = JSON.parse(raw) as unknown;
    return isRecord(value) ? value : {};
  } catch {
    return {};
  }
}

export function readHotelReply(raw: string): HotelReply | null {
  const review = readBookingDetails(raw).review;
  if (!isRecord(review) || typeof review.comment !== "string") return null;
  const ratings = isRecord(review.ratings) ? review.ratings : {};
  const next = {} as Record<HotelReplyTopic, number>;
  for (const topic of hotelReplyTopics) {
    const score = Number(ratings[topic]);
    next[topic] = score >= 1 && score <= 5 ? score : 5;
  }
  return {
    ratings: next,
    comment: review.comment,
    submittedAt: typeof review.submittedAt === "string" ? review.submittedAt : "",
  };
}
