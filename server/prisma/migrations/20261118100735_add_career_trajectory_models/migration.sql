-- CreateTable
CREATE TABLE "CareerProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "currentTitle" TEXT,
    "experienceYears" DOUBLE PRECISION,
    "education" JSONB NOT NULL DEFAULT '[]',
    "skills" JSONB NOT NULL DEFAULT '[]',
    "projects" JSONB NOT NULL DEFAULT '[]',
    "experience" JSONB NOT NULL DEFAULT '[]',
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerTrajectory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "targetRole" TEXT NOT NULL,
    "targetTimeframe" TEXT NOT NULL,
    "currentLevel" TEXT NOT NULL,
    "readinessScore" INTEGER NOT NULL,
    "readinessBreakdown" JSONB NOT NULL,
    "skillGaps" JSONB NOT NULL,
    "progressionPaths" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerTrajectory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrajectoryMilestone" (
    "id" SERIAL NOT NULL,
    "trajectoryId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "phase" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "learningObjectives" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requiredSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "estimatedEffort" TEXT NOT NULL,
    "practicalProject" JSONB NOT NULL,
    "deliverables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "completionCriteria" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "userNotes" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrajectoryMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CareerProfile_userId_key" ON "CareerProfile"("userId");

-- CreateIndex
CREATE INDEX "CareerTrajectory_userId_idx" ON "CareerTrajectory"("userId");

-- CreateIndex
CREATE INDEX "TrajectoryMilestone_trajectoryId_idx" ON "TrajectoryMilestone"("trajectoryId");

-- AddForeignKey
ALTER TABLE "CareerProfile" ADD CONSTRAINT "CareerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerTrajectory" ADD CONSTRAINT "CareerTrajectory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrajectoryMilestone" ADD CONSTRAINT "TrajectoryMilestone_trajectoryId_fkey" FOREIGN KEY ("trajectoryId") REFERENCES "CareerTrajectory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
