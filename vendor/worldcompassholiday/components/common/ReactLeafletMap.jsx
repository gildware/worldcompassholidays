"use client";

import GooglePlaceMap from "./GooglePlaceMap";

export default function ReactLeafletMap({ center, zoom, apiKey = "" }) {
  return (
    <GooglePlaceMap
      apiKey={apiKey}
      lat={center.lat}
      lng={center.lng}
      zoom={zoom}
      minHeight={350}
    />
  );
}
