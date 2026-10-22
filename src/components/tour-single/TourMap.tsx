"use client";

import GooglePlaceMap from "@/components/common/GooglePlaceMap";

export default function TourMap({
  apiKey,
  lat,
  lng,
  zoom,
  minHeight = 220,
}: {
  apiKey: string;
  lat: number;
  lng: number;
  zoom: number;
  minHeight?: number;
}) {
  return (
    <div style={{ height: "100%", width: "100%", minHeight, position: "relative", zIndex: 0 }}>
      <GooglePlaceMap apiKey={apiKey} lat={lat} lng={lng} zoom={zoom} minHeight={minHeight} />
    </div>
  );
}
