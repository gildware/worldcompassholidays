export type RequestOption = { value: string; label: string };
export type BudgetBand = { value: string; label: string; note: string };

export const tourLengths = [
  { value: "day", label: "Day trip" },
  { value: "2-3", label: "2–3 days" },
  { value: "4-6", label: "4–6 days" },
  { value: "week", label: "A week or more" },
] as const;

export const tourStyles = [
  { value: "any", label: "Any" },
  { value: "group", label: "Shared group" },
  { value: "private", label: "Private" },
] as const;

export const tourTypes = [
  { value: "any", label: "Any" },
  { value: "religious", label: "Religious / pilgrimage" },
  { value: "honeymoon", label: "Honeymoon" },
  { value: "adventure", label: "Adventure" },
  { value: "family", label: "Family" },
  { value: "culture", label: "Culture & heritage" },
  { value: "nature", label: "Nature & wildlife" },
  { value: "leisure", label: "Leisure & sightseeing" },
] as const;

export const tourFoodPreferences = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
] as const;

export const tourDietaryPreferences = [
  { value: "any", label: "Any" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "non-vegetarian", label: "Non-vegetarian" },
  { value: "jain", label: "Jain" },
  { value: "halal", label: "Halal" },
] as const;

export const tourCarPreferences = [
  { value: "any", label: "Any" },
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "muv", label: "MUV / Tempo Traveller" },
  { value: "luxury", label: "Luxury" },
  { value: "none", label: "No car needed" },
] as const;

export const tourHotelPreferences = [
  { value: "any", label: "Any" },
  { value: "budget", label: "Budget" },
  { value: "comfortable", label: "Comfortable" },
  { value: "3-star", label: "3-star" },
  { value: "4-star", label: "4-star" },
  { value: "5-star", label: "5-star" },
  { value: "luxury", label: "Luxury" },
  { value: "houseboat", label: "Houseboat" },
] as const;

export const carTypes = [
  { value: "any", label: "Any" },
  { value: "hatchback", label: "Hatchback" },
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "muv", label: "MUV" },
  { value: "luxury", label: "Luxury" },
] as const;

export const driveOptions = [
  { value: "self", label: "Self-drive" },
  { value: "driver", label: "With driver" },
] as const;

export const transmissionOptions = [
  { value: "manual", label: "Manual" },
  { value: "automatic", label: "Automatic" },
  { value: "either", label: "Either" },
] as const;

export const bikeTypes = [
  { value: "any", label: "Any" },
  { value: "scooter", label: "Scooter" },
  { value: "commuter", label: "Commuter" },
  { value: "cruiser", label: "Cruiser" },
  { value: "adventure", label: "Adventure" },
  { value: "touring", label: "Touring" },
] as const;

export const riderOptions = [
  { value: "1", label: "Solo" },
  { value: "2", label: "With a pillion" },
] as const;

export const helmetOptions = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
] as const;

export const yesNoOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
] as const;

export const hotelRoomTypes = [
  { value: "any", label: "Any" },
  { value: "standard", label: "Standard" },
  { value: "deluxe", label: "Deluxe" },
  { value: "super-deluxe", label: "Super Deluxe" },
  { value: "suite", label: "Suite" },
  { value: "family", label: "Family Room" },
  { value: "connecting", label: "Connecting Rooms" },
] as const;

export const legacyHotelRoomTypes = [
  { value: "double", label: "Double" },
  { value: "twin", label: "Twin" },
] as const;

export const hotelMeals = [
  { value: "any", label: "Any" },
  { value: "room", label: "Room only" },
  { value: "breakfast", label: "Breakfast" },
  { value: "half", label: "Breakfast and dinner" },
  { value: "full", label: "All meals" },
] as const;

export const tourBudgetBands: readonly BudgetBand[] = [
  { value: "upto-5000", label: "Up to 5,000", note: "Up to INR 5,000 per person" },
  { value: "5000-15000", label: "5,000 – 15,000", note: "INR 5,000 to 15,000 per person" },
  { value: "15000-30000", label: "15,000 – 30,000", note: "INR 15,000 to 30,000 per person" },
  { value: "30000-60000", label: "30,000 – 60,000", note: "INR 30,000 to 60,000 per person" },
  { value: "above-60000", label: "Above 60,000", note: "Above INR 60,000 per person" },
];

