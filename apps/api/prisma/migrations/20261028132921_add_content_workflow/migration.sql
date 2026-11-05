/*
  Warnings:

  - Added the required column `createdById` to the `VocabularyItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED', 'REJECTED');

-- AlterTable
ALTER TABLE "VocabularyItem" ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "ContentReview" (
    "id" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentReview_vocabularyId_idx" ON "ContentReview"("vocabularyId");

-- CreateIndex
CREATE INDEX "ContentReview_reviewerId_idx" ON "ContentReview"("reviewerId");

-- CreateIndex
CREATE INDEX "VocabularyItem_lessonId_idx" ON "VocabularyItem"("lessonId");

-- CreateIndex
CREATE INDEX "VocabularyItem_createdById_idx" ON "VocabularyItem"("createdById");

-- CreateIndex
CREATE INDEX "VocabularyItem_status_idx" ON "VocabularyItem"("status");

-- AddForeignKey
ALTER TABLE "VocabularyItem" ADD CONSTRAINT "VocabularyItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "VocabularyItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
