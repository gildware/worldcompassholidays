-- AlterTable
ALTER TABLE "ItineraryDay" ADD COLUMN "morning" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ItineraryDay" ADD COLUMN "afternoon" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ItineraryDay" ADD COLUMN "evening" TEXT NOT NULL DEFAULT '';
