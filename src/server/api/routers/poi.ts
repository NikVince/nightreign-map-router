import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { LandmarkType } from "@prisma/client";
import fs from "fs";
import path from "path";
import { getIconForPOIValue, getIconForPOIWithContext, shouldShowPOI } from "~/utils/poiIconMapping";
import { getPOIIdForLocation, getPOIIdForLocationWithContext, getPOIIdForSpawnLocation, getPOIIdForNightCircleLocation, getPOIIdForMerchantLocation } from "~/utils/poiLocationMapping";

// Helper function to map "Shifting Earth" values to map tile directories
function getMapLayoutFromShiftingEarth(shiftingEarth: string): string {
  switch (shiftingEarth) {
    case "Mountaintop":
      return "the_mountaintop_shifted";
    case "Crater":
      return "the_crater_shifted";
    case "Rotted Woods":
      return "the_rotten_woods_shifted";
    case "Noklateo":
      return "noklateo_shifted";
    case "Default":
    default:
      return "default";
  }
}

export const poiRouter = createTRPCRouter({
  // Get all map patterns (with minimal info)
  allPatterns: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.mapPattern.findMany({
      select: {
        id: true,
        nightlord: true,
        patternIndex: true,
        specialEvents: true,
      },
    });
  }),

  // Get a map pattern by ID, including landmarks
  getPattern: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    return ctx.db.mapPattern.findUnique({
      where: { id: input.id },
      include: {
        patternLandmarks: {
          include: {
            landmark: true,
          },
        },
      },
    });
  }),

  // Get all landmarks (optionally filter by type)
  allLandmarks: publicProcedure.input(z.object({ type: z.string().optional() }).optional()).query(async ({ ctx, input }) => {
    let where = undefined;
    if (input?.type && Object.values(LandmarkType).includes(input.type as LandmarkType)) {
      where = { type: input.type as LandmarkType };
    }
    return ctx.db.landmark.findMany({
      where,
    });
  }),

  // NEW: Get layout data by layout number
  getLayout: publicProcedure.input(z.object({ layoutNumber: z.number().min(1).max(320) })).query(async ({ input }) => {
    try {
      const layoutPath = path.join(process.cwd(), 'reference_material', 'pattern_layouts', `layout_${input.layoutNumber.toString().padStart(3, '0')}.json`);
      const layoutData = JSON.parse(fs.readFileSync(layoutPath, 'utf8'));
      return layoutData;
    } catch (error) {
      throw new Error(`Failed to load layout ${input.layoutNumber}: ${error}`);
    }
  }),

  // NEW: Get dynamic POI data for a specific layout
  getDynamicPOIs: publicProcedure.input(z.object({ 
    layoutNumber: z.number().min(1).max(320),
    mapLayout: z.string().optional().default("default")
  })).query(async ({ input }) => {
    try {
      // Load layout data
      const layoutPath = path.join(process.cwd(), 'reference_material', 'pattern_layouts', `layout_${input.layoutNumber.toString().padStart(3, '0')}.json`);
      const layoutData = JSON.parse(fs.readFileSync(layoutPath, 'utf8'));
      
      // Load master POI coordinates
      const masterPOIPath = path.join(process.cwd(), 'public', 'assets', 'maps', 'poi_coordinates_with_ids.json');
      const masterPOIData = JSON.parse(fs.readFileSync(masterPOIPath, 'utf8'));
      
      // Load map-specific coordinates
      const mapCoordinatePath = path.join(process.cwd(), 'public', 'assets', 'maps', 'coordinates', `${input.mapLayout}_map_layout.json`);
      const mapCoordinateData = JSON.parse(fs.readFileSync(mapCoordinatePath, 'utf8'));
      
      // Process dynamic POIs based on layout data
      const dynamicPOIs = [];
      
      // Extract castle enemy type for POI 159 (central castle)
      let castleEnemyType: string | null = null;
      if (layoutData["Castle - Castle"] && typeof layoutData["Castle - Castle"] === 'object') {
        const castleData = layoutData["Castle - Castle"] as { location: string; value: string };
        castleEnemyType = castleData.value;
      }

      // Collect Evergaol bosses
      const evergaolBosses: { id: number, boss: string }[] = [];
      // Collect Field Bosses
      const fieldBosses: { id: number, boss: string }[] = [];
      // Collect Major Locations
      const majorLocations: { id: number, location: string }[] = [];
      // Collect Night Circles
      const nightCircles: { id: number, boss: string, night: number }[] = [];
      // Collect Sorcerer's Rise locations
      const sorcerersRiseLocations: { id: number, location: string }[] = [];

      // Extract dynamic POI entries from layout data (Major/Minor locations)
      Object.entries(layoutData).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null && 'location' in value && 'value' in value) {
          const location = value.location;
          const poiValue = value.value;
          
          // Skip empty POIs - ensure poiValue is a string
          if (typeof poiValue !== 'string' || !shouldShowPOI(poiValue)) return;
          
          // Ensure location is a string before using it
          if (typeof location !== 'string') return;
          
          // Find the coordinate for this location using the mapping system with context
          const poiId = getPOIIdForLocationWithContext(key, location);
          const masterPOI = poiId ? masterPOIData.find((poi: any) => poi.id === poiId) : null;
          
          if (masterPOI) {
            const icon = getIconForPOIWithContext(key, poiValue, layoutData["Special Event"]);
            // Only add POI if it has a valid icon (skip Small Camps and other unmapped types)
            if (icon) {
              dynamicPOIs.push({
                id: masterPOI.id,
                coordinates: masterPOI.coordinates,
                location: location,
                value: poiValue,
                icon: icon,
                type: key.split(' - ')[0], // Extract type (e.g., "Major Base", "Minor Base", etc.)
              });
              // If this is an Evergaol, add to evergaolBosses
              if (icon === "Evergaol.png") {
                evergaolBosses.push({ id: masterPOI.id, boss: poiValue });
              }
              // If this is a Field Boss, add to fieldBosses
              if (icon === "Field_Boss.png") {
                fieldBosses.push({ id: masterPOI.id, boss: poiValue });
              }
              // If this is a Major Base, add to majorLocations
              if (key.startsWith("Major Base -")) {
                // Remove redundant prefixes like "Ruins -", "Camp -", etc.
                const cleanValue = poiValue.replace(/^(Ruins|Camp|Fort|Great Church|Church|Sorcerer's Rise|Township) - /, '');
                majorLocations.push({ id: masterPOI.id, location: cleanValue });
              }
              // If this is a Sorcerer's Rise, add to sorcerersRiseLocations
              if (poiValue.startsWith("Sorcerer's Rise -")) {
                // Remove the "Sorcerer's Rise -" prefix
                const cleanValue = poiValue.replace(/^Sorcerer's Rise - /, '');
                sorcerersRiseLocations.push({ id: masterPOI.id, location: cleanValue });
              }
            }
          }
        }
      });

      // Handle new POI types with simple string values
      
      // 1. Spawn Point
      if (layoutData["Spawn Point"] && layoutData["Spawn Point"] !== "empty") {
        const spawnLocation = layoutData["Spawn Point"];
        const poiId = getPOIIdForSpawnLocation(spawnLocation);
        const masterPOI = poiId ? masterPOIData.find((poi: any) => poi.id === poiId) : null;
        
        if (masterPOI) {
          dynamicPOIs.push({
            id: masterPOI.id,
            coordinates: masterPOI.coordinates,
            location: spawnLocation,
            value: "Spawn Point",
            icon: "Spawn_Location.png",
            type: "Spawn Point",
          });
        }
      }

      // 2. Night 1 Circle
      if (layoutData["Night 1 Circle"] && layoutData["Night 1 Circle"] !== "empty") {
        const night1Location = layoutData["Night 1 Circle"];
        const poiId = getPOIIdForNightCircleLocation(night1Location);
        const masterPOI = poiId ? masterPOIData.find((poi: any) => poi.id === poiId) : null;
        
        if (masterPOI) {
          const night1Boss = layoutData["Night 1 Boss"] || "Night Boss";
          dynamicPOIs.push({
            id: masterPOI.id,
            coordinates: masterPOI.coordinates,
            location: night1Location,
            value: night1Boss,
            icon: "Night_Location.png", // Using Night_Location icon for night circles
            type: "Night Circle",
          });
          // Add to night circles collection
          nightCircles.push({ id: masterPOI.id, boss: night1Boss, night: 1 });
        }
      }

      // 3. Night 2 Circle
      if (layoutData["Night 2 Circle"] && layoutData["Night 2 Circle"] !== "empty") {
        const night2Location = layoutData["Night 2 Circle"];
        const poiId = getPOIIdForNightCircleLocation(night2Location);
        const masterPOI = poiId ? masterPOIData.find((poi: any) => poi.id === poiId) : null;
        
        if (masterPOI) {
          const night2Boss = layoutData["Night 2 Boss"] || "Night Boss";
          dynamicPOIs.push({
            id: masterPOI.id,
            coordinates: masterPOI.coordinates,
            location: night2Location,
            value: night2Boss,
            icon: "Night_Location.png", // Using Night_Location icon for night circles
            type: "Night Circle",
          });
          // Add to night circles collection
          nightCircles.push({ id: masterPOI.id, boss: night2Boss, night: 2 });
        }
      }

      // 4. Scale-Bearing Merchant
      if (layoutData["Scale-Bearing Merchant"] && layoutData["Scale-Bearing Merchant"] !== "empty") {
        const merchantLocation = layoutData["Scale-Bearing Merchant"];
        const poiId = getPOIIdForMerchantLocation(merchantLocation);
        const masterPOI = poiId ? masterPOIData.find((poi: any) => poi.id === poiId) : null;
        
        if (masterPOI) {
          dynamicPOIs.push({
            id: masterPOI.id,
            coordinates: masterPOI.coordinates,
            location: merchantLocation,
            value: "Scale-Bearing Merchant",
            icon: "Scale_Bearing_Merchant.png",
            type: "Merchant",
          });
        }
      }

      // 5. Frenzy Tower
      if (layoutData["Frenzy Tower"] && layoutData["Frenzy Tower"] !== "empty") {
        const frenzyTowerLocation = layoutData["Frenzy Tower"];
        // Map frenzy tower locations to POI IDs
        const frenzyTowerMapping: { [key: string]: number } = {
          "South": 196, // Frenzy Tower South
          "North": 199,  // Frenzy Tower North
        };
        
        const poiId = frenzyTowerMapping[frenzyTowerLocation];
        const masterPOI = poiId ? masterPOIData.find((poi: any) => poi.id === poiId) : null;
        
        if (masterPOI) {
          dynamicPOIs.push({
            id: masterPOI.id,
            coordinates: masterPOI.coordinates,
            location: frenzyTowerLocation,
            value: "Frenzy Tower",
            icon: "Event.png",
            type: "Frenzy Tower",
          });
        }
      }
      
      const shiftingEarth = layoutData["Shifting Earth"] || "Default";
      const mapLayout = getMapLayoutFromShiftingEarth(shiftingEarth);
      
      return {
        layoutNumber: input.layoutNumber,
        shiftingEarth: shiftingEarth,
        mapLayout: mapLayout,
        dynamicPOIs,
        castleEnemyType, // Add castle enemy type to response
        evergaolBosses, // Add evergaol bosses to response
        fieldBosses, // Add field bosses to response
        majorLocations, // Add major locations to response
        nightCircles, // Add night circles to response
        sorcerersRiseLocations, // Add sorcerer's rise locations to response
        layoutData
      };
    } catch (error) {
      throw new Error(`Failed to load dynamic POIs for layout ${input.layoutNumber}: ${error}`);
    }
  }),
}); 