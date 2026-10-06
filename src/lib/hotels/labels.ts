import { localFaqs, selectionKeys, type CatalogOption } from "@/lib/catalog";
import { parseJsonArray } from "@/lib/tours/json";

export function resolveTitles(stored: string, options: CatalogOption[]) {
  const byId = new Map(options.map((item) => [item.id, item.title]));
  return selectionKeys(parseJsonArray<unknown>(stored)).flatMap((id) => {
    const title = byId.get(id);
    return title ? [title] : [];
  });
}

export function resolveFaqs(stored: string, options: CatalogOption[]) {
  const parsed = parseJsonArray<unknown>(stored);
  const byId = new Map(options.map((item) => [item.id, item]));
  const shared = selectionKeys(parsed).flatMap((id) => {
    const item = byId.get(id);
    return item ? [{ title: item.title, content: item.content }] : [];
  });
  return [...shared, ...localFaqs(parsed)];
}
