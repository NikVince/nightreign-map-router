# Route Optimization Algorithm Implementation Guide

## Overview
This document outlines the step-by-step implementation of the route optimization algorithm for Elden Ring: Nightreign. The algorithm calculates optimal paths between POIs based on priority scores, team composition, and various game state counters.

## ✅ IMPLEMENTED: Day 1 and Day 2 Route Logic

### Current Implementation Status
- ✅ **Day 1 Route**: Spawn Location → Night 1 Circle Location (Red Line)
- ✅ **Day 2 Route**: Night 1 Circle Location → Night 2 Circle Location (Bright Blue Line)
- ✅ **15-Minute Time Constraint**: Each day has 900 seconds of exploration time
- ✅ **No Duplicate POI Visits**: POIs visited on Day 1 are excluded from Day 2
- ✅ **Visual Distinction**: Red line for Day 1, bright blue line for Day 2
- ✅ **Debug Panel**: Separate sections for each day's route with improved readability

### Route Calculation Flow
1. **Extract Start/End Points**: From layout data (Spawn Point, Night 1 Circle, Night 2 Circle)
2. **Calculate Day 1 Route**: Spawn → Intermediate POIs → Night 1 Circle
3. **Calculate Day 2 Route**: Night 1 Circle → Intermediate POIs → Night 2 Circle
4. **Track Visited POIs**: Prevent duplicates between days
5. **Visualize Routes**: Red line for Day 1, bright blue line for Day 2

## 🔄 REVISED: POI Scoring System (Implementation Pending)

### New Scoring Architecture
**Total Score = Base Score (0-50) + Bonus Score (0-50) - Distance Penalty (0-∞)**

#### Base Score System (0-50 points)
Each POI type gets a base score from 0-50 based on fundamental value:

```typescript
const POI_BASE_SCORES: Record<LandmarkType, number> = {
  [LandmarkType.Church]: 25,           // Sacred Flask charge
  [LandmarkType.GreatChurch]: 20,      // Flask + Stonesword Key + Boss
  [LandmarkType.Fort]: 20,             // Stonesword Key + Treasure Maps
  [LandmarkType.MainEncampment]: 15,   // Merchant + Smithing + Boss
  [LandmarkType.Ruins]: 15,            // Underground boss + Guaranteed loot
  [LandmarkType.SorcerersRise]: 10,    // Risk-free rewards + Staves/Seals
  [LandmarkType.Evergaol]: 20,         // Boss encounter + High runes
  [LandmarkType.Castle]: 25,           // Guaranteed talisman + Massive runes
  [LandmarkType.Tunnel]: 10,           // Smithing Stone + Map traversal
  [LandmarkType.Township]: 0,          // Safe merchant + Enhanced inventory
  [LandmarkType.ArenaBoss]: 15,        // Moderate rune rewards
  [LandmarkType.FieldBoss]: 15,        // Variable based on boss strength
  [LandmarkType.RottedWoods]: 25,      // Favor of the Forest + Rally mechanic
  [LandmarkType.RotBlessing]: 20,      // Special event bonus
  // Secondary elements (0 points - no base value)
  [LandmarkType.SiteOfGrace]: 0,
  [LandmarkType.SpectralHawkTree]: 0,
  [LandmarkType.Spiritstream]: 0,
  [LandmarkType.Scarab]: 0,
  [LandmarkType.TunnelEntrance]: 0,
};
```

#### Bonus Score System (0-50 points)
Additional points based on contextual factors:

1. **Elemental Affinity Bonus** (+20 points):
   - Camps with elemental damage matching Nightlord weakness: +20
   - Example: Fire camp vs Gnoster (Fire weakness) = +20

2. **Team Composition Bonus** (0-40 points):
   - Sorcerer's Rise: +40 if team is 100% magic users (Recluse, Revenant, Duchess)
   - Scales percentage-wise: 1/1 = 40, 1/2 = 20, 2/3 = 27, etc.
   - Other class-specific bonuses to be defined

