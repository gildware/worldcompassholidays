import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { formatMoney } from "@/lib/format";
import { mealPlanLabel, propertyTypeLabel } from "@/lib/hotels/options";

export type HotelRoomView = {
  id: string;
  name: string;
  summary: string;
  occupancy: number;
  bedType: string;
  sizeSqm: number | null;
  quantity: number;
  pricePerNight: number;
  extraGuestPrice: number;
  mealPlan: string;
  features: string[];
  amenities: string[];
  imageUrl: string;
  active: boolean;
};

export type HotelViewData = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  descriptionHtml: string;
  propertyType: string;
  starRating: number;
  checkIn: string;
  checkOut: string;
  currency: string;
  address: string;
  destinationName: string;
  amenities: string[];
  faqs: { title: string; content: string }[];
  cancellationPolicy: string;
  houseRules: string;
  published: boolean;
  isFeatured: boolean;
  imageUrl: string;
  bannerUrl: string;
  gallery: string[];
  priceFrom: number;
  rooms: HotelRoomView[];
};

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-semibold text-navy">{value || "—"}</dd>
    </div>
  );
}

function ChipList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item} className="rounded-md border border-line bg-surface px-2 py-0.5 text-xs text-navy">
          {item}
        </li>
      ))}
    </ul>
  );
}

