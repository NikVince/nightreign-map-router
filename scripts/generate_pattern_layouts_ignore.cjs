// scripts/generate_pattern_layouts_ignore.cjs
// For each row in the CSV, output a JSON file with all columns as key-value pairs, using 'empty' for empty cells.
// Usage: node scripts/generate_pattern_layouts_ignore.cjs

const fs = require('fs');
const path = require('path');
const parse = require('csv-parse/sync').parse;

const csvPath = path.join(__dirname, '../reference_material/Elden Ring Nightreign map patterns - Patterns.csv');
const outputDir = path.join(__dirname, '../reference_material/pattern_layouts/');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

const csvContent = fs.readFileSync(csvPath, 'utf-8');
const records = parse(csvContent, { columns: true, skip_empty_lines: false });

records.forEach((record, idx) => {
  const layout = {};
  for (const [key, value] of Object.entries(record)) {
    layout[key] = value && value.trim() !== '' ? value : 'empty';
  }
  const outPath = path.join(outputDir, `layout_${String(idx + 1).padStart(3, '0')}.json`);
  fs.writeFileSync(outPath, JSON.stringify(layout, null, 2));
  console.log(`Wrote ${outPath}`);
});

console.log('All full-content pattern layouts generated.'); 