"use client";

import GooglePlaceMap from "./GooglePlaceMap";

export default function MapFinder({ apiKey = "" }) {
  return (
    <div style={{ height: "100%", width: "100%", minHeight: "350px", position: "relative", zIndex: 0 }}>
      <GooglePlaceMap apiKey={apiKey} lat={10.99835602} lng={77.01502627} zoom={11} />
    </div>
  );
}
