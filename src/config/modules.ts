export const modules = {
  tours: true,
  hotels: true,
  cars: true,
  bikes: true,
  buses: true,
} as const;

export type ModuleKey = keyof typeof modules;

export const moduleLabels: Record<ModuleKey, string> = {
  tours: "Tours & treks",
  hotels: "Hotels",
  cars: "Car rental",
  bikes: "Bike rental",
  buses: "Bus booking",
};
