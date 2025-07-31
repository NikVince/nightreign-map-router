#!/usr/bin/env node
// @ts-nocheck

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to extract all location names and their contexts from a layout file
function extractLocationContexts(layoutData) {
  const contexts = [];
  
  // Extract from Major Base entries
  Object.keys(layoutData).forEach(key => {
    if (key.startsWith('Major Base - ') && typeof layoutData[key] === 'object') {
      const location = layoutData[key].location;
      if (location) {
        contexts.push({ context: 'Major Base', location, key });
      }
    }
  });
  
  // Extract from Minor Base entries
  Object.keys(layoutData).forEach(key => {
    if (key.startsWith('Minor Base - ') && typeof layoutData[key] === 'object') {
      const location = layoutData[key].location;
      if (location) {
        contexts.push({ context: 'Minor Base', location, key });
      }
    }
  });
  
  // Extract from Evergaol entries
  Object.keys(layoutData).forEach(key => {
    if (key.startsWith('Evergaol - ') && typeof layoutData[key] === 'object') {
      const location = layoutData[key].location;
      if (location) {
        contexts.push({ context: 'Evergaol', location, key });
      }
    }
  });
  
  // Extract from Field Boss entries
  Object.keys(layoutData).forEach(key => {
    if (key.startsWith('Field Boss - ') && typeof layoutData[key] === 'object') {
      const location = layoutData[key].location;
      if (location) {
        contexts.push({ context: 'Field Boss', location, key });
      }
    }
  });
  
  // Extract from Arena Boss entries
  Object.keys(layoutData).forEach(key => {
    if (key.startsWith('Arena Boss - ') && typeof layoutData[key] === 'object') {
      const location = layoutData[key].location;
      if (location) {
        contexts.push({ context: 'Arena Boss', location, key });
      }
    }
  });
  
  return contexts;
}

// Function to analyze all layout files comprehensively
function comprehensiveAnalysis() {
  const layoutsDir = path.join(__dirname, '..', 'reference_material', 'pattern_layouts');
  const layoutFiles = fs.readdirSync(layoutsDir).filter(file => file.endsWith('.json'));
  
  console.log(`Comprehensive analysis of ${layoutFiles.length} layout files...`);
  
  // Track all location-context combinations
  const locationContextMap = new Map(); // location -> Map(context -> count)
  
  layoutFiles.forEach(file => {
    try {
      const layoutPath = path.join(layoutsDir, file);
      const layoutData = JSON.parse(fs.readFileSync(layoutPath, 'utf8'));
      const contexts = extractLocationContexts(layoutData);
      
      contexts.forEach(({ context, location }) => {
        if (!locationContextMap.has(location)) {
          locationContextMap.set(location, new Map());
        }
        
        const contextMap = locationContextMap.get(location);
        contextMap.set(context, (contextMap.get(context) || 0) + 1);
      });
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  });
  
  // Find all conflicts
  console.log('\n=== COMPREHENSIVE POI CONFLICT ANALYSIS ===\n');
  
  const conflicts = [];
  locationContextMap.forEach((contextMap, location) => {
    if (contextMap.size > 1) {
      conflicts.push({
        location,
        contexts: Array.from(contextMap.entries()).map(([context, count]) => ({ context, count }))
      });
    }
  });
  
  if (conflicts.length === 0) {
    console.log('✅ No conflicts found! All POI locations are unique within their contexts.');
  } else {
    console.log(`❌ Found ${conflicts.length} conflicts:`);
    conflicts.forEach(conflict => {
      console.log(`\nCONFLICT: "${conflict.location}" appears in ${conflict.contexts.length} contexts:`);
      conflict.contexts.forEach(({ context, count }) => {
        console.log(`  - ${context} (${count} occurrences)`);
      });
    });
  }
  
  // Check current POI mapping coverage
  console.log('\n=== POI MAPPING COVERAGE ANALYSIS ===\n');
  
  const currentMapping = new Set([
    'South Lake', 'Groveside', 'Gatefront', 'Stormhill North of Gate', 'Alexander Spot',
    'Northwest Stormhill', 'Northeast Stormhill', 'South Mistwood', 'Waypoint Ruins',
    'Minor Erdtree', 'West Mistwood', 'Northwest Mistwood', 'Artist\'s Shack',
    'Northeast Mistwood', 'Summonwater Approach', 'Summonwater', 'Far Southwest',
    'Lake', 'Stormhill South of Gate', 'Above Stormhill Tunnel Entrance',
    'West of Warmaster\'s Shack', 'Southeast of Lake', 'East of Cavalry Bridge',
    'Below Summonwater Hawk', 'Third Church', 'Northeast of Saintsbridge',
    'Northwest of Lake', 'Murkwater Terminus', 'Stormhill', 'Highroad', 'East of Lake',
    'Mistwood', 'Northeast Tunnel Entrance', 'Far Southwest of Lake', 'Lake Field Boss',
    'North of Stormhill Tunnel Entrance', 'North of Murkwater Terminus', 'Stormhill Spectral Hawk',
    'Northwest Stormhill Cliffside', 'Mistwood Spectral Hawk', 'North Mistwood',
    'East of Murkwater Terminus', 'Northwest of Summonwater', 'Castle Basement',
    'Castle Rooftop', 'Southwest', 'Southeast', 'Center West', 'Center East',
    'Far Northwest', 'Northwest', 'Northeast', 'Far Northeast'
  ]);
  
  const allLocations = new Set();
  locationContextMap.forEach((contextMap, location) => {
    allLocations.add(location);
  });
  
  const missingLocations = [];
  allLocations.forEach(location => {
    if (!currentMapping.has(location)) {
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
  
  return { conflicts, missingLocations };
}

// Run the analysis
comprehensiveAnalysis(); 