3. **Strategic Bonus** (0-20 points):
   - Circle proximity bonus: +10 if near current circle
   - Resource scarcity bonus: +10 if few alternatives available
   - Level accessibility bonus: +10 if matches current player level

#### Distance Penalty System
**Distance Penalty = (Distance to last visited POI / Maximum map distance) × 50**

- **Purpose**: Prevent teleporting across the map
- **Calculation**: Based on actual coordinates from `poi_coordinates_with_ids.json`
- **Maximum Penalty**: 50 points (reduces score to minimum)
- **Implementation**: Use Euclidean distance or Manhattan distance

### Implementation Priority
1. **Phase 1**: Implement base score system (0-50)
2. **Phase 2**: Implement bonus score system (0-50)
3. **Phase 3**: Implement distance penalty system
4. **Phase 4**: Integrate with existing route calculation

### Benefits of New System
- **More Balanced**: Base scores reflect fundamental value
- **Contextual**: Bonus scores adapt to current game state
- **Realistic**: Distance penalties prevent unrealistic routing
- **Scalable**: Easy to add new bonus rules
- **Transparent**: Clear separation of scoring factors

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

#### 5. **Visited POIs Counter** ✅ IMPLEMENTED
- **Purpose**: Tracks POIs visited to prevent duplicates between days
- **Increment**: Add POI ID when visited
- **Usage**: Excludes visited POIs from subsequent day calculations

## Implementation Phases

### Phase 1: Core State Management ✅ COMPLETED
**Goal**: Implement basic counter system and state tracking

#### 1.1 Create State Management System ✅
- [x] Create `RouteState` interface with all counters
- [x] Implement state update functions for each counter
- [x] Add state persistence between route calculations
- [x] Create state validation functions

#### 1.2 Implement Counter Logic ✅
- [x] **Runes Counter**: Add POI rune rewards to total
- [x] **Level Counter**: Auto-calculate level from runes (use actual Elden Ring thresholds)
- [x] **Keys Counter**: Track Stonesword Key acquisition/usage
- [x] **Timer Counter**: Subtract POI completion times
- [x] **Visited POIs Counter**: Track POIs to prevent duplicates

#### 1.3 Add State Debugging ✅
- [x] Create debug panel showing current counter values
- [x] Add state logging for development
- [x] Implement state reset functionality

### Phase 2: Route Calculation Engine ✅ COMPLETED
**Goal**: Implement core pathfinding and priority scoring

#### 2.1 Priority Scoring System ✅
- [x] Implement base priority scores from POI_INFO_FOR_ALGORITHM.md
- [x] Add time-based priority adjustments
- [x] Implement class-specific modifiers
- [x] Add Nightlord weakness targeting

#### 2.2 Pathfinding Algorithm ✅
- [x] Implement A* pathfinding between POIs
- [x] Add distance calculation functions using coordinates from `poi_coordinates_with_ids.json`
- [x] Create route optimization logic
- [x] Implement alternative route generation

#### 2.3 Dynamic Priority Adjustments ✅
- [x] Add circle constraint penalties
- [x] Implement time-based priority changes
- [x] Add level-based accessibility checks
- [x] Create Stonesword Key dependency logic

### Phase 3: Day-Specific Route Logic ✅ COMPLETED
**Goal**: Implement day 1 and day 2 specific routing

#### 3.1 Day 1 Route Implementation ✅
- [x] **Start Point**: Always begin at Spawn location (from layout)
- [x] **End Point**: Always end at Night 1 circle location (from layout)
- [x] **Priority Focus**: Churches, Forts, early-game POIs
- [x] **Time Management**: Optimize for 15-minute cycle

#### 3.2 Day 2 Route Implementation ✅
- [x] **Start Point**: Begin at Night 1 circle location (from layout)
- [x] **End Point**: End at Night 2 circle location (from layout)
- [x] **Priority Focus**: High-value POIs, Shifting Earth events
- [x] **Advanced Targeting**: Nightlord weakness POIs

#### 3.3 Route Transition Logic ✅
- [x] Implement day 1 → day 2 state transfer
- [x] Add level progression between days
- [x] Create inventory carryover system
- [x] Implement circle positioning logic

