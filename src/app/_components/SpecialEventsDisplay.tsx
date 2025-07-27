"use client";
import React from "react";
import { api } from "~/trpc/react";

interface SpecialEventsDisplayProps {
  layoutNumber: number;
}

export function SpecialEventsDisplay({ layoutNumber }: SpecialEventsDisplayProps) {
  const { data: layoutData, isLoading, error } = api.poi.getLayout.useQuery({ layoutNumber });

  if (isLoading) {
    return <div className="text-sm">Loading events...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-400">Error loading events</div>;
  }

  if (!layoutData) {
    return <div className="text-sm">No layout data</div>;
  }

  const specialEvent = layoutData["Special Event"];
  const night1Boss = layoutData["Night 1 Boss"];
  const night2Boss = layoutData["Night 2 Boss"];

  return (
    <div className="text-sm">
      <div className="font-bold mb-2">Layout {layoutNumber}</div>
      {specialEvent && specialEvent !== "empty" && (
        <div className="mb-1">
          <span className="text-yellow-400">Event:</span> {specialEvent}
        </div>
      )}
      {night1Boss && night1Boss !== "empty" && (
        <div className="mb-1">
          <span className="text-red-400">Night 1:</span> {night1Boss}
        </div>
      )}
      {night2Boss && night2Boss !== "empty" && (
        <div className="mb-1">
          <span className="text-red-400">Night 2:</span> {night2Boss}
        </div>
      )}
      {(!specialEvent || specialEvent === "empty") && 
       (!night1Boss || night1Boss === "empty") && 
       (!night2Boss || night2Boss === "empty") && (
        <div className="text-gray-400">No special events</div>
      )}
    </div>
  );
} 