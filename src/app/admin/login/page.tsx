import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { staffLogin } from "@/actions/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { BrandLogo } from "@/components/worldcompassholiday/BrandLogo";
import { getSiteBrand } from "@/lib/brand";
import { getCurrentUser } from "@/lib/auth/session";
import { safeRedirectPath } from "@/lib/forms";
import { privateMetadata } from "@/lib/seo";
import "./admin-login.css";

export const metadata: Metadata = privateMetadata("Staff sign in", "Staff sign in for World Compass Holidays.");

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user?.scope === "staff") redirect("/admin");
  const brand = await getSiteBrand();

  const { next } = await searchParams;

  return (
    <div className="admin-login">
      <div className="admin-login__glow admin-login__glow--a" aria-hidden="true" />
      <div className="admin-login__glow admin-login__glow--b" aria-hidden="true" />
      <div className="admin-login__grid" aria-hidden="true" />

      <div className="admin-login__inner">
        <header className="admin-login__brand worldcompassholiday-page worldcompassholiday-header-scope">
          <BrandLogo logoUrl={brand.logoUrl || null} />
          <p className="admin-login__brand-meta">Operations</p>
        </header>

        <main className="admin-login__card">
          <div className="admin-login__card-head">
            <h1 className="admin-login__title">Staff sign in</h1>
            <p className="admin-login__subtitle">
              Use the account your administrator created for you.
            </p>
          </div>

          {user?.scope === "customer" ? (
            <p className="admin-login__notice">
              You are signed in as a customer. Signing in here will switch accounts.
            </p>
          ) : null}

          <LoginForm action={staffLogin} next={safeRedirectPath(next, "/admin", "/admin")} />
        </main>

        <p className="admin-login__foot">
          Authorized staff only. Access is logged and monitored.
        </p>
      </div>
    </div>
  );
}
