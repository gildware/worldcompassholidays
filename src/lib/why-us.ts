import { branches, company } from "@/lib/company";

export type WhyUsIconId =
  | "desks"
  | "fleet"
  | "quote"
  | "support"
  | "custom"
  | "company";

export type WhyUsReason = {
  id: WhyUsIconId;
  title: string;
  /** Short line for the homepage grid */
  short: string;
  /** Longer copy for /why-us */
  long: string;
};

export const whyUsProof = [
  {
    figure: "6",
    label: "Branch desks",
    detail: branches.map((b) => b.city).join(", "),
  },
  {
    figure: "3",
    label: "Cities with our fleet",
    detail: "Chandigarh, Bhubaneswar, Andaman",
  },
  {
    figure: "1",
    label: "Written quote first",
    detail: "Nothing is booked until you accept",
  },
  {
    figure: "DMC",
    label: "Company on the board",
    detail: company.legalName,
  },
] as const;

export const whyUsReasons: WhyUsReason[] = [
  {
    id: "desks",
    title: "Desks across India",
    short: "Six offices from the Andaman to Kashmir — not a remote call centre.",
    long: "Bhubaneswar, Chandigarh, the Andaman, Himachal, Kolkata, and Kashmir. Local desks mean someone who knows the roads, seasons, and stays — not a script from another country.",
  },
  {
    id: "fleet",
    title: "Our own cars in three cities",
    short: "Chandigarh, Bhubaneswar, and the Andaman run vehicles we own and send.",
    long: "Where we keep our own fleet, the licence, fuel, and included distance sit on the vehicle page and again in your quote. Elsewhere we still arrange the car and name it before you accept.",
  },
  {
    id: "quote",
    title: "Itemised quote before you pay",
    short: "You see the full cost and approve it before anything is booked.",
    long: "The plan and the price arrive together. Inclusions, extras, and GST are written clearly. You accept the quote first — a room, car, or visa file waits until then.",
  },
  {
    id: "support",
    title: "Help while you travel",
    short: "Call or WhatsApp if roads close, hotels change, or a pickup slips.",
    long: `Ask for ${company.contactName} on ${company.phone}. We answer from India. When weather, traffic, or a stay changes mid-trip, you have one number — not a ticket queue.`,
  },
  {
    id: "custom",
    title: "Built around your dates",
    short: "Pace, budget, and who is travelling shape the plan — not a fixed departure.",
    long: "Family, honeymoon, yatra, or a quiet coast week. We shape routes around your dates and budget instead of squeezing you into a fixed group departure you did not ask for.",
  },
  {
    id: "company",
    title: "A real company on the invoice",
    short: `${company.legalName} — ${company.dmcLine}.`,
    long: `${company.tradeName} is the travel name. ${company.legalName} is the destination management company on the board. Quotes and confirmations carry a clear company identity you can check.`,
  },
];

/** Homepage shows these four; the full page shows all six. */
export const whyUsHomeIds: WhyUsIconId[] = ["desks", "fleet", "quote", "support"];

export const whyUsSteps = [
  {
    number: "01",
    title: "Tell us the trip",
    text: "Place, dates, and who is travelling — form, call, or WhatsApp.",
  },
  {
    number: "02",
    title: "Read the quote",
    text: "Plan and price together. Nothing is held until you accept.",
  },
  {
    number: "03",
    title: "Travel on the confirmation",
    text: "What is included, what is extra, and how cancellations work.",
  },
] as const;

export const whyUsPage = {
  kicker: "Why book with us",
  title: "Local desks, clear quotes, help on the road",
  subtitle: `${company.tradeName} plans tours, stays, and rides across India — with written prices first and people who answer when plans change.`,
  homeTitle: "Why travellers book with us",
  homeSubtitle: "Local desks, our own fleet in three cities, and a quote you accept before anyone is booked.",
  linkLabel: "See why book with us",
} as const;
