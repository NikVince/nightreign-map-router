"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { LayoutSelector } from "./LayoutSelector";

const MapCanvas = dynamic(() => import("./MapCanvas"), { ssr: false });

export type IconToggles = {
  sitesOfGrace: boolean;
  spiritStreams: boolean;
  spiritHawkTrees: boolean;
  scarabs: boolean;
  buriedTreasures: boolean;
};

export function MainPanel({ iconToggles, onLayoutChange }: { iconToggles: IconToggles; onLayoutChange?: (layoutNumber: number) => void }) {
  const [layoutNumber, setLayoutNumber] = useState(1);

  // Update parent when layout changes
  const handleLayoutChange = (newLayoutNumber: number) => {
    setLayoutNumber(newLayoutNumber);
    onLayoutChange?.(newLayoutNumber);
  };

  return (
    <main className="elden-panel flex-1 flex flex-col h-full w-full" style={{ fontFamily: "var(--elden-ui-font)" }}>
      <div className="w-full h-full flex-1 relative">
        <div className="absolute top-4 right-4 z-10">
          <LayoutSelector 
            onLayoutChange={handleLayoutChange} 
            currentLayout={layoutNumber} 
          />
        </div>
        <MapCanvas 
          iconToggles={iconToggles} 
          layoutNumber={layoutNumber}
        />
      </div>
    </main>
  );
} 