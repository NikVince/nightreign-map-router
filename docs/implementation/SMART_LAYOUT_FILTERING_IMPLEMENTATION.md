# Smart Layout Filtering Implementation Plan

## Overview

This document outlines the implementation plan for the Smart Layout Filtering system, designed to solve the critical UX bottleneck where users must manually search through 320 layouts to find the correct map configuration.

## Problem Statement

**Current Issue**: Users waste 30-60 seconds during match start manually entering layout numbers (1-320) to find the correct map layout. This creates a poor user experience and can impact gameplay performance.

**Root Cause**: No intelligent way to identify which layout matches the current game state based on visible POIs.

## Solution: Smart Layout Filtering

### Core Concept
Instead of requiring users to manually search through 320 layouts, the system will intelligently filter layouts based on POIs the user can identify on their current map.

### Three-Stage Filtering System
1. **Nightlord Selection** - User selects their target Nightlord (reduces from 320 to 40 layouts)
2. **Map Tile Layout** - User selects the active map tile layout (reduces from 40 to 5-20 layouts)
3. **POI Pattern Recognition** - User selects visible POIs to identify the exact layout

### Phased Implementation Strategy
**Phase 1: Church-Only Filtering (Initial Release)**
- Implement filtering using only church spawn locations
- Test accuracy and user experience
- Measure how many layouts remain after filtering

**Phase 2: Enhanced POI Filtering (Future Release)**
- Add Sorcerer's Rise locations to the filtering system
- Combine Church + Sorcerer's Rise patterns for maximum accuracy
- Expected to achieve 95-98% accuracy (1-2 layouts remaining)

### User Experience Flow
1. **Find My Seed Button**: User clicks "Find My Seed" button in left sidebar (under manual seed loading)
2. **Layout Clearing**: Current layout is removed, map becomes empty, seed loading shows 0
3. **Nightlord & Event Selection**: Popup with two dropdowns for target Nightlord and shifting earth event
4. **Church Location Highlighting**: All possible church spawn locations are highlighted on the map
5. **Church Selection**: User manually selects/deselects visible churches on their map
6. **Layout Loading**: System loads correct layout and updates seed loading to show the correct seed number

### Expected Performance Improvement
- **Before**: 30-60 seconds to find correct layout
- **After**: 5-10 seconds to identify and load correct layout
- **Improvement**: 6-12x faster layout identification

