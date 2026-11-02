-- AlterTable
ALTER TABLE "VocabularyItem" ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "versionGroupId" TEXT;

-- Give every existing vocabulary item its own version group.
UPDATE "VocabularyItem"
SET "versionGroupId" = gen_random_uuid()::text
WHERE "versionGroupId" IS NULL;

-- Enforce the required group ID after backfilling existing records.
ALTER TABLE "VocabularyItem"
ALTER COLUMN "versionGroupId" SET NOT NULL;

-- Prevent duplicate version numbers within the same group.
CREATE UNIQUE INDEX "VocabularyItem_versionGroupId_version_key"
ON "VocabularyItem"("versionGroupId", "version");

CREATE INDEX "VocabularyItem_versionGroupId_idx"
ON "VocabularyItem"("versionGroupId");
