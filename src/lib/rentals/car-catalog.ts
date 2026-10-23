import { demoCars } from "@/lib/demo/north-india-catalog";

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

export const carCatalog: CarSeed[] = demoCars.map((car) => ({
  slug: car.slug,
  name: car.name,
  brand: car.brand,
  modelName: car.modelName,
  year: car.year,
  type: car.type,
  fuel: car.fuel,
  transmission: car.transmission,
  seats: car.seats,
  doors: car.doors,
  luggage: car.luggage,
  pricePerDay: car.pricePerDay,
  destination: car.destination,
  summary: car.summary,
}));
