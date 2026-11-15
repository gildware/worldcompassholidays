import { localFaqs, selectionKeys, type CatalogOption } from "@/lib/catalog";
import { parseJsonArray } from "@/lib/tours/json";

export type CatalogLabel = {
  title: string;
  iconUrl: string;
  content: string;
};

export function resolveCatalogItems(stored: string, options: CatalogOption[]): CatalogLabel[] {
  return selectionKeys(parseJsonArray<unknown>(stored)).flatMap((key) => {
    const item = options.find((row) => row.id === key || row.title === key);
    return item ? [{ title: item.title, iconUrl: item.iconUrl, content: item.content }] : [];
  });
}

export function resolveTitles(stored: string, options: CatalogOption[]) {
  return resolveCatalogItems(stored, options).map((item) => item.title);
}

export function resolveFaqs(stored: string, options: CatalogOption[]) {
  const parsed = parseJsonArray<unknown>(stored);
  const byId = new Map(options.map((item) => [item.id, item]));
  const shared = selectionKeys(parsed).flatMap((id) => {
    const item = byId.get(id);
    return item ? [{ title: item.title, content: item.content, iconUrl: item.iconUrl }] : [];
  });
  return [
    ...shared,
    ...localFaqs(parsed).map((item) => ({ ...item, iconUrl: "" })),
  ];
}
