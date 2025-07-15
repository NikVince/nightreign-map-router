import { PrismaClient, LandmarkType, Nightlord, BossCategory, ShiftingEarthEventType, DamageType, StatusEffect } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

const CSV_PATH = path.join(__dirname, '../reference_material/Elden Ring Nightreign map patterns - Patterns.csv');

// Helper: Map CSV column names to LandmarkType
const landmarkTypeMap: Record<string, LandmarkType> = {
  'Church': LandmarkType.Church,
  'Great Church': LandmarkType.GreatChurch,
  'Castle': LandmarkType.Castle,
  'Fort': LandmarkType.Fort,
  'Tunnel': LandmarkType.Tunnel,
  'Main Encampment': LandmarkType.MainEncampment,
  'Ruins': LandmarkType.Ruins,
  "Sorcerer's Rise": LandmarkType.SorcerersRise,
  'Old Sorcerer\'s Rise': LandmarkType.OldSorcerersRise,
  'Township': LandmarkType.Township,
  'Evergaol': LandmarkType.Evergaol,
  'Arena Boss': LandmarkType.ArenaBoss,
  'Field Boss': LandmarkType.FieldBoss,
  'Rotted Woods': LandmarkType.RottedWoods,
  'Rot Blessing': LandmarkType.RotBlessing,
  // Add more as needed
};

async function main() {
  // 1. Parse the CSV
  const csvRaw = fs.readFileSync(CSV_PATH, 'utf-8');
  const records = parse(csvRaw, { skip_empty_lines: true });

  // 2. Extract headers
  const headerRow = records[0];
  const subHeaderRow = records[1];
  const dataRows = records.slice(2);

  if (!headerRow) {
    throw new Error('CSV header row is missing or malformed.');
  }
  // 3. For each pattern (row), create MapPattern, Landmarks, Bosses, and links
  for (const row of dataRows) {
    const [patternIndexRaw, nightlordRaw, shiftingEarth, spawnPoint, specialEvent, night1Boss, night2Boss, extraNightBoss, night1Circle, night2Circle, ...poiCells] = row;
    const patternIndex = patternIndexRaw ? patternIndexRaw.toString() : '0';
    const nightlord = nightlordRaw ? nightlordRaw.toString() : 'Gladius';
    const patternId = `${nightlord}-${patternIndex}`;

    // Upsert MapPattern
    const mapPattern = await prisma.mapPattern.upsert({
      where: { id: patternId },
      update: {},
      create: {
        id: patternId,
        nightlord: nightlord as Nightlord,
        patternIndex: parseInt(patternIndex, 10),
        seed: 0, // TODO: If seed is available, use it
        shiftingEarthEvents: shiftingEarth ? [shiftingEarth as ShiftingEarthEventType] : [],
        circleSequence: [], // TODO: Parse if available
        specialEvents: [specialEvent, night1Circle, night2Circle].filter((v): v is string => typeof v === 'string' && !!v),
      },
    });

    // 4. For each POI column, create or upsert Landmarks and link to pattern
    for (let i = 0; i < poiCells.length; i++) {
      const colName = (subHeaderRow ? subHeaderRow[i + 10] : undefined) || headerRow[i + 10];
      if (!colName) continue;
      const cellValue = poiCells[i];
      if (!cellValue) continue;
      const landmarkType = landmarkTypeMap[colName] || LandmarkType.Ruins; // Default/fallback
      const landmarkId = `${patternId}-${colName.replace(/\s+/g, '_')}`;

      // Upsert Landmark
      const landmark = await prisma.landmark.upsert({
        where: { id: landmarkId },
        update: {},
        create: {
          id: landmarkId,
          type: landmarkType,
          name: cellValue,
          x: 0, // Placeholder, to be updated with real coordinates
          y: 0, // Placeholder
          icon: undefined,
          priority: undefined,
          contents: [],
          notes: '',
        },
      });

      // Link Landmark to MapPattern
      await prisma.mapPatternLandmark.upsert({
        where: { mapPatternId_landmarkId: { mapPatternId: mapPattern.id, landmarkId: landmark.id } },
        update: {},
        create: {
          mapPatternId: mapPattern.id,
          landmarkId: landmark.id,
          order: i + 1,
        },
      });
    }
    // TODO: Bosses and more advanced logic can be added here
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 