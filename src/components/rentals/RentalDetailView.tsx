import Link from "next/link";
import { BookNowButton, RentalBookProvider, type RentalBookingOptions } from "@/components/rentals/BookRentalModal";
import { RentalGallery } from "@/components/rentals/RentalGallery";
import { iconForFeature, RentalIcon, type RentalIconName } from "@/components/rentals/rental-icons";
import { formatMoney } from "@/lib/format";
import type { RentalQuote } from "@/lib/rentals/pricing";

type Fact = { label: string; value: string; icon: RentalIconName };
type Named = { id: string; name: string };
type Rule = { id: string; name: string; description: string };
type Addon = { id: string; name: string; price: number; priceUnit: string };
type Place = { id: string; name: string; address: string };
type RelatedVehicle = {
  slug: string;
  name: string;
  typeName: string;
  meta: string;
  priceLabel: string;
  imageUrl: string;
  href: string;
};

export type RentalDetailViewProps = {
  name: string;
  summary: string;
  description: string;
  kindLabel: string;
  vehicleFacts: Fact[];
  specFacts: Fact[];
  images: { id: string; url: string }[];
  included: Named[];
  excluded: Named[];
  prices: { label: string; value: string }[];
  rules: Rule[];
  addons: Addon[];
  handover: { counter: boolean; delivery: boolean; locations: Place[] };
  currency: string;
  pricePerDay: number;
  securityDeposit: number;
  extraKmCharge: number;
  lateReturnCharge: number;
  includedKmPerDay: number;
  quote: RentalQuote | null;
  pickupLabel: string;
  returnLabel: string;
  place: string;
  placeDetail: string;
  deliveryNote: string;
  fleetHref: string;
  fleetName: string;
  backHref: string;
  available: boolean;
  availabilityNote: string;
  relatedTitle: string;
  related: RelatedVehicle[];
  booking: RentalBookingOptions;
};

function pricedLine(label: string, currency: string) {
  return label.replace(/× (\d+)$/, (_, amount: string) => `× ${formatMoney(Number(amount), currency)}`);
}

