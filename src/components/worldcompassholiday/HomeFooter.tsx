import Link from "next/link";
import { BrandLogo } from "@/components/worldcompassholiday/BrandLogo";
import { theme } from "@/config/theme";
import { getSiteBrand } from "@/lib/brand";
import type { NavItem } from "@/lib/navigation";
import { whatsAppHref } from "@/lib/visa";

const exploreHrefs = ["/", "/destinations", "/tours", "/hotels"];

export async function HomeFooter({ items }: { items: NavItem[] }) {
  const brand = await getSiteBrand();
  const explore = items.filter((item) => exploreHrefs.includes(item.href));
  const services = items.filter((item) => !exploreHrefs.includes(item.href) && item.href !== "/contact");
  const phone = theme.contact.phone.replace(/\s/g, "");
  const whatsapp = whatsAppHref(theme.contact.whatsapp);
  const showHotelRequest = items.some((item) => item.href === "/hotels");

  return (
    <footer className="footer site-footer">
      <div className="site-footer__main">
        <div className="site-footer__brand">
          <Link href="/" aria-label={theme.brandName}>
            <BrandLogo logoUrl={brand.logoUrl || null} />
          </Link>
          <p>{theme.tagline}</p>
          <ul className="site-footer__reach">
            <li>
              <a href={`tel:${phone}`}>
                <PhoneIcon />
                {theme.contact.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${theme.contact.email}`}>
                <MailIcon />
                {theme.contact.email}
              </a>
            </li>
            {whatsapp ? (
              <li>
                <a href={whatsapp} target="_blank" rel="noreferrer">
                  <WhatsAppIcon />
                  WhatsApp
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        <nav aria-label="Explore">
          <h2>Explore</h2>
          <ul>
            {explore.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Services">
          <h2>Services</h2>
          <ul>
            {services.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Your trip">
          <h2>Your trip</h2>
          <ul>
            <li>
              <Link href="/login">Sign in</Link>
            </li>
            <li>
              <Link href="/account">Your bookings</Link>
            </li>
            {showHotelRequest ? (
              <li>
                <Link href="/hotels/request">Find a hotel</Link>
              </li>
            ) : null}
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="site-footer__bar">
        <span>
          © {new Date().getFullYear()} {theme.brandName}. All rights reserved.
        </span>
        <span>Tours, stays, visas, airport meet, and car or bike rental.</span>
      </div>
    </footer>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8.4 4.2h2.1l1.1 2.6-1.5 1.1a11 11 0 0 0 5 5l1.1-1.5 2.6 1.1v2.1c0 .8-.6 1.5-1.4 1.6A13.2 13.2 0 0 1 5.8 5.6c.1-.8.8-1.4 1.6-1.4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="m4.5 7.5 7.5 5.5 7.5-5.5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        transform="translate(1.2 1.2) scale(0.9)"
        d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.02Zm-7.01 15.24h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.21-8.23 8.21Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.25-.64.8-.78 1-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.16-.48-.28Z"
      />
    </svg>
  );
}
