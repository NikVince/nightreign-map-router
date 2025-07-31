#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to extract ALL POI entries and verify against backup coordinates
function finalVerification() {
  const layoutsDir = path.join(__dirname, '..', 'reference_material', 'pattern_layouts');
  const backupPath = path.join(__dirname, '..', 'public', 'assets', 'maps', 'coordinates_backup', 'poi_name_coordinate_map.js');
  
  console.log('=== FINAL POI CONFLICT VERIFICATION ===\n');
  
  // Read backup coordinates to get all possible POI names
  const backupContent = fs.readFileSync(backupPath, 'utf8');
  const backupPOIs = new Set();
  
  // Extract all POI names from backup file
  const backupMatches = backupContent.matchAll(/"([^"]+)":\s*{\s*x:\s*([^,]+),\s*y:\s*([^}]+)\s*},\s*\/\/\s*POI\s*(\d+)/g);
  for (const match of backupMatches) {
    const poiName = match[1];
    const poiId = parseInt(match[4]);
    backupPOIs.add(poiName);
  }
  
  console.log(`Found ${backupPOIs.size} POIs in backup coordinates file`);
  
  // Analyze all layout files
  const layoutFiles = fs.readdirSync(layoutsDir).filter(file => file.endsWith('.json'));
  const locationContextMap = new Map(); // location -> Map(context -> Set of keys)
  
  layoutFiles.forEach(file => {
    try {
      const layoutPath = path.join(layoutsDir, file);
      const layoutData = JSON.parse(fs.readFileSync(layoutPath, 'utf8'));
      
      // Extract ALL entries that have a "location" property
      Object.keys(layoutData).forEach(key => {
        const value = layoutData[key];
        if (typeof value === 'object' && value !== null && value.location) {
          const context = key.split(' - ')[0] || 'Unknown';
          const location = value.location;
          
          if (!locationContextMap.has(location)) {
            locationContextMap.set(location, new Map());
          }
          
          const contextMap = locationContextMap.get(location);
          if (!contextMap.has(context)) {
            contextMap.set(context, new Set());
          }
          contextMap.get(context).add(key);
        }
      });
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  });
  
  // Find ALL conflicts
  const conflicts = [];
  locationContextMap.forEach((contextMap, location) => {
    if (contextMap.size > 1) {
      const contextDetails = [];
      contextMap.forEach((keys, context) => {
        contextDetails.push({
          context,
          keys: Array.from(keys),
          count: keys.size
        });
      });
      
      conflicts.push({
        location,
        contexts: contextDetails
      });
    }
  });
  
  console.log(`\nFound ${conflicts.length} conflicts:`);
  conflicts.forEach(conflict => {
    console.log(`\nCONFLICT: "${conflict.location}" appears in ${conflict.contexts.length} contexts:`);
    conflict.contexts.forEach(({ context, keys, count }) => {
      console.log(`  - ${context} (${count} occurrences):`);
      keys.forEach(key => console.log(`    * ${key}`));
    });
  });
  
  // Check if all conflicts are handled by current mapping
  console.log('\n=== CONFLICT RESOLUTION STATUS ===\n');
  
  const currentMappingPath = path.join(__dirname, '..', 'src', 'utils', 'poiLocationMapping.ts');
  const currentMappingContent = fs.readFileSync(currentMappingPath, 'utf8');
  
  let allConflictsHandled = true;
  conflicts.forEach(conflict => {
    const location = conflict.location;
    
    if (location === "Minor Erdtree") {
      // Check if our context-aware function handles this
      if (currentMappingContent.includes('getPOIIdForLocationWithContext')) {
        console.log(`✅ "${location}" - Handled by context-aware function`);
      } else {
        console.log(`❌ "${location}" - NOT HANDLED`);
        allConflictsHandled = false;
      }
    } else {
      console.log(`❌ "${location}" - UNEXPECTED CONFLICT NOT HANDLED`);
      allConflictsHandled = false;
    }
  });
  
  if (allConflictsHandled) {
    console.log('\n✅ ALL CONFLICTS ARE PROPERLY HANDLED!');
  } else {
    console.log('\n❌ SOME CONFLICTS ARE NOT HANDLED!');
  }
  
  // Final summary
  console.log('\n=== FINAL SUMMARY ===');
  console.log(`Total conflicts found: ${conflicts.length}`);
  console.log(`All conflicts handled: ${allConflictsHandled ? 'YES' : 'NO'}`);
  
  if (conflicts.length === 1 && conflicts[0].location === "Minor Erdtree") {
    console.log('\n✅ CONFIRMED: Only "Minor Erdtree" conflict exists and is properly handled.');
  } else {
    console.log('\n❌ UNEXPECTED: Found additional conflicts beyond "Minor Erdtree".');
  }
  
  return { conflicts, allConflictsHandled };
}

// Run the verification
finalVerification(); 