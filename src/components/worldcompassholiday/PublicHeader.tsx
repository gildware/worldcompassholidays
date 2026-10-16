import { HomeAccountActions } from "@/components/worldcompassholiday/HomeAccountActions";
import { HomeHeader } from "@/components/worldcompassholiday/HomeHeader";
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
