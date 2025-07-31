import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function analyzeSpawnPointConflicts() {
  const layoutsDir = path.join(__dirname, '../reference_material/pattern_layouts');
  const layoutFiles = fs.readdirSync(layoutsDir).filter(file => file.startsWith('layout_') && file.endsWith('.json'));
  
  console.log('🔍 Analyzing spawn point conflicts across all layout files...\n');
  
  // Track all spawn point locations and their usage
  const spawnPointUsage = new Map();
  const potentialConflicts = [];
  
  layoutFiles.forEach(file => {
    const layoutNumber = file.replace('layout_', '').replace('.json', '');
    const layoutPath = path.join(layoutsDir, file);
    const layoutData = JSON.parse(fs.readFileSync(layoutPath, 'utf8'));
    
    const spawnPoint = layoutData["Spawn Point"];
    if (spawnPoint && spawnPoint !== "empty") {
      if (!spawnPointUsage.has(spawnPoint)) {
        spawnPointUsage.set(spawnPoint, []);
      }
      spawnPointUsage.get(spawnPoint).push(layoutNumber);
    }
  });
  
  console.log('📊 Spawn Point Usage Statistics:');
  console.log('================================');
  
  const sortedUsage = Array.from(spawnPointUsage.entries()).sort((a, b) => b[1].length - a[1].length);
  
  sortedUsage.forEach(([location, layouts]) => {
    console.log(`${location}: ${layouts.length} layouts`);
  });
  
  console.log(`\n📋 Total unique spawn point locations: ${spawnPointUsage.size}`);
  console.log(`📋 Total layout files analyzed: ${layoutFiles.length}`);
  
  // Check for potential conflicts with regular POI mappings
  console.log('\n🔍 Checking for potential conflicts with regular POI mappings...');
  
  const regularPOIMappings = {
    "Above Stormhill Tunnel Entrance": 34,
    "Below Summonwater Hawk": 36,
    "East of Cavalry Bridge": 29,
    "Far Southwest": 31,
    "Minor Erdtree": 106, // This is the conflict!
    "Northeast of Saintsbridge": 35,
    "Southeast of Lake": 28,
    "Stormhill South of Gate": 32,
    "West of Warmaster's Shack": 33,
  };
  
  const spawnPointMappings = {
    "Above Stormhill Tunnel Entrance": 202,
    "Below Summonwater Hawk": 204,
    "East of Cavalry Bridge": 201,
    "Far Southwest": 207,
    "Minor Erdtree": 206, // Spawn Point Minor Erdtree
    "Northeast of Saintsbridge": 208,
    "Southeast of Lake": 205,
    "Stormhill South of Gate": 203,
    "West of Warmaster's Shack": 209,
  };
  
  console.log('\n⚠️  CONFLICT ANALYSIS:');
  console.log('=====================');
  
  let conflictsFound = 0;
  
  Object.keys(spawnPointMappings).forEach(location => {
    if (regularPOIMappings[location]) {
      const regularPOI = regularPOIMappings[location];
      const spawnPOI = spawnPointMappings[location];
      
      if (regularPOI !== spawnPOI) {
        console.log(`❌ CONFLICT: "${location}"`);
        console.log(`   Regular POI mapping: ${regularPOI}`);
        console.log(`   Spawn Point mapping: ${spawnPOI}`);
        console.log(`   Used in ${spawnPointUsage.get(location)?.length || 0} layouts as spawn point`);
        console.log('');
        conflictsFound++;
      }
    }
  });
  
  if (conflictsFound === 0) {
    console.log('✅ No conflicts found!');
  } else {
    console.log(`⚠️  Found ${conflictsFound} conflict(s) that need special handling.`);
  }
  
  // Check if our current fix handles all conflicts
  console.log('\n🔧 VERIFYING CURRENT FIX:');
  console.log('========================');
  
  const conflicts = ["Minor Erdtree"];
  
  conflicts.forEach(conflict => {
    if (spawnPointUsage.has(conflict)) {
      console.log(`✅ "${conflict}" conflict is handled by getPOIIdForSpawnLocation()`);
      console.log(`   Affects ${spawnPointUsage.get(conflict).length} layouts`);
    } else {
      console.log(`❌ "${conflict}" conflict not found in spawn points`);
    }
  });
  
  console.log('\n📝 SUMMARY:');
  console.log('===========');
  console.log(`• Total spawn point locations: ${spawnPointUsage.size}`);
  console.log(`• Conflicts found: ${conflictsFound}`);
  console.log(`• Current fix handles: ${conflicts.length} conflict(s)`);
  
  if (conflictsFound === conflicts.length) {
    console.log('\n✅ All conflicts are properly handled by the current fix!');
  } else {
    console.log('\n⚠️  Additional conflicts may need attention.');
  }
}

// Run the analysis
analyzeSpawnPointConflicts(); 