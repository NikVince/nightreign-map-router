// scripts/generate_pattern_layouts.ts
// Generates a JSON file for each map pattern/seed, mapping POI content to POI number and coordinates.
// Usage: ts-node scripts/generate_pattern_layouts.ts

import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

// --- Load input files ---
const csvPath = path.join(__dirname, '../reference_material/Elden Ring Nightreign map patterns - Patterns.csv');
const poiCoordsPath = path.join(__dirname, '../public/assets/maps/poi_coordinates_with_ids.json');
const poiNameMapPath = path.join(__dirname, '../public/assets/maps/coordinates_backup/poi_name_coordinate_map.js');
const outputDir = path.join(__dirname, '../reference_material/pattern_layouts/');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// Read and parse CSV
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const records = parse(csvContent, { columns: true, skip_empty_lines: true });

// Read POI coordinates
const poiCoords = JSON.parse(fs.readFileSync(poiCoordsPath, 'utf-8'));
const poiCoordsById = Object.fromEntries(poiCoords.map((p: any) => [p.id, p.coordinates]));

// Import POI name-to-coordinate/number map
const poiNameMap = require(poiNameMapPath).poiNameCoordinateMap;

// Helper: Find POI number by name/coordinate
function findPoiIdByName(name: string): number | null {
  // Try to match by name in the mapping file
  const entry = poiNameMap[name];
  if (!entry) return null;
  // Find the POI id by matching coordinates
  for (const poi of poiCoords) {
    if (Math.abs(poi.coordinates[0] - entry.x) < 0.01 && Math.abs(poi.coordinates[1] - entry.y) < 0.01) {
      return poi.id;
    }
  }
  return null;
}

// --- Main generation loop ---
records.forEach((record: any, idx: number) => {
  // Compose output for this pattern
  const pattern = {
    seed: record[''],
    nightlord: record['Nightlord'],
    patternIndex: idx,
    pois: [] as any[],
  };

  // All columns after the first 10 are POI columns
  const poiKeys = Object.keys(record).slice(10);
  poiKeys.forEach((key, i) => {
    const label = record[key]?.trim();
    if (!label) return;
    const poiName = key + (key !== label ? ` ${label}` : '');
    const poiId = findPoiIdByName(poiName) || findPoiIdByName(key) || null;
    const coordinates = poiId ? poiCoordsById[poiId] : null;
    pattern.pois.push({
      poiKey: key,
      label,
      poiId,
      coordinates,
    });
  });

  // Write output file
  const outPath = path.join(outputDir, `layout_${String(idx + 1).padStart(3, '0')}.json`);
  fs.writeFileSync(outPath, JSON.stringify(pattern, null, 2));
  console.log(`Wrote ${outPath}`);
});

console.log('All pattern layouts generated.'); 