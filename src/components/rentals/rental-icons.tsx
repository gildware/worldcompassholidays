export type RentalIconName =
  | "vehicle"
  | "specs"
  | "pricing"
  | "handover"
  | "images"
  | "pin"
  | "fuel"
  | "gear"
  | "seat"
  | "calendar"
  | "road"
  | "tag"
  | "key"
  | "home"
  | "clock"
  | "check"
  | "minus"
  | "brand"
  | "ride"
  | "ac"
  | "bluetooth"
  | "gps"
  | "usb"
  | "camera"
  | "sensors"
  | "sunroof"
  | "android"
  | "carplay"
  | "helmet"
  | "scooter"
  | "motorcycle"
  | "cruiser"
  | "adventure"
  | "sports"
  | "touring"
  | "commuter"
  | "moped"
  | "cafe"
  | "offroad"
  | "electric"
  | "diesel"
  | "cng"
  | "automatic"
  | "car";

export function iconForConfig(kind: string, name: string): RentalIconName {
  const value = name.trim().toLowerCase();
  if (kind === "excluded") return iconForFeature(name, "minus");
  if (kind === "included" || kind === "feature") return iconForFeature(name, kind === "included" ? "check" : "specs");
  if (kind === "fuel") {
    if (/electric/.test(value)) return "electric";
    if (/diesel/.test(value)) return "diesel";
    if (/cng/.test(value)) return "cng";
    return "fuel";
  }
  if (kind === "transmission") return /auto/.test(value) ? "automatic" : "gear";
  if (kind === "vehicle_type") {
    if (/moped/.test(value)) return "moped";
    if (/scooter/.test(value)) return "scooter";
    if (/cruiser/.test(value)) return "cruiser";
    if (/adventure|off-?road|dirt/.test(value)) return "offroad";
    if (/sport/.test(value)) return "sports";
    if (/tour/.test(value)) return "touring";
    if (/cafe/.test(value)) return "cafe";
    if (/commut/.test(value)) return "commuter";
    if (/electric/.test(value)) return "electric";
    if (/suv|muv|sedan|hatch|luxury|ev\b/.test(value)) return "car";
    if (/motor|bike|naked/.test(value)) return "motorcycle";
    return kind === "vehicle_type" ? "vehicle" : "specs";
  }
  if (kind === "addon") return "tag";
  if (kind === "vehicle_document" || kind === "customer_document") return "specs";
  return "specs";
}

export function iconForFeature(name: string, fallback: RentalIconName = "check"): RentalIconName {
  const value = name.trim().toLowerCase();
  if (/helmet/.test(value)) return "helmet";
  if (/\bac\b|a\/c|air[\s-]?condition/.test(value)) return "ac";
  if (/bluetooth/.test(value)) return "bluetooth";
  if (/\bgps\b|navigation/.test(value)) return "gps";
  if (/\busb\b/.test(value)) return "usb";
  if (/camera/.test(value)) return "camera";
  if (/sensor|parking/.test(value)) return "sensors";
  if (/sunroof|moonroof/.test(value)) return "sunroof";
  if (/android/.test(value)) return "android";
  if (/carplay|apple/.test(value)) return "carplay";
  return fallback;
}

export function RentalIcon({ name }: { name: RentalIconName }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="rental-ico">
      {paths(name)}
    </svg>
  );
}

