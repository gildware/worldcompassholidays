import type { CSSProperties } from "react";
import { googleMapsEmbedUrl, parseMapPoint } from "@/lib/maps";

export function MapEmbed({
  apiKey,
  lat,
  lng,
  zoom = 8,
  title,
  className,
  style,
}: {
  apiKey: string;
  lat: string;
  lng: string;
  zoom?: number;
  title: string;
  className?: string;
  style?: CSSProperties;
}) {
  const point = parseMapPoint(lat, lng, zoom);
  if (!point || !apiKey) return null;

  return (
    <iframe
      title={title}
      src={googleMapsEmbedUrl(point, apiKey)}
      className={className ?? "h-64 w-full rounded-xl border border-line"}
      style={style}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
}
