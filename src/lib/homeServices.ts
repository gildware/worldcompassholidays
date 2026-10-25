export type HomeVisaCard = {
  href: string;
  kicker: string;
  title: string;
  text: string;
  details: readonly string[];
  cta: string;
  image: string;
  alt: string;
};

export type HomeAssistCard = {
  href: string;
  code: string;
  title: string;
  text: string;
  details: readonly string[];
  cta: string;
  image: string;
  alt: string;
};

/** Tourist, business, family, and a document check — each card is its own file type. */
export const homeVisaServices: HomeVisaCard[] = [
  {
    href: "/visa-services",
    kicker: "Holiday",
    title: "Tourist visa",
    text: "Short stays and holidays. The photo rules, proof of funds, and the appointment window are checked before a form is filed.",
    details: ["Photo size checked", "Proof of funds", "Appointment window"],
    cta: "Start a tourist file",
    image: "/img/visa/visa-tourist.jpg",
    alt: "Passport and coffee on a sunlit cafe table",
  },
  {
    href: "/visa-services",
    kicker: "Work trip",
    title: "Business visa",
    text: "Meetings and trade visits. The invitation, company papers, and the travel plan are read as one file.",
    details: ["Invitation letter", "Company papers", "Travel plan in the file"],
    cta: "Start a business file",
    image: "/img/visa/visa-business.jpg",
    alt: "Passport and notebook on a boardroom table",
  },
  {
    href: "/visa-services",
    kicker: "Relatives",
    title: "Family visit",
    text: "Visiting family. The host letter, the relationship proof, and each traveller’s passport are lined up together.",
    details: ["Host letter", "Relationship proof", "One passport each"],
    cta: "Start a family file",
    image: "/img/visa/visa-family.jpg",
    alt: "A family looking out of an airport window",
  },
  {
    href: "/visa-services",
    kicker: "Before you file",
    title: "Document check",
    text: "A review before anything is sent. A missing page or the wrong photo size is caught while it can still be fixed.",
    details: ["Passport pages", "Photo size", "Dates against the rules"],
    cta: "Ask for a check",
    image: "/img/visa/visa-documents.jpg",
    alt: "Passport, envelope, and pen arranged on linen",
  },
];

/** Arrival, departure, a connection, and both ways — airport service, separate from visa. */
export const homeAssistServices: HomeAssistCard[] = [
  {
    href: "/meet-and-assist",
    code: "ARR",
    title: "Arrival meet",
    text: "A greeter waits in arrivals with your name and walks you out with the bags.",
    details: ["Name board in arrivals", "Walk to the car with the bags", "They follow the flight number"],
    cta: "Book an arrival",
    image: "/img/assist/assist-arrival.jpg",
    alt: "A greeter holding a name board in the arrivals hall",
  },
  {
    href: "/meet-and-assist",
    code: "DEP",
    title: "Departure assist",
    text: "Someone meets you at the terminal and stays through check-in and bag drop.",
    details: ["Meet at the terminal", "Check-in and bag drop", "Pointed on to security"],
    cta: "Book a departure",
    image: "/img/assist/assist-departure.jpg",
    alt: "Staff helping a traveller with a suitcase at check-in",
  },
  {
    href: "/meet-and-assist",
    code: "CXN",
    title: "Connection",
    text: "On a tight link they meet the inbound flight and walk you to the next gate.",
    details: ["Meet the inbound flight", "Walk to the next gate", "Built for a short connection"],
    cta: "Book a connection",
    image: "/img/assist/assist-transit.jpg",
    alt: "A greeter walking a traveller toward a departure gate",
  },
  {
    href: "/meet-and-assist",
    code: "RND",
    title: "Both ways",
    text: "Landing and the flight home. Two flight numbers, one quote, one name on both boards.",
    details: ["Arrival and departure", "Two flights, one quote", "Family on the same board"],
    cta: "Book both ways",
    image: "/img/assist/assist-family.jpg",
    alt: "A greeter walking a family and their luggage out of the airport",
  },
];
