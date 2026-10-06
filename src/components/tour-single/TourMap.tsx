"use client";

import GooglePlaceMap from "@/components/common/GooglePlaceMap";

export default function TourMap({
  apiKey,
  lat,
  lng,
  zoom,
}: {
  apiKey: string;
  lat: number;
  lng: number;
  zoom: number;
}) {
  return (
    <div style={{ height: "100%", width: "100%", minHeight: 450, position: "relative", zIndex: 0 }}>
      <GooglePlaceMap apiKey={apiKey} lat={lat} lng={lng} zoom={zoom} minHeight={450} />
    </div>
  );
}
