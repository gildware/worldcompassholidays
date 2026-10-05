-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Destination" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageKey" TEXT NOT NULL,
    "imageDriver" TEXT NOT NULL DEFAULT 'local',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Destination" (
  "country",
  "createdAt",
  "id",
  "imageDriver",
  "imageKey",
  "imageUrl",
  "name",
  "published",
  "region",
  "slug",
  "summary",
  "updatedAt"
)
SELECT
  "country",
  "createdAt",
  "id",
  'local',
  'destinations/seed-' || "slug" || '.svg',
  '/uploads/destinations/seed-' || "slug" || '.svg',
  "name",
  "published",
  "region",
  "slug",
  "summary",
  "updatedAt"
FROM "Destination";
DROP TABLE "Destination";
ALTER TABLE "new_Destination" RENAME TO "Destination";
CREATE UNIQUE INDEX "Destination_slug_key" ON "Destination"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
