import Link from "next/link";
import { WhyUsIcon } from "@/components/company/WhyUsIcons";
import { theme } from "@/config/theme";
import type { HomePageContent, HomeWhyItem } from "@/lib/home-page";
import { whyUsHomeIds, whyUsPage, whyUsProof, whyUsReasons } from "@/lib/why-us";
import "./home-close.css";

function homeReasons(items: HomeWhyItem[]) {
  const byId = new Map(items.map((item) => [item.id, item]));
  return whyUsHomeIds.map((id) => {
    const fallback = whyUsReasons.find((reason) => reason.id === id)!;
    const override = byId.get(id);
    return {
      id,
      title: override?.title?.trim() || fallback.title,
      text: override?.text?.trim() || fallback.short,
    };
  });
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
  const reasons = homeReasons(items).map((reason) => {
    if (reason.id !== "support" || !contactPhone) return reason;
    return {
      ...reason,
      text: reason.text.replace(theme.contact.phone, contactPhone),
    };
  });

  return (
    <section className="home-close" aria-labelledby={headingId}>
      <header className="home-close__head">
        <div className="home-close__intro">
          <p className="home-close__kicker">{whyUsPage.kicker}</p>
          <h2 id={headingId}>{whyUsPage.homeTitle}</h2>
          <p>{whyUsPage.homeSubtitle}</p>
        </div>
        <Link prefetch={false} href="/why-us" className="home-close__more">
          {whyUsPage.linkLabel}
        </Link>
      </header>

      <dl className="home-close__proof">
        {whyUsProof.slice(0, 3).map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.figure}</dd>
            <p>{item.detail}</p>
          </div>
        ))}
      </dl>

      <ul className="home-close__reasons">
        {reasons.map((reason) => (
          <li key={reason.id}>
            <span className="home-close__icon" aria-hidden>
              <WhyUsIcon id={reason.id} />
            </span>
            <h3>{reason.title}</h3>
            <p>{reason.text}</p>
          </li>
        ))}
      </ul>
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
