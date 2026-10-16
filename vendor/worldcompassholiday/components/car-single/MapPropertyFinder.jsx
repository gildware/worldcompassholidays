"use client";

import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("../common/ReactLeafletMap"), {
  ssr: false,
  loading: () => <div className="d-flex items-center justify-center h-full">Loading Map...</div>,
});

export default function MapPropertyFinder() {
  const defaultProps = {
    center: {
      lat: 10.99835602,
      lng: 77.01502627,
    },
    zoom: 11,
  };

  return (
    <div style={{ height: "100%", width: "100%", minHeight: "350px", position: "relative", zIndex: 0 }}>
      <MapComponent center={defaultProps.center} zoom={defaultProps.zoom} />
    </div>
  );
}
