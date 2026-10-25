import Image from "next/image";
import Link from "next/link";
import { homeAssistServices } from "@/lib/homeServices";
import "@/styles/home-desks.css";

export function HomeAssistSection({ headingId = "home-assist" }: { headingId?: string }) {
  return (
    <section className="hx-meet" aria-labelledby={headingId}>
      <div className="hx-meet__head">
        <div>
          <div className="hx-desk__title">
            <h2 id={headingId}>Meet and assist</h2>
            <Link prefetch={false} href="/meet-and-assist" className="hx-desk__more">
              View more details
            </Link>
          </div>
          <p>
            A greeter at the airport on the day you fly. Send the flight number and we name
            who meets you, and the fee, before anyone is booked.
          </p>
        </div>
        <Link prefetch={false} href="/meet-and-assist/request" className="hx-desk__go">
          Book a greeter
        </Link>
      </div>
      <div className="hx-meet__split">
        <Link prefetch={false} href="/meet-and-assist" className="hx-meet__hero" aria-label="Meet and assist at the airport">
          <Image
            src="/img/assist/assist-arrival.jpg"
            alt="A greeter holding a name board in the arrivals hall"
            fill
            sizes="(max-width: 900px) 100vw, 520px"
          />
        </Link>
        <div className="hx-meet__list">
          {homeAssistServices.map((item, index) => (
            <Link prefetch={false} key={item.title} href={item.href} className="hx-meet__row">
              <span className="hx-meet__n">{index + 1}</span>
              <span className="hx-meet__thumb">
                <Image src={item.image} alt="" fill sizes="72px" />
              </span>
              <span className="hx-meet__copy">
                <strong>{item.title}</strong>
                <span>{item.text}</span>
                <em>{item.details.join(" · ")}</em>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
