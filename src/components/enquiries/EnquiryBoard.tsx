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
  contact: "bg-rose-50 text-rose-900",
};

const factCardClass: Record<string, string> = {
  Trip: "border-sky-100 bg-sky-50 text-sky-950",
  Travellers: "border-amber-100 bg-amber-50 text-amber-950",
  Preferences: "border-violet-100 bg-violet-50 text-violet-950",
  Budget: "border-emerald-100 bg-emerald-50 text-emerald-950",
  Contact: "border-indigo-100 bg-indigo-50 text-indigo-950",
  Note: "border-rose-100 bg-rose-50 text-rose-950",
};

const factLabelClass: Record<string, string> = {
  Trip: "text-sky-700/80",
  Travellers: "text-amber-800/80",
  Preferences: "text-violet-800/80",
  Budget: "text-emerald-800/80",
  Contact: "text-indigo-800/80",
  Note: "text-rose-800/80",
};

export function EnquiryBoard({
  rows,
  active,
  basePath,
  detailPath,
  showContact = false,
  empty,
  layout = "list",
}: {
  rows: EnquiryView[];
  active: string;
  basePath: string;
  detailPath: (row: EnquiryView) => string;
  showContact?: boolean;
  empty: string;
  layout?: "list" | "table";
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
                on ? "bg-navy text-white hover:text-white" : "bg-white text-navy ring-1 ring-line",
              ].join(" ")}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line bg-white px-4 py-6 text-sm text-muted">{empty}</p>
      ) : layout === "table" ? (
        <EnquiryTable rows={rows} detailPath={detailPath} showContact={showContact} />
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

function EnquiryTable({
  rows,
  detailPath,
  showContact,
}: {
  rows: EnquiryView[];
  detailPath: (row: EnquiryView) => string;
  showContact: boolean;
}) {
  const th = "px-2 py-1.5 text-left text-[11px] font-semibold text-navy";
  const td = "px-2 py-1.5 align-middle";
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-white">
      <table className="w-full table-fixed border-collapse text-xs leading-tight">
        <colgroup>
          <col className="w-[4.75rem]" />
          <col />
          {showContact ? <col className="w-[13.5rem]" /> : null}
          <col className="w-[6.75rem]" />
          <col className="w-[5.75rem]" />
          <col className="w-[3.25rem]" />
        </colgroup>
        <thead className="border-b border-line bg-surface">
          <tr>
            <th scope="col" className={th}>
              Type
            </th>
            <th scope="col" className={th}>
              Request
            </th>
            {showContact ? (
              <th scope="col" className={th}>
                Contact
              </th>
            ) : null}
            <th scope="col" className={th}>
              Status
            </th>
            <th scope="col" className={th}>
              Received
            </th>
            <th scope="col" className={`${th} text-right`}>
              Open
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-line last:border-b-0 hover:bg-surface/80">
              <td className={td}>
                <span className={`inline-flex h-4 max-w-full items-center truncate rounded px-1 text-[9px] font-semibold uppercase tracking-wide ${kindClass[row.module]}`}>
                  {row.kindLabel}
                </span>
              </td>
              <td className={td}>
                <div className="flex min-w-0 items-start gap-1.5">
                  {row.image ? <img src={row.image} alt="" className="mt-0.5 h-7 w-9 shrink-0 rounded object-cover" /> : null}
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-navy">{row.title}</p>
                    <p className="truncate text-[10px] text-muted">
                      <span className="font-mono tracking-wide">{row.reference}</span>
                      {row.summary ? ` · ${row.summary}` : ""}
                    </p>
                  </div>
                </div>
              </td>
              {showContact ? (
                <td className={td}>
                  <p className="truncate text-[13px] font-medium text-navy">{row.contactName || "—"}</p>
                  <p className="truncate text-[10px] text-muted">{row.contactPhone || row.contactEmail || "—"}</p>
                </td>
              ) : null}
              <td className={td}>
                <span className={`inline-flex max-w-full truncate rounded-full px-1.5 py-px text-[9px] font-semibold ${toneClass[enquiryStatusTone(row.status)]}`}>
                  {enquiryStatusLabel(row.status)}
                </span>
              </td>
              <td className={`${td} whitespace-nowrap text-[11px] text-muted`}>{formatDate(row.createdAt)}</td>
              <td className={`${td} text-right`}>
                <Link href={detailPath(row)} className="text-[11px] font-semibold text-brand hover:underline">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EnquiryFacts({ enquiry, footer }: { enquiry: EnquiryView; footer?: React.ReactNode }) {
  const groups = enquiryFactGroups
    .map((group) => ({ group, facts: enquiry.facts.filter((fact) => fact.group === group) }))
    .filter((section) => section.facts.length > 0);

  const cards: { key: string; group: string; label: string; value: string; href?: string; wide?: boolean }[] = [];
  for (const { group, facts } of groups) {
    for (const fact of facts) {
      cards.push({ key: `${group}-${fact.label}`, group, label: fact.label, value: fact.value, wide: fact.wide });
    }
  }
  cards.push({ key: "contact-name", group: "Contact", label: "Name", value: enquiry.contactName || "—" });
  cards.push({
    key: "contact-phone",
    group: "Contact",
    label: "Phone",
    value: enquiry.contactPhone || "—",
    href: enquiry.contactPhone ? `tel:${enquiry.contactPhone.replace(/[^\d+]/g, "")}` : undefined,
  });
  cards.push({
    key: "contact-email",
    group: "Contact",
    label: "Email",
    value: enquiry.contactEmail || "—",
    href: enquiry.contactEmail ? `mailto:${enquiry.contactEmail}` : undefined,
  });
  if (enquiry.channel) {
    cards.push({
      key: "contact-channel",
      group: "Contact",
      label: "Sent via",
      value: enquiry.channel === "whatsapp" ? "WhatsApp" : "Website form",
    });
  }
  if (enquiry.note) {
    cards.push({ key: "note", group: "Note", label: "Customer note", value: enquiry.note, wide: true });
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        {enquiry.image ? (
          <img src={enquiry.image} alt="" className="h-24 w-full shrink-0 rounded-lg object-cover sm:h-20 sm:w-28" />
        ) : null}
        <div className="grid min-w-0 flex-1 content-center gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex h-5 items-center rounded px-1.5 text-[10px] font-semibold uppercase tracking-wide ${kindClass[enquiry.module]}`}>
              {enquiry.kindLabel}
            </span>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${toneClass[enquiryStatusTone(enquiry.status)]}`}>
              {enquiryStatusLabel(enquiry.status)}
            </span>
          </div>
          <h1 className="text-lg font-semibold leading-tight text-navy">{enquiry.title}</h1>
          <p className="text-xs text-muted">
            Reference <span className="font-mono font-medium text-navy">{enquiry.reference}</span> · Received {formatDateTime(enquiry.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {cards.map((card) => (
          <article
            key={card.key}
            className={`rounded-lg border px-3 py-2.5 shadow-sm ${factCardClass[card.group] ?? "border-line bg-surface text-navy"} ${card.wide ? "sm:col-span-2" : ""}`}
          >
            <p className={`text-[10px] font-semibold uppercase tracking-wide ${factLabelClass[card.group] ?? "text-muted"}`}>
              {card.group} · {card.label}
            </p>
            <p className={`mt-0.5 break-words text-sm font-semibold leading-snug ${card.group === "Note" ? "whitespace-pre-line font-medium" : ""}`}>
              {card.href ? (
                <a href={card.href} className="underline-offset-2 hover:underline">
                  {card.value}
                </a>
              ) : (
                card.value
              )}
            </p>
          </article>
        ))}
      </div>

      {footer}
    </div>
  );
}
