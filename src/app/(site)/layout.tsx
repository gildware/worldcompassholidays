import { PublicHeader } from "@/components/gotrip/PublicHeader";
import { SiteFooterGate } from "@/components/site/SiteFooterGate";
import { getPublicNav } from "@/lib/navigation";
import "@/styles/gotrip-home.css";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const items = getPublicNav();

  return (
    <div className="flex flex-1 flex-col">
      <PublicHeader />
      <main className="public-header-offset flex-1">{children}</main>
      <SiteFooterGate items={items} />
    </div>
  );
}
