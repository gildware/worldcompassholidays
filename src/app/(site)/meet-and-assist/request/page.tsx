import type { Metadata } from "next";
import Link from "next/link";
import { AssistRequestForm } from "@/components/assist/AssistRequestForm";
import { WorldCompassHolidayFrame } from "@/components/worldcompassholiday/WorldCompassHolidayFrame";
import { getCurrentUser } from "@/lib/auth/session";
import { assistServices, type AssistService } from "@/lib/assist";
import { findAirport } from "@/lib/data/airports";
import { pageMetadata } from "@/lib/seo";
import "@/styles/assist-desk.css";

const pageTitle = "Request a greeter";
const pageDescription =
  "Send the airport, the flight number, and how many people. We reply within 24 hours with who meets you and the fee. Nothing is booked until you accept the quote.";

export const metadata: Metadata = pageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/meet-and-assist/request",
  image: "/img/assist/assist-arrival.jpg",
  imageAlt: "A greeter holding a name board in the arrivals hall",
});

const headings: Record<AssistService, string> = {
  arrival: "Request an arrival greeter",
  departure: "Request a departure greeter",
  transit: "Request a connection greeter",
  round: "Request a greeter both ways",
};

export default async function AssistRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; ref?: string; service?: string; airport?: string }>;
}) {
  const [{ sent, ref, service, airport }, user] = await Promise.all([searchParams, getCurrentUser()]);
  const customer = user?.scope === "customer" ? { name: user.name, email: user.email, phone: user.phone } : null;
  const reference = ref && /^BK-[A-Z0-9]+$/.test(ref) ? ref : "";
  const defaultService = service && (assistServices as readonly string[]).includes(service) ? service : "";
  const airportCode = (airport ?? "").trim().toUpperCase();
  const defaultAirport = airportCode === "OTHER" || findAirport(airportCode) ? (airportCode === "OTHER" ? "other" : airportCode) : "";
  const heading = defaultService ? headings[defaultService as AssistService] : "Request a greeter";

  return (
    <WorldCompassHolidayFrame>
      <section className="assist-request-page pt-40 pb-40">
        <div className="container">
          <p className="text-14">
            <Link className="assist-request-back" href="/meet-and-assist">
              ‹ Meet and assist
            </Link>
          </p>
          <h1 className="assist-request-title">{heading}</h1>
          <p className="assist-request-lede">
            We reply within 24 hours. You pay nothing until you accept the quote.
          </p>
          <div className="assist-request-layout">
            <aside className="assist-request-art">
              <img src="/img/assist/assist-arrival.jpg" alt="A greeter holding a name board in the arrivals hall" />
            </aside>
            <div className="assist-request-card">
              <AssistRequestForm
                sent={sent === "1"}
                reference={reference}
                customer={customer}
                defaultService={defaultService}
                defaultAirport={defaultAirport}
              />
            </div>
          </div>
        </div>
      </section>
    </WorldCompassHolidayFrame>
  );
}
