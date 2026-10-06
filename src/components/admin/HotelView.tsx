import Link from "next/link";
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

function ChipList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-sm text-muted">None selected.</p>;
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs">
          {item}
        </li>
      ))}
    </ul>
  );
}

export function HotelView({
  hotel,
  canManage,
}: {
  hotel: HotelViewData;
  canManage: boolean;
}) {
  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/admin/hotels" className="text-xs font-medium text-brand hover:underline">
            ← All hotels
          </Link>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-navy">{hotel.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {propertyTypeLabel(hotel.propertyType)}
            {hotel.starRating > 0 ? ` · ${hotel.starRating}-star` : ""}
            {hotel.destinationName ? ` · ${hotel.destinationName}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={hotel.published ? "success" : "warning"}>
            {hotel.published ? "Published" : "Draft"}
          </Badge>
          {hotel.isFeatured ? <Badge tone="brand">Featured</Badge> : null}
          {canManage ? (
            <ButtonLink href={`/admin/hotels/${hotel.id}`} size="sm">
              Edit
            </ButtonLink>
          ) : null}
        </div>
      </div>

      {hotel.bannerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={hotel.bannerUrl} alt="" className="max-h-72 w-full rounded-lg object-cover" />
      ) : null}

      <section className="grid gap-3 rounded-lg border border-line bg-white p-4 sm:grid-cols-4">
        <p className="text-sm">
          <span className="block text-xs text-muted">From</span>
          {formatMoney(hotel.priceFrom, hotel.currency)} / night
        </p>
        <p className="text-sm">
          <span className="block text-xs text-muted">Check-in</span>
          {hotel.checkIn || "—"}
        </p>
        <p className="text-sm">
          <span className="block text-xs text-muted">Check-out</span>
          {hotel.checkOut || "—"}
        </p>
        <p className="text-sm">
          <span className="block text-xs text-muted">Rooms</span>
          {hotel.rooms.length}
        </p>
      </section>

      {hotel.summary ? <p className="text-sm leading-6 text-navy">{hotel.summary}</p> : null}
      {hotel.address ? <p className="text-sm text-muted">{hotel.address}</p> : null}

      {hotel.descriptionHtml ? (
        <section
          className="prose prose-sm max-w-none text-sm"
          dangerouslySetInnerHTML={{ __html: hotel.descriptionHtml }}
        />
      ) : null}

      <section className="grid gap-2">
        <h2 className="text-sm font-semibold text-navy">Property amenities</h2>
        <ChipList items={hotel.amenities} />
      </section>

      <section className="grid gap-3">
        <h2 className="text-sm font-semibold text-navy">Rooms</h2>
        {hotel.rooms.length === 0 ? (
          <p className="text-sm text-muted">No rooms yet.</p>
        ) : (
          <ul className="grid gap-3">
            {hotel.rooms.map((room) => (
              <li key={room.id} className="grid gap-3 rounded-lg border border-line bg-white p-4 md:grid-cols-[10rem_1fr]">
                <div className="overflow-hidden rounded-lg bg-surface">
                  {room.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={room.imageUrl} alt="" className="aspect-[16/10] w-full object-cover" />
                  ) : (
                    <div className="aspect-[16/10]" />
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold text-navy">{room.name}</h3>
                    <p className="text-sm">
                      {formatMoney(room.pricePerNight, hotel.currency)} / night
                    </p>
                  </div>
                  <p className="text-xs text-muted">
                    Sleeps {room.occupancy}
                    {room.bedType ? ` · ${room.bedType}` : ""}
                    {room.sizeSqm ? ` · ${room.sizeSqm} m²` : ""}
                    {` · ${room.quantity} available`}
                    {` · ${mealPlanLabel(room.mealPlan)}`}
                    {room.extraGuestPrice > 0
                      ? ` · extra guest ${formatMoney(room.extraGuestPrice, hotel.currency)}`
                      : ""}
                    {room.active ? "" : " · hidden"}
                  </p>
                  {room.summary ? <p className="text-sm text-muted">{room.summary}</p> : null}
                  <div>
                    <p className="mb-1 text-xs font-medium text-navy">Features</p>
                    <ChipList items={room.features} />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium text-navy">Amenities</p>
                    <ChipList items={room.amenities} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {hotel.cancellationPolicy ? (
        <section className="grid gap-1">
          <h2 className="text-sm font-semibold text-navy">Cancellation</h2>
          <p className="whitespace-pre-wrap text-sm text-muted">{hotel.cancellationPolicy}</p>
        </section>
      ) : null}
      {hotel.houseRules ? (
        <section className="grid gap-1">
          <h2 className="text-sm font-semibold text-navy">House rules</h2>
          <p className="whitespace-pre-wrap text-sm text-muted">{hotel.houseRules}</p>
        </section>
      ) : null}
      {hotel.faqs.length > 0 ? (
        <section className="grid gap-2">
          <h2 className="text-sm font-semibold text-navy">Questions</h2>
          {hotel.faqs.map((item) => (
            <div key={item.title}>
              <p className="text-sm font-medium">{item.title}</p>
              {item.content ? <p className="text-sm text-muted">{item.content}</p> : null}
            </div>
          ))}
        </section>
      ) : null}
      {hotel.gallery.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {hotel.gallery.map((url) => (
            <li key={url} className="overflow-hidden rounded-lg border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="aspect-[4/3] w-full object-cover" />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
