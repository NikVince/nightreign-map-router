"use client";
import React from "react";
import dynamic from "next/dynamic";

const MapCanvas = dynamic(() => import("./MapCanvas"), { ssr: false });

export type IconToggles = {
  sitesOfGrace: boolean;
  spiritStreams: boolean;
  spiritHawkTrees: boolean;
  scarabs: boolean;
  buriedTreasures: boolean;
};

export function MainPanel({ mapLayout, iconToggles }: { mapLayout: string, iconToggles: IconToggles }) {
  return (
    <main className="elden-panel flex-1 flex flex-col h-full w-full" style={{ fontFamily: "var(--elden-ui-font)" }}>
      <div className="w-full h-full flex-1">
        <MapCanvas mapLayout={mapLayout} iconToggles={iconToggles} />
      </div>
    </main>
  );
} 