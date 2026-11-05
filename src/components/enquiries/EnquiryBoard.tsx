import Link from "next/link";
import { enquiryFactGroups, enquiryFilters, enquiryStatusLabel, enquiryStatusTone, type EnquiryView } from "@/lib/enquiries";
import { formatDate, formatDateTime } from "@/lib/format";

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
  bus: "bg-indigo-50 text-indigo-900",
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

export function EnquiryFacts({ enquiry, footer }: { enquiry: EnquiryView; footer?: React.ReactNode }) {
  const groups = enquiryFactGroups
    .map((group) => ({ group, facts: enquiry.facts.filter((fact) => fact.group === group) }))
    .filter((section) => section.facts.length > 0);
  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-4 rounded-xl border border-line bg-white p-4 shadow-sm sm:flex-row">
        {enquiry.image ? (
          <img src={enquiry.image} alt="" className="h-32 w-full shrink-0 rounded-lg object-cover sm:h-28 sm:w-40" />
        ) : null}
        <div className="grid min-w-0 content-center gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex h-5 items-center rounded px-1.5 text-[10px] font-semibold uppercase tracking-wide ${kindClass[enquiry.module]}`}>
              {enquiry.kindLabel}
            </span>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${toneClass[enquiryStatusTone(enquiry.status)]}`}>
              {enquiryStatusLabel(enquiry.status)}
            </span>
          </div>
          <h1 className="text-xl font-semibold leading-tight text-navy">{enquiry.title}</h1>
          <p className="text-xs text-muted">
            Reference <span className="font-mono font-medium text-navy">{enquiry.reference}</span> · Received {formatDateTime(enquiry.createdAt)}
          </p>
        </div>
      </div>
      {groups.map(({ group, facts }) => (
        <FactSection key={group} title={group === "Travellers" ? "Travellers & logistics" : group}>
          {facts.map((fact) => (
            <Fact key={fact.label} label={fact.label} value={fact.value} wide={fact.wide} />
          ))}
        </FactSection>
      ))}
      {enquiry.note ? (
        <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy">Customer note</h2>
          <p className="whitespace-pre-line break-words rounded-lg bg-surface px-3 py-2.5 text-sm leading-relaxed text-navy">{enquiry.note}</p>
        </section>
      ) : null}
      <FactSection title="Contact">
        <Fact label="Name" value={enquiry.contactName || "—"} />
        <Fact label="Phone" value={enquiry.contactPhone || "—"} href={enquiry.contactPhone ? `tel:${enquiry.contactPhone.replace(/[^\d+]/g, "")}` : undefined} />
        <Fact label="Email" value={enquiry.contactEmail || "—"} href={enquiry.contactEmail ? `mailto:${enquiry.contactEmail}` : undefined} />
        {enquiry.channel ? <Fact label="Sent via" value={enquiry.channel === "whatsapp" ? "WhatsApp" : "Website form"} /> : null}
      </FactSection>
      {footer}
    </div>
  );
}

function FactSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-navy">{title}</h2>
      <dl className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">{children}</dl>
    </section>
  );
}

function Fact({ label, value, wide, href }: { label: string; value: string; wide?: boolean; href?: string }) {
  return (
    <div className={`min-w-0 rounded-lg bg-surface px-3 py-2.5 ${wide ? "col-span-2 lg:col-span-3" : ""}`}>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-semibold text-navy">
        {href ? (
          <a href={href} className="text-brand hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
