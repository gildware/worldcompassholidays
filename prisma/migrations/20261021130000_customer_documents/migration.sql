-- CreateTable
CREATE TABLE "CustomerDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "typeName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL DEFAULT '',
    "fileDriver" TEXT NOT NULL DEFAULT 'local',
    "fileResource" TEXT NOT NULL DEFAULT 'image',
    "number" TEXT NOT NULL DEFAULT '',
    "issueDate" DATETIME,
    "expiryDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CustomerDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CustomerDocument_configId_fkey" FOREIGN KEY ("configId") REFERENCES "RentalConfig" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerDocument_userId_configId_key" ON "CustomerDocument"("userId", "configId");

-- CreateIndex
CREATE INDEX "CustomerDocument_userId_idx" ON "CustomerDocument"("userId");

-- CreateIndex
CREATE INDEX "CustomerDocument_configId_idx" ON "CustomerDocument"("configId");
