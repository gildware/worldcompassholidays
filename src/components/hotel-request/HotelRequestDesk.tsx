"use client";

import { useMemo, useState } from "react";
import { HotelRequestForm, type HotelRequestDefaults } from "@/components/hotel-request/HotelRequestForm";
import { theme } from "@/config/theme";
import { hotelRequestFaqs, hotelRequestStays, hotelRequestSteps } from "@/lib/hotels/request-content";
import { whatsAppHref } from "@/lib/visa";

export type HotelRequestPlace = {
  name: string;
  region: string;
  country: string;
  summary: string;
  imageUrl: string;
};

const checks = [
  { title: "A name", text: "Even a hotel that is not on this website." },
  { title: "The setting", text: "An area, a room type, or meals." },
  { title: "The party", text: "Adults, children, and how the rooms should split." },
  { title: "A budget", text: "A nightly figure, if you already have one." },
];

export function HotelRequestDesk({
  sent,
  reference,
  customer,
  defaults,
  places,
  loginHref,
  contact,
}: {
  sent: boolean;
  reference: string;
  customer: { name: string; email: string; phone: string } | null;
  defaults: HotelRequestDefaults;
  places: HotelRequestPlace[];
  loginHref: string;
  contact?: { phone: string; email: string; whatsapp: string };
}) {
  const [preset, setPreset] = useState({ key: 0, destination: "", stars: "", message: "" });
  const [activeStay, setActiveStay] = useState("");
  const [activePlace, setActivePlace] = useState(defaults.destination);
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(0);
  const phone = contact?.phone || theme.contact.phone;
  const email = contact?.email || theme.contact.email;
  const whatsapp = whatsAppHref(contact?.whatsapp || theme.contact.whatsapp);
  const shownPlaces = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return places;
    return places.filter((place) =>
      `${place.name} ${place.region} ${place.country} ${place.summary}`.toLowerCase().includes(needle),
    );
  }, [places, query]);
  const stay = hotelRequestStays.find((item) => item.id === activeStay);
  const place = places.find((item) => item.name === activePlace);

  function applyPreset(next: { destination?: string; stars?: string; message?: string; stay?: string }) {
    if (next.stay !== undefined) setActiveStay(next.stay);
    if (next.destination) setActivePlace(next.destination);
    setPreset((current) => ({
      key: current.key + 1,
      destination: next.destination ?? "",
      stars: next.stars ?? "",
      message: next.message ?? "",
    }));
    document.getElementById("hotel-request-pass")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return (
    <div className="hotel-brief">
      <header className="hotel-brief-top">
        <div className="container">
          <p className="hotel-brief-crumb">
            <a href="/hotels">Hotels</a>
            <span aria-hidden="true">/</span>
            Request
          </p>
          <div className="hotel-brief-intro">
            <div>
              <h1>Request a hotel</h1>
              <p>
                If the stay is not on the list, send the city, the dates, and what matters. We search and contact you. Nothing is booked until you accept a price.
              </p>
              <ul className="hotel-brief-facts">
                <li>No payment to send this</li>
                <li>A reply within 24 hours</li>
                <li>Booked only after you accept</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <div className="container hotel-brief-layout">
        <div className="hotel-brief-main">
          <section>
            <h2>Kind of stay</h2>
            <p className="hotel-brief-note">Choosing one fills the note. You can rewrite it before sending.</p>
            <ul className="hotel-brief-stays">
              {hotelRequestStays.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={activeStay === item.id ? "is-on" : ""}
                    aria-pressed={activeStay === item.id}
                    onClick={() => applyPreset({ stay: item.id, stars: item.stars, message: item.message })}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
            {stay ? <p className="hotel-brief-picked">{stay.text}</p> : null}
          </section>

          <section>
            <div className="hotel-brief-places-head">
              <div>
                <h2>Places</h2>
                <p className="hotel-brief-note">Pick one to fill the city. A place that is not here still belongs on the form.</p>
              </div>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a place"
                aria-label="Search a place"
              />
            </div>
            <div className="hotel-brief-places">
              {shownPlaces.length === 0 ? <p className="hotel-brief-empty">No listed place. Type the city in the form.</p> : null}
              {shownPlaces.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  className={activePlace === item.name ? "is-on" : ""}
                  aria-pressed={activePlace === item.name}
                  onClick={() => applyPreset({ destination: item.name })}
                >
                  {item.name}
                </button>
              ))}
            </div>
            {place ? (
              <p className="hotel-brief-picked">
                {`${[place.region, place.country].filter(Boolean).join(", ")}${place.summary ? `. ${place.summary}` : ""}`}
              </p>
            ) : null}
          </section>

          <section>
            <h2>After you send it</h2>
            <ol className="hotel-brief-steps">
              {hotelRequestSteps.map((step, index) => (
                <li key={step.title}>
                  <b>{index + 1}</b>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
            <ul className="hotel-brief-checks">
              {checks.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Questions</h2>
            <div className="hotel-brief-faqs">
              {hotelRequestFaqs.map((item, index) => {
                const open = openFaq === index;
                return (
                  <article key={item.question} className={open ? "is-open" : ""}>
                    <h3>
                      <button type="button" aria-expanded={open} onClick={() => setOpenFaq(open ? -1 : index)}>
                        {item.question}
                        <span aria-hidden="true">{open ? "–" : "+"}</span>
                      </button>
                    </h3>
                    {open ? <p>{item.answer}</p> : null}
                  </article>
                );
              })}
            </div>
            <div className="hotel-brief-contact">
              <a href="/hotels">Hotel list</a>
              <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
              <a href={`mailto:${email}`}>Email</a>
              {whatsapp ? (
                <a href={`${whatsapp}?text=${encodeURIComponent("Hello, I need help finding a hotel.")}`} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="hotel-brief-side">
          <HotelRequestForm
            sent={sent}
            reference={reference}
            customer={customer}
            defaults={defaults}
            presetKey={preset.key}
            destinationPreset={preset.destination}
            starsPreset={preset.stars}
            messagePreset={preset.message}
            loginHref={loginHref}
          />
        </aside>
      </div>
    </div>
  );
}
