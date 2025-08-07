// TODO: Centralized POI utilities - single source of truth for POI data
// This file ensures consistent POI ID and type mapping across the entire codebase

import type { POIData } from './poiDataLoader';
import { getPOIIdForLocationWithContext } from './poiLocationMapping';

export interface POITypeInfo {
  id: number;
  type: string;
  name: string;
  location: string;
  value: string;
  estimatedTime: number;
  estimatedRunes: number;
}

/**
 * Determines POI type from layout value string
 * This is the single source of truth for POI type determination
 */
export function getPOITypeFromValue(value: string): string {
  if (value.includes("Ruins")) return "Ruins";
  if (value.includes("Camp")) return "MainEncampment";
  if (value.includes("Fort")) return "Fort";
  if (value.includes("Great Church")) return "GreatChurch";
  if (value.includes("Church")) return "Church";
  if (value.includes("Sorcerer's Rise")) return "SorcerersRise";
  if (value.includes("Township")) return "Township";
  if (value.includes("Evergaol")) return "Evergaol";
  if (value.includes("Field Boss")) return "FieldBoss";
  return "MainEncampment"; // Default
}

/**
 * Gets POI stats based on type and value
 */
export function getPOIStats(type: string, value: string): { estimatedTime: number; estimatedRunes: number } {
  // Base stats by type
  switch (type) {
    case "Ruins":
      return { estimatedTime: 300, estimatedRunes: 8000 };
    case "MainEncampment":
      return { estimatedTime: 300, estimatedRunes: 8000 };
    case "Fort":
      return { estimatedTime: 300, estimatedRunes: 8000 };
    case "GreatChurch":
      return { estimatedTime: 300, estimatedRunes: 8000 };
    case "Church":
      return { estimatedTime: 120, estimatedRunes: 2000 };
    case "SorcerersRise":
      return { estimatedTime: 180, estimatedRunes: 4000 };
    case "Township":
      return { estimatedTime: 120, estimatedRunes: 2000 };
    case "Evergaol":
      return { estimatedTime: 240, estimatedRunes: 12000 };
    case "FieldBoss":
      return { estimatedTime: 180, estimatedRunes: 6000 };
    default:
      return { estimatedTime: 240, estimatedRunes: 4000 };
  }
}

/**
 * Extracts Shifting Earth event POIs based on the current Shifting Earth event
 * This function includes ONLY the actual POIs that exist in the source files
 */
