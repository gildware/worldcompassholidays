-- Shared tour categories, travel styles, and facilities.
ALTER TABLE "Tour" ADD COLUMN "categoryId" TEXT NOT NULL DEFAULT '';

CREATE TABLE "CatalogItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "iconUrl" TEXT NOT NULL DEFAULT '',
    "iconKey" TEXT NOT NULL DEFAULT '',
    "iconDriver" TEXT NOT NULL DEFAULT 'local',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "CatalogItem_kind_title_key" ON "CatalogItem"("kind", "title");
CREATE INDEX "CatalogItem_kind_idx" ON "CatalogItem"("kind");

INSERT INTO "CatalogItem" ("id", "kind", "title", "sortOrder") VALUES
    ('catalog_category_city_trips', 'category', 'City trips', 0),
    ('catalog_category_ecotourism', 'category', 'Ecotourism', 1),
    ('catalog_category_escorted_tour', 'category', 'Escorted tour', 2),
    ('catalog_category_trekking', 'category', 'Trekking', 3),
    ('catalog_category_adventure', 'category', 'Adventure', 4),
    ('catalog_category_cultural', 'category', 'Cultural', 5),
    ('catalog_style_cultural', 'style', 'Cultural', 0),
    ('catalog_style_nature', 'style', 'Nature & Adventure', 1),
    ('catalog_style_marine', 'style', 'Marine', 2),
    ('catalog_style_independent', 'style', 'Independent', 3),
    ('catalog_style_activities', 'style', 'Activities', 4),
    ('catalog_style_festival', 'style', 'Festival & Events', 5),
    ('catalog_style_special', 'style', 'Special Interest', 6),
    ('catalog_facility_wifi', 'facility', 'Wifi', 0),
    ('catalog_facility_gym', 'facility', 'Gymnasium', 1),
    ('catalog_facility_bike', 'facility', 'Mountain Bike', 2),
    ('catalog_facility_office', 'facility', 'Satellite Office', 3),
    ('catalog_facility_lounge', 'facility', 'Staff Lounge', 4),
    ('catalog_facility_golf', 'facility', 'Golf Cages', 5),
    ('catalog_facility_aerobics', 'facility', 'Aerobics Room', 6);
