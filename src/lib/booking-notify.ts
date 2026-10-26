import { moduleLabel, statusLabel } from "@/lib/bookings";
import { sendMail } from "@/lib/mail";
import { rentalStatusLabel } from "@/lib/rentals/labels";
import { theme } from "@/config/theme";
import { getSiteSettings } from "@/lib/brand";

function siteOrigin() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

async function wrapHtml(title: string, body: string) {
  const settings = await getSiteSettings();
  return `<!doctype html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#0f172a">
  <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#64748b">${theme.brandName}</p>
  <h1 style="font-size:20px;margin:8px 0 16px">${title}</h1>
  ${body}
  <p style="margin-top:24px;font-size:13px;color:#64748b">Questions? ${settings.email} · ${settings.phone}</p>
</body></html>`;
}

export async function notifyEnquiryStatusChange(input: {
  contactName: string;
  contactEmail: string;
  reference: string;
  title: string;
  module: string;
  status: string;
  previousStatus?: string;
  amount?: number;
  currency?: string;
  hasAccount?: boolean;
}) {
  const status = statusLabel(input.status);
  const service = moduleLabel(input.module);
  const accountUrl = `${siteOrigin()}/account/bookings/${input.reference}`;
  const subject = `${input.reference}: ${service} is now ${status}`;
  const amountLine =
    input.amount && input.amount > 0
      ? `\nQuoted amount: ${input.currency ?? "INR"} ${input.amount.toLocaleString("en-IN")}`
      : "";
  const text = [
    `Hi ${input.contactName || "there"},`,
    "",
    `Your ${service.toLowerCase()} request ${input.reference} (${input.title}) is now marked ${status}.`,
    input.previousStatus
      ? `Previous status: ${statusLabel(input.previousStatus)}.`
      : "",
    amountLine.trim(),
    input.hasAccount
      ? `\nView it in your account:\n${accountUrl}`
      : `\nReply to this email if you have questions.`,
    "",
    `— ${theme.brandName}`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = await wrapHtml(
    `${input.reference} · ${status}`,
    `<p>Hi ${escapeHtml(input.contactName || "there")},</p>
     <p>Your <strong>${escapeHtml(service.toLowerCase())}</strong> request
     <strong>${escapeHtml(input.reference)}</strong> (${escapeHtml(input.title)}) is now
     <strong>${escapeHtml(status)}</strong>.</p>
     ${
       input.amount && input.amount > 0
         ? `<p>Quoted amount: <strong>${escapeHtml(input.currency ?? "INR")} ${input.amount.toLocaleString("en-IN")}</strong></p>`
         : ""
     }
     ${
       input.hasAccount
         ? `<p><a href="${accountUrl}">Open this booking in your account</a></p>`
         : `<p>Reply to this email if you have questions.</p>`
     }`,
  );

  return sendMail({ to: input.contactEmail, subject, text, html });
}

export async function notifyRentalStatusChange(input: {
  contactName: string;
  contactEmail: string;
  reference: string;
  vehicleName: string;
  status: string;
  previousStatus?: string;
  kind?: string;
}) {
  const status = rentalStatusLabel(input.status);
  const accountUrl = `${siteOrigin()}/account/rentals/${input.reference}`;
  const subject = `${input.reference}: rental is now ${status}`;
  const text = [
    `Hi ${input.contactName || "there"},`,
    "",
    `Your rental ${input.reference} for ${input.vehicleName} is now ${status}.`,
    input.previousStatus
      ? `Previous status: ${rentalStatusLabel(input.previousStatus)}.`
      : "",
    "",
    `View booking:\n${accountUrl}`,
    "",
    `— ${theme.brandName}`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = await wrapHtml(
    `${input.reference} · ${status}`,
    `<p>Hi ${escapeHtml(input.contactName || "there")},</p>
     <p>Your rental <strong>${escapeHtml(input.reference)}</strong> for
     <strong>${escapeHtml(input.vehicleName)}</strong> is now
     <strong>${escapeHtml(status)}</strong>.</p>
     <p><a href="${accountUrl}">Open this rental in your account</a></p>`,
  );

  return sendMail({ to: input.contactEmail, subject, text, html });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
