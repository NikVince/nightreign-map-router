#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to extract ALL POI entries from a layout file without any assumptions
function extractAllPOIEntries(layoutData) {
  const entries = [];
  
  // Extract ALL entries that have a "location" property
  Object.keys(layoutData).forEach(key => {
    const value = layoutData[key];
    
    // Check if this is a POI entry (has location property)
    if (typeof value === 'object' && value !== null && value.location) {
      entries.push({
        key: key,
        location: value.location,
        value: value.value,
        context: key.split(' - ')[0] || 'Unknown'
      });
    }
  });
  
  return entries;
}

// Function to analyze ALL layout files comprehensively
function completeAnalysis() {
  const layoutsDir = path.join(__dirname, '..', 'reference_material', 'pattern_layouts');
  const layoutFiles = fs.readdirSync(layoutsDir).filter(file => file.endsWith('.json'));
  
  console.log(`Complete analysis of ${layoutFiles.length} layout files...`);
  
  // Track ALL location names and their contexts
  const locationContextMap = new Map(); // location -> Map(context -> Set of keys)
  const allPOIKeys = new Set();
  const allLocations = new Set();
  const allValues = new Set();
  
  layoutFiles.forEach(file => {
    try {
      const layoutPath = path.join(layoutsDir, file);
      const layoutData = JSON.parse(fs.readFileSync(layoutPath, 'utf8'));
      const entries = extractAllPOIEntries(layoutData);
      
      entries.forEach(entry => {
        allPOIKeys.add(entry.key);
        allLocations.add(entry.location);
        allValues.add(entry.value);
        
        if (!locationContextMap.has(entry.location)) {
          locationContextMap.set(entry.location, new Map());
        }
        
        const contextMap = locationContextMap.get(entry.location);
        if (!contextMap.has(entry.context)) {
          contextMap.set(entry.context, new Set());
        }
        contextMap.get(entry.context).add(entry.key);
      });
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  });
  
  // Find ALL conflicts (same location name in different contexts)
  console.log('\n=== COMPLETE POI CONFLICT ANALYSIS ===\n');
  
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
  
  if (conflicts.length === 0) {
    console.log('✅ No conflicts found! All POI locations are unique within their contexts.');
  } else {
    console.log(`❌ Found ${conflicts.length} conflicts:`);
    conflicts.forEach(conflict => {
      console.log(`\nCONFLICT: "${conflict.location}" appears in ${conflict.contexts.length} contexts:`);
      conflict.contexts.forEach(({ context, keys, count }) => {
        console.log(`  - ${context} (${count} occurrences):`);
        keys.forEach(key => console.log(`    * ${key}`));
      });
    });
  }
  
  // Comprehensive statistics
  console.log('\n=== COMPREHENSIVE STATISTICS ===\n');
  console.log(`Total unique POI keys: ${allPOIKeys.size}`);
  console.log(`Total unique locations: ${allLocations.size}`);
  console.log(`Total unique values: ${allValues.size}`);
  console.log(`Total conflicts found: ${conflicts.length}`);
  
  // List all unique POI keys for reference
  console.log('\n=== ALL UNIQUE POI KEYS ===\n');
  const sortedKeys = Array.from(allPOIKeys).sort();
  sortedKeys.forEach(key => console.log(`  "${key}"`));
  
  // List all unique locations for reference
  console.log('\n=== ALL UNIQUE LOCATIONS ===\n');
  const sortedLocations = Array.from(allLocations).sort();
  sortedLocations.forEach(location => console.log(`  "${location}"`));
  
  // Check current POI mapping coverage
  console.log('\n=== POI MAPPING COVERAGE ANALYSIS ===\n');
  
  // Get current mapping from the actual file
  const currentMappingPath = path.join(__dirname, '..', 'src', 'utils', 'poiLocationMapping.ts');
  const currentMappingContent = fs.readFileSync(currentMappingPath, 'utf8');
  
  // Extract all mapped locations from the current mapping
  const mappedLocations = new Set();
  const mappingMatches = currentMappingContent.matchAll(/layoutLocation:\s*"([^"]+)"/g);
  for (const match of mappingMatches) {
    mappedLocations.add(match[1]);
  }
  
  const missingLocations = [];
  allLocations.forEach(location => {
    if (!mappedLocations.has(location)) {
      missingLocations.push(location);
    }
  });
  
  if (missingLocations.length === 0) {
    console.log('✅ All POI locations are covered in the current mapping.');
  } else {
    console.log(`❌ Found ${missingLocations.length} locations not in current mapping:`);
    missingLocations.forEach(location => {
      console.log(`  - "${location}"`);
    });
  }
  
  return { conflicts, missingLocations, allLocations, allPOIKeys };
}

// Run the analysis
completeAnalysis(); 