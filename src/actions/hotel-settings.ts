"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import type { FormState } from "@/lib/forms";

export async function saveHotelSettings(_previous: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("hotels.manage");
  const taxEnabled = formData.get("taxEnabled") === "on";
  await prisma.hotelSettings.upsert({
    where: { id: "default" },
    update: { taxEnabled },
    create: { id: "default", taxEnabled },
  });
  revalidatePath("/hotels");
  revalidatePath("/admin/hotels/configuration");
  return {
    error: null,
    success: taxEnabled
      ? "Tax is on. Stay totals include GST at 18%."
      : "Tax is off. Stay totals are the room price only.",
  };
}
