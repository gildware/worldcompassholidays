import Link from "next/link";
import { getMessages } from "@/i18n/get-locale";
import { getCurrentUser } from "@/lib/auth/session";

export async function HomeAccountActions() {
  const [user, copy] = await Promise.all([getCurrentUser(), getMessages()]);
  const account =
    user?.scope === "staff"
      ? { href: "/admin", label: copy.header.admin }
      : user
        ? { href: "/account", label: copy.header.bookings }
        : { href: "/login", label: copy.header.signIn };

  return (
    <div className="d-flex items-center is-menu-opened-hide md:d-none">
      <Link prefetch={false}
        href={account.href}
        className="button px-30 fw-400 text-14 -white bg-white h-50 text-dark-1"
      >
        {account.label}
      </Link>
    </div>
  );
}
