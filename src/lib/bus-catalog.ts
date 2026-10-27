import { parseStringList } from "@/lib/buses";
import { prisma } from "@/lib/db";
import { uniqueSlug } from "@/lib/slug";

/** City and stand pins used when a location was created from an older route. */
const KNOWN_PINS: Record<string, { lat: string; lng: string; zoom: number }> = {
  srinagar: { lat: "34.083656", lng: "74.797371", zoom: 13 },
  jammu: { lat: "32.726602", lng: "74.857026", zoom: 13 },
  leh: { lat: "34.152588", lng: "77.577049", zoom: 13 },
  manali: { lat: "32.243187", lng: "77.189176", zoom: 13 },
  delhi: { lat: "28.613939", lng: "77.209023", zoom: 11 },
  pahalgam: { lat: "34.016087", lng: "75.315002", zoom: 13 },
};

const STARTER_FACILITIES = [
  "Air conditioning",
  "Charging points",
  "Blanket",
  "Water bottle",
  "Recliner seats",
  "Sleeper berth",
  "Reading light",
  "Wi-Fi",
  "GPS tracking",
  "Emergency exit",
];

function isUnique(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  );
}

/** Create locations and facilities from routes that were saved before the catalog existed. */
export async function ensureBusCatalog() {
  const [routes, locations, facilities] = await Promise.all([
    prisma.busRoute.findMany({
      select: {
        id: true,
        fromCity: true,
        toCity: true,
        pickup: true,
        amenitiesJson: true,
        fromLocationId: true,
        toLocationId: true,
      },
    }),
    prisma.catalogItem.findMany({
      where: { kind: "bus_location" },
      select: { id: true, title: true, mapLat: true },
    }),
    prisma.catalogItem.findMany({
      where: { kind: "bus_facility" },
      select: { id: true, title: true },
    }),
  ]);

  const locationTitles = new Set(locations.map((item) => item.title.toLowerCase()));
  const cities = [
    ...new Set(
      routes.flatMap((route) => [route.fromCity.trim(), route.toCity.trim()]).filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b));

  let locationOrder = locations.length;
  for (const city of cities) {
    if (locationTitles.has(city.toLowerCase())) continue;
    const note =
      routes.find(
        (route) =>
          route.fromCity.trim().toLowerCase() === city.toLowerCase() && route.pickup.trim(),
      )?.pickup.trim() ?? "";
    try {
      await prisma.catalogItem.create({
        data: {
          kind: "bus_location",
          title: city,
          content: note.slice(0, 160),
          sortOrder: locationOrder,
        },
      });
      locationOrder += 1;
      locationTitles.add(city.toLowerCase());
    } catch (error) {
      if (!isUnique(error)) throw error;
    }
  }

  const facilityIds = new Set(facilities.map((item) => item.id));
  const facilityTitles = new Set(facilities.map((item) => item.title.toLowerCase()));
  const wanted = new Set<string>();
  for (const name of routes.flatMap((route) => parseStringList(route.amenitiesJson))) {
    const title = name.trim();
    if (title.length < 2 || title.length > 80) continue;
    if (facilityIds.has(title) || facilityTitles.has(title.toLowerCase())) continue;
    wanted.add(title);
  }
  if (facilities.length === 0) {
    for (const title of STARTER_FACILITIES) wanted.add(title);
  }

  let facilityOrder = facilities.length;
  for (const title of wanted) {
    if (facilityTitles.has(title.toLowerCase())) continue;
    try {
      await prisma.catalogItem.create({
        data: { kind: "bus_facility", title, sortOrder: facilityOrder },
      });
      facilityOrder += 1;
      facilityTitles.add(title.toLowerCase());
    } catch (error) {
      if (!isUnique(error)) throw error;
    }
  }

  const placed = await prisma.catalogItem.findMany({
    where: { kind: "bus_location" },
    select: { id: true, title: true, mapLat: true, mapLng: true },
  });
  for (const location of placed) {
    if (location.mapLat && location.mapLng) continue;
    const pin = KNOWN_PINS[location.title.trim().toLowerCase()];
    if (!pin) continue;
    await prisma.catalogItem.update({
      where: { id: location.id },
      data: { mapLat: pin.lat, mapLng: pin.lng, mapZoom: pin.zoom },
    });
  }

  const byTitle = new Map(
    (
      await prisma.catalogItem.findMany({
        where: { kind: "bus_location" },
        select: { id: true, title: true },
      })
    ).map((location) => [location.title.toLowerCase(), location.id]),
  );
  for (const route of routes) {
    const fromLocationId = byTitle.get(route.fromCity.trim().toLowerCase()) ?? null;
    const toLocationId = byTitle.get(route.toCity.trim().toLowerCase()) ?? null;
    if (route.fromLocationId === fromLocationId && route.toLocationId === toLocationId) continue;
    await prisma.busRoute.update({
      where: { id: route.id },
      data: { fromLocationId, toLocationId },
    });
  }

  await ensureBuses();
}

