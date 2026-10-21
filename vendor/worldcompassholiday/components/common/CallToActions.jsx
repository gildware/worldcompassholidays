import Link from "next/link";

const CallToActions = () => {
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
                <h2 className="text-26 text-white fw-600">Tell us the trip. We quote it before you pay.</h2>
                <div className="text-white">
                  Tours, hotels, visas, airport meet and assist, and car or bike rental.
                </div>
              </div>
            </div>
          </div>

          <div className="col-auto">
            <Link href="/contact" className="button -md h-60 bg-blue-1 text-white">
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActions;
