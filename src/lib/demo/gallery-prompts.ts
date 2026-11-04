/** Five prompt-generated shots per demo tour / car / bike / hotel. */

import { demoBikes, demoCars, demoHotels } from "./north-india-catalog";
import { kashmirTours } from "./kashmir-tours";

export type Shot = { file: string; prompt: string; ratio: "4:3" | "16:9" };

function tourShots(slug: string, title: string, place: string, extras: [string, string, string, string, string]): Shot[] {
  const [a, b, c, d, e] = extras;
  return [
    { file: `tours/${slug}-cover.jpg`, ratio: "16:9", prompt: a },
    { file: `tours/${slug}-g1.jpg`, ratio: "16:9", prompt: b },
    { file: `tours/${slug}-g2.jpg`, ratio: "16:9", prompt: c },
    { file: `tours/${slug}-g3.jpg`, ratio: "16:9", prompt: d },
    { file: `tours/${slug}-g4.jpg`, ratio: "16:9", prompt: e },
  ];
}

function vehicleShots(
  kind: "car" | "bike",
  slug: string,
  label: string,
  place: string,
  colorHint: string,
): Shot[] {
  const subject = kind === "car" ? `${colorHint} ${label} car` : `${colorHint} ${label} motorcycle or scooter`;
  const base = `Photorealistic ${subject}`;
  const noText = "no readable license plate text, no watermark, no UI text";
  return [
    {
      file: `vehicles/photos/${slug}.jpg`,
      ratio: "4:3",
      prompt: `${base}, three-quarter front view parked in ${place}, natural daylight, rental catalog photo, ${noText}`,
    },
    {
      file: `vehicles/photos/${slug}-2.jpg`,
      ratio: "4:3",
      prompt: `${base}, clean side profile parked in ${place}, soft daylight, rental catalog photo, ${noText}`,
    },
    {
      file: `vehicles/photos/${slug}-3.jpg`,
      ratio: "4:3",
      prompt: `${base}, rear three-quarter view in ${place}, natural daylight, ${noText}`,
    },
    {
      file: `vehicles/photos/${slug}-4.jpg`,
      ratio: "4:3",
      prompt:
        kind === "car"
          ? `Photorealistic clean modern car interior cabin of ${label}, dashboard and seats, soft daylight through windows suggesting ${place}, no readable screen text, no watermark`
          : `Photorealistic close detail of ${label} handlebars seat and tank in ${place}, daylight, ${noText}`,
    },
    {
      file: `vehicles/photos/${slug}-5.jpg`,
      ratio: "4:3",
      prompt: `${base} driving on a scenic mountain road near ${place}, motion subtle, cinematic travel photo, ${noText}`,
    },
  ];
}

function hotelShots(slug: string, name: string, place: string, vibes: [string, string, string, string, string]): Shot[] {
  const [exterior, lobby, room, dining, amenity] = vibes;
  return [
    { file: `hotels/${slug}-cover.jpg`, ratio: "4:3", prompt: exterior },
    { file: `hotels/${slug}-g1.jpg`, ratio: "4:3", prompt: lobby },
    { file: `hotels/${slug}-g2.jpg`, ratio: "4:3", prompt: room },
    { file: `hotels/${slug}-g3.jpg`, ratio: "4:3", prompt: dining },
    { file: `hotels/${slug}-g4.jpg`, ratio: "4:3", prompt: amenity },
  ];
}

const carMeta: Record<string, { label: string; place: string; color: string }> = {
  "maruti-swift": { label: "Maruti Swift hatchback", place: "Srinagar Dal Lake boulevard", color: "white" },
  "hyundai-i20": { label: "Hyundai i20 hatchback", place: "Jammu city hills", color: "red" },
  "honda-city": { label: "Honda City sedan", place: "Kashmir chinar highway", color: "silver" },
  "maruti-dzire": { label: "Maruti Dzire sedan", place: "Katra pilgrimage town", color: "grey" },
  "hyundai-creta": { label: "Hyundai Creta SUV", place: "Gulmarg pine road", color: "white" },
  "mahindra-thar": { label: "Mahindra Thar SUV", place: "Sonamarg meadow road", color: "red" },
  "toyota-fortuner": { label: "Toyota Fortuner SUV", place: "Leh Ladakh high desert road", color: "white" },
  "mahindra-scorpio-n": { label: "Mahindra Scorpio-N SUV", place: "Manali Himachal mountain road", color: "black" },
  "toyota-innova-crysta": { label: "Toyota Innova Crysta MPV", place: "Jammu hotel forecourt", color: "silver" },
  "kia-carens": { label: "Kia Carens MPV", place: "Pahalgam Lidder valley road", color: "blue" },
};

