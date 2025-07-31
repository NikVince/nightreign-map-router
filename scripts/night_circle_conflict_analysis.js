import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function analyzeNightCircleConflicts() {
  const layoutsDir = path.join(__dirname, '../reference_material/pattern_layouts');
  const layoutFiles = fs.readdirSync(layoutsDir).filter(file => file.startsWith('layout_') && file.endsWith('.json'));
  
  console.log('🔍 Analyzing night circle conflicts across all layout files...\n');
  
  // Track all night circle locations and their usage
  const nightCircleUsage = new Map();
  
  layoutFiles.forEach(file => {
    const layoutNumber = file.replace('layout_', '').replace('.json', '');
    const layoutPath = path.join(layoutsDir, file);
    const layoutData = JSON.parse(fs.readFileSync(layoutPath, 'utf8'));
    
    const night1Circle = layoutData["Night 1 Circle"];
    const night2Circle = layoutData["Night 2 Circle"];
    
    if (night1Circle && night1Circle !== "empty") {
      if (!nightCircleUsage.has(night1Circle)) {
        nightCircleUsage.set(night1Circle, []);
      }
      nightCircleUsage.get(night1Circle).push({ layout: layoutNumber, night: 1 });
    }
    
    if (night2Circle && night2Circle !== "empty") {
      if (!nightCircleUsage.has(night2Circle)) {
        nightCircleUsage.set(night2Circle, []);
      }
      nightCircleUsage.get(night2Circle).push({ layout: layoutNumber, night: 2 });
    }
  });
  
  console.log('📊 Night Circle Usage Statistics:');
  console.log('=================================');
  
  const sortedUsage = Array.from(nightCircleUsage.entries()).sort((a, b) => b[1].length - a[1].length);
  
  sortedUsage.forEach(([location, usages]) => {
    const night1Count = usages.filter(u => u.night === 1).length;
    const night2Count = usages.filter(u => u.night === 2).length;
    console.log(`${location}: ${usages.length} total (Night 1: ${night1Count}, Night 2: ${night2Count})`);
  });
  
  console.log(`\n📋 Total unique night circle locations: ${nightCircleUsage.size}`);
  console.log(`📋 Total layout files analyzed: ${layoutFiles.length}`);
  
  // Check for potential conflicts with regular POI mappings
  console.log('\n🔍 Checking for potential conflicts with regular POI mappings...');
  
  const regularPOIMappings = {
    "East of Saintsbridge": 182,
    "Northeast Corner": 177,
    "Northeast of Lake": 184,
    "Northwest Corner": 178,
    "Northwest Lake": 185,
    "Northwest Mistwood Pond": 181,
    "Northwest of Castle": 183,
  };
  
  const nightCircleMappings = {
    "East of Saintsbridge": 182,
    "Northeast Corner": 177,
    "Northeast of Lake": 184,
    "Northwest Corner": 178,
    "Northwest Lake": 185,
    "Northwest Mistwood Pond": 181,
    "Northwest of Castle": 183,
  };
  
  console.log('\n⚠️  CONFLICT ANALYSIS:');
  console.log('=====================');
  
  let conflictsFound = 0;
  
  Object.keys(nightCircleMappings).forEach(location => {
    if (regularPOIMappings[location]) {
      const regularPOI = regularPOIMappings[location];
      const nightCirclePOI = nightCircleMappings[location];
      
      if (regularPOI !== nightCirclePOI) {
        console.log(`❌ CONFLICT: "${location}"`);
        console.log(`   Regular POI mapping: ${regularPOI}`);
        console.log(`   Night Circle mapping: ${nightCirclePOI}`);
        console.log(`   Used in ${nightCircleUsage.get(location)?.length || 0} layouts as night circle`);
        console.log('');
        conflictsFound++;
      }
    }
  });
  
  if (conflictsFound === 0) {
    console.log('✅ No conflicts found! Night circles use the same POI IDs as regular locations.');
  } else {
    console.log(`⚠️  Found ${conflictsFound} conflict(s) that need special handling.`);
  }
  
  console.log('\n📝 SUMMARY:');
  console.log('===========');
  console.log(`• Total night circle locations: ${nightCircleUsage.size}`);
  console.log(`• Conflicts found: ${conflictsFound}`);
  
  if (conflictsFound === 0) {
    console.log('\n✅ Night circles do not require special handling - they use regular POI mappings.');
  } else {
    console.log('\n⚠️  Night circles may need special handling for conflicts.');
  }
}

// Run the analysis
analyzeNightCircleConflicts(); 