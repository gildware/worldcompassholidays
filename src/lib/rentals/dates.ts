export function parseDateTimeLocal(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function toDateTimeLocal(value: Date) {
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export const MIN_PICKUP_LEAD_MS = 30 * 60 * 1000;

export function pickupLeadMessage(pickupAt: Date, now = new Date()) {
  if (pickupAt.getTime() < now.getTime() + MIN_PICKUP_LEAD_MS) {
    return "Pickup must be at least 30 minutes from now.";
  }
  return "";
}

/** Soonest minute a pickup may start, rounded up so the value is a full 30 minutes ahead. */
export function earliestPickupDate(now = new Date()) {
  const at = new Date(now.getTime() + MIN_PICKUP_LEAD_MS);
  if (at.getSeconds() !== 0 || at.getMilliseconds() !== 0) {
    at.setSeconds(0, 0);
    at.setMinutes(at.getMinutes() + 1);
  }
  return at;
}

export function earliestPickupLocal(now = new Date()) {
  return toDateTimeLocal(earliestPickupDate(now));
}

/** Use the given pickup if it clears the lead-time rule; otherwise now + 30 minutes. */
export function resolvePickupLocal(value = "", now = new Date()) {
  const parsed = parseDateTimeLocal(value);
  if (parsed && !pickupLeadMessage(parsed, now)) return toDateTimeLocal(parsed);
  return earliestPickupLocal(now);
}

/** Keep return after pickup; default to one day after pickup when missing or invalid. */
export function resolveReturnLocal(pickupLocal: string, value = "") {
  const start = parseDateTimeLocal(pickupLocal) ?? earliestPickupDate();
  const end = parseDateTimeLocal(value);
  if (end && end > start) return toDateTimeLocal(end);
  const next = new Date(start);
  next.setDate(next.getDate() + 1);
  return toDateTimeLocal(next);
}

export function parseDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function rentalReference() {
  return `RN-${Date.now().toString(36).toUpperCase()}`;
}
