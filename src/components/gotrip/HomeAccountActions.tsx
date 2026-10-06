import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";

export async function HomeAccountActions() {
  const user = await getCurrentUser();
  const account =
    user?.scope === "staff"
      ? { href: "/admin", label: "Admin" }
      : user
        ? { href: "/account", label: "My account" }
        : { href: "/login", label: "Sign in" };

  return (
    <div className="d-flex items-center ml-20 is-menu-opened-hide md:d-none">
      <Link
        href={account.href}
        className="button px-30 fw-400 text-14 -white bg-white h-50 text-dark-1"
      >
        {account.label}
      </Link>
      <Link
        href="/contact"
        className="button px-30 fw-400 text-14 border-white -outline-white h-50 text-white ml-20"
      >
        Enquire
      </Link>
    </div>
  );
}
