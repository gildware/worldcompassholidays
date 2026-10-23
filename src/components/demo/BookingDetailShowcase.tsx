"use client";

import { Outfit, Fraunces } from "next/font/google";
import { useMemo, useState } from "react";
import "./booking-detail-showcase.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bd-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-bd-display",
  display: "swap",
});

type Tone = "ok" | "warn" | "info";

type DemoBooking = {
  key: string;
  label: string;
  benchmarks: string[];
  beats: string[];
  media: string;
  mediaLabel: string;
  title: string;
  reference: string;
  status: string;
  tone: Tone;
  journey: {
    fromLabel: string;
    fromValue: string;
    fromSub: string;
    toLabel: string;
    toValue: string;
    toSub: string;
  };
  facts: { label: string; value: string }[];
  timeline: { label: string; when: string; done: boolean }[];
  money: {
    totalLabel: string;
    total: string;
    sub: string;
    lines: { label: string; value: string }[];
  };
  guest: { name: string; meta: string };
  primaryCta: string;
  secondaryCta: string;
  note: string;
};

const demos: DemoBooking[] = [
  {
    key: "tour",
    label: "Tour",
    benchmarks: [
      "Viator / GetYourGuide: voucher + operator contact + reschedule",
      "Baymard tours research: meeting point and inclusions near status",
    ],
    beats: [
      "Journey rail instead of stacked date fields",
      "Ops timeline + guest money in one composition (not a card dump)",
      "Primary action matches pipeline stage (issue voucher)",
    ],
    media: "/img/tours/header-bg.jpg",
    mediaLabel: "Tour · Kashmir",
    title: "Kashmir Valley trek",
    reference: "BK-TOUR-88421",
    status: "Confirmed",
    tone: "ok",
    journey: {
      fromLabel: "Starts",
      fromValue: "18 Nov 2026",
      fromSub: "Srinagar meet · 08:00",
      toLabel: "Ends",
      toValue: "23 Nov 2026",
      toSub: "6 days · private group",
    },
    facts: [
      { label: "Guests", value: "3 adults" },
      { label: "Guide language", value: "English" },
      { label: "Meeting point", value: "Dal Lake jetty gate 2" },
      { label: "Difficulty", value: "Moderate" },
    ],
    timeline: [
      { label: "Enquiry received", when: "21 Oct · 16:43", done: true },
      { label: "Quote sent to guest", when: "21 Oct · 18:10", done: true },
      { label: "Guest confirmed", when: "22 Oct · 09:02", done: true },
      { label: "Deposit marked paid", when: "22 Oct · 11:40", done: true },
      { label: "Voucher ready to issue", when: "Next step", done: false },
    ],
    money: {
      totalLabel: "Trip total",
      total: "₹1,29,182",
      sub: "Includes private guide · excludes flights",
      lines: [
        { label: "Package", value: "₹1,18,500" },
        { label: "Single rooms", value: "₹8,200" },
        { label: "Taxes", value: "₹2,482" },
        { label: "Paid", value: "₹40,000" },
        { label: "Balance due", value: "₹89,182" },
      ],
    },
    guest: {
      name: "Meera Shah",
      meta: "meera@example.com · +91 98xxx 44120 · linked account",
    },
    primaryCta: "Issue voucher & notify guest",
    secondaryCta: "Message guest",
    note: "Beat GetYourGuide: voucher action sits with money and timeline — not buried under tabs.",
  },
  {
    key: "hotel",
    label: "Hotel",
    benchmarks: [
      "Airbnb trip details: confirmation code + safety + manage trip",
      "Booking.com: dates, property, cancellation, payment status first",
      "Baymard 2024 accommodations: clear post-booking manage path",
    ],
    beats: [
      "Night strip as visual stay (not a form table)",
      "Cancellation policy beside money — trust without clutter",
      "One primary: send check-in instructions",
    ],
    media: "/img/stays/1/1.png",
    mediaLabel: "Stay · Srinagar",
    title: "Houseboat stay on Dal Lake",
    reference: "BK-HOTEL-22901",
    status: "Quoted",
    tone: "info",
    journey: {
      fromLabel: "Check-in",
      fromValue: "12 Dec 2026",
      fromSub: "From 14:00 · 1 room",
      toLabel: "Check-out",
      toValue: "14 Dec 2026",
      toSub: "2 nights · 2 guests",
    },
    facts: [
      { label: "Property", value: "Sukoon Houseboat" },
      { label: "Room", value: "Lake-view suite" },
      { label: "Board", value: "Breakfast included" },
      { label: "Cancel by", value: "5 Dec · free" },
    ],
    timeline: [
      { label: "Stay request received", when: "3 Oct · 11:23", done: true },
      { label: "Availability checked", when: "3 Oct · 14:00", done: true },
      { label: "Quote shared with guest", when: "Today · 13:58", done: true },
      { label: "Awaiting guest acceptance", when: "Next step", done: false },
    ],
    money: {
      totalLabel: "Quoted stay",
      total: "₹18,000",
      sub: "Free cancellation until 5 Dec",
      lines: [
        { label: "2 nights", value: "₹15,000" },
        { label: "Taxes & fees", value: "₹3,000" },
        { label: "Deposit required", value: "₹5,000" },
      ],
    },
    guest: {
      name: "Kiran Customer",
      meta: "customer@travel.test · linked account",
    },
    primaryCta: "Send quote to guest",
    secondaryCta: "Revise rate",
    note: "Beat Airbnb: policy + balance sit in the money rail so guests never hunt for “can I cancel?”",
  },
  {
    key: "car",
    label: "Car",
    benchmarks: [
      "Turo: vehicle hero, protection, host messaging, confirmation",
      "Hertz: reservation number + pickup instructions + modify path",
      "Bay Nine rental kit: total always visible; deposit separate",
    ],
    beats: [
      "Key-tag style reference + pickup bay as the loudest ops signal",
      "Deposit never mixed into rental total",
      "Docs gate shown before Confirm (market often hides the block)",
    ],
    media: "/img/cars/1.png",
    mediaLabel: "Car · Calangute",
    title: "Hyundai Grand i10",
    reference: "RN-CAR-55012",
    status: "Documents under review",
    tone: "warn",
    journey: {
      fromLabel: "Pickup",
      fromValue: "23 Oct · 13:50",
      fromSub: "Calangute counter",
      toLabel: "Return",
      toValue: "31 Oct · 13:50",
      toSub: "8 days · self drive",
    },
    facts: [
      { label: "Registration", value: "JK 05 104C" },
      { label: "Included km", value: "200 / day" },
      { label: "Docs", value: "3 pending verify" },
      { label: "Fuel policy", value: "Same-to-same" },
    ],
    timeline: [
      { label: "Booking requested", when: "21 Oct · 13:50", done: true },
      { label: "Documents uploaded", when: "21 Oct · 14:22", done: true },
      { label: "Verify licence & ID", when: "Next step", done: false },
      { label: "Confirm & ready for pickup", when: "Waiting", done: false },
    ],
    money: {
      totalLabel: "Rental due",
      total: "₹12,000",
      sub: "Security deposit ₹5,000 held separately",
      lines: [
        { label: "8 days rental", value: "₹12,000" },
        { label: "Add-ons", value: "₹0" },
        { label: "Deposit (hold)", value: "₹5,000" },
        { label: "Paid so far", value: "₹0" },
      ],
    },
    guest: {
      name: "Kamran",
      meta: "916505550102 · DL uploaded · expires 21 Oct 2026",
    },
    primaryCta: "Verify all documents",
    secondaryCta: "Open pickup map",
    note: "Beat Hertz/Turo ops pages: the next blocker (documents) is the primary CTA, not a buried form.",
  },
  {
    key: "bike",
    label: "Bike",
    benchmarks: [
      "Same rental DNA as Turo/Hertz, lighter for two-wheel",
      "Local operators: helmet + licence front and center",
    ],
    beats: [
      "Helmet & licence as first-class facts",
      "Shorter journey copy for day-trip energy",
      "Same money honesty as cars (deposit split)",
    ],
    media: "/img/rentals/1.png",
    mediaLabel: "Bike · Calangute",
    title: "Honda Dio",
    reference: "RN-BIKE-88201",
    status: "Ready for pickup",
    tone: "ok",
    journey: {
      fromLabel: "Pickup",
      fromValue: "24 Oct · 10:00",
      fromSub: "Calangute · helmet included",
      toLabel: "Return",
      toValue: "26 Oct · 10:00",
      toSub: "2 days",
    },
    facts: [
      { label: "Registration", value: "GA 03 K 4412" },
      { label: "Helmets", value: "2 included" },
      { label: "Licence", value: "Verified" },
      { label: "Fuel", value: "Full tank out" },
    ],
    timeline: [
      { label: "Booking confirmed", when: "22 Oct", done: true },
      { label: "Documents verified", when: "22 Oct", done: true },
      { label: "Bike staged for bay B3", when: "Today", done: true },
      { label: "Handover to guest", when: "Tomorrow 10:00", done: false },
    ],
    money: {
      totalLabel: "Rental due",
      total: "₹3,600",
      sub: "Deposit ₹2,000 · refundable on return",
      lines: [
        { label: "2 days", value: "₹3,600" },
        { label: "Deposit hold", value: "₹2,000" },
        { label: "Paid", value: "₹3,600" },
      ],
    },
    guest: {
      name: "Kamran",
      meta: "Licence verified · WhatsApp preferred",
    },
    primaryCta: "Start rental (handover)",
    secondaryCta: "Print handover sheet",
    note: "Beat generic rental UIs: bay + helmet readiness is the story, not a status dropdown.",
  },
  {
    key: "visa",
    label: "Visa",
    benchmarks: [
      "Consular / agency tools: document checklist + appointment slots",
      "Rarely designed well — usually forms with no journey",
    ],
    beats: [
      "Country as the hero visual language",
      "Checklist timeline (passport → file → decision)",
      "Fee clarity separate from embassy fees",
    ],
    media: "/img/visa/visa-tourist.jpg",
    mediaLabel: "Visa · Japan",
    title: "Tourist visa · Japan",
    reference: "BK-VISA-44102",
    status: "Quoted",
    tone: "info",
    journey: {
      fromLabel: "Travel from",
      fromValue: "12 Jan 2027",
      fromSub: "India passport",
      toLabel: "Return",
      toValue: "26 Jan 2027",
      toSub: "3 travellers · 1 child",
    },
    facts: [
      { label: "Nationality", value: "Indian" },
      { label: "Type", value: "Tourist" },
      { label: "Embassy fee", value: "Guest pays direct" },
      { label: "Our service", value: "₹3,500 / file" },
    ],
    timeline: [
      { label: "Request received", when: "16 Oct", done: true },
      { label: "Service fee quoted", when: "16 Oct", done: true },
      { label: "Collect passport scans", when: "Next step", done: false },
      { label: "File submission", when: "Waiting", done: false },
    ],
    money: {
      totalLabel: "Service fee",
      total: "₹10,500",
      sub: "3 files × ₹3,500 · embassy fees excluded",
      lines: [
        { label: "Adult files ×2", value: "₹7,000" },
        { label: "Child file ×1", value: "₹3,500" },
        { label: "Paid", value: "₹0" },
      ],
    },
    guest: {
      name: "Ravi Mehta",
      meta: "Family of 3 · first Japan trip · call tomorrow",
    },
    primaryCta: "Request passport scans",
    secondaryCta: "Send fee invoice",
    note: "Beat form-only visa desks: the next document ask is the CTA, not another status select.",
  },
  {
    key: "assist",
    label: "Meet & assist",
    benchmarks: [
      "Airport concierge products: flight number + terminal + meeting point",
      "Usually SMS-only — weak visual certainty",
    ],
    beats: [
      "Flight + terminal as the journey endpoints",
      "Agent assignment visible next to guest",
      "Signboard name as the trust detail",
    ],
    media: "/img/assist/assist-arrival.jpg",
    mediaLabel: "Assist · DEL T3",
    title: "Arrival meet · Indira Gandhi T3",
    reference: "BK-ASSIST-1008",
    status: "Confirmed",
    tone: "ok",
    journey: {
      fromLabel: "Flight in",
      fromValue: "AI 101",
      fromSub: "2 Nov · 14:40 · T3",
      toLabel: "Hand-off",
      toValue: "Arrivals hall",
      toSub: "Name board · Meera Shah",
    },
    facts: [
      { label: "Service", value: "Arrival meet" },
      { label: "Travellers", value: "2 adults" },
      { label: "Extras", value: "Porter help" },
      { label: "Agent", value: "Unassigned" },
    ],
    timeline: [
      { label: "Request received", when: "20 Oct", done: true },
      { label: "Flight details confirmed", when: "21 Oct", done: true },
      { label: "Assign airport agent", when: "Next step", done: false },
      { label: "Agent on stand", when: "2 Nov 14:10", done: false },
    ],
    money: {
      totalLabel: "Service total",
      total: "₹4,800",
      sub: "Includes name board · porter billed if used",
      lines: [
        { label: "Arrival assist", value: "₹3,500" },
        { label: "Porter add-on", value: "₹1,300" },
        { label: "Paid", value: "₹4,800" },
      ],
    },
    guest: {
      name: "Meera Shah",
      meta: "Sign board: MEERA SHAH · WhatsApp on landing",
    },
    primaryCta: "Assign airport agent",
    secondaryCta: "Share flight live link",
    note: "Beat SMS-only assist ops: flight identity is the hero, agent assignment is the primary CTA.",
  },
];