export function extractShiftingEarthPOIs(shiftingEarth: string, poiMasterList: POIData[]): POITypeInfo[] {
  const pois: POITypeInfo[] = [];
  
  if (!shiftingEarth || shiftingEarth === "Default") return pois;
  
  // Crater-specific POIs (Volcanic environment)
  if (shiftingEarth === "Crater") {
    // Crater Church (POI 131) - highest priority
    const churchPOI = poiMasterList.find(p => p.id === 131);
    if (churchPOI) {
      pois.push({
        id: 131,
        type: "Church",
        name: "Crater Church",
        location: "Crater Church",
        value: "Church - Normal",
        estimatedTime: 120,
        estimatedRunes: 2000
      });
    }
    
    // Crater Field Bosses (POIs 132-138)
    const craterBossPOIs = [132, 133, 134, 135, 136, 137, 138];
    for (const poiId of craterBossPOIs) {
      const poi = poiMasterList.find(p => p.id === poiId);
      if (poi) {
        pois.push({
          id: poiId,
          type: "FieldBoss",
          name: `Crater Field Boss ${poiId}`,
          location: `Crater Area`,
          value: `Field Boss - Crater`,
          estimatedTime: 180,
          estimatedRunes: 1500
        });
      }
    }
  }
  
  // Mountaintop-specific POIs (Frozen mountain environment)
  if (shiftingEarth === "Mountaintop") {
    // Mountaintop Major Base (POI 149)
    const majorBasePOI = poiMasterList.find(p => p.id === 149);
    if (majorBasePOI) {
      pois.push({
        id: 149,
        type: "MainEncampment",
        name: "Mountaintop Major Base",
        location: "Mountaintop Major Base",
        value: "Major Base - Mountaintop",
        estimatedTime: 90,
        estimatedRunes: 800
      });
    }
    
    // Mountaintop Field Bosses (POIs 140-147)
    const mountaintopBossPOIs = [140, 141, 142, 143, 144, 145, 146, 147];
    for (const poiId of mountaintopBossPOIs) {
      const poi = poiMasterList.find(p => p.id === poiId);
      if (poi) {
        pois.push({
          id: poiId,
          type: "FieldBoss",
          name: `Mountaintop Field Boss ${poiId}`,
          location: `Mountaintop Area`,
          value: `Field Boss - Mountaintop`,
          estimatedTime: 180,
          estimatedRunes: 1500
        });
      }
    }
  }
  
  // Rotted Woods-specific POIs (Scarlet Rot forest environment)
  if (shiftingEarth === "Rotted Woods") {
    // Rotted Woods POIs (POIs 150-168)
    const rottedWoodsPOIs = [150, 151, 152, 153, 154, 155, 167, 168];
    for (const poiId of rottedWoodsPOIs) {
      const poi = poiMasterList.find(p => p.id === poiId);
      if (poi) {
        pois.push({
          id: poiId,
          type: getPOITypeFromValue(`POI ${poiId}`),
          name: `Rotted Woods POI ${poiId}`,
          location: `Rotted Woods Area`,
          value: `POI ${poiId} - Rotted Woods`,
          estimatedTime: 75,
          estimatedRunes: 600
        });
      }
    }
  }
  
  // Noklateo-specific POIs (Eternal City environment)
  if (shiftingEarth === "Noklateo") {
    // Noklateo Bosses (POIs 123-130)
    const noklateoBossPOIs = [123, 124, 125, 126, 127, 128, 129, 130];
    for (const poiId of noklateoBossPOIs) {
      const poi = poiMasterList.find(p => p.id === poiId);
      if (poi) {
        pois.push({
          id: poiId,
          type: "FieldBoss",
          name: `Noklateo Boss ${poiId}`,
          location: `Noklateo Area`,
          value: `Field Boss - Noklateo`,
          estimatedTime: 200,
          estimatedRunes: 2000
        });
      }
    }
  }
  
  console.log(`Extracted ${pois.length} Shifting Earth POIs for event: ${shiftingEarth}`);
  return pois;
}

/**
 * Extracts POI data from layout data
 * This is the single source of truth for POI extraction from layouts
 */
