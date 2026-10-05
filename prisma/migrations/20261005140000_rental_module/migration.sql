-- CreateTable
CREATE TABLE "RentalConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "appliesTo" TEXT NOT NULL DEFAULT 'all',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "price" INTEGER NOT NULL DEFAULT 0,
    "priceUnit" TEXT NOT NULL DEFAULT 'flat',
    "requiresNumber" BOOLEAN NOT NULL DEFAULT false,
    "requiresIssueDate" BOOLEAN NOT NULL DEFAULT false,
    "requiresExpiry" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RentalSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "allowCounterPickup" BOOLEAN NOT NULL DEFAULT true,
    "allowHomeDelivery" BOOLEAN NOT NULL DEFAULT true,
    "taxPercent" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RentalLocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "destinationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RentalLocation_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RentalPolicy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "hoursBeforePickup" INTEGER,
    "refundPercent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VehicleImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT '',
    "driver" TEXT NOT NULL DEFAULT 'local',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "VehicleImage_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VehicleFeature" (
    "vehicleId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,

    PRIMARY KEY ("vehicleId", "configId"),
    CONSTRAINT "VehicleFeature_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VehicleFeature_configId_fkey" FOREIGN KEY ("configId") REFERENCES "RentalConfig" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VehicleAddon" (
    "vehicleId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,

    PRIMARY KEY ("vehicleId", "configId"),
    CONSTRAINT "VehicleAddon_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VehicleAddon_configId_fkey" FOREIGN KEY ("configId") REFERENCES "RentalConfig" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VehicleLocation" (
    "vehicleId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,

    PRIMARY KEY ("vehicleId", "locationId"),
    CONSTRAINT "VehicleLocation_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VehicleLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "RentalLocation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VehicleDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "configId" TEXT,
    "typeName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL DEFAULT '',
    "fileKey" TEXT NOT NULL DEFAULT '',
    "fileDriver" TEXT NOT NULL DEFAULT 'local',
    "fileResource" TEXT NOT NULL DEFAULT 'image',
    "number" TEXT NOT NULL DEFAULT '',
    "issueDate" DATETIME,
    "expiryDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VehicleDocument_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VehicleDocument_configId_fkey" FOREIGN KEY ("configId") REFERENCES "RentalConfig" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaintenanceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "cost" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MaintenanceRecord_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VehicleBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME NOT NULL,
    "reason" TEXT NOT NULL DEFAULT '',
    "maintenanceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VehicleBlock_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VehicleBlock_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "MaintenanceRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RentalBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "pickupAt" DATETIME NOT NULL,
    "returnAt" DATETIME NOT NULL,
    "pickupMode" TEXT NOT NULL,
    "returnMode" TEXT NOT NULL,
    "pickupLocationId" TEXT,
    "returnLocationId" TEXT,
    "deliveryAddress" TEXT NOT NULL DEFAULT '',
    "returnAddress" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "rentalDays" INTEGER NOT NULL,
    "baseAmount" INTEGER NOT NULL,
    "addonsAmount" INTEGER NOT NULL,
    "discountAmount" INTEGER NOT NULL,
    "taxAmount" INTEGER NOT NULL,
    "securityDeposit" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "amountDue" INTEGER NOT NULL,
    "pricingSnapshot" TEXT NOT NULL DEFAULT '{}',
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "cancellationReason" TEXT NOT NULL DEFAULT '',
    "rejectionReason" TEXT NOT NULL DEFAULT '',
    "cancelledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RentalBooking_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RentalBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RentalBooking_pickupLocationId_fkey" FOREIGN KEY ("pickupLocationId") REFERENCES "RentalLocation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RentalBooking_returnLocationId_fkey" FOREIGN KEY ("returnLocationId") REFERENCES "RentalLocation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RentalBookingDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "configId" TEXT,
    "typeName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL DEFAULT '',
    "fileKey" TEXT NOT NULL DEFAULT '',
    "fileDriver" TEXT NOT NULL DEFAULT 'local',
    "fileResource" TEXT NOT NULL DEFAULT 'image',
    "number" TEXT NOT NULL DEFAULT '',
    "issueDate" DATETIME,
    "expiryDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT NOT NULL DEFAULT '',
    "verifiedAt" DATETIME,
    "verifiedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RentalBookingDocument_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RentalBookingDocument_configId_fkey" FOREIGN KEY ("configId") REFERENCES "RentalConfig" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RentalBookingAddon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "configId" TEXT,
    "name" TEXT NOT NULL,
    "priceUnit" TEXT NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "amount" INTEGER NOT NULL,
    CONSTRAINT "RentalBookingAddon_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RentalBookingAddon_configId_fkey" FOREIGN KEY ("configId") REFERENCES "RentalConfig" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RentalPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unpaid',
    "amount" INTEGER NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'pending_gateway',
    "gatewayRef" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "recordedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RentalPayment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RentalBookingEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RentalBookingEvent_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "RentalBooking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CatalogItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "iconUrl" TEXT NOT NULL DEFAULT '',
    "iconKey" TEXT NOT NULL DEFAULT '',
    "iconDriver" TEXT NOT NULL DEFAULT 'local',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CatalogItem" ("content", "createdAt", "iconDriver", "iconKey", "iconUrl", "id", "kind", "sortOrder", "title", "updatedAt") SELECT "content", "createdAt", "iconDriver", "iconKey", "iconUrl", "id", "kind", "sortOrder", "title", "updatedAt" FROM "CatalogItem";
DROP TABLE "CatalogItem";
ALTER TABLE "new_CatalogItem" RENAME TO "CatalogItem";
CREATE INDEX "CatalogItem_kind_idx" ON "CatalogItem"("kind");
CREATE UNIQUE INDEX "CatalogItem_kind_title_key" ON "CatalogItem"("kind", "title");
CREATE TABLE "new_Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "brand" TEXT NOT NULL DEFAULT '',
    "modelName" TEXT NOT NULL DEFAULT '',
    "year" INTEGER,
    "seats" INTEGER NOT NULL,
    "doors" INTEGER,
    "luggage" INTEGER,
    "includedKmPerDay" INTEGER NOT NULL DEFAULT 0,
    "pricePerDay" INTEGER NOT NULL,
    "pricePerWeek" INTEGER NOT NULL DEFAULT 0,
    "pricePerMonth" INTEGER NOT NULL DEFAULT 0,
    "securityDeposit" INTEGER NOT NULL DEFAULT 0,
    "extraKmCharge" INTEGER NOT NULL DEFAULT 0,
    "lateReturnCharge" INTEGER NOT NULL DEFAULT 0,
    "discountType" TEXT NOT NULL DEFAULT 'none',
    "discountValue" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'available',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "allowCounterPickup" BOOLEAN NOT NULL DEFAULT true,
    "allowHomeDelivery" BOOLEAN NOT NULL DEFAULT false,
    "destinationId" TEXT NOT NULL,
    "vehicleTypeId" TEXT,
    "fuelTypeId" TEXT,
    "transmissionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Vehicle_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vehicle_vehicleTypeId_fkey" FOREIGN KEY ("vehicleTypeId") REFERENCES "RentalConfig" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Vehicle_fuelTypeId_fkey" FOREIGN KEY ("fuelTypeId") REFERENCES "RentalConfig" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Vehicle_transmissionId_fkey" FOREIGN KEY ("transmissionId") REFERENCES "RentalConfig" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Vehicle" ("createdAt", "currency", "destinationId", "id", "kind", "name", "pricePerDay", "published", "seats", "slug", "summary", "updatedAt") SELECT "createdAt", "currency", "destinationId", "id", "kind", "name", "pricePerDay", "published", "seats", "slug", "summary", "updatedAt" FROM "Vehicle";
DROP TABLE "Vehicle";
ALTER TABLE "new_Vehicle" RENAME TO "Vehicle";
CREATE UNIQUE INDEX "Vehicle_slug_key" ON "Vehicle"("slug");
CREATE INDEX "Vehicle_destinationId_kind_idx" ON "Vehicle"("destinationId", "kind");
CREATE INDEX "Vehicle_kind_published_status_idx" ON "Vehicle"("kind", "published", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "RentalConfig_kind_active_idx" ON "RentalConfig"("kind", "active");

-- CreateIndex
CREATE UNIQUE INDEX "RentalConfig_kind_slug_key" ON "RentalConfig"("kind", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "RentalLocation_slug_key" ON "RentalLocation"("slug");

-- CreateIndex
CREATE INDEX "RentalLocation_destinationId_idx" ON "RentalLocation"("destinationId");

-- CreateIndex
CREATE UNIQUE INDEX "RentalPolicy_slug_key" ON "RentalPolicy"("slug");

-- CreateIndex
CREATE INDEX "RentalPolicy_kind_active_idx" ON "RentalPolicy"("kind", "active");

-- CreateIndex
CREATE INDEX "VehicleImage_vehicleId_idx" ON "VehicleImage"("vehicleId");

-- CreateIndex
CREATE INDEX "VehicleFeature_configId_idx" ON "VehicleFeature"("configId");

-- CreateIndex
CREATE INDEX "VehicleAddon_configId_idx" ON "VehicleAddon"("configId");

-- CreateIndex
CREATE INDEX "VehicleLocation_locationId_idx" ON "VehicleLocation"("locationId");

-- CreateIndex
CREATE INDEX "VehicleDocument_vehicleId_idx" ON "VehicleDocument"("vehicleId");

-- CreateIndex
CREATE INDEX "VehicleDocument_expiryDate_idx" ON "VehicleDocument"("expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleBlock_maintenanceId_key" ON "VehicleBlock"("maintenanceId");

-- CreateIndex
CREATE INDEX "VehicleBlock_vehicleId_startAt_endAt_idx" ON "VehicleBlock"("vehicleId", "startAt", "endAt");

-- CreateIndex
CREATE INDEX "MaintenanceRecord_vehicleId_idx" ON "MaintenanceRecord"("vehicleId");

-- CreateIndex
CREATE INDEX "MaintenanceRecord_status_idx" ON "MaintenanceRecord"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RentalBooking_reference_key" ON "RentalBooking"("reference");

-- CreateIndex
CREATE INDEX "RentalBooking_vehicleId_status_idx" ON "RentalBooking"("vehicleId", "status");

-- CreateIndex
CREATE INDEX "RentalBooking_userId_idx" ON "RentalBooking"("userId");

-- CreateIndex
CREATE INDEX "RentalBooking_status_idx" ON "RentalBooking"("status");

-- CreateIndex
CREATE INDEX "RentalBooking_pickupAt_idx" ON "RentalBooking"("pickupAt");

-- CreateIndex
CREATE INDEX "RentalBookingDocument_bookingId_idx" ON "RentalBookingDocument"("bookingId");

-- CreateIndex
CREATE INDEX "RentalBookingDocument_status_idx" ON "RentalBookingDocument"("status");

-- CreateIndex
CREATE INDEX "RentalBookingAddon_bookingId_idx" ON "RentalBookingAddon"("bookingId");

-- CreateIndex
CREATE INDEX "RentalPayment_bookingId_idx" ON "RentalPayment"("bookingId");

-- CreateIndex
CREATE INDEX "RentalPayment_status_idx" ON "RentalPayment"("status");

-- CreateIndex
CREATE INDEX "RentalBookingEvent_bookingId_idx" ON "RentalBookingEvent"("bookingId");

