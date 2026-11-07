-- CreateTable
CREATE TABLE "SearchEvent" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "queryNorm" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "results" INTEGER NOT NULL DEFAULT 0,
    "filtersJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SearchEvent_queryNorm_createdAt_idx" ON "SearchEvent"("queryNorm", "createdAt");

-- CreateIndex
CREATE INDEX "SearchEvent_source_createdAt_idx" ON "SearchEvent"("source", "createdAt");

-- CreateIndex
CREATE INDEX "SearchEvent_createdAt_idx" ON "SearchEvent"("createdAt");
