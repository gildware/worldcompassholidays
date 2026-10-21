import { PublicHeader } from "@/components/worldcompassholiday/PublicHeader";
import { HomeFooter } from "@/components/worldcompassholiday/HomeFooter";
import { getPublicNav } from "@/lib/navigation";
import "@/styles/worldcompassholiday-home.css";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const items = getPublicNav();

  return (
    <div className="site-shell">
      <PublicHeader />
      <main className="public-header-offset">{children}</main>
      <div className="worldcompassholiday-page site-footer-scope">
        <HomeFooter items={items} />
      </div>
    </div>
  );
}
