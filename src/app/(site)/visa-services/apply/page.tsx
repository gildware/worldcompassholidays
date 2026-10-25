import type { Metadata } from "next";
import Link from "next/link";
import { WorldCompassHolidayFrame } from "@/components/worldcompassholiday/WorldCompassHolidayFrame";
import { VisaRequestForm } from "@/components/visa/VisaRequestForm";
import { getCurrentUser } from "@/lib/auth/session";
import { pageMetadata } from "@/lib/seo";
import { visaTypeLabels } from "@/lib/visa";
import "@/styles/service-desk.css";

const pageTitle = "Apply for visa help";
const pageDescription =
  "Send the destination, passport nationality, and travel dates. We reply within 24 hours with the document list and a quote. The embassy fee stays on its own line, and nothing is filed until you accept.";

export const metadata: Metadata = pageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/visa-services/apply",
  image: "/img/visa/visa-apply-illustration.jpg",
  imageAlt: "Passport, boarding pass, calendar, and a document checklist",
});

function cleanCountry(value: string | undefined) {
  const text = (value ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
  if (!text || /[<>]/.test(text)) return "";
  return text;
}

export default async function VisaApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; ref?: string; country?: string; type?: string }>;
}) {
  const [{ sent, ref, country, type }, user] = await Promise.all([searchParams, getCurrentUser()]);
  const customer =
    user?.scope === "customer"
      ? { name: user.name, email: user.email, phone: user.phone }
      : null;
  const reference = ref && /^BK-[A-Z0-9]+$/.test(ref) ? ref : "";
  const destination = cleanCountry(country);
  const visaType = type && type in visaTypeLabels ? type : "";
  const heading = destination
    ? destination === "Schengen area"
      ? "Apply for the Schengen area visa"
      : `Apply for a ${destination} visa`
    : "Apply for visa help";

  return (
    <WorldCompassHolidayFrame>
      <section className="visa-apply-page pt-40 pb-40">
        <div className="container">
          <p className="text-14">
            <Link className="visa-apply-back" href="/visa-services">
              ‹ Visa help
            </Link>
          </p>
          <h1 className="visa-apply-title">{heading}</h1>
          <p className="visa-apply-lede">
            We reply within 24 hours. You pay nothing until you accept the quote.
          </p>
          <div className="visa-apply-layout">
            <aside className="visa-apply-art">
              <img src="/img/visa/visa-apply-illustration.jpg" alt="Passport, boarding pass, calendar, and a document checklist" />
            </aside>
            <div className="visa-apply-card">
              <VisaRequestForm
                sent={sent === "1"}
                reference={reference}
                customer={customer}
                defaultCountry={destination}
                defaultVisaType={visaType}
              />
            </div>
          </div>
        </div>
      </section>
    </WorldCompassHolidayFrame>
  );
}
