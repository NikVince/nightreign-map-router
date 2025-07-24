// scripts/generate_pattern_layouts_ignore.cjs
// For each row in the CSV (starting from row 3), output a JSON file with all 69 columns as key-value pairs.
// For POI columns with a subtitle/location, use a nested object: { location, value }.
// Always process exactly 69 columns, padding as needed.
// Usage: node scripts/generate_pattern_layouts_ignore.cjs

const fs = require('fs');
const path = require('path');
const parse = require('csv-parse/sync').parse;

const csvPath = path.join(__dirname, '../reference_material/Elden Ring Nightreign map patterns - Patterns.csv');
const outputDir = path.join(__dirname, '../reference_material/pattern_layouts/');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

const csvContent = fs.readFileSync(csvPath, 'utf-8');
const rows = parse(csvContent, { skip_empty_lines: false }); // Don't use columns: true

const NUM_COLS = 69;
const headers = (rows[0] || []).slice(0, NUM_COLS);
const subtitles = (rows[1] || []).slice(0, NUM_COLS);
while (headers.length < NUM_COLS) headers.push('');
while (subtitles.length < NUM_COLS) subtitles.push('');

for (let i = 2; i < rows.length; i++) {
  const row = rows[i] || [];
  if (row.length === 0 || row.every(cell => cell === '')) continue; // skip empty rows
  const output = {};

  for (let col = 0; col < NUM_COLS; col++) {
    let header = headers[col] || '';
    let subtitle = subtitles[col] || '';
    let value = (row[col] !== undefined && row[col] !== '') ? row[col] : 'empty';

    // Special handling for the first column (layout number)
    if (col === 0) {
      output['Layout Number'] = String(i - 1);
      continue;
    }

    // If header is empty, skip (shouldn't happen except for layout number)
    if (!header) continue;

    // If subtitle exists, use nested object
    if (subtitle) {
      output[`${header} - ${subtitle}`] = { location: subtitle, value };
    } else {
      output[header] = value;
    }
  }

  // Write to file, layout number is (i-1) to start at layout_001.json
  const layoutNum = String(i - 1).padStart(3, '0');
  const outPath = path.join(outputDir, `layout_${layoutNum}.json`);
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
} 