export type HomeRide = {
  id: string;
  slug: string;
  name: string;
  place: string;
  seats: number;
  detail: string;
  pricePerDay: number;
  currency: string;
  image: string;
};

export type HomeRidePromo = {
  href: string;
  title: string;
  text: string;
  points: readonly string[];
  image: string;
  cta: string;
};

export const carHomeFallback: HomeRidePromo = {
  href: "/rentals/cars",
  title: "Cars for the trip",
  text: "Daily rates with clear pickup points before you reserve.",
  points: ["City and airport pickup", "Seat count on each car", "Daily rates shown upfront"],
  image: "/img/company/service-transfers.jpg",
  cta: "Browse cars",
};

export const bikeHomeFallback: HomeRidePromo = {
  href: "/rentals/bikes",
  title: "Bikes for the road",
  text: "Scooters and motorcycles by the day, with a helmet on the hire.",
  points: ["Scooter or motorcycle", "Helmet with the hire", "Mountain and coast routes"],
  image: "/img/bikes/bike-rental-banner.jpg",
  cta: "Browse bikes",
};
