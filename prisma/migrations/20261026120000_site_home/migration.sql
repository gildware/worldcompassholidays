-- CreateTable
CREATE TABLE "SiteHome" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "contentJson" TEXT NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteHome_pkey" PRIMARY KEY ("id")
);
