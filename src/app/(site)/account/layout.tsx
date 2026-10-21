import type { Metadata } from "next";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { requireCustomer } from "@/lib/auth/guards";
import { formatPhone } from "@/lib/auth/phone";
import { can } from "@/lib/auth/session";
import { noIndexRobots } from "@/lib/seo";

export const metadata: Metadata = {
  robots: noIndexRobots,
  description: "Your World Compass Holidays bookings and account.",
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCustomer("account.bookings.view");

  return (
    <AccountSidebar
      name={user.name}
      phone={formatPhone(user.phone)}
      showSettings={can(user, "account.profile.update")}
    >
      {children}
    </AccountSidebar>
  );
}
