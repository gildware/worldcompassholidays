import { airports as seedAirports, type Airport } from "@/lib/data/airports";
import { prisma } from "@/lib/db";
import { schengenDestination, worldCountries } from "@/lib/data/world-countries";

export type RequestAirport = {
  code: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  label: string;
};

export type RequestCountry = {
  name: string;
  code: string;
  keywords: string;
};

function uniqueSorted(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "en"),
  );
}

/** Published destinations configured under Admin → Destinations. */
export async function loadDestinationNames() {
  const rows = await prisma.destination.findMany({
    where: { published: true },
    select: { name: true },
    orderBy: [{ popular: "desc" }, { name: "asc" }],
  });
  return uniqueSorted(rows.map((row) => row.name));
}

/** Active pickup locations for a rental fleet. */
export async function loadRentalLocationNames(fleet: "car" | "bike") {
  const rows = await prisma.rentalLocation.findMany({
    where: { active: true, fleet },
    select: { name: true },
    orderBy: [{ name: "asc" }],
  });
  return uniqueSorted(rows.map((row) => row.name));
}

/** Bus locations from Buses → Locations configuration. */
export async function loadBusLocationNames() {
  const rows = await prisma.catalogItem.findMany({
    where: { kind: "bus_location" },
    select: { title: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  return uniqueSorted(rows.map((row) => row.title));
}

function parseAirportContent(title: string, content: string): RequestAirport | null {
  const parts = content.split("|").map((part) => part.trim());
  const code = (parts[0] || "").toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) return null;
  const countryCode = (parts[1] || "").toLowerCase();
  const name = parts[2] || title;
  const city = parts[3] || title.replace(/\s*\([A-Z]{3}\)\s*$/, "").trim() || title;
  const country = parts[4] || "";
  return {
    code,
    name,
    city,
    country,
    countryCode,
    label: `${city} (${code})`,
  };
}

async function ensureAssistAirports() {
  const count = await prisma.catalogItem.count({ where: { kind: "assist_airport" } });
  if (count > 0) return;
  await prisma.catalogItem.createMany({
    data: seedAirports.map((airport, index) => ({
      kind: "assist_airport",
      title: `${airport.city} (${airport.code})`,
      content: `${airport.code}|${airport.countryCode}|${airport.name}|${airport.city}|${airport.country}`,
      sortOrder: index,
    })),
  });
}

/** Airports configured under Meet & assist → Airports. */
export async function loadAssistAirports(): Promise<RequestAirport[]> {
  await ensureAssistAirports();
  const rows = await prisma.catalogItem.findMany({
    where: { kind: "assist_airport" },
    select: { title: true, content: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  const parsed = rows.flatMap((row) => {
    const airport = parseAirportContent(row.title, row.content);
    return airport ? [airport] : [];
  });
  return parsed.sort((a, b) => a.label.localeCompare(b.label, "en"));
}

export function findConfiguredAirport(airports: RequestAirport[], code: string) {
  const needle = code.trim().toUpperCase();
  return airports.find((airport) => airport.code === needle);
}

const defaultVisaCountries = [
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Schengen Area",
  "Singapore",
  "Thailand",
  "Malaysia",
  "Indonesia",
  "Maldives",
  "Sri Lanka",
  "Nepal",
  "Qatar",
  "Saudi Arabia",
  "Oman",
  "Bahrain",
  "Turkey",
  "Australia",
  "Canada",
  "Japan",
  "Vietnam",
  "France",
  "Italy",
  "Spain",
  "Germany",
  "Switzerland",
  "Netherlands",
];

async function ensureVisaDestinations() {
  const count = await prisma.catalogItem.count({ where: { kind: "visa_destination" } });
  if (count > 0) return;

  const fromDestinations = await prisma.destination.findMany({
    where: { published: true },
    select: { country: true },
  });
  const names = uniqueSorted([
    ...defaultVisaCountries,
    ...fromDestinations.map((row) => row.country),
  ]);

  await prisma.catalogItem.createMany({
    data: names.map((name, index) => {
      if (name === schengenDestination.name) {
        return {
          kind: "visa_destination",
          title: name,
          content: `${schengenDestination.code}|${schengenDestination.keywords}`,
          sortOrder: index,
        };
      }
      const match = worldCountries.find((item) => item.name === name);
      return {
        kind: "visa_destination",
        title: name,
        content: match ? `${match.code}|${match.keywords}` : "",
        sortOrder: index,
      };
    }),
  });
}

/** Visa destination countries from Visa → Destinations configuration. */
export async function loadVisaDestinations(): Promise<RequestCountry[]> {
  await ensureVisaDestinations();
  const rows = await prisma.catalogItem.findMany({
    where: { kind: "visa_destination" },
    select: { title: true, content: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  return rows.map((row) => {
    const [code = "", keywords = ""] = row.content.split("|").map((part) => part.trim());
    return {
      name: row.title,
      code: code.toLowerCase(),
      keywords,
    };
  });
}

export function toAirportSeed(airport: RequestAirport): Airport {
  return {
    code: airport.code,
    name: airport.name,
    city: airport.city,
    country: airport.country,
    countryCode: airport.countryCode,
  };
}
