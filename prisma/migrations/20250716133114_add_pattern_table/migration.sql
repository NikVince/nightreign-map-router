-- AlterEnum
ALTER TYPE "BossCategory" ADD VALUE 'Arena';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LandmarkType" ADD VALUE 'ArenaBoss';
ALTER TYPE "LandmarkType" ADD VALUE 'RottedWoods';
ALTER TYPE "LandmarkType" ADD VALUE 'RotBlessing';

-- AlterTable
ALTER TABLE "MapPattern" ADD COLUMN     "specialEvents" TEXT[];

-- CreateTable
CREATE TABLE "Pattern" (
    "id" TEXT NOT NULL,
    "seed" TEXT NOT NULL,
    "nightlord" TEXT NOT NULL,
    "patternIndex" INTEGER NOT NULL,
    "pois" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pattern_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pattern_seed_key" ON "Pattern"("seed");
