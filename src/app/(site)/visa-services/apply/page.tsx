import type { Metadata } from "next";
import { headers } from "next/headers";
import { WorldCompassHolidayFrame } from "@/components/worldcompassholiday/WorldCompassHolidayFrame";
import { VisaRequestForm, type VisaRequestDefaults } from "@/components/visa/VisaRequestForm";
import { countryIsoFromHeaders } from "@/lib/auth/countries";
import { getCurrentUser } from "@/lib/auth/session";
import { firebaseWebConfig } from "@/lib/firebase/config";
import { loadVisaDestinations } from "@/lib/request-locations";
import { pageMetadata } from "@/lib/seo";
import { visaApplyPath, visaTypeLabels } from "@/lib/visa";
import "@/styles/hotel-request.css";

const pageTitle = "Apply for Visa Assistance";
const pageDescription =
  "Send the destination, passport nationality, and travel dates. We reply within 24 hours with the document list and a quote. Embassy fees stay separate — nothing is filed until you accept.";

export const metadata: Metadata = pageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/visa-services/apply",
  image: "/img/visa/visa-apply-illustration.jpg",
  imageAlt: "Passport, boarding pass, calendar, and a document checklist",
  keywords: ["visa application help", "visa documents India", "apply visa assistance"],
});

function cleanCountry(value: string | undefined) {
  const text = (value ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
  if (!text || /[<>]/.test(text)) return "";
  return text;
}

export default async function VisaApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; type?: string; nationality?: string }>;
}) {
  const [params, user, destinations] = await Promise.all([
    searchParams,
    getCurrentUser(),
    loadVisaDestinations(),
  ]);
  const customer =
    user?.scope === "customer"
      ? { name: user.name, email: user.email, phone: user.phone }
      : null;
  const requestedCountry = cleanCountry(params.country);
  const matchedCountry =
    destinations.find((item) => item.name.toLowerCase() === requestedCountry.toLowerCase())?.name ||
    "";
  const defaults: VisaRequestDefaults = {
    country: matchedCountry,
    visaType: params.type && params.type in visaTypeLabels ? params.type : "",
    nationality: cleanCountry(params.nationality) || "India",
  };
  const returnPath = visaApplyPath({ country: defaults.country, visaType: defaults.visaType });
  const loginHref = `/login?next=${encodeURIComponent(returnPath)}`;

  return (
    <WorldCompassHolidayFrame className="is-hotel-request">
      <div className="hotel-brief">
        <div className="container hotel-brief-layout is-solo">
          <VisaRequestForm
            customer={customer}
            defaults={defaults}
            destinations={destinations}
            loginHref={loginHref}
            firebaseConfig={firebaseWebConfig()}
            defaultCountry={countryIsoFromHeaders(await headers())}
          />
        </div>
      </div>
    </WorldCompassHolidayFrame>
  );
}
