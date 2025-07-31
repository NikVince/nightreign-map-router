import React from "react";
import { api } from "~/trpc/react";

export type SidebarProps = {
  isOpen: boolean;
  onClose?: () => void;
  iconToggles: {
    sitesOfGrace: boolean;
    spiritStreams: boolean;
    spiritHawkTrees: boolean;
    scarabs: boolean;
    buriedTreasures: boolean;
  };
  onToggleChange: (key: keyof SidebarProps['iconToggles']) => void;
  layoutNumber?: number;
};

export function Sidebar({ isOpen, onClose, iconToggles, onToggleChange, layoutNumber }: SidebarProps) {
  if (!isOpen) return null;

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

      {/* Icon category toggles */}
      <div className="mb-4">
        <label className="block text-sm mb-1 opacity-80">Show Icon Categories:</label>
        <div className="flex flex-col gap-1 pl-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={iconToggles.sitesOfGrace} onChange={() => onToggleChange('sitesOfGrace')} />
            Sites of grace
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={iconToggles.spiritStreams} onChange={() => onToggleChange('spiritStreams')} />
            Spirit streams
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={iconToggles.spiritHawkTrees} onChange={() => onToggleChange('spiritHawkTrees')} />
            Spirit hawk trees
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={iconToggles.scarabs} onChange={() => onToggleChange('scarabs')} />
            Scarabs
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={iconToggles.buriedTreasures} onChange={() => onToggleChange('buriedTreasures')} />
            Buried treasures
          </label>
        </div>
      </div>
      <ul className="flex flex-col gap-3">
        {/* Checklist items will go here */}
        <li className="text-base opacity-60">(Checklist placeholder)</li>
      </ul>
    </aside>
  );
} 