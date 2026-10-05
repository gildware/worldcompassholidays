import { requirePermission } from "@/lib/auth/guards";

export default async function RentalsAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("vehicles.view");

  return <div className="flex min-h-0 flex-1 flex-col">{children}</div>;
}
