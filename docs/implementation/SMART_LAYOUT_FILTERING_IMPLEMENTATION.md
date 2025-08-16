# Smart Layout Filtering Implementation Plan

## Overview

This document outlines the implementation plan for the Smart Layout Filtering system, designed to solve the critical UX bottleneck where users must manually search through 320 layouts to find the correct map configuration.

## Problem Statement

**Current Issue**: Users waste 30-60 seconds during match start manually entering layout numbers (1-320) to find the correct map layout. This creates a poor user experience and can impact gameplay performance.

**Root Cause**: No intelligent way to identify which layout matches the current game state based on visible POIs.

## Solution: Smart Layout Filtering

### Core Concept
Instead of requiring users to manually search through 320 layouts, the system will intelligently filter layouts based on POIs the user can identify on their current map.

### User Experience Flow
1. **Quick Start**: User opens app and sees "What do you see on your map?" interface
2. **POI Selection**: User clicks on 2-3 key POIs they can identify
3. **Smart Filtering**: System filters from 320 layouts to 5-10 matching candidates
4. **Visual Confirmation**: User sees thumbnails and selects correct layout
5. **Instant Loading**: Map loads with correct layout immediately

### Expected Performance Improvement
- **Before**: 30-60 seconds to find correct layout
- **After**: 5-10 seconds to identify and load correct layout
- **Improvement**: 6-12x faster layout identification

## Technical Implementation

### 1. POI Picker Interface

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

### 2. Layout Filtering Algorithm

#### Core Function: `filterLayoutsByPOIs`
- **Location**: `src/utils/layoutFilter.ts`
- **Purpose**: Filter 320 layouts based on selected POIs
- **Algorithm**:
  1. For each selected POI, find layouts containing that POI
  2. Calculate intersection of matching layouts
  3. Rank results by number of matching POIs
  4. Return top 10 most likely matches

#### Implementation Logic
```typescript
function filterLayoutsByPOIs(selectedPOIs: SelectedPOI[]): LayoutMatch[] {
  const layoutMatches = new Map<number, number>();
  
  selectedPOIs.forEach(poi => {
    const matchingLayouts = findLayoutsWithPOI(poi);
    matchingLayouts.forEach(layoutId => {
      layoutMatches.set(layoutId, (layoutMatches.get(layoutId) || 0) + 1);
    });
  });
  
  return Array.from(layoutMatches.entries())
    .map(([layoutId, score]) => ({ layoutId, score, confidence: score / selectedPOIs.length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
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

### Phase 1: Core Infrastructure (Week 1)
- [ ] Create POIPicker component
- [ ] Implement layout filtering algorithm
- [ ] Create POI-layout mapping system
- [ ] Basic integration with main app

### Phase 2: User Interface (Week 2)
- [ ] Design and implement POI selection interface
- [ ] Create layout preview grid
- [ ] Add search and filtering capabilities
- [ ] Implement responsive design

### Phase 3: Performance & Polish (Week 3)
- [ ] Optimize filtering performance
- [ ] Add layout thumbnails
- [ ] Implement caching system
- [ ] Add user feedback and error handling

### Phase 4: Testing & Deployment (Week 4)
- [ ] User testing and feedback
- [ ] Performance optimization
- [ ] Bug fixes and refinements
- [ ] Production deployment

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
- **Filtering accuracy**: Percentage of correct layout suggestions
- **Performance**: Filtering response time
- **Error rate**: Incorrect layout selections

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

**Document Version**: 1.0  
**Last Updated**: August 16, 2025  
**Next Review**: September 16, 2025  
**Implementation Owner**: Development Team  
**Status**: Planning Phase
