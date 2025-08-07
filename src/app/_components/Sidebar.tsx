import React, { useState } from "react";
import { api } from "~/trpc/react";
import { TeamComposition, type TeamMember } from "./TeamComposition";
import { RouteCalculator } from "~/utils/routeCalculator";
import type { RouteState, POIPriority, CompleteRoute } from "~/types/route";
import { NightfarerClassType, Nightlord, LandmarkType } from "~/types/core";
import { getPOIIdForLocationWithContext } from "~/utils/poiLocationMapping";
import { getPOIData } from "~/utils/poiDataLoader";
import { extractPOIsFromLayout } from "~/utils/poiUtils";

// TODO: Add state reset when seed changes (clear route, remove line, reset calculations)
// TODO: Fix stonesword keys counter to update only on team member toggle changes
// TODO: Ensure route calculation uses only POIs present in current layout

// Master POI list from coordinate file - now using all 213 POIs
const poiMasterList = getPOIData();

export type SidebarProps = {
  isOpen: boolean;
  onClose?: () => void;
  layoutNumber?: number;
  onLayoutChange?: (layoutNumber: number) => void;
  onTeamChange?: (teamMembers: TeamMember[]) => void;
  routeState?: RouteState | null;
  setRouteState?: (state: RouteState | null) => void;
  priorityCalculations?: POIPriority[];
  setPriorityCalculations?: (calculations: POIPriority[]) => void;
  completeRoute?: CompleteRoute | null;
  setCompleteRoute?: (route: CompleteRoute | null) => void;
};

