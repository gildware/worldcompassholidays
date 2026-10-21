export type CarSeed = {
  slug: string;
  name: string;
  brand: string;
  modelName: string;
  year: number;
  type: "Hatchback" | "Sedan" | "SUV" | "MUV" | "Luxury" | "EV";
  fuel: "Petrol" | "Diesel" | "Electric" | "CNG";
  transmission: "Manual" | "Automatic";
  seats: number;
  doors: number;
  luggage: number;
  pricePerDay: number;
  destination: string;
  summary: string;
};

function car(
  slug: string,
  name: string,
  brand: string,
  modelName: string,
  year: number,
  type: CarSeed["type"],
  fuel: CarSeed["fuel"],
  transmission: CarSeed["transmission"],
  seats: number,
  doors: number,
  luggage: number,
  pricePerDay: number,
  destination: string,
  summary: string,
): CarSeed {
  return {
    slug,
    name,
    brand,
    modelName,
    year,
    type,
    fuel,
    transmission,
    seats,
    doors,
    luggage,
    pricePerDay,
    destination,
    summary,
  };
}

export const carCatalog: CarSeed[] = [
  car("maruti-wagonr", "Maruti WagonR", "Maruti", "WagonR", 2024, "Hatchback", "Petrol", "Manual", 5, 4, 1, 1600, "goa", "Tall city hatchback that is easy to park."),
  car("maruti-baleno", "Maruti Baleno", "Maruti", "Baleno", 2024, "Hatchback", "Petrol", "Automatic", 5, 4, 2, 1900, "kerala", "Roomy hatchback for town and highway."),
  car("hyundai-i20", "Hyundai i20", "Hyundai", "i20", 2024, "Hatchback", "Petrol", "Automatic", 5, 4, 2, 2200, "goa", "Premium hatchback with a quiet cabin."),
  car("hyundai-grand-i10", "Hyundai Grand i10", "Hyundai", "Grand i10", 2023, "Hatchback", "Petrol", "Manual", 5, 4, 1, 1500, "jammu", "Compact hatchback for short city days."),
  car("tata-altroz", "Tata Altroz", "Tata", "Altroz", 2024, "Hatchback", "Petrol", "Manual", 5, 4, 2, 1700, "kashmir", "Solid hatchback for valley roads."),
  car("tata-punch", "Tata Punch", "Tata", "Punch", 2024, "Hatchback", "Petrol", "Manual", 5, 4, 1, 1800, "himachal", "Raised hatchback for hill-town lanes."),
  car("renault-kiger", "Renault Kiger", "Renault", "Kiger", 2023, "Hatchback", "Petrol", "Manual", 5, 4, 2, 1900, "goa", "Compact crossover hatch for the coast."),
  car("nissan-magnite", "Nissan Magnite", "Nissan", "Magnite", 2023, "Hatchback", "Petrol", "Manual", 5, 4, 2, 1850, "kerala", "Small crossover for town and backwaters."),
  car("maruti-celerio", "Maruti Celerio", "Maruti", "Celerio", 2024, "Hatchback", "Petrol", "Automatic", 5, 4, 1, 1400, "jammu", "Light automatic hatchback for daily use."),
  car("hyundai-exter", "Hyundai Exter", "Hyundai", "Exter", 2024, "Hatchback", "Petrol", "Manual", 5, 4, 1, 1750, "kerala", "Micro SUV stance on a small hatch."),

  car("hyundai-verna", "Hyundai Verna", "Hyundai", "Verna", 2024, "Sedan", "Petrol", "Automatic", 5, 4, 2, 2800, "goa", "Comfortable sedan for longer coastal drives."),
  car("skoda-slavia", "Skoda Slavia", "Skoda", "Slavia", 2024, "Sedan", "Petrol", "Automatic", 5, 4, 2, 3000, "kashmir", "Settled sedan for highway and town."),
  car("volkswagen-virtus", "Volkswagen Virtus", "Volkswagen", "Virtus", 2024, "Sedan", "Petrol", "Automatic", 5, 4, 2, 3100, "goa", "Stable sedan with a large boot."),
  car("honda-amaze", "Honda Amaze", "Honda", "Amaze", 2023, "Sedan", "Petrol", "Manual", 5, 4, 2, 2000, "kerala", "Compact sedan that is easy on fuel."),
  car("maruti-dzire", "Maruti Dzire", "Maruti", "Dzire", 2024, "Sedan", "Petrol", "Manual", 5, 4, 2, 1800, "jammu", "Familiar compact sedan for city days."),
  car("hyundai-aura", "Hyundai Aura", "Hyundai", "Aura", 2023, "Sedan", "Petrol", "Manual", 5, 4, 2, 1700, "himachal", "Small sedan for hill-town errands."),
  car("honda-city-hybrid", "Honda City Hybrid", "Honda", "City Hybrid", 2024, "Sedan", "Petrol", "Automatic", 5, 4, 2, 3400, "goa", "Hybrid sedan for quiet coastal miles."),
  car("skoda-superb", "Skoda Superb", "Skoda", "Superb", 2023, "Sedan", "Petrol", "Automatic", 5, 4, 3, 6500, "kashmir", "Long sedan with a large boot for a family."),

  car("hyundai-creta", "Hyundai Creta", "Hyundai", "Creta", 2024, "SUV", "Petrol", "Automatic", 5, 5, 3, 3500, "goa", "Popular compact SUV for mixed roads."),
  car("kia-seltos", "Kia Seltos", "Kia", "Seltos", 2024, "SUV", "Petrol", "Automatic", 5, 5, 3, 3400, "kerala", "Compact SUV with a high seat."),
  car("tata-harrier", "Tata Harrier", "Tata", "Harrier", 2024, "SUV", "Diesel", "Automatic", 5, 5, 3, 4200, "ladakh", "Wide diesel SUV for high roads."),
  car("tata-safari", "Tata Safari", "Tata", "Safari", 2024, "SUV", "Diesel", "Automatic", 7, 5, 3, 4500, "himachal", "Three-row diesel SUV for a family."),
  car("mahindra-xuv700", "Mahindra XUV700", "Mahindra", "XUV700", 2024, "SUV", "Diesel", "Automatic", 7, 5, 3, 4800, "kashmir", "Three-row SUV for valley days."),
  car("mahindra-scorpio-n", "Mahindra Scorpio-N", "Mahindra", "Scorpio-N", 2024, "SUV", "Diesel", "Manual", 7, 5, 3, 4000, "ladakh", "Body-on-frame SUV for rough approaches."),
  car("toyota-fortuner", "Toyota Fortuner", "Toyota", "Fortuner", 2023, "SUV", "Diesel", "Automatic", 7, 5, 3, 7000, "kashmir", "Ladder-frame SUV for long mountain days."),
  car("mg-hector", "MG Hector", "MG", "Hector", 2023, "SUV", "Petrol", "Automatic", 5, 5, 3, 3600, "goa", "Wide SUV with a large glass roof."),
  car("hyundai-venue", "Hyundai Venue", "Hyundai", "Venue", 2024, "SUV", "Petrol", "Manual", 5, 5, 2, 2600, "jammu", "Small SUV that is easy in town."),
  car("kia-sonet", "Kia Sonet", "Kia", "Sonet", 2024, "SUV", "Petrol", "Manual", 5, 5, 2, 2500, "kerala", "Compact SUV for city and highway."),
  car("mahindra-xuv-3xo", "Mahindra XUV 3XO", "Mahindra", "XUV 3XO", 2025, "SUV", "Petrol", "Automatic", 5, 5, 2, 2800, "goa", "Small automatic SUV for the coast."),
  car("hyundai-creta-diesel", "Hyundai Creta Diesel", "Hyundai", "Creta", 2023, "SUV", "Diesel", "Manual", 5, 5, 3, 3300, "ladakh", "Diesel Creta for longer highway days."),

  car("maruti-ertiga", "Maruti Ertiga", "Maruti", "Ertiga", 2024, "MUV", "Petrol", "Manual", 7, 5, 2, 2800, "goa", "Seven-seat MUV for a family on the coast."),
  car("kia-carens", "Kia Carens", "Kia", "Carens", 2024, "MUV", "Petrol", "Automatic", 7, 5, 2, 3200, "kerala", "Three-row MUV with an easy automatic."),
  car("renault-triber", "Renault Triber", "Renault", "Triber", 2023, "MUV", "Petrol", "Manual", 7, 5, 1, 2200, "jammu", "Compact seven-seater for town hops."),
  car("maruti-xl6", "Maruti XL6", "Maruti", "XL6", 2024, "MUV", "Petrol", "Automatic", 6, 5, 2, 3000, "himachal", "Six-seat MUV with captain chairs."),
  car("toyota-innova-hycross", "Toyota Innova Hycross", "Toyota", "Innova Hycross", 2024, "MUV", "Petrol", "Automatic", 7, 5, 3, 5500, "kashmir", "Hybrid MUV for a full family."),

  car("mercedes-c-class", "Mercedes-Benz C-Class", "Mercedes-Benz", "C-Class", 2023, "Luxury", "Petrol", "Automatic", 5, 4, 2, 12000, "goa", "Quiet luxury sedan for the coast."),
  car("bmw-3-series", "BMW 3 Series", "BMW", "3 Series", 2023, "Luxury", "Petrol", "Automatic", 5, 4, 2, 13000, "kashmir", "Sport sedan for open valley roads."),
  car("audi-a4", "Audi A4", "Audi", "A4", 2023, "Luxury", "Petrol", "Automatic", 5, 4, 2, 12500, "goa", "Settled luxury sedan with quattro grip."),
  car("toyota-camry", "Toyota Camry", "Toyota", "Camry", 2024, "Luxury", "Petrol", "Automatic", 5, 4, 2, 8000, "kerala", "Hybrid luxury sedan for long days."),
  car("mercedes-e-class", "Mercedes-Benz E-Class", "Mercedes-Benz", "E-Class", 2024, "Luxury", "Diesel", "Automatic", 5, 4, 3, 18000, "kashmir", "Long-wheelbase sedan for a chauffeur or self-drive."),

  car("tata-nexon-ev", "Tata Nexon EV", "Tata", "Nexon EV", 2024, "EV", "Electric", "Automatic", 5, 5, 2, 3200, "goa", "Electric compact SUV for town range."),
  car("mg-zs-ev", "MG ZS EV", "MG", "ZS EV", 2024, "EV", "Electric", "Automatic", 5, 5, 2, 3400, "kerala", "Electric SUV with a calm ride."),
  car("hyundai-ioniq-5", "Hyundai Ioniq 5", "Hyundai", "Ioniq 5", 2024, "EV", "Electric", "Automatic", 5, 5, 3, 6000, "goa", "Fast-charging electric crossover."),
  car("byd-atto-3", "BYD Atto 3", "BYD", "Atto 3", 2024, "EV", "Electric", "Automatic", 5, 5, 2, 3800, "himachal", "Electric crossover for hill towns."),
  car("tata-tiago-ev", "Tata Tiago EV", "Tata", "Tiago EV", 2024, "EV", "Electric", "Automatic", 5, 4, 1, 2200, "jammu", "Small electric hatchback for short hops."),
  car("kia-ev6", "Kia EV6", "Kia", "EV6", 2024, "EV", "Electric", "Automatic", 5, 5, 3, 7000, "kashmir", "Long-range electric crossover."),

  car("maruti-wagonr-cng", "Maruti WagonR CNG", "Maruti", "WagonR", 2024, "Hatchback", "CNG", "Manual", 5, 4, 1, 1500, "goa", "CNG hatchback for cheaper town miles."),
  car("maruti-dzire-cng", "Maruti Dzire CNG", "Maruti", "Dzire", 2024, "Sedan", "CNG", "Manual", 5, 4, 2, 1700, "kerala", "CNG sedan with a useful boot."),
  car("maruti-ertiga-cng", "Maruti Ertiga CNG", "Maruti", "Ertiga", 2024, "MUV", "CNG", "Manual", 7, 5, 2, 2600, "jammu", "Seven-seat CNG MUV for a family."),
];
