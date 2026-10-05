"use client";

import Link from "next/link";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { setTourFeatured } from "@/actions/tours";
import { Badge } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { formatMoney } from "@/lib/format";
import type { DurationUnit, PriceDiscount } from "@/lib/tours/json";

type DayItem = {
  dayNumber: number;
  title: string;
  description: string;
  imageUrl: string;
};

type FaqItem = {
  title: string;
  content: string;
};

type LabeledItem = {
  title: string;
  iconUrl: string;
};

export type TourViewData = {
  id: string;
  title: string;
  summary: string;
  descriptionHtml: string;
  category: string;
  categoryIconUrl: string;
  imageUrl: string;
  bannerUrl: string;
  gallery: string[];
  published: boolean;
  isFeatured: boolean;
  destinations: { id: string; name: string }[];
  durationDays: number;
  durationUnit: DurationUnit;
  durationLabel: string;
  minPeople: number;
  maxGroupSize: number;
  priceFrom: number;
  currency: string;
  discounts: PriceDiscount[];
  days: DayItem[];
  includes: LabeledItem[];
  excludes: LabeledItem[];
  styles: LabeledItem[];
  facilities: LabeledItem[];
  faqs: FaqItem[];
  seoIndex: boolean;
  seoTitle: string;
  seoDescription: string;
  seoImageUrl: string;
  facebookTitle: string;
  facebookDescription: string;
  twitterTitle: string;
  twitterDescription: string;
};

function durationText(tour: TourViewData) {
  if (tour.durationLabel.trim()) return tour.durationLabel;
  if (!tour.durationDays) return "—";
  return `${tour.durationDays} day${tour.durationDays === 1 ? "" : "s"}`;
}

function discountText(discount: PriceDiscount, currency: string) {
  const off =
    discount.mode === "percent"
      ? `${discount.value}% off`
      : `${formatMoney(discount.value, currency)} off`;
  if (discount.kind === "group") {
    return `${off} from ${discount.minPeople} people`;
  }
  return `${off} for one person`;
}

