import { theme } from "@/config/theme";
import { HeroCatalogSearch } from "@/components/hero/HeroCatalogSearch";

const index = ({ coverUrl, title, description }) => {
  return (
    <section className="masthead -type-1 z-5">
      <div className="masthead__bg">
        <img
          alt="A mountain road planned by World Compass Holidays"
          src={coverUrl || "/img/masthead/1/bg.webp"}
          className="js-lazy"
        />
      </div>
      <div className="container">
        <div className="row justify-center">
          <div className="col-auto">
            <div className="text-center">
              <h1
                className="text-60 lg:text-40 md:text-30 text-white"
                data-aos="fade-up"
              >
                {title || theme.headline}
              </h1>
              <p
                className="text-white mt-6 md:mt-10"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                {description || theme.tagline}
              </p>
            </div>
            {/* End hero title */}

            <div data-aos="fade-up" data-aos-delay="200">
              <HeroCatalogSearch />
            </div>
            {/* End tab-filter */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default index;
