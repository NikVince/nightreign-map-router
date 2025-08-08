"use client";
import React, { useState } from "react";
import type { RouteState, POIPriority, CompleteRoute, DayRoute } from "~/types/route";
import { getPOIDisplayName } from "~/utils/poiUtils";
import { RouteCalculator } from "~/utils/routeCalculator";
import { NightfarerClassType, Nightlord, LandmarkType } from "~/types/core";
import { extractPOIsFromLayout, getPOITypeFromValue, getPOIStats } from "~/utils/poiUtils";
import { getPOIData } from "~/utils/poiDataLoader";

interface RouteDebugPanelProps {
  state: RouteState;
  priorityCalculations?: POIPriority[];
  layoutData?: any;
  completeRoute?: CompleteRoute | null;
  isVisible: boolean;
  onClose: () => void;
  debugPriorities?: POIPriority[];
  setDebugPriorities?: (priorities: POIPriority[]) => void;
  teamMembers?: Array<{ id: number; nightfarer: NightfarerClassType; startsWithStoneswordKey: boolean }>;
}

// Function to get POI type name based on ID and layout data
// Now uses centralized utility for consistent naming
const getPOITypeName = (poiId: number, layoutData?: any): string => {
  // Use the centralized utility for consistent POI naming
  return getPOIDisplayName(poiId, layoutData);
};

