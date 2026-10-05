"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { firstIssue, type FormState } from "@/lib/forms";
import { getCurrentUser } from "@/lib/auth/session";
import { bookingReference } from "@/lib/bookings";
import { enquiryInterests } from "@/lib/navigation";
import { emailField, nameField, phoneField } from "@/lib/validation";

const enquirySchema = z.object({
  name: nameField,
  email: emailField,
  phone: phoneField,
  interest: z.string().trim(),
  message: z.string().trim().min(10, "Tell us a little more").max(2000),
});

export async function submitEnquiry(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  const customer = user?.scope === "customer" ? user : null;

  const parsed = enquirySchema.safeParse({
    name: customer?.name ?? formData.get("name"),
    email: customer?.email ?? formData.get("email"),
    phone: formData.get("phone") ?? customer?.phone ?? "",
    interest: formData.get("interest"),
    message: formData.get("message"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const allowed = new Set(enquiryInterests().map((item) => item.value));
  if (!allowed.has(parsed.data.interest)) {
    return { error: "Choose what you want to book" };
  }

  const booking = await prisma.booking.create({
    data: {
      reference: bookingReference(),
      module: parsed.data.interest,
      status: "enquiry",
      title: "Website enquiry",
      notes: parsed.data.message,
      details: JSON.stringify({ interest: parsed.data.interest }),
      contactName: parsed.data.name,
      contactEmail: parsed.data.email,
      contactPhone: parsed.data.phone,
      userId: customer?.id ?? null,
    },
  });

  revalidatePath("/admin/bookings");

  if (customer) {
    revalidatePath("/account");
    redirect(`/account/bookings/${booking.reference}?created=1`);
  }

  redirect("/contact?sent=1");
}
