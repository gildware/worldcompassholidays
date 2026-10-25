import { modules } from "@/config/modules";
import { theme } from "@/config/theme";

export const companyUpdated = "25 October 2026";

export const company = {
  tradeName: theme.brandName,
  legalName: "Negotrip Private Limited",
  dmcLine: "DMC by Negotrip Private Limited",
  motto: "Explore. Experience. Discover.",
  contactName: "Suhaib Khurshid",
  phone: theme.contact.phone,
  email: theme.contact.email,
  whatsapp: theme.contact.whatsapp,
} as const;

export const branches = [
  {
    city: "Bhubaneswar",
    detail: "Odisha desk. Our own vehicles are based here.",
    fleet: true,
  },
  {
    city: "Chandigarh",
    detail: "North India desk. Our own vehicles are based here.",
    fleet: true,
  },
  {
    city: "Andaman",
    detail: "Island desk. Our own vehicles are based here.",
    fleet: true,
  },
  {
    city: "Himachal",
    detail: "Hill and pilgrim routes, quoted before you travel.",
    fleet: false,
  },
  {
    city: "Kolkata",
    detail: "East India desk for holidays and onward travel.",
    fleet: false,
  },
  {
    city: "Kashmir",
    detail: "The newest desk, for the valley and the high roads.",
    fleet: false,
  },
] as const;

export const signServices = [
  {
    title: "Flights",
    image: "/img/company/service-flights.jpg",
    alt: "An illustrated aircraft above snow peaks and a far coast",
    text: "Domestic and international flights are arranged inside a holiday. The fare and the airline’s change rule are written into the quote before you pay.",
    href: "/contact",
    action: "Ask for a fare",
  },
  {
    title: "Hotels",
    image: "/img/company/service-hotels.jpg",
    alt: "An illustrated hillside lodge with lit windows",
    text: "Read the stays on this site, or send a city that is not listed. We search and come back with a price. The room is held only after you accept it.",
    href: "/hotels",
    action: "See hotels",
  },
  {
    title: "Transfers",
    image: "/img/company/service-transfers.jpg",
    alt: "An illustrated car on a coastal road toward an airport",
    text: "Airport, station, and city transfers. Our own vehicles run in Chandigarh, Bhubaneswar, and the Andaman. In other cities the car is named in the quote.",
    href: "/rentals/cars",
    action: "See cars",
  },
  {
    title: "Holidays",
    image: "/img/company/service-holidays.jpg",
    alt: "An illustrated lake and snow peaks",
    text: "Holidays in India and abroad, shaped around the place and the dates you want. The plan and the price arrive together.",
    href: "/destinations",
    action: "See destinations",
  },
  {
    title: "Sightseeing",
    image: "/img/company/service-sightseeing.jpg",
    alt: "An illustrated shrine beside a mountain lake",
    text: "A day out, a shrine, a valley, or a coast road, with the timing and the car written down before you leave.",
    href: "/tours",
    action: "See tours",
  },
  {
    title: "Tour packages",
    image: "/img/company/service-packages.jpg",
    alt: "A suitcase, a compass, and a blank map on a desk",
    text: "Stay, transfers, and the days out, quoted as one trip. You accept the whole plan, or you ask us to change it first.",
    href: "/tours",
    action: "See packages",
  },
] as const;

export const moreServices = [
  {
    title: "Visa services",
    text: "Document lists and filing for Indian passports. The embassy fee stays separate from our service fee.",
    href: "/visa-services",
    action: "Visa help",
  },
  {
    title: "Meet and assist",
    text: "Someone at the airport to meet you, handle the bags, and take you to the car.",
    href: "/meet-and-assist",
    action: "Airport meet",
  },
  ...(modules.bikes
    ? [
        {
          title: "Bike rental",
          text: "Bikes for the hill roads and the coast, with the licence and distance rules on the bike page.",
          href: "/rentals/bikes",
          action: "See bikes",
        },
      ]
    : []),
] as const;

