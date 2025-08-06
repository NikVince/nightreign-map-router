import React, { useState } from "react";
import { api } from "~/trpc/react";
import { TeamComposition, type TeamMember } from "./TeamComposition";

export type SidebarProps = {
  isOpen: boolean;
  onClose?: () => void;
  layoutNumber?: number;
  onTeamChange?: (teamMembers: TeamMember[]) => void;
};

export function Sidebar({ isOpen, onClose, layoutNumber, onTeamChange }: SidebarProps) {
  if (!isOpen) return null;

  // State for team composition
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: 1, nightfarer: null, startsWithStoneswordKey: false }
  ]);

  // Fetch layout data if layoutNumber is provided
  const { data: layoutData } = api.poi.getLayout.useQuery(
    { layoutNumber: layoutNumber || 1 },
    { enabled: !!layoutNumber }
  );

  return (
    <aside className="elden-panel flex flex-col h-full flex-1 p-6 bg-[var(--elden-background)]" style={{ fontFamily: "var(--elden-ui-font)" }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl" style={{ color: "var(--elden-accent)" }}>
          {layoutData?.Nightlord ? `Target: ${layoutData.Nightlord}` : "Objectives"}
        </h2>
        {onClose && (
          <button className="elden-button px-2 py-1 text-sm sm:hidden" onClick={onClose} aria-label="Close objectives">
            ✕
          </button>
        )}
      </div>

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
            <div className="font-bold mb-2">Layout {layoutNumber}</div>
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