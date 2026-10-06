"use client";

export type GoogleMarker = {
  setMap: (map: object | null) => void;
  setPosition: (position: { lat: number; lng: number }) => void;
  setIcon: (icon: object | string | null) => void;
  setZIndex: (zIndex: number) => void;
  addListener: (event: string, handler: () => void) => { remove: () => void };
};

export type GoogleMapsApi = {
  importLibrary: (name: string) => Promise<Record<string, unknown>>;
  Marker: new (options: object) => GoogleMarker;
  event: {
    addListenerOnce: (instance: object, event: string, handler: () => void) => void;
    trigger: (instance: object, event: string) => void;
  };
  LatLngBounds: new () => {
    extend: (position: { lat: number; lng: number }) => void;
  };
  SymbolPath: { CIRCLE: number };
};

declare global {
  interface Window {
    google?: { maps: GoogleMapsApi };
  }
}

const loads = new Map<string, Promise<void>>();

function mapsReady() {
  return Boolean(
    window.google?.maps?.importLibrary && typeof window.google.maps.Marker === "function",
  );
}

export function loadGoogleMaps(apiKey: string) {
  if (!apiKey) return Promise.reject(new Error("Google Maps API key is missing."));
  if (mapsReady()) return Promise.resolve();
  const pending = loads.get(apiKey);
  if (pending) return pending;

  const promise = new Promise<void>((resolve, reject) => {
    const callback = `__initGoogleMaps_${Date.now()}`;
    const win = window as unknown as Record<string, (() => void) | undefined>;
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
