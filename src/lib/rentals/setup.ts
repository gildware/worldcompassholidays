import { prisma } from "@/lib/db";
import { ensureRentalDefaults } from "@/lib/rentals/defaults";

export async function getRentalSetup(fleet?: "car" | "bike") {
  await ensureRentalDefaults();
  const [scopedSettings, fallbackSettings, configs, locations, policies, destinations] = await Promise.all([
    prisma.rentalSettings.findUnique({ where: { id: fleet ?? "default" } }),
    fleet ? prisma.rentalSettings.findUnique({ where: { id: "default" } }) : Promise.resolve(null),
    prisma.rentalConfig.findMany({ orderBy: [{ kind: "asc" }, { sortOrder: "asc" }, { name: "asc" }] }),
    prisma.rentalLocation.findMany({
      where: fleet ? { fleet } : undefined,
      orderBy: { name: "asc" },
      include: { destination: { select: { id: true, name: true } } },
    }),
    prisma.rentalPolicy.findMany({
      where: fleet ? { fleet } : undefined,
      orderBy: [{ kind: "asc" }, { sortOrder: "asc" }],
    }),
    prisma.destination.findMany({
      where: { published: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  const settings = scopedSettings ?? fallbackSettings;
  if (!settings) throw new Error("Rental settings are missing.");

  return { settings, configs, locations, policies, destinations };
}

export function configsOf<T extends { kind: string; active?: boolean }>(
  configs: T[],
  kind: string,
  activeOnly = false,
) {
  return configs.filter((item) => item.kind === kind && (!activeOnly || item.active !== false));
}