const bikeMeta: Record<string, { label: string; place: string; color: string }> = {
  "honda-activa": { label: "Honda Activa scooter", place: "Srinagar Dal Lake boulevard", color: "silver" },
  "suzuki-access-125": { label: "Suzuki Access 125 scooter", place: "Gulmarg meadow road", color: "white" },
  "tvs-ntorq-125": { label: "TVS Ntorq scooter", place: "Pahalgam river bridge", color: "yellow" },
  "royal-enfield-classic-350": { label: "Royal Enfield Classic 350", place: "Kashmir chinar avenue", color: "black" },
  "re-meteor-350": { label: "Royal Enfield Meteor 350", place: "Manali mountain road", color: "red" },
  "jawa-42": { label: "Jawa 42 motorcycle", place: "Srinagar with mountains", color: "grey" },
  "re-himalayan-450": { label: "Royal Enfield Himalayan 450", place: "Ladakh high desert near Leh", color: "khaki" },
  "hero-xpulse-200": { label: "Hero Xpulse 200", place: "Sonamarg dirt meadow track", color: "white" },
  "re-bullet-350": { label: "Royal Enfield Bullet 350", place: "Jammu hills roadside", color: "black" },
  "ktm-390-adventure": { label: "KTM 390 Adventure", place: "Manali Leh highway hairpins", color: "orange" },
};

