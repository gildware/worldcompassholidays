/** Country names for admin select fields. Values are stored as plain text. */
export const countries = [
  "Afghanistan",
  "Australia",
  "Bangladesh",
  "Bhutan",
  "Cambodia",
  "Canada",
  "China",
  "France",
  "Germany",
  "India",
  "Indonesia",
  "Italy",
  "Japan",
  "Kenya",
  "Malaysia",
  "Maldives",
  "Morocco",
  "Myanmar",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Pakistan",
  "Philippines",
  "Portugal",
  "Singapore",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Switzerland",
  "Thailand",
  "Turkey",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Vietnam",
] as const;

export type CountryName = (typeof countries)[number];

export function isKnownCountry(value: string): value is CountryName {
  return (countries as readonly string[]).includes(value);
}
