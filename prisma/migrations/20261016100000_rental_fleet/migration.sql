-- AlterTable
ALTER TABLE "RentalLocation" ADD COLUMN "fleet" TEXT NOT NULL DEFAULT 'car';

-- CreateIndex
CREATE INDEX "RentalLocation_fleet_idx" ON "RentalLocation"("fleet");

-- AlterTable
ALTER TABLE "RentalPolicy" ADD COLUMN "fleet" TEXT NOT NULL DEFAULT 'car';

-- DropIndex
DROP INDEX "RentalPolicy_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "RentalPolicy_fleet_slug_key" ON "RentalPolicy"("fleet", "slug");

-- CreateIndex
CREATE INDEX "RentalPolicy_fleet_idx" ON "RentalPolicy"("fleet");
