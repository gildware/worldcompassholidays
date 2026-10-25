import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { PageIntro } from "@/components/site/PageIntro";
import { theme } from "@/config/theme";
import { getCurrentUser } from "@/lib/auth/session";
import { enquiryInterests } from "@/lib/navigation";
import { absoluteUrl, graphLd, organizationNode, pageMetadata, phoneE164, siteOrigin } from "@/lib/seo";

const contactDescription =
  "Call, WhatsApp, or send a trip enquiry to World Compass Holidays. We reply with a plan and a price before you pay.";

export const metadata: Metadata = pageMetadata({
  title: "Contact us",
  description: contactDescription,
  path: "/contact",
});

const officeLabel = theme.contact.city;
const officeMapEmbed = "https://maps.google.com/maps?q=India&z=5&output=embed";
const officeMapLink = "https://www.google.com/maps/search/?api=1&query=India";
const phoneHref = `tel:${phoneE164(theme.contact.phone)}`;

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const [{ sent }, user] = await Promise.all([searchParams, getCurrentUser()]);
  const customer =
    user?.scope === "customer"
      ? { name: user.name, email: user.email, phone: user.phone }
      : null;

  return (
    <div>
      <JsonLd
        data={graphLd([
          organizationNode(),
          {
            "@type": "ContactPage",
            name: "Contact us",
            url: absoluteUrl("/contact"),
            description: contactDescription,
            mainEntity: { "@id": `${siteOrigin()}/#organization` },
          },
        ])}
      />
      <div className="h-[180px] overflow-hidden bg-[#f9f9f9] lg:h-[260px]">
        <iframe
          title="Map of India"
          src={officeMapEmbed}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <section className="relative z-10 mx-auto max-w-[1320px] px-5 pt-6 pb-8 lg:pt-0">
        <div className="lg:w-[calc(50%-1.25rem)]">
          <ContactDetails />
        </div>
        <div className="relative z-10 mt-6 rounded bg-white px-5 py-5 shadow-[0px_10px_60px_rgba(5,16,54,0.05)] lg:absolute lg:top-[-130px] lg:right-5 lg:mt-0 lg:w-[42%] lg:px-6 lg:py-6">
          <PageIntro
            compact
            eyebrow="Contact"
            title="Tell us what you want to book"
            description="Tours, hotels, visas, and rentals start as an enquiry. We quote the price before you pay."
          />
          <div className="mt-4">
            <EnquiryForm
              compact
              interests={enquiryInterests()}
              sent={sent === "1"}
              customer={customer}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

const contactDetails = [
  {
    title: "Based in",
    icon: "pin" as const,
    value: officeLabel,
    href: officeMapLink,
    hint: "Open the map",
    external: true,
  },
  {
    title: "Phone and WhatsApp",
    icon: "phone" as const,
    value: theme.contact.phone,
    href: phoneHref,
    hint: "Call now",
    external: false,
  },
  {
    title: "Email",
    icon: "mail" as const,
    value: theme.contact.email,
    href: `mailto:${theme.contact.email}`,
    hint: "Write an email",
    external: false,
  },
];

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com/", icon: "facebook" as const },
  { label: "Twitter", href: "https://twitter.com/", icon: "twitter" as const },
  { label: "Instagram", href: "https://instagram.com/", icon: "instagram" as const },
  { label: "LinkedIn", href: "https://linkedin.com/", icon: "linkedin" as const },
];

function ContactDetails() {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Contact Us</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        World Compass Holidays, DMC by Negotrip Private Limited.{" "}
        <Link href="/about" className="font-medium text-brand">
          Read about the desks
        </Link>
        .
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {contactDetails.map((item) => (
          <a
            key={item.title}
            href={item.href}
            {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
            className="group flex min-w-0 flex-col rounded-xl border border-line bg-white p-5 shadow-[0px_10px_60px_rgba(5,16,54,0.05)] transition duration-200 hover:-translate-y-1 hover:border-brand"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
              <ContactIcon name={item.icon} />
            </span>
            <p className="mt-3 text-sm text-muted">{item.title}</p>
            <p className="mt-1 break-words text-base font-medium leading-6">{item.value}</p>
            <p className="mt-2 text-sm font-medium text-brand opacity-0 transition duration-200 group-hover:opacity-100">
              {item.hint} →
            </p>
          </a>
        ))}
        <article className="rounded-xl border border-line bg-white p-5 shadow-[0px_10px_60px_rgba(5,16,54,0.05)]">
          <span className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand">
            <ContactIcon name="share" />
          </span>
          <p className="mt-3 text-sm text-muted">Follow us on social media</p>
          <div className="mt-3 flex gap-2">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className="flex size-10 items-center justify-center rounded-full border border-line text-navy transition hover:-translate-y-0.5 hover:border-brand hover:bg-brand hover:text-white"
              >
                <ContactIcon name={item.icon} />
              </a>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}

function ContactIcon({
  name,
}: {
  name: "pin" | "phone" | "mail" | "share" | "facebook" | "twitter" | "instagram" | "linkedin";
}) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "size-5",
    "aria-hidden": true,
  };

  if (name === "pin") {
    return (
      <svg {...common}>
        <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }
  if (name === "phone") {
    return (
      <svg {...common}>
        <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3A2 2 0 0 1 18.5 20 15 15 0 0 1 4 5.5a2 2 0 0 1 2.5-2z" />
      </svg>
    );
  }
  if (name === "mail") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }
  if (name === "share") {
    return (
      <svg {...common}>
        <circle cx="6" cy="12" r="2.2" />
        <circle cx="17" cy="6.5" r="2.2" />
        <circle cx="17" cy="17.5" r="2.2" />
        <path d="m8 11 7-3.5M8 13l7 3.5" />
      </svg>
    );
  }
  if (name === "facebook") {
    return (
      <svg {...common}>
        <path d="M14 8h2V5h-2c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.2l.8-3H13V9c0-.6.4-1 1-1z" />
      </svg>
    );
  }
  if (name === "twitter") {
    return (
      <svg {...common}>
        <path d="M5 5h3.2l3.4 4.6L16.2 5H19l-5.2 6.2L19.5 19h-3.2l-3.8-5.1L7.6 19H5l5.6-6.7z" />
      </svg>
    );
  }
  if (name === "instagram") {
    return (
      <svg {...common}>
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <circle cx="12" cy="12" r="3.5" />
        <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 10.5V17M8 7.5v.01M12 17v-4.2a2 2 0 0 1 4 0V17" />
    </svg>
  );
}
