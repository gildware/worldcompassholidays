import { prisma } from "@/lib/db";
import { cached } from "@/lib/ttl-cache";

export function getHotelSettings() {
  return cached("hotel-settings", 60_000, async () => {
    const row = await prisma.hotelSettings.findUnique({ where: { id: "default" } });
    return { taxEnabled: row?.taxEnabled ?? false };
  });
}
