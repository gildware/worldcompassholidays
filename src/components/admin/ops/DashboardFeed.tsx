import Link from "next/link";
import type { DashboardFeedRow } from "@/lib/admin-dashboard";
import { formatDate } from "@/lib/format";

function statusClass(status: string) {
  switch (status) {
    case "confirmed":
    case "paid":
    case "completed":
    case "active":
    case "returned":
    case "review":
    case "closed":
      return "st-confirmed";
    case "quoted":
    case "under_review":
    case "documents_under_review":
      return "st-deposit";
    case "enquiry":
    case "pending":
    case "documents_required":
      return "st-pending";
    case "cancelled":
      return "st-cancelled";
    default:
      return "st-pending";
  }
}

export function DashboardFeed({
  title,
  description,
  href,
  linkLabel,
  rows,
  empty,
}: {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  rows: DashboardFeedRow[];
  empty: string;
}) {
  return (
    <article className="card card-pad">
      <div className="card-h">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <Link className="linkish" href={href}>
          {linkLabel}
        </Link>
      </div>
      {rows.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 13 }}>{empty}</p>
      ) : (
        <div className="dept-list">
          {rows.map((row) => (
            <Link key={`${row.href}-${row.id}`} href={row.href} className="dept">
              <div className="date-box">
                <b>{String(row.createdAt.getDate()).padStart(2, "0")}</b>
                <span>
                  {row.createdAt.toLocaleString("en-IN", { month: "short" }).toUpperCase()}
                </span>
              </div>
              <div>
                <h3>{row.contactName}</h3>
                <p>
                  {row.title}
                  {row.subtitle ? ` · ${row.subtitle}` : ""}
                </p>
              </div>
              <div className="load">
                <strong>
                  <span className={`status ${statusClass(row.status)}`}>{row.statusLabel}</span>
                </strong>
                {formatDate(row.createdAt)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
