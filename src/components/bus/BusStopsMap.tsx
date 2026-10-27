import { MapEmbed } from "@/components/site/MapEmbed";

type Stop = {
  title: string;
  label: string;
  lat: string;
  lng: string;
  zoom: number;
};

export function BusStopsMap({
  apiKey,
  from,
  to,
}: {
  apiKey: string;
  from: Stop | null;
  to: Stop | null;
}) {
  const stops = [from, to].filter((stop): stop is Stop => Boolean(stop?.lat && stop?.lng));
  if (!apiKey || stops.length === 0) return null;

  const directions =
    from?.lat && from.lng && to?.lat && to.lng
      ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(`${from.lat},${from.lng}`)}&destination=${encodeURIComponent(`${to.lat},${to.lng}`)}`
      : "";

  return (
    <section className="bus-run__block">
      <h2>Map</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {stops.map((stop) => (
          <div key={stop.label}>
            <p className="mb-1 text-xs font-medium text-navy">
              {stop.label} · {stop.title}
            </p>
            <MapEmbed
              apiKey={apiKey}
              lat={stop.lat}
              lng={stop.lng}
              zoom={stop.zoom || 13}
              title={`${stop.label} at ${stop.title}`}
            />
          </div>
        ))}
      </div>
      {directions ? (
        <p className="mt-2 text-sm">
          <a href={directions} target="_blank" rel="noreferrer">
            Open this route in Google Maps
          </a>
        </p>
      ) : null}
    </section>
  );
}