function paths(name: RentalIconName) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "vehicle":
      return (
        <>
          <circle {...common} cx="6.5" cy="16.5" r="2.2" />
          <circle {...common} cx="17.5" cy="16.5" r="2.2" />
          <path {...common} d="M8.2 16.5h7.6M9 16.5 7.2 9.2h6.2L16.8 14" />
        </>
      );
    case "specs":
      return <path {...common} d="M8 7h8M8 12h8M8 17h5M5 7h.01M5 12h.01M5 17h.01" />;
    case "pricing":
      return (
        <>
          <rect {...common} x="3.5" y="6" width="17" height="12" rx="2" />
          <path {...common} d="M3.5 10h17M8 14h3" />
        </>
      );
    case "handover":
      return <path {...common} d="M7 11V7.5A2.5 2.5 0 0 1 9.5 5h0A2.5 2.5 0 0 1 12 7.5V11m0 0V7.5A2.5 2.5 0 0 1 14.5 5h0A2.5 2.5 0 0 1 17 7.5V13c0 3.5-2.2 6-5 6s-5-2.2-5-5.5V11h5Z" />;
    case "images":
      return (
        <>
          <rect {...common} x="3.5" y="5" width="17" height="14" rx="2" />
          <circle {...common} cx="9" cy="10" r="1.4" />
          <path {...common} d="m4 16 4.2-3.4 2.6 2.1L14 11l6 5" />
        </>
      );
    case "pin":
      return (
        <>
          <path {...common} d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
          <circle {...common} cx="12" cy="11" r="1.8" />
        </>
      );
    case "fuel":
      return <path {...common} d="M12 3.5s5 4.6 5 8.2a5 5 0 0 1-10 0c0-3.6 5-8.2 5-8.2Z" />;
    case "gear":
      return (
        <>
          <circle {...common} cx="12" cy="12" r="3" />
          <path {...common} d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6.1 6.1l1.6 1.6M16.3 16.3l1.6 1.6M17.9 6.1l-1.6 1.6M7.7 16.3l-1.6 1.6" />
        </>
      );
    case "seat":
      return <path {...common} d="M8 20v-5.5a4 4 0 0 1 8 0V20M7 20h10M12 8.5a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" />;
    case "calendar":
      return (
        <>
          <rect {...common} x="4" y="5.5" width="16" height="14" rx="2" />
          <path {...common} d="M8 3.8v3.2M16 3.8v3.2M4 10h16" />
        </>
      );
    case "road":
      return <path {...common} d="M7 3.5 4.5 20.5M17 3.5l2.5 17M12 6v2.2M12 11.5v2.2M12 17v2" />;
    case "tag":
      return (
        <>
          <path {...common} d="M4 12.5 12.2 4.3h6.5v6.5L10.5 19a1.8 1.8 0 0 1-2.5 0L4 15a1.8 1.8 0 0 1 0-2.5Z" />
          <circle {...common} cx="15.2" cy="8.2" r="1" />
        </>
      );
    case "key":
      return <path {...common} d="M14.5 8.5a3.5 3.5 0 1 0-3.2 4.8L8.5 16H6.2v2.2H4v2.3h3.2l4.2-4.2a3.5 3.5 0 0 0 3.1-7.8Z" />;
    case "home":
      return <path {...common} d="M4 11.5 12 4.5l8 7V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5Z" />;
    case "clock":
      return (
        <>
          <circle {...common} cx="12" cy="12" r="8" />
          <path {...common} d="M12 8v4.5l3 2" />
        </>
      );
    case "check":
      return <path {...common} d="m5 12.5 4.2 4.2L19 7.5" />;
    case "minus":
      return <path {...common} d="M6 12h12" />;
    case "brand":
      return (
        <>
          <circle {...common} cx="12" cy="12" r="8" />
          <path {...common} d="M12 8v8M9.5 10.2h5M9.5 13.8h5" />
        </>
      );
    case "ride":
      return (
        <>
          <circle {...common} cx="12" cy="12" r="8" />
          <circle {...common} cx="12" cy="12" r="2" />
          <path {...common} d="M12 10V4.2M10.1 13.2 5.6 15.8M13.9 13.2l4.5 2.6" />
        </>
      );
    case "ac":
      return <path {...common} d="M12 2.8v18.4M4.6 7.2l14.8 9.6M19.4 7.2 4.6 16.8" />;
    case "bluetooth":
      return <path {...common} d="m7 7 10 10-5 4V3l5 4L7 17" />;
    case "gps":
      return (
        <>
          <circle {...common} cx="12" cy="12" r="8" />
          <path {...common} d="m14.6 9.2-1.4 4.2-4.2 1.4 1.4-4.2 4.2-1.4Z" />
        </>
      );
    case "usb":
      return (
        <>
          <path {...common} d="M10.2 3.2V2M13.8 3.2V2" />
          <rect {...common} x="8" y="3.2" width="8" height="5" rx="1" />
          <path {...common} d="M12 8.2v4" />
          <path {...common} d="M9 12.2h6v7.2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-7.2Z" />
        </>
      );
    case "camera":
      return (
        <>
          <path {...common} d="M3.5 8.2h2.4l1.3-2h6.2l1.3 2H20.5v9.6h-17V8.2Z" />
          <circle {...common} cx="12" cy="12.6" r="2.5" />
        </>
      );
    case "sensors":
      return (
        <>
          <path {...common} d="M4 17.2h16" />
          <path {...common} d="M6.4 17.2v-2.6a1.8 1.8 0 0 1 1.8-1.8h7.6a1.8 1.8 0 0 1 1.8 1.8v2.6" />
          <path {...common} d="M8.2 10.6A5.4 5.4 0 0 1 12 9.2a5.4 5.4 0 0 1 3.8 1.4" />
          <path {...common} d="M6.4 8.2A7.6 7.6 0 0 1 12 6.2a7.6 7.6 0 0 1 5.6 2" />
        </>
      );
    case "sunroof":
      return (
        <>
          <path {...common} d="M4 16.2h16M6.5 16.2v3.4h11v-3.4" />
          <path {...common} d="M8 16.2v-1.8A4 4 0 0 1 16 14.4v1.8" />
          <circle {...common} cx="12" cy="7.2" r="1.5" />
          <path {...common} d="M12 3.8v1.1M9.4 5.2l.7.7M14.6 5.2l-.7.7M7.6 7.2H8.8M15.2 7.2h1.2" />
        </>
      );
    case "android":
      return (
        <>
          <path {...common} d="M8.3 8.2 6.7 5.6M15.7 8.2l1.6-2.6" />
          <rect {...common} x="6.2" y="8" width="11.6" height="8.2" rx="4" />
          <path {...common} d="M8.2 16.2V18.4M15.8 16.2V18.4" />
          <circle cx="9.6" cy="11.5" r="0.8" fill="currentColor" />
          <circle cx="14.4" cy="11.5" r="0.8" fill="currentColor" />
        </>
      );
    case "carplay":
      return (
        <>
          <rect {...common} x="6" y="3" width="12" height="18" rx="2.4" />
          <path {...common} d="M8.6 9.2h6.8L16.6 12H7.4l1.2-2.8Z" />
          <circle cx="9.7" cy="13.4" r="0.85" fill="currentColor" />
          <circle cx="14.3" cy="13.4" r="0.85" fill="currentColor" />
          <path {...common} d="M9.2 17.6h5.6" />
        </>
      );
    case "helmet":
      return (
        <>
          <path {...common} d="M4.2 13.2a7.8 7.8 0 0 1 15.6 0v2.4H4.2v-2.4Z" />
          <path {...common} d="M4.2 14.4h8.3v3a2 2 0 0 1-2 2H6.5" />
        </>
      );
    case "scooter":
      return (
        <>
          <circle {...common} cx="6.2" cy="16.6" r="2.1" />
          <circle {...common} cx="17.4" cy="16.6" r="2.1" />
          <path {...common} d="M8.2 16.6h6.8M8 16.4 9.4 12.2h5.4l1.8 4.2M9.4 12.2h2M14.8 12.2V8.2" />
        </>
      );
    case "motorcycle":
      return (
        <>
          <circle {...common} cx="6.2" cy="16.8" r="2.2" />
          <circle {...common} cx="17.6" cy="16.8" r="2.2" />
          <path {...common} d="M8.2 16.6h6.6M7.6 16.4 6.4 10.2h5.8l2.6 4.2M12.2 10.2 14.4 7" />
        </>
      );
    case "cruiser":
      return (
        <>
          <circle {...common} cx="5.6" cy="17" r="2.2" />
          <circle {...common} cx="18.2" cy="17" r="2.2" />
          <path {...common} d="M7.6 17h8.2M8 16.8c1.2-3.6 3.2-5 6.2-5H17M14.2 11.8 16.4 8.2" />
        </>
      );
    case "adventure":
    case "offroad":
      return (
        <>
          <circle {...common} cx="6.2" cy="17" r="2.3" />
          <circle {...common} cx="17.4" cy="17" r="2.3" />
          <path {...common} d="M8.4 16.8h6.4M8 16.6 6.8 11h3.4L13 14.4h2.8L17 16.8" />
          <path {...common} d="M13.2 8.2h3.2v2.8h-3.2z" />
        </>
      );
    case "sports":
      return (
        <>
          <circle {...common} cx="6" cy="17" r="2" />
          <circle {...common} cx="17.6" cy="15.2" r="2" />
          <path {...common} d="M7.8 16.4 11 10.2h5.2L17.2 14.4M11 10.2 13.4 6.8h3.2" />
        </>
      );
    case "touring":
      return (
        <>
          <circle {...common} cx="6.2" cy="17" r="2.1" />
          <circle {...common} cx="17.6" cy="17" r="2.1" />
          <path {...common} d="M8.2 16.8h6.8M8 16.6 9.2 12h5.2l1.6 4.6" />
          <path {...common} d="M8.6 10.2h2.4v2.4H8.6zM13.2 10.2h2.4v2.4h-2.4z" />
        </>
      );
    case "commuter":
      return (
        <>
          <circle {...common} cx="6.4" cy="16.8" r="2.1" />
          <circle {...common} cx="17.2" cy="16.8" r="2.1" />
          <path {...common} d="M8.4 16.6h6.4M8 16.4 9.2 11h4.2L16.8 16.4M11.2 11V7.6" />
        </>
      );
    case "moped":
      return (
        <>
          <circle {...common} cx="6.8" cy="16.4" r="1.8" />
          <circle {...common} cx="16.8" cy="16.4" r="1.8" />
          <path {...common} d="M8.4 16.4h6.2M8.6 16.2 9.6 12.6h4.6l1.4 3.6M9.6 12.6h1.6M14.2 12.6V9.4" />
        </>
      );
    case "cafe":
      return (
        <>
          <circle {...common} cx="6" cy="16.8" r="2.1" />
          <circle {...common} cx="17.8" cy="16.8" r="2.1" />
          <path {...common} d="M8 16.6h7.4M8.2 16.4 10.2 12h5.6l1.4 4.4M10.2 12 12.6 8.2" />
        </>
      );
    case "electric":
      return <path {...common} d="M13 3.2 6.8 13h4L10 20.8l7.2-10.6h-4.2L13 3.2Z" />;
    case "diesel":
      return (
        <>
          <rect {...common} x="4.5" y="3.5" width="9" height="16" rx="1.4" />
          <path {...common} d="M13.5 8H16a2 2 0 0 1 2 2v4.2M7.2 8h3.2" />
        </>
      );
    case "cng":
      return (
        <>
          <rect {...common} x="8" y="3.2" width="8" height="17.6" rx="4" />
          <path {...common} d="M8 8h8M8 16h8" />
        </>
      );
    case "automatic":
      return (
        <>
          <circle {...common} cx="12" cy="12" r="8" />
          <path {...common} d="M9.2 16 12 8l2.8 8M10.3 13.2h3.4" />
        </>
      );
    case "car":
      return (
        <>
          <path {...common} d="M4 15.2h16M6.2 15.2 7.6 10h8.8l1.4 5.2" />
          <circle {...common} cx="8" cy="17.2" r="1.6" />
          <circle {...common} cx="16" cy="17.2" r="1.6" />
        </>
      );
  }
}
