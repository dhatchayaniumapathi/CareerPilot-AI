-- CreateTable
CREATE TABLE "ResumeAnalysis" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "originalResumeText" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "matchScore" INTEGER NOT NULL,
    "scoreBreakdown" JSONB NOT NULL,
    "matchingSkills" TEXT[],
    "missingSkills" TEXT[],
    "keyStrengths" TEXT[],
    "tailoringSuggestions" JSONB NOT NULL,
    "tailoredSummary" TEXT NOT NULL,
    "tailoredBulletPoints" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResumeAnalysis_userId_idx" ON "ResumeAnalysis"("userId");

-- AddForeignKey
ALTER TABLE "ResumeAnalysis" ADD CONSTRAINT "ResumeAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
