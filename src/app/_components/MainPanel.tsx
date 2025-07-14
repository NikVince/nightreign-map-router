"use client";
import React from "react";
import dynamic from "next/dynamic";

const MapCanvas = dynamic(() => import("./MapCanvas"), { ssr: false });

export function MainPanel({ mapLayout }: { mapLayout: string }) {
  return (
    <main className="elden-panel flex-1 flex flex-col h-full w-full" style={{ fontFamily: "var(--elden-ui-font)" }}>
      <div className="w-full h-full flex-1">
        <MapCanvas mapLayout={mapLayout} />
      </div>
    </main>
  );
} 