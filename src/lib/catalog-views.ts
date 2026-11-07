import { prisma } from "@/lib/db";

/** Fire-and-forget public detail view. Failures are logged only. */
export function recordCatalogView(kind: "tour" | "hotel", id: string) {
  if (!id) return;
  const task =
    kind === "tour"
      ? prisma.tour.update({
          where: { id },
          data: { viewCount: { increment: 1 } },
          select: { id: true },
        })
      : prisma.hotel.update({
          where: { id },
          data: { viewCount: { increment: 1 } },
          select: { id: true },
        });

  void task.catch((error) => {
    console.error("catalog view failed", kind, id, error);
  });
}
