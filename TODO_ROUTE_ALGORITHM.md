# Route Algorithm Implementation TODO List

## Current Status: ✅ POI Data Source Fixed
- [x] Replace static POI list with dynamic POI data from loaded layout
- [x] Use layoutData from tRPC query to get actual POIs
- [x] Map layout POI entries to coordinate data from `poi_coordinates_with_ids.json`
- [x] Create centralized POI utilities (`src/utils/poiUtils.ts`)
- [x] Ensure all 213 POIs are available (not just 159)
- [x] Fix POI type determination to use layout data as single source of truth

## TODO: State Reset on Seed Change
- [ ] Clear route state when seed changes
- [ ] Remove route line from map when new seed is loaded
- [ ] Reset priority calculations
- [ ] Ensure "Calculate Route" button resets previous calculations

## TODO: Fix Stonesword Keys Counter
- [ ] Ensure counter updates only when team member toggles change
- [ ] Prevent counter reset when seed changes
- [ ] Tie counter directly to team composition toggles
- [ ] Verify counter logic in TeamComposition component

## TODO: Improve Data Flow
- [x] Use existing `layoutData` from tRPC query
- [x] Extract POI information from layout data
- [x] Pass correct POI data to route calculator
- [x] Create centralized POI utilities

## TODO: Route Calculation Algorithm
- [ ] Implement A* pathfinding algorithm
- [ ] Add distance calculations between POIs
- [ ] Implement class-specific modifiers for priority scoring
- [ ] Add Nightlord weakness targeting
- [ ] Implement circle constraint penalties
- [ ] Add day-specific logic (day 1 vs day 2 routing)
- [ ] Implement circle positioning logic
- [ ] Add route transition between days

## TODO: UI/UX Improvements
- [ ] Test route line visualization with real POI data
- [ ] Verify debug panel shows correct POI types
- [ ] Ensure consistent POI naming across all components
- [ ] Test "Route Debug" button functionality

## TODO: Documentation
- [ ] Update algorithm documentation with single source of truth
- [ ] Document POI ID convention (1-213, not 1-159)
- [ ] Document centralized POI utilities
- [ ] Create API documentation for POI data flow

## TODO: Testing & Validation
- [ ] Test with different seed numbers
- [ ] Verify POI extraction from layout files
- [ ] Test route calculation with various team compositions
- [ ] Validate POI type determination accuracy

## Single Source of Truth Documentation
**POI Data Source**: `public/assets/maps/poi_coordinates_with_ids.json`
- Contains all 213 POIs with exact coordinates
- ID range: 1-213 (not 1-159)
- Used by: `src/utils/poiDataLoader.ts`

**POI Type Determination**: `src/utils/poiUtils.ts`
- `getPOITypeFromValue()` - determines type from layout value
- `getPOIStats()` - gets time/rune estimates
- `extractPOIsFromLayout()` - extracts POIs from layout data
- `getPOIDisplayName()` - gets consistent display names

**Layout Data Source**: `reference_material/pattern_layouts/layout_XXX.json`
- Contains actual POIs present in each seed
- Used by: `src/utils/poiUtils.ts` via `extractPOIsFromLayout()`

## Notes
- All POI operations should use the centralized utilities in `src/utils/poiUtils.ts`
- POI IDs must be 1-213, not 1-159
- Layout data is the authoritative source for which POIs are present
- Route calculation should only consider POIs present in the current layout

---
**Last Updated**: [Current Date]
**Next Priority**: State Reset on Seed Change 