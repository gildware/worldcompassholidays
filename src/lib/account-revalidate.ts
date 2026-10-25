import { revalidatePath } from "next/cache";
import { accountSectionForModule } from "@/lib/account-sections";

export function revalidateCustomerBooking(module: string, reference?: string) {
  revalidatePath("/account");
  const section = accountSectionForModule(module);
  if (section) revalidatePath(section.href);
  revalidatePath("/account/enquiries");
  if (reference) {
    revalidatePath(`/account/bookings/${reference}`);
    revalidatePath(`/account/enquiries/${reference}`);
  }
}
