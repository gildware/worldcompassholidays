import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { staffLogin } from "@/actions/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { theme } from "@/config/theme";
import { getCurrentUser } from "@/lib/auth/session";
import { safeRedirectPath } from "@/lib/forms";

export const metadata: Metadata = { title: "Staff sign in" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user?.scope === "staff") redirect("/admin");

  const { next } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center bg-surface px-5 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-6 shadow-sm">
        <p className="text-xs font-medium tracking-wide text-brand uppercase">
          {theme.brandName} admin
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Staff sign in</h1>
        <p className="mt-2 text-sm text-muted">
          Use the account your administrator created for you.
        </p>
        {user?.scope === "customer" ? (
          <p className="mt-4 rounded-md bg-surface px-3 py-2 text-sm text-muted">
            You are signed in as a customer. Signing in here will switch accounts.
          </p>
        ) : null}
        <div className="mt-6">
          <LoginForm action={staffLogin} next={safeRedirectPath(next, "/admin", "/admin")} />
        </div>
      </div>
    </div>
  );
}
