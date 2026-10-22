import { slugify } from "@/lib/slug";

const named: Record<string, string> = {
  "mostly-rented": "#c2410c",
  popular: "#be123c",
  "best-for-comfort": "#1d4ed8",
  "best-for-spacing": "#6d28d9",
};

const palette = ["#047857", "#0369a1", "#a16207", "#9f1239", "#0f766e", "#4338ca"];

export function tagColor(name: string) {
  const slug = slugify(name);
  const known = named[slug];
  if (known) return known;
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return palette[hash % palette.length];
}
