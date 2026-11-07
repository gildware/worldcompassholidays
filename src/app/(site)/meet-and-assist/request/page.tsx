import type { Metadata } from "next";
import { headers } from "next/headers";
import { AssistRequestForm, type AssistRequestDefaults } from "@/components/assist/AssistRequestForm";
import { WorldCompassHolidayFrame } from "@/components/worldcompassholiday/WorldCompassHolidayFrame";
import { countryIsoFromHeaders } from "@/lib/auth/countries";
import { getCurrentUser } from "@/lib/auth/session";
import { assistRequestPath, assistServices } from "@/lib/assist";
import { firebaseWebConfig } from "@/lib/firebase/config";
import { findConfiguredAirport, loadAssistAirports } from "@/lib/request-locations";
import { pageMetadata } from "@/lib/seo";
import "@/styles/hotel-request.css";

const pageTitle = "Request Airport Meet & Assist";
const pageDescription =
  "Send the airport, flight number, and party size. We reply within 24 hours with who meets you and the fee. Nothing is booked until you accept the quote.";

export const metadata: Metadata = pageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/meet-and-assist/request",
  image: "/img/assist/assist-arrival.jpg",
  imageAlt: "A greeter holding a name board in the arrivals hall",
});

export default async function AssistRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; airport?: string; airportName?: string }>;
}) {
  const [params, user, airports] = await Promise.all([
    searchParams,
    getCurrentUser(),
    loadAssistAirports(),
  ]);
  const customer = user?.scope === "customer" ? { name: user.name, email: user.email, phone: user.phone } : null;
  const defaultService =
    params.service && (assistServices as readonly string[]).includes(params.service) ? params.service : "";
  const airportCode = (params.airport ?? "").trim().toUpperCase();
  const defaultAirport = findConfiguredAirport(airports, airportCode)?.code ?? "";
  const defaults: AssistRequestDefaults = {
    service: defaultService,
    airport: defaultAirport,
  };
  const returnPath = assistRequestPath({ service: defaults.service, airport: defaults.airport });
  const loginHref = `/login?next=${encodeURIComponent(returnPath)}`;

  return (
    <WorldCompassHolidayFrame className="is-hotel-request">
      <div className="hotel-brief">
        <div className="container hotel-brief-layout is-solo">
          <AssistRequestForm
            customer={customer}
            defaults={defaults}
            airports={airports}
            loginHref={loginHref}
            firebaseConfig={firebaseWebConfig()}
            defaultCountry={countryIsoFromHeaders(await headers())}
          />
        </div>
      </div>
    </WorldCompassHolidayFrame>
  );
}
