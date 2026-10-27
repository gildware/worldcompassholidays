ALTER TABLE "CatalogItem" ADD COLUMN IF NOT EXISTS "mapLat" TEXT NOT NULL DEFAULT '';
ALTER TABLE "CatalogItem" ADD COLUMN IF NOT EXISTS "mapLng" TEXT NOT NULL DEFAULT '';
ALTER TABLE "CatalogItem" ADD COLUMN IF NOT EXISTS "mapZoom" INTEGER NOT NULL DEFAULT 14;

ALTER TABLE "BusRoute" ADD COLUMN IF NOT EXISTS "fromLocationId" TEXT;
ALTER TABLE "BusRoute" ADD COLUMN IF NOT EXISTS "toLocationId" TEXT;

CREATE INDEX IF NOT EXISTS "BusRoute_fromLocationId_idx" ON "BusRoute"("fromLocationId");
CREATE INDEX IF NOT EXISTS "BusRoute_toLocationId_idx" ON "BusRoute"("toLocationId");

DO $$ BEGIN
  ALTER TABLE "BusRoute"
    ADD CONSTRAINT "BusRoute_fromLocationId_fkey"
    FOREIGN KEY ("fromLocationId") REFERENCES "CatalogItem"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "BusRoute"
    ADD CONSTRAINT "BusRoute_toLocationId_fkey"
    FOREIGN KEY ("toLocationId") REFERENCES "CatalogItem"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
