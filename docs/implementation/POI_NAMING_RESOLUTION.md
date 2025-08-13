# POI Naming Conflicts - Problem Analysis and Solution

## Overview

This document explains the POI (Points of Interest) naming conflict problem that was discovered in the Nightreign map router and the systematic methodology used to identify and resolve it.

## Problem Description

### The Issue
POI naming conflicts occur when the same location name appears in different contexts across the 320 layout files, causing incorrect icon assignments and POI mappings.

### Root Cause
The layout files use a structure where POIs are defined with keys like:
- `"Major Base - Minor Erdtree"`
- `"Minor Base - Minor Erdtree"`

Both use the same `location` value (`"Minor Erdtree"`), but should map to different POI IDs:
- **Major Base Minor Erdtree** → POI 106 (should get Ruins icon)
- **Minor Base Minor Erdtree** → POI 157 (should get Church icon)

### Impact
- Incorrect icon assignments (e.g., Evergaol icon instead of Field Boss icon)
- Wrong POI mappings causing visual errors on the map
- Inconsistent behavior across different layouts

## Discovery Process

### Initial Detection
The problem was first identified when:
1. Dragonkin Soldiers in evergaols were getting Field Boss icons instead of Evergaol icons
2. POI 106 (Minor Erdtree) was getting wrong icon assignments
3. Layout files showed the same location name used in different contexts

### Systematic Analysis
We created comprehensive analysis scripts to identify ALL conflicts across all 320 layout files:

#### Script 1: Basic Conflict Detection
```javascript
// scripts/analyze_poi_conflicts.js
// Analyzes layout files for location name conflicts
```

#### Script 2: Comprehensive Analysis
```javascript
// scripts/comprehensive_poi_analysis.js
// Detailed analysis with statistics and coverage checking
```

#### Script 3: Complete Analysis
```javascript
// scripts/complete_poi_analysis.js
// Extracts ALL POI entries without assumptions
```

#### Script 4: Final Verification
```javascript
// scripts/final_verification.js
// Cross-references with backup coordinates for complete verification
```

## Analysis Results

### Conflict Statistics
- **Total unique POI keys**: 55
- **Total unique locations**: 54
- **Total unique values**: 112
- **Total conflicts found**: 1

### The Only Conflict
```
CONFLICT: "Minor Erdtree" appears in 2 contexts:
  - Major Base (320 occurrences)
  - Minor Base (320 occurrences)
```

**Key Finding**: Only "Minor Erdtree" has naming conflicts across all 320 layouts.

## Solution Methodology

### 1. Context-Aware Mapping Function
Created `getPOIIdForLocationWithContext()` that considers both the key context and location:

```typescript
export function getPOIIdForLocationWithContext(key: string, location: string): number | null {
  // Special handling for Minor Erdtree which has two different POIs
  if (location === "Minor Erdtree") {
    const keyType = key.split(' - ')[0]; // Extract type from key
    if (keyType === "Major Base") {
      return 106; // Major Base Minor Erdtree
    } else if (keyType === "Minor Base") {
      return 157; // Minor Base Minor Erdtree
    }
  }
  
  // For all other cases, use the standard mapping
  return getPOIIdForLocation(location);
}
```

### 2. Updated POI Router
Modified the POI router to use the context-aware function:

```typescript
// Before
const poiId = getPOIIdForLocation(location);

// After
const poiId = getPOIIdForLocationWithContext(key, location);
```

### 3. Icon Assignment Fix
Updated the icon mapping to handle Dragonkin Soldier context:

```typescript
export function getIconForPOIWithContext(key: string, value: string): string | null {
  const keyType = key.split(' - ')[0];
  
  // Special handling for Dragonkin Soldier based on context
  if (value === "Dragonkin Soldier") {
    if (keyType === "Evergaol") {
      return "Evergaol.png";
    } else if (keyType === "Field Boss" || keyType === "Night") {
      return "Field_Boss.png";
    }
  }
  
  // For other cases, use existing mapping logic
  const mapping = POI_VALUE_TO_ICON_MAP.find(m => m.value === value);
  return mapping?.icon || null;
}
```

## Verification Process

### 1. Comprehensive Analysis
- Analyzed all 320 layout files
- Extracted all POI entries without assumptions
- Cross-referenced with backup coordinate files
- Verified against current POI mapping

### 2. Conflict Detection
- Identified location names used in multiple contexts
- Counted occurrences across all layouts
- Verified POI ID mappings

### 3. Solution Validation
- Confirmed only "Minor Erdtree" conflict exists
- Verified context-aware function handles the conflict
- Tested across multiple layout files

## Future Conflict Detection

### If New Conflicts Appear

1. **Run Analysis Scripts**
   ```bash
   node scripts/complete_poi_analysis.js
   node scripts/final_verification.js
   ```

2. **Identify the Conflict**
   - Check which location name appears in multiple contexts
   - Verify the POI IDs that should be mapped

3. **Update Context-Aware Function**
   ```typescript
   export function getPOIIdForLocationWithContext(key: string, location: string): number | null {
     // Existing Minor Erdtree handling
     if (location === "Minor Erdtree") {
       // ... existing code
     }
     
     // Add new conflict handling
     if (location === "NEW_CONFLICT_LOCATION") {
       const keyType = key.split(' - ')[0];
       if (keyType === "Context1") {
         return POI_ID_1;
       } else if (keyType === "Context2") {
         return POI_ID_2;
       }
     }
     
     return getPOIIdForLocation(location);
   }
   ```

4. **Update Icon Mapping** (if needed)
   ```typescript
   export function getIconForPOIWithContext(key: string, value: string): string | null {
     // Add new icon conflict handling
     if (value === "CONFLICT_VALUE") {
       const keyType = key.split(' - ')[0];
       if (keyType === "Context1") {
         return "Icon1.png";
       } else if (keyType === "Context2") {
         return "Icon2.png";
       }
     }
     
     // ... existing code
   }
   ```

5. **Test and Verify**
   - Run build to ensure no errors
   - Test with affected layout files
   - Verify icon assignments are correct

## Prevention Strategies

### 1. Regular Analysis
- Run conflict detection scripts periodically
- Monitor for new layout files that might introduce conflicts

### 2. Naming Conventions
- Consider using unique location names for different contexts
- Document any intentional duplicates

### 3. Automated Testing
- Create tests that verify POI mappings
- Test icon assignments across different contexts

## Key Takeaways

1. **Systematic Analysis is Crucial**: Don't assume conflicts based on single examples
2. **Context Matters**: The same location name can legitimately appear in different contexts
3. **Comprehensive Verification**: Always verify against all layout files and backup data
4. **Incremental Solutions**: Fix conflicts one by one rather than systematic renaming
5. **Documentation**: Keep analysis scripts for future conflict detection

## Files Modified

- `src/utils/poiLocationMapping.ts` - Added context-aware function
- `src/utils/poiIconMapping.ts` - Added context-aware icon assignment
- `src/server/api/routers/poi.ts` - Updated to use context-aware functions

## Analysis Scripts Created

- `scripts/analyze_poi_conflicts.js` - Basic conflict detection
- `scripts/comprehensive_poi_analysis.js` - Detailed analysis
- `scripts/complete_poi_analysis.js` - Complete extraction
- `scripts/final_verification.js` - Final verification

## Conclusion

The POI naming conflict problem was successfully resolved through systematic analysis and targeted fixes. The solution is comprehensive, handles all known conflicts, and provides a methodology for detecting and resolving future conflicts without breaking existing functionality. 