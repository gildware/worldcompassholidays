import Image from "next/image";
import Link from "next/link";
import type { HomeServiceCard } from "@/lib/homeServices";

export function HomeServiceCards({
  items,
}: {
  items: HomeServiceCard[];
}) {
  if (items.length === 0) return null;

  const col =
    items.length >= 4
      ? "col-lg-3 col-sm-6"
      : items.length === 3
        ? "col-lg-4 col-sm-6"
        : "col-lg-6 col-sm-6";

  return (
    <div className="row y-gap-30">
      {items.map((item, index) => (
        <div className={col} key={`${item.href}-${item.title}`}>
          <Link
            href={item.href}
            className="citiesCard -type-1 d-block rounded-4 home-service-card"
          >
            <div className="citiesCard__image ratio ratio-3:4">
              <Image
                width={400}
                height={520}
                src={item.image}
                alt={item.alt}
                className="js-lazy"
                loading={index < 3 ? "eager" : "lazy"}
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="citiesCard__content d-flex flex-column justify-between text-center pt-30 pb-20 px-20">
              <div className="citiesCard__bg" />
              <div className="citiesCard__top">
                <div className="text-14 text-white">{item.text}</div>
              </div>
              <div className="citiesCard__bottom">
                <h3 className="text-26 md:text-20 lh-13 text-white mb-20">
                  {item.title}
                </h3>
                <span className="button col-12 h-60 -blue-1 bg-white text-dark-1 d-flex items-center justify-center">
                  {item.cta}
                </span>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
