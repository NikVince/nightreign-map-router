"use client";
import React, { useState } from "react";
import { NightfarerClassType } from "~/types/core";

export interface TeamMember {
  id: number;
  nightfarer: NightfarerClassType | null;
}

export interface TeamCompositionProps {
  teamMembers: TeamMember[];
  onTeamChange: (teamMembers: TeamMember[]) => void;
}

const NIGHTFARER_OPTIONS: { value: NightfarerClassType; label: string }[] = [
  { value: NightfarerClassType.Wylder, label: "Wylder" },
  { value: NightfarerClassType.Guardian, label: "Guardian" },
  { value: NightfarerClassType.Ironeye, label: "Ironeye" },
  { value: NightfarerClassType.Raider, label: "Raider" },
  { value: NightfarerClassType.Recluse, label: "Recluse" },
  { value: NightfarerClassType.Executor, label: "Executor" },
  { value: NightfarerClassType.Duchess, label: "Duchess" },
  { value: NightfarerClassType.Revenant, label: "Revenant" },
];

export function TeamComposition({ teamMembers, onTeamChange }: TeamCompositionProps) {
  const handleNightfarerChange = (playerId: number, nightfarer: NightfarerClassType | null) => {
    const updatedTeam = teamMembers.map(member =>
      member.id === playerId ? { ...member, nightfarer } : member
    );
    onTeamChange(updatedTeam);
  };

  const addPlayer = (playerId: number) => {
    const newMember: TeamMember = { id: playerId, nightfarer: null };
    const updatedTeam = [...teamMembers, newMember].sort((a, b) => a.id - b.id);
    onTeamChange(updatedTeam);
  };

  const removePlayer = (playerId: number) => {
    const updatedTeam = teamMembers.filter(member => member.id !== playerId);
    onTeamChange(updatedTeam);
  };

  return (
    <div className="mb-4 p-3 bg-black bg-opacity-75 rounded">
      <div className="text-sm">
        <div className="font-bold mb-2" style={{ color: "var(--elden-accent)" }}>
          Team Composition:
        </div>
        
        {/* Player 1 - Always present */}
        <div className="mb-2 flex items-center gap-2">
          <label className="text-sm opacity-80 min-w-[80px]">Player 1:</label>
          <select
            value={teamMembers.find(m => m.id === 1)?.nightfarer || ""}
            onChange={(e) => handleNightfarerChange(1, e.target.value as NightfarerClassType || null)}
            className="flex-1 px-2 py-1 text-sm bg-gray-700 text-white border border-gray-600 rounded"
          >
            <option value="">Choose Nightfarer</option>
            {NIGHTFARER_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Team size indicator */}
        <div className="text-xs text-gray-400 mb-2">
          Team Size: {teamMembers.length} player{teamMembers.length !== 1 ? 's' : ''}
        </div>

        {/* Player 2 - Can be added/removed */}
        {teamMembers.find(m => m.id === 2) ? (
          <div className="mb-2 flex items-center gap-2">
            <label className="text-sm opacity-80 min-w-[80px]">Player 2:</label>
            <select
              value={teamMembers.find(m => m.id === 2)?.nightfarer || ""}
              onChange={(e) => handleNightfarerChange(2, e.target.value as NightfarerClassType || null)}
              className="flex-1 px-2 py-1 text-sm bg-gray-700 text-white border border-gray-600 rounded"
            >
              <option value="">Choose Nightfarer</option>
              {NIGHTFARER_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => removePlayer(2)}
              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
              title="Remove Player 2"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="mb-2">
            <button
              onClick={() => addPlayer(2)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Add Player 2
            </button>
          </div>
        )}

        {/* Player 3 - Can be added/removed */}
        {teamMembers.find(m => m.id === 3) ? (
          <div className="mb-2 flex items-center gap-2">
            <label className="text-sm opacity-80 min-w-[80px]">Player 3:</label>
            <select
              value={teamMembers.find(m => m.id === 3)?.nightfarer || ""}
              onChange={(e) => handleNightfarerChange(3, e.target.value as NightfarerClassType || null)}
              className="flex-1 px-2 py-1 text-sm bg-gray-700 text-white border border-gray-600 rounded"
            >
              <option value="">Choose Nightfarer</option>
              {NIGHTFARER_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => removePlayer(3)}
              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
              title="Remove Player 3"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="mb-2">
            <button
              onClick={() => addPlayer(3)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Add Player 3
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 