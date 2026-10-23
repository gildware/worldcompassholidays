/** Five prompt-generated shots per demo tour / car / bike / hotel. */

import { demoBikes, demoCars, demoHotels, demoTours } from "./north-india-catalog";

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

const tourExtraPrompts: Record<string, [string, string, string, string, string]> = {
  "amarnath-yatra": [
    "Photorealistic snowy Amarnath holy cave mountain path Kashmir Himalayas at dawn, pilgrims distant, golden light, no text",
    "Photorealistic Kashmir mountain trail toward Amarnath with prayer flags and snow peaks, daylight, no text",
    "Photorealistic Pahalgam Lidder river valley meadows Amarnath base landscape, pines, morning light, no text",
    "Photorealistic high altitude ice cave shrine entrance Amarnath Kashmir, soft blue ice glow, pilgrims distant, no text",
    "Photorealistic pony caravan on Amarnath yatra trail Kashmir mountains, afternoon light, no text",
  ],
  "vaishno-devi-yatra": [
    "Photorealistic Vaishno Devi pilgrimage track near Katra Trikuta hills at sunrise, devotees distant, no text",
    "Photorealistic Katra town dusk Trikuta hills backdrop, warm lights, no text",
    "Photorealistic mountain shrine stone steps Trikuta hills morning mist, no text",
    "Photorealistic Banganga holy stream area Katra pilgrimage start, daylight, no text",
    "Photorealistic temple town rooftops Katra with mountain backdrop, golden hour, no text",
  ],
  "kashmir-shrine-circuit": [
    "Photorealistic Hazratbal shrine white dome beside Dal Lake Srinagar, calm reflection, no text",
    "Photorealistic Hari Parbat fort hill Sharika temple area Srinagar golden hour, no text",
    "Photorealistic Dal Lake shikara near shrine shoreline Srinagar, soft light, no text",
    "Photorealistic Kashmir wooden mosque courtyard with chinar trees, daylight, no text",
    "Photorealistic evening aarti lamps on Dal Lake shoreline Srinagar, no text",
  ],
  "hemkund-sahib-yatra": [
    "Photorealistic Hemkund Sahib alpine lake gurudwara snow peaks, clear daylight, no text",
    "Photorealistic Himalayan meadow flower path toward Hemkund, trekkers distant, no text",
    "Photorealistic mountain valley camp near Hemkund trail morning light, no text",
    "Photorealistic steep stone steps climbing toward Hemkund Sahib clouds, no text",
    "Photorealistic prayer flags and glacial stream on Hemkund approach, no text",
  ],
  "martand-anantnag-circuit": [
    "Photorealistic Martand Sun Temple stone ruins Anantnag Kashmir mountains, dramatic daylight, no text",
    "Photorealistic Mattan temple spring south Kashmir village soft light, no text",
    "Photorealistic Anantnag countryside orchards and hills afternoon, no text",
    "Photorealistic close stone carved pillars Martand temple ruins Kashmir, no text",
    "Photorealistic pilgrims walking among Martand ruins soft evening light, distant figures, no text",
  ],
  "ladakh-monastery-pilgrimage": [
    "Photorealistic Thiksey monastery golden rooftops Indus valley Ladakh, blue sky, no text",
    "Photorealistic Hemis monastery courtyard prayer flags Ladakh daylight, no text",
    "Photorealistic Diskit monastery giant Buddha Nubra valley Ladakh, no text",
    "Photorealistic monk walking monastery corridor Ladakh, soft light, no text",
    "Photorealistic Shey palace and stupa landscape near Leh Ladakh, daylight, no text",
  ],
  "kashmir-valley-trek": [
    "Photorealistic Kashmir alpine meadow trek wildflowers snow peaks, hikers small, golden hour, no text",
    "Photorealistic Kashmir high camp tents glacial stream dusk, no text",
    "Photorealistic pine forest trail above Srinagar morning mist, no text",
    "Photorealistic alpine lake reflecting peaks Kashmir trek, clear day, no text",
    "Photorealistic shepherd huts in Kashmir high meadow, afternoon light, no text",
  ],
  "kolahoi-lidder-trek": [
    "Photorealistic Kolahoi glacier view Lidder valley rocky trail turquoise river, daylight, no text",
    "Photorealistic Pahalgam Lidder trek path boulders pines, no text",
    "Photorealistic high Kashmir camp near snow peaks Kolahoi approach, no text",
    "Photorealistic glacier icefall distant from Kolahoi trail Kashmir, no text",
    "Photorealistic riverside lunch stop Lidder valley trek, soft light, no text",
  ],
  "hampta-pass-trek": [
    "Photorealistic Hampta Pass rocky alpine saddle trekkers distant dramatic clouds, no text",
    "Photorealistic green Himachal valley campsite before Hampta Pass wildflowers, no text",
    "Photorealistic barren Spiti-side landscape after Hampta Pass, no text",
    "Photorealistic river crossing on Hampta Pass trek Himachal, daylight, no text",
    "Photorealistic sunset from Hampta Pass ridge Himachal, no text",
  ],
  "markha-valley-trek": [
    "Photorealistic Markha Valley Ladakh trek arid canyon river distant village, no text",
    "Photorealistic Ladakh mountain pass prayer flags Markha trek, no text",
    "Photorealistic traditional Ladakhi village mud houses Markha valley, no text",
    "Photorealistic Markha river ford with mountains Ladakh, daylight, no text",
    "Photorealistic Kongmaru La style high pass view Markha trek, no text",
  ],
  "srinagar-leh-road-trip": [
    "Photorealistic Zoji La mountain highway Kashmir Ladakh winding road SUV tiny, no text",
    "Photorealistic Sonamarg meadow of gold Sindh river daylight, no text",
    "Photorealistic Kargil to Leh Indus river road canyon, no text",
    "Photorealistic Drass valley roadside mountains Kashmir Ladakh border, no text",
    "Photorealistic overnight lodge courtyard on Srinagar Leh highway, dusk, no text",
  ],
  "manali-leh-highway": [
    "Photorealistic Manali Leh highway hairpin bends high Himalayas, no text",
    "Photorealistic Baralacha La snow pass border road daylight, no text",
    "Photorealistic high desert road after Manali Leh drive Ladakh, no text",
    "Photorealistic Sarchu plains tents under big sky Himachal Ladakh, no text",
    "Photorealistic Gata loops hairpins Manali Leh highway, daylight, no text",
  ],
  "leh-nubra-pangong-loop": [
    "Photorealistic Pangong lake vivid blue arid mountains Ladakh shoreline, no text",
    "Photorealistic Nubra valley sand dunes camel distant Ladakh, no text",
    "Photorealistic Khardung La high pass prayer flags snow Ladakh without readable text, no text",
    "Photorealistic Shyok river road to Nubra Ladakh, daylight, no text",
    "Photorealistic Pangong lakeside camp tents sunset Ladakh, no text",
  ],
  "dal-lake-mughal-gardens": [
    "Photorealistic Dal Lake Srinagar shikaras Himalayan backdrop golden hour, no text",
    "Photorealistic Nishat Bagh Mughal garden terraces blooming flowers, no text",
    "Photorealistic Kashmir houseboat interior windows overlooking Dal Lake, no text",
    "Photorealistic Shalimar Bagh fountains and chinar trees Srinagar, no text",
    "Photorealistic floating vegetable market Dal Lake morning, distant figures, no text",
  ],
  "gulmarg-gondola-meadows": [
    "Photorealistic Gulmarg green meadows gondola cables snow peaks summer, no text",
    "Photorealistic Gulmarg gondola cabin over pine forest Kashmir, no text",
    "Photorealistic Gulmarg meadow wildflowers ponies distant soft light, no text",
    "Photorealistic Kongdoori meadow view from Gulmarg gondola, no text",
    "Photorealistic Gulmarg ski slope summer green grass and peaks, no text",
  ],
  "pahalgam-betaab-valley": [
    "Photorealistic Betaab Valley lush green meadow pine forest mountains, no text",
    "Photorealistic Pahalgam Lidder river wooden bridge pines, no text",
    "Photorealistic Aru valley meadow Kashmir mountains afternoon, no text",
    "Photorealistic Baisaran meadow pony ride distant Pahalgam, no text",
    "Photorealistic Chandanwari approach road Pahalgam mountains, no text",
  ],
  "srinagar-old-city-crafts": [
    "Photorealistic Srinagar old city wooden architecture lane warm afternoon, no text",
    "Photorealistic Kashmiri papier-mache craft workshop colorful pieces, no text",
    "Photorealistic Jhelum river embankment historic Srinagar bridges, no text",
    "Photorealistic Kashmir carpet weaving loom workshop soft light, no text",
    "Photorealistic old Srinagar spice market alley daylight, no text",
  ],
  "leh-palace-heritage": [
    "Photorealistic Leh Palace mud-brick fortress sunset dramatic light, no text",
    "Photorealistic Shanti Stupa white dome Leh blue hour, no text",
    "Photorealistic Leh main bazaar street mountain town daylight, no text",
    "Photorealistic Namgyal Tsemo gompa above Leh town, no text",
    "Photorealistic Leh old town lanes with prayer flags, afternoon, no text",
  ],
  "gulmarg-pahalgam-family": [
    "Photorealistic Kashmir family picnic Gulmarg meadow mountains soft daylight people distant, no text",
    "Photorealistic Pahalgam riverside park green lawns, no text",
    "Photorealistic Kashmir hotel garden breakfast terrace mountain view morning, no text",
    "Photorealistic children flying kite distant Gulmarg meadow, no text",
    "Photorealistic family shikara ride Dal Lake soft light distant figures, no text",
  ],
  "manali-family-hills": [
    "Photorealistic Manali pine hills Beas valley viewpoint summer, no text",
    "Photorealistic Solang Valley green slopes mountains daylight, no text",
    "Photorealistic Old Manali cafe street wooden balconies evening, no text",
    "Photorealistic Hadimba temple cedar forest Manali, daylight, no text",
    "Photorealistic Manali Mall Road evening lights mountains, no text",
  ],
};

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
  "dal-lake-house-hotel": [
    "Photorealistic boutique hotel facade beside Dal Lake Srinagar garden lawn golden hour, no text",
    "Photorealistic elegant hotel lobby overlooking Dal Lake Srinagar, soft daylight, no text",
    "Photorealistic lake-view hotel bedroom with balcony Dal Lake Srinagar, morning light, no text",
    "Photorealistic hotel restaurant terrace breakfast Dal Lake view Srinagar, no text",
    "Photorealistic hotel garden lawn with shikara dock Dal Lake Srinagar, no text",
  ],
  "gulmarg-meadow-resort": [
    "Photorealistic mountain resort chalets Gulmarg meadow pines peaks summer, no text",
    "Photorealistic cozy resort lobby fireplace Gulmarg Kashmir, warm light, no text",
    "Photorealistic chalet bedroom balcony meadow view Gulmarg, daylight, no text",
    "Photorealistic resort dining room mountain view Gulmarg, no text",
    "Photorealistic resort outdoor hot tub or deck facing Gulmarg peaks, no text",
  ],
  "pahalgam-river-homestay": [
    "Photorealistic riverside wooden homestay cottage Pahalgam Lidder pines morning, no text",
    "Photorealistic homestay living room Kashmiri decor Pahalgam, soft light, no text",
    "Photorealistic cozy bedroom window river view Pahalgam homestay, no text",
    "Photorealistic family dining table Kashmiri meal Pahalgam homestay, no text",
    "Photorealistic homestay garden path beside Lidder river Pahalgam, no text",
  ],
  "sonamarg-glacier-lodge": [
    "Photorealistic mountain lodge hotel Sonamarg meadows snow peaks daylight, no text",
    "Photorealistic lodge reception hall wooden interiors Sonamarg, no text",
    "Photorealistic heated lodge bedroom glacier view Sonamarg, no text",
    "Photorealistic lodge restaurant windows facing Sonamarg meadow, no text",
    "Photorealistic lodge outdoor sit-out facing Sindh river Sonamarg, no text",
  ],
  "jammu-ridge-hotel": [
    "Photorealistic modern city hotel exterior Jammu hills ridge daylight, no text",
    "Photorealistic contemporary hotel lobby Jammu, daylight, no text",
    "Photorealistic air-conditioned hotel bedroom Jammu city view, no text",
    "Photorealistic hotel breakfast buffet room Jammu, no text",
    "Photorealistic hotel rooftop seating Jammu hills evening, no text",
  ],
  "katra-yatra-lodge": [
    "Photorealistic pilgrim lodge hotel Katra Trikuta hills evening lights, no text",
    "Photorealistic simple clean lodge lobby Katra yatra hotel, no text",
    "Photorealistic twin bed yatri room Katra lodge, neat and bright, no text",
    "Photorealistic lodge dining hall vegetarian thali Katra, no text",
    "Photorealistic lodge courtyard lockers for Vaishno Devi yatris Katra, no text",
  ],
  "leh-view-hotel": [
    "Photorealistic hotel Leh Ladakh mountain backdrop sunny courtyard, no text",
    "Photorealistic Leh hotel lobby with Ladakhi decor, daylight, no text",
    "Photorealistic heated hotel bedroom mountain view Leh, no text",
    "Photorealistic hotel breakfast room large windows Leh peaks, no text",
    "Photorealistic hotel rooftop terrace view of Leh Palace distant, no text",
  ],
  "nubra-desert-camp": [
    "Photorealistic luxury desert tent camp Nubra Hunder dunes golden hour, no text",
    "Photorealistic desert camp reception lounge Nubra valley Ladakh, no text",
    "Photorealistic luxury tent interior bed Nubra camp, warm lamps, no text",
    "Photorealistic camp dining tent evening Nubra dunes, no text",
    "Photorealistic campfire seating under stars Nubra desert camp, no text",
  ],
  "manali-cedar-resort": [
    "Photorealistic cedar forest resort Manali wooden balconies mountain view, no text",
    "Photorealistic resort lobby cedar wood Manali Himachal, no text",
    "Photorealistic valley suite bedroom fireplace Manali resort, no text",
    "Photorealistic resort restaurant pine forest view Manali, no text",
    "Photorealistic resort spa treatment room Manali cedar resort, no text",
  ],
  "shimla-ridge-boutique": [
    "Photorealistic boutique heritage hotel Shimla ridge colonial pines daylight, no text",
    "Photorealistic colonial hotel lobby Shimla boutique, no text",
    "Photorealistic heritage hotel bedroom bay window Shimla, no text",
    "Photorealistic boutique hotel dining room Shimla ridge view, no text",
    "Photorealistic hotel terrace overlooking Shimla hills evening, no text",
  ],
};

export function allGalleryShots(): Shot[] {
  const shots: Shot[] = [];

  for (const tour of demoTours) {
    const extras = tourExtraPrompts[tour.slug];
    if (!extras) continue;
    shots.push(...tourShots(tour.slug, tour.title, tour.destinationSlug, extras));
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
