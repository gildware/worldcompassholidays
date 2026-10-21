-- CreateTable
CREATE TABLE "VehicleDestination" (
    "vehicleId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,

    PRIMARY KEY ("vehicleId", "destinationId"),
    CONSTRAINT "VehicleDestination_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VehicleDestination_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "VehicleDestination_destinationId_idx" ON "VehicleDestination"("destinationId");

-- Existing vehicles stay available in their home destination.
INSERT INTO "VehicleDestination" ("vehicleId", "destinationId")
SELECT "id", "destinationId" FROM "Vehicle";
