// Route calculation algorithm for Nightreign map router
// Reference: /docs/ROUTE_ALGORITHM_IMPLEMENTATION.md

import type { RouteState, POIPriority, CompleteRoute, DayRoute, RouteResult, TeamMember } from "../types/route";
import { Nightlord, LandmarkType } from "../types/core";
import { getPOIData, type POIData } from "./poiDataLoader";

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

// Distance calculation constants
const MAX_MAP_DISTANCE = 1309.47; // Distance between POI 31 and POI 177 (opposite sides of map)
const MAX_DISTANCE_TIME = 210; // 210 seconds for maximum distance
const MAX_DISTANCE_PENALTY = 25; // 25 points penalty for maximum distance

// Base priority scores from POI_PRIORITY_SCORES.md
const POI_BASE_PRIORITIES: Record<LandmarkType, number> = {
  [LandmarkType.Church]: 50,
  [LandmarkType.GreatChurch]: 25,
  [LandmarkType.Fort]: 25,
  [LandmarkType.MainEncampment]: 20,
  [LandmarkType.Ruins]: 20,
  [LandmarkType.SorcerersRise]: 15,
  [LandmarkType.Evergaol]: 40,
  [LandmarkType.Castle]: 45,
  [LandmarkType.Tunnel]: 15,
  [LandmarkType.OldSorcerersRise]: 40,
  [LandmarkType.Township]: 45, 
  [LandmarkType.ArenaBoss]: 30,
  [LandmarkType.FieldBoss]: 20,
  [LandmarkType.RottedWoods]: 50,
  [LandmarkType.RotBlessing]: 50,
  [LandmarkType.SiteOfGrace]: 0,
  [LandmarkType.SpectralHawkTree]: 0,
  [LandmarkType.Spiritstream]: 0,
  [LandmarkType.Scarab]: 25,
  [LandmarkType.TunnelEntrance]: 15,
};

export class RouteCalculator {
  private state: RouteState;
  private poiCoordinates: Map<number, [number, number]> = new Map();
  // Debug mode state
  private debugMode: boolean = false;
  private debugStep: number = 0;
  private debugRoute: number[] = [];
  private debugCurrentPOI: number | null = null;
  private debugAvailablePOIs: Array<{
    id: number;
    type: LandmarkType;
    x: number;
    y: number;
    estimatedTime: number;
    estimatedRunes: number;
    location?: string;
    value?: string;
  }> = [];
  private debugLayoutData: any = null;
  private debugCompleteRoute: CompleteRoute | null = null;
  private debugCurrentDay: 1 | 2 = 1;
  private debugDayRoute: number[] = [];
  private debugDayStep: number = 0;
  private debugDay1Route: number[] = [];
  private debugDay2Route: number[] = [];

  constructor(initialState: RouteState) {
    this.state = { ...initialState };
    this.loadPOICoordinates();
  }

  /**
   * Load POI coordinates from the existing POI data loader
   */
  private loadPOICoordinates(): void {
    try {
      // Use the existing POI data loader
      const poiData = getPOIData();
      
      poiData.forEach((poi: POIData) => {
        this.poiCoordinates.set(poi.id, poi.coordinates);
      });
      
      console.log(`Loaded ${this.poiCoordinates.size} POI coordinates`);
    } catch (error) {
      console.error("Failed to load POI coordinates:", error);
      // Fallback to hardcoded coordinates for critical POIs
      this.loadFallbackCoordinates();
    }
  }

  /**
   * Load fallback coordinates for critical POIs
   */
  private loadFallbackCoordinates(): void {
    const fallbackCoordinates: Record<number, [number, number]> = {
      31: [842, 1218.67],
      177: [1864, 400],
      // Add more critical POIs as needed
    };
    
    Object.entries(fallbackCoordinates).forEach(([id, coords]) => {
      this.poiCoordinates.set(parseInt(id), coords);
    });
    
    console.log(`Loaded ${this.poiCoordinates.size} fallback POI coordinates`);
  }