export function RouteDebugPanel({ 
  state, 
  priorityCalculations = [], 
  layoutData,
  completeRoute,
  isVisible, 
  onClose,
  debugPriorities = [],
  setDebugPriorities = () => {},
  teamMembers = []
}: RouteDebugPanelProps) {
  if (!isVisible) return null;

  // State for collapsible sections
  const [stateCountersExpanded, setStateCountersExpanded] = useState(false);
  const [teamCompositionExpanded, setTeamCompositionExpanded] = useState(false);
  const [day1RouteExpanded, setDay1RouteExpanded] = useState(true);
  const [day2RouteExpanded, setDay2RouteExpanded] = useState(true);
  const [debugModeExpanded, setDebugModeExpanded] = useState(false);

  // Debug mode state
  const [debugMode, setDebugMode] = useState(false);
  const [debugStep, setDebugStep] = useState(0);
  const [debugRoute, setDebugRoute] = useState<number[]>([]);

  // Route calculator instance
  const [routeCalculator] = useState(() => new RouteCalculator({
    runesGained: 0,
    playerLevel: 1,
    stoneswordKeys: 0,
    remainingTime: 15 * 60,
    currentDay: 1,
    teamComposition: [],
    nightlord: Nightlord.Gladius,
    visitedPOIs: [],
  }));

  // Master POI list
  const poiMasterList = getPOIData();

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

      {/* State Counters - Collapsible */}
      <div className="mb-4">
        <button
          onClick={() => setStateCountersExpanded(!stateCountersExpanded)}
          className="flex items-center justify-between w-full font-semibold mb-2 text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          <span>State Counters</span>
          <span className={`transform transition-transform ${stateCountersExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {stateCountersExpanded && (
          <div className="space-y-1 text-base">
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
            <div className="flex justify-between">
              <span>Visited POIs:</span>
              <span className="text-gray-400">{state.visitedPOIs?.length || 0}</span>
            </div>
          </div>
        )}
      </div>

      {/* Team Composition - Collapsible */}
      <div className="mb-4">
        <button
          onClick={() => setTeamCompositionExpanded(!teamCompositionExpanded)}
          className="flex items-center justify-between w-full font-semibold mb-2 text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          <span>Team Composition</span>
          <span className={`transform transition-transform ${teamCompositionExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {teamCompositionExpanded && (
          <div className="space-y-1 text-base">
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
        )}
      </div>

      {/* Day 1 Route - Collapsible */}
      {completeRoute?.day1Route && (
        <div className="mb-4">
          <button
            onClick={() => setDay1RouteExpanded(!day1RouteExpanded)}
            className="flex items-center justify-between w-full font-semibold mb-2 text-red-400 hover:text-red-300 transition-colors"
          >
            <span>Day 1 Route (Red Line)</span>
            <span className={`transform transition-transform ${day1RouteExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
                      {day1RouteExpanded && (
              <div className="space-y-2 text-sm">
              <div className="bg-gray-800 p-2 rounded">
                <div className="flex justify-between">
                  <span>Start POI:</span>
                  <span className="text-red-400">{completeRoute.day1Route.startPOI}</span>
                </div>
                <div className="flex justify-between">
                  <span>End POI:</span>
                  <span className="text-red-400">{completeRoute.day1Route.endPOI}</span>
                </div>
                <div className="flex justify-between">
                  <span>Route Length:</span>
                  <span className="text-red-400">{completeRoute.day1Route.route.length} POIs</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Time:</span>
                  <span className="text-red-400">{formatTime(completeRoute.day1Route.totalTime)}</span>
                </div>
              </div>
              <div className="max-h-32 overflow-y-auto">
                <div className="text-sm text-gray-400 mb-1">Route POIs:</div>
                {completeRoute.day1Route.route.map((poiId, index) => (
                  <div key={poiId} className="text-sm">
                    {index + 1}. POI {poiId}: {getPOITypeName(poiId, layoutData)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Day 2 Route - Collapsible */}
      {completeRoute?.day2Route && (
        <div className="mb-4">
          <button
            onClick={() => setDay2RouteExpanded(!day2RouteExpanded)}
            className="flex items-center justify-between w-full font-semibold mb-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Day 2 Route (Blue Line)</span>
            <span className={`transform transition-transform ${day2RouteExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
                      {day2RouteExpanded && (
              <div className="space-y-2 text-sm">
              <div className="bg-gray-800 p-2 rounded">
                <div className="flex justify-between">
                  <span>Start POI:</span>
                  <span className="text-blue-400">{completeRoute.day2Route.startPOI}</span>
                </div>
                <div className="flex justify-between">
                  <span>End POI:</span>
                  <span className="text-blue-400">{completeRoute.day2Route.endPOI}</span>
                </div>
                <div className="flex justify-between">
                  <span>Route Length:</span>
                  <span className="text-blue-400">{completeRoute.day2Route.route.length} POIs</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Time:</span>
                  <span className="text-blue-400">{formatTime(completeRoute.day2Route.totalTime)}</span>
                </div>
              </div>
              <div className="max-h-32 overflow-y-auto">
                <div className="text-sm text-gray-400 mb-1">Route POIs:</div>
                {completeRoute.day2Route.route.map((poiId, index) => (
                  <div key={poiId} className="text-sm">
                    {index + 1}. POI {poiId}: {getPOITypeName(poiId, layoutData)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Priority Calculations */}
      {priorityCalculations.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2 text-yellow-400">
            Priority Calculations ({priorityCalculations.length})
          </h4>
          <div className="space-y-2 text-sm max-h-96 overflow-y-auto">
            {priorityCalculations.map((priority) => (
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
          </div>
        </div>
      )}

      {/* Debug Mode - Collapsible */}
      <div className="mb-4">
        <button
          onClick={() => setDebugModeExpanded(!debugModeExpanded)}
          className="flex items-center justify-between w-full font-semibold mb-2 text-green-400 hover:text-green-300 transition-colors"
        >
          <span>Step-by-Step Debug Mode</span>
          <span className={`transform transition-transform ${debugModeExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {debugModeExpanded && (
          <div className="space-y-3">
            {!debugMode ? (
              <button
                onClick={() => {
                  // Initialize debug mode
                  const nightlord = layoutData?.Nightlord as Nightlord || Nightlord.Gladius;
                  routeCalculator.initializeState(teamMembers, nightlord, 1);
                  
                  // Extract POI data from the current layout
                  const layoutPOIs = extractPOIsFromLayout(layoutData, poiMasterList).map(poi => ({
                    id: poi.id,
                    type: poi.type as LandmarkType,
                    x: poiMasterList.find(p => p.id === poi.id)?.coordinates[0] || 0,
                    y: poiMasterList.find(p => p.id === poi.id)?.coordinates[1] || 0,
                    estimatedTime: poi.estimatedTime,
                    estimatedRunes: poi.estimatedRunes,
                    location: poi.location,
                    value: poi.value
                  }));
                  
                  routeCalculator.enableDebugMode(layoutPOIs, layoutData);
                  setDebugMode(true);
                  setDebugStep(0);
                  setDebugRoute([]);
                  setDebugPriorities([]);
                }}
                className="w-full px-3 py-2 text-sm bg-green-600 text-white border border-green-500 rounded hover:bg-green-700"
              >
                Enable Debug Mode
              </button>
            ) : (
              <div className="space-y-2">
                <div className="bg-gray-800 p-2 rounded">
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-400">Step:</span>
                    <span>{debugStep}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-400">Route:</span>
                    <span className="text-xs">{debugRoute.join(' → ')}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const result = routeCalculator.executeNextStep();
                      if (result.success) {
                        setDebugStep(prev => prev + 1);
                        if (result.selectedPOI) {
                          setDebugRoute(prev => [...prev, result.selectedPOI!]);
                        }
                        if (result.priorities) {
                          setDebugPriorities(result.priorities);
                        }
                      } else {
                        console.error("Debug step failed:", result.error);
                      }
                    }}
                    className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white border border-blue-500 rounded hover:bg-blue-700"
                  >
                    Next Step
                  </button>
                  
                  <button
                    onClick={() => {
                      routeCalculator.disableDebugMode();
                      setDebugMode(false);
                      setDebugStep(0);
                      setDebugRoute([]);
                      setDebugPriorities([]);
                    }}
                    className="flex-1 px-3 py-1 text-sm bg-red-600 text-white border border-red-500 rounded hover:bg-red-700"
                  >
                    Disable
                  </button>
                </div>
                
                {debugPriorities.length > 0 && (
                  <div className="bg-gray-800 p-2 rounded">
                    <div className="text-sm font-semibold mb-1 text-green-400">Current Priorities:</div>
                    <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
                      {debugPriorities
                        .filter(p => p.adjustedPriority > 0)
                        .sort((a, b) => b.adjustedPriority - a.adjustedPriority)
                        .slice(0, 5)
                        .map(priority => (
                          <div key={priority.poiId} className="flex justify-between">
                            <span>POI {priority.poiId}:</span>
                            <span className={priority.adjustedPriority > 20 ? 'text-green-400' : priority.adjustedPriority > 10 ? 'text-yellow-400' : 'text-red-400'}>
                              {priority.adjustedPriority.toFixed(1)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

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