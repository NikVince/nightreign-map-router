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

export function MainPanel({ mapLayout, iconToggles }: { mapLayout: string, iconToggles: IconToggles }) {
  const [layoutNumber, setLayoutNumber] = useState(1);

  return (
    <main className="elden-panel flex-1 flex flex-col h-full w-full" style={{ fontFamily: "var(--elden-ui-font)" }}>
      <div className="w-full h-full flex-1 relative">
        <div className="absolute top-4 right-4 z-10">
          <LayoutSelector 
            onLayoutChange={setLayoutNumber} 
            currentLayout={layoutNumber} 
          />
        </div>
        <MapCanvas 
          mapLayout={mapLayout} 
          iconToggles={iconToggles} 
          layoutNumber={layoutNumber}
        />
      </div>
    </main>
  );
} 