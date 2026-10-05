import { logout } from "@/actions/auth";

export function LogoutButton({
  to,
  className,
}: {
  to: "admin" | "site";
  className?: string;
}) {
  return (
    <form action={logout}>
      <input type="hidden" name="to" value={to} />
      <button type="submit" className={className}>
        Sign out
      </button>
    </form>
  );
}
