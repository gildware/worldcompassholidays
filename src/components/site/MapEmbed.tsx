import { googleMapsEmbedUrl, parseMapPoint } from "@/lib/maps";

export function MapEmbed({
  apiKey,
  lat,
  lng,
  zoom = 8,
  title,
  className,
}: {
  apiKey: string;
  lat: string;
  lng: string;
  zoom?: number;
  title: string;
  className?: string;
}) {
  const point = parseMapPoint(lat, lng, zoom);
  if (!point || !apiKey) return null;

  return (
    <iframe
      title={title}
      src={googleMapsEmbedUrl(point, apiKey)}
      className={className ?? "h-64 w-full rounded-xl border border-line"}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
}
