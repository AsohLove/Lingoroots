/*
  Warnings:

  - A unique constraint covering the columns `[applicationId]` on the table `LanguageAuthorization` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ContributorApplicationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ContributorApplicationDecision" AS ENUM ('APPROVED', 'CHANGES_REQUESTED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "LanguageAuthorization" DROP CONSTRAINT "LanguageAuthorization_languageId_fkey";

-- DropForeignKey
ALTER TABLE "LanguageAuthorization" DROP CONSTRAINT "LanguageAuthorization_variantId_fkey";

-- AlterTable
ALTER TABLE "LanguageAuthorization" ADD COLUMN     "applicationId" TEXT,
ADD COLUMN     "grantedById" TEXT,
ADD COLUMN     "revocationReason" TEXT,
ADD COLUMN     "revokedAt" TIMESTAMP(3),
ADD COLUMN     "revokedById" TEXT;

-- CreateTable
CREATE TABLE "ContributorApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "variantId" TEXT,
    "expertiseStatement" TEXT NOT NULL,
    "evidenceUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ContributorApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContributorApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContributorApplicationReview" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "decision" "ContributorApplicationDecision" NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContributorApplicationReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContributorApplication_userId_status_idx" ON "ContributorApplication"("userId", "status");

-- CreateIndex
CREATE INDEX "ContributorApplication_languageId_status_idx" ON "ContributorApplication"("languageId", "status");

-- CreateIndex
CREATE INDEX "ContributorApplication_status_submittedAt_idx" ON "ContributorApplication"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "ContributorApplicationReview_applicationId_createdAt_idx" ON "ContributorApplicationReview"("applicationId", "createdAt");

-- CreateIndex
CREATE INDEX "ContributorApplicationReview_reviewerId_idx" ON "ContributorApplicationReview"("reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "LanguageAuthorization_applicationId_key" ON "LanguageAuthorization"("applicationId");

-- CreateIndex
CREATE INDEX "LanguageAuthorization_userId_revokedAt_idx" ON "LanguageAuthorization"("userId", "revokedAt");

-- AddForeignKey
ALTER TABLE "LanguageAuthorization" ADD CONSTRAINT "LanguageAuthorization_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguageAuthorization" ADD CONSTRAINT "LanguageAuthorization_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguageAuthorization" ADD CONSTRAINT "LanguageAuthorization_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguageAuthorization" ADD CONSTRAINT "LanguageAuthorization_revokedById_fkey" FOREIGN KEY ("revokedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguageAuthorization" ADD CONSTRAINT "LanguageAuthorization_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ContributorApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributorApplication" ADD CONSTRAINT "ContributorApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributorApplication" ADD CONSTRAINT "ContributorApplication_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributorApplication" ADD CONSTRAINT "ContributorApplication_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributorApplicationReview" ADD CONSTRAINT "ContributorApplicationReview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "ContributorApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributorApplicationReview" ADD CONSTRAINT "ContributorApplicationReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

