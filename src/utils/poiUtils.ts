// TODO: Centralized POI utilities - single source of truth for POI data
// This file ensures consistent POI ID and type mapping across the entire codebase

import type { POIData } from './poiDataLoader';

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
  
  // Fallback if not found in layout
  return `POI ${poiId}`;
}

// Import the location mapping function
import { getPOIIdForLocationWithContext } from './poiLocationMapping'; 