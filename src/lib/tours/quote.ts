export const TOUR_CHILD = 0.65;
export const TOUR_PRIVATE = 1.46;
export const TOUR_SINGLE = 0.2;

export function round10(value: number) {
  return Math.round(value / 10) * 10;
}

export function seasonFor(iso: string) {
  const month = Number(iso.slice(5, 7));
  if (month === 12 || month === 1 || month === 2) return { factor: 1.08, name: "winter rate" };
  if (month === 11 || month === 3 || month === 4) return { factor: 0.94, name: "quieter-week rate" };
  return { factor: 1, name: "standard rate" };
}

export type TourQuoteInput = {
  priceFrom: number;
  mode: "group" | "private";
  startIso: string;
  listedPrice: number | null;
  adults: number;
  children: number;
  ownRoom: boolean;
};

export function quoteTour(input: TourQuoteInput) {
  const season = seasonFor(input.startIso || "2000-06-01");
  const listed = input.mode === "group" && input.listedPrice != null;
  const base = listed ? input.listedPrice || 0 : input.priceFrom;
  const seasonFactor = input.mode === "private" ? season.factor : 1;
  const adult = round10(base * (input.mode === "private" ? TOUR_PRIVATE : 1) * seasonFactor);
  const child = round10(adult * TOUR_CHILD);
  const singles = input.ownRoom ? input.adults : input.adults % 2;
  const singleFee = round10(input.priceFrom * TOUR_SINGLE);
  const preTax = adult * input.adults + child * input.children + singleFee * singles;
  return {
    adult,
    child,
    singles,
    singleFee,
    preTax,
    total: preTax,
    seasonName: input.mode === "private" ? season.name : "",
  };
}

export function partyBlock(input: {
  mode: "group" | "private";
  adults: number;
  children: number;
  minPeople: number;
  maxGroupSize: number;
  seats: number | null;
}) {
  const people = input.adults + input.children;
  const privateMin = Math.max(2, input.minPeople || 1);
  const groupMin = Math.max(1, input.minPeople || 1);
  const cap =
    input.mode === "group"
      ? input.seats && input.seats > 0
        ? input.seats
        : input.maxGroupSize > 0
          ? input.maxGroupSize
          : 12
      : input.maxGroupSize > 0
        ? input.maxGroupSize
        : 6;
  if (input.mode === "private" && input.adults < privateMin) {
    return `A private departure needs at least ${privateMin} adults.`;
  }
  if (input.mode === "group" && input.adults < groupMin) {
    return `This tour starts at ${groupMin} adults.`;
  }
  if (people > cap) {
    if (input.mode === "group" && input.seats && input.seats > 0) {
      return `This date has ${input.seats} seats. You have ${people} travelers.`;
    }
    return `This tour takes up to ${cap} travelers. You have ${people}.`;
  }
  return "";
}
