export type MapPoint = {
  lat: number;
  lng: number;
  zoom: number;
};

export function parseMapPoint(
  lat: string,
  lng: string,
  zoom = 8,
): MapPoint | null {
  if (!lat.trim() || !lng.trim()) return null;
  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) return null;
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return null;
  }
  const level = Number.isFinite(zoom)
    ? Math.min(20, Math.max(1, Math.round(zoom)))
    : 8;
  return { lat: latitude, lng: longitude, zoom: level };
}

export function readMapFields(latRaw: unknown, lngRaw: unknown, zoomRaw: unknown) {
  const mapLat = String(latRaw ?? "").trim();
  const mapLng = String(lngRaw ?? "").trim();
  const zoomParsed = Number(String(zoomRaw ?? "8").trim() || "8");
  if (!Number.isInteger(zoomParsed) || zoomParsed < 1 || zoomParsed > 20) {
    return { ok: false as const, error: "Map zoom must be between 1 and 20." };
  }
  if (!mapLat && !mapLng) {
    return { ok: true as const, mapLat: "", mapLng: "", mapZoom: zoomParsed };
  }
  if (!mapLat || !mapLng) {
    return {
      ok: false as const,
      error: "Enter both latitude and longitude.",
    };
  }
  if (!parseMapPoint(mapLat, mapLng, zoomParsed)) {
    return {
      ok: false as const,
      error:
        "Latitude must be between -90 and 90, and longitude between -180 and 180.",
    };
  }
  return { ok: true as const, mapLat, mapLng, mapZoom: zoomParsed };
}

export function googleMapsEmbedUrl(point: MapPoint, apiKey: string) {
  const params = new URLSearchParams({
    key: apiKey,
    q: `${point.lat},${point.lng}`,
    zoom: String(point.zoom),
  });
  return `https://www.google.com/maps/embed/v1/place?${params.toString()}`;
}
