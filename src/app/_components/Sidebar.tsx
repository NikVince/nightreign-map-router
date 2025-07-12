import React from "react";

export type SidebarProps = {
  isOpen: boolean;
  onClose?: () => void;
  mapLayout: string;
  onMapLayoutChange: (layout: string) => void;
};

const MAP_LAYOUT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "the_crater_shifted", label: "The Crater (Shifted)" },
  { value: "the_mountaintop_shifted", label: "The Mountaintop (Shifted)" },
  { value: "the_rotten_woods_shifted", label: "The Rotten Woods (Shifted)" },
  { value: "noklateo_shifted", label: "Noklateo (Shifted)" },
];

export function Sidebar({ isOpen, onClose, mapLayout, onMapLayoutChange }: SidebarProps) {
  if (!isOpen) return null;
  return (
    <aside className="elden-panel flex flex-col h-full flex-1 p-6 bg-[var(--elden-background)]" style={{ fontFamily: "var(--elden-ui-font)" }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl" style={{ color: "var(--elden-accent)" }}>Objectives</h2>
        {onClose && (
          <button className="elden-button px-2 py-1 text-sm sm:hidden" onClick={onClose} aria-label="Close objectives">
            ✕
          </button>
        )}
      </div>
      <div className="mb-4">
        <label htmlFor="map-layout-select" className="block text-sm mb-1 opacity-80">Map Layout:</label>
        <select
          id="map-layout-select"
          className="w-full rounded elden-select px-2 py-1 text-base"
          value={mapLayout}
          onChange={e => onMapLayoutChange(e.target.value)}
        >
          {MAP_LAYOUT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <ul className="flex flex-col gap-3">
        {/* Checklist items will go here */}
        <li className="text-base opacity-60">(Checklist placeholder)</li>
      </ul>
    </aside>
  );
} 