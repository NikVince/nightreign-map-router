"use client";
import React, { useState } from "react";
import { NightfarerClassType } from "~/types/core";

export interface TeamMember {
  id: number;
  nightfarer: NightfarerClassType | null;
  startsWithStoneswordKey: boolean;
}

export interface TeamCompositionProps {
  teamMembers: TeamMember[];
  onTeamChange: (teamMembers: TeamMember[]) => void;
  onCalculateRoute?: () => void;
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

export function TeamComposition({ teamMembers, onTeamChange, onCalculateRoute }: TeamCompositionProps) {
  const handleNightfarerChange = (playerId: number, nightfarer: NightfarerClassType | null) => {
    const updatedTeam = teamMembers.map(member =>
      member.id === playerId ? { ...member, nightfarer } : member
    );
    onTeamChange(updatedTeam);
  };

  const handleStoneswordKeyToggle = (playerId: number, startsWithKey: boolean) => {
    const updatedTeam = teamMembers.map(member =>
      member.id === playerId ? { ...member, startsWithStoneswordKey: startsWithKey } : member
    );
    onTeamChange(updatedTeam);
  };

  const addPlayer = () => {
    const nextPlayerId = teamMembers.length + 1;
    const newMember: TeamMember = { 
      id: nextPlayerId, 
      nightfarer: null, 
      startsWithStoneswordKey: false 
    };
    const updatedTeam = [...teamMembers, newMember];
    onTeamChange(updatedTeam);
  };

  const removePlayer = (playerId: number) => {
    let updatedTeam = teamMembers.filter(member => member.id !== playerId);
    
    // Relabel remaining players to maintain sequential numbering
    updatedTeam = updatedTeam.map((member, index) => ({
      ...member,
      id: index + 1
    }));
    
    onTeamChange(updatedTeam);
  };

  return (
    <div className="mb-4 p-3 bg-black bg-opacity-75 rounded">
      <div className="text-sm">
        <div className="font-bold mb-2" style={{ color: "var(--elden-accent)" }}>
          Team Composition: {teamMembers.length} Player{teamMembers.length !== 1 ? 's' : ''}
        </div>
        
                {/* Player 1 - Always present */}
        <div className="mb-3 p-3 border border-gray-600 rounded bg-black bg-opacity-50">
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
          <div className="flex items-center justify-end gap-2">
            <label className="text-xs opacity-80">Starts with Stonesword Key:</label>
            <input
              type="checkbox"
              checked={teamMembers.find(m => m.id === 1)?.startsWithStoneswordKey || false}
              onChange={(e) => handleStoneswordKeyToggle(1, e.target.checked)}
              className="w-4 h-4"
            />
          </div>
        </div>

        {/* Player 2 - Can be added/removed */}
        {teamMembers.find(m => m.id === 2) ? (
          <div className="mb-3 p-3 border border-gray-600 rounded bg-black bg-opacity-50">
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
                className="px-2 py-1 text-xs bg-red-800 text-white border border-red-600 rounded hover:bg-red-700"
                title="Remove Player 2"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center justify-end gap-2">
              <label className="text-xs opacity-80">Starts with Stonesword Key:</label>
              <input
                type="checkbox"
                checked={teamMembers.find(m => m.id === 2)?.startsWithStoneswordKey || false}
                onChange={(e) => handleStoneswordKeyToggle(2, e.target.checked)}
                className="w-4 h-4"
              />
            </div>
          </div>
        ) : null}

        {/* Player 3 - Can be added/removed */}
        {teamMembers.find(m => m.id === 3) ? (
          <div className="mb-3 p-3 border border-gray-600 rounded bg-black bg-opacity-50">
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
                className="px-2 py-1 text-xs bg-red-800 text-white border border-red-600 rounded hover:bg-red-700"
                title="Remove Player 3"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center justify-end gap-2">
              <label className="text-xs opacity-80">Starts with Stonesword Key:</label>
              <input
                type="checkbox"
                checked={teamMembers.find(m => m.id === 3)?.startsWithStoneswordKey || false}
                onChange={(e) => handleStoneswordKeyToggle(3, e.target.checked)}
                className="w-4 h-4"
              />
            </div>
          </div>
        ) : null}

        {/* Add Player Button - Only show if less than 3 players */}
        {teamMembers.length < 3 && (
          <div className="mb-2">
            <button
              onClick={addPlayer}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Add Player
            </button>
          </div>
        )}

        {/* Calculate Route Button */}
        <div className="mt-4 pt-2 border-t border-gray-600">
          <button
            onClick={onCalculateRoute}
            className="w-full px-4 py-2 text-sm bg-yellow-600 text-white border border-yellow-500 rounded hover:bg-yellow-500 font-medium"
          >
            Calculate Route
          </button>
        </div>
      </div>
    </div>
  );
} 