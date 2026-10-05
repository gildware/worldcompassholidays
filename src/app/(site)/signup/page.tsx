import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/SignupForm";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Create account" };

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user?.scope === "customer") redirect("/account");

  return (
    <div className="mx-auto w-full max-w-md px-5 py-16">
      <h1 className="text-3xl font-semibold">Create an account</h1>
      <p className="mt-2 text-sm text-muted">
        Track enquiries and bookings, and update them before they are confirmed.
      </p>
      <div className="mt-8">
        <SignupForm />
      </div>
      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand">
          Sign in
        </Link>
      </p>
    </div>
  );
}
