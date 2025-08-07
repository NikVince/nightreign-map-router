# Route Optimization Algorithm Implementation Guide

## Overview
This document outlines the step-by-step implementation of the route optimization algorithm for Elden Ring: Nightreign. The algorithm will calculate optimal paths between POIs based on priority scores, team composition, and various game state counters.

## CRITICAL: Single Source of Truth for POI Data

### Authoritative Data Sources
**NEVER create mock data or placeholder values. Use ONLY these sources:**

1. **`public/assets/maps/poi_coordinates_with_ids.json`**
   - Contains all 213 POIs with exact coordinates (IDs 1-213)
   - **ONLY** authoritative source for POI coordinates
   - Used by: All route calculation and visualization components

2. **`public/assets/maps/coordinates_backup/poi_name_coordinate_map.js`**
   - Contains POI names mapped to coordinates
   - **ONLY** authoritative source for POI naming
   - Used by: POI identification and display components

3. **`reference_material/pattern_layouts/layout_XXX.json`**
   - Contains POIs present in each specific seed (1-320)
   - **ONLY** authoritative source for which POIs are available in current layout
   - Used by: Route calculation to determine available POIs

### Static (Fixed) vs Dynamic (Layout-Based) POIs

#### Static/Fixed POIs
- **Definition:** POIs that are always present for a given map tile layout, regardless of the current pattern/layout_XXX.json (e.g., Sites of Grace, Spirit Streams, Spectral Hawk Trees, Scarabs, Buried Treasures, etc.).
- **Source:** Defined in the master coordinate files (e.g., `poi_coordinates_with_ids.json` and map-specific coordinate files in `/public/assets/maps/coordinates/`).
- **Shifting Earth Events:** The set of static POIs can change depending on the active Shifting Earth event, as each event can have its own map tile layout and thus its own set of fixed POIs. The correct coordinate file is loaded based on the event (e.g., `the_crater_map_layout.json` for Crater event).
- **Rendering:** Always rendered if their category is enabled, regardless of the current dynamic layout.

#### Dynamic POIs
- **Definition:** POIs determined by the currently loaded `layout_XXX.json` file (i.e., the current seed/pattern). Represent variable content for each run.
- **Source:** Extracted from the current layout file, then mapped to coordinates and IDs using the master coordinate list.
- **Rendering:** Only POIs present in the current layout are rendered as dynamic POIs.

#### Combination and Filtering
- The system **combines** dynamic POIs (from the current layout) with static POIs (from the coordinate files) to produce the full set of visible icons.
- **Duplicates** are removed based on coordinate proximity.
- **Category filtering** allows users to toggle which types of POIs are visible.

#### Shifting Earth Event Handling
- The active Shifting Earth event determines which map tile layout and static POI set is used.
- Both static and dynamic POIs must be mapped to the correct layout.

#### Implementation Principle: Avoid Code Duplication
- **Do not duplicate code unless there is a clear, documented benefit.**
- If duplication is necessary for performance or maintainability, document the reason and the benefit in this file.

### Layout-Based Route Calculation
**Routes must be calculated SOLELY from POIs present in the currently loaded layout and the static POIs for the current map tile layout:**

- **Input**: Current `layout_XXX.json` file based on selected seed, plus static POIs for the current map tile layout (including Shifting Earth event if active)
- **Process**: Extract POIs from layout → Combine with static POIs → Map to coordinates from `poi_coordinates_with_ids.json`
- **Output**: Route only through POIs that appear in the layout and have visible icons
- **Constraint**: Never consider POIs not present in the current layout or static set for the current map tile layout

### Data Flow Architecture
```
Layout Selection & Shifting Earth → Extract Dynamic POIs & Load Static POIs → Combine & Map to Coordinates → Calculate Route → Visualize
     ↓                                 ↓                        ↓                    ↓              ↓
layout_XXX.json & map_layout.json → POI List (dynamic + static) → poi_coordinates_with_ids.json → Route Algorithm → Map Display
```

## Core Algorithm Architecture

### State Management Counters
The algorithm maintains several critical counters that influence route decisions:

#### 1. **Runes Gained Counter**
- **Purpose**: Tracks total runes collected during the expedition
- **Increment**: Add estimated rune rewards from each visited POI
- **Source**: POI_INFO_FOR_ALGORITHM.md rune values
- **Usage**: Determines player level and influences POI priority

#### 2. **Player Level**
- **Purpose**: Tracks current player level for difficulty calculations
- **Increment**: Automatic based on runes gained counter
- **Thresholds**: Based on actual Elden Ring level requirements
- **Usage**: Determines which POIs are viable targets

#### 3. **Stonesword Keys Counter**
- **Purpose**: Tracks available keys for Evergaol access
- **Increment**: +1 when visiting Forts or Great Churches
- **Decrement**: -1 when visiting Evergaols
- **Usage**: Determines Evergaol accessibility

#### 4. **Countdown Timer**
- **Purpose**: Tracks remaining time in the day cycle
- **Start Value**: 15 minutes (900 seconds)
- **Decrement**: Subtract estimated completion time for each visited POI
- **Usage**: Determines route viability and circle constraints

