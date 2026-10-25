import { searchKinds, type SearchKind, type SearchReason } from "@/lib/search/types";

const kindWords: Record<SearchKind, string[]> = {
  tour: ["tour", "tours", "trip", "trips", "package", "packages"],
  car: ["car", "cars"],
  bike: ["bike", "bikes", "motorcycle", "motorcycles"],
  hotel: ["hotel", "hotels", "stay", "stays"],
};

export function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function queryTokens(value: string) {
  return normalizeSearch(value)
    .split(" ")
    .filter((token) => token.length >= 2)
    .slice(0, 8);
}

export function hasSearchableQuery(value: string) {
  return queryTokens(value).length > 0;
}

/** A trailing s is optional, so "scooters" still finds "scooter". */
export function tokenVariants(token: string) {
  if (token.length > 3 && token.endsWith("s")) return [token, token.slice(0, -1)];
  return [token];
}

export function prepareQuery(value: string) {
  const tokens = queryTokens(value);
  const kinds = new Set<SearchKind>();
  const text: string[] = [];
  for (const token of tokens) {
    const matched = searchKinds.filter((kind) => kindWords[kind].includes(token));
    if (matched.length) matched.forEach((kind) => kinds.add(kind));
    else text.push(token);
  }
  return { tokens, kinds: [...kinds], text };
}

function tokenIn(text: string, token: string) {
  return tokenVariants(token).some((variant) => {
    if (text.includes(variant)) return true;
    return false;
  });
}

function weight(text: string, token: string, full: number) {
  if (!tokenIn(text, token)) return 0;
  const stem = tokenVariants(token).at(-1) ?? token;
  return text.split(" ").some((word) => word.startsWith(stem)) ? full : Math.round(full * 0.6);
}

export function scoreSearch(input: {
  title: string;
  place: string;
  type: string;
  blurb: string;
  textTokens: string[];
  featured?: boolean;
}): { score: number; reason: SearchReason } {
  const title = normalizeSearch(input.title);
  const place = normalizeSearch(input.place);
  const type = normalizeSearch(input.type);
  const blurb = normalizeSearch(input.blurb);
  const { textTokens } = input;
  if (!textTokens.length) return { score: input.featured ? 2 : 1, reason: "" };

  const blob = [title, place, type, blurb].join(" ");
  if (!textTokens.every((token) => tokenIn(blob, token))) return { score: 0, reason: "" };

  const phrase = textTokens.join(" ");
  let score = input.featured ? 4 : 0;
  if (title === phrase) score += 400;
  else if (title.startsWith(phrase)) score += 250;
  for (const token of textTokens) {
    score += weight(title, token, 120);
    score += weight(place, token, 60);
    score += weight(type, token, 48);
    score += weight(blurb, token, 16);
  }

  let reason: SearchReason = "description";
  if (textTokens.every((token) => tokenIn(title, token))) reason = "";
  else if (textTokens.some((token) => tokenIn(place, token))) reason = "place";
  else if (textTokens.some((token) => tokenIn(type, token))) reason = "type";

  return { score, reason };
}
