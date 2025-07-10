"use client";
import React from "react";
import dynamic from "next/dynamic";

const MapCanvas = dynamic(() => import("./MapCanvas"), { ssr: false });

export function MainPanel() {
  return (
    <main className="elden-panel flex-1 flex flex-col items-center justify-center min-h-[600px] p-8" style={{ fontFamily: "var(--elden-ui-font)" }}>
      <div className="w-full h-full flex items-center justify-center">
        <MapCanvas />
      </div>
    </main>
  );
} 