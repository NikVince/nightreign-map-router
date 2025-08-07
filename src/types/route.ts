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
  currentDay: 1 | 2;
  teamComposition: TeamMember[];
  nightlord: Nightlord;
  calculatedRoute?: number[]; // Ordered list of POI IDs from route calculation
  visitedPOIs: number[]; // Track POIs visited to avoid duplicates between days
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

export interface DayRoute {
  day: 1 | 2;
  startPOI: number; // Spawn location for day 1, Night 1 circle for day 2
  endPOI: number; // Night 1 circle for day 1, Night 2 circle for day 2
  route: number[]; // POIs to visit between start and end
  totalTime: number;
  totalDistance: number;
  priorities: Record<number, number>;
}

export interface CompleteRoute {
  day1Route: DayRoute;
  day2Route: DayRoute;
  totalRunes: number;
  totalTime: number;
  notes?: string;
}

export interface RouteResult {
  success: boolean;
  route?: CompleteRoute;
  error?: string;
  debugInfo?: {
    stateSnapshot: RouteState;
    priorityCalculations: POIPriority[];
    executionTime: number;
  };
} 