/** Production Kashmir Valley destination catalog. */

import { kashmirDestinationSummaries } from "./kashmir-destination-summaries";
import { kashmirHotels, type DemoHotel } from "./kashmir-hotels";
import { demoTours as kashmirDemoTours, type DemoTour } from "./kashmir-tours";

export type { DemoHotel, DemoTour };
export const demoHotels: DemoHotel[] = kashmirHotels;
export const demoTours: DemoTour[] = kashmirDemoTours;

export type DemoDestination = {
  slug: string;
  name: string;
  region: string;
  country: string;
  summary: string;
  mapLat: string;
  mapLng: string;
  mapZoom: number;
  parentSlug?: string;
  popular?: boolean;
};

export const demoDestinations: DemoDestination[] = [
  {
    slug: "kashmir",
    name: "Kashmir",
    region: "Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["kashmir"],
    mapLat: "34.0837",
    mapLng: "74.7973",
    mapZoom: 8,
    popular: true,
  },
  {
    slug: "srinagar",
    name: "Srinagar",
    region: "Srinagar, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["srinagar"],
    mapLat: "34.0837",
    mapLng: "74.7973",
    mapZoom: 11,
    parentSlug: "kashmir",
    popular: true,
  },
  {
    slug: "gulmarg",
    name: "Gulmarg",
    region: "Baramulla, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["gulmarg"],
    mapLat: "34.0484",
    mapLng: "74.3805",
    mapZoom: 12,
    parentSlug: "kashmir",
    popular: true,
  },
  {
    slug: "pahalgam",
    name: "Pahalgam",
    region: "Anantnag, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["pahalgam"],
    mapLat: "34.0161",
    mapLng: "75.3150",
    mapZoom: 12,
    parentSlug: "kashmir",
    popular: true,
  },
  {
    slug: "aru-valley",
    name: "Aru Valley",
    region: "Anantnag, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["aru-valley"],
    mapLat: "34.0912",
    mapLng: "75.2634",
    mapZoom: 13,
    parentSlug: "pahalgam",
    popular: true,
  },
  {
    slug: "betaab-valley",
    name: "Betaab Valley",
    region: "Anantnag, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["betaab-valley"],
    mapLat: "34.0478",
    mapLng: "75.3331",
    mapZoom: 13,
    parentSlug: "pahalgam",
  },
  {
    slug: "chandanwari",
    name: "Chandanwari",
    region: "Anantnag, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["chandanwari"],
    mapLat: "34.0985",
    mapLng: "75.4168",
    mapZoom: 13,
    parentSlug: "pahalgam",
  },
  {
    slug: "sonamarg",
    name: "Sonamarg",
    region: "Ganderbal, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["sonamarg"],
    mapLat: "34.3032",
    mapLng: "75.2990",
    mapZoom: 12,
    parentSlug: "kashmir",
    popular: true,
  },
  {
    slug: "doodhpathri",
    name: "Doodhpathri",
    region: "Budgam, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["doodhpathri"],
    mapLat: "33.8438",
    mapLng: "74.5655",
    mapZoom: 12,
    parentSlug: "kashmir",
    popular: true,
  },
  {
    slug: "yusmarg",
    name: "Yusmarg",
    region: "Budgam, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["yusmarg"],
    mapLat: "33.8275",
    mapLng: "74.6647",
    mapZoom: 12,
    parentSlug: "kashmir",
    popular: true,
  },
  {
    slug: "gurez",
    name: "Gurez Valley",
    region: "Bandipora, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["gurez"],
    mapLat: "34.6370",
    mapLng: "74.8430",
    mapZoom: 10,
    parentSlug: "kashmir",
    popular: true,
  },
  {
    slug: "kokernag",
    name: "Kokernag",
    region: "Anantnag, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["kokernag"],
    mapLat: "33.5847",
    mapLng: "75.3169",
    mapZoom: 12,
    parentSlug: "kashmir",
    popular: true,
  },
  {
    slug: "achabal",
    name: "Achabal",
    region: "Anantnag, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["achabal"],
    mapLat: "33.6820",
    mapLng: "75.2250",
    mapZoom: 12,
    parentSlug: "kashmir",
  },
  {
    slug: "verinag",
    name: "Verinag",
    region: "Anantnag, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["verinag"],
    mapLat: "33.5370",
    mapLng: "75.2500",
    mapZoom: 12,
    parentSlug: "kashmir",
  },
  {
    slug: "daksum",
    name: "Daksum",
    region: "Anantnag, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["daksum"],
    mapLat: "33.6100",
    mapLng: "75.4350",
    mapZoom: 12,
    parentSlug: "kashmir",
  },
  {
    slug: "sinthan-top",
    name: "Sinthan Top",
    region: "Anantnag, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["sinthan-top"],
    mapLat: "33.5800",
    mapLng: "75.5000",
    mapZoom: 11,
    parentSlug: "kashmir",
  },
  {
    slug: "manasbal",
    name: "Manasbal Lake",
    region: "Ganderbal, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["manasbal"],
    mapLat: "34.2500",
    mapLng: "74.6700",
    mapZoom: 12,
    parentSlug: "kashmir",
  },
  {
    slug: "wular-lake",
    name: "Wular Lake",
    region: "Bandipora, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["wular-lake"],
    mapLat: "34.3500",
    mapLng: "74.5500",
    mapZoom: 11,
    parentSlug: "kashmir",
  },
  {
    slug: "tangmarg",
    name: "Tangmarg",
    region: "Baramulla, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["tangmarg"],
    mapLat: "34.0600",
    mapLng: "74.4300",
    mapZoom: 12,
    parentSlug: "kashmir",
  },
  {
    slug: "aharbal",
    name: "Aharbal",
    region: "Kulgam, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["aharbal"],
    mapLat: "33.6450",
    mapLng: "74.7850",
    mapZoom: 12,
    parentSlug: "kashmir",
  },
  {
    slug: "lolab",
    name: "Lolab Valley",
    region: "Kupwara, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["lolab"],
    mapLat: "34.5200",
    mapLng: "74.3000",
    mapZoom: 11,
    parentSlug: "kashmir",
  },
  {
    slug: "bangus",
    name: "Bangus Valley",
    region: "Kupwara, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["bangus"],
    mapLat: "34.3900",
    mapLng: "74.0500",
    mapZoom: 10,
    parentSlug: "kashmir",
  },
  {
    slug: "naranag",
    name: "Naranag",
    region: "Ganderbal, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["naranag"],
    mapLat: "34.3580",
    mapLng: "74.9780",
    mapZoom: 12,
    parentSlug: "kashmir",
  },
  {
    slug: "pampore",
    name: "Pampore",
    region: "Pulwama, Jammu and Kashmir",
    country: "India",
    summary:
      kashmirDestinationSummaries["pampore"],
    mapLat: "34.0160",
    mapLng: "74.9310",
    mapZoom: 12,
    parentSlug: "kashmir",
  },
];

