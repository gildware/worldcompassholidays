import { HomeAccountActions } from "@/components/gotrip/HomeAccountActions";
import { HomeHeader } from "@/components/gotrip/HomeHeader";
import { getPublicNav } from "@/lib/navigation";

export function PublicHeader({ overlay = false }: { overlay?: boolean }) {
  return (
    <HomeHeader
      items={getPublicNav()}
      overlay={overlay}
      actions={<HomeAccountActions />}
    />
  );
}
