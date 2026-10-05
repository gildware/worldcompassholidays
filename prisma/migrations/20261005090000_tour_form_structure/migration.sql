-- AlterTable
ALTER TABLE "Tour" ADD COLUMN "durationUnit" TEXT NOT NULL DEFAULT 'days';
ALTER TABLE "Tour" ADD COLUMN "discountsJson" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Tour" ADD COLUMN "destinationIdsJson" TEXT NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE "TourDestination" (
    "tourId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,

    CONSTRAINT "TourDestination_pkey" PRIMARY KEY ("tourId", "destinationId"),
    CONSTRAINT "TourDestination_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TourDestination_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TourDestination_destinationId_idx" ON "TourDestination"("destinationId");

-- Backfill existing primary destinations
UPDATE "Tour"
SET "destinationIdsJson" = '["' || "destinationId" || '"]'
WHERE "destinationId" IS NOT NULL AND "destinationIdsJson" = '[]';

INSERT INTO "TourDestination" ("tourId", "destinationId")
SELECT "id", "destinationId" FROM "Tour" WHERE "destinationId" IS NOT NULL;