export type DemoCar = {
  slug: string;
  name: string;
  brand: string;
  modelName: string;
  year: number;
  type: "Hatchback" | "Sedan" | "SUV" | "MUV" | "Luxury" | "EV";
  fuel: "Petrol" | "Diesel";
  transmission: "Automatic" | "Manual";
  seats: number;
  doors: number;
  luggage: number;
  pricePerDay: number;
  destination: string;
  availability: string[];
  summary: string;
  description: string;
  prompt: string;
  registrationNumber: string;
};

/** Production Kashmir car / cab fleet with market day rates. */
export const demoCars: DemoCar[] = [
  {
    slug: "toyota-innova-crysta",
    name: "Toyota Innova Crysta",
    brand: "Toyota",
    modelName: "Innova Crysta",
    year: 2023,
    type: "MUV",
    fuel: "Diesel",
    transmission: "Manual",
    seats: 7,
    doors: 5,
    luggage: 3,
    pricePerDay: 4500,
    destination: "srinagar",
    availability: ["srinagar", "gulmarg", "pahalgam", "sonamarg"],
    summary: "Premium 7-seater Innova Crysta for Kashmir family tours — from ₹4,500/day.",
    description:
      "<p>Toyota Innova Crysta is the preferred premium MUV for Kashmir sightseeing — Srinagar airport pickups, Gulmarg, Pahalgam, and Sonamarg day circuits. Spacious cabin for 6–7 guests with stronger luggage comfort than a sedan.</p><p>Typical Kashmir day hire includes an experienced local driver. Final quote depends on itinerary and season.</p>",
    prompt:
      "Photorealistic silver Toyota Innova Crysta MPV on Srinagar Kashmir highway with mountains, three-quarter front, daylight, rental catalog, no readable plate, no watermark",
    registrationNumber: "JK01C4501",
  },
  {
    slug: "toyota-innova",
    name: "Toyota Innova",
    brand: "Toyota",
    modelName: "Innova",
    year: 2022,
    type: "MUV",
    fuel: "Diesel",
    transmission: "Manual",
    seats: 7,
    doors: 5,
    luggage: 3,
    pricePerDay: 3300,
    destination: "srinagar",
    availability: ["srinagar", "gulmarg", "pahalgam", "sonamarg"],
    summary: "Reliable 7-seater Innova for Kashmir valley touring — from ₹3,300/day.",
    description:
      "<p>The Toyota Innova remains Kashmir’s workhorse family cab for multi-day packages and airport-to-resort transfers. Ideal when you need seven seats without stepping up to Crysta pricing.</p>",
    prompt:
      "Photorealistic white Toyota Innova MPV parked near Dal Lake Srinagar Kashmir, three-quarter front, daylight, rental catalog, no readable plate, no watermark",
    registrationNumber: "JK01C3302",
  },
  {
    slug: "force-urbania",
    name: "Force Urbania",
    brand: "Force",
    modelName: "Urbania",
    year: 2024,
    type: "MUV",
    fuel: "Diesel",
    transmission: "Manual",
    seats: 14,
    doors: 4,
    luggage: 5,
    pricePerDay: 7000,
    destination: "srinagar",
    availability: ["srinagar", "gulmarg", "pahalgam", "sonamarg"],
    summary: "Premium Force Urbania group van with recliner comfort — from ₹7,000/day.",
    description:
      "<p>Force Urbania is the premium group vehicle for Kashmir — better ride and seating comfort than a standard Tempo Traveller for families, corporates, and friend groups. Commonly booked as 10–17 seat layouts; our listed day rate starts from the popular Srinagar touring band.</p>",
    prompt:
      "Photorealistic white Force Urbania luxury van on Kashmir mountain highway pines, three-quarter front, daylight, rental catalog, no readable plate, no watermark",
    registrationNumber: "JK01C7003",
  },
  {
    slug: "tempo-traveller",
    name: "Tempo Traveller",
    brand: "Force",
    modelName: "Tempo Traveller",
    year: 2023,
    type: "MUV",
    fuel: "Diesel",
    transmission: "Manual",
    seats: 14,
    doors: 4,
    luggage: 5,
    pricePerDay: 6000,
    destination: "srinagar",
    availability: ["srinagar", "gulmarg", "pahalgam", "sonamarg"],
    summary: "14-seater Tempo Traveller for Kashmir group tours — from ₹6,000/day.",
    description:
      "<p>Tempo Traveller is the classic Kashmir group cab for joint families and tour batches. Push-back seating, AC touring setups, and roof carrier space make it the value pick versus Urbania for larger passenger counts.</p>",
    prompt:
      "Photorealistic white Tempo Traveller van on Pahalgam Kashmir road with pines, three-quarter front, daylight, rental catalog, no readable plate, no watermark",
    registrationNumber: "JK01C6004",
  },
  {
    slug: "sedan",
    name: "Sedan",
    brand: "Maruti",
    modelName: "Dzire / Etios class",
    year: 2024,
    type: "Sedan",
    fuel: "Petrol",
    transmission: "Manual",
    seats: 4,
    doors: 4,
    luggage: 2,
    pricePerDay: 2500,
    destination: "srinagar",
    availability: ["srinagar", "gulmarg", "pahalgam", "sonamarg"],
    summary: "Sedan (Dzire / Etios class) for couples and small families — from ₹2,500/day.",
    description:
      "<p>Our Sedan category covers the standard Kashmir cab class used for couples and small families — typically Dzire, Etios, or Glanza equivalents. Best for airport transfers and lighter sightseeing days when luggage is modest.</p>",
    prompt:
      "Photorealistic silver Maruti Dzire sedan on Srinagar Kashmir boulevard, three-quarter front, daylight, rental catalog, no readable plate, no watermark",
    registrationNumber: "JK01C2505",
  },
];


