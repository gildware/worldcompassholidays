import { whatsAppHref } from "@/lib/visa";

export { whatsAppHref };

export const assistServices = ["arrival", "departure", "transit", "round"] as const;
export type AssistService = (typeof assistServices)[number];

export const assistServiceLabels: Record<AssistService, string> = {
  arrival: "Arrival",
  departure: "Departure",
  transit: "Transit connection",
  round: "Arrival and departure",
};

export const assistExtras = ["board", "immigration", "baggage", "wheelchair", "lounge", "transfer"] as const;
export type AssistExtra = (typeof assistExtras)[number];

export const assistExtraLabels: Record<AssistExtra, string> = {
  board: "Name on a board",
  immigration: "Immigration guidance",
  baggage: "Baggage help",
  wheelchair: "Wheelchair",
  lounge: "Airport lounge",
  transfer: "Ride to the hotel",
};

export type AssistDetails = {
  service: string;
  airportCode: string;
  airportName: string;
  city: string;
  flightNumber: string;
  flightTime: string;
  returnFlight: string;
  returnTime: string;
  extras: string[];
  staffNote: string;
  channel: string;
};

export function assistServiceLabel(value: string) {
  return assistServiceLabels[value as AssistService] ?? (value || "Not set");
}

export function assistRequestPath(input?: { service?: string; airport?: string }) {
  const params = new URLSearchParams();
  const service = input?.service?.trim();
  const airport = input?.airport?.trim().toUpperCase();
  if (service && (assistServices as readonly string[]).includes(service)) params.set("service", service);
  if (airport && (/^[A-Z]{3}$/.test(airport) || airport === "OTHER")) params.set("airport", airport === "OTHER" ? "other" : airport);
  const query = params.toString();
  return query ? `/meet-and-assist/request?${query}` : "/meet-and-assist/request";
}

export function assistExtraLabel(value: string) {
  return assistExtraLabels[value as AssistExtra] ?? value;
}

export function readAssistDetails(raw: string): AssistDetails {
  const empty: AssistDetails = {
    service: "",
    airportCode: "",
    airportName: "",
    city: "",
    flightNumber: "",
    flightTime: "",
    returnFlight: "",
    returnTime: "",
    extras: [],
    staffNote: "",
    channel: "",
  };
  try {
    const data = JSON.parse(raw) as Partial<AssistDetails>;
    return {
      service: typeof data.service === "string" ? data.service : "",
      airportCode: typeof data.airportCode === "string" ? data.airportCode : "",
      airportName: typeof data.airportName === "string" ? data.airportName : "",
      city: typeof data.city === "string" ? data.city : "",
      flightNumber: typeof data.flightNumber === "string" ? data.flightNumber : "",
      flightTime: typeof data.flightTime === "string" ? data.flightTime : "",
      returnFlight: typeof data.returnFlight === "string" ? data.returnFlight : "",
      returnTime: typeof data.returnTime === "string" ? data.returnTime : "",
      extras: Array.isArray(data.extras) ? data.extras.filter((item) => typeof item === "string") : [],
      staffNote: typeof data.staffNote === "string" ? data.staffNote : "",
      channel: typeof data.channel === "string" ? data.channel : "",
    };
  } catch {
    return empty;
  }
}

export function assistWhatsAppText(input: {
  reference: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  airport: string;
  flightNumber: string;
  flightDate: string;
  flightTime: string;
  returnFlight: string;
  returnDate: string;
  returnTime: string;
  travellers: number;
  extras: string[];
  message: string;
}) {
  const lines = [
    `Meet and assist request ${input.reference}`,
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone}`,
    `Service: ${assistServiceLabel(input.service)}`,
    `Airport: ${input.airport}`,
    `Flight: ${input.flightNumber} on ${input.flightDate} at ${input.flightTime}`,
  ];
  if (input.service === "round") {
    lines.push(`Return flight: ${input.returnFlight} on ${input.returnDate} at ${input.returnTime}`);
  }
  lines.push(`Travellers: ${input.travellers}`);
  if (input.extras.length) {
    lines.push(`Help wanted: ${input.extras.map(assistExtraLabel).join(", ")}`);
  }
  if (input.message) lines.push(`Note: ${input.message}`);
  return lines.join("\n");
}