export function TourView({
  tour,
  canManage,
}: {
  tour: TourViewData;
  canManage: boolean;
}) {
  const [featured, setFeatured] = useState(tour.isFeatured);
  const [featureError, setFeatureError] = useState<string | null>(null);
  const [featurePending, startFeature] = useTransition();
  const story = tour.descriptionHtml.trim();
  const hero = tour.bannerUrl;
  const places =
    tour.destinations.length > 0
      ? tour.destinations.map((item) => item.name).join(" · ")
      : "";

  return (
    <div className="-mx-4 -mt-4 sm:-mx-5 sm:-mt-5">
      <section className="relative min-h-64 overflow-hidden bg-navy sm:min-h-80">
        {hero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/45 to-navy/25" />

        <div className="relative flex items-start justify-between gap-3 px-4 pt-4 sm:px-5">
          <Link href="/admin/tours" className="text-xs font-medium text-white/90 hover:text-white">
            ← Tours
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {tour.published ? (
              <Badge tone="success">Published</Badge>
            ) : (
              <Badge tone="warning">Draft</Badge>
            )}
            {canManage ? (
              <button
                type="button"
                role="switch"
                aria-checked={featured}
                disabled={featurePending}
                onClick={() => {
                  const next = !featured;
                  setFeatured(next);
                  setFeatureError(null);
                  startFeature(async () => {
                    const result = await setTourFeatured(tour.id, next);
                    if (result.error) {
                      setFeatured(!next);
                      setFeatureError(result.error);
                    }
                  });
                }}
                className={[
                  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                  featured
                    ? "border-white/40 bg-white text-brand"
                    : "border-white/30 bg-white/15 text-white",
                ].join(" ")}
              >
                <span
                  className={[
                    "h-3.5 w-6 rounded-full p-0.5",
                    featured ? "bg-brand" : "bg-white/40",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "block h-2.5 w-2.5 rounded-full bg-white transition-transform",
                      featured ? "translate-x-2.5" : "translate-x-0",
                    ].join(" ")}
                  />
                </span>
                Featured
              </button>
            ) : featured ? (
              <Badge tone="brand">Featured</Badge>
            ) : null}
            {canManage ? (
              <ButtonLink href={`/admin/tours/${tour.id}`} size="sm">
                Edit tour
              </ButtonLink>
            ) : null}
          </div>
        </div>

        <div className="relative px-4 pt-16 pb-6 text-white sm:px-5 sm:pt-24 sm:pb-8">
          {tour.category.trim() ? (
            <p className="inline-flex items-center gap-2 text-xs font-medium text-white/90">
              <ItemIcon url={tour.categoryIconUrl} title={tour.category} light />
              {tour.category}
            </p>
          ) : null}
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            {tour.title}
          </h1>
          <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-white/85">
            {places ? <span>{places}</span> : null}
            <span>{durationText(tour)}</span>
            {tour.minPeople > 0 && tour.maxGroupSize > 0 ? (
              <span>
                {tour.minPeople}–{tour.maxGroupSize} people
              </span>
            ) : null}
          </p>
          {featureError ? <p className="mt-2 text-xs text-red-200">{featureError}</p> : null}
        </div>
      </section>

      <div className="px-4 pt-4 sm:px-5">
        <PhotoGallery cover={tour.imageUrl} photos={tour.gallery} />
      </div>

      <div className="grid gap-8 px-4 py-6 sm:px-5 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:items-start">
        <div className="grid min-w-0 gap-8">
          {tour.summary.trim() ? (
            <p className="max-w-3xl text-base leading-7 text-navy">{tour.summary}</p>
          ) : null}

          <Block title="Overview">
            {story ? (
              <div
                className="max-w-3xl text-sm leading-7 text-navy [&_a]:text-brand [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ol]:my-2 [&_p]:my-2 [&_ul]:my-2"
                dangerouslySetInnerHTML={{ __html: story }}
              />
            ) : (
              <Empty>No story yet.</Empty>
            )}
          </Block>

          <Block title="Itinerary">
            <Itinerary days={tour.days} />
          </Block>

          <div className="grid gap-6 sm:grid-cols-2">
            <Block title="Included">
              <IconList items={tour.includes} empty="Nothing is listed as included." />
            </Block>
            <Block title="Not included">
              <IconList items={tour.excludes} empty="Nothing is listed as excluded." />
            </Block>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Block title="Travel styles">
              <IconList items={tour.styles} empty="No travel styles." />
            </Block>
            <Block title="Facilities">
              <IconList items={tour.facilities} empty="No facilities." />
            </Block>
          </div>

          <Block title="Questions">
            <FaqList items={tour.faqs} />
          </Block>
        </div>

        <aside className="grid h-fit gap-4 rounded-xl border border-line bg-white p-4 lg:sticky lg:top-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted uppercase">From</p>
            <p className="mt-1 text-2xl font-semibold text-navy">
              {formatMoney(tour.priceFrom, tour.currency)}
            </p>
            <p className="text-sm text-muted">per person · {tour.currency}</p>
          </div>
          <dl className="grid gap-2 border-t border-line pt-3 text-sm">
            <SideFact label="Duration" value={durationText(tour)} />
            <SideFact
              label="Group"
              value={
                tour.minPeople > 0 && tour.maxGroupSize > 0
                  ? `${tour.minPeople}–${tour.maxGroupSize} people`
                  : "—"
              }
            />
            <SideFact label="Places" value={places || "—"} />
          </dl>
          <div className="border-t border-line pt-3">
            <p className="text-xs font-medium tracking-wide text-muted uppercase">Discounts</p>
            {tour.discounts.length === 0 ? (
              <p className="mt-1 text-sm text-muted">Everyone pays the price per person.</p>
            ) : (
              <ul className="mt-2 grid gap-1">
                {tour.discounts.map((discount, index) => (
                  <li key={index} className="text-sm text-navy">
                    {discount.kind === "group" ? "More people" : "Single person"}
                    {": "}
                    {discountText(discount, tour.currency)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      <section className="border-t border-line px-4 py-6 sm:px-5">
        <h2 className="text-lg font-semibold text-navy">Search and sharing</h2>
        <p className="mt-1 text-sm text-muted">
          {tour.seoIndex ? "Search engines can show this tour." : "Hidden from search results."}
        </p>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <ShareCard
            label="Search result"
            image={tour.seoImageUrl}
            title={tour.seoTitle}
            text={tour.seoDescription}
          />
          <ShareCard
            label="Facebook"
            image={tour.seoImageUrl}
            title={tour.facebookTitle}
            text={tour.facebookDescription}
          />
          <ShareCard
            label="X"
            image={tour.seoImageUrl}
            title={tour.twitterTitle}
            text={tour.twitterDescription}
          />
        </div>
      </section>
    </div>
  );
}

function PhotoGallery({ cover, photos }: { cover: string; photos: string[] }) {
  const slides = [cover, ...photos.filter((url) => url && url !== cover)].filter(Boolean);
  const [openAt, setOpenAt] = useState<number | null>(null);

  if (slides.length === 0) {
    return <Empty>No photos yet.</Empty>;
  }

  const featured = slides[0] ?? "";
  const rest = slides.slice(1);
  const preview = rest.slice(0, 4);
  const hidden = rest.length - preview.length;

  return (
    <>
      <div
        className={
          preview.length > 0
            ? "grid gap-2 md:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] md:items-stretch"
            : ""
        }
      >
        <button
          type="button"
          onClick={() => setOpenAt(0)}
          className="group relative overflow-hidden rounded-xl text-left md:h-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={featured}
            alt="Cover"
            className="aspect-[16/10] w-full object-cover md:absolute md:inset-0 md:aspect-auto md:h-full"
          />
          {cover ? (
            <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-navy">
              Cover
            </span>
          ) : null}
        </button>

        {preview.length > 0 ? (
          <div className={preview.length === 1 ? "grid gap-2" : "grid grid-cols-2 gap-2"}>
            {preview.map((url, index) => {
              const isMore = index === preview.length - 1 && hidden > 0;
              return (
                <button
                  key={`${url}-${index}`}
                  type="button"
                  onClick={() => setOpenAt(index + 1)}
                  className="relative overflow-hidden rounded-xl"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="aspect-[4/3] w-full object-cover md:h-full" />
                  {isMore ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-navy/55 text-sm font-semibold text-white">
                      +{hidden} photos
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {openAt !== null ? (
        <Lightbox slides={slides} index={openAt} onIndex={setOpenAt} onClose={() => setOpenAt(null)} />
      ) : null}
    </>
  );
}

function Lightbox({
  slides,
  index,
  onIndex,
  onClose,
}: {
  slides: string[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
}) {
  const total = slides.length;
  const current = slides[index] ?? slides[0] ?? "";

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onIndex((index + 1) % total);
      if (event.key === "ArrowLeft") onIndex((index - 1 + total) % total);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, onClose, onIndex, total]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Photo gallery"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close gallery"
        className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full bg-white text-lg text-navy"
        onClick={onClose}
      >
        ×
      </button>
      {total > 1 ? (
        <button
          type="button"
          aria-label="Previous photo"
          className="absolute left-3 flex size-10 items-center justify-center rounded-full bg-white text-xl text-navy sm:left-6"
          onClick={(event) => {
            event.stopPropagation();
            onIndex((index - 1 + total) % total);
          }}
        >
          ‹
        </button>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current}
        alt=""
        className="max-h-[82vh] max-w-[min(100%,56rem)] rounded-lg object-contain"
        onClick={(event) => event.stopPropagation()}
      />
      {total > 1 ? (
        <button
          type="button"
          aria-label="Next photo"
          className="absolute right-3 flex size-10 items-center justify-center rounded-full bg-white text-xl text-navy sm:right-6"
          onClick={(event) => {
            event.stopPropagation();
            onIndex((index + 1) % total);
          }}
        >
          ›
        </button>
      ) : null}
      <p className="absolute bottom-4 text-sm text-white">
        {index + 1} / {total}
      </p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-navy">{title}</h2>
      {children}
    </section>
  );
}

function SideFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-navy">{value}</dd>
    </div>
  );
}

function ShareCard({
  label,
  image,
  title,
  text,
}: {
  label: string;
  image: string;
  title: string;
  text: string;
}) {
  return (
    <article className="overflow-hidden rounded-xl border border-line bg-white">
      <p className="border-b border-line px-3 py-2 text-[11px] font-medium tracking-wide text-muted uppercase">
        {label}
      </p>
      <div className="flex gap-3 p-3">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="size-16 shrink-0 rounded-md object-cover" />
        ) : (
          <div className="size-16 shrink-0 rounded-md bg-surface" />
        )}
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold text-navy">{title.trim() || "—"}</p>
          <p className="mt-1 line-clamp-3 text-xs leading-5 text-muted">{text.trim() || "—"}</p>
        </div>
      </div>
    </article>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}

function itineraryTitle(title: string) {
  const trimmed = title.trim();
  if (!trimmed || /^(Day|Week) \d+$|^Itinerary$/.test(trimmed)) return "Untitled";
  return trimmed;
}

function Itinerary({ days }: { days: DayItem[] }) {
  if (days.length === 0) return <Empty>No itinerary yet.</Empty>;

  return (
    <ol className="grid gap-4">
      {days.map((day, index) => (
        <li key={day.dayNumber} className="grid gap-3 sm:grid-cols-[7.5rem_minmax(0,1fr)]">
          {day.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={day.imageUrl}
              alt=""
              className="aspect-square w-full rounded-lg object-cover sm:w-[7.5rem]"
            />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-surface text-sm font-semibold text-muted sm:w-[7.5rem]">
              {index + 1}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-navy">{itineraryTitle(day.title)}</p>
            {day.description ? (
              <p className="mt-1 text-sm leading-6 whitespace-pre-wrap text-muted">
                {day.description}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

function IconList({ items, empty }: { items: LabeledItem[]; empty: string }) {
  if (items.length === 0) return <Empty>{empty}</Empty>;

  return (
    <ul className="grid gap-2">
      {items.map((item, index) => (
        <li key={`${item.title}-${index}`} className="flex items-center gap-2 text-sm text-navy">
          <ItemIcon url={item.iconUrl} title={item.title} />
          {item.title}
        </li>
      ))}
    </ul>
  );
}

function ItemIcon({ url, title, light = false }: { url: string; title: string; light?: boolean }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" className="size-5 shrink-0 rounded object-cover" />
    );
  }
  return (
    <span
      className={[
        "flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold",
        light ? "bg-white/20 text-white" : "bg-surface text-muted",
      ].join(" ")}
    >
      {title.slice(0, 1).toUpperCase()}
    </span>
  );
}

function FaqList({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return <Empty>No FAQs yet.</Empty>;

  return (
    <ul className="divide-y divide-line rounded-xl border border-line bg-white">
      {items.map((item, index) => (
        <li key={`${item.title}-${index}`} className="px-4 py-3">
          <p className="text-sm font-semibold text-navy">{item.title}</p>
          {item.content ? (
            <p className="mt-1 text-sm leading-6 whitespace-pre-wrap text-muted">{item.content}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
