-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tour" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "durationDays" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "maxGroupSize" INTEGER NOT NULL,
    "priceFrom" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "imageUrl" TEXT NOT NULL,
    "imageKey" TEXT NOT NULL,
    "imageDriver" TEXT NOT NULL DEFAULT 'local',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "destinationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tour_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Tour" (
  "createdAt",
  "currency",
  "description",
  "destinationId",
  "difficulty",
  "durationDays",
  "id",
  "imageDriver",
  "imageKey",
  "imageUrl",
  "maxGroupSize",
  "priceFrom",
  "published",
  "slug",
  "summary",
  "title",
  "updatedAt"
)
SELECT
  "createdAt",
  "currency",
  "description",
  "destinationId",
  "difficulty",
  "durationDays",
  "id",
  'local',
  'tours/seed-placeholder.svg',
  '/uploads/tours/seed-kashmir-trek.svg',
  "maxGroupSize",
  "priceFrom",
  "published",
  "slug",
  "summary",
  "title",
  "updatedAt"
FROM "Tour";
DROP TABLE "Tour";
ALTER TABLE "new_Tour" RENAME TO "Tour";
CREATE UNIQUE INDEX "Tour_slug_key" ON "Tour"("slug");
CREATE INDEX "Tour_destinationId_idx" ON "Tour"("destinationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