## Implementation Phases

### Phase 1: Core State Management
**Goal**: Implement basic counter system and state tracking

#### 1.1 Create State Management System
- [ ] Create `RouteState` interface with all counters
- [ ] Implement state update functions for each counter
- [ ] Add state persistence between route calculations
- [ ] Create state validation functions

#### 1.2 Implement Counter Logic
- [ ] **Runes Counter**: Add POI rune rewards to total
- [ ] **Level Counter**: Auto-calculate level from runes (use actual Elden Ring thresholds)
- [ ] **Keys Counter**: Track Stonesword Key acquisition/usage
- [ ] **Timer Counter**: Subtract POI completion times

#### 1.3 Add State Debugging
- [ ] Create debug panel showing current counter values
- [ ] Add state logging for development
- [ ] Implement state reset functionality

### Phase 2: Route Calculation Engine
**Goal**: Implement core pathfinding and priority scoring

#### 2.1 Priority Scoring System
- [ ] Implement base priority scores from POI_INFO_FOR_ALGORITHM.md
- [ ] Add time-based priority adjustments
- [ ] Implement class-specific modifiers
- [ ] Add Nightlord weakness targeting

#### 2.2 Pathfinding Algorithm
- [ ] Implement A* pathfinding between POIs
- [ ] Add distance calculation functions using coordinates from `poi_coordinates_with_ids.json`
- [ ] Create route optimization logic
- [ ] Implement alternative route generation

#### 2.3 Dynamic Priority Adjustments
- [ ] Add circle constraint penalties
- [ ] Implement time-based priority changes
- [ ] Add level-based accessibility checks
- [ ] Create Stonesword Key dependency logic

### Phase 3: Day-Specific Route Logic
**Goal**: Implement day 1 and day 2 specific routing

#### 3.1 Day 1 Route Implementation
- [ ] **Start Point**: Always begin at Spawn location (from layout)
- [ ] **End Point**: Always end at Night 1 circle location (from layout)
- [ ] **Priority Focus**: Churches, Forts, early-game POIs
- [ ] **Time Management**: Optimize for 15-minute cycle

#### 3.2 Day 2 Route Implementation
- [ ] **Start Point**: Begin at Night 1 circle location (from layout)
- [ ] **End Point**: End at Night 2 circle location (from layout)
- [ ] **Priority Focus**: High-value POIs, Shifting Earth events
- [ ] **Advanced Targeting**: Nightlord weakness POIs

#### 3.3 Route Transition Logic
- [ ] Implement day 1 → day 2 state transfer
- [ ] Add level progression between days
- [ ] Create inventory carryover system
- [ ] Implement circle positioning logic

### Phase 4: UI Integration
**Goal**: Connect algorithm to user interface

#### 4.1 Calculate Route Button
- [ ] Add "Calculate Route" button to Team Composition pane
- [ ] Implement button click handler
- [ ] Add loading state during calculation
- [ ] Create error handling for failed calculations

#### 4.2 Route Visualization
- [ ] **Activate Debug Line**: Re-enable the red line drawing logic
- [ ] **Route Display**: Show calculated route on map
- [ ] **POI Highlighting**: Highlight route POIs
- [ ] **Route Information**: Display route details in sidebar

#### 4.3 Real-time Updates
- [ ] Implement route recalculation on team composition changes
- [ ] Add route updates on layout changes
- [ ] Create live counter updates
- [ ] Add route comparison features

### Phase 5: Advanced Features
**Goal**: Implement sophisticated routing features

#### 5.1 Team Composition Integration
- [ ] Add class-specific POI preferences
- [ ] Implement team synergy bonuses
- [ ] Create class-specific route recommendations
- [ ] Add team size considerations (solo/duo/trio)

#### 5.2 Shifting Earth Event Integration
- [ ] Add Shifting Earth event detection
- [ ] Implement event-specific routing logic
- [ ] Create event reward calculations
- [ ] Add event difficulty adjustments

#### 5.3 Circle Constraint Logic
- [ ] Implement circle phase detection
- [ ] Add circle-based POI filtering
- [ ] Create circle timing adjustments
- [ ] Add circle safety calculations

## Technical Implementation Details

### Data Structures

#### RouteState Interface
```typescript
interface RouteState {
  runesGained: number;
  playerLevel: number;
  stoneswordKeys: number;
  remainingTime: number; // in seconds
  visitedPOIs: number[];
  currentDay: 1 | 2;
  teamComposition: TeamMember[];
  nightlord: Nightlord;
  currentLayout: number; // 1-320
  availablePOIs: POI[]; // Only POIs present in current layout
}
```

#### POIPriority Interface
```typescript
interface POIPriority {
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
  coordinates: [number, number]; // From poi_coordinates_with_ids.json
}
```

### Algorithm Flow

#### 1. State Initialization
- Initialize counters based on current game state
- Set start/end points based on current day and layout
- Load team composition and Nightlord data
- Extract available POIs from current layout

