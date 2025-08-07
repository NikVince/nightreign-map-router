"use client";
import React from "react";
import type { RouteState, POIPriority } from "~/types/route";

interface RouteDebugPanelProps {
  state: RouteState;
  priorityCalculations?: POIPriority[];
  layoutData?: any;
  isVisible: boolean;
  onClose: () => void;
}

// Function to get POI type name based on ID and layout data
const getPOITypeName = (poiId: number, layoutData?: any): string => {
  if (!layoutData) {
    return `POI ${poiId}`;
  }

  // Check for hardcoded titles based on map layout (from MapCanvas.tsx)
  const effectiveMapLayout = layoutData["Shifting Earth"] || "default";
  
  // Hardcoded titles for mountaintops field bosses and major locations
  const mountaintopsHardcodedTitles: Record<number, string> = {
    140: "Flying Dragon",
    141: "Mountaintop Ice Dragon",
    142: "Mountaintop Ice Dragon", 
    143: "Demi-Human Swordmaster",
    144: "Giant Crows",
    145: "Mountaintop Ice Dragon",
    146: "Demi-Human Swordmaster",
    147: "Mountaintop Ice Dragon",
    148: "Snowfield Trolls",
    149: "Albinauric Archers"
  };
  
  // Hardcoded titles for crater field bosses and special cases
  const craterHardcodedTitles: Record<number, string> = {
    132: "Red Wolf",
    133: "Demi-Human Queen",
    134: "Fire Prelates",
    135: "Demi-Human Queen",
    136: "Magma Wyrm",
    137: "Fallingstar Beast",
    138: "Valiant Gargoyle",
    91: "Flying Dragon"
  };
  
  // Hardcoded titles for noklateo field bosses and special cases
  const noklateoHardcodedTitles: Record<number, string> = {
    123: "Royal Carian Knight",
    124: "Flying Dragon",
    125: "Black Knife Assassin",
    126: "Headless Troll",
    127: "Dragonkin Soldier",
    128: "Royal Revenant",
    129: "Black Knife Assassin",
    130: "Astel",
    23: "Golden Hippopotamus"
  };
  
  // Hardcoded titles for rotten woods special cases
  const rottenWoodsHardcodedTitles: Record<number, string> = {
    156: "Lordsworn Captain"
  };

  // Check for hardcoded titles based on map layout
  let hardcodedTitle: string | undefined;
  
  if (effectiveMapLayout === "Mountaintop" && mountaintopsHardcodedTitles[poiId]) {
    hardcodedTitle = mountaintopsHardcodedTitles[poiId];
  } else if (effectiveMapLayout === "Crater" && craterHardcodedTitles[poiId]) {
    hardcodedTitle = craterHardcodedTitles[poiId];
  } else if (effectiveMapLayout === "Noklateo" && noklateoHardcodedTitles[poiId]) {
    hardcodedTitle = noklateoHardcodedTitles[poiId];
  } else if (effectiveMapLayout === "Rotted Woods" && rottenWoodsHardcodedTitles[poiId]) {
    hardcodedTitle = rottenWoodsHardcodedTitles[poiId];
  }

  if (hardcodedTitle) {
    return hardcodedTitle;
  }

  // Check for dynamic POI data from layout
  if (layoutData) {
    // Look for POI data in layout entries
    for (const [key, value] of Object.entries(layoutData)) {
      if (typeof value === 'object' && value !== null && 'location' in value && 'value' in value) {
        const poiValue = (value as any).value;
        const location = (value as any).location;
        
        if (typeof poiValue === 'string' && poiValue !== 'empty' && typeof location === 'string') {
          // Try to find if this location corresponds to our POI ID
          // This is a simplified approach - we'll check if the location name contains any clues
          // In a full implementation, you'd use the POI location mapping system
          
          // Check for common patterns
          if (poiId === 159 && key.includes("Castle")) {
            return `Castle - ${poiValue}`;
          }
          
          // Check for major bases
          if (key.startsWith("Major Base -") && poiValue.includes("Ruins -")) {
            return poiValue;
          }
          
          // Check for evergaols
          if (key.startsWith("Evergaol -") || poiValue.includes("Evergaol")) {
            return `Evergaol - ${poiValue}`;
          }
          
          // Check for field bosses
          if (key.startsWith("Field Boss -") || poiValue.includes("Field Boss")) {
            return `Field Boss - ${poiValue}`;
          }
          
          // Check for churches
          if (poiValue.includes("Church")) {
            return poiValue;
          }
          
          // Check for forts
          if (poiValue.includes("Fort")) {
            return poiValue;
          }
          
          // Check for great churches
          if (poiValue.includes("Great Church")) {
            return poiValue;
          }
          
          // Check for ruins
          if (poiValue.includes("Ruins")) {
            return poiValue;
          }
          
          // Check for camps
          if (poiValue.includes("Camp")) {
            return poiValue;
          }
        }
      }
    }
  }

  // Fallback based on POI ID ranges (from poi_coordinates_with_ids.json analysis)
  if (poiId === 159) {
    return "Castle - Main Castle";
  } else if (poiId >= 1 && poiId <= 50) {
    return "Church/Fort/Great Church";
  } else if (poiId >= 51 && poiId <= 100) {
    return "Ruins/Main Encampment";
  } else if (poiId >= 101 && poiId <= 150) {
    return "Field Boss/Evergaol";
  } else if (poiId >= 151 && poiId <= 200) {
    return "Special Location";
  } else {
    return `POI ${poiId}`;
  }
};

