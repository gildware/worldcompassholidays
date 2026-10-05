-- AlterTable
ALTER TABLE "ItineraryDay" ADD COLUMN "imageUrl" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ItineraryDay" ADD COLUMN "imageKey" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ItineraryDay" ADD COLUMN "imageDriver" TEXT NOT NULL DEFAULT 'local';