export function Sidebar({ 
  isOpen, 
  onClose, 
  layoutNumber, 
  onLayoutChange, 
  onTeamChange,
  routeState,
  setRouteState,
  priorityCalculations,
  setPriorityCalculations,
  completeRoute,
  setCompleteRoute
}: SidebarProps) {
  if (!isOpen) return null;

  // State for team composition
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: 1, nightfarer: NightfarerClassType.Wylder, startsWithStoneswordKey: false }
  ]);

  // State for layout selection
  const [inputValue, setInputValue] = useState((layoutNumber || 1).toString());

  // Route calculation state
  const [routeCalculator] = useState(() => new RouteCalculator({
    runesGained: 0,
    playerLevel: 1,
    stoneswordKeys: 0,
    remainingTime: 15 * 60, // 15 minutes
    currentDay: 1,
    teamComposition: [],
    nightlord: Nightlord.Gladius,
    visitedPOIs: [],
  }));

  // Route calculation state - use props if available, otherwise local state
  const [localCurrentState, setLocalCurrentState] = useState<RouteState>(routeCalculator.getCurrentState());
  const [localPriorityCalculations, setLocalPriorityCalculations] = useState<POIPriority[]>([]);
  
  const currentState = routeState || localCurrentState;
  const currentPriorityCalculations = priorityCalculations || localPriorityCalculations;

  const handleLayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLayoutNumber = parseInt(inputValue);
    if (newLayoutNumber >= 1 && newLayoutNumber <= 320) {
      onLayoutChange?.(newLayoutNumber);
    }
  };

  // Fetch layout data if layoutNumber is provided
  const { data: layoutData } = api.poi.getLayout.useQuery(
    { layoutNumber: layoutNumber || 1 },
    { enabled: !!layoutNumber }
  );

  return (
    <aside className="elden-panel flex flex-col h-full flex-1 p-6 bg-[var(--elden-background)] overflow-y-auto" style={{ fontFamily: "var(--elden-ui-font)" }}>
      {/* Layout Selection */}
      <div className="mb-4">
        <form onSubmit={handleLayoutSubmit} className="flex items-center gap-2">
          <span className="text-lg font-semibold" style={{ color: "var(--elden-accent)" }}>
            Seed
          </span>
          <input
            type="number"
            min="1"
            max="320"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 px-2 py-1 text-base bg-gray-700 text-white border border-gray-600 rounded"
            placeholder="1-320"
            style={{ fontSize: '16px' }}
          />
          <button
            type="submit"
            className="px-3 py-1 text-sm bg-blue-600 text-white border border-blue-500 rounded hover:bg-blue-700"
          >
            Load
          </button>
          {onClose && (
            <button className="elden-button px-2 py-1 text-sm sm:hidden" onClick={onClose} aria-label="Close objectives">
              ✕
            </button>
          )}
        </form>
      </div>

      {/* Team Composition */}
      <TeamComposition 
        teamMembers={teamMembers}
        onTeamChange={(updatedTeam) => {
          setTeamMembers(updatedTeam);
          onTeamChange?.(updatedTeam);
        }}
        onCalculateRoute={() => {
          // Initialize route calculator with current state
          const nightlord = layoutData?.Nightlord as Nightlord || Nightlord.Gladius;
          routeCalculator.initializeState(teamMembers, nightlord, 1);
          
          // Extract POI data from the current layout using centralized utility
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
          
          console.log("Layout POIs extracted:", layoutPOIs);
          
          // Calculate complete route (both day 1 and day 2) using layout POIs
          const result = routeCalculator.calculateCompleteRoute(layoutPOIs, layoutData);
          
          // Update route state
          const newState = routeCalculator.getCurrentState();
          const newPriorityCalculations = result.debugInfo?.priorityCalculations || [];
          const calculatedCompleteRoute = result.route;
          
          // CRITICAL: Validate synchronization between route and priority calculations
          console.log("=== ROUTE SYNCHRONIZATION VALIDATION ===");
          console.log("Priority calculations count:", newPriorityCalculations.length);
          console.log("Day 1 route count:", calculatedCompleteRoute?.day1Route?.route?.length || 0);
          console.log("Day 2 route count:", calculatedCompleteRoute?.day2Route?.route?.length || 0);
          
          if (calculatedCompleteRoute) {
            console.log("Day 1 route POIs:", calculatedCompleteRoute.day1Route.route);
            console.log("Day 2 route POIs:", calculatedCompleteRoute.day2Route.route);
          }
          console.log("=== END VALIDATION ===");
          
          // Add the calculated route to the state
          const stateWithRoute = {
            ...newState,
            calculatedRoute: calculatedCompleteRoute?.day1Route?.route || []
          };
          
          if (setRouteState) {
            setRouteState(stateWithRoute);
          } else {
            setLocalCurrentState(stateWithRoute);
          }
          
          if (setPriorityCalculations) {
            setPriorityCalculations(newPriorityCalculations);
          } else {
            setLocalPriorityCalculations(newPriorityCalculations);
          }

          if (setCompleteRoute) {
            setCompleteRoute(calculatedCompleteRoute || null);
          }
          
          console.log("Route calculation result:", result);
          console.log("Calculated complete route:", calculatedCompleteRoute);
          console.log("State with route:", stateWithRoute);
        }}
      />

      {/* Layout Information */}
      {layoutData && (
        <div className="mb-4 p-3 bg-black bg-opacity-75 rounded">
          <div className="text-sm">
            {layoutData.Nightlord && (
              <div className="font-bold mb-2 text-base" style={{ color: "var(--elden-accent)" }}>
                Target: {layoutData.Nightlord}
              </div>
            )}
            {layoutData["Special Event"] && layoutData["Special Event"] !== "empty" && (
              <div className="mb-1">
                <span className="text-yellow-400">Event:</span> {
                  layoutData["Special Event"].includes("Frenzy Tower") 
                    ? "Frenzy Tower" 
                    : layoutData["Special Event"]
                }
              </div>
            )}
            {layoutData["Night 1 Boss"] && layoutData["Night 1 Boss"] !== "empty" && (
              <div className="mb-1">
                <span className="text-red-400">Night 1:</span> {layoutData["Night 1 Boss"]}
              </div>
            )}
            {layoutData["Night 2 Boss"] && layoutData["Night 2 Boss"] !== "empty" && (
              <div className="mb-1">
                <span className="text-red-400">Night 2:</span> {layoutData["Night 2 Boss"]}
              </div>
            )}
            {layoutData["Extra Night Boss"] && layoutData["Extra Night Boss"] !== "empty" && (
              <div className="mb-1">
                <span className="text-orange-400">Extra Night:</span> {layoutData["Extra Night Boss"]}
              </div>
            )}
            {(!layoutData["Special Event"] || layoutData["Special Event"] === "empty") && 
             (!layoutData["Night 1 Boss"] || layoutData["Night 1 Boss"] === "empty") && 
             (!layoutData["Night 2 Boss"] || layoutData["Night 2 Boss"] === "empty") && 
             (!layoutData["Extra Night Boss"] || layoutData["Extra Night Boss"] === "empty") && (
              <div className="text-gray-400">No special events</div>
            )}
          </div>
        </div>
      )}

      {/* Route Information */}
      {completeRoute && (
        <div className="mb-4 p-3 bg-black bg-opacity-75 rounded">
          <div className="text-sm">
            <div className="font-bold mb-2 text-base" style={{ color: "var(--elden-accent)" }}>
              Calculated Route
            </div>
            <div className="mb-2">
              <span className="text-red-400">Day 1:</span> {completeRoute.day1Route.route.length} POIs
              <br />
              <span className="text-blue-400">Day 2:</span> {completeRoute.day2Route.route.length} POIs
            </div>
            <div className="text-xs text-gray-400">
              Total Time: {Math.floor(completeRoute.totalTime / 60)}:{(completeRoute.totalTime % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {/* Checklist items will go here */}
        
      </ul>
    </aside>
  );
} 