### Accuracy Assessment
- **Phase 1 (Church-Only)**: Expected 80-90% accuracy (5-10 layouts remaining)
- **Phase 2 (Church + Sorcerer's Rise)**: Expected 95-98% accuracy (1-2 layouts remaining)
- **Fallback**: When multiple layouts match, user selects from visual previews

## UI/UX Implementation Specifications

### 1. Find My Seed Button Integration

#### Button Placement
- **Location**: Left sidebar, positioned under the manual seed loading section
- **Label**: "Find My Seed"
- **Styling**: Primary button style, clearly visible and accessible
- **Behavior**: Clicking clears current layout and initiates the seed finding process

#### Layout Clearing Behavior
- **Map State**: Current layout is completely removed, map becomes empty
- **Seed Display**: Seed loading number at top of left pane is reset to 0
- **Visual Feedback**: Clear indication that previous layout has been cleared

### 2. Nightlord & Event Selection Popup

#### Popup Design
- **Trigger**: Appears immediately after clicking "Find My Seed"
- **Modal Type**: Centered popup with backdrop overlay
- **Size**: Appropriate for two dropdown selections without being overwhelming

#### Dropdown Components
- **Target Nightlord Dropdown**:
  - Options: All 8 available Nightlords
  - Default: First option or "Select Nightlord" placeholder
  - Required: User must select before proceeding
  
- **Shifting Earth Event Dropdown**:
  - Options: Default map layout, Shifting Earth events
  - Default: "Default Map Layout" or first option
  - Required: User must select before proceeding

#### Navigation
- **Continue Button**: Only enabled when both dropdowns have selections
- **Cancel Button**: Closes popup and returns to empty map state

### 3. Church Location Highlighting System

#### Highlighting Behavior
- **Trigger**: After Nightlord and event selection, before church selection
- **Visual Style**: All possible church spawn locations are clearly highlighted
- **Highlight Type**: Distinct visual treatment (e.g., glowing borders, different colors)
- **Coverage**: Shows all church locations for the selected Nightlord/event combination

#### Map Interaction
- **Selection**: Users can click on highlighted locations to select/deselect
- **Visual Feedback**: Selected churches show different highlighting than available ones
- **Deselection**: Users can click again to deselect if they made an error

### 4. Church Selection Interface

#### Selection Process
- **User Action**: Manual clicking on highlighted church locations
- **Selection State**: Clear visual indication of which churches are selected
- **Deselection**: Ability to unselect churches by clicking again
- **Counter**: Visual indicator showing how many churches are currently selected

#### Confirmation
- **Button**: "Confirm Selection" button appears after at least one church is selected
- **Validation**: Ensures user has made selections before proceeding
- **Proceed**: Only enabled when churches are selected

### 5. Layout Loading & Seed Update

#### Loading Process
- **Algorithm Execution**: Three-stage filtering runs with selected parameters
- **Loading State**: Visual feedback during processing (spinner, progress bar)
- **Result**: Correct layout is identified and loaded

#### Seed Display Update
- **Automatic Update**: Seed loading number automatically updates to show correct seed
- **Visual Confirmation**: Clear indication that the correct layout has been loaded
- **Success State**: Map displays the identified layout with all POIs

## Technical Implementation

### 1. Three-Stage Filter Interface

#### Component: `FindMySeedButton.tsx`
- **Location**: `src/app/_components/FindMySeedButton.tsx`
- **Purpose**: Main entry point for the seed finding process
- **Features**:
  - Positioned under manual seed loading in left sidebar
  - Clears current layout and resets seed display to 0
  - Triggers the seed finding workflow

#### Component: `NightlordEventSelector.tsx`
- **Location**: `src/app/_components/NightlordEventSelector.tsx`
- **Purpose**: Popup interface for Nightlord and event selection
- **Features**:
  - Modal popup with two required dropdowns
  - Nightlord selection (8 options)
  - Shifting Earth event selection
  - Continue/Cancel navigation

#### Component: `ChurchLocationHighlighter.tsx`
- **Location**: `src/app/_components/ChurchLocationHighlighter.tsx`
- **Purpose**: Highlights and manages church location selection
- **Features**:
  - Highlights all possible church spawn locations
  - Handles click selection/deselection
  - Visual feedback for selected vs. available churches
  - Confirmation button for proceeding

#### Component: `POIPicker.tsx`
- **Location**: `src/app/_components/POIPicker.tsx`
- **Purpose**: Interactive interface for users to select visible POIs
- **Features**:
  - Visual POI selection grid
  - Search/filter POIs by name or type
  - Selected POI highlighting
  - Clear selection option

#### Interface Design
```typescript
interface POIPickerProps {
  onPOISelection: (selectedPOIs: SelectedPOI[]) => void;
  onLayoutFound: (layoutNumber: number) => void;
}

interface SelectedPOI {
  id: number;
  name: string;
  coordinates: [number, number];
  type: string;
}
```

### 2. Three-Stage Layout Filtering Algorithm

#### Core Function: `filterLayoutsByThreeStages`
- **Location**: `src/utils/layoutFilter.ts`
- **Purpose**: Filter 320 layouts using the three-stage approach
- **Algorithm**:
  1. **Stage 1**: Filter by Nightlord (320 → 40 layouts)
  2. **Stage 2**: Filter by map tile layout (40 → 5-20 layouts)
  3. **Stage 3**: Filter by POI patterns (5-20 → 1-5 layouts)

#### Core Function: `filterLayoutsByPOIs`
- **Location**: `src/utils/layoutFilter.ts`
- **Purpose**: Filter layouts based on selected POIs (Stage 3)
- **Algorithm**:
  1. For each selected POI, find layouts containing that POI
  2. Calculate intersection of matching layouts
  3. Rank results by number of matching POIs
  4. Return top 5 most likely matches

#### Implementation Logic
```typescript
function filterLayoutsByThreeStages(
  nightlord: string,
  mapTileLayout: string,
  selectedPOIs: SelectedPOI[]
): LayoutMatch[] {
  // Stage 1: Filter by Nightlord
  let filteredLayouts = filterLayoutsByNightlord(nightlord);
  
  // Stage 2: Filter by map tile layout
  filteredLayouts = filterLayoutsByMapTile(filteredLayouts, mapTileLayout);
  
  // Stage 3: Filter by POI patterns
  return filterLayoutsByPOIs(filteredLayouts, selectedPOIs);
}

function filterLayoutsByPOIs(availableLayouts: number[], selectedPOIs: SelectedPOI[]): LayoutMatch[] {
  const layoutMatches = new Map<number, number>();
  
  selectedPOIs.forEach(poi => {
    const matchingLayouts = findLayoutsWithPOI(poi, availableLayouts);
    matchingLayouts.forEach(layoutId => {
      layoutMatches.set(layoutId, (layoutMatches.get(layoutId) || 0) + 1);
    });
  });
  
  return Array.from(layoutMatches.entries())
    .map(([layoutId, score]) => ({ layoutId, score, confidence: score / selectedPOIs.length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
```

### 3. Layout Preview System

#### Component: `LayoutPreviewGrid.tsx`
- **Location**: `src/app/_components/LayoutPreviewGrid.tsx`
- **Purpose**: Display filtered layout candidates with visual previews
- **Features**:
  - Thumbnail previews of matching layouts
  - Layout metadata (Nightlord, Special Events, Bosses)
  - Confidence scores
  - One-click layout selection

#### Preview Data Structure
```typescript
interface LayoutPreview {
  layoutNumber: number;
  thumbnail: string;
  nightlord: string;
  specialEvent: string;
  night1Boss: string;
  night2Boss: string;
  confidence: number;
  matchingPOIs: string[];
}
```

### 4. Integration Points

#### Main App Integration
- **File**: `src/app/page.tsx`
- **Changes**: Add POIPicker as primary interface, make manual layout selection secondary
- **State Management**: Add selected POIs state and filtered layouts state

#### Sidebar Integration
- **File**: `src/app/_components/Sidebar.tsx`
- **Changes**: Add "Quick Find Layout" button that opens POIPicker
- **Fallback**: Keep existing manual layout input as backup option

#### MapCanvas Integration
- **File**: `src/app/_components/MapCanvas.tsx`
- **Changes**: Optimize for quick layout switching
- **Performance**: Preload common layout assets

## Data Requirements

### 1. POI-Layout Mapping
- **Source**: Existing layout JSON files in `reference_material/pattern_layouts/`
- **Processing**: Create reverse index mapping POIs to layouts
- **Storage**: Client-side cache for instant filtering

### 2. POI Metadata
- **Source**: Existing POI coordinate data
- **Enhancement**: Add user-friendly names and categories
- **Organization**: Group by type (Churches, Field Bosses, etc.)

### 3. Layout Thumbnails
- **Generation**: Create visual previews for each layout
- **Format**: WebP for optimal performance
- **Storage**: CDN-optimized delivery

## Implementation Phases

### Phase 1: Church-Only Filtering (Initial Release - Week 1-2)
- [ ] Create Find My Seed button component and integrate into sidebar
- [ ] Implement layout clearing functionality (map reset, seed display reset)
- [ ] Build NightlordEventSelector popup component
- [ ] Create ChurchLocationHighlighter component for church selection
- [ ] Implement three-stage filtering algorithm
- [ ] Add automatic seed display update after layout identification
- [ ] Test accuracy with church-only filtering
- [ ] Measure user experience improvements

**Expected Outcome**: 80-90% accuracy, reducing 320 layouts to 5-10 candidates

### Phase 2: Enhanced POI Filtering (Future Release - Week 3-4)
- [ ] Add Sorcerer's Rise locations to filtering system
- [ ] Implement Church + Sorcerer's Rise combination filtering
- [ ] Optimize filtering algorithm performance
- [ ] Add caching for frequently accessed layouts
- [ ] Implement lazy loading for layout previews

**Expected Outcome**: 95-98% accuracy, reducing 320 layouts to 1-2 candidates

### Phase 3: Advanced Features (Long-term)
- [ ] Add POI type filtering and categorization
- [ ] Implement layout similarity scoring
- [ ] Add user preference learning
- [ ] Create layout recommendation system
- [ ] Add keyboard shortcuts and accessibility features

## Technical Considerations

### Performance
- **Client-side filtering**: All filtering happens in browser for instant results
- **Caching**: Cache POI-layout mappings and layout data
- **Lazy loading**: Load layout previews on demand

### Accessibility
- **Keyboard navigation**: Full keyboard support for POI selection
- **Screen reader support**: Proper ARIA labels and descriptions
- **High contrast**: Ensure visibility in various lighting conditions

### Mobile Optimization
- **Touch-friendly**: Large touch targets for mobile users
- **Responsive design**: Adapt interface for different screen sizes
- **Performance**: Optimize for mobile device capabilities

## Success Metrics

### Primary Metrics
- **Layout identification time**: Target <10 seconds
- **User satisfaction**: Measure via feedback and usage patterns
- **Adoption rate**: Track usage of new vs. manual method

### Secondary Metrics
- **Filtering accuracy**: 
  - Phase 1 Target: 80-90% (5-10 layouts remaining)
  - Phase 2 Target: 95-98% (1-2 layouts remaining)
- **Performance**: Filtering response time
- **Error rate**: Incorrect layout selections
- **User fallback usage**: How often users need to select from multiple candidates

## Future Enhancements

### Phase 2 Features (Post-Launch)
- **Smart suggestions**: Learn from user patterns to improve suggestions
- **POI recognition**: Simple template matching for common POIs
- **Layout favorites**: Remember frequently used layouts

### Phase 3 Features (Long-term)
- **AI-powered detection**: YOLO integration as optional feature
- **Community features**: Share and rate layout identification methods
- **Advanced filtering**: Filter by boss types, events, or other criteria

## Risk Mitigation

### Technical Risks
- **Performance degradation**: Implement performance monitoring and optimization
- **Data accuracy**: Validate POI-layout mappings against game data
- **Browser compatibility**: Test across major browsers and devices

### User Experience Risks
- **Learning curve**: Provide clear onboarding and help documentation
- **Accuracy concerns**: Include manual fallback option
- **Performance issues**: Implement loading states and progress indicators

## Conclusion

The Smart Layout Filtering system represents a significant improvement to the user experience, reducing layout identification time from 30-60 seconds to 5-10 seconds. This solution leverages existing data and infrastructure while providing immediate user benefit.

The phased implementation approach ensures rapid delivery of core functionality while allowing for iterative improvement based on user feedback and performance metrics.

---

**Document Version**: 1.2  
**Last Updated**: August 18, 2025  
**Next Review**: September 18, 2025  
**Implementation Owner**: Development Team  
**Status**: Planning Phase - Enhanced with Detailed UI/UX Specifications
