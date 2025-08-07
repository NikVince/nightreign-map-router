// Route calculation algorithm for Nightreign map router
// Reference: /docs/ROUTE_ALGORITHM_IMPLEMENTATION.md

import type { RouteState, POIPriority, CompleteRoute, DayRoute, RouteResult, TeamMember } from "../types/route";
import { Nightlord, LandmarkType } from "../types/core";

// Constants for route calculation
const DAY_CYCLE_TIME = 15 * 60; // 15 minutes in seconds
const LEVEL_THRESHOLDS = [
  { level: 1, runes: 0 },
  { level: 2, runes: 1000 },
  { level: 3, runes: 3000 },
  { level: 4, runes: 6000 },
  { level: 5, runes: 10000 },
  { level: 6, runes: 15000 },
  { level: 7, runes: 21000 },
  { level: 8, runes: 28000 },
  { level: 9, runes: 36000 },
  { level: 10, runes: 45000 },
  // Add more thresholds as needed
];

// Base priority scores from POI_INFO_FOR_ALGORITHM.md
const POI_BASE_PRIORITIES: Record<LandmarkType, number> = {
  [LandmarkType.Church]: 95,
  [LandmarkType.GreatChurch]: 80,
  [LandmarkType.Fort]: 80,
  [LandmarkType.MainEncampment]: 65,
  [LandmarkType.Ruins]: 60,
  [LandmarkType.SorcerersRise]: 40,
  [LandmarkType.Evergaol]: 80,
  [LandmarkType.Castle]: 85,
  [LandmarkType.Tunnel]: 40,
  [LandmarkType.OldSorcerersRise]: 40,
  [LandmarkType.Township]: 0, // Small encampment equivalent
  [LandmarkType.ArenaBoss]: 70,
  [LandmarkType.FieldBoss]: 60,
  [LandmarkType.RottedWoods]: 50,
  [LandmarkType.RotBlessing]: 75,
  [LandmarkType.SiteOfGrace]: 0,
  [LandmarkType.SpectralHawkTree]: 0,
  [LandmarkType.Spiritstream]: 0,
  [LandmarkType.Scarab]: 0,
  [LandmarkType.TunnelEntrance]: 0,
};

export class RouteCalculator {
  private state: RouteState;

  constructor(initialState: RouteState) {
    this.state = { ...initialState };
  }

  /**
   * Initialize route state for a new calculation
   */
  public initializeState(
    teamMembers: TeamMember[],
    nightlord: Nightlord,
    currentDay: 1 | 2,
    startTime: number = DAY_CYCLE_TIME
  ): void {
    this.state = {
      runesGained: 0,
      playerLevel: 1,
      stoneswordKeys: this.calculateStartingKeys(teamMembers),
      remainingTime: startTime,
      currentDay,
      teamComposition: teamMembers,
      nightlord,
      visitedPOIs: [],
    };
  }

  /**
   * Calculate starting Stonesword Keys based on team composition
   */
  private calculateStartingKeys(teamMembers: TeamMember[]): number {
    return teamMembers.reduce((total, member) => {
      return total + (member.startsWithStoneswordKey ? 1 : 0);
    }, 0);
  }

  /**
   * Update player level based on runes gained
   */
  private updatePlayerLevel(): void {
    const currentRunes = this.state.runesGained;
    let newLevel = 1;

    for (const threshold of LEVEL_THRESHOLDS) {
      if (currentRunes >= threshold.runes) {
        newLevel = threshold.level;
      } else {
        break;
      }
    }

    this.state.playerLevel = newLevel;
  }

  /**
   * Add runes to the counter and update level
   */
  public addRunes(runes: number): void {
    this.state.runesGained += runes;
    this.updatePlayerLevel();
  }

  /**
   * Update Stonesword Keys counter
   */
  public updateStoneswordKeys(change: number): void {
    this.state.stoneswordKeys = Math.max(0, this.state.stoneswordKeys + change);
  }

  /**
   * Subtract time from remaining time
   */
  public subtractTime(seconds: number): void {
    this.state.remainingTime = Math.max(0, this.state.remainingTime - seconds);
  }

  /**
   * Mark POI as visited
   */
  public markPOIVisited(poiId: number): void {
    if (!this.state.visitedPOIs.includes(poiId)) {
      this.state.visitedPOIs.push(poiId);
    }
  }

  /**
   * Get current state for debugging
   */
  public getCurrentState(): RouteState {
    return { ...this.state };
  }

