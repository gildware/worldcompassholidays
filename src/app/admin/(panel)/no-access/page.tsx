import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "No access" };

export default async function NoAccessPage() {
  const user = await requireStaff();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold">You do not have access to that page</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Your role is <span className="font-medium text-navy">{user.roleName}</span>.
        Ask an administrator to add the permission you need.
      </p>
      <Link href="/admin" className="mt-6 inline-flex text-sm font-medium text-brand">
        Back to overview
      </Link>
    </div>
  );
}
