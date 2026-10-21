import { appliesToFleet } from "@/lib/rentals/labels";

type BookingDocumentConfig = {
  id: string;
  kind: string;
  name: string;
  active: boolean;
  appliesTo: string;
  sortOrder: number;
};

/** Bikes ask only for the documents chosen on that bike. Cars keep the fleet list. */
export function documentsRequiredToBook<T extends BookingDocumentConfig>(
  kind: string,
  linked: T[],
  fleetDocuments: T[],
) {
  const source = kind === "bike" ? linked : fleetDocuments;
  return source
    .filter((item) => item.kind === "customer_document" && item.active && appliesToFleet(item.appliesTo, kind))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}
