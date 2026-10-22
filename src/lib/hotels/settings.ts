import { prisma } from "@/lib/db";

export async function getHotelSettings() {
  const row = await prisma.hotelSettings.findUnique({ where: { id: "default" } });
  return { taxEnabled: row?.taxEnabled ?? false };
}