#### 2. POI Priority Calculation
- Calculate base priority from POI_INFO_FOR_ALGORITHM.md
- Apply time-based adjustments
- Add class-specific modifiers
- Apply Nightlord weakness bonuses
- **CRITICAL**: Only consider POIs present in current layout

#### 3. Route Generation
- Use A* algorithm to find optimal path between available POIs
- Consider distance, time, and priority
- Generate alternative routes
- Validate route against constraints
- **CRITICAL**: Use coordinates from `poi_coordinates_with_ids.json`

#### 4. State Updates
- Update counters based on selected route
- Calculate new player level
- Update remaining time
- Track visited POIs

#### 5. Route Visualization
- Draw route line on map using actual coordinates
- Highlight selected POIs
- Display route information
- Show counter updates

## Development Workflow

### Testing Strategy
1. **Unit Tests**: Test individual counter logic
2. **Integration Tests**: Test route calculation with actual layout data
3. **UI Tests**: Test button functionality and route display
4. **Performance Tests**: Ensure algorithm runs efficiently

### Debug Features
- **State Panel**: Show all counter values in real-time
- **Route Log**: Log all route decisions and calculations
- **Priority Debug**: Show priority calculations for each POI
- **Performance Monitor**: Track algorithm execution time
- **Layout Debug**: Show current layout and available POIs

### Development Phases
1. **Phase 1**: Basic state management (1-2 days)
2. **Phase 2**: Core algorithm implementation (2-3 days)
3. **Phase 3**: Day-specific logic (1-2 days)
4. **Phase 4**: UI integration (1-2 days)
5. **Phase 5**: Advanced features (2-3 days)

## Integration Points

### Existing Code Integration
- **MapCanvas.tsx**: Route line drawing logic
- **TeamComposition.tsx**: Calculate Route button
- **Sidebar.tsx**: Route information display
- **POI_INFO_FOR_ALGORITHM.md**: Priority score data

### New Components Needed
- **RouteCalculator.ts**: Core algorithm implementation
- **RouteState.ts**: State management system
- **RouteVisualizer.tsx**: Route display component
- **RouteDebugPanel.tsx**: Debug information display

## Success Metrics

### Algorithm Performance
- **Calculation Time**: < 100ms for route generation
- **Accuracy**: Routes should match community-validated optimal paths
- **Reliability**: Algorithm should handle all 320 map patterns

### User Experience
- **Responsiveness**: Route calculation should feel instant
- **Clarity**: Route visualization should be clear and intuitive
- **Flexibility**: Easy to recalculate routes with different parameters

### Development Efficiency
- **Modularity**: Easy to modify individual components
- **Testability**: All logic should be unit testable
- **Maintainability**: Clear code structure and documentation

## Future Enhancements

### Advanced Features
- **Machine Learning**: Learn from community route data
- **Real-time Updates**: Update routes based on live game state
- **Route Sharing**: Allow users to share optimal routes
- **Performance Analytics**: Track route success rates

### Optimization Opportunities
- **Caching**: Cache route calculations for similar states
- **Parallel Processing**: Calculate multiple route options simultaneously
- **Predictive Routing**: Anticipate optimal routes based on patterns

## CRITICAL REMINDERS

### Data Source Compliance
- **NEVER** create mock data or placeholder values
- **ALWAYS** use `poi_coordinates_with_ids.json` for coordinates
- **ALWAYS** use `poi_name_coordinate_map.js` for POI names
- **ALWAYS** extract POIs from current layout file

### Layout-Based Calculation
- **ONLY** calculate routes from POIs present in current layout
- **NEVER** consider POIs not visible on the current map
- **ALWAYS** validate POI availability before route calculation

### Data Synchronization
- **ALWAYS** filter out POIs with "empty" values in route calculations
- **NEVER** include POIs with `value: "empty"` or `value: "POI X: empty"` in route logic
- **ALWAYS** ensure priority calculations and route visualization use the same filtered data
- **ALWAYS** validate that POI coordinates exist before including in calculations

### Code Quality
- **ALWAYS** reference this document before making routing changes
- **NEVER** duplicate POI data in code
- **ALWAYS** use centralized POI utilities
- **NEVER** hardcode POI coordinates or names
- **ALWAYS** show all priority calculations in debug panels (no artificial limits)

### Debug and Validation
- **ALWAYS** log the number of POIs filtered vs valid POIs for debugging
- **ALWAYS** ensure route line connections match priority calculation entries
- **ALWAYS** validate that both static and dynamic POIs are properly synchronized
- **ALWAYS** test with different layouts to ensure filtering works correctly

### Route and Priority Calculation Synchronization
- **CRITICAL**: The red debug line MUST follow the priority calculations exactly
- **ALWAYS** ensure route POIs are in the same order as priority calculations
- **NEVER** allow discrepancies between priority calculations and route visualization
- **ALWAYS** validate that route generation uses the exact priority order
- **ALWAYS** log route synchronization validation for debugging
- **ALWAYS** ensure POI 104 (Redmane Knights) appears in both priority calculations and route if available in layout

This implementation guide will be updated as development progresses, serving as a living document for the route optimization algorithm development process. 