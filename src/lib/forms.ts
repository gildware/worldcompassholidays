import type { ZodError } from "zod";

export type FormState = {
  error: string | null;
  success?: string | null;
  fields?: Record<string, string>;
  values?: Record<string, string>;
  tourId?: string | null;
  vehicleId?: string | null;
  hotelId?: string | null;
  reference?: string | null;
  whatsappUrl?: string | null;
};

export const initialFormState: FormState = {
  error: null,
  success: null,
  tourId: null,
};

export function firstIssue(error: ZodError) {
  return error.issues[0]?.message ?? "Check the form and try again.";
}

export function safeRedirectPath(value: unknown, prefix: string, fallback: string) {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith(prefix) || value.startsWith("//")) return fallback;
  return value;
}

export function customerReturnPath(value: unknown, fallback = "/account") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  if (
    value.startsWith("/account") ||
    value.startsWith("/rentals") ||
    value.startsWith("/tours") ||
    value.startsWith("/hotels")
  ) {
    return value;
  }
  return fallback;
}
