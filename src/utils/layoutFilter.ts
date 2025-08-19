import { Nightlord } from "~/types/core";

export interface LayoutMatch {
  layoutId: number;
  score: number;
  confidence: number;
  nightlord: string;
  event: string;
}

export interface ChurchLocation {
  id: number;
  x: number;
  y: number;
  name: string;
}

export interface FilteringState {
  nightlord: string;
  event: string;
  selectedChurches: ChurchLocation[];
}

/**
 * Three-stage layout filtering algorithm
 * Stage 1: Filter by Nightlord (320 → 40 layouts)
 * Stage 2: Filter by map tile layout/event (40 → 5-20 layouts)
 * Stage 3: Filter by POI patterns (5-20 → 1-5 layouts)
 */
export function filterLayoutsByThreeStages(
  nightlord: string,
  event: string,
  selectedChurches: ChurchLocation[]
): LayoutMatch[] {
  // Stage 1: Filter by Nightlord
  let filteredLayouts = filterLayoutsByNightlord(nightlord);
  
  // Stage 2: Filter by map tile layout/event
  filteredLayouts = filterLayoutsByEvent(filteredLayouts, event);
  
  // Stage 3: Filter by church patterns
  const finalMatches = filterLayoutsByChurches(filteredLayouts, selectedChurches);
  
  return finalMatches;
}

/**
 * Stage 1: Filter layouts by Nightlord
 * Each Nightlord has 40 layouts (0-39, 40-79, 80-119, etc.)
 */
function filterLayoutsByNightlord(nightlord: string): number[] {
  const nightlordRanges: Record<string, [number, number]> = {
    [Nightlord.Gladius]: [0, 39],
    [Nightlord.Adel]: [40, 79],
    [Nightlord.Gnoster]: [80, 119],
    [Nightlord.Fulghor]: [120, 159],
    [Nightlord.Caligo]: [160, 199],
    [Nightlord.Heolstor]: [200, 239],
    // Add other Nightlords as needed
  };
  
  const range = nightlordRanges[nightlord];
  if (!range) {
    return [];
  }
  
  const layouts: number[] = [];
  for (let i = range[0]; i <= range[1]; i++) {
    layouts.push(i);
  }
  
  return layouts;
}

/**
 * Stage 2: Filter layouts by map tile layout/event
 * Different events have different numbers of available layouts
 */
function filterLayoutsByEvent(layoutIds: number[], event: string): number[] {
  // TODO: Implement actual event-based filtering based on CSV data
  // For now, return all layouts for the selected event
  // This will be enhanced when we analyze the actual event data
  
  switch (event) {
    case "default":
      // Default map layout - return all layouts for this Nightlord
      return layoutIds;
    case "shifting_earth_1":
    case "shifting_earth_2":
    case "shifting_earth_3":
      // Shifting Earth events - reduce available layouts
      // This is a placeholder - actual logic will be based on CSV analysis
      return layoutIds.slice(0, Math.floor(layoutIds.length * 0.5)); // 50% reduction for now
    default:
      return layoutIds;
  }
}

/**
 * Stage 3: Filter layouts by church patterns
 * Find layouts that contain the selected church locations
 */
function filterLayoutsByChurches(layoutIds: number[], selectedChurches: ChurchLocation[]): LayoutMatch[] {
  if (selectedChurches.length === 0) {
    return [];
  }
  
  // TODO: Replace with actual layout data analysis
  // For now, return mock results based on the number of selected churches
  
  const layoutMatches = new Map<number, number>();
  
  // Mock scoring system - in reality, this would analyze actual layout data
  selectedChurches.forEach((church, index) => {
    // Simulate finding layouts that contain this church
    // Higher index churches get higher scores to simulate better matches
    const baseScore = 10 + index * 2;
    
    // Distribute scores across available layouts
    layoutIds.forEach((layoutId, layoutIndex) => {
      const existingScore = layoutMatches.get(layoutId) || 0;
      const newScore = existingScore + baseScore - (layoutIndex * 0.5);
      layoutMatches.set(layoutId, newScore);
    });
  });
  
  // Convert to LayoutMatch objects and sort by score
  const matches: LayoutMatch[] = Array.from(layoutMatches.entries())
    .map(([layoutId, score]) => ({
      layoutId,
      score,
      confidence: Math.min(score / (selectedChurches.length * 10), 1), // Normalize confidence
      nightlord: "Unknown", // Will be filled from actual data
      event: "Unknown" // Will be filled from actual data
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Return top 5 matches
  
  return matches;
}

/**
 * Get the best matching layout based on filtering results
 */
export function getBestLayoutMatch(matches: LayoutMatch[]): LayoutMatch | null {
  if (matches.length === 0) {
    return null;
  }
  
  // Return the highest scoring match
  return matches[0] || null;
}

/**
 * Validate filtering input parameters
 */
export function validateFilteringInput(state: FilteringState): string[] {
  const errors: string[] = [];
  
  if (!state.nightlord) {
    errors.push("Nightlord selection is required");
  }
  
  if (!state.event) {
    errors.push("Event selection is required");
  }
  
  if (state.selectedChurches.length === 0) {
    errors.push("At least one church must be selected");
  }
  
  return errors;
}
