# Dynamic POI Loading Implementation

## Overview

The Nightreign Map Router implements a sophisticated dynamic POI (Points of Interest) loading system that combines static coordinate data with dynamic layout-based POI placement. This system allows the application to render different map patterns based on game seeds while maintaining accurate coordinate positioning and proper icon mapping.

## Architecture

### Core Components

1. **POI Router** (`src/server/api/routers/poi.ts`)
   - Handles API endpoints for POI data retrieval
   - Processes layout files and coordinate mappings
   - Provides dynamic POI generation based on layout patterns

2. **MapCanvas Component** (`src/app/_components/MapCanvas.tsx`)
   - Renders POIs on the interactive map
   - Manages coordinate transformation and icon display
   - Handles user interactions and filtering

3. **Utility Mappings**
   - `src/utils/poiIconMapping.ts` - Maps POI values to icon files
   - `src/utils/poiLocationMapping.ts` - Maps location names to POI IDs

### Data Sources

1. **Layout Files** (`reference_material/pattern_layouts/`)
   - JSON files containing pattern-specific POI placements
   - 320 layout files (layout_001.json to layout_320.json)
   - Each file defines which POIs appear at specific locations

2. **Master Coordinate List** (`public/assets/maps/poi_coordinates_with_ids.json`)
   - Contains all possible POI coordinates with unique IDs
   - 1493 POI entries with precise coordinate positioning
   - Serves as the authoritative source for POI positioning

3. **Map-Specific Coordinates** (`public/assets/maps/coordinates/`)
   - Separate coordinate files for different map layouts
   - Supports "Shifting Earth" events that change the map appearance
   - Files: default, the_crater, the_mountaintop, the_rotten_woods, noklateo

## Dynamic POI Loading Process

### 1. Layout Selection
The system starts by selecting a layout number (1-320) which determines:
- Which POIs appear on the map
- Their specific locations and types
- Special events and boss placements
- Map layout variations (Shifting Earth events)

### 2. Data Retrieval Flow

```typescript
// API call to get dynamic POI data
const { data: dynamicPOIData } = api.poi.getDynamicPOIs.useQuery({
  layoutNumber: layoutNumber,
  mapLayout: "default" // or other layout based on Shifting Earth
});
```

### 3. POI Processing Pipeline

#### Step 1: Layout File Parsing
- Loads the corresponding layout JSON file
- Extracts POI entries with location and value pairs
- Processes special POI types (Spawn Point, Night Circles, Scale-Bearing Merchant)

#### Step 2: Coordinate Resolution
- Maps location names to POI IDs using `poiLocationMapping.ts`
- Retrieves coordinates from the master POI list
- Handles coordinate transformation for different map layouts

#### Step 3: Icon Mapping
- Maps POI values to appropriate icon files using `poiIconMapping.ts`
- Filters out POIs that shouldn't be displayed (e.g., "Small Camp" entries)
- Assigns proper icon categories for filtering

#### Step 4: Data Combination
- Combines dynamic POIs (from layout) with static POIs (from coordinate files)
- Removes duplicates based on coordinate proximity
- Applies user-defined icon category filters

### 4. Rendering Process

#### Coordinate Transformation
```typescript
// Convert game coordinates to screen coordinates
const leftBound = 507;
const activeWidth = 1690;
const scaledX = ((x - leftBound) / activeWidth) * mapWidth;
const scaledY = (y / 1690) * mapHeight;
```

#### Icon Display
- Renders POI icons at calculated screen coordinates
- Supports different icon sizes based on POI type
- Provides debug options for showing POI numbers

## Key Features

### 1. Dynamic POI Types

#### Major/Minor Bases
- **Major Bases**: Ruins, Camps, Forts, Great Churches
- **Minor Bases**: Churches, Sorcerer's Rises, Townships
- **Special Handling**: Small Camps are intentionally excluded from display

#### Special POI Types
- **Spawn Point**: Player starting location
- **Night Circles**: Boss encounter locations for night phases
- **Scale-Bearing Merchant**: Special merchant locations
- **Evergaols**: Special boss arenas
- **Field Bosses**: World bosses and mini-bosses

