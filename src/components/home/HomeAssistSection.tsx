import Image from "next/image";
import Link from "next/link";
import { homeAssistServices } from "@/lib/homeServices";
import { defaultHomePageContent } from "@/lib/home-page";
import "@/styles/home-desks.css";

export function HomeAssistSection({
  headingId = "home-assist",
  title = defaultHomePageContent.assist.title,
  subtitle = defaultHomePageContent.assist.subtitle,
  moreLabel = defaultHomePageContent.assist.moreLabel,
  ctaLabel = defaultHomePageContent.assist.ctaLabel,
}: {
  headingId?: string;
  title?: string;
  subtitle?: string;
  moreLabel?: string;
  ctaLabel?: string;
}) {
  return (
    <section className="hx-meet" aria-labelledby={headingId}>
      <div className="hx-meet__head">
        <div>
          <div className="hx-desk__title">
            <h2 id={headingId}>{title}</h2>
            <Link prefetch={false} href="/meet-and-assist" className="hx-desk__more">
              {moreLabel}
            </Link>
          </div>
          <p>{subtitle}</p>
        </div>
        <Link prefetch={false} href="/meet-and-assist/request" className="hx-desk__go">
          {ctaLabel}
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
