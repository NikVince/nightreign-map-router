// Route calculation types for Nightreign map router
// Reference: /docs/ROUTE_ALGORITHM_IMPLEMENTATION.md

import { NightfarerClassType, Nightlord } from "./core";

export interface TeamMember {
  id: number;
  nightfarer: NightfarerClassType | null;
  startsWithStoneswordKey: boolean;
}

export interface RouteState {
  runesGained: number;
  playerLevel: number;
  stoneswordKeys: number;
  remainingTime: number; // in seconds
  visitedPOIs: number[];
  currentDay: 1 | 2;
  teamComposition: TeamMember[];
  nightlord: Nightlord;
}

export interface POIPriority {
  poiId: number;
  basePriority: number;
  adjustedPriority: number;
  estimatedTime: number;
  estimatedRewards: {
    runes: number;
    items: string[];
    flaskCharges?: number;
  };
  accessibility: {
    requiresKeys: boolean;
    requiresLevel: number;
    requiresTime: number;
  };
}

export interface RouteCalculation {
  patternId: string;
  nightlord: Nightlord;
  route: number[]; // Ordered list of POI IDs to visit
  totalDistance: number;
  estimatedTime: number;
  priorities: Record<number, number>; // Priority score per POI ID
  notes?: string;
}

export interface RouteResult {
  success: boolean;
  route?: RouteCalculation;
  error?: string;
  debugInfo?: {
    stateSnapshot: RouteState;
    priorityCalculations: POIPriority[];
    executionTime: number;
  };
} 