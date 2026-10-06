export const propertyTypes = [
  { value: "hotel", label: "Hotel" },
  { value: "resort", label: "Resort" },
  { value: "homestay", label: "Homestay" },
  { value: "villa", label: "Villa" },
  { value: "guesthouse", label: "Guesthouse" },
  { value: "apartment", label: "Apartment" },
] as const;

export const propertyTypeValues = propertyTypes.map((item) => item.value);

export type PropertyType = (typeof propertyTypes)[number]["value"];

export const bedTypes = [
  "King",
  "Queen",
  "Double",
  "Twin",
  "Single",
  "Bunk",
  "Sofa bed",
] as const;

export const mealPlans = [
  { value: "room_only", label: "Room only" },
  { value: "breakfast", label: "Breakfast included" },
  { value: "half_board", label: "Half board" },
  { value: "full_board", label: "Full board" },
] as const;

export type MealPlan = (typeof mealPlans)[number]["value"];

export function propertyTypeLabel(value: string) {
  return propertyTypes.find((item) => item.value === value)?.label ?? "Hotel";
}

export function mealPlanLabel(value: string) {
  return mealPlans.find((item) => item.value === value)?.label ?? "Room only";
}

export function isPropertyType(value: string): value is PropertyType {
  return (propertyTypeValues as readonly string[]).includes(value);
}

export function isMealPlan(value: string): value is MealPlan {
  return mealPlans.some((item) => item.value === value);
}
