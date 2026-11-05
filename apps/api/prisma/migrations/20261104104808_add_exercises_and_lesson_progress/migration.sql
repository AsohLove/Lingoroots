-- CreateEnum
CREATE TYPE "ExerciseType" AS ENUM ('MULTIPLE_CHOICE', 'TEXT_INPUT');

-- CreateEnum
CREATE TYPE "LessonProgressStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "type" "ExerciseType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "explanation" TEXT,
    "order" INTEGER NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "versionGroupId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseOption" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseAnswer" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "normalizedValue" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseReview" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "selectedOptionId" TEXT,
    "submittedText" TEXT,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "status" "LessonProgressStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Exercise_lessonId_idx" ON "Exercise"("lessonId");

-- CreateIndex
CREATE INDEX "Exercise_createdById_idx" ON "Exercise"("createdById");

-- CreateIndex
CREATE INDEX "Exercise_status_idx" ON "Exercise"("status");

-- CreateIndex
CREATE INDEX "Exercise_versionGroupId_idx" ON "Exercise"("versionGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_versionGroupId_version_key" ON "Exercise"("versionGroupId", "version");

-- CreateIndex
CREATE INDEX "ExerciseOption_exerciseId_idx" ON "ExerciseOption"("exerciseId");

-- CreateIndex
CREATE INDEX "ExerciseAnswer_exerciseId_idx" ON "ExerciseAnswer"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseAnswer_exerciseId_normalizedValue_key" ON "ExerciseAnswer"("exerciseId", "normalizedValue");

-- CreateIndex
CREATE INDEX "ExerciseReview_exerciseId_idx" ON "ExerciseReview"("exerciseId");

-- CreateIndex
CREATE INDEX "ExerciseReview_reviewerId_idx" ON "ExerciseReview"("reviewerId");

-- CreateIndex
CREATE INDEX "ExerciseAttempt_userId_createdAt_idx" ON "ExerciseAttempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ExerciseAttempt_exerciseId_userId_idx" ON "ExerciseAttempt"("exerciseId", "userId");

-- CreateIndex
CREATE INDEX "LessonProgress_userId_status_idx" ON "LessonProgress"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_userId_lessonId_key" ON "LessonProgress"("userId", "lessonId");

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseOption" ADD CONSTRAINT "ExerciseOption_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseAnswer" ADD CONSTRAINT "ExerciseAnswer_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseReview" ADD CONSTRAINT "ExerciseReview_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseReview" ADD CONSTRAINT "ExerciseReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseAttempt" ADD CONSTRAINT "ExerciseAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseAttempt" ADD CONSTRAINT "ExerciseAttempt_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseAttempt" ADD CONSTRAINT "ExerciseAttempt_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "ExerciseOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