### 2. Map Layout Variations

The system supports different map layouts based on "Shifting Earth" events:

```typescript
function getMapLayoutFromShiftingEarth(shiftingEarth: string): string {
  switch (shiftingEarth) {
    case "Mountaintop": return "the_mountaintop_shifted";
    case "Crater": return "the_crater_shifted";
    case "Rotted Woods": return "the_rotten_woods_shifted";
    case "Noklateo": return "noklateo_shifted";
    default: return "default";
  }
}
```

### 3. Icon Category Filtering

Users can toggle different POI categories:
- Sites of Grace
- Spirit Streams
- Spectral Hawk Trees
- Scarabs
- Buried Treasures

### 4. Coordinate System

#### Game Coordinates
- Uses a coordinate system based on the original game map
- Coordinates range from approximately 500-1700 on X-axis
- Y-axis coordinates range from 0-1690

#### Screen Transformation
- Converts game coordinates to screen coordinates
- Maintains aspect ratio and proper scaling
- Supports zoom and pan operations

## API Endpoints

### `getDynamicPOIs`
```typescript
// Input
{
  layoutNumber: number, // 1-320
  mapLayout: string    // "default", "the_crater_shifted", etc.
}

// Output
{
  layoutNumber: number,
  shiftingEarth: string,
  mapLayout: string,
  dynamicPOIs: Array<{
    id: number,
    coordinates: [number, number],
    location: string,
    value: string,
    icon: string,
    type: string
  }>,
  layoutData: object
}
```

### `getLayout`
```typescript
// Input
{
  layoutNumber: number // 1-320
}

// Output
// Raw layout JSON data
```

## Performance Considerations

### 1. Data Loading
- Layout files are loaded on-demand based on layout number
- Master POI coordinates are cached after initial load
- Icon images are preloaded using `useImage` hook

### 2. Rendering Optimization
- POIs are filtered before rendering to reduce draw calls
- Coordinate calculations are memoized using `useMemo`
- Icon images are cached and reused across renders

### 3. Memory Management
- Dynamic POI data is processed efficiently to avoid memory leaks
- Coordinate transformations are calculated only when necessary
- Icon loading is managed to prevent excessive memory usage

## Error Handling

### 1. Missing Data
- Graceful fallback when layout files are missing
- Default behavior when coordinate mappings fail
- Error boundaries for malformed data

### 2. Coordinate Resolution
- Tolerance-based coordinate matching for POI identification
- Fallback to default icons when specific mappings fail
- Validation of coordinate ranges and bounds

## Future Enhancements

### 1. Caching Strategy
- Implement React Query caching for layout data
- Add service worker for offline POI data access
- Optimize icon preloading strategy

### 2. Advanced Filtering
- Add search functionality for POI names
- Implement route-based POI filtering
- Add custom POI category creation

### 3. Performance Improvements
- Implement virtual scrolling for large POI lists
- Add lazy loading for distant POIs
- Optimize coordinate transformation calculations

## Technical Implementation Details

### File Structure
```
src/
├── server/api/routers/poi.ts          # POI API endpoints
├── app/_components/MapCanvas.tsx      # POI rendering component
├── utils/
│   ├── poiIconMapping.ts              # Icon mapping utilities
│   └── poiLocationMapping.ts          # Location mapping utilities
public/assets/maps/
├── poi_coordinates_with_ids.json      # Master POI coordinates
├── coordinates/                       # Map-specific coordinates
└── POI_icons/                        # Icon assets
reference_material/pattern_layouts/    # Layout JSON files
```

### Data Flow
1. User selects layout number
2. API loads corresponding layout file
3. System processes POI entries and maps to coordinates
4. Icons are assigned based on POI values
5. Data is combined with static POIs
6. Final POI list is rendered on map canvas

This dynamic POI loading system provides a flexible and efficient way to display different map patterns while maintaining accurate positioning and proper visual representation of game elements. 