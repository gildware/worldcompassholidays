import { isLocale, type Locale } from "@/i18n/locales";

function pieces(text: string, size = 400) {
  const parts: string[] = [];
  let rest = text;
  while (rest.length > size) {
    const slice = rest.slice(0, size);
    const breakAt = Math.max(slice.lastIndexOf("\n"), slice.lastIndexOf("."), slice.lastIndexOf(" "));
    const cut = breakAt > 80 ? breakAt + 1 : size;
    parts.push(rest.slice(0, cut));
    rest = rest.slice(cut);
  }
  if (rest) parts.push(rest);
  return parts;
}

function usable(value: string) {
  const text = value.trim();
  if (!text || /MYMEMORY WARNING/i.test(text) || text.startsWith("<")) return "";
  return text;
}

async function translateWithMemory(text: string, source: Locale) {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", `${source}|en`);
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) return "";
  const data = (await response.json()) as { responseData?: { translatedText?: string } };
  return usable(data.responseData?.translatedText ?? "");
}

async function translateWithGoogle(text: string, source: Locale) {
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", source);
  url.searchParams.set("tl", "en");
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return "";
  const data = (await response.json()) as unknown;
  if (!Array.isArray(data) || !Array.isArray(data[0])) return "";
  return usable(
    data[0]
      .map((row) => (Array.isArray(row) && typeof row[0] === "string" ? row[0] : ""))
      .join(""),
  );
}

async function translatePiece(text: string, source: Locale) {
  const memory = await translateWithMemory(text, source);
  if (memory) return memory;
  return translateWithGoogle(text, source);
}

/** English rendering of visitor text. Empty string means translation was not available. */
export async function toEnglish(text: string, source: string | null | undefined) {
  const trimmed = text.trim();
  if (!trimmed) return "";
  if (!isLocale(source) || source === "en") return trimmed;
  try {
    const translated = (await Promise.all(pieces(trimmed).map((part) => translatePiece(part, source))))
      .filter(Boolean)
      .join("");
    return translated.trim();
  } catch {
    return "";
  }
}