  /**
   * Calculate Euclidean distance between two POIs
   */
  private calculateDistance(poi1Id: number, poi2Id: number): number {
    const coord1 = this.getPOICoordinates(poi1Id);
    const coord2 = this.getPOICoordinates(poi2Id);
    
    if (!coord1 || !coord2) {
      console.warn(`Missing coordinates for POI ${poi1Id} or ${poi2Id}`);
      return 0;
    }

    const [x1, y1] = coord1;
    const [x2, y2] = coord2;
    
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  /**
   * Get POI coordinates from the master coordinate list
   */
  private getPOICoordinates(poiId: number): [number, number] | null {
    return this.poiCoordinates.get(poiId) || null;
  }

  /**
   * Calculate distance penalty based on distance to last visited POI
   */
  private calculateDistancePenalty(currentPOIId: number, lastVisitedPOIId?: number): number {
    if (!lastVisitedPOIId) {
      return 0; // No penalty for first POI
    }

    const distance = this.calculateDistance(lastVisitedPOIId, currentPOIId);
    
    // Calculate penalty based on distance ratio
    const distanceRatio = distance / MAX_MAP_DISTANCE;
    const penalty = Math.round(distanceRatio * MAX_DISTANCE_PENALTY);
    
    console.log(`Distance penalty for POI ${currentPOIId} from POI ${lastVisitedPOIId}: ${distance} units (${distanceRatio.toFixed(3)} ratio) = ${penalty} points`);
    
    return penalty;
  }

  /**
   * Calculate travel time based on distance
   */
  private calculateTravelTime(distance: number): number {
    const timeRatio = distance / MAX_MAP_DISTANCE;
    return Math.round(timeRatio * MAX_DISTANCE_TIME);
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
    flaskCharges: number = 0,
    lastVisitedPOIId?: number
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
    
    // Distance penalty (NEW)
    const distancePenalty = this.calculateDistancePenalty(poiId, lastVisitedPOIId);
    
    const adjustedPriority = basePriority + timeAdjustment + levelAccessibility + keyAccessibility + teamBonus + nightlordBonus + visitedPenalty - distancePenalty;

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

    // Generate route that starts at startPOI, visits intermediate POIs, and ends at endPOI
    const route: number[] = [startPOI];
    let totalTime = 0;
    let totalDistance = 0;
    let lastVisitedPOI = startPOI;
    const visitedPOIsInRoute: number[] = [startPOI];

    // Add intermediate POIs based on priority (recalculating after each visit)
    while (this.state.remainingTime > 0) {
      // Calculate priorities for all valid POIs, considering distance from last visited POI
      const priorities = validPOIs.map(poi => 
        this.calculatePOIPriority(
          poi.id,
          poi.type,
          poi.estimatedTime,
          poi.estimatedRunes,
          [],
          0,
          lastVisitedPOI // Pass last visited POI for distance calculation
        )
      );

      // Filter accessible POIs (exclude start, end, and already visited POIs from route calculation)
      const accessiblePOIs = priorities.filter(priority => 
        priority.adjustedPriority > 0 &&
        priority.estimatedTime <= this.state.remainingTime &&
        (!priority.accessibility.requiresKeys || this.state.stoneswordKeys > 0) &&
        priority.poiId !== startPOI &&
        priority.poiId !== endPOI &&
        !visitedPOIsInRoute.includes(priority.poiId)
      );

      // Sort by adjusted priority (highest first)
      accessiblePOIs.sort((a, b) => b.adjustedPriority - a.adjustedPriority);

      if (accessiblePOIs.length === 0) {
        console.log(`Day ${day}: No more accessible POIs, ending route`);
        break;
      }

      // Add the highest priority POI to the route
      const nextPOI = accessiblePOIs[0];
      if (!nextPOI) {
        console.log(`Day ${day}: No valid POI found, ending route`);
        break;
      }

      route.push(nextPOI.poiId);
      totalTime += nextPOI.estimatedTime;
      this.markPOIVisited(nextPOI.poiId);
      visitedPOIsInRoute.push(nextPOI.poiId);
      
      // Calculate actual distance between POIs
      const distance = this.calculateDistance(lastVisitedPOI, nextPOI.poiId);
      totalDistance += distance;
      lastVisitedPOI = nextPOI.poiId;
      
      // Update remaining time
      this.state.remainingTime -= nextPOI.estimatedTime;
      
      console.log(`Day ${day}: Added POI ${nextPOI.poiId} to route (distance: ${distance.toFixed(2)} units, priority: ${nextPOI.adjustedPriority})`);
    }

    // Add end POI and calculate final distance
    route.push(endPOI);
    const finalDistance = this.calculateDistance(lastVisitedPOI, endPOI);
    totalDistance += finalDistance;

    console.log(`Day ${day}: Generated route with ${route.length} POIs:`, route);
    console.log(`Day ${day}: Total route time: ${totalTime}s, total distance: ${totalDistance.toFixed(2)} units, remaining time: ${this.state.remainingTime}s`);

    return {
      day,
      startPOI,
      endPOI,
      route,
      totalTime,
      totalDistance,
      priorities: {}, // Will be populated with final priorities
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

  /**
   * Test method to verify distance calculations
   * This can be called for debugging and validation
   */
  public testDistanceCalculation(): void {
    console.log("=== Distance Calculation Test ===");
    
    // Test the example distance: POI 31 to POI 177
    const distance = this.calculateDistance(31, 177);
    const expectedDistance = 1309.47;
    const tolerance = 0.01;
    
    console.log(`POI 31 to POI 177 distance: ${distance.toFixed(2)} units`);
    console.log(`Expected distance: ${expectedDistance} units`);
    console.log(`Difference: ${Math.abs(distance - expectedDistance).toFixed(2)} units`);
    console.log(`Test ${Math.abs(distance - expectedDistance) < tolerance ? 'PASSED' : 'FAILED'}`);
    
    // Test distance penalty calculation
    const penalty = this.calculateDistancePenalty(177, 31);
    const expectedPenalty = 25;
    
    console.log(`Distance penalty for POI 177 from POI 31: ${penalty} points`);
    console.log(`Expected penalty: ${expectedPenalty} points`);
    console.log(`Test ${penalty === expectedPenalty ? 'PASSED' : 'FAILED'}`);
    
    // Test travel time calculation
    const travelTime = this.calculateTravelTime(distance);
    const expectedTravelTime = 210;
    
    console.log(`Travel time for distance ${distance.toFixed(2)}: ${travelTime} seconds`);
    console.log(`Expected travel time: ${expectedTravelTime} seconds`);
    console.log(`Test ${travelTime === expectedTravelTime ? 'PASSED' : 'FAILED'}`);
    
    // Test a shorter distance
    const shortDistance = this.calculateDistance(1, 2);
    const shortPenalty = this.calculateDistancePenalty(2, 1);
    const shortTravelTime = this.calculateTravelTime(shortDistance);
    
    console.log(`\nShort distance test (POI 1 to POI 2):`);
    console.log(`Distance: ${shortDistance.toFixed(2)} units`);
    console.log(`Penalty: ${shortPenalty} points`);
    console.log(`Travel time: ${shortTravelTime} seconds`);
    
    console.log("=== End Distance Calculation Test ===");
  }

  /**
   * Get distance calculation statistics for debugging
   */
  public getDistanceStats(): {
    totalPOIs: number;
    maxDistance: number;
    averageDistance: number;
    sampleDistances: Array<{ from: number; to: number; distance: number }>;
  } {
    const poiIds = Array.from(this.poiCoordinates.keys());
    const sampleDistances: Array<{ from: number; to: number; distance: number }> = [];
    let maxDistance = 0;
    let totalDistance = 0;
    let distanceCount = 0;

    // Calculate some sample distances
    for (let i = 0; i < Math.min(10, poiIds.length); i++) {
      for (let j = i + 1; j < Math.min(i + 5, poiIds.length); j++) {
        const distance = this.calculateDistance(poiIds[i]!, poiIds[j]!);
        sampleDistances.push({
          from: poiIds[i]!,
          to: poiIds[j]!,
          distance: distance
        });
        
        if (distance > maxDistance) {
          maxDistance = distance;
        }
        
        totalDistance += distance;
        distanceCount++;
      }
    }

    return {
      totalPOIs: this.poiCoordinates.size,
      maxDistance,
      averageDistance: distanceCount > 0 ? totalDistance / distanceCount : 0,
      sampleDistances
    };
  }

  /**
   * Enable debug mode using the exact same logic as main route calculation
   */
  public enableDebugMode(
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
  ): void {
    this.debugMode = true;
    this.debugStep = 0;
    this.debugRoute = [];
    this.debugCurrentPOI = null;
    this.debugAvailablePOIs = availablePOIs;
    this.debugLayoutData = layoutData;
    this.debugCompleteRoute = null;
    this.debugCurrentDay = 1;
    this.debugDayRoute = [];
    this.debugDayStep = 0;
    this.debugDay1Route = [];
    this.debugDay2Route = [];

    // Use the EXACT SAME logic as main route calculation
    const result = this.calculateCompleteRoute(availablePOIs, layoutData);
    this.debugCompleteRoute = result.route || null;
    
    // Initialize with spawn POI (same as main route)
    const spawnPOI = this.extractSpawnPOI(layoutData);
    if (spawnPOI) {
      this.debugCurrentPOI = spawnPOI;
      // Don't add to route yet - it will be added in the first step
      this.debugRoute = [];
      this.debugDayRoute = [];
    }

    console.log("Debug mode enabled with complete route:", this.debugCompleteRoute);
  }

  /**
   * Disable debug mode
   */
  public disableDebugMode(): void {
    this.debugMode = false;
    this.debugStep = 0;
    this.debugRoute = [];
    this.debugCurrentPOI = null;
    this.debugAvailablePOIs = [];
    this.debugLayoutData = null;
  }

  /**
   * Get current debug state
   */
  public getDebugState(): {
    step: number;
    currentPOI: number | null;
    route: number[];
    day1Route: number[];
    day2Route: number[];
    availablePOIs: number[];
    isComplete: boolean;
    currentDay: 1 | 2;
  } {
    return {
      step: this.debugStep,
      currentPOI: this.debugCurrentPOI,
      route: this.debugRoute,
      day1Route: this.debugDay1Route,
      day2Route: this.debugDay2Route,
      availablePOIs: this.debugAvailablePOIs.map(poi => poi.id),
      isComplete: this.debugCompleteRoute ? false : true,
      currentDay: this.debugCurrentDay
    };
  }

  /**
   * Execute next step in debug mode - steps through the actual calculated route
   */
  public executeNextStep(): {
    success: boolean;
    selectedPOI?: number;
    priorities?: POIPriority[];
    error?: string;
    isComplete?: boolean;
  } {
    if (!this.debugMode || !this.debugCompleteRoute) {
      return { success: false, error: "Debug mode not enabled or no route calculated" };
    }

    // Get the current day's route
    const currentDayRoute = this.debugCurrentDay === 1 
      ? this.debugCompleteRoute.day1Route?.route 
      : this.debugCompleteRoute.day2Route?.route;

    if (!currentDayRoute || this.debugDayStep >= currentDayRoute.length) {
      // Move to next day or complete
      if (this.debugCurrentDay === 1 && this.debugCompleteRoute.day2Route?.route) {
        this.debugCurrentDay = 2;
        this.debugDayStep = 0;
        this.debugDayRoute = [];
        
        // Initialize day 2 with the end POI from day 1
        const day1EndPOI = this.debugCompleteRoute.day1Route?.route?.[this.debugCompleteRoute.day1Route.route.length - 1];
        if (day1EndPOI) {
          this.debugDayRoute = [day1EndPOI];
          this.debugCurrentPOI = day1EndPOI;
        }
        
        console.log(`Debug: Moving to Day ${this.debugCurrentDay}`);
        return { success: true, priorities: [] };
      } else {
        console.log("Debug: Route complete");
        return { success: true, isComplete: true };
      }
    }

    // Get the next POI from the calculated route
    const nextPOI = currentDayRoute[this.debugDayStep];
    if (!nextPOI) {
      return { success: false, error: "No next POI found in route" };
    }

    // Add to debug route
    this.debugRoute.push(nextPOI);
    this.debugDayRoute.push(nextPOI);
    this.debugCurrentPOI = nextPOI;
    this.debugStep++;
    this.debugDayStep++;

    // Track Day 1 vs Day 2 routes
    if (this.debugCurrentDay === 1) {
      this.debugDay1Route.push(nextPOI);
    } else {
      this.debugDay2Route.push(nextPOI);
    }

    // Calculate priorities for the current step (for score overlay)
    const priorities = this.debugAvailablePOIs.map(poi => 
      this.calculatePOIPriority(
        poi.id,
        poi.type,
        poi.estimatedTime,
        poi.estimatedRunes,
        [],
        0,
        this.debugCurrentPOI || undefined
      )
    );

    console.log(`Debug Step ${this.debugStep} (Day ${this.debugCurrentDay}): Selected POI ${nextPOI}`);
    
    return {
      success: true,
      selectedPOI: nextPOI,
      priorities: priorities
    };
  }

  /**
   * Get current step priorities for score overlay
   */
  public getCurrentStepPriorities(): POIPriority[] {
    if (!this.debugMode || !this.debugCurrentPOI) {
      return [];
    }

    return this.debugAvailablePOIs.map(poi => 
      this.calculatePOIPriority(
        poi.id,
        poi.type,
        poi.estimatedTime,
        poi.estimatedRunes,
        [],
        0,
        this.debugCurrentPOI || undefined
      )
    );
  }
} 