-- CreateEnum
CREATE TYPE "LandmarkType" AS ENUM ('Church', 'GreatChurch', 'Castle', 'Fort', 'Tunnel', 'MainEncampment', 'Ruins', 'SorcerersRise', 'OldSorcerersRise', 'Township', 'Evergaol', 'SiteOfGrace', 'SpectralHawkTree', 'Spiritstream', 'Scarab', 'TunnelEntrance', 'FieldBoss');

-- CreateEnum
CREATE TYPE "Nightlord" AS ENUM ('Gladius', 'Maris', 'Gnoster', 'Libra', 'Fulghor', 'Caligo', 'Adel', 'Heolstor');

-- CreateEnum
CREATE TYPE "BossCategory" AS ENUM ('Nightlord', 'Evergaol', 'Field', 'Night', 'Event', 'Remembrance', 'Other');

-- CreateEnum
CREATE TYPE "NightfarerClassType" AS ENUM ('Wylder', 'Guardian', 'Ironeye', 'Raider', 'Recluse', 'Executor', 'Duchess', 'Revenant');

-- CreateEnum
CREATE TYPE "ShiftingEarthEventType" AS ENUM ('Crater', 'Mountaintop', 'RottedWoods', 'Noklateo');

-- CreateEnum
CREATE TYPE "DamageType" AS ENUM ('Standard', 'Strike', 'Slash', 'Pierce', 'Fire', 'Lightning', 'Magic', 'Holy');

-- CreateEnum
CREATE TYPE "StatusEffect" AS ENUM ('BloodLoss', 'Frostbite', 'Poison', 'ScarletRot', 'Sleep', 'Madness', 'DeathBlight');

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Landmark" (
    "id" TEXT NOT NULL,
    "type" "LandmarkType" NOT NULL,
    "name" TEXT,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "icon" TEXT,
    "priority" INTEGER,
    "contents" TEXT[],
    "notes" TEXT,

    CONSTRAINT "Landmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "patternId" TEXT NOT NULL,
    "nightlord" "Nightlord" NOT NULL,
    "totalDistance" DOUBLE PRECISION NOT NULL,
    "estimatedTime" DOUBLE PRECISION NOT NULL,
    "priorities" JSONB NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteLandmark" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "landmarkId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "RouteLandmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Boss" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "BossCategory" NOT NULL,
    "description" TEXT,
    "expedition" TEXT,
    "phases" INTEGER,
    "weaknesses" "DamageType"[],
    "statusWeaknesses" "StatusEffect"[],
    "notes" TEXT,
    "landmarkId" TEXT,

    CONSTRAINT "Boss_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NightfarerClass" (
    "id" "NightfarerClassType" NOT NULL,
    "archetype" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "relicSlots" TEXT[],
    "startingGear" TEXT[],
    "abilities" JSONB NOT NULL,
    "notes" TEXT,

    CONSTRAINT "NightfarerClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftingEarthEvent" (
    "id" "ShiftingEarthEventType" NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "environmentalChanges" TEXT NOT NULL,
    "bosses" TEXT[],
    "uniqueReward" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "ShiftingEarthEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapPattern" (
    "id" TEXT NOT NULL,
    "nightlord" "Nightlord" NOT NULL,
    "patternIndex" INTEGER NOT NULL,
    "seed" INTEGER NOT NULL,
    "shiftingEarthEvents" "ShiftingEarthEventType"[],
    "circleSequence" JSONB NOT NULL,

    CONSTRAINT "MapPattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapPatternLandmark" (
    "id" TEXT NOT NULL,
    "mapPatternId" TEXT NOT NULL,
    "landmarkId" TEXT NOT NULL,
    "order" INTEGER,

    CONSTRAINT "MapPatternLandmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Post_name_idx" ON "Post"("name");

-- CreateIndex
CREATE INDEX "RouteLandmark_landmarkId_idx" ON "RouteLandmark"("landmarkId");

-- CreateIndex
CREATE UNIQUE INDEX "RouteLandmark_routeId_order_key" ON "RouteLandmark"("routeId", "order");

-- CreateIndex
CREATE INDEX "MapPatternLandmark_landmarkId_idx" ON "MapPatternLandmark"("landmarkId");

-- CreateIndex
CREATE UNIQUE INDEX "MapPatternLandmark_mapPatternId_landmarkId_key" ON "MapPatternLandmark"("mapPatternId", "landmarkId");

-- AddForeignKey
ALTER TABLE "RouteLandmark" ADD CONSTRAINT "RouteLandmark_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteLandmark" ADD CONSTRAINT "RouteLandmark_landmarkId_fkey" FOREIGN KEY ("landmarkId") REFERENCES "Landmark"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boss" ADD CONSTRAINT "Boss_landmarkId_fkey" FOREIGN KEY ("landmarkId") REFERENCES "Landmark"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapPatternLandmark" ADD CONSTRAINT "MapPatternLandmark_mapPatternId_fkey" FOREIGN KEY ("mapPatternId") REFERENCES "MapPattern"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapPatternLandmark" ADD CONSTRAINT "MapPatternLandmark_landmarkId_fkey" FOREIGN KEY ("landmarkId") REFERENCES "Landmark"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