function Section({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-line bg-white p-3 sm:p-4 ${className}`}>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export function HotelView({
  hotel,
  canManage,
}: {
  hotel: HotelViewData;
  canManage: boolean;
}) {
  const cover = hotel.bannerUrl || hotel.imageUrl || "";
  const photos = [...new Set([hotel.imageUrl, hotel.bannerUrl, ...hotel.gallery].filter(Boolean))];
  const description = hotel.descriptionHtml.trim();
  const descriptionIsHtml = looksLikeHtml(description);
  const typeLabel = propertyTypeLabel(hotel.propertyType);
  const starLabel = hotel.starRating > 0 ? `${hotel.starRating}-star` : "";
  const activeRooms = hotel.rooms.filter((room) => room.active).length;

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/admin/hotels" className="text-xs font-medium text-brand hover:underline">
          ← All hotels
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={hotel.published ? "success" : "warning"}>
            {hotel.published ? "Published" : "Draft"}
          </Badge>
          {hotel.isFeatured ? <Badge tone="brand">Featured</Badge> : null}
          {hotel.published && hotel.slug ? (
            <ButtonLink
              href={`/hotels/${hotel.slug}`}
              variant="secondary"
              size="sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on website
            </ButtonLink>
          ) : null}
          {canManage ? (
            <ButtonLink href={`/admin/hotels/${hotel.id}`} size="sm">
              Edit
            </ButtonLink>
          ) : null}
        </div>
      </div>

      <section className="rounded-xl border border-line bg-white p-3 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-[10rem_minmax(0,1fr)] lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start">
          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" className="aspect-[4/3] max-h-40 w-full object-cover sm:max-h-none" />
            ) : (
              <div className="flex aspect-[4/3] max-h-40 items-center justify-center text-sm text-muted sm:max-h-none">
                No photo
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium tracking-wide text-brand uppercase">
                  {[typeLabel, starLabel].filter(Boolean).join(" · ")}
                </p>
                <h1 className="mt-1 text-xl font-semibold tracking-tight text-navy sm:text-2xl">
                  {hotel.name}
                </h1>
                <p className="mt-1 text-sm text-muted">
                  {[hotel.destinationName, hotel.address].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-navy">
                  {hotel.priceFrom > 0 ? formatMoney(hotel.priceFrom, hotel.currency) : "—"}
                </p>
                <p className="text-xs text-muted">from / night</p>
              </div>
            </div>

            {hotel.summary ? (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-navy">{hotel.summary}</p>
            ) : null}

            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-line pt-3 sm:grid-cols-3 lg:grid-cols-6">
              <Fact label="Check-in" value={hotel.checkIn || "—"} />
              <Fact label="Check-out" value={hotel.checkOut || "—"} />
              <Fact label="Rooms" value={String(hotel.rooms.length)} />
              <Fact label="Active" value={String(activeRooms)} />
              <Fact label="Currency" value={hotel.currency || "—"} />
              <Fact label="Slug" value={hotel.slug || "—"} />
            </dl>

            {hotel.amenities.length > 0 ? (
              <div className="mt-3 border-t border-line pt-3">
                <h2 className="text-[11px] font-medium uppercase tracking-wide text-muted">
                  Amenities
                </h2>
                <div className="mt-1.5">
                  <ChipList items={hotel.amenities} />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="grid gap-3">
        {description ? (
          <Section title="Description">
            {descriptionIsHtml ? (
              <div
                className="prose prose-sm max-w-none text-sm text-navy [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <p className="whitespace-pre-wrap text-sm leading-6 text-navy">{description}</p>
            )}
          </Section>
        ) : null}

        <Section title={`Rooms · ${hotel.rooms.length}`}>
          {hotel.rooms.length === 0 ? (
            <p className="text-sm text-muted">No rooms yet.</p>
          ) : (
            <ul className="grid gap-2 lg:grid-cols-2">
              {hotel.rooms.map((room) => {
                const meta = [
                  `Sleeps ${room.occupancy}`,
                  room.bedType || null,
                  room.sizeSqm ? `${room.sizeSqm} m²` : null,
                  `${room.quantity} available`,
                  mealPlanLabel(room.mealPlan),
                  room.extraGuestPrice > 0
                    ? `extra ${formatMoney(room.extraGuestPrice, hotel.currency)}`
                    : null,
                  room.active ? null : "Hidden",
                ].filter(Boolean);

                return (
                  <li
                    key={room.id}
                    className="grid gap-3 rounded-lg border border-line bg-surface/40 p-2.5 sm:grid-cols-[7.5rem_minmax(0,1fr)]"
                  >
                    <div className="overflow-hidden rounded-md border border-line bg-white">
                      {room.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={room.imageUrl} alt="" className="aspect-[4/3] w-full object-cover" />
                      ) : (
                        <div className="flex aspect-[4/3] items-center justify-center text-xs text-muted">
                          No photo
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-navy">{room.name}</h3>
                          <p className="mt-0.5 text-xs text-muted">{meta.join(" · ")}</p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold tabular-nums text-navy">
                          {formatMoney(room.pricePerNight, hotel.currency)}
                          <span className="ml-1 text-xs font-normal text-muted">/ night</span>
                        </p>
                      </div>
                      {room.summary ? (
                        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted">{room.summary}</p>
                      ) : null}
                      {room.features.length > 0 || room.amenities.length > 0 ? (
                        <div className="mt-2 grid gap-2">
                          {room.features.length > 0 ? (
                            <div>
                              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted">
                                Features
                              </p>
                              <ChipList items={room.features} />
                            </div>
                          ) : null}
                          {room.amenities.length > 0 ? (
                            <div>
                              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted">
                                Amenities
                              </p>
                              <ChipList items={room.amenities} />
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        {photos.length > 0 ? (
          <Section title={`Photos · ${photos.length}`}>
            <ul className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6">
              {photos.map((url) => (
                <li key={url} className="overflow-hidden rounded-md border border-line bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="aspect-[4/3] w-full object-cover" />
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {hotel.cancellationPolicy || hotel.houseRules || hotel.faqs.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {hotel.cancellationPolicy ? (
              <Section title="Cancellation">
                <p className="whitespace-pre-wrap text-sm leading-6 text-navy">
                  {hotel.cancellationPolicy}
                </p>
              </Section>
            ) : null}
            {hotel.houseRules ? (
              <Section title="House rules">
                <p className="whitespace-pre-wrap text-sm leading-6 text-navy">{hotel.houseRules}</p>
              </Section>
            ) : null}
            {hotel.faqs.length > 0 ? (
              <Section title={`Questions · ${hotel.faqs.length}`} className="lg:col-span-2">
                <ul className="grid gap-2 sm:grid-cols-2">
                  {hotel.faqs.map((item) => (
                    <li key={item.title} className="rounded-lg border border-line bg-surface/40 p-2.5">
                      <p className="text-sm font-medium text-navy">{item.title}</p>
                      {item.content ? (
                        <p className="mt-1 text-xs leading-5 text-muted">{item.content}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </Section>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
