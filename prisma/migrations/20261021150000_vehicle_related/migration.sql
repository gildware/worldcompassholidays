-- CreateTable
CREATE TABLE "VehicleRelated" (
    "vehicleId" TEXT NOT NULL,
    "relatedId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("vehicleId", "relatedId"),
    CONSTRAINT "VehicleRelated_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VehicleRelated_relatedId_fkey" FOREIGN KEY ("relatedId") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "VehicleRelated_relatedId_idx" ON "VehicleRelated"("relatedId");
