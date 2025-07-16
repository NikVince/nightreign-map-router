// import_patterns_to_db.js
// Script to import patterns.json into the Pattern table using Prisma
// Usage: node scripts/import_patterns_to_db.js

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const jsonPath = path.join(__dirname, '../reference_material/patterns.json');

async function main() {
  const patterns = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  let upserted = 0;
  let skipped = 0;
  for (const pattern of patterns) {
    // Validation: skip if seed or nightlord is empty, or patternIndex is not a valid integer
    if (
      !pattern.seed ||
      typeof pattern.seed !== 'string' ||
      pattern.seed.trim() === '' ||
      !pattern.nightlord ||
      typeof pattern.nightlord !== 'string' ||
      pattern.nightlord.trim() === '' ||
      typeof pattern.patternIndex !== 'number' ||
      !Number.isInteger(pattern.patternIndex)
    ) {
      console.warn('Skipping invalid pattern:', pattern);
      skipped++;
      continue;
    }
    await prisma.pattern.upsert({
      where: { seed: pattern.seed },
      update: {
        nightlord: pattern.nightlord,
        patternIndex: pattern.patternIndex,
        pois: pattern.pois,
      },
      create: {
        seed: pattern.seed,
        nightlord: pattern.nightlord,
        patternIndex: pattern.patternIndex,
        pois: pattern.pois,
      },
    });
    upserted++;
  }
  console.log(`Upserted ${upserted} patterns into the database. Skipped ${skipped} invalid records.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 