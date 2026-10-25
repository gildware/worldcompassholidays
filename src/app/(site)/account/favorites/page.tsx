import type { Metadata } from "next";
import { FavoriteList } from "@/components/account/FavoriteList";
import { requireCustomer } from "@/lib/auth/guards";
import { listFavoriteCards } from "@/lib/favorites";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata(
  "Favorites",
  "Tours, hotels, cars, and bikes saved on your World Compass Holidays account.",
);

export default async function AccountFavoritesPage() {
  const user = await requireCustomer("account.bookings.view");
  const items = await listFavoriteCards(user.id);

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-xl font-semibold leading-tight">Favorites</h1>
        <p className="mt-1 text-sm text-muted">Tours, hotels, cars, and bikes you saved. Remove any of them here.</p>
      </div>
      <FavoriteList items={items} />
    </div>
  );
}
