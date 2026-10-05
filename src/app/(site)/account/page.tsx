import type { Metadata } from "next";
import Link from "next/link";
import { PasswordForm } from "@/components/account/PasswordForm";
import { ProfileForm } from "@/components/account/ProfileForm";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { requireCustomer } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { statusLabel } from "@/lib/bookings";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const user = await requireCustomer("account.bookings.view");

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium tracking-wide text-brand uppercase">My account</p>
          <h1 className="mt-2 text-3xl font-semibold">Hello, {user.name}</h1>
          <p className="mt-2 text-sm text-muted">{user.email}</p>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/contact" className="rounded-md bg-brand px-4 py-2 text-white">
            New enquiry
          </Link>
          <LogoutButton to="site" className="text-brand" />
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold">My bookings</h2>
        {bookings.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-line bg-white px-5 py-8 text-sm text-muted">
            No bookings yet. Send an enquiry and it will show up here.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-white">
            {bookings.map((booking) => (
              <li key={booking.id}>
                <Link
                  href={`/account/bookings/${booking.reference}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm"
                >
                  <div>
                    <p className="font-medium">{booking.title}</p>
                    <p className="text-muted">
                      {booking.reference} · {booking.module} · {booking.guests}{" "}
                      {booking.guests === 1 ? "guest" : "guests"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{statusLabel(booking.status)}</p>
                    <p className="text-muted">{formatDate(booking.createdAt)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {can(user, "account.profile.update") ? (
        <div className="grid gap-6 md:grid-cols-2">
          <ProfileForm name={user.name} email={user.email} phone={user.phone} />
          <PasswordForm />
        </div>
      ) : null}
    </div>
  );
}
