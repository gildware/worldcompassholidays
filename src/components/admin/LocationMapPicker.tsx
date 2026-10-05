"use client";

import { useEffect, useRef, useState } from "react";
import { parseMapPoint } from "@/lib/maps";

type LatLng = { lat: number; lng: number };

type MapHandle = {
  setCenter: (position: LatLng) => void;
  setZoom: (zoom: number) => void;
  getZoom: () => number | undefined;
  fitBounds: (bounds: object) => void;
  addListener: (
    event: string,
    handler: (event?: { latLng?: { lat: () => number; lng: () => number } }) => void,
  ) => { remove: () => void };
};

type MarkerHandle = {
  setMap: (map: MapHandle | null) => void;
  setPosition: (position: LatLng) => void;
};

type Suggestion = { description: string; placeId: string };

type PredictionService = {
  getPlacePredictions: (
    request: { input: string },
    callback: (
      results: Array<{ description: string; place_id: string }> | null,
      status: string,
    ) => void,
  ) => void;
};

type GeocoderService = {
  geocode: (
    request: { placeId: string },
    callback: (
      results: Array<{
        geometry?: {
          location?: { lat: () => number; lng: () => number };
          viewport?: object;
        };
      }> | null,
      status: string,
    ) => void,
  ) => void;
};

type MapsApi = {
  importLibrary: (name: string) => Promise<Record<string, unknown>>;
  Marker: new (options: object) => MarkerHandle;
  event: {
    addListenerOnce: (instance: object, event: string, handler: () => void) => void;
  };
};

declare global {
  interface Window {
    google?: { maps: MapsApi };
  }
}

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629, zoom: 4 };
const loads = new Map<string, Promise<void>>();

function mapsReady() {
  return Boolean(
    window.google?.maps?.importLibrary && typeof window.google.maps.Marker === "function",
  );
}

