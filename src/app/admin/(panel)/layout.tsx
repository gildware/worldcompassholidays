import { AdminShell } from "@/components/admin/AdminShell";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { requireStaff } from "@/lib/auth/guards";
import { can } from "@/lib/auth/session";
import { getAdminNav } from "@/lib/navigation";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireStaff();

  return (
    <AdminShell
      items={getAdminNav((permission) => can(user, permission))}
      user={{ name: user.name, roleName: user.roleName }}
      signOut={<LogoutButton to="admin" />}
    >
      {children}
    </AdminShell>
  );
}
