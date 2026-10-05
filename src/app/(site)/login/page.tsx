import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { customerLogin } from "@/actions/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth/session";
import { safeRedirectPath } from "@/lib/forms";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user?.scope === "customer") redirect("/account");

  const { next } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-md px-5 py-16">
      <h1 className="text-3xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-muted">See your bookings and update your requests.</p>
      {user?.scope === "staff" ? (
        <p className="mt-4 rounded-md bg-surface px-3 py-2 text-sm text-muted">
          You are signed in as staff. Signing in here will switch to a customer account.
        </p>
      ) : null}
      <div className="mt-8">
        <LoginForm action={customerLogin} next={safeRedirectPath(next, "/account", "/account")} />
      </div>
      <p className="mt-6 text-sm text-muted">
        New here?{" "}
        <Link href="/signup" className="font-medium text-brand">
          Create an account
        </Link>
      </p>
    </div>
  );
}
