import Link from "next/link";
import ContactInfo from "@/components/footer/default/ContactInfo";
import Social from "@/components/common/social/Social";
import { theme } from "@/config/theme";
import type { NavItem } from "@/lib/navigation";

export function HomeFooter({ items }: { items: NavItem[] }) {
  return (
    <footer className="footer -type-1">
      <div className="container">
        <div className="pt-60 pb-60">
          <div className="row y-gap-40 justify-between xl:justify-start">
            <div className="col-xl-2 col-lg-4 col-sm-6">
              <h5 className="text-16 fw-500 mb-30">Contact Us</h5>
              <ContactInfo />
            </div>
            <div className="col-xl-2 col-lg-4 col-sm-6">
              <h5 className="text-16 fw-500 mb-30">Explore</h5>
              <div className="d-flex y-gap-10 flex-column">
                {items.map((item) => (
                  <Link href={item.href} key={item.href}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="py-20 border-top-light">
          <div className="row justify-between items-center y-gap-10">
            <div className="col-auto">
              © {new Date().getFullYear()} {theme.brandName}. All rights reserved.
            </div>
            <div className="col-auto">
              <div className="d-flex x-gap-20 items-center">
                <Social />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
