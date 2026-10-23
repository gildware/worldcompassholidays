"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { BookingListRow } from "@/lib/booking-admin";
import { deskSegmentForModule } from "@/lib/booking-desks";
import {
  bookingModules,
  bookingStatusLabels,
  bookingStatuses,
  bookingStatusTone,
  moduleLabel,
  statusLabel,
  type BookingStatus,
} from "@/lib/bookings";
import { formatDate, formatMoney } from "@/lib/format";
import "./bookings-desk.css";

function bookingDetailHref(id: string, module: string) {
  const desk = deskSegmentForModule(module);
  return desk ? `/admin/bookings/${id}?desk=${desk}` : `/admin/bookings/${id}`;
}

export type { BookingListRow };

type SortKey = "created" | "guest" | "service" | "status" | "start" | "amount";
type StatusView = "all" | "action" | BookingStatus;

function SortHeader({
  label,
  column,
  sortKey,
  sortDir,
  onSort,
  align = "left",
}: {
  label: string;
  column: SortKey;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (column: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = sortKey === column;
  return (
    <th
      scope="col"
      aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
      className={`px-3 py-2.5 ${align === "right" ? "text-right" : "text-left"}`}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`inline-flex items-center gap-1 text-xs font-semibold text-navy hover:text-brand ${
          align === "right" ? "ml-auto" : ""
        }`}
      >
        {label}
        <span aria-hidden className={active ? "text-brand" : "text-muted"}>
          {active ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </button>
    </th>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`bk-status bk-status--${bookingStatusTone(status)}`}>
      {statusLabel(status)}
    </span>
  );
}

function ModuleMark({ module }: { module: string }) {
  const letter = moduleLabel(module).slice(0, 1).toUpperCase();
  return (
    <span className={`bk-module bk-module--${module}`} aria-hidden>
      {letter}
    </span>
  );
}

function startOfDay(iso: string) {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function BookingsWorkspace({
  bookings,
  canManage,
  deskTitle,
  deskHint,
  lockedModule,
}: {
  bookings: BookingListRow[];
  canManage: boolean;
  /** When set, this is a single-desk list (tours / hotels / visa / assist). */
  deskTitle?: string;
  deskHint?: string;
  lockedModule?: string;
}) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);
  const [statusView, setStatusView] = useState<StatusView>("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState<"all" | "unassigned" | "mine" | string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const effectiveModule = lockedModule ?? moduleFilter;

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const weekAhead = today + 7 * 24 * 60 * 60 * 1000;

  const stats = useMemo(() => {
    const action = bookings.filter((b) => b.status === "enquiry" || b.status === "quoted").length;
    const live = bookings.filter((b) =>
      ["confirmed", "paid"].includes(b.status),
    ).length;
    const pipelineValue = bookings
      .filter((b) => !["cancelled", "completed"].includes(b.status))
      .reduce((sum, b) => sum + b.amount, 0);
    const upcoming = bookings.filter((b) => {
      if (!b.startDate) return false;
      if (["cancelled", "completed"].includes(b.status)) return false;
      const start = startOfDay(b.startDate);
      return start >= today && start <= weekAhead;
    }).length;
    const unassigned = bookings.filter(
      (b) =>
        !b.assigneeId && (b.status === "enquiry" || b.status === "quoted"),
    ).length;
    return { action, live, pipelineValue, upcoming, total: bookings.length, unassigned };
  }, [bookings, today, weekAhead]);

  const modulesPresent = useMemo(() => {
    const set = new Set(bookings.map((b) => b.module));
    return bookingModules.filter((m) => set.has(m));
  }, [bookings]);

  const assigneesPresent = useMemo(() => {
    const map = new Map<string, string>();
    for (const booking of bookings) {
      if (booking.assigneeId && booking.assigneeName) {
        map.set(booking.assigneeId, booking.assigneeName);
      }
    }
    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [bookings]);

  const filtered = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    const rows = bookings.filter((booking) => {
      if (statusView === "action") {
        if (booking.status !== "enquiry" && booking.status !== "quoted") return false;
      } else if (statusView !== "all" && booking.status !== statusView) {
        return false;
      }
      if (effectiveModule !== "all" && booking.module !== effectiveModule) return false;
      if (assigneeFilter === "unassigned" && booking.assigneeId) return false;
      if (assigneeFilter !== "all" && assigneeFilter !== "unassigned" && assigneeFilter !== "mine") {
        if (booking.assigneeId !== assigneeFilter) return false;
      }
      if (!needle) return true;
      return [
        booking.reference,
        booking.title,
        booking.contactName,
        booking.contactEmail,
        booking.contactPhone,
        moduleLabel(booking.module),
        statusLabel(booking.status),
        booking.staffNote,
        booking.assigneeName ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });

    const direction = sortDir === "asc" ? 1 : -1;
    const value = (booking: BookingListRow) => {
      switch (sortKey) {
        case "guest":
          return booking.contactName;
        case "service":
          return booking.title;
        case "status":
          return booking.status;
        case "start":
          return booking.startDate ? new Date(booking.startDate).getTime() : 0;
        case "amount":
          return booking.amount;
        default:
          return new Date(booking.createdAt).getTime();
      }
    };

    return rows.slice().sort((a, b) => {
      const left = value(a);
      const right = value(b);
      const compared =
        typeof left === "number" && typeof right === "number"
          ? left - right
          : String(left).localeCompare(String(right));
      if (compared !== 0) return compared * direction;
      return b.reference.localeCompare(a.reference);
    });
  }, [assigneeFilter, bookings, debouncedQuery, effectiveModule, sortDir, sortKey, statusView]);

  const filtersActive =
    Boolean(debouncedQuery.trim()) ||
    statusView !== "all" ||
    (!lockedModule && moduleFilter !== "all") ||
    assigneeFilter !== "all";

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "created" || key === "amount" || key === "start" ? "desc" : "asc");
  }

  const views: { id: StatusView; label: string; count: number }[] = [
    { id: "all", label: "All", count: stats.total },
    { id: "action", label: "Needs action", count: stats.action },
    ...bookingStatuses.map((status) => ({
      id: status as StatusView,
      label: bookingStatusLabels[status],
      count: bookings.filter((b) => b.status === status).length,
    })),
  ];

  return (
    <div className="bk-desk bk-desk--compact grid gap-3">
      {deskTitle ? (
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-navy">{deskTitle}</h1>
          <p className="mt-0.5 max-w-2xl text-xs text-muted">
            {deskHint ??
              "Search, filter, assign, and open a booking to quote and confirm."}
            {canManage ? "" : " Your role can view but not change bookings."}
          </p>
        </div>
      ) : (
        <p className="max-w-2xl text-xs text-muted">
          Search a guest, filter the pipeline, assign an owner, open a booking to quote and
          confirm.
          {canManage ? "" : " Your role can view but not change bookings."}
        </p>
      )}

      <div className="bk-kpis">
        <button
          type="button"
          className="bk-kpi bk-kpi--warn"
          onClick={() => setStatusView("action")}
        >
          <span className="bk-kpi__label">Needs action</span>
          <span className="bk-kpi__value">{stats.action}</span>
          <span className="bk-kpi__foot">Enquiries &amp; quotes waiting</span>
        </button>
        <button
          type="button"
          className="bk-kpi"
          onClick={() => {
            setStatusView("action");
            setAssigneeFilter("unassigned");
          }}
        >
          <span className="bk-kpi__label">Unassigned</span>
          <span className="bk-kpi__value">{stats.unassigned}</span>
          <span className="bk-kpi__foot">Needs an owner on this desk</span>
        </button>
        <div className="bk-kpi">
          <span className="bk-kpi__label">Active pipeline</span>
          <span className="bk-kpi__value">{stats.live}</span>
          <span className="bk-kpi__foot">Confirmed or paid</span>
        </div>
        <div className="bk-kpi">
          <span className="bk-kpi__label">Open value</span>
          <span className="bk-kpi__value">
            {formatMoney(stats.pipelineValue, bookings[0]?.currency ?? "INR")}
          </span>
          <span className="bk-kpi__foot">Excludes cancelled &amp; done</span>
        </div>
      </div>

      {stats.action > 0 && statusView !== "action" ? (
        <button
          type="button"
          className="bk-attention"
          onClick={() => setStatusView("action")}
        >
          <span className="bk-attention__icon" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v4M12 17h.01M10.3 4.3 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
            </svg>
          </span>
          <span>
            <strong>{stats.action} booking{stats.action === 1 ? "" : "s"} need a reply</strong>
            <span className="block text-xs">Open the needs-action view to clear the queue.</span>
          </span>
          <span className="bk-attention__cta">Show queue</span>
        </button>
      ) : null}

      <div className="bk-views" role="tablist" aria-label="Booking views">
        {views.map((view) => (
          <button
            key={view.id}
            type="button"
            role="tab"
            aria-selected={statusView === view.id}
            className={`bk-view ${statusView === view.id ? "is-active" : ""}`}
            onClick={() => setStatusView(view.id)}
          >
            {view.label}
            <span className="bk-view__count">{view.count}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <label className="relative block w-full lg:max-w-sm">
          <span className="sr-only">Search bookings</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search guest, email, phone, or reference"
            className="!h-10 pr-9"
            autoComplete="off"
          />
        </label>
        {!lockedModule ? (
          <SearchableSelect
            ariaLabel="Filter by service"
            value={moduleFilter}
            onChange={setModuleFilter}
            searchPlaceholder="Search services"
            options={[
              { value: "all", label: "All services" },
              ...modulesPresent.map((module) => ({
                value: module,
                label: moduleLabel(module),
              })),
            ]}
            className="!h-10"
            wrapperClassName="lg:w-44"
          />
        ) : null}
        <SearchableSelect
          ariaLabel="Filter by assignee"
          value={assigneeFilter}
          onChange={setAssigneeFilter}
          searchPlaceholder="Search owners"
          options={[
            { value: "all", label: "All owners" },
            { value: "unassigned", label: "Unassigned" },
            ...assigneesPresent.map((person) => ({
              value: person.id,
              label: person.name,
            })),
          ]}
          className="!h-10"
          wrapperClassName="lg:w-44"
        />
        {filtersActive ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatusView("all");
              setModuleFilter("all");
              setAssigneeFilter("all");
            }}
            className="text-left text-xs font-medium text-brand hover:underline"
          >
            Clear filters
          </button>
        ) : null}
        <p className="text-xs text-muted lg:ml-auto">
          {filtered.length} of {bookings.length}
          {filtersActive ? " match" : ""}
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full min-w-[72rem] border-collapse text-sm">
          <thead className="border-b border-line bg-surface">
            <tr>
              <SortHeader label="Guest" column="guest" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortHeader label="Service" column="service" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortHeader label="Travel" column="start" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <SortHeader label="Status" column="status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th scope="col" className="px-3 py-2.5 text-left">
                <span className="text-xs font-semibold text-navy">Owner</span>
              </th>
              <SortHeader label="Amount" column="amount" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} align="right" />
              <SortHeader label="Received" column="created" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th scope="col" className="px-3 py-2.5 text-right">
                <span className="text-xs font-semibold text-navy">Open</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-sm text-muted">
                  No bookings yet on this desk. Website enquiries will land here.
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-sm text-muted">
                  No bookings match these filters.
                </td>
              </tr>
            ) : (
              filtered.map((booking) => (
                <tr key={booking.id} className="border-b border-line last:border-b-0 hover:bg-surface/80">
                  <td className="px-3 py-2">
                    <Link
                      href={bookingDetailHref(booking.id, booking.module)}
                      className="font-semibold text-navy hover:text-brand hover:underline"
                    >
                      {booking.contactName}
                    </Link>
                    <p className="mt-0.5 text-[11px] text-muted">
                      {booking.contactEmail}
                      {booking.contactPhone ? ` · ${booking.contactPhone}` : ""}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] tracking-wide text-muted">
                      {booking.reference}
                      {booking.hasAccount ? " · account" : " · guest"}
                    </p>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-start gap-2">
                      <ModuleMark module={booking.module} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-navy">{booking.title}</p>
                        <p className="text-[11px] text-muted">
                          {moduleLabel(booking.module)} · {booking.guests}{" "}
                          {booking.guests === 1 ? "guest" : "guests"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-navy">
                    {booking.startDate ? (
                      <>
                        <p className="font-medium">{formatDate(new Date(booking.startDate))}</p>
                        {booking.endDate ? (
                          <p className="text-[11px] text-muted">
                            to {formatDate(new Date(booking.endDate))}
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-muted">Dates TBD</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={booking.status} />
                    {booking.staffNote ? (
                      <p className="mt-0.5 max-w-[12rem] truncate text-[10px] text-muted" title={booking.staffNote}>
                        Note: {booking.staffNote}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-xs text-navy">
                    {booking.assigneeName ?? (
                      <span className="text-amber-700">Unassigned</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right text-sm font-medium tabular-nums text-navy">
                    {booking.amount > 0 ? formatMoney(booking.amount, booking.currency) : "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted">{formatDate(new Date(booking.createdAt))}</td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      href={bookingDetailHref(booking.id, booking.module)}
                      className="inline-flex h-7 items-center rounded-md border border-line bg-white px-2 text-[11px] font-semibold text-navy hover:border-brand/40 hover:text-brand"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
