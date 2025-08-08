"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { MapOptionsDropdown } from "./MapOptionsDropdown";
import { RouteDebugPanel } from "./RouteDebugPanel";
import type { RouteState, POIPriority, CompleteRoute } from "~/types/route";
import { api } from "~/trpc/react";

const MapCanvas = dynamic(() => import("./MapCanvas"), { ssr: false });

export type IconToggles = {
  sitesOfGrace: boolean;
  spiritStreams: boolean;
  spiritHawkTrees: boolean;
  scarabs: boolean;
  buriedTreasures: boolean;
};

export function MainPanel({ 
  iconToggles, 
  onLayoutChange, 
  onIconToggleChange,
  layoutNumber = 1,
  routeState,
  priorityCalculations,
  completeRoute,
  debugPriorities = [],
}: { 
  iconToggles: IconToggles; 
  onLayoutChange?: (layoutNumber: number) => void;
  onIconToggleChange?: (key: string, value: boolean) => void;
  layoutNumber?: number;
  routeState?: RouteState | null;
  priorityCalculations?: POIPriority[];
  completeRoute?: CompleteRoute | null;
  debugPriorities?: POIPriority[];
}) {
  const [showIcons, setShowIcons] = useState(true);
  const [showTitles, setShowTitles] = useState(true);
  const [showNumbers, setShowNumbers] = useState(false);
  const [showDebugScores, setShowDebugScores] = useState(false);
  
  // Route debug state
  const [debugPanelVisible, setDebugPanelVisible] = useState(false);

  // Fetch layout data if layoutNumber is provided
  const { data: layoutData } = api.poi.getLayout.useQuery(
    { layoutNumber: layoutNumber || 1 },
    { enabled: !!layoutNumber }
  );

  return (
    <main className="elden-panel flex-1 flex flex-col h-full w-full" style={{ fontFamily: "var(--elden-ui-font)" }}>
      <div className="w-full h-full flex-1 relative">
        <MapOptionsDropdown
          showIcons={showIcons}
          setShowIcons={setShowIcons}
          showTitles={showTitles}
          setShowTitles={setShowTitles}
          showNumbers={showNumbers}
          setShowNumbers={setShowNumbers}
          showDebugScores={showDebugScores}
          setShowDebugScores={setShowDebugScores}
          iconToggles={iconToggles}
          onIconToggleChange={onIconToggleChange || (() => {})}
        />
        
        {/* Route Debug Dropdown */}
        <div className="absolute top-4 right-4 z-20">
          <div className="relative">
            <button
              onClick={() => setDebugPanelVisible(!debugPanelVisible)}
              className="px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded hover:bg-gray-700 flex items-center gap-2"
            >
              <span>Route Debug</span>
              <span className={`transform transition-transform ${debugPanelVisible ? 'rotate-180' : ''}`}>▼</span>
            </button>
            
            {debugPanelVisible && (
              <div className="absolute top-full right-0 mt-2 p-4 bg-black bg-opacity-90 border border-gray-600 rounded min-w-[320px] backdrop-blur-sm max-h-[80vh] overflow-y-auto">
                <RouteDebugPanel
                  state={routeState || {
                    runesGained: 0,
                    playerLevel: 1,
                    stoneswordKeys: 0,
                    remainingTime: 15 * 60,
                    currentDay: 1,
                    teamComposition: [],
                    nightlord: "Gladius" as any,
                    visitedPOIs: [],
                  }}
                  priorityCalculations={priorityCalculations || []}
                  layoutData={layoutData}
                  completeRoute={completeRoute}
                  isVisible={true}
                  onClose={() => setDebugPanelVisible(false)}
                />
              </div>
            )}
          </div>
        </div>
        
        <MapCanvas 
          iconToggles={iconToggles} 
          layoutNumber={layoutNumber}
          showIcons={showIcons}
          setShowIcons={setShowIcons}
          showTitles={showTitles}
          setShowTitles={setShowTitles}
          showNumbers={showNumbers}
          setShowNumbers={setShowNumbers}
          showDebugScores={showDebugScores}
          setShowDebugScores={setShowDebugScores}
          day1Route={completeRoute?.day1Route?.route || []}
          day2Route={completeRoute?.day2Route?.route || []}
          debugPriorities={debugPriorities}
        />
      </div>
    </main>
  );
} 