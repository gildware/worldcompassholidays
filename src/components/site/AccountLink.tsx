import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";

export async function AccountLink() {
  const user = await getCurrentUser();

  if (user?.scope === "staff") {
    return (
      <Link href="/admin" className="text-sm font-medium text-navy">
        Admin
      </Link>
    );
  }

  if (user) {
    return (
      <Link href="/account" className="text-sm font-medium text-navy">
        My account
      </Link>
    );
  }

  return (
    <Link href="/login" className="text-sm font-medium text-navy">
      Sign in
    </Link>
  );
}