  /**
   * Calculate priority for a specific POI
   */
  public calculatePOIPriority(
    poiId: number,
    poiType: LandmarkType,
    estimatedTime: number,
    estimatedRunes: number,
    estimatedItems: string[] = [],
    flaskCharges: number = 0
  ): POIPriority {
    const basePriority = POI_BASE_PRIORITIES[poiType] || 0;
    
    // Time-based adjustment
    const timeAdjustment = this.calculateTimeAdjustment(estimatedTime);
    
    // Level-based accessibility
    const levelAccessibility = this.calculateLevelAccessibility(poiType);
    
    // Key requirement check
    const requiresKeys = poiType === LandmarkType.Evergaol;
    const keyAccessibility = requiresKeys ? (this.state.stoneswordKeys > 0 ? 0 : -50) : 0;
    
    // Team composition bonuses
    const teamBonus = this.calculateTeamBonus(poiType);
    
    // Nightlord weakness targeting
    const nightlordBonus = this.calculateNightlordBonus(poiType);
    
    // Penalty for already visited POIs
    const visitedPenalty = this.state.visitedPOIs.includes(poiId) ? -1000 : 0;
    
    const adjustedPriority = basePriority + timeAdjustment + levelAccessibility + keyAccessibility + teamBonus + nightlordBonus + visitedPenalty;

    return {
      poiId,
      basePriority,
      adjustedPriority: Math.max(0, adjustedPriority),
      estimatedTime,
      estimatedRewards: {
        runes: estimatedRunes,
        items: estimatedItems,
        flaskCharges,
      },
      accessibility: {
        requiresKeys,
        requiresLevel: this.getRequiredLevel(poiType),
        requiresTime: estimatedTime,
      },
    };
  }

  /**
   * Calculate time-based priority adjustment
   */
  private calculateTimeAdjustment(estimatedTime: number): number {
    const timeRatio = estimatedTime / this.state.remainingTime;
    if (timeRatio > 0.8) return -30; // Too time-consuming
    if (timeRatio > 0.5) return -15; // Moderately time-consuming
    if (timeRatio < 0.2) return 10; // Quick completion bonus
    return 0;
  }

  /**
   * Calculate level-based accessibility
   */
  private calculateLevelAccessibility(poiType: LandmarkType): number {
    const requiredLevel = this.getRequiredLevel(poiType);
    if (this.state.playerLevel >= requiredLevel) return 0;
    return -25; // Penalty for inaccessible POIs
  }

  /**
   * Get required level for POI type
   */
  private getRequiredLevel(poiType: LandmarkType): number {
    switch (poiType) {
      case LandmarkType.Castle:
        return 5;
      case LandmarkType.GreatChurch:
        return 3;
      case LandmarkType.Fort:
        return 2;
      default:
        return 1;
    }
  }

  /**
   * Calculate team composition bonuses
   */
  private calculateTeamBonus(poiType: LandmarkType): number {
    // TODO: Implement class-specific bonuses
    // This will be expanded based on class abilities and preferences
    return 0;
  }

  /**
   * Calculate Nightlord weakness targeting bonuses
   */
  private calculateNightlordBonus(poiType: LandmarkType): number {
    // TODO: Implement Nightlord-specific targeting
    // This will be expanded based on Nightlord weaknesses and POI elemental variants
    return 0;
  }

  /**
   * Calculate route for a specific day
   */
  private calculateDayRoute(
    day: 1 | 2,
    availablePOIs: Array<{
      id: number;
      type: LandmarkType;
      x: number;
      y: number;
      estimatedTime: number;
      estimatedRunes: number;
      location?: string;
      value?: string;
    }>,
    startPOI: number,
    endPOI: number,
    layoutData: any
  ): DayRoute {
    // Set up state for this day
    this.state.currentDay = day;
    this.state.remainingTime = DAY_CYCLE_TIME;
    
    // For day 2, carry over state from day 1
    if (day === 2) {
      // Keep runes, level, and visited POIs from day 1
      // Reset time for day 2
      this.state.remainingTime = DAY_CYCLE_TIME;
    }

    // CRITICAL: Filter out POIs with "empty" values
    const validPOIs = availablePOIs.filter(poi => {
      if (poi.value === "empty" || poi.value === "POI X: empty") {
        return false;
      }
      if (poi.location === "empty" || poi.location === "") {
        return false;
      }
      if (poi.x === 0 && poi.y === 0) {
        return false;
      }
      return true;
    });

    console.log(`Day ${day}: Filtered ${availablePOIs.length} POIs down to ${validPOIs.length} valid POIs`);

    // Calculate priorities for all valid POIs
    const priorities = validPOIs.map(poi => 
      this.calculatePOIPriority(
        poi.id,
        poi.type,
        poi.estimatedTime,
        poi.estimatedRunes
      )
    );

    // Filter accessible POIs (exclude start and end POIs from route calculation)
    const accessiblePOIs = priorities.filter(priority => 
      priority.adjustedPriority > 0 &&
      priority.estimatedTime <= this.state.remainingTime &&
      (!priority.accessibility.requiresKeys || this.state.stoneswordKeys > 0) &&
      priority.poiId !== startPOI &&
      priority.poiId !== endPOI
    );

    // Sort by adjusted priority (highest first)
    accessiblePOIs.sort((a, b) => b.adjustedPriority - a.adjustedPriority);

    console.log(`Day ${day}: Found ${accessiblePOIs.length} accessible POIs with priorities:`, 
      accessiblePOIs.map(p => `${p.poiId}:${p.adjustedPriority}`).join(', '));

    // Generate route that starts at startPOI, visits intermediate POIs, and ends at endPOI
    const route: number[] = [startPOI];
    let totalTime = 0;
    let totalDistance = 0;

    // Add intermediate POIs based on priority
    for (const poi of accessiblePOIs) {
      if (totalTime + poi.estimatedTime <= this.state.remainingTime) {
        route.push(poi.poiId);
        totalTime += poi.estimatedTime;
        this.markPOIVisited(poi.poiId);
        // TODO: Calculate actual distance between POIs
        totalDistance += 100; // Placeholder distance
      } else {
        console.log(`Day ${day}: Skipping POI ${poi.poiId} due to time constraint`);
      }
    }

    // Add end POI
    route.push(endPOI);

    console.log(`Day ${day}: Generated route with ${route.length} POIs:`, route);
    console.log(`Day ${day}: Total route time: ${totalTime}s, remaining time: ${this.state.remainingTime}s`);

    return {
      day,
      startPOI,
      endPOI,
      route,
      totalTime,
      totalDistance,
      priorities: accessiblePOIs.reduce((acc, poi) => {
        acc[poi.poiId] = poi.adjustedPriority;
        return acc;
      }, {} as Record<number, number>),
    };
  }

