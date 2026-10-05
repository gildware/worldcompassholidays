-- AlterTable
ALTER TABLE "Destination" ADD COLUMN "mapLat" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Destination" ADD COLUMN "mapLng" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Destination" ADD COLUMN "mapZoom" INTEGER NOT NULL DEFAULT 8;

-- Seeded places get a pin so existing maps are not blank.
UPDATE "Destination" SET "mapLat" = '32.7266', "mapLng" = '74.8570', "mapZoom" = 11 WHERE "slug" = 'jammu' AND "mapLat" = '';
UPDATE "Destination" SET "mapLat" = '34.0837', "mapLng" = '74.7973', "mapZoom" = 9 WHERE "slug" = 'kashmir' AND "mapLat" = '';
UPDATE "Destination" SET "mapLat" = '34.1526', "mapLng" = '77.5771', "mapZoom" = 8 WHERE "slug" = 'ladakh' AND "mapLat" = '';
UPDATE "Destination" SET "mapLat" = '31.1048', "mapLng" = '77.1734', "mapZoom" = 8 WHERE "slug" = 'himachal' AND "mapLat" = '';
UPDATE "Destination" SET "mapLat" = '15.2993', "mapLng" = '74.1240', "mapZoom" = 9 WHERE "slug" = 'goa' AND "mapLat" = '';
UPDATE "Destination" SET "mapLat" = '9.9312', "mapLng" = '76.2673', "mapZoom" = 8 WHERE "slug" = 'kerala' AND "mapLat" = '';
UPDATE "Destination" SET "mapLat" = '13.7563', "mapLng" = '100.5018', "mapZoom" = 6 WHERE "slug" = 'thailand' AND "mapLat" = '';
UPDATE "Destination" SET "mapLat" = '21.0278', "mapLng" = '105.8342', "mapZoom" = 6 WHERE "slug" = 'vietnam' AND "mapLat" = '';
UPDATE "Destination" SET "mapLat" = '34.0161', "mapLng" = '75.3150', "mapZoom" = 12 WHERE "slug" = 'pahalgam' AND "mapLat" = '';
UPDATE "Destination" SET "mapLat" = '34.0484', "mapLng" = '74.3805', "mapZoom" = 12 WHERE "slug" = 'gulmarg' AND "mapLat" = '';
