import { MobileAppHeader } from "@/components/pwa/MobileAppHeader";
import { MobileTabBar } from "@/components/pwa/MobileTabBar";

/** Phone/tablet app chrome. Hidden on desktop via CSS. */
export function MobileAppChrome() {
  return (
    <>
      <MobileAppHeader />
      <MobileTabBar />
    </>
  );
}