export const companyLinks = [
  { href: "/about", label: "Read about us" },
  { href: "/help", label: "Get help" },
  { href: "/sitemap", label: "See all pages" },
  { href: "/terms", label: "Terms and conditions" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/cancellation", label: "Cancellation and refunds" },
] as const;

export const policyLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/cancellation", label: "Cancellation" },
] as const;

export type PolicyBlock =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] };

export type PolicySection = {
  id: string;
  title: string;
  blocks: PolicyBlock[];
};

export type PolicyPage = {
  eyebrow: string;
  title: string;
  description: string;
  path: string;
  sections: PolicySection[];
};

const who = `${company.tradeName} is the name on the door. The company behind it is ${company.legalName}, the destination management company named on our office board.`;

export const termsPage: PolicyPage = {
  eyebrow: "Terms",
  title: "Terms and conditions",
  description:
    "How a World Compass Holidays enquiry becomes a confirmed trip, what a quote covers, and what you agree to when you accept it.",
  path: "/terms",
  sections: [
    {
      id: "who",
      title: "Who you are dealing with",
      blocks: [
        { kind: "p", text: who },
        {
          kind: "p",
          text: `Call or WhatsApp ${company.phone} and ask for ${company.contactName}, or write to ${company.email}. If you need the registered office address for a notice, ask by email and we will send it.`,
        },
      ],
    },
    {
      id: "site",
      title: "What this website does",
      blocks: [
        {
          kind: "p",
          text: "You can read destinations, tours, hotels, cars, and bikes, and you can send a request for a visa or an airport meet. A price on a page, and a form you submit, is a request for a plan.",
        },
        {
          kind: "p",
          text: "A seat, a room, a vehicle, or a visa appointment is confirmed when we send a written quote and you accept it. Until that acceptance, the trip is still a conversation.",
        },
      ],
    },
    {
      id: "quotes",
      title: "Quotes",
      blocks: [
        {
          kind: "p",
          text: "A quote names the dates, who is travelling, what is included, what is extra, and the price. If a hotel, an airline, or an embassy changes a figure before you accept, we send the new figure and wait.",
        },
        {
          kind: "p",
          text: "Embassy and government fees are written apart from our service fee. GST is included only when the quote, or the page you are reading, says so.",
        },
      ],
    },
    {
      id: "your-part",
      title: "What we need from you",
      blocks: [
        {
          kind: "p",
          text: "Names, dates of birth, and document numbers need to match the passport or the driving licence. A wrong date can ground a ticket or a visa file.",
        },
        {
          kind: "ul",
          items: [
            "You keep passports, visas, and permits valid, unless the accepted quote says we are filing that visa for you.",
            "The person who drives one of our vehicles carries a valid licence for that vehicle class.",
            "You send another person’s documents only with their permission.",
            "You tell us about health, mobility, or diet needs before the quote is accepted, so the plan can include them.",
          ],
        },
      ],
    },
    {
      id: "paying",
      title: "Paying",
      blocks: [
        {
          kind: "p",
          text: "Sending an enquiry is free. After you accept a quote, we tell you the amount and how to pay. The booking stands when we confirm that the payment has reached us.",
        },
      ],
    },
    {
      id: "suppliers",
      title: "Hotels, airlines, and our own cars",
      blocks: [
        {
          kind: "p",
          text: "Many stays, flights, and park entries are run by independent suppliers. Their baggage rules, check-in times, and house rules apply, and they are named in the quote.",
        },
        {
          kind: "p",
          text: "Where the car is from our own fleet, the vehicle page states the licence, fuel, and distance rules. Those rules travel with the booking.",
        },
      ],
    },
    {
      id: "changes",
      title: "Weather, roads, and embassies",
      blocks: [
        {
          kind: "p",
          text: "A closed road, a delayed flight, or an embassy decision can move a day. We tell you when we know, and we offer the closest plan that can still run. The supplier’s own rule, when there is one, is the rule in your quote.",
        },
      ],
    },
    {
      id: "responsibility",
      title: "What we are responsible for",
      blocks: [
        {
          kind: "p",
          text: "We are responsible for the coordination we agreed in the accepted quote: the booking we placed, the car we sent, the file we submitted. The airline, the hotel, and the embassy remain responsible for their own service.",
        },
        {
          kind: "p",
          text: "A loss that comes from a detail that was wrong in the information you gave us, or from a decision by a government or a supplier, sits outside the work we agreed to do.",
        },
      ],
    },
    {
      id: "using-the-site",
      title: "Using the site and your account",
      blocks: [
        {
          kind: "p",
          text: "Use the site to plan a real trip. An account belongs to the person who created it. Keep the sign-in to yourself. We may close an account that is used to scrape the catalogue, to send false documents, or to interfere with another guest’s booking.",
        },
      ],
    },
    {
      id: "changes-to-terms",
      title: "If these terms change",
      blocks: [
        {
          kind: "p",
          text: "The date at the top of this page is the date of the current terms. A trip you have already accepted keeps the terms that were in that quote.",
        },
      ],
    },
    {
      id: "law",
      title: "Law",
      blocks: [
        {
          kind: "p",
          text: "These terms are read under the laws of India. Questions about a live booking start with a message to the email on this page, so we can sort it before anyone needs a formal notice.",
        },
      ],
    },
  ],
};

