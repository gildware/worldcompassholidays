-- CreateTable
CREATE TABLE "SiteBrand" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "logoUrl" TEXT NOT NULL DEFAULT '',
    "logoKey" TEXT NOT NULL DEFAULT '',
    "logoDriver" TEXT NOT NULL DEFAULT 'local',
    "coversJson" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" DATETIME NOT NULL
);
