
const fs = require('fs');
const path = require('path');

const coordinateDirs = [
  'public/assets/maps/coordinates/default_map_layout.json',
  'public/assets/maps/coordinates/noklateo_map_layout.json',
  'public/assets/maps/coordinates/the_crater_map_layout.json',
  'public/assets/maps/coordinates/the_mountaintop_map_layout.json',
  'public/assets/maps/coordinates/the_rotten_woods_map_layout.json',
];

const outputPath = path.join(__dirname, '../public/assets/maps/poi_coordinates_with_ids.json');

/**
 * @param {number[]} coord
 * @returns {string}
 */
function coordsKey(coord) {
  // Use a stringified version for comparison, with fixed precision for floats
  return JSON.stringify(coord.map((n) => Number(n.toFixed(5))));
}

function processCoordinates() {
  // Read existing POI list if it exists
  /** @type {{id: number, coordinates: number[]}[]} */
  let existing = [];
  if (fs.existsSync(outputPath)) {
    existing = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
  }
  /** @type {Map<string, number>} */
  const existingMap = new Map(existing.map((entry) => [coordsKey(entry.coordinates), entry.id]));
  let nextId = existing.length > 0 ? Math.max(...existing.map((e) => e.id)) + 1 : 1;

  // Gather all coordinates from all layouts
  const allCoords = new Set();
  for (const dir of coordinateDirs) {
    const filePath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(filePath)) continue;
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    for (const category in data) {
      if (Array.isArray(data[category])) {
        data[category].forEach((coord) => {
          allCoords.add(coordsKey(coord));
        });
      }
    }
  }

  // Build the new list, preserving all existing, and appending new
  const newList = [...existing];
  for (const key of allCoords) {
    if (!existingMap.has(key)) {
      // Parse the coordinate back from the key
      const coord = JSON.parse(key);
      newList.push({ id: nextId, coordinates: coord });
      existingMap.set(key, nextId);
      nextId++;
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(newList, null, 2));
  console.log(`Processed ${newList.length} unique coordinates. Output: ${outputPath}`);
}

try {
  processCoordinates();
} catch (error) {
  console.error('Error processing coordinates:', error);
} 