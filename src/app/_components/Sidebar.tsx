import React, { useState } from "react";
import { api } from "~/trpc/react";
import { TeamComposition, type TeamMember } from "./TeamComposition";
import { NightfarerClassType } from "~/types/core";

export type SidebarProps = {
  isOpen: boolean;
  onClose?: () => void;
  layoutNumber?: number;
  onLayoutChange?: (layoutNumber: number) => void;
  onTeamChange?: (teamMembers: TeamMember[]) => void;
};

export function Sidebar({ isOpen, onClose, layoutNumber, onLayoutChange, onTeamChange }: SidebarProps) {
  if (!isOpen) return null;

  // State for team composition
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: 1, nightfarer: NightfarerClassType.Wylder, startsWithStoneswordKey: false }
  ]);

  // State for layout selection
  const [inputValue, setInputValue] = useState((layoutNumber || 1).toString());

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
    <aside className="elden-panel flex flex-col h-full flex-1 p-6 bg-[var(--elden-background)]" style={{ fontFamily: "var(--elden-ui-font)" }}>
      {/* Layout Selection */}
      <div className="mb-4">
        <form onSubmit={handleLayoutSubmit} className="flex items-center gap-2">
          <span className="text-lg font-semibold" style={{ color: "var(--elden-accent)" }}>
            Map Layout (Seed)
          </span>
          <input
            type="number"
            min="1"
            max="320"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 px-2 py-1 text-sm bg-gray-700 text-white border border-gray-600 rounded"
            placeholder="1-320"
          />
          <button
            type="submit"
            className="px-3 py-1 text-sm bg-blue-600 text-white border border-blue-500 rounded hover:bg-blue-700"
          >
            Load
          </button>
        </form>
      </div>

      {onClose && (
        <div className="flex justify-end mb-4">
          <button className="elden-button px-2 py-1 text-sm sm:hidden" onClick={onClose} aria-label="Close objectives">
            ✕
          </button>
        </div>
      )}

      {/* Team Composition */}
      <TeamComposition 
        teamMembers={teamMembers}
        onTeamChange={(updatedTeam) => {
          setTeamMembers(updatedTeam);
          onTeamChange?.(updatedTeam);
        }}
        onCalculateRoute={() => {
          // TODO: Implement route calculation logic
          console.log("Calculate Route clicked - placeholder for now");
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


      <ul className="flex flex-col gap-3">
        {/* Checklist items will go here */}
        
      </ul>
    </aside>
  );
} 