### Phase 4: UI Integration ✅ COMPLETED
**Goal**: Connect algorithm to user interface

#### 4.1 Calculate Route Button ✅
- [x] Add "Calculate Route" button to Team Composition pane
- [x] Implement button click handler
- [x] Add loading state during calculation
- [x] Create error handling for failed calculations

#### 4.2 Route Visualization ✅
- [x] **Activate Debug Line**: Re-enable the red line drawing logic
- [x] **Route Display**: Show calculated route on map
- [x] **POI Highlighting**: Highlight route POIs
- [x] **Route Information**: Display route details in sidebar

#### 4.3 Real-time Updates ✅
- [x] Implement route recalculation on team composition changes
- [x] Add route updates on layout changes
- [x] Create live counter updates
- [x] Add route comparison features

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

### Data Structures ✅ IMPLEMENTED

#### RouteState Interface ✅
```typescript
interface RouteState {
  runesGained: number;
  playerLevel: number;
  stoneswordKeys: number;
  remainingTime: number; // in seconds
  visitedPOIs: number[]; // ✅ ADDED: Track POIs visited between days
  currentDay: 1 | 2;
  teamComposition: TeamMember[];
  nightlord: Nightlord;
  currentLayout: number; // 1-320
  availablePOIs: POI[]; // Only POIs present in current layout
}
```

#### DayRoute Interface ✅ NEW
```typescript
interface DayRoute {
  day: 1 | 2;
  startPOI: number; // Spawn location for day 1, Night 1 circle for day 2
  endPOI: number; // Night 1 circle for day 1, Night 2 circle for day 2
  route: number[]; // POIs to visit between start and end
  totalTime: number;
  totalDistance: number;
  priorities: Record<number, number>;
}
```

#### CompleteRoute Interface ✅ NEW
```typescript
interface CompleteRoute {
  day1Route: DayRoute;
  day2Route: DayRoute;
  totalRunes: number;
  totalTime: number;
  notes?: string;
}
```

#### POIPriority Interface ✅
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

### Algorithm Flow ✅ IMPLEMENTED

#### 1. State Initialization ✅
- Initialize counters based on current game state
- Set start/end points based on current day and layout
- Load team composition and Nightlord data
- Extract available POIs from current layout

#### 2. POI Priority Calculation ✅
- Calculate base priority from POI_INFO_FOR_ALGORITHM.md
- Apply time-based adjustments
- Add class-specific modifiers
- Apply Nightlord weakness bonuses
- **CRITICAL**: Only consider POIs present in current layout

#### 3. Route Generation ✅
- Use A* algorithm to find optimal path between available POIs
- Consider distance, time, and priority
- Generate alternative routes
- Validate route against constraints
- **CRITICAL**: Use coordinates from `poi_coordinates_with_ids.json`

#### 4. State Updates ✅
- Update counters based on selected route
- Calculate new player level
- Update remaining time
- Track visited POIs

#### 5. Route Visualization ✅
- Draw route line on map using actual coordinates
- Highlight selected POIs
- Display route information
- Show counter updates

## Development Workflow

### Testing Strategy ✅ IMPLEMENTED
1. **Unit Tests**: Test individual counter logic
2. **Integration Tests**: Test route calculation with actual layout data
3. **UI Tests**: Test button functionality and route display
4. **Performance Tests**: Ensure algorithm runs efficiently

### Debug Features ✅ IMPLEMENTED
- **State Panel**: Show all counter values in real-time
- **Route Log**: Log all route decisions and calculations
- **Priority Debug**: Show priority calculations for each POI
- **Performance Monitor**: Track algorithm execution time
- **Layout Debug**: Show current layout and available POIs

### Development Phases ✅ COMPLETED
1. **Phase 1**: Basic state management ✅ (1-2 days)
2. **Phase 2**: Core algorithm implementation ✅ (2-3 days)
3. **Phase 3**: Day-specific logic ✅ (1-2 days)
4. **Phase 4**: UI integration ✅ (1-2 days)
5. **Phase 5**: Advanced features (2-3 days)

## Integration Points ✅ IMPLEMENTED

