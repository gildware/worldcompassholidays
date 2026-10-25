import { HomeAccountActions } from "@/components/worldcompassholiday/HomeAccountActions";
import { HomeHeader } from "@/components/worldcompassholiday/HomeHeader";
import { getSiteBrand } from "@/lib/brand";
import { getPublicNav } from "@/lib/navigation";

export async function PublicHeader({ overlay = false }: { overlay?: boolean }) {
  const brand = await getSiteBrand();
  return (
    <HomeHeader
      items={getPublicNav()}
      overlay={overlay}
      logoUrl={brand.logoUrl || null}
      actions={<HomeAccountActions />}
    />
  );
}
