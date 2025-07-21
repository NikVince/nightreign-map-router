// @ts-nocheck
const { PrismaClient, LandmarkType, Nightlord, ShiftingEarthEventType } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const prisma = new PrismaClient();

const CSV_PATH = path.join(__dirname, '../reference_material/Elden Ring Nightreign map patterns - Patterns.csv');
const POI_MASTER_LIST_PATH = path.join(__dirname, '../public/assets/maps/poi_coordinates_with_ids.json');

async function main() {
  console.log('Starting database seeding...');

  // 1. Clear existing pattern and landmark data to ensure a clean slate
  console.log('Clearing old data...');
  await prisma.routeLandmark.deleteMany({});
  await prisma.mapPatternLandmark.deleteMany({});
  await prisma.mapPattern.deleteMany({});
  await prisma.landmark.deleteMany({});

  // 2. Load the master list of POIs with unique IDs and coordinates
  console.log('Loading master POI list...');
  const poiMasterListRaw = fs.readFileSync(POI_MASTER_LIST_PATH, 'utf-8');
  const poiMasterList = JSON.parse(poiMasterListRaw);

  // 3. Create a single, unique entry for each landmark in the database
  console.log(`Creating ${poiMasterList.length} unique landmarks...`);
  for (const poi of poiMasterList) {
    // This is a placeholder. You'll need a way to map coordinates back to a name and type.
    // For now, we'll use a generic name and type.
    const tempName = `Landmark #${poi.id}`;
    const tempType = LandmarkType.Ruins;

    await prisma.landmark.create({
      data: {
        id: String(poi.id),
        name: tempName,
        type: tempType,
        x: poi.coordinates[0],
        y: poi.coordinates[1],
      },
    });
  }

  // 4. Parse the CSV to get the pattern data
  console.log('Parsing CSV for map patterns...');
  const csvRaw = fs.readFileSync(CSV_PATH, 'utf-8');
  const records = parse(csvRaw, { columns: true, skip_empty_lines: true });
  
  // 5. Create MapPatterns and link them to the unique Landmarks
  console.log(`Processing ${records.length} map patterns...`);
  for (const record of records) {
    const patternIndex = record[''] ?? '0';
    const nightlord = record['Nightlord'] ?? 'Gladius';
    const patternId = `${nightlord}-${patternIndex}`;

    const shiftingEarthEvent = record['Shifting Earth'];
    const shiftingEarthEventValue = Object.values(ShiftingEarthEventType).includes(shiftingEarthEvent) ? shiftingEarthEvent : undefined;

    await prisma.mapPattern.create({
      data: {
        id: patternId,
        nightlord: nightlord,
        patternIndex: parseInt(patternIndex, 10),
        seed: 0, // Placeholder
        shiftingEarthEvents: shiftingEarthEventValue ? [shiftingEarthEventValue] : [],
        specialEvents: [record['Special Event'], record['Night 1 Circle'], record['Night 2 Circle']].filter(Boolean),
        circleSequence: [],
      },
    });
  }

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 