### Existing Code Integration ✅
- **MapCanvas.tsx**: Route line drawing logic ✅
- **TeamComposition.tsx**: Calculate Route button ✅
- **Sidebar.tsx**: Route information display ✅
- **POI_INFO_FOR_ALGORITHM.md**: Priority score data ✅

### New Components Implemented ✅
- **RouteCalculator.ts**: Core algorithm implementation ✅
- **RouteState.ts**: State management system ✅
- **RouteVisualizer.tsx**: Route display component ✅
- **RouteDebugPanel.tsx**: Debug information display ✅

## Success Metrics ✅ ACHIEVED

### Algorithm Performance ✅
- **Calculation Time**: < 100ms for route generation ✅
- **Accuracy**: Routes should match community-validated optimal paths ✅
- **Reliability**: Algorithm should handle all 320 map patterns ✅

### User Experience ✅
- **Responsiveness**: Route calculation should feel instant ✅
- **Clarity**: Route visualization should be clear and intuitive ✅
- **Flexibility**: Easy to recalculate routes with different parameters ✅

### Development Efficiency ✅
- **Modularity**: Easy to modify individual components ✅
- **Testability**: All logic should be unit testable ✅
- **Maintainability**: Clear code structure and documentation ✅

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

### Data Source Compliance ✅
- **NEVER** create mock data or placeholder values ✅
- **ALWAYS** use `poi_coordinates_with_ids.json` for coordinates ✅
- **ALWAYS** use `poi_name_coordinate_map.js` for POI names ✅
- **ALWAYS** extract POIs from current layout file ✅

### Layout-Based Calculation ✅
- **ONLY** calculate routes from POIs present in current layout ✅
- **NEVER** consider POIs not visible on the current map ✅
- **ALWAYS** validate POI availability before route calculation ✅

### Data Synchronization ✅
- **ALWAYS** filter out POIs with "empty" values in route calculations ✅
- **NEVER** include POIs with `value: "empty"` or `value: "POI X: empty"` in route logic ✅
- **ALWAYS** ensure priority calculations and route visualization use the same filtered data ✅
- **ALWAYS** validate that POI coordinates exist before including in calculations ✅

### Code Quality ✅
- **ALWAYS** reference this document before making routing changes ✅
- **NEVER** duplicate POI data in code ✅
- **ALWAYS** use centralized POI utilities ✅
- **NEVER** hardcode POI coordinates or names ✅
- **ALWAYS** show all priority calculations in debug panels (no artificial limits) ✅

### Debug and Validation ✅
- **ALWAYS** log the number of POIs filtered vs valid POIs for debugging ✅
- **ALWAYS** ensure route line connections match priority calculation entries ✅
- **ALWAYS** validate that both static and dynamic POIs are properly synchronized ✅
- **ALWAYS** test with different layouts to ensure filtering works correctly ✅

### Route and Priority Calculation Synchronization ✅
- **CRITICAL**: The red debug line MUST follow the priority calculations exactly ✅
- **ALWAYS** ensure route POIs are in the same order as priority calculations ✅
- **NEVER** allow discrepancies between priority calculations and route visualization ✅
- **ALWAYS** validate that route generation uses the exact priority order ✅
- **ALWAYS** log route synchronization validation for debugging ✅
- **ALWAYS** ensure POI 104 (Redmane Knights) appears in both priority calculations and route if available in layout ✅

### Day 1 and Day 2 Route Logic ✅
- **CRITICAL**: Day 1 route MUST start at Spawn Location and end at Night 1 Circle ✅
- **CRITICAL**: Day 2 route MUST start at Night 1 Circle and end at Night 2 Circle ✅
- **ALWAYS** use layout data to determine exact start/end POI IDs ✅
- **NEVER** allow POIs visited on Day 1 to be visited again on Day 2 ✅
- **ALWAYS** display Day 1 route as red line and Day 2 route as bright blue line ✅
- **ALWAYS** maintain 15-minute time constraint per day ✅

This implementation guide will be updated as development progresses, serving as a living document for the route optimization algorithm development process. 