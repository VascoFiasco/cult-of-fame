-- CreateEnum
CREATE TYPE "MiniStatus" AS ENUM ('SHAME', 'WIP', 'FAME');

-- CreateEnum
CREATE TYPE "MiniStage" AS ENUM ('UNSTARTED', 'BASECOAT', 'WASH', 'HIGHLIGHT', 'DETAILS', 'FINISHED');

-- CreateTable
CREATE TABLE "Mini" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "system" TEXT,
    "status" "MiniStatus" NOT NULL DEFAULT 'SHAME',
    "stage" "MiniStage" NOT NULL DEFAULT 'UNSTARTED',
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "coverImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mini_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Mini_userId_idx" ON "Mini"("userId");

-- CreateIndex
CREATE INDEX "Mini_userId_status_idx" ON "Mini"("userId", "status");

-- CreateIndex
CREATE INDEX "Mini_userId_stage_idx" ON "Mini"("userId", "stage");

-- AddForeignKey
ALTER TABLE "Mini" ADD CONSTRAINT "Mini_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

