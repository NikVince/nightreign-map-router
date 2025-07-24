// scripts/generate_pattern_layouts_ignore.cjs
// For each row in the CSV (starting from row 3), output a JSON file with all columns as key-value pairs.
// For POI columns with a subtitle/location, use a nested object: { location, value }.
// Usage: node scripts/generate_pattern_layouts_ignore.cjs

const fs = require('fs');
const path = require('path');
const parse = require('csv-parse/sync').parse;

const csvPath = path.join(__dirname, '../reference_material/Elden Ring Nightreign map patterns - Patterns.csv');
const outputDir = path.join(__dirname, '../reference_material/pattern_layouts/');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

const csvContent = fs.readFileSync(csvPath, 'utf-8');
const rows = parse(csvContent, { skip_empty_lines: false });

const headerRow = rows[0]; // Titles
const subtitleRow = rows[1]; // Subtitles/locations

for (let idx = 2; idx < rows.length; idx++) {
  const row = rows[idx];
  if (row.every(cell => !cell || cell.trim() === '')) continue; // skip empty rows
  const layout = {};
  for (let col = 0; col < headerRow.length; col++) {
    const title = headerRow[col] ? headerRow[col].trim() : '';
    const subtitle = subtitleRow[col] ? subtitleRow[col].trim() : '';
    const value = row[col] && row[col].trim() !== '' ? row[col].trim() : 'empty';

    // First column: always 'Layout Number'
    if (col === 0) {
      layout['Layout Number'] = value;
      continue;
    }

    // If the column has a subtitle/location, use nested object
    if (subtitle) {
      // Use a unique key for each POI of the same type
      let key = `${title} - ${subtitle}`;
      layout[key] = { location: subtitle, value };
    } else {
      // No subtitle: just use the title
      layout[title] = value;
    }
  }
  const outPath = path.join(outputDir, `layout_${String(idx - 1).padStart(3, '0')}.json`);
  fs.writeFileSync(outPath, JSON.stringify(layout, null, 2));
  console.log(`Wrote ${outPath}`);
}

console.log('All full-content pattern layouts generated with nested POI structure.'); 