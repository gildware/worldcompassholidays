-- Hotels follow the tour listing shape, with a room row for each sellable room type.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Hotel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "propertyType" TEXT NOT NULL DEFAULT 'hotel',
    "starRating" INTEGER NOT NULL DEFAULT 0,
    "checkIn" TEXT NOT NULL DEFAULT '14:00',
    "checkOut" TEXT NOT NULL DEFAULT '11:00',
    "priceFrom" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "imageKey" TEXT NOT NULL DEFAULT '',
    "imageDriver" TEXT NOT NULL DEFAULT 'local',
    "featuredImageUrl" TEXT NOT NULL DEFAULT '',
    "featuredImageKey" TEXT NOT NULL DEFAULT '',
    "featuredImageDriver" TEXT NOT NULL DEFAULT 'local',
    "galleryJson" TEXT NOT NULL DEFAULT '[]',
    "amenitiesJson" TEXT NOT NULL DEFAULT '[]',
    "faqsJson" TEXT NOT NULL DEFAULT '[]',
    "cancellationPolicy" TEXT NOT NULL DEFAULT '',
    "houseRules" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "mapLat" TEXT NOT NULL DEFAULT '',
    "mapLng" TEXT NOT NULL DEFAULT '',
    "mapZoom" INTEGER NOT NULL DEFAULT 14,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "seoIndex" BOOLEAN NOT NULL DEFAULT true,
    "seoTitle" TEXT NOT NULL DEFAULT '',
    "seoDescription" TEXT NOT NULL DEFAULT '',
    "seoImageUrl" TEXT NOT NULL DEFAULT '',
    "seoImageKey" TEXT NOT NULL DEFAULT '',
    "seoImageDriver" TEXT NOT NULL DEFAULT 'local',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "destinationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Hotel_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_Hotel" (
    "id", "slug", "name", "summary", "address", "priceFrom", "currency",
    "published", "destinationId", "createdAt", "updatedAt"
)
SELECT
    "id", "slug", "name", "summary", "address", "priceFrom", "currency",
    "published", "destinationId", "createdAt", "updatedAt"
FROM "Hotel";

CREATE TABLE "new_Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hotelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "occupancy" INTEGER NOT NULL DEFAULT 2,
    "bedType" TEXT NOT NULL DEFAULT '',
    "sizeSqm" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "pricePerNight" INTEGER NOT NULL DEFAULT 0,
    "extraGuestPrice" INTEGER NOT NULL DEFAULT 0,
    "mealPlan" TEXT NOT NULL DEFAULT 'room_only',
    "featuresJson" TEXT NOT NULL DEFAULT '[]',
    "amenitiesJson" TEXT NOT NULL DEFAULT '[]',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "imageKey" TEXT NOT NULL DEFAULT '',
    "imageDriver" TEXT NOT NULL DEFAULT 'local',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Room_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Room" ("id", "hotelId", "name", "occupancy", "pricePerNight")
SELECT "id", "hotelId", "name", "occupancy", "pricePerNight" FROM "Room";

DROP TABLE "Room";
DROP TABLE "Hotel";
ALTER TABLE "new_Hotel" RENAME TO "Hotel";
ALTER TABLE "new_Room" RENAME TO "Room";

CREATE UNIQUE INDEX "Hotel_slug_key" ON "Hotel"("slug");
CREATE INDEX "Hotel_destinationId_idx" ON "Hotel"("destinationId");
CREATE INDEX "Room_hotelId_idx" ON "Room"("hotelId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_hotel_amenity_wifi', 'hotel_amenity', 'Free Wi-Fi', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'hotel_amenity' AND "title" = 'Free Wi-Fi');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_hotel_amenity_parking', 'hotel_amenity', 'Parking', 1
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'hotel_amenity' AND "title" = 'Parking');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_hotel_amenity_restaurant', 'hotel_amenity', 'Restaurant', 2
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'hotel_amenity' AND "title" = 'Restaurant');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_hotel_amenity_pool', 'hotel_amenity', 'Swimming pool', 3
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'hotel_amenity' AND "title" = 'Swimming pool');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_hotel_amenity_gym', 'hotel_amenity', 'Gym', 4
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'hotel_amenity' AND "title" = 'Gym');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_hotel_amenity_transfer', 'hotel_amenity', 'Airport transfer', 5
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'hotel_amenity' AND "title" = 'Airport transfer');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_hotel_amenity_desk', 'hotel_amenity', '24-hour front desk', 6
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'hotel_amenity' AND "title" = '24-hour front desk');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_hotel_amenity_spa', 'hotel_amenity', 'Spa', 7
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'hotel_amenity' AND "title" = 'Spa');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_hotel_amenity_service', 'hotel_amenity', 'Room service', 8
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'hotel_amenity' AND "title" = 'Room service');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_hotel_amenity_laundry', 'hotel_amenity', 'Laundry', 9
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'hotel_amenity' AND "title" = 'Laundry');

INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_room_feature_city', 'room_feature', 'City view', 0
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'room_feature' AND "title" = 'City view');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_room_feature_sea', 'room_feature', 'Sea view', 1
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'room_feature' AND "title" = 'Sea view');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_room_feature_mountain', 'room_feature', 'Mountain view', 2
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'room_feature' AND "title" = 'Mountain view');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_room_feature_garden', 'room_feature', 'Garden view', 3
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'room_feature' AND "title" = 'Garden view');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_room_feature_balcony', 'room_feature', 'Balcony', 4
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'room_feature' AND "title" = 'Balcony');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_room_feature_bath', 'room_feature', 'Bathtub', 5
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'room_feature' AND "title" = 'Bathtub');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_room_feature_pool', 'room_feature', 'Private pool', 6
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'room_feature' AND "title" = 'Private pool');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_room_feature_connecting', 'room_feature', 'Connecting rooms', 7
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'room_feature' AND "title" = 'Connecting rooms');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_room_feature_kitchen', 'room_feature', 'Kitchenette', 8
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'room_feature' AND "title" = 'Kitchenette');

INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_room_amenity_ac', 'room_amenity', 'Air conditioning', 0
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'room_amenity' AND "title" = 'Air conditioning');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_room_amenity_wifi', 'room_amenity', 'Wi-Fi', 1
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'room_amenity' AND "title" = 'Wi-Fi');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_room_amenity_tv', 'room_amenity', 'Television', 2
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'room_amenity' AND "title" = 'Television');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_room_amenity_minibar', 'room_amenity', 'Mini bar', 3
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'room_amenity' AND "title" = 'Mini bar');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_room_amenity_safe', 'room_amenity', 'In-room safe', 4
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'room_amenity' AND "title" = 'In-room safe');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_room_amenity_dryer', 'room_amenity', 'Hair dryer', 5
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'room_amenity' AND "title" = 'Hair dryer');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_room_amenity_kettle', 'room_amenity', 'Kettle', 6
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'room_amenity' AND "title" = 'Kettle');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_room_amenity_desk', 'room_amenity', 'Work desk', 7
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'room_amenity' AND "title" = 'Work desk');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_room_amenity_iron', 'room_amenity', 'Iron', 8
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'room_amenity' AND "title" = 'Iron');
INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder", "createdAt", "updatedAt")
SELECT 'catalog_room_amenity_toiletries', 'room_amenity', 'Toiletries', 9
, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "CatalogItem" WHERE "kind" = 'room_amenity' AND "title" = 'Toiletries');
