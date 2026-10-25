"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { isFavoriteKind } from "@/lib/favorite-kinds";
import { publishedFavoritePath } from "@/lib/favorites";
import { prisma } from "@/lib/db";

export type ToggleFavoriteResult = { ok: true; saved: boolean } | { ok: false; reason: "auth" | "missing" };

function revalidateFavorite(itemPath: string) {
  revalidatePath("/account");
  revalidatePath("/account/favorites");
  revalidatePath("/tours");
  revalidatePath("/hotels");
  revalidatePath("/rentals");
  revalidatePath("/rentals/cars");
  revalidatePath("/rentals/bikes");
  revalidatePath(itemPath);
}

export async function toggleFavorite(kind: string, itemId: string): Promise<ToggleFavoriteResult> {
  const user = await getCurrentUser();
  if (!user || user.scope !== "customer") return { ok: false, reason: "auth" };
  if (!isFavoriteKind(kind) || !itemId.trim()) return { ok: false, reason: "missing" };

  const itemPath = await publishedFavoritePath(kind, itemId);
  if (!itemPath) return { ok: false, reason: "missing" };

  const where = { userId_kind_itemId: { userId: user.id, kind, itemId } };
  const existing = await prisma.favorite.findUnique({ where, select: { id: true } });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    revalidateFavorite(itemPath);
    return { ok: true, saved: false };
  }

  await prisma.favorite.create({ data: { userId: user.id, kind, itemId } });
  revalidateFavorite(itemPath);
  return { ok: true, saved: true };
}
