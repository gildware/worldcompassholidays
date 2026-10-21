export type BikeSeed = {
  slug: string;
  name: string;
  brand: string;
  modelName: string;
  year: number;
  type: "Scooter" | "Motorcycle" | "Cruiser" | "Adventure";
  fuel: "Petrol" | "Diesel" | "Electric" | "CNG";
  transmission: "Manual" | "Automatic";
  pricePerDay: number;
  destination: string;
  summary: string;
};

function bike(
  slug: string,
  name: string,
  brand: string,
  modelName: string,
  year: number,
  type: BikeSeed["type"],
  fuel: BikeSeed["fuel"],
  transmission: BikeSeed["transmission"],
  pricePerDay: number,
  destination: string,
  summary: string,
): BikeSeed {
  return {
    slug,
    name,
    brand,
    modelName,
    year,
    type,
    fuel,
    transmission,
    pricePerDay,
    destination,
    summary,
  };
}

export const bikeCatalog: BikeSeed[] = [
  bike("honda-dio", "Honda Dio", "Honda", "Dio", 2024, "Scooter", "Petrol", "Automatic", 650, "goa", "Light petrol scooter for town and the coast."),
  bike("tvs-jupiter", "TVS Jupiter", "TVS", "Jupiter", 2024, "Scooter", "Petrol", "Automatic", 700, "kerala", "Roomy petrol scooter for city errands."),
  bike("tvs-ntorq-125", "TVS Ntorq 125", "TVS", "Ntorq 125", 2023, "Scooter", "Petrol", "Automatic", 850, "goa", "Sporty 125cc scooter with a digital display."),
  bike("suzuki-access-125", "Suzuki Access 125", "Suzuki", "Access 125", 2024, "Scooter", "Petrol", "Automatic", 750, "kerala", "Smooth petrol scooter for daily rides."),
  bike("suzuki-burgman-street", "Suzuki Burgman Street", "Suzuki", "Burgman Street", 2023, "Scooter", "Petrol", "Automatic", 900, "goa", "Maxi-scooter comfort on a small frame."),
  bike("yamaha-rayzr", "Yamaha RayZR", "Yamaha", "RayZR", 2024, "Scooter", "Petrol", "Automatic", 800, "jammu", "Street scooter that is easy in traffic."),
  bike("yamaha-fascino", "Yamaha Fascino", "Yamaha", "Fascino", 2023, "Scooter", "Petrol", "Automatic", 780, "kashmir", "Retro petrol scooter for short valley hops."),
  bike("hero-pleasure-plus", "Hero Pleasure Plus", "Hero", "Pleasure Plus", 2022, "Scooter", "Petrol", "Automatic", 550, "himachal", "Light scooter for town roads."),
  bike("vespa-vxl", "Vespa VXL", "Vespa", "VXL", 2024, "Scooter", "Petrol", "Automatic", 1400, "goa", "Classic Vespa for coastal evenings."),
  bike("vespa-sxl", "Vespa SXL", "Vespa", "SXL", 2023, "Scooter", "Petrol", "Automatic", 1500, "kerala", "Sharper Vespa with more power."),
  bike("aprilia-sr-160", "Aprilia SR 160", "Aprilia", "SR 160", 2024, "Scooter", "Petrol", "Automatic", 1100, "goa", "Sport scooter for quicker town rides."),
  bike("tvs-scooty-pep", "TVS Scooty Pep+", "TVS", "Scooty Pep+", 2022, "Scooter", "Petrol", "Automatic", 500, "jammu", "Small automatic scooter, simple to ride."),

  bike("ola-s1-pro", "Ola S1 Pro", "Ola", "S1 Pro", 2024, "Scooter", "Electric", "Automatic", 1200, "goa", "Electric scooter with a long city range."),
  bike("ola-s1-x", "Ola S1 X", "Ola", "S1 X", 2024, "Scooter", "Electric", "Automatic", 900, "kerala", "Lighter electric scooter for short trips."),
  bike("ather-450x", "Ather 450X", "Ather", "450X", 2024, "Scooter", "Electric", "Automatic", 1300, "goa", "Quick electric scooter with a touch dash."),
  bike("ather-rizta", "Ather Rizta", "Ather", "Rizta", 2025, "Scooter", "Electric", "Automatic", 1250, "kerala", "Family electric scooter with a flat floor."),
  bike("tvs-iqube", "TVS iQube", "TVS", "iQube", 2024, "Scooter", "Electric", "Automatic", 1000, "himachal", "Quiet electric scooter for hill towns."),
  bike("bajaj-chetak", "Bajaj Chetak", "Bajaj", "Chetak", 2024, "Scooter", "Electric", "Automatic", 1100, "kashmir", "Premium electric scooter with a closed battery."),
  bike("hero-vida-v2", "Hero Vida V2", "Hero", "Vida V2", 2024, "Scooter", "Electric", "Automatic", 1050, "jammu", "Electric scooter with removable batteries."),
  bike("simple-one", "Simple One", "Simple", "One", 2024, "Scooter", "Electric", "Automatic", 1150, "goa", "Long-range electric scooter."),
  bike("okinawa-praise", "Okinawa Praise Pro", "Okinawa", "Praise Pro", 2023, "Scooter", "Electric", "Automatic", 850, "kerala", "Practical electric scooter for town."),
  bike("ampere-magnus", "Ampere Magnus", "Ampere", "Magnus", 2023, "Scooter", "Electric", "Automatic", 700, "himachal", "Easy electric scooter for short hops."),

  bike("re-hunter-350", "Royal Enfield Hunter 350", "Royal Enfield", "Hunter 350", 2024, "Motorcycle", "Petrol", "Manual", 1600, "goa", "Roadster for coast roads and cafes."),
  bike("re-bullet-350", "Royal Enfield Bullet 350", "Royal Enfield", "Bullet 350", 2023, "Motorcycle", "Petrol", "Manual", 1500, "kashmir", "Classic thumper for valley roads."),
  bike("honda-shine", "Honda Shine", "Honda", "Shine", 2024, "Motorcycle", "Petrol", "Manual", 700, "kerala", "Reliable commuter motorcycle."),
  bike("honda-sp-125", "Honda SP 125", "Honda", "SP 125", 2024, "Motorcycle", "Petrol", "Manual", 650, "jammu", "Light 125cc bike for daily use."),
  bike("hero-splendor-plus", "Hero Splendor Plus", "Hero", "Splendor Plus", 2023, "Motorcycle", "Petrol", "Manual", 550, "himachal", "Frugal commuter for town and highway."),
  bike("bajaj-pulsar-150", "Bajaj Pulsar 150", "Bajaj", "Pulsar 150", 2023, "Motorcycle", "Petrol", "Manual", 900, "goa", "Sporty commuter for longer days."),
  bike("bajaj-pulsar-ns200", "Bajaj Pulsar NS200", "Bajaj", "Pulsar NS200", 2024, "Motorcycle", "Petrol", "Manual", 1400, "ladakh", "Naked bike with enough power for passes."),
  bike("tvs-apache-rtr-160", "TVS Apache RTR 160", "TVS", "Apache RTR 160", 2024, "Motorcycle", "Petrol", "Manual", 1000, "kerala", "Light sports bike for winding roads."),
  bike("yamaha-mt-15", "Yamaha MT-15", "Yamaha", "MT-15", 2024, "Motorcycle", "Petrol", "Manual", 1500, "goa", "Naked street bike, sharp in town."),
  bike("yamaha-r15", "Yamaha R15", "Yamaha", "R15", 2024, "Motorcycle", "Petrol", "Manual", 1700, "kashmir", "Faired sports bike for smoother highways."),
  bike("suzuki-gixxer", "Suzuki Gixxer", "Suzuki", "Gixxer", 2023, "Motorcycle", "Petrol", "Manual", 1100, "himachal", "Street motorcycle for hill highways."),
  bike("ktm-duke-390", "KTM Duke 390", "KTM", "Duke 390", 2024, "Motorcycle", "Petrol", "Manual", 2800, "ladakh", "Fast single for riders who want pace."),

  bike("revolt-rv400", "Revolt RV400", "Revolt", "RV400", 2024, "Motorcycle", "Electric", "Automatic", 1800, "goa", "Electric motorcycle with swappable range modes."),
  bike("ultraviolette-f77", "Ultraviolette F77", "Ultraviolette", "F77", 2025, "Motorcycle", "Electric", "Automatic", 4500, "kerala", "Fast electric sports bike."),
  bike("tork-kratos", "Tork Kratos", "Tork", "Kratos", 2024, "Motorcycle", "Electric", "Automatic", 2000, "himachal", "Electric motorcycle for city and highway."),
  bike("oben-rorr", "Oben Rorr", "Oben", "Rorr", 2024, "Motorcycle", "Electric", "Automatic", 1900, "jammu", "Electric bike with a quick charge."),
  bike("matter-aera", "Matter Aera", "Matter", "Aera", 2025, "Motorcycle", "Electric", "Manual", 3200, "goa", "Geared electric motorcycle."),
  bike("komaki-ranger", "Komaki Ranger", "Komaki", "Ranger", 2023, "Motorcycle", "Electric", "Automatic", 1600, "kashmir", "Cruiser-style electric motorcycle."),

  bike("re-meteor-350", "Royal Enfield Meteor 350", "Royal Enfield", "Meteor 350", 2024, "Cruiser", "Petrol", "Manual", 1700, "goa", "Easy cruiser for a full day on the road."),
  bike("re-super-meteor-650", "Royal Enfield Super Meteor 650", "Royal Enfield", "Super Meteor 650", 2024, "Cruiser", "Petrol", "Manual", 3200, "kashmir", "Big twin cruiser for open highways."),
  bike("jawa-42", "Jawa 42", "Jawa", "42", 2023, "Cruiser", "Petrol", "Manual", 1800, "ladakh", "Compact cruiser with a low seat."),
  bike("jawa-perak", "Jawa Perak", "Jawa", "Perak", 2023, "Cruiser", "Petrol", "Manual", 2000, "himachal", "Bobber for slower scenic rides."),
  bike("yezdi-roadster", "Yezdi Roadster", "Yezdi", "Roadster", 2024, "Cruiser", "Petrol", "Manual", 1900, "goa", "Scrambler-cruiser for mixed roads."),
  bike("honda-hness-cb350", "Honda H'ness CB350", "Honda", "H'ness CB350", 2024, "Cruiser", "Petrol", "Manual", 1800, "kerala", "Refined retro roadster."),
  bike("harley-davidson-x440", "Harley-Davidson X440", "Harley-Davidson", "X440", 2024, "Cruiser", "Petrol", "Manual", 3500, "goa", "Roadster with a low, relaxed seat."),
  bike("re-shotgun-650", "Royal Enfield Shotgun 650", "Royal Enfield", "Shotgun 650", 2025, "Cruiser", "Petrol", "Manual", 3400, "kashmir", "Custom-style twin for longer loops."),

  bike("ktm-390-adventure", "KTM 390 Adventure", "KTM", "390 Adventure", 2024, "Adventure", "Petrol", "Manual", 3000, "ladakh", "Light adventure bike for high roads."),
  bike("re-himalayan-450", "Royal Enfield Himalayan 450", "Royal Enfield", "Himalayan 450", 2024, "Adventure", "Petrol", "Manual", 2600, "ladakh", "New Himalayan for passes and gravel."),
  bike("bmw-g310-gs", "BMW G 310 GS", "BMW", "G 310 GS", 2023, "Adventure", "Petrol", "Manual", 3200, "himachal", "Small ADV with a tall riding position."),
  bike("yezdi-adventure", "Yezdi Adventure", "Yezdi", "Adventure", 2024, "Adventure", "Petrol", "Manual", 2200, "kashmir", "Adventure bike for valley and forest roads."),
  bike("hero-xpulse-200", "Hero Xpulse 200", "Hero", "Xpulse 200", 2024, "Adventure", "Petrol", "Manual", 1400, "pahalgam", "Light dual-sport for rough lanes."),
  bike("triumph-scrambler-400x", "Triumph Scrambler 400 X", "Triumph", "Scrambler 400 X", 2024, "Adventure", "Petrol", "Manual", 2800, "gulmarg", "Scrambler for mixed tarmac and dirt."),

  bike("re-taurus-kashmir", "Royal Enfield Taurus", "Royal Enfield", "Taurus", 2019, "Motorcycle", "Diesel", "Manual", 1600, "kashmir", "Diesel Bullet for long, slow valley days."),
  bike("re-taurus-ladakh", "Royal Enfield Taurus Leh", "Royal Enfield", "Taurus", 2018, "Motorcycle", "Diesel", "Manual", 1700, "ladakh", "Diesel motorcycle kept for high-altitude hire."),
  bike("re-taurus-himachal", "Royal Enfield Taurus Manali", "Royal Enfield", "Taurus", 2019, "Motorcycle", "Diesel", "Manual", 1650, "himachal", "Diesel thumper for hill highways."),

  bike("bajaj-freedom-125", "Bajaj Freedom 125", "Bajaj", "Freedom 125", 2025, "Motorcycle", "CNG", "Manual", 900, "goa", "CNG motorcycle with a petrol backup tank."),
  bike("bajaj-freedom-125-kerala", "Bajaj Freedom 125 Kochi", "Bajaj", "Freedom 125", 2025, "Motorcycle", "CNG", "Manual", 900, "kerala", "CNG commuter for town and highway."),
];