const hotelVibes: Record<string, [string, string, string, string, string]> = {
  "golden-leaf-srinagar": [
    "Photorealistic modern airport-road hotel exterior Hyderpora Srinagar evening lights, no text",
    "Photorealistic polished hotel lobby Hyderpora Srinagar, soft daylight, no text",
    "Photorealistic air-conditioned deluxe hotel bedroom Srinagar, morning light, no text",
    "Photorealistic multi-cuisine hotel restaurant dining room Srinagar, no text",
    "Photorealistic hotel banquet lawn Hyderpora Srinagar dusk, no text",
  ],
  "heritage-luxury-srinagar": [
    "Photorealistic midscale hotel facade Airport Road Hyderpora Srinagar garden lawn, daylight, no text",
    "Photorealistic hotel reception desk Hyderpora Srinagar, no text",
    "Photorealistic AC hotel bedroom tea tray Srinagar, no text",
    "Photorealistic hotel breakfast buffet Srinagar, no text",
    "Photorealistic hotel parking courtyard Hyderpora Srinagar, no text",
  ],
  "marvilla-srinagar": [
    "Photorealistic compact highway hotel Nowgam Bypass Srinagar pines, daylight, no text",
    "Photorealistic small hotel lobby Nowgam Srinagar, no text",
    "Photorealistic simple AC hotel bedroom Nowgam, no text",
    "Photorealistic modest hotel restaurant Nowgam Srinagar, no text",
    "Photorealistic roadside hotel entrance Nowgam Bypass, no text",
  ],
  "asian-park-srinagar": [
    "Photorealistic city hotel facade Munawarabad near Dal Lake Srinagar, daytime, no text",
    "Photorealistic hotel lobby Munawarabad Srinagar, daylight, no text",
    "Photorealistic super deluxe hotel bedroom Srinagar city, no text",
    "Photorealistic hotel banquet hall setup Srinagar, no text",
    "Photorealistic multi-cuisine hotel restaurant Srinagar, no text",
  ],
  "arison-luxury-srinagar": [
    "Photorealistic contemporary boutique hotel Hyderpora Bypass Srinagar glass facade dusk, no text",
    "Photorealistic modern hotel lobby Hyderpora Srinagar, no text",
    "Photorealistic stylish premium hotel bedroom Srinagar, no text",
    "Photorealistic hotel restaurant Hyderpora Srinagar, no text",
    "Photorealistic hotel banquet foyer Hyderpora, no text",
  ],
  "jhelum-comfort-residency-srinagar": [
    "Photorealistic riverside city hotel near Jhelum Lal Mandi Srinagar morning, no text",
    "Photorealistic boutique hotel lobby Wazir Bagh Srinagar, no text",
    "Photorealistic hotel bedroom balcony Jhelum Srinagar, no text",
    "Photorealistic hotel dining corner Srinagar, no text",
    "Photorealistic footbridge neighbourhood hotel exterior Srinagar, no text",
  ],
  "royal-batoo-srinagar": [
    "Photorealistic boutique hotel facade Dalgate Khayam Chowk Srinagar evening, no text",
    "Photorealistic carved wood hotel lobby Srinagar Kashmir, warm light, no text",
    "Photorealistic wood-panelled hotel bedroom Kashmiri textiles Srinagar, no text",
    "Photorealistic multi-cuisine restaurant dining hall Srinagar, no text",
    "Photorealistic rooftop garden gazebo hotel Srinagar evening, no text",
  ],
  "milan-srinagar": [
    "Photorealistic city hotel exterior Munawarabad Srinagar street, daylight, no text",
    "Photorealistic hotel lobby Munawarabad Srinagar, no text",
    "Photorealistic premium AC hotel bedroom Srinagar, no text",
    "Photorealistic hotel restaurant Munawarabad, no text",
    "Photorealistic hotel corridor elevator Srinagar, no text",
  ],
  "apple-tree-resorts-gulmarg": [
    "Photorealistic mountain resort lawn and swimming pool Kunzer Gulmarg road Kashmir summer, no text",
    "Photorealistic resort lobby Batpora Kunzer Kashmir, no text",
    "Photorealistic mountain-view deluxe hotel bedroom Gulmarg road, no text",
    "Photorealistic buffet restaurant resort Kunzer Kashmir, no text",
    "Photorealistic resort jacuzzi deck mountain pines Kashmir, no text",
  ],
  "pandit-resort-gulmarg": [
    "Photorealistic roadside hotel restaurant Kunzer Gulmarg highway Kashmir daylight, no text",
    "Photorealistic simple hotel lobby Kunzer, no text",
    "Photorealistic heated hotel bedroom balcony Kunzer, no text",
    "Photorealistic Kashmiri restaurant dining Kunzer highway, no text",
    "Photorealistic hotel garden Gulmarg road Batpora, no text",
  ],
  "mama-palace-gulmarg": [
    "Photorealistic small mountain hotel Gulmarg pines near gondola overcast day, no text",
    "Photorealistic compact hotel lobby Gulmarg, no text",
    "Photorealistic heated cozy hotel bedroom Gulmarg, no text",
    "Photorealistic small hotel restaurant Gulmarg, no text",
    "Photorealistic snowy path hotel Gulmarg meadow approach, no text",
  ],
  "zahgeer-continental-gulmarg": [
    "Photorealistic Gulmarg Main Road hotel facade snow meadow pines winter daylight, no text",
    "Photorealistic heated hotel lobby Gulmarg, no text",
    "Photorealistic deluxe hotel bedroom meadow view Gulmarg, no text",
    "Photorealistic hotel restaurant Gulmarg mountain windows, no text",
    "Photorealistic hotel exterior near Gulmarg gondola area, no text",
  ],
  "gulmarg-palace-tangmarg": [
    "Photorealistic Tangmarg Gulmarg Road hotel roadside pines daylight, no text",
    "Photorealistic family hotel lobby Tangmarg, no text",
    "Photorealistic deluxe hotel bedroom mountain view Tangmarg, no text",
    "Photorealistic hotel dining room Tangmarg Kashmir, no text",
    "Photorealistic hotel garden orchard Tangmarg, no text",
  ],
  "signature-gulmarg": [
    "Photorealistic resort hotel lawn Gulmarg Road Wahipora Tangmarg soft afternoon, no text",
    "Photorealistic hotel lobby Signature Tangmarg, no text",
    "Photorealistic heated deluxe hotel bedroom Tangmarg, no text",
    "Photorealistic hotel restaurant coffee shop Tangmarg, no text",
    "Photorealistic hotel front lawn Gulmarg approach road, no text",
  ],
  "white-villa-pahalgam": [
    "Photorealistic white villa resort Pahalgam pine hills balcony rooms daylight, no text",
    "Photorealistic boutique resort lobby Yanier Pahalgam, no text",
    "Photorealistic balcony hotel bedroom valley view Pahalgam, no text",
    "Photorealistic resort restaurant Pahalgam, no text",
    "Photorealistic resort driveway Rafting Point Pahalgam, no text",
  ],
  "green-heights-pahalgam": [
    "Photorealistic hillside hotel Pahalgam Lidder valley Kolahoi peaks golden hour, no text",
    "Photorealistic hotel lobby Srichen Pahalgam, no text",
    "Photorealistic premium hotel bedroom large windows mountain view Pahalgam, no text",
    "Photorealistic hotel dining hall Pahalgam, no text",
    "Photorealistic hotel lawn breakfast overlooking Lidder valley, no text",
  ],
  "pahalgam-shore": [
    "Photorealistic luxury riverside hotel Lidder Rafting Point Pahalgam evening lights, no text",
    "Photorealistic boutique hotel lobby Movera Pahalgam, no text",
    "Photorealistic river-view hotel suite balcony Pahalgam, no text",
    "Photorealistic hotel restaurant lounge Pahalgam Shore, no text",
    "Photorealistic fitness lounge riverside hotel Pahalgam, no text",
  ],
  "riverside-resort-pahalgam": [
    "Photorealistic riverside resort lawn Lidder Movera Pahalgam wooden balconies daylight, no text",
    "Photorealistic resort reception Movera Pahalgam, no text",
    "Photorealistic river-facing hotel bedroom balcony Pahalgam, no text",
    "Photorealistic resort dining hall Lidder river view, no text",
    "Photorealistic resort garden swings Lidder bank Pahalgam, no text",
  ],
  "hayat-residency-pahalgam": [
    "Photorealistic upscale hotel entrance driveway Botakote Pahalgam dusk, no text",
    "Photorealistic hotel lobby Hayat Residency Pahalgam, no text",
    "Photorealistic studio suite hotel bedroom Pahalgam, no text",
    "Photorealistic hotel restaurant Botakote Pahalgam, no text",
    "Photorealistic mountain-view hotel garden Pahalgam, no text",
  ],
  "pahalgam-retreat": [
    "Photorealistic multi-block mountain retreat pine forest Pahalgam campus daylight, no text",
    "Photorealistic retreat reception Yainer Pahalgam, no text",
    "Photorealistic deluxe hotel bedroom pine view Pahalgam Retreat, no text",
    "Photorealistic separate restaurant block Pahalgam Retreat, no text",
    "Photorealistic retreat campus lawns Rafting Point Pahalgam, no text",
  ],
  "white-water-resort-pahalgam": [
    "Photorealistic White Water Resorts riverside adventure lodge Pahalgam sunny day, no text",
    "Photorealistic resort lobby Movera footbridge Pahalgam, no text",
    "Photorealistic superior hotel bedroom river corridor Pahalgam, no text",
    "Photorealistic resort restaurant fitness garden Pahalgam, no text",
    "Photorealistic resort deck facing Lidder rafting point, no text",
  ],
};

export function allGalleryShots(): Shot[] {
  const shots: Shot[] = [];

  for (const tour of kashmirTours) {
    shots.push(
      ...tourShots(tour.slug, tour.title, tour.destinationSlug, [
        tour.coverPrompt,
        ...tour.galleryPrompts,
      ]),
    );
  }

  for (const car of demoCars) {
    const meta = carMeta[car.slug];
    if (!meta) continue;
    shots.push(...vehicleShots("car", car.slug, meta.label, meta.place, meta.color));
  }

  for (const bike of demoBikes) {
    const meta = bikeMeta[bike.slug];
    if (!meta) continue;
    shots.push(...vehicleShots("bike", bike.slug, meta.label, meta.place, meta.color));
  }

  for (const hotel of demoHotels) {
    const vibes = hotelVibes[hotel.slug];
    if (!vibes) continue;
    shots.push(...hotelShots(hotel.slug, hotel.name, hotel.destinationSlug, vibes));
  }

  return shots;
}

export function missingShots(uploadsRoot: string): Shot[] {
  const { existsSync } = require("node:fs") as typeof import("node:fs");
  const path = require("node:path") as typeof import("node:path");
  return allGalleryShots().filter((shot) => !existsSync(path.join(uploadsRoot, shot.file)));
}
