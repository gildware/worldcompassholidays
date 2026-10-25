import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingList } from "@/components/account/BookingList";
import { requireCustomer } from "@/lib/auth/guards";
import { accountSectionForModule } from "@/lib/account-sections";
import { prisma } from "@/lib/db";
import { notCustomEnquiryWhere } from "@/lib/enquiries";

export async function ModuleAccountPage({ module }: { module: string }) {
  const section = accountSectionForModule(module);
  if (!section || section.fleet) notFound();

  const user = await requireCustomer("account.bookings.view");
  const bookings = await prisma.booking.findMany({
    where: { userId: user.id, module, ...notCustomEnquiryWhere() },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold leading-tight">{section.label}</h1>
          <p className="mt-1 text-sm text-muted">{section.description}</p>
        </div>
        <Link href={section.actionHref} className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white">
          {section.actionLabel}
        </Link>
      </div>
      {bookings.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line bg-white px-4 py-6 text-sm text-muted">
          {section.empty}{" "}
          <Link href={section.actionHref} className="text-brand">
            {section.actionLabel}
          </Link>
        </p>
      ) : (
        <BookingList bookings={bookings} showModule={false} />
      )}
    </div>
  );
}