  /**
   * Main route calculation method for both days
   * CRITICAL: Filter out POIs with "empty" values to ensure data synchronization
   */
  public calculateCompleteRoute(
    availablePOIs: Array<{
      id: number;
      type: LandmarkType;
      x: number;
      y: number;
      estimatedTime: number;
      estimatedRunes: number;
      location?: string;
      value?: string;
    }>,
    layoutData: any
  ): RouteResult {
    const startTime = performance.now();
    
    try {
      // Extract start and end POIs from layout data
      const spawnPOI = this.extractSpawnPOI(layoutData);
      const night1CirclePOI = this.extractNightCirclePOI(layoutData, 1);
      const night2CirclePOI = this.extractNightCirclePOI(layoutData, 2);

      if (!spawnPOI || !night1CirclePOI || !night2CirclePOI) {
        throw new Error("Missing required start/end POIs from layout data");
      }

      console.log(`Route calculation: Spawn=${spawnPOI}, Night1=${night1CirclePOI}, Night2=${night2CirclePOI}`);

      // Calculate day 1 route (Spawn → Night 1 Circle)
      const day1Route = this.calculateDayRoute(1, availablePOIs, spawnPOI, night1CirclePOI, layoutData);

      // Calculate day 2 route (Night 1 Circle → Night 2 Circle)
      const day2Route = this.calculateDayRoute(2, availablePOIs, night1CirclePOI, night2CirclePOI, layoutData);

      const totalRunes = Object.keys(day1Route.priorities).length + Object.keys(day2Route.priorities).length; // Placeholder
      const totalTime = day1Route.totalTime + day2Route.totalTime;

      const completeRoute: CompleteRoute = {
        day1Route,
        day2Route,
        totalRunes,
        totalTime,
        notes: `Generated complete route: Day 1 (${day1Route.route.length} POIs), Day 2 (${day2Route.route.length} POIs)`,
      };

      const executionTime = performance.now() - startTime;

      return {
        success: true,
        route: completeRoute,
        debugInfo: {
          stateSnapshot: this.getCurrentState(),
          priorityCalculations: [], // TODO: Return priority calculations for both days
          executionTime,
        },
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        debugInfo: {
          stateSnapshot: this.getCurrentState(),
          priorityCalculations: [],
          executionTime: performance.now() - startTime,
        },
      };
    }
  }

  /**
   * Extract spawn POI ID from layout data
   */
  private extractSpawnPOI(layoutData: any): number | null {
    if (layoutData["Spawn Point"] && layoutData["Spawn Point"] !== "empty") {
      // Use the centralized POI location mapping utility
      const { getPOIIdForSpawnLocation } = require("./poiLocationMapping");
      return getPOIIdForSpawnLocation(layoutData["Spawn Point"]);
    }
    return null;
  }

  /**
   * Extract night circle POI ID from layout data
   */
  private extractNightCirclePOI(layoutData: any, night: number): number | null {
    const nightKey = `Night ${night} Circle`;
    if (layoutData[nightKey] && layoutData[nightKey] !== "empty") {
      // Use the centralized POI location mapping utility
      const { getPOIIdForNightCircleLocation } = require("./poiLocationMapping");
      return getPOIIdForNightCircleLocation(layoutData[nightKey]);
    }
    return null;
  }
} 