export const carBudgetBands: readonly BudgetBand[] = [
  { value: "upto-2000", label: "Up to 2,000", note: "Up to INR 2,000 per day" },
  { value: "2000-4000", label: "2,000 – 4,000", note: "INR 2,000 to 4,000 per day" },
  { value: "4000-7000", label: "4,000 – 7,000", note: "INR 4,000 to 7,000 per day" },
  { value: "7000-12000", label: "7,000 – 12,000", note: "INR 7,000 to 12,000 per day" },
  { value: "above-12000", label: "Above 12,000", note: "Above INR 12,000 per day" },
];

export const bikeBudgetBands: readonly BudgetBand[] = [
  { value: "upto-800", label: "Up to 800", note: "Up to INR 800 per day" },
  { value: "800-1500", label: "800 – 1,500", note: "INR 800 to 1,500 per day" },
  { value: "1500-2500", label: "1,500 – 2,500", note: "INR 1,500 to 2,500 per day" },
  { value: "2500-4000", label: "2,500 – 4,000", note: "INR 2,500 to 4,000 per day" },
  { value: "above-4000", label: "Above 4,000", note: "Above INR 4,000 per day" },
];

export const hotelBudgetBands: readonly BudgetBand[] = [
  { value: "under-2000", label: "Under ₹2,000", note: "Under INR 2,000 per night" },
  { value: "2000-4000", label: "₹2,000–₹4,000", note: "INR 2,000 to 4,000 per night" },
  { value: "4000-7000", label: "₹4,000–₹7,000", note: "INR 4,000 to 7,000 per night" },
  { value: "7000-10000", label: "₹7,000–₹10,000", note: "INR 7,000 to 10,000 per night" },
  { value: "10000-15000", label: "₹10,000–₹15,000", note: "INR 10,000 to 15,000 per night" },
  { value: "above-15000", label: "₹15,000+", note: "INR 15,000 or more per night" },
];

export const legacyHotelBudgetBands: readonly BudgetBand[] = [
  { value: "upto-3000", label: "Up to 3,000", note: "Up to INR 3,000 per night" },
  { value: "3000-6000", label: "3,000 – 6,000", note: "INR 3,000 to 6,000 per night" },
  { value: "6000-10000", label: "6,000 – 10,000", note: "INR 6,000 to 10,000 per night" },
  { value: "10000-20000", label: "10,000 – 20,000", note: "INR 10,000 to 20,000 per night" },
  { value: "above-20000", label: "Above 20,000", note: "Above INR 20,000 per night" },
];

export const allHotelBudgetBands: readonly BudgetBand[] = [
  ...hotelBudgetBands,
  ...legacyHotelBudgetBands,
];

export const hotelStayPreferences = [
  { value: "luxury", label: "Luxury stay", text: "A special, elevated stay" },
  { value: "comfortable", label: "Comfortable stay", text: "A relaxed, reliable base" },
  { value: "family", label: "Family friendly", text: "Room for everyone" },
  { value: "budget", label: "Budget friendly", text: "Great value matters most" },
  { value: "any", label: "No preference", text: "Find the best fit" },
] as const;

export const hotelAdditionalPreferences = [
  { value: "lake-view", label: "Lake view" },
  { value: "mountain-view", label: "Mountain view" },
  { value: "city-view", label: "City view" },
  { value: "near-market", label: "Near market" },
  { value: "pool", label: "Swimming pool" },
  { value: "parking", label: "Parking" },
  { value: "wifi", label: "Free Wi-Fi" },
  { value: "airport-transfer", label: "Airport transfers" },
  { value: "pet-friendly", label: "Pet friendly" },
  { value: "family-friendly", label: "Family friendly" },
  { value: "accessible", label: "Accessible rooms" },
] as const;

export function budgetChoices(bands: readonly BudgetBand[]): RequestOption[] {
  return [{ value: "", label: "Any" }, ...bands.map(({ value, label }) => ({ value, label })), { value: "other", label: "Other" }];
}

export function optionLabel(options: readonly RequestOption[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function budgetNote(bands: readonly BudgetBand[], value: string, unit: string) {
  const band = bands.find((item) => item.value === value);
  if (band) return band.note;
  if (/^\d+$/.test(value)) return `INR ${Number(value).toLocaleString("en-IN")} ${unit}`;
  return "not set";
}

export function isBudgetValue(bands: readonly BudgetBand[], value: string) {
  if (!value) return true;
  if (bands.some((band) => band.value === value)) return true;
  if (!/^\d+$/.test(value)) return false;
  const amount = Number(value);
  return amount >= 100 && amount <= 500000;
}
