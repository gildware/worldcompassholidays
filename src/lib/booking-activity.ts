import { parseBookingDetails, statusLabel } from "@/lib/bookings";

export type BookingActivityItem = {
  at: string;
  status: string;
  message: string;
  actorName?: string;
};

const MAX_ACTIVITY = 40;

export function activityFromDetails(details: Record<string, unknown>): BookingActivityItem[] {
  const raw = details.activity;
  if (!Array.isArray(raw)) return [];
  const items: BookingActivityItem[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const row = item as Record<string, unknown>;
    const at = typeof row.at === "string" ? row.at : "";
    const status = typeof row.status === "string" ? row.status : "";
    const message = typeof row.message === "string" ? row.message : "";
    if (!at || !status) continue;
    const actorName = typeof row.actorName === "string" ? row.actorName : undefined;
    items.push({
      at,
      status,
      message: message || statusLabel(status),
      ...(actorName ? { actorName } : {}),
    });
  }
  return items;
}

export function appendBookingActivity(
  detailsJson: string,
  entry: Omit<BookingActivityItem, "at"> & { at?: string },
): string {
  const details = parseBookingDetails(detailsJson);
  const activity = activityFromDetails(details);
  activity.push({
    at: entry.at ?? new Date().toISOString(),
    status: entry.status,
    message: entry.message || statusLabel(entry.status),
    actorName: entry.actorName,
  });
  details.activity = activity.slice(-MAX_ACTIVITY);
  return JSON.stringify(details);
}

export function ensureEnquiryReceivedActivity(
  detailsJson: string,
  createdAt: Date,
): string {
  const details = parseBookingDetails(detailsJson);
  const activity = activityFromDetails(details);
  if (activity.some((item) => item.status === "enquiry" && /received/i.test(item.message))) {
    return detailsJson;
  }
  activity.unshift({
    at: createdAt.toISOString(),
    status: "enquiry",
    message: "Enquiry received",
  });
  details.activity = activity.slice(-MAX_ACTIVITY);
  return JSON.stringify(details);
}

/** Attach the opening timeline row when creating a new enquiry. */
export function detailsWithEnquiryReceived(
  details: Record<string, unknown>,
  at = new Date(),
): string {
  const activity = activityFromDetails(details);
  if (!activity.some((item) => item.status === "enquiry" && /received/i.test(item.message))) {
    activity.unshift({
      at: at.toISOString(),
      status: "enquiry",
      message: "Enquiry received",
    });
  }
  return JSON.stringify({ ...details, activity: activity.slice(-MAX_ACTIVITY) });
}
