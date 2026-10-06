import type { Metadata } from "next";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { PageIntro } from "@/components/site/PageIntro";
import { getCurrentUser } from "@/lib/auth/session";
import { enquiryInterests } from "@/lib/navigation";

export const metadata: Metadata = { title: "Contact" };

const officeMapEmbed =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d182586.0420340798!2d-73.99038430252834!3d40.749936548349346!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sbd!4v1670824458615!5m2!1sen!2sbd";

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
      <div className="h-[180px] overflow-hidden bg-[#f9f9f9] lg:h-[260px]">
        <iframe
          title="Office location on the map"
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
            description="Treks start as an enquiry. The team quotes, confirms, and closes it from the same record."
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
    title: "Address",
    icon: "pin" as const,
    value: "328 Queensberry Street, North Melbourne VIC 3051, Australia.",
  },
  {
    title: "Toll Free Customer Care",
    icon: "phone" as const,
    value: "+47 333 78 901",
    href: "tel:+4733378901",
  },
  {
    title: "Need live support?",
    icon: "mail" as const,
    value: "hi@gotrip.com",
    href: "mailto:hi@gotrip.com",
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
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {contactDetails.map((item) => (
          <article
            key={item.title}
            className="rounded-xl border border-line bg-white p-5 shadow-[0px_10px_60px_rgba(5,16,54,0.05)]"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand">
              <ContactIcon name={item.icon} />
            </span>
            <p className="mt-3 text-sm text-muted">{item.title}</p>
            {item.href ? (
              <a href={item.href} className="mt-1 block text-base font-medium leading-6">
                {item.value}
              </a>
            ) : (
              <p className="mt-1 text-base font-medium leading-6">{item.value}</p>
            )}
          </article>
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
                className="flex size-10 items-center justify-center rounded-full border border-line text-navy"
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
