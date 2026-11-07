import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { requireStaff } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { getSiteBrand } from "@/lib/brand";
import { getAdminNav } from "@/lib/navigation";
import { noIndexRobots } from "@/lib/seo";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s · Admin",
  },
  description: "Staff tools for World Compass Holidays.",
  robots: noIndexRobots,
};

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Keep this layout light — badge DB work used to block every menu click.
  const [user, brand] = await Promise.all([requireStaff(), getSiteBrand()]);
  const items = getAdminNav((permission) => can(user, permission));

  return (
    <div className={`${figtree.variable} ${figtree.className}`}>
      <Suspense fallback={<div className="p-6 text-sm text-muted">Loading desk…</div>}>
        <AdminShell
          items={items}
          user={{ name: user.name, roleName: user.roleName }}
          logoUrl={brand.logoUrl || null}
          signOut={
            <LogoutButton
              to="admin"
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white"
            />
          }
        >
          {children}
        </AdminShell>
      </Suspense>
    </div>
  );
}