export function RouteDebugPanel({ 
  state, 
  priorityCalculations = [], 
  layoutData,
  isVisible, 
  onClose 
}: RouteDebugPanelProps) {
  if (!isVisible) return null;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-bold" style={{ color: "var(--elden-accent)" }}>
          Route Debug Panel
        </h3>
      </div>

      {/* State Counters */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2 text-yellow-400">State Counters</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Runes Gained:</span>
            <span className="text-green-400">{state.runesGained.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Player Level:</span>
            <span className="text-blue-400">{state.playerLevel}</span>
          </div>
          <div className="flex justify-between">
            <span>Stonesword Keys:</span>
            <span className="text-purple-400">{state.stoneswordKeys}</span>
          </div>
          <div className="flex justify-between">
            <span>Remaining Time:</span>
            <span className="text-red-400">{formatTime(state.remainingTime)}</span>
          </div>
          <div className="flex justify-between">
            <span>Current Day:</span>
            <span className="text-orange-400">{state.currentDay}</span>
          </div>
          <div className="flex justify-between">
            <span>Team Size:</span>
            <span className="text-cyan-400">{state.teamComposition.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Nightlord:</span>
            <span className="text-pink-400">{state.nightlord}</span>
          </div>
        </div>
      </div>

      {/* Visited POIs */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2 text-yellow-400">Visited POIs</h4>
        <div className="text-sm">
          {state.visitedPOIs.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {state.visitedPOIs.map((poiId, index) => (
                <span
                  key={poiId}
                  className="px-2 py-1 bg-gray-700 rounded text-xs"
                >
                  {poiId}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">None</span>
          )}
        </div>
      </div>

      {/* Team Composition */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2 text-yellow-400">Team Composition</h4>
        <div className="space-y-1 text-sm">
          {state.teamComposition.map((member, index) => (
            <div key={member.id} className="flex justify-between">
              <span>Player {member.id}:</span>
              <span className="text-cyan-400">
                {member.nightfarer || "None"}
                {member.startsWithStoneswordKey && " 🔑"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Calculations */}
      {priorityCalculations.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2 text-yellow-400">
            Priority Calculations ({priorityCalculations.length})
          </h4>
          <div className="space-y-2 text-xs max-h-32 overflow-y-auto">
            {priorityCalculations.slice(0, 5).map((priority) => (
              <div key={priority.poiId} className="bg-gray-800 p-2 rounded">
                <div className="flex justify-between">
                  <span>POI {priority.poiId}: {getPOITypeName(priority.poiId, layoutData)}</span>
                  <span className="text-green-400">{priority.adjustedPriority}</span>
                </div>
                <div className="text-gray-400">
                  Base: {priority.basePriority} | Time: {priority.estimatedTime}s
                </div>
              </div>
            ))}
            {priorityCalculations.length > 5 && (
              <div className="text-gray-400 text-center">
                +{priorityCalculations.length - 5} more...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reset Button */}
      <div className="text-center">
        <button
          onClick={() => {
            // TODO: Implement state reset functionality
            console.log("Reset state clicked");
          }}
          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Reset State
        </button>
      </div>
    </div>
  );
} 