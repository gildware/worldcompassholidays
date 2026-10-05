import { Suspense } from "react";
import { AccountLink } from "@/components/site/AccountLink";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getPublicNav } from "@/lib/navigation";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const items = getPublicNav();

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader
        items={items}
        account={
          <Suspense fallback={null}>
            <AccountLink />
          </Suspense>
        }
      />
      <main className="flex-1">{children}</main>
      <SiteFooter items={items} />
    </div>
  );
}
