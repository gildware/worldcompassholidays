import type { Metadata } from "next";
import { ServiceRequestForm, type ServiceKind } from "@/components/service-request/ServiceRequestForm";
import { WorldCompassHolidayFrame } from "@/components/worldcompassholiday/WorldCompassHolidayFrame";
import { getCurrentUser } from "@/lib/auth/session";
import { pageMetadata } from "@/lib/seo";
import "@/styles/hotel-request.css";

const titles: Record<ServiceKind, { title: string; description: string; path: string }> = {
  tour: {
    title: "Request a tour",
    description: "Can't find the tour you want? Send the place, the date, and what you need. Nothing is booked until you accept it.",
    path: "/tours/request",
  },
  car: {
    title: "Request a car",
    description: "Can't find the car you want? Send the city, the dates, and what you need. Nothing is booked until you accept it.",
    path: "/rentals/cars/request",
  },
  bike: {
    title: "Request a bike",
    description: "Can't find the bike you want? Send the city, the dates, and what you need. Nothing is booked until you accept it.",
    path: "/rentals/bikes/request",
  },
};

export function serviceRequestMetadata(kind: ServiceKind): Metadata {
  const page = titles[kind];
  return pageMetadata({ title: page.title, description: page.description, path: page.path });
}

function dateParam(value: string | undefined) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function countParam(value: string | undefined, fallback: string) {
  return value && /^\d{1,2}$/.test(value) ? value : fallback;
}

export async function ServiceRequestPage({
  kind,
  searchParams,
}: {
  kind: ServiceKind;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [params, user] = await Promise.all([searchParams, getCurrentUser()]);
  const customer = user?.scope === "customer" ? { name: user.name, email: user.email, phone: user.phone } : null;
  const defaults = {
    destination: (params.destination ?? "").slice(0, 120),
    itemName: (params.itemName ?? "").slice(0, 120),
    start: dateParam(params.start),
    end: dateParam(params.end),
    adults: countParam(params.adults, "2"),
    children: countParam(params.children, "0"),
    message: (params.message ?? "").slice(0, 500),
  };
  const nextQuery = new URLSearchParams();
  for (const [key, value] of Object.entries(defaults)) {
    if (value && !(key === "adults" && !params.adults) && !(key === "children" && !params.children)) nextQuery.set(key, value);
  }
  const path = titles[kind].path;
  const returnPath = nextQuery.size ? `${path}?${nextQuery}` : path;
  const loginHref = `/login?next=${encodeURIComponent(returnPath)}`;

  return (
    <WorldCompassHolidayFrame>
      <div className="hotel-brief">
        <div className="container hotel-brief-layout is-solo">
          <ServiceRequestForm kind={kind} customer={customer} defaults={defaults} loginHref={loginHref} />
        </div>
      </div>
    </WorldCompassHolidayFrame>
  );
}
