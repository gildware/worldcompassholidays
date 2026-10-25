import Link from "next/link";
import { enquiryFilters, enquiryStatusLabel, enquiryStatusTone, type EnquiryView } from "@/lib/enquiries";
import { formatDate } from "@/lib/format";

const toneClass: Record<string, string> = {
  ok: "bg-emerald-50 text-emerald-800",
  warn: "bg-amber-50 text-amber-900",
  info: "bg-sky-50 text-sky-900",
  danger: "bg-rose-50 text-rose-800",
  neutral: "bg-surface text-navy",
};

const kindClass: Record<EnquiryView["module"], string> = {
  tour: "bg-sky-50 text-sky-900",
  hotel: "bg-amber-50 text-amber-900",
  car: "bg-emerald-50 text-emerald-800",
  bike: "bg-violet-50 text-violet-900",
};

export function EnquiryBoard({
  rows,
  active,
  basePath,
  detailPath,
  showContact = false,
  empty,
}: {
  rows: EnquiryView[];
  active: string;
  basePath: string;
  detailPath: (row: EnquiryView) => string;
  showContact?: boolean;
  empty: string;
}) {
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Enquiry type">
        {enquiryFilters.map((filter) => {
          const on = active === filter.value;
          const href = filter.value === "all" ? basePath : `${basePath}?type=${filter.value}`;
          return (
            <Link
              key={filter.value}
              href={href}
              role="tab"
              aria-selected={on}
              className={[
                "inline-flex h-7 items-center rounded-full px-2.5 text-xs font-semibold",
                on ? "bg-navy text-white" : "bg-white text-navy ring-1 ring-line",
              ].join(" ")}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line bg-white px-4 py-6 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
          {rows.map((row) => (
            <li key={row.id}>
              <Link href={detailPath(row)} className="flex items-center gap-3 px-3 py-2 hover:bg-surface">
                {row.image ? (
                  <img src={row.image} alt="" className="h-11 w-14 shrink-0 rounded-md object-cover" />
                ) : null}
                <span className={`inline-flex h-5 shrink-0 items-center rounded px-1.5 text-[10px] font-semibold uppercase tracking-wide ${kindClass[row.module]}`}>
                  {row.kindLabel}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-navy">{row.title}</span>
                  <span className="block truncate text-xs text-muted">
                    {showContact ? `${row.contactName}${row.contactPhone ? ` · ${row.contactPhone}` : ""} · ` : ""}
                    {row.summary || row.reference}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${toneClass[enquiryStatusTone(row.status)]}`}>
                    {enquiryStatusLabel(row.status)}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-muted">{formatDate(row.createdAt)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function EnquiryFacts({ enquiry }: { enquiry: EnquiryView }) {
  return (
    <div className="grid gap-3">
      {enquiry.image ? (
        <img src={enquiry.image} alt="" className="h-36 w-full rounded-md object-cover" />
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex h-5 items-center rounded px-1.5 text-[10px] font-semibold uppercase tracking-wide ${kindClass[enquiry.module]}`}>
          {enquiry.kindLabel}
        </span>
        <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${toneClass[enquiryStatusTone(enquiry.status)]}`}>
          {enquiryStatusLabel(enquiry.status)}
        </span>
        <span className="text-xs text-muted">{enquiry.reference}</span>
      </div>
      <h1 className="text-lg font-semibold leading-tight text-navy">{enquiry.title}</h1>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
        {enquiry.facts.map((fact) => (
          <div key={fact.label} className="min-w-0">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">{fact.label}</dt>
            <dd className="truncate text-sm text-navy">{fact.value}</dd>
          </div>
        ))}
      </dl>
      {enquiry.note ? (
        <p className="rounded-md bg-surface px-3 py-2 text-sm text-navy">
          <span className="font-medium">Note. </span>
          {enquiry.note}
        </p>
      ) : null}
    </div>
  );
}
