// csv_to_pattern_json.ts
// Script to convert Elden Ring Nightreign map patterns CSV to JSON for DB import
// Usage: ts-node scripts/csv_to_pattern_json.ts

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Path to the CSV file
const csvPath = path.join(__dirname, '../reference_material/Elden Ring Nightreign map patterns - Patterns.csv');
// Output path for the generated JSON
const outputPath = path.join(__dirname, '../reference_material/patterns.json');

// Read CSV file
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
});

// Helper: Clean up POI fields (remove empty, trim, etc.)
function extractPOIs(record: any) {
  // All columns after the first 10 are POI columns (adjust if needed)
  const poiKeys = Object.keys(record).slice(10);
  return poiKeys
    .map((key, idx) => {
      const value = record[key]?.trim();
      if (!value) return null;
      return {
        id: `poi_${idx}`,
        name: key,
        label: value,
        // Add more fields as needed (e.g., coordinates, type)
      };
    })
    .filter(Boolean);
}

// Convert records to pattern objects
const patterns = records.map((record: any, i: number) => {
  return {
    seed: record[''], // The first column is usually the seed/index
    nightlord: record['Nightlord'],
    patternIndex: parseInt(record['']),
    pois: extractPOIs(record),
    // Add more fields if needed
  };
});

// Write to JSON
fs.writeFileSync(outputPath, JSON.stringify(patterns, null, 2));

console.log(`Converted ${patterns.length} patterns to JSON. Output: ${outputPath}`); 