export const privacyPage: PolicyPage = {
  eyebrow: "Privacy",
  title: "Privacy policy",
  description:
    "What World Compass Holidays collects when you enquire or book, why we keep it, and who else sees it.",
  path: "/privacy",
  sections: [
    {
      id: "who",
      title: "Who holds your details",
      blocks: [
        { kind: "p", text: who },
        {
          kind: "p",
          text: `Privacy questions go to ${company.email}, or to ${company.contactName} on ${company.phone}.`,
        },
      ],
    },
    {
      id: "what",
      title: "What we collect",
      blocks: [
        {
          kind: "ul",
          items: [
            "Your name, email, and phone, so we can reply.",
            "The trip you asked for: places, dates, number of guests, and the notes you typed.",
            "Passport or licence details when a ticket, a visa file, or a rental needs them.",
            "Payment references after you accept a quote, so we can match the money to the booking.",
            "A sign-in cookie if you create an account. Browsing the site without an account does not require one.",
          ],
        },
      ],
    },
    {
      id: "why",
      title: "Why we use it",
      blocks: [
        {
          kind: "p",
          text: "We use these details to quote the trip, to place it with a hotel, an airline, a driver, or a visa centre after you accept, and to answer you later about the same booking. We also keep records the tax rules require.",
        },
        {
          kind: "p",
          text: "We use your phone and email to talk about the trip you asked for. We do not sell address lists, and we do not hand your details to advertisers.",
        },
      ],
    },
    {
      id: "sharing",
      title: "Who else sees it",
      blocks: [
        {
          kind: "p",
          text: "A supplier sees the slice they need to do their part. A hotel gets the guest names and the dates. An airline or a visa centre gets the passport details the form requires. A driver gets the pickup time and a phone number.",
        },
        {
          kind: "p",
          text: "We share a record if a bank, a court, or a government office requires it for that booking. We tell you when the law lets us tell you.",
        },
      ],
    },
    {
      id: "keeping",
      title: "How long we keep it",
      blocks: [
        {
          kind: "p",
          text: "We keep a booking for as long as we need it to run the trip, to answer a dispute, and to meet Indian record-keeping rules. An enquiry that never became a booking is kept only while we are still in conversation, then removed from the working desk.",
        },
      ],
    },
    {
      id: "your-choices",
      title: "Correcting or removing a detail",
      blocks: [
        {
          kind: "p",
          text: `Write to ${company.email} and say what should change. We correct details that are wrong. We delete what we no longer need, except where a booking record or a tax record has to stay.`,
        },
        {
          kind: "p",
          text: "A parent or guardian sends a child’s details as part of a family booking. We do not open accounts for children.",
        },
      ],
    },
    {
      id: "device",
      title: "Your phone or computer",
      blocks: [
        {
          kind: "p",
          text: "The cookie policy explains the sign-in cookie and the notes this site stores on your device, such as a recent search or a tour option you selected. Those notes stay on the device.",
        },
      ],
    },
  ],
};

