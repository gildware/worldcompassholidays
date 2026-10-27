CREATE TABLE "Bus" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "operator" TEXT NOT NULL DEFAULT '',
    "coachType" TEXT NOT NULL DEFAULT 'seater',
    "summary" TEXT NOT NULL DEFAULT '',
    "about" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "imageKey" TEXT NOT NULL DEFAULT '',
    "imageDriver" TEXT NOT NULL DEFAULT 'local',
    "galleryJson" TEXT NOT NULL DEFAULT '[]',
    "amenitiesJson" TEXT NOT NULL DEFAULT '[]',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bus_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Bus_slug_key" ON "Bus"("slug");

ALTER TABLE "BusRoute" ADD COLUMN "busId" TEXT;

CREATE INDEX "BusRoute_busId_idx" ON "BusRoute"("busId");

DO $$ BEGIN
  ALTER TABLE "BusRoute" ADD CONSTRAINT "BusRoute_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
