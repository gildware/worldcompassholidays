-- Optional translations for public records and interface lines.
CREATE TABLE "ContentTranslation" (
    "id" TEXT NOT NULL,
    "ownerType" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "field" TEXT NOT NULL DEFAULT 'copy',
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentTranslation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UiPhrase" (
    "key" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UiPhrase_pkey" PRIMARY KEY ("key","locale")
);

CREATE UNIQUE INDEX "ContentTranslation_ownerType_ownerId_locale_field_key" ON "ContentTranslation"("ownerType", "ownerId", "locale", "field");
CREATE INDEX "ContentTranslation_ownerType_locale_idx" ON "ContentTranslation"("ownerType", "locale");
