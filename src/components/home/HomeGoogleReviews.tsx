import { withGoogleReviewId, type GoogleReviewsSummary } from "@/lib/google-reviews";
import type { HomeReviewsContent } from "@/lib/home-page";
import "./home-google-reviews.css";

function Stars({ rating }: { rating: number }) {
  const value = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span className="home-g-reviews__stars" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < value ? "is-on" : undefined} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  );
}

export function HomeGoogleReviews({
  data,
  config,
  headingId,
}: {
  data: GoogleReviewsSummary | null;
  config: HomeReviewsContent;
  headingId: string;
}) {
  if (!data) return null;

  const hidden = new Set(config.hiddenIds.filter(Boolean));
  const cards = data.reviews
    .map((review) => withGoogleReviewId(review))
    .filter((review) => !hidden.has(review.id));
  if (!cards.length && data.total <= 0) return null;

  return (
    <section className="home-g-reviews" aria-labelledby={headingId}>
      <header className="home-g-reviews__head">
        <p className="home-g-reviews__kicker">Google reviews</p>
        <h2 id={headingId}>{config.title}</h2>
        {config.subtitle ? <p>{config.subtitle}</p> : null}
      </header>

      <div className="home-g-reviews__summary">
        <div className="home-g-reviews__score">
          <strong>{data.rating > 0 ? data.rating.toFixed(1) : "—"}</strong>
          <Stars rating={data.rating} />
          <span>
            {data.total} Google review{data.total === 1 ? "" : "s"}
          </span>
        </div>
        <a
          className="home-g-reviews__maps"
          href={data.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          See all on Google
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      {cards.length > 0 ? (
        <div className="home-g-reviews__scroller" role="region" aria-label="Google review cards">
          <ul className="home-g-reviews__list">
            {cards.map((review) => (
              <li key={review.id}>
                <div className="home-g-reviews__author">
                  {review.profilePhotoUrl ? (
                    // Google blocks hotlinked avatars unless referrer is omitted.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="home-g-reviews__photo"
                      src={review.profilePhotoUrl}
                      alt={`${review.authorName} profile photo`}
                      width={56}
                      height={56}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="home-g-reviews__avatar" aria-hidden="true">
                      {review.authorName.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <div>
                    {review.authorUrl ? (
                      <a href={review.authorUrl} target="_blank" rel="noopener noreferrer">
                        {review.authorName}
                      </a>
                    ) : (
                      <strong>{review.authorName}</strong>
                    )}
                    <div className="home-g-reviews__meta">
                      <Stars rating={review.rating} />
                      {review.relativeTime ? <span>{review.relativeTime}</span> : null}
                    </div>
                  </div>
                </div>
                {review.text ? <p>{review.text}</p> : <p className="is-quiet">Rated on Google</p>}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="home-g-reviews__credit">Reviews from Google</p>
    </section>
  );
}