export const cancellationPage: PolicyPage = {
  eyebrow: "Cancellation",
  title: "Cancellation and refunds",
  description:
    "How to cancel a World Compass Holidays trip, and how refunds work for cars, stays, tours, flights, and visas.",
  path: "/cancellation",
  sections: [
    {
      id: "before-you-accept",
      title: "Before you accept a quote",
      blocks: [
        {
          kind: "p",
          text: "An enquiry can be dropped at any time. There is nothing to refund, because an enquiry is not a payment.",
        },
      ],
    },
    {
      id: "after-you-accept",
      title: "After you accept",
      blocks: [
        {
          kind: "p",
          text: "The cancellation rule for that trip is the one written in the quote you accepted. If the quote and this page ever differ, the quote is the one we follow.",
        },
        {
          kind: "p",
          text: `Tell us in writing, by email to ${company.email} or by WhatsApp to ${company.phone}, and keep the reply. The time we receive the message is the cancellation time.`,
        },
      ],
    },
    {
      id: "cars",
      title: "Cars and bikes",
      blocks: [
        {
          kind: "p",
          text: "Each vehicle page shows its own cancellation rule when one has been set. Where a vehicle has no special rule, the house standard is a full refund of the rental charges if you cancel at least 48 hours before pickup, and half of those charges if you cancel at least 24 hours before pickup.",
        },
        {
          kind: "p",
          text: "Inside 24 hours, the refund follows the rule on that vehicle page or in the quote. Fuel, extra kilometres already driven, and add-ons already used are settled on return.",
        },
      ],
    },
    {
      id: "stays",
      title: "Hotels and tour packages",
      blocks: [
        {
          kind: "p",
          text: "The quote names the last day you can cancel that stay or that departure. A hotel, a camp, or a park permit can set an earlier date. That date is in the quote before you accept it.",
        },
      ],
    },
    {
      id: "flights",
      title: "Flights",
      blocks: [
        {
          kind: "p",
          text: "An airline fare follows the airline’s rule. The quote says whether the fare can be changed or refunded, and what the airline keeps, before you accept it.",
        },
      ],
    },
    {
      id: "visa",
      title: "Visas",
      blocks: [
        {
          kind: "p",
          text: "Our service fee and the embassy fee are separate. We file nothing until you accept the quote. Once an embassy or a visa centre has taken its fee, that fee follows their rule. We say so before you accept.",
        },
      ],
    },
    {
      id: "refunds",
      title: "How a refund is paid",
      blocks: [
        {
          kind: "p",
          text: "A refund goes back by the same route the payment arrived, unless you ask for another route we can actually pay. The bank or card network sets its own timing after we release the amount.",
        },
        {
          kind: "p",
          text: "If we cancel because we cannot run the trip, we tell you at once and refund the money you paid us for the part that will not happen.",
        },
      ],
    },
  ],
};

export const cookiesPage: PolicyPage = {
  eyebrow: "Cookies",
  title: "Cookie policy",
  description:
    "The sign-in cookie World Compass Holidays uses, and the notes the site stores on your device.",
  path: "/cookies",
  sections: [
    {
      id: "cookie",
      title: "The sign-in cookie",
      blocks: [
        {
          kind: "p",
          text: "If you sign in, the site places a cookie named session. It holds a random key that matches your account on our server. The cookie is httpOnly, so page scripts cannot read it, and it is sent only to this site.",
        },
        {
          kind: "ul",
          items: [
            "A guest account stays signed in for 30 days, or until you sign out.",
            "A staff account stays signed in for 12 hours.",
            "On the live site the cookie is marked secure, so the browser sends it only over a protected connection.",
          ],
        },
        {
          kind: "p",
          text: "Browsing tours, hotels, and destinations does not set this cookie. It appears when you sign in.",
        },
      ],
    },
    {
      id: "device",
      title: "Notes stored on your device",
      blocks: [
        {
          kind: "p",
          text: "The site can remember a few things in your browser’s own storage: recent searches, a tour option you selected on a trip page, and whether you closed the “install the app” prompt. Those notes stay on your phone or computer. Clearing the browser’s site data removes them.",
        },
      ],
    },
    {
      id: "ads",
      title: "Advertising and analytics",
      blocks: [
        {
          kind: "p",
          text: "This site does not set advertising cookies, and it does not run a third-party analytics tag. If that changes, this page will name the tool and the date will move.",
        },
      ],
    },
    {
      id: "staff",
      title: "The staff desk",
      blocks: [
        {
          kind: "p",
          text: "People who work on the booking desk have their own sign-in. A short notice cookie may be used inside the admin pages. It is not placed on a guest who is only reading the public site.",
        },
      ],
    },
    {
      id: "choice",
      title: "Your choice",
      blocks: [
        {
          kind: "p",
          text: "You can block cookies in the browser. The public pages still open. Sign-in needs the session cookie, so an account will not stay open if cookies are blocked.",
        },
      ],
    },
  ],
};

