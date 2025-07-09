import React from "react";

export type SidebarProps = {
  isOpen: boolean;
  onClose?: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  if (!isOpen) return null;
  return (
    <aside className="elden-panel flex flex-col w-72 min-h-0 p-6 mr-4 fixed inset-y-0 left-0 z-40 sm:static sm:mr-4 sm:w-72 bg-[var(--elden-background)]" style={{ fontFamily: "var(--elden-ui-font)" }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl" style={{ color: "var(--elden-accent)" }}>Objectives</h2>
        {onClose && (
          <button className="elden-button px-2 py-1 text-sm sm:hidden" onClick={onClose} aria-label="Close objectives">
            ✕
          </button>
        )}
      </div>
      <ul className="flex flex-col gap-3">
        {/* Checklist items will go here */}
        <li className="text-base opacity-60">(Checklist placeholder)</li>
      </ul>
    </aside>
  );
} 