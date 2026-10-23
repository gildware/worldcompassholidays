"use client";

import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { useMemo, useState } from "react";
import "./admin-booking-desk.css";

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ad-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ad-mono",
  display: "swap",
});

type Tone = "ok" | "warn" | "info" | "mute";

type DeskDemo = {
  key: string;
  label: string;
  badge?: number;
  market: string;
  beat: string;
  thumb: string;
  reference: string;
  title: string;
  sub: string;
  status: string;
  tone: Tone;
  sla?: string;
  owner: string;
  ownerHint: string;
  journey: {
    fromLabel: string;
    fromValue: string;
    fromSub: string;
    toLabel: string;
    toValue: string;
    toSub: string;
  };
  facts: { label: string; value: string }[];
  guest: { name: string; email: string; phone: string };
  timeline: { label: string; when: string; done: boolean }[];
  money: {
    label: string;
    total: string;
    sub: string;
    lines: { label: string; value: string }[];
  };
  nextHint: string;
  primary: string;
  secondary: string;
  tertiary: string;
  staffNote: string;
};

const desks: DeskDemo[] = [
  {
    key: "tour",
    label: "Tours",
    badge: 2,
    market: "Viator Agent / GetYourGuide Partner: Manage booking → voucher, reschedule, operator contact under menus.",
    beat: "Ops desk: stage CTA + owner + staff note + guest contact in one sticky rail — no kebab menu hunt.",
    thumb: "/img/tours/header-bg.jpg",
    reference: "BK-TOUR-88421",
    title: "Kashmir Valley trek",
    sub: "Tour desk · 3 guests · linked account",
    status: "Confirmed",
    tone: "ok",
    sla: "Voucher due in 18h",
    owner: "Aisha Khan",
    ownerHint: "Tour desk · last touched 2h ago",
    journey: {
      fromLabel: "Start",
      fromValue: "18 Nov 2026",
      fromSub: "Srinagar · 08:00 meet",
      toLabel: "End",
      toValue: "23 Nov 2026",
      toSub: "6 days · private",
    },
    facts: [
      { label: "Meeting point", value: "Dal Lake jetty 2" },
      { label: "Language", value: "English" },
      { label: "Difficulty", value: "Moderate" },
      { label: "Channel", value: "Website" },
    ],
    guest: {
      name: "Meera Shah",
      email: "meera@example.com",
      phone: "+91 98765 44120",
    },
    timeline: [
      { label: "Enquiry received", when: "21 Oct · 16:43 · system", done: true },
      { label: "Marked quoted", when: "21 Oct · 18:10 · Aisha", done: true },
      { label: "Confirmed booking", when: "22 Oct · 09:02 · Aisha", done: true },
      { label: "Deposit marked paid", when: "22 Oct · 11:40 · Finance", done: true },
      { label: "Issue voucher", when: "Next · you", done: false },
    ],
    money: {
      label: "Trip total",
      total: "₹1,29,182",
      sub: "Balance due ₹89,182",
      lines: [
        { label: "Quoted", value: "₹1,29,182" },
        { label: "Paid", value: "₹40,000" },
        { label: "Balance", value: "₹89,182" },
      ],
    },
    nextHint: "Guest is paid on deposit. Issue voucher and email PDF.",
    primary: "Issue voucher & email guest",
    secondary: "Mark paid in full",
    tertiary: "Cancel booking",
    staffNote: "Guest asked for quieter week rate — already applied.",
  },
  {
    key: "hotel",
    label: "Hotels",
    badge: 1,
    market: "Cloudbeds / Mews folio: guest + stay + rate in stacked panels. Airbnb ops is guest-facing, not desk.",
    beat: "Stay journey + cancel policy next to quote; primary CTA = push quote / check-in pack.",
    thumb: "/img/stays/1/1.png",
    reference: "BK-HOTEL-22901",
    title: "Houseboat stay · Dal Lake",
    sub: "Hotel desk · 2 guests · linked account",
    status: "Quoted",
    tone: "info",
    sla: "Awaiting guest reply · 1d",
    owner: "Unassigned",
    ownerHint: "Needs owner — hotel desk queue",
    journey: {
      fromLabel: "Check-in",
      fromValue: "12 Dec 2026",
      fromSub: "From 14:00",
      toLabel: "Check-out",
      toValue: "14 Dec 2026",
      toSub: "2 nights · 1 suite",
    },
    facts: [
      { label: "Property", value: "Sukoon Houseboat" },
      { label: "Board", value: "Breakfast" },
      { label: "Cancel by", value: "5 Dec free" },
      { label: "Rooms", value: "1" },
    ],
    guest: {
      name: "Kiran Customer",
      email: "customer@travel.test",
      phone: "+91 90000 00011",
    },
    timeline: [
      { label: "Stay request", when: "3 Oct · 11:23", done: true },
      { label: "Availability OK", when: "3 Oct · 14:00 · Staff", done: true },
      { label: "Quote sent", when: "Today · 13:58", done: true },
      { label: "Guest accepts quote", when: "Waiting", done: false },
    ],
    money: {
      label: "Quoted stay",
      total: "₹18,000",
      sub: "Deposit asked ₹5,000",
      lines: [
        { label: "2 nights", value: "₹15,000" },
        { label: "Taxes", value: "₹3,000" },
        { label: "Deposit due", value: "₹5,000" },
      ],
    },
    nextHint: "Assign owner, then nudge guest on WhatsApp with quote link.",
    primary: "Assign me & nudge guest",
    secondary: "Revise quote",
    tertiary: "Mark cancelled",
    staffNote: "",
  },
  {
    key: "car",
    label: "Cars",
    badge: 1,
    market: "Turo host tools + Hertz reservation lookup: vehicle + reservation ID, weak document gates.",
    beat: "Docs queue is the primary CTA until verified; deposit never mixed into rental total.",
    thumb: "/img/cars/1.png",
    reference: "RN-CAR-55012",
    title: "Hyundai Grand i10",
    sub: "Car desk · JK 05 104C · Calangute",
    status: "Documents under review",
    tone: "warn",
    sla: "3 docs pending · blocks confirm",
    owner: "Ravi Ops",
    ownerHint: "Fleet desk",
    journey: {
      fromLabel: "Pickup",
      fromValue: "23 Oct · 13:50",
      fromSub: "Calangute counter",
      toLabel: "Return",
      toValue: "31 Oct · 13:50",
      toSub: "8 days",
    },
    facts: [
      { label: "Docs", value: "DL · ID · Address" },
      { label: "Doc status", value: "Pending verify" },
      { label: "Included km", value: "200 / day" },
      { label: "Fuel", value: "Same-to-same" },
    ],
    guest: {
      name: "Kamran",
      email: "916505550102@riders.worldcompass.local",
      phone: "916505550102",
    },
    timeline: [
      { label: "Booking requested", when: "21 Oct · 13:50", done: true },
      { label: "Documents uploaded", when: "21 Oct · 14:22", done: true },
      { label: "Verify all documents", when: "Next · you", done: false },
      { label: "Confirm booking", when: "Blocked", done: false },
    ],
    money: {
      label: "Rental due",
      total: "₹12,000",
      sub: "Deposit hold ₹5,000 separate",
      lines: [
        { label: "Rental", value: "₹12,000" },
        { label: "Deposit hold", value: "₹5,000" },
        { label: "Collected", value: "₹0" },
      ],
    },
    nextHint: "Confirm stays disabled until every document is verified.",
    primary: "Verify all documents",
    secondary: "Open document files",
    tertiary: "Reject booking",
    staffNote: "Licence expiry looks wrong — check scan.",
  },
  {
    key: "bike",
    label: "Bikes",
    badge: 1,
    market: "Same rental ops DNA as cars; local desks often use WhatsApp + spreadsheet.",
    beat: "Bay readiness + helmet/licence as desk facts; handover is the primary when ready.",
    thumb: "/img/rentals/1.png",
    reference: "RN-BIKE-88201",
    title: "Honda Dio",
    sub: "Bike desk · GA 03 K 4412 · bay B3",
    status: "Ready for pickup",
    tone: "ok",
    sla: "Handover tomorrow 10:00",
    owner: "Ravi Ops",
    ownerHint: "Fleet desk",
    journey: {
      fromLabel: "Pickup",
      fromValue: "24 Oct · 10:00",
      fromSub: "Bay B3 · 2 helmets",
      toLabel: "Return",
      toValue: "26 Oct · 10:00",
      toSub: "2 days",
    },
    facts: [
      { label: "Licence", value: "Verified" },
      { label: "Helmets", value: "2 staged" },
      { label: "Bay", value: "B3" },
      { label: "Fuel", value: "Full out" },
    ],
    guest: {
      name: "Kamran",
      email: "916505550102@riders.worldcompass.local",
      phone: "916505550102",
    },
    timeline: [
      { label: "Confirmed", when: "22 Oct", done: true },
      { label: "Docs verified", when: "22 Oct", done: true },
      { label: "Ready for pickup", when: "Today", done: true },
      { label: "Start rental (handover)", when: "Tomorrow", done: false },
    ],
    money: {
      label: "Rental due",
      total: "₹3,600",
      sub: "Paid · deposit ₹2,000 on hold",
      lines: [
        { label: "Rental", value: "₹3,600" },
        { label: "Deposit hold", value: "₹2,000" },
        { label: "Paid", value: "₹3,600" },
      ],
    },
    nextHint: "Print handover sheet; start rental when guest arrives.",
    primary: "Start rental (handover)",
    secondary: "Print handover sheet",
    tertiary: "Cancel booking",
    staffNote: "Guest prefers WhatsApp for bay directions.",
  },
  {
    key: "visa",
    label: "Visa",
    badge: 4,
    market: "Agency CRMs: long forms, status dropdowns, weak next-doc prompts.",
    beat: "Checklist pipeline + fee vs embassy fee split; CTA = request scans / file.",
    thumb: "/img/visa/visa-tourist.jpg",
    reference: "BK-VISA-44102",
    title: "Tourist visa · Japan",
    sub: "Visa desk · 3 travellers · 1 child",
    status: "Quoted",
    tone: "info",
    sla: "Need passport scans",
    owner: "Unassigned",
    ownerHint: "Visa desk · high queue",
    journey: {
      fromLabel: "Travel",
      fromValue: "12 Jan 2027",
      fromSub: "Outward",
      toLabel: "Return",
      toValue: "26 Jan 2027",
      toSub: "Indian passport",
    },
    facts: [
      { label: "Type", value: "Tourist" },
      { label: "Nationality", value: "Indian" },
      { label: "Embassy fee", value: "Guest direct" },
      { label: "Our fee", value: "₹3,500 / file" },
    ],
    guest: {
      name: "Ravi Mehta",
      email: "ravi@example.com",
      phone: "+91 98111 22001",
    },
    timeline: [
      { label: "Enquiry received", when: "16 Oct", done: true },
      { label: "Service fee quoted", when: "16 Oct", done: true },
      { label: "Request passport scans", when: "Next", done: false },
      { label: "File submission", when: "Waiting", done: false },
    ],
    money: {
      label: "Service fee",
      total: "₹10,500",
      sub: "3 files · embassy excluded",
      lines: [
        { label: "Adult ×2", value: "₹7,000" },
        { label: "Child ×1", value: "₹3,500" },
        { label: "Collected", value: "₹0" },
      ],
    },
    nextHint: "Assign visa officer, then email scan checklist.",
    primary: "Request passport scans",
    secondary: "Send fee invoice",
    tertiary: "Mark cancelled",
    staffNote: "Call tomorrow about child’s passport.",
  },
  {
    key: "assist",
    label: "Meet & assist",
    badge: 1,
    market: "Airport concierge tools: flight + terminal; often WhatsApp-only ops.",
    beat: "Flight identity + agent assign as primary; name-board copy beside guest.",
    thumb: "/img/assist/assist-arrival.jpg",
    reference: "BK-ASSIST-1008",
    title: "Arrival meet · DEL T3",
    sub: "Assist desk · AI 101 · 2 guests",
    status: "Confirmed",
    tone: "ok",
    sla: "Assign agent before 2 Nov",
    owner: "Unassigned",
    ownerHint: "Airport roster empty",
    journey: {
      fromLabel: "Flight",
      fromValue: "AI 101",
      fromSub: "2 Nov · 14:40 · T3",
      toLabel: "Meet",
      toValue: "Arrivals",
      toSub: "Board: MEERA SHAH",
    },
    facts: [
      { label: "Service", value: "Arrival" },
      { label: "Extras", value: "Porter" },
      { label: "Agent", value: "—" },
      { label: "Standby", value: "14:10" },
    ],
    guest: {
      name: "Meera Shah",
      email: "meera@example.com",
      phone: "+91 98765 44120",
    },
    timeline: [
      { label: "Request received", when: "20 Oct", done: true },
      { label: "Flight confirmed", when: "21 Oct", done: true },
      { label: "Assign airport agent", when: "Next", done: false },
      { label: "On stand", when: "2 Nov 14:10", done: false },
    ],
    money: {
      label: "Service total",
      total: "₹4,800",
      sub: "Paid in full",
      lines: [
        { label: "Assist", value: "₹3,500" },
        { label: "Porter", value: "₹1,300" },
        { label: "Paid", value: "₹4,800" },
      ],
    },
    nextHint: "Pick agent from DEL roster and share live flight link.",
    primary: "Assign airport agent",
    secondary: "Share flight live link",
    tertiary: "Cancel assist",
    staffNote: "WhatsApp on landing preferred.",
  },
];