export function BookingDetailShowcase() {
  const [active, setActive] = useState(demos[0].key);
  const demo = useMemo(
    () => demos.find((item) => item.key === active) ?? demos[0],
    [active],
  );

  return (
    <div
      className={`bd-demo ${outfit.variable} ${fraunces.variable} ${outfit.className}`}
      style={
        {
          ["--bd-sans" as string]: "var(--font-bd-sans), system-ui, sans-serif",
          ["--bd-display" as string]: "var(--font-bd-display), Georgia, serif",
        } as React.CSSProperties
      }
    >
      <div className="bd-demo__shell">
        <header className="bd-demo__intro">
          <p className="bd-demo__kicker">Demo · not live data</p>
          <h1>Booking detail — better than the market defaults</h1>
          <p>
            Studied Airbnb, Booking.com, Viator, GetYourGuide, Turo, and Hertz post-booking
            patterns. Switch types below — each layout keeps one composition, a journey rail,
            honest money, and a stage-aware primary action.
          </p>
        </header>

        <div className="bd-demo__tabs" role="tablist" aria-label="Booking type">
          {demos.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              className="bd-demo__tab"
              aria-selected={item.key === active}
              onClick={() => setActive(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="bd-demo__bench">
          <strong>Market we measured → how this beats it</strong>
          <ul>
            {demo.benchmarks.map((line) => (
              <li key={line}>{line}</li>
            ))}
            {demo.beats.map((line) => (
              <li key={line}>
                <span>Better:</span> {line}
              </li>
            ))}
          </ul>
        </div>

        <article className="bd-detail" aria-label={`${demo.label} booking detail demo`}>
          <div
            className="bd-detail__media"
            style={{ backgroundImage: `url(${demo.media})` }}
            role="img"
            aria-label={demo.mediaLabel}
          >
            <div className="bd-detail__media-caption">
              <p>{demo.mediaLabel}</p>
              <h2>{demo.title}</h2>
            </div>
          </div>

          <div className="bd-detail__body">
            <div className="bd-detail__main">
              <div className="bd-detail__id">
                <span className="bd-detail__ref">{demo.reference}</span>
                <span className={`bd-pill bd-pill--${demo.tone}`}>{demo.status}</span>
              </div>

              <div className="bd-journey" aria-label="Trip journey">
                <div className="bd-journey__point">
                  <strong>{demo.journey.fromLabel}</strong>
                  <p>{demo.journey.fromValue}</p>
                  <small>{demo.journey.fromSub}</small>
                </div>
                <div className="bd-journey__rail" aria-hidden />
                <div className="bd-journey__point" style={{ textAlign: "right" }}>
                  <strong>{demo.journey.toLabel}</strong>
                  <p>{demo.journey.toValue}</p>
                  <small>{demo.journey.toSub}</small>
                </div>
              </div>

              <dl className="bd-facts">
                {demo.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>

              <section className="bd-section">
                <h3>Pipeline</h3>
                <ol className="bd-timeline">
                  {demo.timeline.map((item) => (
                    <li key={item.label} data-done={item.done}>
                      <span className="bd-timeline__dot" aria-hidden />
                      <div>
                        <p>{item.label}</p>
                        <small>{item.when}</small>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            <aside className="bd-detail__aside">
              <div className="bd-money">
                <p className="bd-money__label">{demo.money.totalLabel}</p>
                <p className="bd-money__total">{demo.money.total}</p>
                <p className="bd-money__sub">{demo.money.sub}</p>
                <ul>
                  {demo.money.lines.map((line) => (
                    <li key={line.label}>
                      <span>{line.label}</span>
                      <span>{line.value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bd-guest">
                <p>{demo.guest.name}</p>
                <small>{demo.guest.meta}</small>
              </div>

              <div className="bd-cta">
                <button type="button" className="bd-cta__primary">
                  {demo.primaryCta}
                </button>
                <button type="button" className="bd-cta__secondary">
                  {demo.secondaryCta}
                </button>
              </div>

              <p className="bd-note">{demo.note}</p>
            </aside>
          </div>
        </article>

        <p className="bd-demo__footer">
          This is a design demo only. When you approve a direction, we replace the live admin
          and account booking detail pages with this system — per type. Open{" "}
          <a href="/demo/booking-details">/demo/booking-details</a> anytime.
        </p>
      </div>
    </div>
  );
}
