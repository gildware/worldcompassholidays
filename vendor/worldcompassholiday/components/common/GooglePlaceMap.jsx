"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/google-maps";

export default function GooglePlaceMap({ apiKey = "", lat, lng, zoom, minHeight = 350 }) {
  const node = useRef(null);
  const [message, setMessage] = useState(null);
  const key = apiKey || process.env.NEXT_PUBLIC_MAP_API_KEY || "";

  useEffect(() => {
    const element = node.current;
    if (!element || !key) return;

    let cancelled = false;
    loadGoogleMaps(key)
      .then(async () => {
        if (cancelled || !element.isConnected || !window.google?.maps) return;
        const maps = window.google.maps;
        const { Map } = await maps.importLibrary("maps");
        await maps.importLibrary("marker");
        if (cancelled || !element.isConnected) return;
        element.replaceChildren();
        const map = new Map(element, {
          center: { lat, lng },
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
        });
        new maps.Marker({ map, position: { lat, lng } });
      })
      .catch((error) => {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Google Maps failed to load.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [key, lat, lng, zoom]);

  if (!key) {
    return (
      <div className="d-flex items-center justify-center h-full text-15 text-light-1" style={{ minHeight }}>
        Map is unavailable.
      </div>
    );
  }

  return (
    <>
      <div ref={node} style={{ height: "100%", width: "100%", minHeight }} />
      {message ? <p className="text-14 text-red-1 px-15 py-10">{message}</p> : null}
    </>
  );
}
