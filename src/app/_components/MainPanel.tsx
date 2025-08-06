"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { MapOptionsDropdown } from "./MapOptionsDropdown";

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
  layoutNumber = 1
}: { 
  iconToggles: IconToggles; 
  onLayoutChange?: (layoutNumber: number) => void;
  onIconToggleChange?: (key: string, value: boolean) => void;
  layoutNumber?: number;
}) {
  const [showIcons, setShowIcons] = useState(true);
  const [showTitles, setShowTitles] = useState(true);
  const [showNumbers, setShowNumbers] = useState(false);

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
          iconToggles={iconToggles}
          onIconToggleChange={onIconToggleChange || (() => {})}
        />
        <MapCanvas 
          iconToggles={iconToggles} 
          layoutNumber={layoutNumber}
          showIcons={showIcons}
          setShowIcons={setShowIcons}
          showTitles={showTitles}
          setShowTitles={setShowTitles}
          showNumbers={showNumbers}
          setShowNumbers={setShowNumbers}
        />
      </div>
    </main>
  );
} 