function loadGoogleMaps(apiKey: string) {
  if (mapsReady()) return Promise.resolve();
  const pending = loads.get(apiKey);
  if (pending) return pending;

  const promise = new Promise<void>((resolve, reject) => {
    const callback = `__initGoogleMaps_${Date.now()}`;
    const win = window as Window & Record<string, (() => void) | undefined>;
    win[callback] = () => {
      delete win[callback];
      if (mapsReady()) resolve();
      else reject(new Error("Google Maps did not finish loading."));
    };
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&callback=${callback}`;
    script.async = true;
    script.onerror = () => {
      delete win[callback];
      loads.delete(apiKey);
      reject(new Error("Google Maps failed to load."));
    };
    document.head.appendChild(script);
  });
  loads.set(apiKey, promise);
  return promise;
}

export function LocationMapPicker({
  apiKey,
  lat,
  lng,
  zoom,
  onChange,
}: {
  apiKey: string;
  lat: string;
  lng: string;
  zoom: number;
  onChange: (next: { lat: string; lng: string; zoom: number }) => void;
}) {
  const mapNode = useRef<HTMLDivElement>(null);
  const mapHandle = useRef<MapHandle | null>(null);
  const markerHandle = useRef<MarkerHandle | null>(null);
  const predictionsRef = useRef<PredictionService | null>(null);
  const geocoderRef = useRef<GeocoderService | null>(null);
  const onChangeRef = useRef(onChange);
  const skipSync = useRef(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const node = mapNode.current;
    if (!node) return;

    let cancelled = false;
    const listeners: Array<{ remove: () => void }> = [];

    loadGoogleMaps(apiKey)
      .then(async () => {
        if (cancelled || !window.google?.maps) return;
        const maps = window.google.maps;
        const { Map } = (await maps.importLibrary("maps")) as {
          Map: new (element: HTMLElement, options: object) => MapHandle;
        };
        await maps.importLibrary("marker");
        const { AutocompleteService } = (await maps.importLibrary("places")) as {
          AutocompleteService: new () => PredictionService;
        };
        const { Geocoder } = (await maps.importLibrary("geocoding")) as {
          Geocoder: new () => GeocoderService;
        };
        if (cancelled) return;

        const start = parseMapPoint(lat, lng, zoom) ?? DEFAULT_CENTER;
        const map = new Map(node, {
          center: { lat: start.lat, lng: start.lng },
          zoom: start.zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        const marker = new maps.Marker({
          map: parseMapPoint(lat, lng, zoom) ? map : null,
          position: { lat: start.lat, lng: start.lng },
        });
        mapHandle.current = map;
        markerHandle.current = marker;
        predictionsRef.current = new AutocompleteService();
        geocoderRef.current = new Geocoder();

        listeners.push(
          map.addListener("click", (event) => {
            if (!event?.latLng) return;
            const position = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng(),
            };
            marker.setMap(map);
            marker.setPosition(position);
            skipSync.current = true;
            onChangeRef.current({
              lat: position.lat.toFixed(6),
              lng: position.lng.toFixed(6),
              zoom: map.getZoom() ?? zoom,
            });
          }),
        );

        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            error instanceof Error ? error.message : "Google Maps failed to load.",
          );
        }
      });

    return () => {
      cancelled = true;
      for (const listener of listeners) listener.remove();
      if (searchTimer.current) clearTimeout(searchTimer.current);
      mapHandle.current = null;
      markerHandle.current = null;
      predictionsRef.current = null;
      geocoderRef.current = null;
    };
    // Mount once per key. Later coordinate edits are applied below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  useEffect(() => {
    const map = mapHandle.current;
    const marker = markerHandle.current;
    if (!map || !marker || status !== "ready") return;
    if (skipSync.current) {
      skipSync.current = false;
      return;
    }
    const point = parseMapPoint(lat, lng, zoom);
    if (!point) return;
    marker.setMap(map);
    marker.setPosition({ lat: point.lat, lng: point.lng });
    map.setCenter({ lat: point.lat, lng: point.lng });
    map.setZoom(point.zoom);
  }, [lat, lng, zoom, status]);

  function publish(position: LatLng, viewport?: object) {
    const map = mapHandle.current;
    const marker = markerHandle.current;
    if (!map || !marker) return;
    marker.setMap(map);
    marker.setPosition(position);
    if (viewport) map.fitBounds(viewport);
    else {
      map.setCenter(position);
      map.setZoom(14);
    }
    window.google?.maps.event.addListenerOnce(map, "idle", () => {
      skipSync.current = true;
      onChangeRef.current({
        lat: position.lat.toFixed(6),
        lng: position.lng.toFixed(6),
        zoom: map.getZoom() ?? 14,
      });
    });
  }

  function onQueryChange(value: string) {
    setQuery(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const service = predictionsRef.current;
    if (!service || !value.trim()) {
      setSuggestions([]);
      return;
    }
    searchTimer.current = setTimeout(() => {
      service.getPlacePredictions({ input: value.trim() }, (results, predictionStatus) => {
        if (predictionStatus === "REQUEST_DENIED") {
          setMessage("Place search was denied. Enable Places API for this key.");
          setSuggestions([]);
          return;
        }
        if (predictionStatus !== "OK" || !results) {
          setSuggestions([]);
          return;
        }
        setSuggestions(
          results.slice(0, 5).map((result) => ({
            description: result.description,
            placeId: result.place_id,
          })),
        );
      });
    }, 200);
  }

  function selectSuggestion(item: Suggestion) {
    setQuery(item.description);
    setSuggestions([]);
    const geocoder = geocoderRef.current;
    if (!geocoder) return;
    geocoder.geocode({ placeId: item.placeId }, (results, geocodeStatus) => {
      const geometry = results?.[0]?.geometry;
      const location = geometry?.location;
      if (geocodeStatus !== "OK" || !location) return;
      publish(
        { lat: location.lat(), lng: location.lng() },
        geometry.viewport,
      );
    });
  }

  return (
    <div className="grid gap-2">
      <div className="relative h-72 rounded-lg border border-line bg-surface">
        <div ref={mapNode} className="h-full w-full overflow-hidden rounded-lg" />
        <div className="absolute top-2 right-14 left-2 z-10">
          <input
            type="text"
            value={query}
            disabled={status !== "ready"}
            placeholder="Search a place"
            aria-label="Search a place"
            autoComplete="off"
            onChange={(event) => onQueryChange(event.target.value)}
            className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-navy shadow-sm outline-none disabled:opacity-70"
          />
          {suggestions.length > 0 ? (
            <ul className="mt-1 overflow-hidden rounded-lg border border-line bg-white shadow-lg">
              {suggestions.map((item) => (
                <li key={item.placeId}>
                  <button
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm text-navy hover:bg-surface"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      selectSuggestion(item);
                    }}
                  >
                    {item.description}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {status === "loading" ? (
          <p className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-xs text-muted">
            Loading map
          </p>
        ) : null}
      </div>
      {message ? <p className="text-xs text-red-700">{message}</p> : null}
      <p className="text-xs text-muted">
        Search a place to drop the pin, or click the map. Latitude and longitude
        update from that selection.
      </p>
    </div>
  );
}
