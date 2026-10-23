export type HomeServiceCard = {
  href: string;
  title: string;
  text: string;
  cta: string;
  image: string;
  alt: string;
};

/** Visa, airport meet, and assist — featured on the home page. */
export const homeTravelDeskServices: HomeServiceCard[] = [
  {
    href: "/visa-services",
    title: "Visa help",
    text: "Document list and a clear service fee before you pay.",
    cta: "Get a visa quote",
    image: "/img/visa/visa-tourist.jpg",
    alt: "Passport and travel papers on a cafe table",
  },
  {
    href: "/meet-and-assist",
    title: "Airport meet",
    text: "A greeter waits at arrivals with your name and walks you out.",
    cta: "Book a meet",
    image: "/img/assist/assist-arrival.jpg",
    alt: "Greeter holding a name board in the arrivals hall",
  },
  {
    href: "/meet-and-assist",
    title: "Airport assist",
    text: "Departure check-in help or a connection walk between gates.",
    cta: "Book assist",
    image: "/img/assist/assist-departure.jpg",
    alt: "Traveller being guided through the departure terminal",
  },
];
