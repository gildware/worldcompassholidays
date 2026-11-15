import Link from "next/link";

const CallToActions = ({
  title = "Tell us the trip.",
  subtitle = "Full cost first — nothing booked until you approve.",
  buttonLabel = "Get a quote",
}) => {
  return (
    <section className="layout-pt-md layout-pb-md bg-dark-2">
      <div className="container">
        <div className="row y-gap-30 justify-between items-center">
          <div className="col-auto">
            <div className="row y-gap-20 flex-wrap items-center">
              <div className="col-auto">
                <div className="icon-newsletter text-60 sm:text-40 text-white" />
              </div>
              <div className="col-auto">
                <h2 className="text-26 text-white fw-600">{title}</h2>
                <div className="text-white">{subtitle}</div>
              </div>
            </div>
          </div>

          <div className="col-auto">
            <Link href="/contact" className="button -md h-60 bg-blue-1 text-white">
              {buttonLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActions;