export const helpFaqs = [
  {
    title: "How does a booking start?",
    content:
      "Tell us the place, the dates, and who is travelling. Use the form on a tour, hotel, car, visa, or contact page, or message us on WhatsApp. We reply with a plan and a price.",
  },
  {
    title: "When do I pay?",
    content:
      "You pay after you accept a written quote. Sending the enquiry is free. The booking stands when we confirm that the payment has reached us.",
  },
  {
    title: "Where are the offices?",
    content:
      "Bhubaneswar, Chandigarh, the Andaman, Himachal, Kolkata, and Kashmir. Kashmir is the newest desk. Our own vehicles are based in Chandigarh, Bhubaneswar, and the Andaman.",
  },
  {
    title: "Do you arrange flights?",
    content:
      "Yes. Domestic and international flights are arranged as part of a holiday. The fare and the airline’s rule are in the quote. This website does not have a seat-search box.",
  },
  {
    title: "Can you plan a trip outside India?",
    content:
      "Yes. The desk handles travel in India and abroad. For a visa, start on the visa page so we can list the documents before anything is filed.",
  },
  {
    title: "What if I need to cancel?",
    content:
      "Write to us and keep the reply. The rule in your accepted quote is the one we follow. Cars and bikes also show a rule on the vehicle page. The usual fleet standard is a full refund of rental charges at least 48 hours before pickup.",
  },
  {
    title: "Who do I ask for?",
    content: `${company.contactName} is the name on our office board, on ${company.phone}. You can also write to ${company.email}.`,
  },
] as const;

export function siteMapGroups() {
  const plan = [
    { href: "/", label: "Home" },
    { href: "/destinations", label: "Destinations" },
    ...(modules.tours ? [{ href: "/tours", label: "Plan a tour" }] : []),
    ...(modules.tours ? [{ href: "/tours/request", label: "Ask for a tour" }] : []),
    ...(modules.hotels ? [{ href: "/hotels", label: "Find a stay" }] : []),
    ...(modules.hotels ? [{ href: "/hotels/request", label: "Find a hotel" }] : []),
    ...(modules.cars ? [{ href: "/rentals/cars", label: "Rent a car" }] : []),
    ...(modules.cars ? [{ href: "/rentals/cars/request", label: "Ask for a car" }] : []),
    ...(modules.bikes ? [{ href: "/rentals/bikes", label: "Rent a bike" }] : []),
    ...(modules.bikes ? [{ href: "/rentals/bikes/request", label: "Ask for a bike" }] : []),
    { href: "/visa-services", label: "Apply for a visa" },
    { href: "/meet-and-assist", label: "Request a greeter" },
    { href: "/meet-and-assist/request", label: "Send a greeter request" },
  ];

  return [
    { title: "Plan a trip", links: plan },
    {
      title: "The company",
      links: [
        { href: "/about", label: "Read about us" },
        { href: "/help", label: "Get help" },
        { href: "/contact", label: "Send an enquiry" },
        { href: "/terms", label: "Terms and conditions" },
        { href: "/privacy", label: "Privacy policy" },
        { href: "/cancellation", label: "Cancellation and refunds" },
      ],
    },
    {
      title: "Your account",
      links: [
        { href: "/login", label: "Sign in" },
        { href: "/signup", label: "Create an account" },
        { href: "/account", label: "See your bookings" },
      ],
    },
  ];
}
