-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN "registrationNumber" TEXT NOT NULL DEFAULT '';

-- Existing rows need a unique value before the index is created.
UPDATE "Vehicle" SET "registrationNumber" = 'REG' || substr("id", 1, 10) WHERE "registrationNumber" = '';

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_registrationNumber_key" ON "Vehicle"("registrationNumber");
