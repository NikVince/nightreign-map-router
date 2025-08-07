// Route calculation algorithm for Nightreign map router
// Reference: /docs/ROUTE_ALGORITHM_IMPLEMENTATION.md

import type { RouteState, POIPriority, RouteCalculation, RouteResult, TeamMember } from "../types/route";
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
      visitedPOIs: [],
      currentDay,
      teamComposition: teamMembers,
      nightlord,
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
   * Mark a POI as visited
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
    
    const adjustedPriority = basePriority + timeAdjustment + levelAccessibility + keyAccessibility + teamBonus + nightlordBonus;

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
   * Main route calculation method
   */
  public calculateRoute(availablePOIs: Array<{
    id: number;
    type: LandmarkType;
    x: number;
    y: number;
    estimatedTime: number;
    estimatedRunes: number;
  }>): RouteResult {
    const startTime = performance.now();
    
    try {
      // Calculate priorities for all available POIs
      const priorities = availablePOIs.map(poi => 
        this.calculatePOIPriority(
          poi.id,
          poi.type,
          poi.estimatedTime,
          poi.estimatedRunes
        )
      );

      // Filter accessible POIs
      const accessiblePOIs = priorities.filter(priority => 
        priority.adjustedPriority > 0 &&
        priority.estimatedTime <= this.state.remainingTime &&
        (!priority.accessibility.requiresKeys || this.state.stoneswordKeys > 0)
      );

      // Sort by adjusted priority (highest first)
      accessiblePOIs.sort((a, b) => b.adjustedPriority - a.adjustedPriority);

      // Simple route generation (to be replaced with A* algorithm)
      const route: number[] = [];
      let totalTime = 0;
      let totalDistance = 0;

      for (const poi of accessiblePOIs) {
        if (totalTime + poi.estimatedTime <= this.state.remainingTime) {
          route.push(poi.poiId);
          totalTime += poi.estimatedTime;
          // TODO: Calculate actual distance between POIs
          totalDistance += 100; // Placeholder distance
        }
      }

      const executionTime = performance.now() - startTime;

      const routeCalculation: RouteCalculation = {
        patternId: `pattern-${this.state.currentDay}`,
        nightlord: this.state.nightlord,
        route,
        totalDistance,
        estimatedTime: totalTime,
        priorities: accessiblePOIs.reduce((acc, poi) => {
          acc[poi.poiId] = poi.adjustedPriority;
          return acc;
        }, {} as Record<number, number>),
        notes: `Generated route for ${route.length} POIs in ${totalTime}s`,
      };

      return {
        success: true,
        route: routeCalculation,
        debugInfo: {
          stateSnapshot: this.getCurrentState(),
          priorityCalculations: accessiblePOIs,
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
} 