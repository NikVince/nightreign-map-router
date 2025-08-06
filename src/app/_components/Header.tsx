import React from "react";

export function Header({ 
  onOpenObjectives
}: { 
  onOpenObjectives?: () => void;
}) {
  return (
    <header className="elden-panel w-full flex items-center justify-between px-4 py-3 sm:px-8 sm:py-4 fixed top-0 left-0 z-50" style={{ fontFamily: "var(--elden-title-font)", background: '#141414' }}>
      <div className="flex items-center gap-2">
        {onOpenObjectives && (
          <button
            className="elden-button px-3 py-2 sm:hidden mr-2"
            onClick={onOpenObjectives}
            aria-label="Open objectives"
          >
            ☰
          </button>
        )}
        <h1 className="text-2xl sm:text-3xl tracking-wide" style={{ color: "var(--elden-primary)" }}>
          Nightreign Router
        </h1>
      </div>
      <nav>{/* Navigation links will go here */}</nav>
    </header>
  );
} 