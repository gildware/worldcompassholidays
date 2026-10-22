-- CreateTable
CREATE TABLE "HotelSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "taxEnabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);
