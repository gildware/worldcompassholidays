import { prisma } from "@/lib/db";
import { ensureRentalDefaults } from "@/lib/rentals/defaults";

export async function getRentalSetup() {
  await ensureRentalDefaults();
  const [settings, configs, locations, policies, destinations] = await Promise.all([
    prisma.rentalSettings.findUniqueOrThrow({ where: { id: "default" } }),
    prisma.rentalConfig.findMany({ orderBy: [{ kind: "asc" }, { sortOrder: "asc" }, { name: "asc" }] }),
    prisma.rentalLocation.findMany({
      orderBy: { name: "asc" },
      include: { destination: { select: { id: true, name: true } } },
    }),
    prisma.rentalPolicy.findMany({ orderBy: [{ kind: "asc" }, { sortOrder: "asc" }] }),
    prisma.destination.findMany({
      where: { published: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return { settings, configs, locations, policies, destinations };
}

export function configsOf<T extends { kind: string; active?: boolean }>(
  configs: T[],
  kind: string,
  activeOnly = false,
) {
  return configs.filter((item) => item.kind === kind && (!activeOnly || item.active !== false));
}
