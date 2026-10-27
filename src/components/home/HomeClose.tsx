import Link from "next/link";
import { theme } from "@/config/theme";
import type { HomePageContent, HomeWhyItem } from "@/lib/home-page";
import "./home-close.css";

function replyText(item: HomeWhyItem, contactPhone?: string) {
  if (item.id === "reply" && contactPhone) {
    return item.text.replace(theme.contact.phone, contactPhone);
  }
  return item.text;
}

export function HomePromises({
  items,
  contactPhone,
  headingId,
}: {
  items: HomeWhyItem[];
  contactPhone?: string;
  headingId: string;
}) {
  if (!items.length) return null;
  return (
    <section className="home-close" aria-labelledby={headingId}>
      <header className="home-close__head">
        <p className="home-close__kicker">Why book with us</p>
        <h2 id={headingId}>A quote you can accept first</h2>
        <p>The fee, the request, and the person who answers are the same on every trip.</p>
      </header>
      <ol className="home-close__steps">
        {items.map((item, index) => (
          <li key={item.id}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{item.title}</h3>
            <p>{replyText(item, contactPhone)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function HomeInvite({
  cta,
  contactPhone,
  headingId,
}: {
  cta: HomePageContent["cta"];
  contactPhone?: string;
  headingId: string;
}) {
  const phone = contactPhone || theme.contact.phone;
  return (
    <section className="home-invite" aria-labelledby={headingId}>
      <div className="home-invite__panel">
        <div className="home-invite__copy">
          <p className="home-invite__kicker">Before you pay</p>
          <h2 id={headingId}>{cta.title}</h2>
          <p>{cta.subtitle}</p>
        </div>
        <div className="home-invite__actions">
          <Link prefetch={false} href="/contact" className="home-invite__btn">
            {cta.buttonLabel}
          </Link>
          <p className="home-invite__note">Call or WhatsApp {phone}. We answer from India.</p>
        </div>
      </div>
    </section>
  );
}