/** One coach record for every route that was saved before buses and routes were split. */
async function ensureBuses() {
  const routes = await prisma.busRoute.findMany({
    where: { busId: null },
    select: {
      id: true,
      name: true,
      operator: true,
      coachType: true,
      summary: true,
      about: true,
      imageUrl: true,
      imageKey: true,
      imageDriver: true,
      galleryJson: true,
      amenitiesJson: true,
      published: true,
    },
  });

  for (const route of routes) {
    const slug = await uniqueSlug(route.name || "coach", async (candidate) => {
      const found = await prisma.bus.findUnique({ where: { slug: candidate }, select: { id: true } });
      return Boolean(found);
    });
    const bus = await prisma.bus.create({
      data: {
        slug,
        name: route.name || "Coach",
        operator: route.operator,
        coachType: route.coachType,
        summary: route.summary,
        about: route.about,
        imageUrl: route.imageUrl,
        imageKey: route.imageKey,
        imageDriver: route.imageDriver,
        galleryJson: route.galleryJson,
        amenitiesJson: route.amenitiesJson,
        published: route.published,
      },
    });
    await prisma.busRoute.update({
      where: { id: route.id },
      data: { busId: bus.id },
    });
  }
}

/** Keep the public route row in step with the coach it runs. */
export async function mirrorBusOntoRoutes(busId: string) {
  const bus = await prisma.bus.findUnique({ where: { id: busId } });
  if (!bus) return;
  await prisma.busRoute.updateMany({
    where: { busId },
    data: {
      name: bus.name,
      operator: bus.operator,
      coachType: bus.coachType,
      summary: bus.summary,
      about: bus.about,
      imageUrl: bus.imageUrl,
      imageDriver: bus.imageDriver,
      galleryJson: bus.galleryJson,
      amenitiesJson: bus.amenitiesJson,
    },
  });
}

export async function loadBusFacilities() {
  return prisma.catalogItem.findMany({
    where: { kind: "bus_facility" },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    select: { id: true, title: true, iconUrl: true },
  });
}

export async function loadBusLocations() {
  const locations = await prisma.catalogItem.findMany({
    where: { kind: "bus_location" },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      content: true,
      mapLat: true,
      mapLng: true,
      mapZoom: true,
    },
  });

  for (const location of locations) {
    if (location.mapLat && location.mapLng) continue;
    const pin = KNOWN_PINS[location.title.trim().toLowerCase()];
    if (!pin) continue;
    await prisma.catalogItem.update({
      where: { id: location.id },
      data: { mapLat: pin.lat, mapLng: pin.lng, mapZoom: pin.zoom },
    });
    location.mapLat = pin.lat;
    location.mapLng = pin.lng;
    location.mapZoom = pin.zoom;
  }

  return locations;
}

export function matchBusPlace<T extends { id: string; title: string }>(
  places: T[],
  id: string | null | undefined,
  city: string,
) {
  return (
    places.find((place) => id && place.id === id) ??
    places.find((place) => place.title.toLowerCase() === city.trim().toLowerCase()) ??
    null
  );
}
