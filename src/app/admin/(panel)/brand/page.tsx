import type { Metadata } from "next";
import { BrandScreen } from "@/components/admin/BrandScreen";
import { requirePermission } from "@/lib/auth/guards";
import { getSiteBrand } from "@/lib/brand";

export const metadata: Metadata = { title: "Brand" };

export default async function BrandPage() {
  await requirePermission("staff.manage");
  const brand = await getSiteBrand();

  return (
    <BrandScreen
      logo={
        brand.logoUrl && brand.logoKey
          ? {
              url: brand.logoUrl,
              key: brand.logoKey,
              driver: brand.logoDriver === "cloudinary" ? "cloudinary" : "local",
            }
          : null
      }
      covers={brand.covers}
    />
  );
}
