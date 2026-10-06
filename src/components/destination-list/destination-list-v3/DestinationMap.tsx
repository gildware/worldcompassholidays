"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps, type GoogleMarker } from "@/lib/google-maps";

export type MapPin = {
  id: string;
  name: string;
  href: string;
  lat: number;
  lng: number;
  imageUrl: string;
  region: string;
  country: string;
  summary: string;
  popular: boolean;
  tourCount: number;
  hotelCount: number;
  rentalCount: number;
};

type GoogleMap = {
  fitBounds: (bounds: object, padding?: number) => void;
  panTo: (position: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
  setCenter: (position: { lat: number; lng: number }) => void;
};

type GoogleInfoWindow = {
  setContent: (node: HTMLElement) => void;
  open: (options: { map: GoogleMap; anchor: GoogleMarker }) => void;
  close: () => void;
};

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };

function listingBits(pin: MapPin) {
  return [
    pin.tourCount > 0 ? `${pin.tourCount} tour${pin.tourCount === 1 ? "" : "s"}` : "",
    pin.hotelCount > 0 ? `${pin.hotelCount} stay${pin.hotelCount === 1 ? "" : "s"}` : "",
    pin.rentalCount > 0 ? `${pin.rentalCount} rental${pin.rentalCount === 1 ? "" : "s"}` : "",
  ].filter(Boolean);
}

function safeImage(url: string) {
  if (url.startsWith("/") || url.startsWith("https://") || url.startsWith("http://")) return url;
  return "";
}

function pinCard(pin: MapPin) {
  const root = document.createElement("div");
  root.className = "destination-map-card";
  const image = safeImage(pin.imageUrl);
  if (image) {
    const img = document.createElement("img");
    img.src = image;
    img.alt = "";
    root.appendChild(img);
  }

  const body = document.createElement("div");
  body.className = "destination-map-card__body";
  const place = [pin.country, pin.region].filter(Boolean).join(" · ");
  if (place) {
    const placeNode = document.createElement("div");
    placeNode.className = "text-13 text-light-1";
    placeNode.textContent = place;
    body.appendChild(placeNode);
  }

  const title = document.createElement("div");
  title.className = "text-16 fw-500 lh-16 mt-5";
  title.textContent = pin.name;
  body.appendChild(title);

  if (pin.summary) {
    const summary = document.createElement("p");
    summary.className = "text-14 lh-16 mt-5 mb-0";
    summary.textContent = pin.summary;
    body.appendChild(summary);
  }

  const listings = listingBits(pin);
  if (listings.length > 0) {
    const listingNode = document.createElement("div");
    listingNode.className = "text-13 text-light-1 mt-10";
    listingNode.textContent = listings.join(" · ");
    body.appendChild(listingNode);
  }

  if (pin.popular) {
    const popular = document.createElement("div");
    popular.className = "text-13 text-green-2 fw-500 mt-5";
    popular.textContent = "Popular destination";
    body.appendChild(popular);
  }

  const link = document.createElement("a");
  link.href = pin.href;
  link.className = "button -blue-1 bg-blue-1-05 text-blue-1 h-40 px-15 rounded-4 mt-15";
  link.textContent = "View Detail";
  body.appendChild(link);
  root.appendChild(body);
  return root;
}

export default function DestinationMap({
  pins,
  selectedId,
  onSelect,
  apiKey,
}: {
  pins: MapPin[];
  selectedId: string;
  onSelect: (id: string) => void;
  apiKey: string;
}) {
  const node = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const infoRef = useRef<GoogleInfoWindow | null>(null);
  const onSelectRef = useRef(onSelect);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const element = node.current;
    if (!element || !apiKey) return;

    let cancelled = false;
    loadGoogleMaps(apiKey)
      .then(async () => {
        if (cancelled || !element.isConnected || !window.google?.maps) return;
        const maps = window.google.maps;
        const { Map, InfoWindow } = (await maps.importLibrary("maps")) as {
          Map: new (el: HTMLElement, options: object) => GoogleMap;
          InfoWindow: new (options?: object) => GoogleInfoWindow;
        };
        await maps.importLibrary("marker");
        if (cancelled || !element.isConnected) return;

        const first = pins[0] ?? DEFAULT_CENTER;
        const map = new Map(element, {
          center: { lat: first.lat, lng: first.lng },
          zoom: pins.length > 0 ? 5 : 4,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
        mapRef.current = map;
        infoRef.current = new InfoWindow({ maxWidth: 280 });
        window.setTimeout(() => maps.event.trigger(map, "resize"), 200);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setStatus("error");
          setMessage(error instanceof Error ? error.message : "Google Maps failed to load.");
        }
      });

    return () => {
      cancelled = true;
      mapRef.current = null;
      infoRef.current = null;
    };
    // Create the map once per key. Pins are drawn in the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  useEffect(() => {
    const map = mapRef.current;
    const info = infoRef.current;
    const maps = window.google?.maps;
    if (!map || !info || !maps || status !== "ready") return;

    const markers: GoogleMarker[] = [];
    const listeners: Array<{ remove: () => void }> = [];
    const selectedIcon = {
      path: maps.SymbolPath.CIRCLE,
      scale: 11,
      fillColor: "#3554d1",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 3,
    };

    let selectedMarker: GoogleMarker | null = null;
    for (const pin of pins) {
      const selected = pin.id === selectedId;
      const marker = new maps.Marker({
        map,
        position: { lat: pin.lat, lng: pin.lng },
        title: pin.name,
        zIndex: selected ? 500 : 1,
        icon: selected ? selectedIcon : undefined,
      });
      listeners.push(marker.addListener("click", () => onSelectRef.current(pin.id)));
      markers.push(marker);
      if (selected) selectedMarker = marker;
    }

    const selected = pins.find((pin) => pin.id === selectedId) ?? null;
    if (selected && selectedMarker) {
      info.setContent(pinCard(selected));
      info.open({ map, anchor: selectedMarker });
      map.setZoom(10);
      map.panTo({ lat: selected.lat, lng: selected.lng });
    } else {
      info.close();
      if (pins.length === 1) {
        map.setCenter({ lat: pins[0].lat, lng: pins[0].lng });
        map.setZoom(8);
      } else if (pins.length > 1) {
        const bounds = new maps.LatLngBounds();
        for (const pin of pins) bounds.extend({ lat: pin.lat, lng: pin.lng });
        map.fitBounds(bounds, 48);
      }
    }

    return () => {
      for (const listener of listeners) listener.remove();
      for (const marker of markers) marker.setMap(null);
    };
  }, [pins, selectedId, status]);

  if (!apiKey) {
    return (
      <div className="d-flex items-center justify-center h-full text-15 text-light-1">
        Map is unavailable.
      </div>
    );
  }

  return (
    <div className="destination-google-map-wrap">
      <div ref={node} className="destination-google-map" />
      {status === "loading" ? (
        <div className="destination-google-map__status text-15 text-light-1">Loading map...</div>
      ) : null}
      {message ? <div className="destination-google-map__status text-15 text-red-1">{message}</div> : null}
    </div>
  );
}
