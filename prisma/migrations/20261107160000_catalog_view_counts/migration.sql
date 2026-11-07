-- AlterTable
ALTER TABLE "Tour" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Hotel" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Tour_viewCount_idx" ON "Tour"("viewCount");

-- CreateIndex
CREATE INDEX "Hotel_viewCount_idx" ON "Hotel"("viewCount");
