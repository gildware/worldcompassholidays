import { redirect } from "next/navigation";
import { customerReturnPath } from "@/lib/forms";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const returnPath = customerReturnPath(next);
  redirect(returnPath === "/account" ? "/login" : `/login?next=${encodeURIComponent(returnPath)}`);
}