export function extractPOIsFromLayout(layoutData: any, poiMasterList: POIData[]): POITypeInfo[] {
  const pois: POITypeInfo[] = [];
  
  if (!layoutData) return pois;
  
  // Process Major Base entries
  Object.entries(layoutData).forEach(([key, value]) => {
    if (key.startsWith("Major Base -") && typeof value === 'object' && value !== null && 'location' in value && 'value' in value) {
      const location = (value as any).location;
      const poiValue = (value as any).value;
      
      // Get POI ID from location mapping
      const poiId = getPOIIdForLocationWithContext(key, location);
      if (!poiId) return;
      
      // Get coordinates from master POI list
      const masterPOI = poiMasterList.find(p => p.id === poiId);
      if (!masterPOI) return;
      
      // Determine POI type and rewards based on value
      const poiType = getPOITypeFromValue(poiValue);
      const { estimatedTime, estimatedRunes } = getPOIStats(poiType, poiValue);
      
      pois.push({
        id: poiId,
        type: poiType,
        name: key,
        location,
        value: poiValue,
        estimatedTime,
        estimatedRunes
      });
    }
  });
  
  // Process Minor Base entries
  Object.entries(layoutData).forEach(([key, value]) => {
    if (key.startsWith("Minor Base -") && typeof value === 'object' && value !== null && 'location' in value && 'value' in value) {
      const location = (value as any).location;
      const poiValue = (value as any).value;
      
      // Skip Small Camps (they shouldn't be on the map)
      if (poiValue.includes("Small Camp")) return;
      
      const poiId = getPOIIdForLocationWithContext(key, location);
      if (!poiId) return;
      
      const masterPOI = poiMasterList.find(p => p.id === poiId);
      if (!masterPOI) return;
      
      const poiType = getPOITypeFromValue(poiValue);
      const { estimatedTime, estimatedRunes } = getPOIStats(poiType, poiValue);
      
      pois.push({
        id: poiId,
        type: poiType,
        name: key,
        location,
        value: poiValue,
        estimatedTime,
        estimatedRunes
      });
    }
  });
  
  // Process Evergaol entries
  Object.entries(layoutData).forEach(([key, value]) => {
    if (key.startsWith("Evergaol -") && typeof value === 'object' && value !== null && 'location' in value && 'value' in value) {
      const location = (value as any).location;
      const poiValue = (value as any).value;
      
      const poiId = getPOIIdForLocationWithContext(key, location);
      if (!poiId) return;
      
      const masterPOI = poiMasterList.find(p => p.id === poiId);
      if (!masterPOI) return;
      
      pois.push({
        id: poiId,
        type: "Evergaol",
        name: key,
        location,
        value: poiValue,
        estimatedTime: 240,
        estimatedRunes: 12000
      });
    }
  });
  
  // Process Field Boss entries
  Object.entries(layoutData).forEach(([key, value]) => {
    if (key.startsWith("Field Boss -") && typeof value === 'object' && value !== null && 'location' in value && 'value' in value) {
      const location = (value as any).location;
      const poiValue = (value as any).value;
      
      const poiId = getPOIIdForLocationWithContext(key, location);
      if (!poiId) return;
      
      const masterPOI = poiMasterList.find(p => p.id === poiId);
      if (!masterPOI) return;
      
      pois.push({
        id: poiId,
        type: "FieldBoss",
        name: key,
        location,
        value: poiValue,
        estimatedTime: 180,
        estimatedRunes: 6000
      });
    }
  });
  
  // Add Shifting Earth event POIs
  const shiftingEarth = layoutData["Shifting Earth"] || "Default";
  if (shiftingEarth !== "Default") {
    const shiftingEarthPOIs = extractShiftingEarthPOIs(shiftingEarth, poiMasterList);
    pois.push(...shiftingEarthPOIs);
  }
  
  return pois;
}

/**
 * Gets POI display name for a given POI ID and layout data
 * This ensures consistent naming across the entire application
 */
export function getPOIDisplayName(poiId: number, layoutData?: any): string {
  if (!layoutData) return `POI ${poiId}`;
  
  // Look for the POI in the layout data
  for (const [key, value] of Object.entries(layoutData)) {
    if (typeof value === 'object' && value !== null && 'location' in value && 'value' in value) {
      const location = (value as any).location;
      const poiValue = (value as any).value;
      
      // Get the POI ID for this layout entry
      const layoutPOIId = getPOIIdForLocationWithContext(key, location);
      if (layoutPOIId === poiId) {
        // Return the actual POI value from the layout
        return poiValue;
      }
    }
  }
  
  // If not found in layout, check if it's a Shifting Earth POI
  const shiftingEarth = layoutData["Shifting Earth"] || "Default";
  if (shiftingEarth !== "Default") {
    // Check for known Shifting Earth POIs
    if (shiftingEarth === "Crater" && poiId === 131) {
      return "Church - Normal";
    }
    if (shiftingEarth === "Mountaintop" && poiId === 23) {
      return "Field Boss - Ice Dragon";
    }
  }
  
  return `POI ${poiId}`;
} 