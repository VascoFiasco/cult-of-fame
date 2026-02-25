-- AlterTable
ALTER TABLE "RitualSession" ADD COLUMN     "delta" JSONB,
ADD COLUMN     "durationMinutes" INTEGER,
ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "targetMiniId" TEXT;

-- CreateIndex
CREATE INDEX "RitualSession_targetMiniId_idx" ON "RitualSession"("targetMiniId");

-- CreateIndex
CREATE INDEX "RitualSession_startedAt_idx" ON "RitualSession"("startedAt");

-- CreateIndex
CREATE INDEX "RitualSession_endedAt_idx" ON "RitualSession"("endedAt");

-- AddForeignKey
ALTER TABLE "RitualSession" ADD CONSTRAINT "RitualSession_targetMiniId_fkey" FOREIGN KEY ("targetMiniId") REFERENCES "Mini"("id") ON DELETE SET NULL ON UPDATE CASCADE;

