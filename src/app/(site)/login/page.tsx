import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PhoneLogin } from "@/components/auth/PhoneLogin";
import { countryIsoFromHeaders } from "@/lib/auth/countries";
import { getCurrentUser } from "@/lib/auth/session";
import { firebaseWebConfig } from "@/lib/firebase/config";
import { customerReturnPath } from "@/lib/forms";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata(
  "Sign in",
  "Sign in to World Compass Holidays with your mobile number.",
);

export default async function LoginPage({
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
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Sign in</p>
      <h1 className="mt-2 text-3xl font-semibold">Use your mobile number</h1>
      <p className="mt-2 text-sm text-muted">
        We text a 6-digit code to your mobile. New customers add their name after the code.
      </p>
      <div className="mt-8">
        <PhoneLogin
          next={returnPath}
          ready={firebaseWebConfig() !== null}
          defaultCountry={countryIsoFromHeaders(await headers())}
        />
      </div>
    </div>
  );
}
