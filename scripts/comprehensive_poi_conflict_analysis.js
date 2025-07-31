import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function comprehensivePOIConflictAnalysis() {
  const layoutsDir = path.join(__dirname, '../reference_material/pattern_layouts');
  const layoutFiles = fs.readdirSync(layoutsDir).filter(file => file.startsWith('layout_') && file.endsWith('.json'));
  
  console.log('🔍 COMPREHENSIVE POI CONFLICT ANALYSIS');
  console.log('=======================================');
  console.log(`Analyzing ${layoutFiles.length} layout files for ALL possible POI conflicts...\n`);
  
  // Track all POI types and their locations
  const poiTypeUsage = {
    'Major Base': new Map(),
    'Minor Base': new Map(),
    'Evergaol': new Map(),
    'Field Boss': new Map(),
    'Arena Boss': new Map(),
    'Rotted Woods': new Map(),
    'Spawn Point': new Map(),
    'Night Circle': new Map(),
    'Scale-Bearing Merchant': new Map(),
  };
  
  // Track all unique locations across all POI types
  const allLocations = new Set();
  const locationToPOITypes = new Map();
  
  layoutFiles.forEach(file => {
    const layoutNumber = file.replace('layout_', '').replace('.json', '');
    const layoutPath = path.join(layoutsDir, file);
    const layoutData = JSON.parse(fs.readFileSync(layoutPath, 'utf8'));
    
    // Process each POI type
    Object.keys(layoutData).forEach(key => {
      const value = layoutData[key];
      
      if (typeof value === 'object' && value !== null && value.location) {
        // This is a structured POI entry (Major Base, Minor Base, Evergaol, etc.)
        const poiType = key.split(' - ')[0];
        const location = value.location;
        
        if (!poiTypeUsage[poiType]) {
          poiTypeUsage[poiType] = new Map();
        }
        
        if (!poiTypeUsage[poiType].has(location)) {
          poiTypeUsage[poiType].set(location, []);
        }
        poiTypeUsage[poiType].get(location).push(layoutNumber);
        
        allLocations.add(location);
        
        if (!locationToPOITypes.has(location)) {
          locationToPOITypes.set(location, new Set());
        }
        locationToPOITypes.get(location).add(poiType);
      } else if (typeof value === 'string' && value !== "empty") {
        // This is a simple string POI (Spawn Point, Night Circle, etc.)
        let poiType = null;
        let location = value;
        
        if (key === "Spawn Point") {
          poiType = "Spawn Point";
        } else if (key === "Night 1 Circle" || key === "Night 2 Circle") {
          poiType = "Night Circle";
        } else if (key === "Scale-Bearing Merchant") {
          poiType = "Scale-Bearing Merchant";
        }
        
        if (poiType) {
          if (!poiTypeUsage[poiType]) {
            poiTypeUsage[poiType] = new Map();
          }
          
          if (!poiTypeUsage[poiType].has(location)) {
            poiTypeUsage[poiType].set(location, []);
          }
          poiTypeUsage[poiType].get(location).push(layoutNumber);
          
          allLocations.add(location);
          
          if (!locationToPOITypes.has(location)) {
            locationToPOITypes.set(location, new Set());
          }
          locationToPOITypes.get(location).add(poiType);
        }
      }
    });
  });
  
  console.log('📊 POI TYPE USAGE STATISTICS:');
  console.log('==============================');
  
  Object.keys(poiTypeUsage).forEach(poiType => {
    const locations = poiTypeUsage[poiType];
    console.log(`\n${poiType}:`);
    console.log(`  Total unique locations: ${locations.size}`);
    console.log(`  Total usage across all layouts: ${Array.from(locations.values()).reduce((sum, layouts) => sum + layouts.length, 0)}`);
    
    // Show top 5 most used locations for this POI type
    const sortedLocations = Array.from(locations.entries()).sort((a, b) => b[1].length - a[1].length);
    sortedLocations.slice(0, 5).forEach(([location, layouts]) => {
      console.log(`    ${location}: ${layouts.length} layouts`);
    });
  });
  
  console.log(`\n📋 TOTAL UNIQUE LOCATIONS ACROSS ALL POI TYPES: ${allLocations.size}`);
  
  // Check for location name conflicts across different POI types
  console.log('\n🔍 LOCATION NAME CONFLICT ANALYSIS:');
  console.log('===================================');
  
  const conflicts = [];
  
  locationToPOITypes.forEach((poiTypes, location) => {
    if (poiTypes.size > 1) {
      conflicts.push({
        location,
        poiTypes: Array.from(poiTypes),
        usage: Array.from(poiTypes).map(type => ({
          type,
          count: poiTypeUsage[type].get(location)?.length || 0
        }))
      });
    }
  });
  
  if (conflicts.length === 0) {
    console.log('✅ No location name conflicts found!');
  } else {
    console.log(`⚠️  Found ${conflicts.length} location(s) used by multiple POI types:`);
    
    conflicts.forEach(conflict => {
      console.log(`\n❌ CONFLICT: "${conflict.location}"`);
      console.log(`   Used by: ${conflict.poiTypes.join(', ')}`);
      conflict.usage.forEach(usage => {
        console.log(`     ${usage.type}: ${usage.count} layouts`);
      });
    });
  }
  
  // Check POI ID mapping conflicts
  console.log('\n🔍 POI ID MAPPING CONFLICT ANALYSIS:');
  console.log('=====================================');
  
  // Define all POI ID mappings
  const poiIdMappings = {
    'Major Base': {
      "South Lake": 93,
      "Groveside": 94,
      "Gatefront": 96,
      "Stormhill North of Gate": 95,
      "Alexander Spot": 98,
      "Northwest Stormhill": 97,
      "Northeast Stormhill": 99,
      "South Mistwood": 107,
      "Waypoint Ruins": 108,
      "Minor Erdtree": 106,
      "West Mistwood": 105,
      "Northwest Mistwood": 103,
      "Artist's Shack": 102,
      "Northeast Mistwood": 104,
      "Summonwater Approach": 100,
      "Summonwater": 101,
    },
    'Minor Base': {
      "Far Southwest": 31,
      "Lake": 30,
      "Stormhill South of Gate": 32,
      "Above Stormhill Tunnel Entrance": 34,
      "West of Warmaster's Shack": 33,
      "Southeast of Lake": 28,
      "East of Cavalry Bridge": 29,
      "Below Summonwater Hawk": 36,
      "Third Church": 37,
      "Northeast of Saintsbridge": 35,
      "Minor Erdtree": 157, // Special case handled by context
    },
    'Evergaol': {
      "Northwest of Lake": 82,
      "Murkwater Terminus": 78,
      "Stormhill": 76,
      "Highroad": 77,
      "East of Lake": 81,
      "Mistwood": 80,
      "Northeast Tunnel Entrance": 79,
    },
    'Field Boss': {
      "Far Southwest of Lake": 85,
      "Lake Field Boss": 84,
      "North of Stormhill Tunnel Entrance": 86,
      "North of Murkwater Terminus": 87,
      "Stormhill Spectral Hawk": 88,
      "Northwest Stormhill Cliffside": 89,
      "Mistwood Spectral Hawk": 83,
      "North Mistwood": 92,
      "East of Murkwater Terminus": 90,
      "Northwest of Summonwater": 91,
    },
    'Arena Boss': {
      "Castle Basement": 23,
      "Castle Rooftop": 158,
    },
    'Rotted Woods': {
      "Southwest": 154,
      "Southeast": 155,
      "Center West": 151,
      "Center East": 153,
      "Far Northwest": 150,
      "Northwest": 167,
      "Northeast": 152,
      "Far Northeast": 168,
    },
    'Spawn Point': {
      "Above Stormhill Tunnel Entrance": 202,
      "Below Summonwater Hawk": 204,
      "East of Cavalry Bridge": 201,
      "Far Southwest": 207,
      "Minor Erdtree": 206,
      "Northeast of Saintsbridge": 208,
      "Southeast of Lake": 205,
      "Stormhill South of Gate": 203,
      "West of Warmaster's Shack": 209,
    },
    'Night Circle': {
      "East of Saintsbridge": 182,
      "Northeast Corner": 177,
      "Northeast of Lake": 184,
      "Northwest Corner": 178,
      "Northwest Lake": 185,
      "Northwest Mistwood Pond": 181,
      "Northwest of Castle": 183,
    },
    'Scale-Bearing Merchant': {
      "South of Castle": 169,
      "Ruins North of Castle": 170,
      "Northeast Corner": 171,
      "Southeast Lakeshore": 172,
      "Northwest Corner": 27,
      "East of Saintsbridge": 173,
      "Castle Front": 174,
      "Southwest Corner": 175,
    },
  };
  
  // Check for POI ID conflicts
  const poiIdConflicts = [];
  const usedPOIIds = new Map(); // poiId -> { poiType, location }
  
  Object.keys(poiIdMappings).forEach(poiType => {
    const mappings = poiIdMappings[poiType];
    Object.keys(mappings).forEach(location => {
      const poiId = mappings[location];
      
      if (usedPOIIds.has(poiId)) {
        const existing = usedPOIIds.get(poiId);
        poiIdConflicts.push({
          poiId,
          conflict1: { poiType: existing.poiType, location: existing.location },
          conflict2: { poiType, location }
        });
      } else {
        usedPOIIds.set(poiId, { poiType, location });
      }
    });
  });
  
  if (poiIdConflicts.length === 0) {
    console.log('✅ No POI ID conflicts found!');
  } else {
    console.log(`⚠️  Found ${poiIdConflicts.length} POI ID conflict(s):`);
    
    poiIdConflicts.forEach(conflict => {
      console.log(`\n❌ POI ID ${conflict.poiId} used by:`);
      console.log(`   ${conflict.conflict1.poiType} - ${conflict.conflict1.location}`);
      console.log(`   ${conflict.conflict2.poiType} - ${conflict.conflict2.location}`);
    });
  }
  
  // Check for location name conflicts that could cause mapping issues
  console.log('\n🔍 LOCATION NAME MAPPING CONFLICT ANALYSIS:');
  console.log('===========================================');
  
  const locationMappingConflicts = [];
  
  // Check if any location name appears in multiple POI type mappings
  const locationToMappings = new Map();
  
  Object.keys(poiIdMappings).forEach(poiType => {
    const mappings = poiIdMappings[poiType];
    Object.keys(mappings).forEach(location => {
      if (!locationToMappings.has(location)) {
        locationToMappings.set(location, []);
      }
      locationToMappings.get(location).push({ poiType, poiId: mappings[location] });
    });
  });
  
  locationToMappings.forEach((mappings, location) => {
    if (mappings.length > 1) {
      locationMappingConflicts.push({
        location,
        mappings
      });
    }
  });
  
  if (locationMappingConflicts.length === 0) {
    console.log('✅ No location name mapping conflicts found!');
  } else {
    console.log(`⚠️  Found ${locationMappingConflicts.length} location name(s) with multiple mappings:`);
    
    locationMappingConflicts.forEach(conflict => {
      console.log(`\n❌ "${conflict.location}" mapped to:`);
      conflict.mappings.forEach(mapping => {
        console.log(`   ${mapping.poiType}: POI ${mapping.poiId}`);
      });
    });
  }
  
  // Final summary
  console.log('\n📝 COMPREHENSIVE ANALYSIS SUMMARY:');
  console.log('===================================');
  console.log(`• Total unique locations: ${allLocations.size}`);
  console.log(`• Location name conflicts: ${conflicts.length}`);
  console.log(`• POI ID conflicts: ${poiIdConflicts.length}`);
  console.log(`• Location mapping conflicts: ${locationMappingConflicts.length}`);
  
  const totalConflicts = conflicts.length + poiIdConflicts.length + locationMappingConflicts.length;
  
  if (totalConflicts === 0) {
    console.log('\n✅ EXCELLENT! No conflicts found across all POI types and mappings.');
    console.log('✅ All POI assignments are unique and conflict-free.');
  } else {
    console.log(`\n⚠️  ${totalConflicts} conflict(s) found that need attention.`);
  }
  
  return {
    totalLocations: allLocations.size,
    locationConflicts: conflicts.length,
    poiIdConflicts: poiIdConflicts.length,
    mappingConflicts: locationMappingConflicts.length,
    totalConflicts
  };
}

// Run the comprehensive analysis
const results = comprehensivePOIConflictAnalysis(); 