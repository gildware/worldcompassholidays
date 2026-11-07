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

function groupSizeText(tour: TourViewData) {
  if (tour.minPeople > 0 && tour.maxGroupSize > 0) {
    return `${tour.minPeople}–${tour.maxGroupSize}`;
  }
  return "—";
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-semibold text-navy">{value || "—"}</dd>
    </div>
  );
}

function Section({
  title,
  children,
  className = "",
  action,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={`rounded-xl border border-line bg-white p-3 sm:p-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</h2>
        {action}
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
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
  const cover = tour.bannerUrl || tour.imageUrl || "";
  const places =
    tour.destinations.length > 0
      ? tour.destinations.map((item) => item.name).join(" · ")
      : "";
  const photos = [
    ...new Set([tour.imageUrl, tour.bannerUrl, ...tour.gallery].filter(Boolean)),
  ];

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/admin/tours" className="text-xs font-medium text-brand hover:underline">
          ← Tours
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={tour.published ? "success" : "warning"}>
            {tour.published ? "Published" : "Draft"}
          </Badge>
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
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                featured
                  ? "border-brand/30 bg-brand-soft text-brand"
                  : "border-line bg-white text-muted",
              ].join(" ")}
            >
              <span
                className={[
                  "h-3.5 w-6 rounded-full p-0.5",
                  featured ? "bg-brand" : "bg-slate-300",
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
              Edit
            </ButtonLink>
          ) : null}
        </div>
      </div>

      {featureError ? <p className="text-xs text-red-700">{featureError}</p> : null}

      <section className="rounded-xl border border-line bg-white p-3 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-[10rem_minmax(0,1fr)] lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start">
          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt=""
                className="aspect-[4/3] max-h-40 w-full object-cover sm:max-h-none"
              />
            ) : (
              <div className="flex aspect-[4/3] max-h-40 items-center justify-center text-sm text-muted sm:max-h-none">
                No photo
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                {tour.category.trim() ? (
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-brand uppercase">
                    <ItemIcon url={tour.categoryIconUrl} title={tour.category} compact />
                    {tour.category}
                  </p>
                ) : (
                  <p className="text-[11px] font-medium tracking-wide text-brand uppercase">Tour</p>
                )}
                <h1 className="mt-1 text-xl font-semibold tracking-tight text-navy sm:text-2xl">
                  {tour.title}
                </h1>
                <p className="mt-1 text-sm text-muted">{places || "No destinations"}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-navy">
                  {tour.priceFrom > 0 ? formatMoney(tour.priceFrom, tour.currency) : "—"}
                </p>
                <p className="text-xs text-muted">from / person</p>
              </div>
            </div>

            {tour.summary.trim() ? (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-navy">{tour.summary}</p>
            ) : null}

            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-line pt-3 sm:grid-cols-3 lg:grid-cols-6">
              <Fact label="Duration" value={durationText(tour)} />
              <Fact label="Group" value={groupSizeText(tour)} />
              <Fact label="Places" value={String(tour.destinations.length || "—")} />
              <Fact label="Days" value={String(tour.days.length || "—")} />
              <Fact label="Currency" value={tour.currency || "—"} />
              <Fact
                label="Discounts"
                value={tour.discounts.length > 0 ? String(tour.discounts.length) : "None"}
              />
            </dl>

            {tour.discounts.length > 0 ? (
              <div className="mt-3 border-t border-line pt-3">
                <h2 className="text-[11px] font-medium uppercase tracking-wide text-muted">
                  Discounts
                </h2>
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {tour.discounts.map((discount, index) => (
                    <li
                      key={index}
                      className="rounded-md border border-line bg-surface px-2 py-0.5 text-xs text-navy"
                    >
                      {discount.kind === "group" ? "Group" : "Single"}:{" "}
                      {discountText(discount, tour.currency)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="grid gap-3">
        {story ? (
          <Section title="Overview">
            <div
              className="prose prose-sm max-w-none text-sm text-navy [&_a]:text-brand [&_h1]:mb-2 [&_h1]:mt-3 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:mt-2 [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ol]:my-1.5 [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-1.5"
              dangerouslySetInnerHTML={{ __html: story }}
            />
          </Section>
        ) : null}

        <Section title={`Itinerary · ${tour.days.length}`}>
          <Itinerary days={tour.days} />
        </Section>

        <div className="grid gap-3 sm:grid-cols-2">
          <Section title={`Included · ${tour.includes.length}`}>
            <IconList items={tour.includes} empty="Nothing listed as included." />
          </Section>
          <Section title={`Not included · ${tour.excludes.length}`}>
            <IconList items={tour.excludes} empty="Nothing listed as excluded." />
          </Section>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Section title={`Travel styles · ${tour.styles.length}`}>
            <IconList items={tour.styles} empty="No travel styles." />
          </Section>
          <Section title={`Facilities · ${tour.facilities.length}`}>
            <IconList items={tour.facilities} empty="No facilities." />
          </Section>
        </div>

        {photos.length > 0 ? (
          <Section title={`Photos · ${photos.length}`}>
            <PhotoGallery photos={photos} cover={tour.imageUrl} />
          </Section>
        ) : null}

        <Section title={`Questions · ${tour.faqs.length}`}>
          <FaqList items={tour.faqs} />
        </Section>

        <Section
          title="Search & sharing"
          action={
            <span className="text-[11px] font-medium text-muted">
              {tour.seoIndex ? "Indexed" : "Noindex"}
            </span>
          }
        >
          <div className="grid gap-2 lg:grid-cols-3">
            <ShareCard
              label="Search"
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
        </Section>
      </div>
    </div>
  );
}

function PhotoGallery({ photos, cover }: { photos: string[]; cover: string }) {
  const [openAt, setOpenAt] = useState<number | null>(null);

  return (
    <>
      <ul className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6">
        {photos.map((url, index) => (
          <li key={`${url}-${index}`}>
            <button
              type="button"
              onClick={() => setOpenAt(index)}
              className="relative block w-full overflow-hidden rounded-md border border-line bg-surface text-left"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="aspect-[4/3] w-full object-cover" />
              {cover && url === cover ? (
                <span className="absolute bottom-1 left-1 rounded bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-navy">
                  Cover
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
      {openAt !== null ? (
        <Lightbox
          slides={photos}
          index={openAt}
          onIndex={setOpenAt}
          onClose={() => setOpenAt(null)}
        />
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
    <article className="overflow-hidden rounded-lg border border-line bg-surface/40">
      <p className="border-b border-line px-2.5 py-1.5 text-[11px] font-medium tracking-wide text-muted uppercase">
        {label}
      </p>
      <div className="flex gap-2.5 p-2.5">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="size-12 shrink-0 rounded object-cover" />
        ) : (
          <div className="size-12 shrink-0 rounded bg-surface" />
        )}
        <div className="min-w-0">
          <p className="line-clamp-1 text-sm font-semibold text-navy">{title.trim() || "—"}</p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted">{text.trim() || "—"}</p>
        </div>
      </div>
    </article>
  );
}

function itineraryTitle(title: string) {
  const trimmed = title.trim();
  if (!trimmed || /^(Day|Week) \d+$|^Itinerary$/.test(trimmed)) return "Untitled";
  return trimmed;
}

function Itinerary({ days }: { days: DayItem[] }) {
  if (days.length === 0) return <Empty>No itinerary yet.</Empty>;

  return (
    <ol className="grid gap-2">
      {days.map((day, index) => (
        <li
          key={day.dayNumber}
          className="grid gap-2.5 rounded-lg border border-line bg-surface/40 p-2 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:items-start"
        >
          {day.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={day.imageUrl}
              alt=""
              className="aspect-square w-full rounded-md object-cover sm:w-[4.5rem]"
            />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-md border border-line bg-white text-xs font-semibold text-muted sm:w-[4.5rem]">
              {index + 1}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-[11px] font-medium tracking-wide text-muted uppercase">
                Day {day.dayNumber || index + 1}
              </span>
              <p className="text-sm font-semibold text-navy">{itineraryTitle(day.title)}</p>
            </div>
            {day.description ? (
              <p className="mt-1 line-clamp-3 text-xs leading-5 whitespace-pre-wrap text-muted">
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
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item, index) => (
        <li
          key={`${item.title}-${index}`}
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-0.5 text-xs text-navy"
        >
          <ItemIcon url={item.iconUrl} title={item.title} compact />
          {item.title}
        </li>
      ))}
    </ul>
  );
}

function ItemIcon({
  url,
  title,
  compact = false,
  light = false,
}: {
  url: string;
  title: string;
  compact?: boolean;
  light?: boolean;
}) {
  const size = compact ? "size-3.5" : "size-5";
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" className={`${size} shrink-0 rounded object-cover`} />
    );
  }
  return (
    <span
      className={[
        `flex ${size} shrink-0 items-center justify-center rounded text-[9px] font-semibold`,
        light ? "bg-white/20 text-white" : "bg-white text-muted",
      ].join(" ")}
    >
      {title.slice(0, 1).toUpperCase()}
    </span>
  );
}

function FaqList({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return <Empty>No FAQs yet.</Empty>;

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((item, index) => (
        <li
          key={`${item.title}-${index}`}
          className="rounded-lg border border-line bg-surface/40 p-2.5"
        >
          <p className="text-sm font-medium text-navy">{item.title}</p>
          {item.content ? (
            <p className="mt-1 line-clamp-3 text-xs leading-5 whitespace-pre-wrap text-muted">
              {item.content}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
