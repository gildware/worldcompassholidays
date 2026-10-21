import Link from "next/link";
import { BrandLogo } from "@/components/worldcompassholiday/BrandLogo";
import { theme } from "@/config/theme";
import type { NavItem } from "@/lib/navigation";
import { whatsAppHref } from "@/lib/visa";

const exploreHrefs = ["/", "/destinations", "/tours", "/hotels"];

export function HomeFooter({ items }: { items: NavItem[] }) {
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
            <BrandLogo />
          </Link>
          <p>{theme.tagline}</p>
          <ul className="site-footer__reach">
            <li>
              <a href={`tel:${phone}`}>{theme.contact.phone}</a>
            </li>
            <li>
              <a href={`mailto:${theme.contact.email}`}>{theme.contact.email}</a>
            </li>
            {whatsapp ? (
              <li>
                <a href={whatsapp} target="_blank" rel="noreferrer">
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
