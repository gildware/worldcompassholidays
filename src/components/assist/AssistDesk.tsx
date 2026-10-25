"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AssistStatIcon, AssistStepIcon, AssistTypeIcon } from "@/components/assist/AssistIcons";
import { flagEmoji } from "@/components/visa/CountryFlag";
import { assistRequestPath } from "@/lib/assist";
import { airports, type Airport } from "@/lib/data/airports";

const ways = [
  {
    service: "arrival",
    title: "Arrival",
    text: "A greeter waits at arrivals with your name and walks you out with the bags.",
    image: "/img/assist/assist-arrival.jpg",
    alt: "A greeter holding a name board in the arrivals hall",
  },
  {
    service: "departure",
    title: "Departure",
    text: "Someone meets you at the terminal and stays with you through check-in.",
    image: "/img/assist/assist-departure.jpg",
    alt: "Staff helping a traveler with a suitcase at check-in",
  },
  {
    service: "transit",
    title: "Connection",
    text: "On a tight link, they meet the inbound flight and take you to the next gate.",
    image: "/img/assist/assist-transit.jpg",
    alt: "A greeter walking a traveler toward a departure gate",
  },
  {
    service: "round",
    title: "Both ways",
    text: "Landing and the flight home. Two flight numbers, one quote.",
    image: "/img/assist/assist-family.jpg",
    alt: "A greeter walking a family and their luggage out of the airport",
  },
] as const;

const route = [
  { icon: "flight", title: "Send the flight", text: "Airport, flight number, and how many people. No payment on this page." },
  { icon: "quote", title: "We name the greeter", text: "Within a day you get who meets you, where they stand, and the fee." },
  { icon: "accept", title: "You accept", text: "A greeter is booked only after you accept the quote." },
  { icon: "meet", title: "They hold the board", text: "Your name is on it. If the flight slips, they follow the new time." },
] as const;

const questions = [
  {
    q: "Is this visa help?",
    a: "No. This is a person at the airport on the day you fly. Visa help is the file before you travel.",
  },
  {
    q: "When is the fee due?",
    a: "After you accept the quote. Sending the flight does not book anyone and does not charge you.",
  },
  {
    q: "What if the flight is late?",
    a: "The greeter follows the flight number, not the time printed on the ticket.",
  },
  {
    q: "Can one request cover a family?",
    a: "Yes. Put the number of travellers on the form and the name for the board in the note.",
  },
];

export function AssistDesk() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const source = needle.length < 2 ? airports.slice(0, 8) : airports;
    return source
      .filter((item) =>
        needle.length < 2
          ? true
          : `${item.code} ${item.city} ${item.name} ${item.country}`.toLowerCase().includes(needle),
      )
      .slice(0, 8);
  }, [query]);

  return (
    <div className="assist-page">
      <section className="assist-hero">
        <img className="assist-hero-img" src="/img/assist/assist-arrival.jpg" alt="" />
        <div className="assist-hero-shade" />
        <div className="assist-wrap assist-hero-copy">
          <p className="assist-kicker">Airport meet and assist</p>
          <h1>A greeter with your name, at the airport.</h1>
          <p className="assist-lede">
            Arrival, departure, or a tight connection. Send the flight and we quote the fee before anyone is booked.
          </p>
          <ul className="assist-facts">
            <li>
              <AssistStatIcon name="airports" />
              <span>
                <strong>{airports.length}</strong>
                Airports
              </span>
            </li>
            <li>
              <AssistStatIcon name="reply" />
              <span>
                <strong>24 hrs</strong>
                First reply
              </span>
            </li>
            <li>
              <AssistStatIcon name="quote" />
              <span>
                <strong>Quote first</strong>
                Pay after you accept
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section className="assist-book">
        <div className="assist-wrap">
          <div className="assist-pass" id="assist-pass">
            <div className="assist-pass-head">
              <h2>Request a greeter</h2>
              <p>The form is on the next page. You pay nothing until you accept the quote.</p>
            </div>
            <Link className="assist-submit" href="/meet-and-assist/request">
              Request a greeter
            </Link>
          </div>
        </div>
      </section>

      <section className="assist-ways">
        <div className="assist-wrap">
          <div className="assist-section-head">
            <h2>Choose the kind of meet</h2>
            <p>Pick one and the request form opens with that meet filled in.</p>
          </div>
          <ul>
            {ways.map((way) => (
              <li key={way.service}>
                <Link href={assistRequestPath({ service: way.service })}>
                  <img src={way.image} alt={way.alt} />
                  <span className="assist-way-body">
                    <span className="assist-way-icon">
                      <AssistTypeIcon name={way.service} />
                    </span>
                    <span>
                      <strong>{way.title}</strong>
                      <em>{way.text}</em>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="assist-route">
        <div className="assist-wrap">
          <div className="assist-section-head">
            <h2>What happens after you send it</h2>
            <p>Four steps. Nobody is booked until you accept the quote.</p>
          </div>
          <ol>
            {route.map((step, index) => (
              <li key={step.title}>
                <span className="assist-step-icon">
                  <AssistStepIcon name={step.icon} />
                </span>
                <b>0{index + 1}</b>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="assist-board">
        <div className="assist-wrap">
          <div className="assist-section-head assist-board-head">
            <div>
              <h2>Airports on this desk</h2>
              <p>Search a city or a code, then open the request with that airport.</p>
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Delhi, DXB, LHR"
              aria-label="Find an airport"
            />
          </div>
          <ul>
            {results.length === 0 ? <li className="assist-empty">No listed airport. You can still type one on the request form.</li> : null}
            {results.map((airport) => (
              <li key={airport.code}>
                <Link href={assistRequestPath({ airport: airport.code })}>
                  <AirportRow airport={airport} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="assist-qa">
        <div className="assist-wrap">
          <div className="assist-section-head">
            <h2>Before you send the flight</h2>
          </div>
          <dl>
            {questions.map((item) => (
              <div key={item.q}>
                <dt>{item.q}</dt>
                <dd>{item.a}</dd>
              </div>
            ))}
          </dl>
          <p className="assist-aside">
            Need the papers before you fly? <a href="/visa-services">Visa help is a different desk.</a>
          </p>
        </div>
      </section>
    </div>
  );
}

function AirportRow({ airport }: { airport: Airport }) {
  return (
    <>
      <span className="assist-flag" aria-hidden="true">
        {flagEmoji(airport.countryCode)}
      </span>
      <span>
        <strong className="assist-iata">{airport.code}</strong>
        <span className="assist-city">
          {airport.city}
          <small>
            {airport.name}, {airport.country}
          </small>
        </span>
      </span>
    </>
  );
}
