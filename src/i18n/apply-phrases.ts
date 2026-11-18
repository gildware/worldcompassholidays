import type { Locale } from "@/i18n/locales";
import { localizeNumerals } from "@/lib/format";

/** Short English words that are safe to swap inside a longer line. */
const FRAGMENTS = new Set([
  "days",
  "day",
  "hours",
  "hour",
  "max",
  "star",
  "Photo",
  "Resort",
  "Villa",
  "Homestay",
  "Guesthouse",
  "Apartment",
  "Easy",
  "Moderate",
  "Demanding",
  "reviews",
  "tours",
  "tour",
  "adults",
  "adult",
  "children",
  "child",
  "Hotel",
  "Stay",
  "Private",
  "Shared",
  "Wifi",
  "Parking",
  "Restaurant",
  "Laundry",
  "Desk",
  "stay",
  "stays",
  "rental",
  "rentals",
  "destination",
  "destinations",
  "door",
  "doors",
  "passenger",
  "passengers",
  "room",
  "rooms",
  "properties",
  "included",
  "km",
  "night",
  "nights",
  "India",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "January",
  "February",
  "March",
  "April",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]);

const patternCache = new Map<string, RegExp>();

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function phrasePattern(phrase: string) {
  let pattern = patternCache.get(phrase);
  if (!pattern) {
    pattern = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(phrase)}(?![\\p{L}\\p{N}])`, "gu");
    patternCache.set(phrase, pattern);
  }
  pattern.lastIndex = 0;
  return pattern;
}

export function fold(value: string) {
  return value.replace(/[\u2018\u2019\u201B]/g, "'").replace(/[\u2013\u2014]/g, "-");
}

function word(map: Map<string, string>, english: string) {
  const value = map.get(english);
  return value && value !== english ? value : english;
}

function applyTemplates(source: string, map: Map<string, string>): string {
  let   match = source.match(/^(\d+) days$/);
  if (match) return `${match[1]} ${word(map, "days")}`;
  match = source.match(/^(\d+)[–-](\d+) days$/);
  if (match) return `${match[1]}–${match[2]} ${word(map, "days")}`;
  match = source.match(/^(\d+) day$/);
  if (match) return `${match[1]} ${word(map, "day")}`;
  match = source.match(/^Apply for (.+) Visa$/);
  if (match) {
    const place = map.get(match[1]);
    const pattern = map.get("Apply for {country} Visa");
    if (place && place !== match[1] && pattern && pattern.includes("{country}")) {
      return pattern.split("{country}").join(place);
    }
  }
  match = source.match(/^Step (\d+): (.+)$/);
  if (match) {
    const label = map.get(match[2]);
    if (label && label !== match[2]) return `${word(map, "Step")} ${match[1]}: ${label}`;
  }
  match = source.match(/^(\d+) hours$/);
  if (match) return `${match[1]} ${word(map, "hours")}`;
  if (source === "1 hour") return word(map, "1 hour");
  match = source.match(/^(\d+) h (\d+) min$/);
  if (match) return `${match[1]} ${word(map, "h")} ${match[2]} ${word(map, "min")}`;
  match = source.match(/^Small group · max (\d+)$/);
  if (match) return `${word(map, "Small group")} · ${word(map, "max")} ${match[1]}`;
  match = source.match(/^Private · up to (\d+)$/);
  if (match) return `${word(map, "Private")} · ${word(map, "up to")} ${match[1]}`;
  match = source.match(/^Shared · max (\d+)$/);
  if (match) return `${word(map, "Shared")} · ${word(map, "max")} ${match[1]}`;
  match = source.match(/^(\d+)-star$/);
  if (match) return `${match[1]}-${word(map, "star")}`;
  match = source.match(/^Photo (\d+) of (\d+)$/);
  if (match) return `${word(map, "Photo")} ${match[1]} ${word(map, "of")} ${match[2]}`;
  match = source.match(/^Add (.+) to favorites$/);
  if (match) return `${word(map, "Add")} ${match[1]} ${word(map, "to favorites")}`;
  match = source.match(/^Remove (.+) from favorites$/);
  if (match) return `${word(map, "Remove")} ${match[1]} ${word(map, "from favorites")}`;
  match = source.match(/^Sort: (.+)$/);
  if (match) {
    const inner = map.get(match[1]);
    if (inner && inner !== match[1]) return `${word(map, "Sort")}: ${inner}`;
  }
  match = source.match(/^Departs (.+)$/);
  if (match) return `${word(map, "Departs")} ${match[1]}`;
  match = source.match(/^(\d+) reviews$/);
  if (match) return `${match[1]} ${word(map, "reviews")}`;
  match = source.match(/^(\d+) Google reviews$/);
  if (match) return `${match[1]} ${word(map, "Google reviews")}`;
  match = source.match(/^(\d+) Google review$/);
  if (match) return `${match[1]} ${word(map, "Google review")}`;
  match = source.match(/^(\d+) seats$/);
  if (match) return `${match[1]} ${word(map, "seats")}`;
  match = source.match(/^(\d+) nights$/);
  if (match) return `${match[1]} ${word(map, match[1] === "1" ? "night" : "nights")}`;
  match = source.match(/^(\d+) night$/);
  if (match) return `${match[1]} ${word(map, "night")}`;
  match = source.match(/^(.*?) · (\d+) nights$/);
  if (match) return `${match[1]} · ${match[2]} ${word(map, match[2] === "1" ? "night" : "nights")}`;
  match = source.match(/^(.*?) · (\d+) night$/);
  if (match) return `${match[1]} · ${match[2]} ${word(map, "night")}`;
  match = source.match(/^(\d+) years$/);
  if (match) return `${match[1]} ${word(map, match[1] === "1" ? "year" : "years")}`;
  match = source.match(/^(\d+) year$/);
  if (match) return `${match[1]} ${word(map, "year")}`;
  match = source.match(/^Child (\d+)$/);
  if (match) return `${word(map, "Child")} ${match[1]}`;
  match = source.match(/^Age of child (\d+)$/);
  if (match) {
    const pattern = map.get("Age of child {n}");
    if (pattern && pattern.includes("{n}")) return pattern.split("{n}").join(match[1]);
  }
  match = source.match(/^₹[\d,]+ per night$/);
  if (match && map.get("per night")) return source.replace("per night", word(map, "per night"));
  match = source.match(/^(\d+) adults · (\d+) (child|children)(?: \((.+) years\))? · (\d+) (room|rooms)$/);
  if (match) {
    const ages = match[4] ? ` (${match[4]} ${word(map, "years")})` : "";
    const childWord = match[3] === "child" ? word(map, "child") : word(map, "children");
    const roomWord = match[6] === "room" ? word(map, "room") : word(map, "rooms");
    return `${match[1]} ${word(map, "adults")} · ${match[2]} ${childWord}${ages} · ${match[5]} ${roomWord}`;
  }
  match = source.match(/^(\d+) km included$/);
  if (match) return `${match[1]} ${word(map, "km included")}`;
  match = source.match(/^(\d+) doors$/);
  if (match) return `${match[1]} ${word(map, "doors")}`;
  match = source.match(/^(\d+) door$/);
  if (match) return `${match[1]} ${word(map, "door")}`;
  match = source.match(/^Previous photo of (.+)$/);
  if (match) return `${word(map, "Previous photo of")} ${match[1]}`;
  match = source.match(/^Next photo of (.+)$/);
  if (match) return `${word(map, "Next photo of")} ${match[1]}`;
  match = source.match(/^Photos of (.+)$/);
  if (match) return `${word(map, "Photos of")} ${match[1]}`;
  match = source.match(/^Fewer nights at (.+)$/);
  if (match) return `${word(map, "Fewer nights at")} ${match[1]}`;
  match = source.match(/^More nights at (.+)$/);
  if (match) return `${word(map, "More nights at")} ${match[1]}`;
  match = source.match(/^(.+) photos$/);
  if (match && map.get("photos")) return `${match[1]} ${word(map, "photos")}`;
  match = source.match(/^total · (.+) \/ night$/);
  if (match) return `${word(map, "total")} · ${match[1]} ${word(map, "/ night")}`;
  match = source.match(/^Free cancellation until (.+)$/);
  if (match) return `${word(map, "Free cancellation until")} ${match[1]}`;
  match = source.match(/^Close (.+)$/);
  if (match) {
    const exactInner = map.get(match[1]);
    const inner = exactInner && exactInner !== match[1] ? exactInner : applyTemplates(match[1], map);
    if (inner !== match[1]) return `${word(map, "Close")} ${inner}`;
  }
  match = source.match(/^(\d+) travellers$/);
  if (match) return `${match[1]} ${word(map, "travellers")}`;
  match = source.match(/^(\d+) traveller$/);
  if (match) return `${match[1]} ${word(map, "traveller")}`;
  match = source.match(/^Digit (\d+)$/);
  if (match) return `${word(map, "Digit")} ${match[1]}`;
  match = source.match(/^We texted a 6-digit code to (.+)\.$/);
  if (match) {
    const pattern = map.get("We texted a 6-digit code to {phone}.");
    if (pattern && pattern.includes("{phone}")) return pattern.split("{phone}").join(match[1]);
  }
  match = source.match(/^(.+) is verified\. Add your name to finish\.$/);
  if (match) {
    const pattern = map.get("{phone} is verified. Add your name to finish.");
    if (pattern && pattern.includes("{phone}")) return pattern.split("{phone}").join(match[1]);
  }
  match = source.match(/^Enter a valid (.+) mobile number, without the country code\.$/);
  if (match) {
    const pattern = map.get("Enter a valid {name} mobile number, without the country code.");
    const place = word(map, match[1]);
    if (pattern && pattern.includes("{name}")) return pattern.split("{name}").join(place);
  }
  return source;
}

const holePatternLists = new WeakMap<Map<string, string>, { parts: string[]; translated: string; length: number }[]>();

function holePatterns(map: Map<string, string>) {
  let list = holePatternLists.get(map);
  if (list) return list;
  list = [];
  for (const [english, translated] of map) {
    if (!english.includes("{n}") || !translated.includes("{n}")) continue;
    const parts = english.split("{n}");
    if (parts.length !== translated.split("{n}").length) continue;
    list.push({ parts, translated, length: english.length });
  }
  list.sort((left, right) => right.length - left.length);
  holePatternLists.set(map, list);
  return list;
}

function applyHolePatterns(source: string, map: Map<string, string>) {
  for (const pattern of holePatterns(map)) {
    const expression = new RegExp(`^${pattern.parts.map(escapeRegExp).join("([\\s\\S]+?)")}$`);
    const match = source.match(expression);
    if (!match) continue;
    let value = pattern.translated;
    for (let index = 1; index < match.length; index += 1) value = value.replace("{n}", match[index]);
    return value;
  }
  return source;
}

function replacePieces(source: string, map: Map<string, string>, phrases: string[]) {
  let next = source;
  for (const phrase of phrases) {
    if (!next.includes(phrase)) continue;
    const translated = map.get(phrase);
    if (!translated || translated === phrase || translated === next) continue;
    next = next.replace(phrasePattern(phrase), translated);
  }
  return next;
}

export function speak(source: string, map: Map<string, string>, phrases: string[], locale: Locale) {
  const exact = map.get(source) || map.get(fold(source));
  let next = source;
  if (exact && exact !== source) next = exact;
  else {
    const patterned = applyHolePatterns(source, map);
    if (patterned !== source) next = patterned;
    else {
      const templated = applyTemplates(source, map);
      next = replacePieces(templated, map, phrases);
    }
  }
  return localizeNumerals(next, locale);
}

export function compilePhrases(map: Map<string, string>) {
  return [...map.keys()]
    .filter((phrase) => {
      if (phrase.length < 3) return false;
      if (phrase.includes(" ") || phrase.length >= 8 || FRAGMENTS.has(phrase)) return true;
      return /^[A-Za-z][A-Za-z'’.-]*$/.test(phrase);
    })
    .sort((a, b) => b.length - a.length);
}

export function buildPhraseMap(entries: Iterable<[string, string]>) {
  const map = new Map<string, string>();
  for (const [key, value] of entries) {
    if (!key || !value || key === value) continue;
    map.set(key, value);
    const folded = fold(key);
    if (folded !== key && !map.has(folded)) map.set(folded, value);
  }
  return map;
}
