import { HomeAccountActions } from "@/components/worldcompassholiday/HomeAccountActions";
import { HomeHeader } from "@/components/worldcompassholiday/HomeHeader";
import { getMessages } from "@/i18n/get-locale";
import { getSiteBrand } from "@/lib/brand";
import { getPublicNav } from "@/lib/navigation";

export async function PublicHeader({ overlay = false }: { overlay?: boolean }) {
  const [brand, copy] = await Promise.all([getSiteBrand(), getMessages()]);
  return (
    <HomeHeader
      items={getPublicNav(copy.nav)}
      overlay={overlay}
      logoUrl={brand.logoUrl || null}
      actions={<HomeAccountActions />}
    />
  );
}
