"use client";
import React from "react";
import type { RouteState, POIPriority } from "~/types/route";

interface RouteDebugPanelProps {
  state: RouteState;
  priorityCalculations?: POIPriority[];
  isVisible: boolean;
  onClose: () => void;
}

export function RouteDebugPanel({ 
  state, 
  priorityCalculations = [], 
  isVisible, 
  onClose 
}: RouteDebugPanelProps) {
  if (!isVisible) return null;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-bold" style={{ color: "var(--elden-accent)" }}>
          Route Debug Panel
        </h3>
      </div>

      {/* State Counters */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2 text-yellow-400">State Counters</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Runes Gained:</span>
            <span className="text-green-400">{state.runesGained.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Player Level:</span>
            <span className="text-blue-400">{state.playerLevel}</span>
          </div>
          <div className="flex justify-between">
            <span>Stonesword Keys:</span>
            <span className="text-purple-400">{state.stoneswordKeys}</span>
          </div>
          <div className="flex justify-between">
            <span>Remaining Time:</span>
            <span className="text-red-400">{formatTime(state.remainingTime)}</span>
          </div>
          <div className="flex justify-between">
            <span>Current Day:</span>
            <span className="text-orange-400">{state.currentDay}</span>
          </div>
          <div className="flex justify-between">
            <span>Team Size:</span>
            <span className="text-cyan-400">{state.teamComposition.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Nightlord:</span>
            <span className="text-pink-400">{state.nightlord}</span>
          </div>
        </div>
      </div>

      {/* Visited POIs */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2 text-yellow-400">Visited POIs</h4>
        <div className="text-sm">
          {state.visitedPOIs.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {state.visitedPOIs.map((poiId, index) => (
                <span
                  key={poiId}
                  className="px-2 py-1 bg-gray-700 rounded text-xs"
                >
                  {poiId}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">None</span>
          )}
        </div>
      </div>

      {/* Team Composition */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2 text-yellow-400">Team Composition</h4>
        <div className="space-y-1 text-sm">
          {state.teamComposition.map((member, index) => (
            <div key={member.id} className="flex justify-between">
              <span>Player {member.id}:</span>
              <span className="text-cyan-400">
                {member.nightfarer || "None"}
                {member.startsWithStoneswordKey && " 🔑"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Calculations */}
      {priorityCalculations.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2 text-yellow-400">
            Priority Calculations ({priorityCalculations.length})
          </h4>
          <div className="space-y-2 text-xs max-h-32 overflow-y-auto">
            {priorityCalculations.slice(0, 5).map((priority) => (
              <div key={priority.poiId} className="bg-gray-800 p-2 rounded">
                <div className="flex justify-between">
                  <span>POI {priority.poiId}:</span>
                  <span className="text-green-400">{priority.adjustedPriority}</span>
                </div>
                <div className="text-gray-400">
                  Base: {priority.basePriority} | Time: {priority.estimatedTime}s
                </div>
              </div>
            ))}
            {priorityCalculations.length > 5 && (
              <div className="text-gray-400 text-center">
                +{priorityCalculations.length - 5} more...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reset Button */}
      <div className="text-center">
        <button
          onClick={() => {
            // TODO: Implement state reset functionality
            console.log("Reset state clicked");
          }}
          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Reset State
        </button>
      </div>
    </div>
  );
} 