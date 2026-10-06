import type { Metadata } from "next";
import AddBanner from "@/components/add-banner/AddBanner";
import BlockGuide from "@/components/block/BlockGuide";
import Blog from "@/components/blog/Blog3";
import CallToActions from "@/components/common/CallToActions";
import PopularDestinations from "@/components/destinations/PopularDestinations";
import Hero1 from "@/components/hero/hero-1";
import Destinations from "@/components/home/home-1/Destinations";
import Testimonial from "@/components/home/home-1/Testimonial";
import TestimonialLeftCol from "@/components/home/home-1/TestimonialLeftCol";
import Hotels from "@/components/hotels/Hotels";
import SelectFilter from "@/components/hotels/filter-tabs/SelectFilter";
import { HomeFooter } from "@/components/gotrip/HomeFooter";
import { prisma } from "@/lib/db";
import { getPublicNav } from "@/lib/navigation";

function popularHoverText(
  counts: { hotels: number; rentals: number; tours: number },
  region: string,
  country: string,
) {
  const parts = [
    counts.hotels
      ? `${counts.hotels} Hotel${counts.hotels === 1 ? "" : "s"}`
      : null,
    counts.rentals
      ? `${counts.rentals} Rental${counts.rentals === 1 ? "" : "s"}`
      : null,
    counts.tours ? `${counts.tours} Tour${counts.tours === 1 ? "" : "s"}` : null,
  ].filter((part): part is string => Boolean(part));

  return parts.length > 0 ? parts.join(" - ") : `${region}, ${country}`;
}

export const metadata: Metadata = {
  title: {
    absolute: "Home-1 || GoTrip - Travel & Tour React NextJS Template",
  },
  description: "GoTrip - Travel & Tour React NextJS Template",
};

export default async function Page() {
  const items = getPublicNav();
  const popularDestinations = await prisma.destination.findMany({
    where: { published: true, popular: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      region: true,
      country: true,
      imageUrl: true,
      tours: { where: { published: true }, select: { id: true } },
      tourLinks: {
        where: { tour: { published: true } },
        select: { tourId: true },
      },
      hotels: { where: { published: true }, select: { id: true } },
      vehicles: { where: { published: true }, select: { id: true } },
    },
  });

  return (
    <>
      <Hero1 />

      <section className="layout-pt-lg layout-pb-md" data-aos="fade-up">
        <div className="container">
          <div className="row y-gap-20 justify-between items-end">
            <div className="col-auto">
              <div className="sectionTitle -md">
                <h2 className="sectionTitle__title">Popular Destinations</h2>
                <p className=" sectionTitle__text mt-5 sm:mt-0">
                  These popular destinations have a lot to offer
                </p>
              </div>
            </div>
            <div className="col-auto md:d-none">
              <a
                href="/destinations"
                className="button -md -blue-1 bg-blue-1-05 text-blue-1"
              >
                View All Destinations
                <div className="icon-arrow-top-right ml-15" />
              </a>
            </div>
          </div>
          <div className="relative pt-40 sm:pt-20">
            <PopularDestinations
              destinations={popularDestinations.map((destination) => ({
                id: destination.id,
                slug: destination.slug,
                name: destination.name,
                imageUrl: destination.imageUrl,
                hoverText: popularHoverText(
                  {
                    hotels: destination.hotels.length,
                    rentals: destination.vehicles.length,
                    tours: new Set([
                      ...destination.tours.map((tour) => tour.id),
                      ...destination.tourLinks.map((link) => link.tourId),
                    ]).size,
                  },
                  destination.region,
                  destination.country,
                ),
              }))}
            />
          </div>
        </div>
      </section>

      <section className="layout-pt-md layout-pb-md">
        <div className="container">
          <div className="row y-gap-20">
            <AddBanner />
          </div>
        </div>
      </section>

      <section className="layout-pt-md layout-pb-md">
        <div className="container">
          <div className="row y-gap-10 justify-between items-end">
            <div className="col-auto">
              <div className="sectionTitle -md">
                <h2 className="sectionTitle__title">Recommended</h2>
                <p className=" sectionTitle__text mt-5 sm:mt-0">
                  Interdum et malesuada fames ac ante ipsum
                </p>
              </div>
            </div>
            <div className="col-sm-auto">
              <SelectFilter />
            </div>
          </div>
          <div className="relative overflow-hidden pt-40 sm:pt-20 js-section-slider item_gap-x30">
            <Hotels />
          </div>
        </div>
      </section>

      <section className="layout-pt-md layout-pb-lg">
        <div className="container">
          <div className="row y-gap-20 justify-between">
            <BlockGuide />
          </div>
        </div>
      </section>

      <section className="layout-pt-lg layout-pb-lg bg-blue-2">
        <div className="container">
          <div className="row y-gap-40 justify-between">
            <div className="col-xl-5 col-lg-6" data-aos="fade-up">
              <TestimonialLeftCol />
            </div>
            <div className="col-lg-6">
              <div
                className="overflow-hidden js-testimonials-slider-3"
                data-aos="fade-up"
                data-aos-delay="50"
              >
                <Testimonial />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="layout-pt-lg layout-pb-md">
        <div className="container">
          <div className="row justify-center text-center">
            <div className="col-auto">
              <div className="sectionTitle -md">
                <h2 className="sectionTitle__title">
                  Get inspiration for your next trip
                </h2>
                <p className=" sectionTitle__text mt-5 sm:mt-0">
                  Interdum et malesuada fames
                </p>
              </div>
            </div>
          </div>
          <div className="row y-gap-30 pt-40">
            <Blog />
          </div>
        </div>
      </section>

      <section className="layout-pt-md layout-pb-lg">
        <div className="container">
          <div className="row">
            <div className="col-auto">
              <div className="sectionTitle -md">
                <h2 className="sectionTitle__title">Destinations we love</h2>
                <p className=" sectionTitle__text mt-5 sm:mt-0">
                  Interdum et malesuada fames ac ante ipsum
                </p>
              </div>
            </div>
          </div>
          <div className="tabs -pills pt-40 js-tabs">
            <Destinations />
          </div>
        </div>
      </section>

      <CallToActions />
      <HomeFooter items={items} />
    </>
  );
}
