import Image from "next/image";
import Link from "next/link";

type DestinationCard = {
  slug: string;
  name: string;
  region: string;
  country: string;
  summary: string;
  imageUrl: string;
  parent?: { name: string } | null;
  children?: { name: string }[];
};

export function DestinationGrid({
  destinations,
}: {
  destinations: DestinationCard[];
}) {
  if (destinations.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line bg-white px-5 py-8 text-sm text-muted">
        No destinations yet. Add them from the admin.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {destinations.map((destination) => (
        <li key={destination.slug}>
          <Link
            href={`/destinations/${destination.slug}`}
            className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white"
          >
            <div className="relative aspect-[4/3] bg-surface">
              <Image
                src={destination.imageUrl}
                alt={destination.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>
            <div className="flex flex-1 flex-col p-4">
              <span className="text-xs font-medium tracking-wide text-brand uppercase">
                {destination.country}
              </span>
              <span className="mt-1 text-lg font-semibold text-navy">
                {destination.name}
              </span>
              <span className="mt-0.5 text-sm text-muted">
                {destination.parent
                  ? `In ${destination.parent.name}`
                  : destination.region}
              </span>
              <span className="mt-2 text-sm leading-6 text-navy/80">
                {destination.summary}
              </span>
              {destination.children && destination.children.length > 0 ? (
                <span className="mt-2 text-sm text-muted">
                  Places:{" "}
                  {destination.children.map((place) => place.name).join(", ")}
                </span>
              ) : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
