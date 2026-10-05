"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { formatMoney } from "@/lib/format";

type DayItem = {
  dayNumber: number;
  title: string;
  description: string;
};

type FaqItem = {
  title: string;
  content: string;
};

export type TourViewData = {
  id: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  imageUrl: string;
  published: boolean;
  isFeatured: boolean;
  destination: { id: string; name: string } | null;
  durationDays: number;
  durationLabel: string;
  difficulty: string;
  priceFrom: number;
  currency: string;
  days: DayItem[];
  includes: string[];
  excludes: string[];
  faqs: FaqItem[];
};

const tabs = [
  { id: "itinerary", label: "Itinerary" },
  { id: "included", label: "Included" },
  { id: "excluded", label: "Excluded" },
  { id: "faqs", label: "FAQs" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function difficultyLabel(value: string) {
  if (!value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function durationText(tour: TourViewData) {
  if (tour.durationLabel.trim()) return tour.durationLabel;
  return `${tour.durationDays} day${tour.durationDays === 1 ? "" : "s"}`;
}

export function TourView({
  tour,
  canManage,
}: {
  tour: TourViewData;
  canManage: boolean;
}) {
  const [tab, setTab] = useState<TabId>("itinerary");
  const counts: Record<TabId, number> = {
    itinerary: tour.days.length,
    included: tour.includes.length,
    excluded: tour.excludes.length,
    faqs: tour.faqs.length,
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin/tours"
          className="text-xs font-medium text-brand hover:underline"
        >
          ← Tours
        </Link>
        {canManage ? (
          <ButtonLink href={`/admin/tours/${tour.id}`} size="sm">
            Edit tour
          </ButtonLink>
        ) : null}
      </div>

      <section className="rounded-xl border border-line bg-white p-3 sm:p-4">
        <div className="flex items-center gap-4">
          {tour.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tour.imageUrl}
              alt=""
              className="h-24 w-36 shrink-0 rounded-lg object-cover sm:h-[6.5rem] sm:w-48"
            />
          ) : (
            <div className="h-24 w-36 shrink-0 rounded-lg bg-surface sm:h-[6.5rem] sm:w-48" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-navy">
                {tour.title}
              </h1>
              {tour.published ? (
                <Badge tone="success">Published</Badge>
              ) : (
                <Badge tone="warning">Draft</Badge>
              )}
              {tour.isFeatured ? <Badge tone="brand">Featured</Badge> : null}
            </div>
            <p className="mt-1 line-clamp-1 text-sm text-muted">
              {tour.summary || tour.description || "No summary yet."}
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line pt-3 sm:grid-cols-5">
              <Fact
                label="Destination"
                value={tour.destination?.name ?? "—"}
                href={
                  tour.destination
                    ? `/admin/destinations/${tour.destination.id}`
                    : undefined
                }
              />
              <Fact label="Category" value={tour.category.trim() || "—"} />
              <Fact label="Duration" value={durationText(tour)} />
              <Fact label="Difficulty" value={difficultyLabel(tour.difficulty)} />
              <Fact
                label="From"
                value={formatMoney(tour.priceFrom, tour.currency)}
              />
            </dl>
          </div>
        </div>
      </section>

      <section className="min-w-0 rounded-lg border border-line bg-white">
        <div
          role="tablist"
          aria-label="Tour content"
          className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2"
        >
          {tabs.map((item) => {
            const selected = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(item.id)}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium ${
                  selected
                    ? "bg-navy text-white"
                    : "text-muted hover:bg-surface hover:text-navy"
                }`}
              >
                {item.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    selected ? "bg-white/20" : "bg-surface text-navy"
                  }`}
                >
                  {counts[item.id]}
                </span>
              </button>
            );
          })}
        </div>

        <div role="tabpanel" className="p-4">
          {tab === "itinerary" ? (
            <Itinerary days={tour.days} />
          ) : null}
          {tab === "included" ? (
            <BulletList
              items={tour.includes}
              empty="Nothing is listed as included."
            />
          ) : null}
          {tab === "excluded" ? (
            <BulletList
              items={tour.excludes}
              empty="Nothing is listed as excluded."
            />
          ) : null}
          {tab === "faqs" ? <FaqList items={tour.faqs} /> : null}
        </div>
      </section>
    </div>
  );
}

function Fact({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium tracking-wide text-muted uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-sm font-semibold text-navy">
        {href ? (
          <Link href={href} className="text-brand hover:underline">
            {value}
          </Link>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function Itinerary({ days }: { days: DayItem[] }) {
  if (days.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted">
        No itinerary days yet.
      </p>
    );
  }

  return (
    <ol className="divide-y divide-line">
      {days.map((day) => (
        <li key={day.dayNumber} className="py-3">
          <p className="text-sm font-semibold text-navy">
            Day {day.dayNumber}
            {day.title ? ` · ${day.title}` : ""}
          </p>
          {day.description ? (
            <p className="mt-1 text-xs leading-5 text-muted">{day.description}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function BulletList({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">{empty}</p>;
  }

  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li key={item} className="text-sm text-navy">
          {item}
        </li>
      ))}
    </ul>
  );
}

function FaqList({ items }: { items: FaqItem[] }) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted">No FAQs yet.</p>
    );
  }

  return (
    <ul className="divide-y divide-line">
      {items.map((item) => (
        <li key={item.title} className="py-3">
          <p className="text-sm font-semibold text-navy">{item.title}</p>
          {item.content ? (
            <p className="mt-1 text-xs leading-5 text-muted">{item.content}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
