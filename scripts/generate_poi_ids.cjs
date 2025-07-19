
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

function processCoordinates() {
  const allCoords = new Set();

  for (const dir of coordinateDirs) {
    const filePath = path.join(__dirname, '..', dir);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    for (const category in data) {
      if (Array.isArray(data[category])) {
        data[category].forEach((coord) => {
          allCoords.add(JSON.stringify(coord));
        });
      }
    }
  }

  const uniqueCoords = Array.from(allCoords).map((s) => JSON.parse(s));

  const coordsWithIds = uniqueCoords.map((coord, index) => ({
    id: index + 1,
    coordinates: coord,
  }));

  fs.writeFileSync(outputPath, JSON.stringify(coordsWithIds, null, 2));

  console.log(`Processed ${uniqueCoords.length} unique coordinates. Output: ${outputPath}`);
}

try {
  processCoordinates();
} catch (error) {
  console.error('Error processing coordinates:', error);
} 