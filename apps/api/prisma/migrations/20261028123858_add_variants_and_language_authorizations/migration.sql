-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "variantId" TEXT;

-- CreateTable
CREATE TABLE "Variant" (
    "id" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LanguageAuthorization" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "variantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LanguageAuthorization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Variant_languageId_idx" ON "Variant"("languageId");

-- CreateIndex
CREATE INDEX "LanguageAuthorization_userId_idx" ON "LanguageAuthorization"("userId");

-- CreateIndex
CREATE INDEX "LanguageAuthorization_languageId_idx" ON "LanguageAuthorization"("languageId");

-- CreateIndex
CREATE INDEX "LanguageAuthorization_variantId_idx" ON "LanguageAuthorization"("variantId");

-- CreateIndex
CREATE INDEX "Course_languageId_idx" ON "Course"("languageId");

-- CreateIndex
CREATE INDEX "Course_variantId_idx" ON "Course"("variantId");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguageAuthorization" ADD CONSTRAINT "LanguageAuthorization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguageAuthorization" ADD CONSTRAINT "LanguageAuthorization_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguageAuthorization" ADD CONSTRAINT "LanguageAuthorization_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
