import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/SignupForm";
import { getCurrentUser } from "@/lib/auth/session";
import { customerReturnPath } from "@/lib/forms";

export const metadata: Metadata = { title: "Create account" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const returnPath = customerReturnPath(next);
  const user = await getCurrentUser();
  if (user?.scope === "customer") redirect(returnPath);

  return (
    <div className="mx-auto w-full max-w-md px-5 py-16">
      <h1 className="text-3xl font-semibold">Create an account</h1>
      <p className="mt-2 text-sm text-muted">
        Track enquiries and bookings, and update them before they are confirmed.
      </p>
      <div className="mt-8">
        <SignupForm next={returnPath} />
      </div>
      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link
          href={returnPath === "/account" ? "/login" : `/login?next=${encodeURIComponent(returnPath)}`}
          className="font-medium text-brand"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