export type DemoBike = {
  slug: string;
  name: string;
  brand: string;
  modelName: string;
  year: number;
  type: "Scooter" | "Cruiser" | "Adventure" | "Motorcycle";
  fuel: "Petrol";
  transmission: "Automatic" | "Manual";
  pricePerDay: number;
  destination: string;
  availability: string[];
  summary: string;
  description: string;
  prompt: string;
  registrationNumber: string;
};

/** Production Kashmir bike fleet. */
export const demoBikes: DemoBike[] = [
  {
    slug: "tvs-ntorq",
    name: "TVS Ntorq",
    brand: "TVS",
    modelName: "Ntorq",
    year: 2024,
    type: "Scooter",
    fuel: "Petrol",
    transmission: "Automatic",
    pricePerDay: 900,
    destination: "srinagar",
    availability: ["srinagar", "gulmarg", "pahalgam"],
    summary: "Sporty automatic scooty for Srinagar city lanes and short Kashmir day rides — ₹900/day.",
    description:
      "<p>The TVS Ntorq is our automatic scooty option for travellers who want easy Kashmir city mobility without a geared motorcycle. Ideal for Boulevard Road, local markets, and short valley hops when you prefer a scooter over a bike.</p><p>Helmet included. Valid two-wheeler licence required.</p>",
    prompt:
      "Photorealistic yellow TVS Ntorq scooter beside Dal Lake boulevard Srinagar Kashmir, three-quarter front, daylight, rental catalog, no readable plate text, no watermark",
    registrationNumber: "JK01B0901",
  },
  {
    slug: "royal-enfield-classic-350",
    name: "Royal Enfield Classic 350",
    brand: "Royal Enfield",
    modelName: "Classic 350",
    year: 2024,
    type: "Cruiser",
    fuel: "Petrol",
    transmission: "Manual",
    pricePerDay: 1300,
    destination: "srinagar",
    availability: ["srinagar", "gulmarg", "pahalgam"],
    summary: "Iconic Classic 350cc cruiser for Kashmir highway and sightseeing days — ₹1,300/day.",
    description:
      "<p>Royal Enfield Classic 350 is the classic Kashmir rental choice for comfortable paced riding across Srinagar, Gulmarg approach roads, and Pahalgam valleys. Manual gearbox, petrol, two-up friendly with helmets.</p>",
    prompt:
      "Photorealistic black Royal Enfield Classic 350 motorcycle on Kashmir chinar avenue Srinagar, three-quarter front, daylight, no readable plate, no watermark",
    registrationNumber: "JK01B1302",
  },
  {
    slug: "royal-enfield-hunter-350",
    name: "Royal Enfield Hunter 350",
    brand: "Royal Enfield",
    modelName: "Hunter 350",
    year: 2024,
    type: "Cruiser",
    fuel: "Petrol",
    transmission: "Manual",
    pricePerDay: 1500,
    destination: "srinagar",
    availability: ["srinagar", "gulmarg", "pahalgam"],
    summary: "Agile Hunter 350cc roadster for valley roads and photo stops — ₹1,500/day.",
    description:
      "<p>Royal Enfield Hunter 350 suits riders who want a lighter, more agile 350cc roadster than the Classic for Kashmir sightseeing loops. Great for couples exploring Srinagar surrounds and day rides toward Gulmarg or Pahalgam.</p>",
    prompt:
      "Photorealistic grey Royal Enfield Hunter 350 motorcycle on Kashmir mountain highway with pines, three-quarter front, daylight, no readable plate, no watermark",
    registrationNumber: "JK01B1503",
  },
  {
    slug: "royal-enfield-himalayan-411",
    name: "Royal Enfield Himalayan 411",
    brand: "Royal Enfield",
    modelName: "Himalayan 411",
    year: 2023,
    type: "Adventure",
    fuel: "Petrol",
    transmission: "Manual",
    pricePerDay: 1800,
    destination: "srinagar",
    availability: ["srinagar", "gulmarg", "pahalgam", "sonamarg"],
    summary: "Adventure-ready Himalayan 411cc for rough Kashmir roads and longer valley days — ₹1,800/day.",
    description:
      "<p>The Himalayan 411 is built for mixed Kashmir surfaces — highway stretches, broken patches, and higher valley approaches toward Sonamarg or Gulmarg. Choose this when you want adventure posture and luggage practicality over a pure cruiser.</p>",
    prompt:
      "Photorealistic khaki Royal Enfield Himalayan 411 adventure motorcycle on Sonamarg Kashmir mountain road, three-quarter front, daylight, no readable plate, no watermark",
    registrationNumber: "JK01B1804",
  },
  {
    slug: "royal-enfield-himalayan-450",
    name: "Royal Enfield Himalayan 450",
    brand: "Royal Enfield",
    modelName: "Himalayan 450",
    year: 2024,
    type: "Adventure",
    fuel: "Petrol",
    transmission: "Manual",
    pricePerDay: 2200,
    destination: "srinagar",
    availability: ["srinagar", "gulmarg", "pahalgam", "sonamarg"],
    summary: "Latest Himalayan 450cc adventure bike for serious Kashmir mountain riding — ₹2,200/day.",
    description:
      "<p>Royal Enfield Himalayan 450 is our top adventure rental for riders who want more power and modern adventure ergonomics on Kashmir mountain roads. Best for experienced riders planning longer Gulmarg, Sonamarg, or multi-day valley rides.</p>",
    prompt:
      "Photorealistic modern Royal Enfield Himalayan 450 adventure motorcycle on Gulmarg Kashmir alpine road, three-quarter front, clear daylight, no readable plate, no watermark",
    registrationNumber: "JK01B2205",
  },
];

export const destinationPrompts: Record<string, string> = {
  jammu: "Photorealistic panoramic view of Jammu city and Tawi river valley hills India, daylight travel photo, no text",
  katra: "Photorealistic Katra town Trikuta hills Vaishno Devi base Jammu, daylight, no text",
  kashmir: "Photorealistic Dal Lake Srinagar Kashmir with shikaras and mountains, golden hour, no text",
  gulmarg: "Photorealistic Gulmarg Kashmir meadows and snow peaks, summer daylight, no text",
  pahalgam: "Photorealistic Pahalgam Lidder valley Kashmir pines and river, daylight, no text",
  sonamarg: "Photorealistic Sonamarg meadow of gold Kashmir mountains, daylight, no text",
  himachal: "Photorealistic Manali Himachal Beas valley pine hills, daylight, no text",
  shimla: "Photorealistic Shimla ridge Himachal colonial buildings and pines, daylight, no text",
  ladakh: "Photorealistic Leh Ladakh town with palace and barren mountains, daylight, no text",
  nubra: "Photorealistic Nubra valley sand dunes and mountains Ladakh, daylight, no text",
};
