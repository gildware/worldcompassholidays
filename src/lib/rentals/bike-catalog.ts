import { demoBikes } from "@/lib/demo/north-india-catalog";

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

export const bikeCatalog: BikeSeed[] = demoBikes.map((bike) => ({
  slug: bike.slug,
  name: bike.name,
  brand: bike.brand,
  modelName: bike.modelName,
  year: bike.year,
  type: bike.type,
  fuel: bike.fuel,
  transmission: bike.transmission,
  pricePerDay: bike.pricePerDay,
  destination: bike.destination,
  summary: bike.summary,
}));