export function AdminBookingDeskShowcase() {
  const [active, setActive] = useState(desks[0].key);
  const desk = useMemo(
    () => desks.find((item) => item.key === active) ?? desks[0],
    [active],
  );

  return (
    <div
      className={`ad-desk ${plex.variable} ${plexMono.variable} ${plex.className}`}
      style={
        {
          ["--ad-sans" as string]: "var(--font-ad-sans), system-ui, sans-serif",
          ["--ad-mono" as string]: "var(--font-ad-mono), ui-monospace, monospace",
        } as React.CSSProperties
      }
    >
      <div className="ad-desk__frame">
        <aside className="ad-desk__nav" aria-label="Demo desks">
          <p className="ad-desk__nav-brand">
            Operations
            <strong>Bookings desk</strong>
          </p>
          {desks.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-current={item.key === active ? "page" : undefined}
              onClick={() => setActive(item.key)}
            >
              <span>{item.label}</span>
              {item.badge ? <span className="ad-desk__badge">{item.badge}</span> : null}
            </button>
          ))}
        </aside>

        <div className="ad-desk__main">
          <header className="ad-desk__intro">
            <p className="kicker">Admin demo · not guest UI</p>
            <h1>Booking detail for staff — better than OTA agent desks</h1>
            <p>
              Built against Viator Agent, GetYourGuide Partner, Cloudbeds-style folios, Turo host
              tools, and Hertz reservation ops. Switch desks in the left rail.
            </p>
          </header>

          <p className="ad-bench">
            <strong>Market:</strong> {desk.market}
            <br />
            <strong>We beat it:</strong> {desk.beat}
          </p>

          <div className="ad-crumb">
            <span>Bookings</span>
            <span>/</span>
            <b>{desk.label}</b>
            <span>/</span>
            <span>{desk.reference}</span>
          </div>

          <div className="ad-sheet">
            <div className="ad-stack">
              <section className="ad-hero">
                <div
                  className="ad-hero__thumb"
                  style={{ backgroundImage: `url(${desk.thumb})` }}
                  role="img"
                  aria-label={desk.title}
                />
                <div className="ad-hero__meta">
                  <p className="ad-hero__ref">{desk.reference}</p>
                  <h2>{desk.title}</h2>
                  <p className="ad-hero__sub">{desk.sub}</p>
                  <div className="ad-pills">
                    <span className={`ad-pill ad-pill--${desk.tone}`}>{desk.status}</span>
                    <span className="ad-pill ad-pill--mute">{desk.label}</span>
                  </div>
                  {desk.sla ? <p className="ad-sla">{desk.sla}</p> : null}
                </div>
              </section>

              <section className="ad-panel">
                <h3>Guest</h3>
                <p style={{ margin: 0, fontWeight: 700 }}>{desk.guest.name}</p>
                <p style={{ margin: "4px 0 0", color: "var(--ad-mute)", fontSize: "0.84rem" }}>
                  {desk.guest.email} · {desk.guest.phone}
                </p>
                <div className="ad-contact">
                  <a href={`mailto:${desk.guest.email}`}>Email</a>
                  <a href={`tel:${desk.guest.phone}`}>Call</a>
                  <button type="button">WhatsApp</button>
                </div>
              </section>

              <section className="ad-panel">
                <h3>Trip</h3>
                <div className="ad-journey">
                  <div>
                    <strong>{desk.journey.fromLabel}</strong>
                    <p>{desk.journey.fromValue}</p>
                    <small>{desk.journey.fromSub}</small>
                  </div>
                  <div className="ad-journey__line" aria-hidden />
                  <div style={{ textAlign: "right" }}>
                    <strong>{desk.journey.toLabel}</strong>
                    <p>{desk.journey.toValue}</p>
                    <small>{desk.journey.toSub}</small>
                  </div>
                </div>
                <dl className="ad-dl" style={{ marginTop: 14 }}>
                  {desk.facts.map((fact) => (
                    <div key={fact.label}>
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="ad-panel">
                <h3>Activity</h3>
                <ol className="ad-timeline">
                  {desk.timeline.map((item) => (
                    <li key={item.label} data-done={item.done}>
                      <span className="ad-timeline__dot" aria-hidden />
                      <div>
                        <p>{item.label}</p>
                        <small>{item.when}</small>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            <aside className="ad-rail">
              <div className="ad-money">
                <p className="ad-money__label">{desk.money.label}</p>
                <p className="ad-money__total">{desk.money.total}</p>
                <p className="ad-money__sub">{desk.money.sub}</p>
                <ul>
                  {desk.money.lines.map((line) => (
                    <li key={line.label}>
                      <span>{line.label}</span>
                      <span>{line.value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="ad-owner">
                <h3
                  style={{
                    margin: 0,
                    fontSize: "0.72rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--ad-mute)",
                  }}
                >
                  Desk owner
                </h3>
                <p style={{ marginTop: 8 }}>{desk.owner}</p>
                <small>{desk.ownerHint}</small>
                <select aria-label="Assign owner" defaultValue={desk.owner}>
                  <option>Unassigned</option>
                  <option>Aisha Khan</option>
                  <option>Ravi Ops</option>
                  <option>Administrator</option>
                </select>
              </div>

              <div className="ad-owner">
                <h3
                  style={{
                    margin: 0,
                    fontSize: "0.72rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--ad-mute)",
                  }}
                >
                  Staff note
                </h3>
                <textarea
                  aria-label="Staff note"
                  defaultValue={desk.staffNote}
                  placeholder="Internal only"
                />
              </div>

              <div className="ad-actions">
                <h3>Next step</h3>
                <p>{desk.nextHint}</p>
                <button type="button" className="ad-actions__primary">
                  {desk.primary}
                </button>
                <button type="button" className="ad-actions__ghost">
                  {desk.secondary}
                </button>
                <button type="button" className="ad-actions__danger">
                  {desk.tertiary}
                </button>
              </div>

              <p className="ad-note">
                Demo only. Approve this admin desk direction and we replace live{" "}
                <code>/admin/bookings/[id]</code> + rental booking desks with it.
              </p>
            </aside>
          </div>

          <p className="ad-footer">
            Admin demo:{" "}
            <a href="/demo/admin-booking-desk">/demo/admin-booking-desk</a>
            {" · "}
            Older guest-style mock: <a href="/demo/booking-details">/demo/booking-details</a>
          </p>
        </div>
      </div>
    </div>
  );
}
