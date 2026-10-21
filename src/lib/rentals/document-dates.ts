/** Calendar date as `YYYY-MM-DD` in the local timezone. */
export function todayDateInput(now = new Date()) {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** A document is expired when its expiry date is before today. The expiry day itself is still valid. */
export function isExpiredDocumentDate(value: string, now = new Date()) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && value < todayDateInput(now);
}

export const expiredDocumentMessage = "This document is expired. Choose a date that is today or later.";