export function RentalDetailView(props: RentalDetailViewProps) {
  const {
    name,
    summary,
    description,
    kindLabel,
    vehicleFacts,
    specFacts,
    images,
    included,
    excluded,
    prices,
    rules,
    addons,
    handover,
    currency,
    pricePerDay,
    securityDeposit,
    extraKmCharge,
    lateReturnCharge,
    includedKmPerDay,
    quote,
    pickupLabel,
    returnLabel,
    place,
    placeDetail,
    deliveryNote,
    fleetHref,
    fleetName,
    backHref,
    available,
    availabilityNote,
    relatedTitle,
    related,
    booking,
  } = props;
  const tripKm = quote && includedKmPerDay > 0 ? includedKmPerDay * quote.days : 0;
  const headline = quote ? formatMoney(quote.totalAmount, currency) : formatMoney(pricePerDay, currency);
  const headlineUnit = quote ? `for ${quote.days} day${quote.days === 1 ? "" : "s"}` : "/ day";

  return (
    <RentalBookProvider booking={booking}>
      <article className="rental-detail">
        <nav aria-label="Breadcrumb" className="rental-detail__crumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href={fleetHref}>{fleetName}</Link>
          <span aria-hidden="true">/</span>
          <span>{name}</span>
        </nav>

        <div className="rental-detail__layout">
          <div className="rental-detail__main">
            <RentalGallery images={images} name={name} />

            <header className="rental-detail__intro">
              <p className="rental-detail__kicker">{kindLabel}</p>
              <h1>{name}</h1>
              {summary ? <p className="rental-detail__lead">{summary}</p> : null}
              {vehicleFacts.length > 0 ? (
                <p className="rental-detail__meta">
                  {vehicleFacts.map((fact) => fact.value).join(" · ")}
                </p>
              ) : null}
            </header>

            {specFacts.length > 0 ? (
              <ul className="rental-highlights">
                {specFacts.map((fact) => (
                  <li key={fact.label}>
                    <RentalIcon name={fact.icon} />
                    <span>{fact.label}</span>
                    <strong>{fact.value}</strong>
                  </li>
                ))}
              </ul>
            ) : null}

            {description ? <p className="rental-detail__about">{description}</p> : null}

            <section className="rental-block">
              <h2 className="rental-block__title">
                <RentalIcon name="ride" />
                Comes with the ride
              </h2>
              <div className="rental-cover">
                <div className="rental-cover__col is-in">
                  <h3>
                    <RentalIcon name="check" />
                    Included
                  </h3>
                  {included.length > 0 ? (
                    <ul>
                      {included.map((item) => (
                        <li key={item.id}>
                          <RentalIcon name={iconForFeature(item.name)} />
                          {item.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>The rate covers the vehicle itself.</p>
                  )}
                </div>
                {excluded.length > 0 ? (
                  <div className="rental-cover__col is-out">
                    <h3>
                      <RentalIcon name="minus" />
                      Not included
                    </h3>
                    <ul>
                      {excluded.map((item) => (
                        <li key={item.id}>
                          <RentalIcon name={iconForFeature(item.name, "minus")} />
                          {item.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="rental-block">
              <h2>The rate</h2>
              <div className="rental-rate">
                <p>
                  <strong>{formatMoney(pricePerDay, currency)}</strong>
                  <span>per day, before dates</span>
                </p>
                <ul>
                  {prices.slice(1).map((row) => (
                    <li key={row.label}>
                      <span>{row.label}</span>
                      <strong>{row.value}</strong>
                    </li>
                  ))}
                </ul>
              </div>
              {addons.length > 0 ? (
                <ul className="rental-addons">
                  {addons.map((addon) => (
                    <li key={addon.id}>
                      <RentalIcon name="tag" />
                      <span>{addon.name}</span>
                      <strong>
                        {formatMoney(addon.price, currency)}
                        {addon.priceUnit === "per_day" ? " / day" : " once"}
                      </strong>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>

            <section className="rental-block">
              <h2>Where you collect it</h2>
              {handover.delivery || handover.counter ? (
                <p className="rental-collect">
                  {handover.delivery && handover.counter
                    ? "Pickup and drop are available at your location, or you can pick up and drop at our location."
                    : handover.delivery
                      ? "Pickup and drop are available at your location."
                      : "You pick up and drop the vehicle at our location."}
                </p>
              ) : null}
              {handover.counter && handover.locations.length > 0 ? (
                <ul className="rental-places">
                  {handover.locations.map((location) => (
                    <li key={location.id}>
                      <RentalIcon name="pin" />
                      <div>
                        <strong>{location.name}</strong>
                        {location.address ? <span>{location.address}</span> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
              {rules.length > 0 ? (
                <dl className="rental-detail__rules">
                  {rules.map((rule) => (
                    <div key={rule.id}>
                      <dt>{rule.name}</dt>
                      <dd>{rule.description}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </section>
          </div>

          <aside className="rental-detail__quote">
            <div className="rental-detail__offer">
              <p className="rental-detail__availability" data-state={available ? "open" : "closed"}>
                {availabilityNote}
              </p>
              <p className="rental-detail__price">
                <strong>{headline}</strong>
                <span>{headlineUnit}</span>
              </p>
            </div>
            <div className="rental-detail__offer-body">
            {pickupLabel && returnLabel ? (
              <div className="rental-detail__when">
                <p>
                  <span>Pickup</span>
                  <strong>{pickupLabel}</strong>
                </p>
                <p>
                  <span>Return</span>
                  <strong>{returnLabel}</strong>
                </p>
              </div>
            ) : null}
            {place ? (
              <p className="rental-detail__place">
                <span>Pickup at</span>
                <strong>{place}</strong>
                {placeDetail ? <em>{placeDetail}</em> : null}
              </p>
            ) : null}
            {deliveryNote ? <p className="rental-detail__note">{deliveryNote}</p> : null}

            <dl className="rental-detail__lines">
              {quote
                ? quote.lines.map((line) => (
                    <div key={line.label}>
                      <dt>{pricedLine(line.label, currency)}</dt>
                      <dd>{formatMoney(line.amount, currency)}</dd>
                    </div>
                  ))
                : (
                    <div>
                      <dt>Daily rate</dt>
                      <dd>{formatMoney(pricePerDay, currency)}</dd>
                    </div>
                  )}
              {quote && quote.taxAmount > 0 ? (
                <div>
                  <dt>Tax ({quote.taxPercent}%)</dt>
                  <dd>{formatMoney(quote.taxAmount, currency)}</dd>
                </div>
              ) : null}
              {securityDeposit > 0 ? (
                <div>
                  <dt>Refundable deposit</dt>
                  <dd>{formatMoney(securityDeposit, currency)}</dd>
                </div>
              ) : null}
              {quote ? (
                <div className="is-total">
                  <dt>Due now</dt>
                  <dd>{formatMoney(quote.amountDue, currency)}</dd>
                </div>
              ) : null}
            </dl>

            <ul className="rental-detail__fine">
              <li>
                {includedKmPerDay > 0
                  ? `${includedKmPerDay} km included per day${tripKm > 0 ? ` · ${tripKm.toLocaleString("en-IN")} km on this trip` : ""}`
                  : "Unlimited kilometres"}
              </li>
              {extraKmCharge > 0 ? <li>{formatMoney(extraKmCharge, currency)} per extra km</li> : null}
              {lateReturnCharge > 0 ? <li>Late return {formatMoney(lateReturnCharge, currency)} an hour</li> : null}
            </ul>

            <BookNowButton
              className="rental-detail__book"
              disabled={!available}
              signedIn={booking.signedIn}
              loginHref={booking.loginHref}
            >
              {available ? (booking.signedIn ? "Book now" : "Login to book now") : "Not available"}
            </BookNowButton>
            <Link href={backHref} className="rental-detail__back">
              Back to search
            </Link>
            </div>
          </aside>
        </div>

        {related.length > 0 ? (
          <section className="rental-related" aria-labelledby="related-vehicles">
            <h2 id="related-vehicles">{relatedTitle}</h2>
            <ul className="rental-related__list">
              {related.map((item) => (
                <li key={item.slug} className="rental-related__item">
                  <Link href={item.href} className="rental-related__row">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt="" className="rental-related__photo" />
                    ) : (
                      <span className="rental-related__photo is-empty">No photo</span>
                    )}
                    <span className="rental-related__copy">
                      {item.typeName ? <span className="rental-related__type">{item.typeName}</span> : null}
                      <strong>{item.name}</strong>
                      {item.meta ? <span className="rental-related__meta">{item.meta}</span> : null}
                    </span>
                    <span className="rental-related__price">
                      <strong>{item.priceLabel}</strong>
                      <span>/ day</span>
                    </span>
                  </Link>
                  <Link href={item.href} className="rental-related__book">
                    View more
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="rental-detail__dock">
          <p>
            <strong>{headline}</strong>
            <span>{headlineUnit}</span>
          </p>
          <BookNowButton
            className="rental-detail__dock-book"
            disabled={!available}
            signedIn={booking.signedIn}
            loginHref={booking.loginHref}
          >
            {available ? (booking.signedIn ? "Book now" : "Login to book") : "Unavailable"}
          </BookNowButton>
        </div>
      </article>
    </RentalBookProvider>
  );
}
