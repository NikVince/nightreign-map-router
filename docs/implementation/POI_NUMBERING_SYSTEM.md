# Global POI Numbering Scheme

## Purpose
This document describes the process for assigning a single, global, and consistent number to every Point of Interest (POI) across all map layouts in the Nightreign Map Router. The goal is to ensure that each unique POI location—whether it appears in one or multiple layouts—always has the same identifier, making mapping, referencing, and future expansion robust and reliable.

## Rationale
- **Consistency:** The same physical POI (same coordinates) should always have the same number, regardless of map layout.
- **Coverage:** Both shared (overlapping) and unique POIs across all layouts are included in a single, canonical list.
- **Expandability:** The system should be easy to update if new POIs or layouts are added.

## Implementation Checklist

- [ ] **1. Aggregate All POI Coordinates**
  - Collect all POI coordinates from the default and all shifted map layouts into a single list.
  - Track their source layout and type for reference.

- [ ] **2. Normalize Coordinates**
  - Normalize (e.g., round) coordinates to a small decimal precision to ensure that POIs at the same physical location are recognized as identical, even if there are minor floating-point differences.

- [ ] **3. Generate Unique Hash/Key for Each POI**
  - For each POI coordinate, generate a unique hash or string key (e.g., "x,y" or a hash function) to serve as a global identifier.

- [ ] **4. Create a Global Mapping**
  - Assign a unique, incrementing number to each unique POI hash/key, building a single, canonical list of all POIs across all layouts.

- [ ] **5. Update POI Rendering Logic**
  - For any layout, look up each POI in the global mapping and display its global number, not a per-layout number.

- [ ] **6. (Optional) Store or Export the Global Mapping**
  - Store or export the global POI mapping (hash/key → number) for future use, so new layouts or POIs can be integrated without renumbering everything.

- [ ] **7. Test the System**
  - Switch layouts and confirm that the same physical POI always shows the same number, and that all unique POIs are covered.

## Notes
- This document should be updated as progress is made or if the process changes.
- For questions or changes, reference this file and coordinate with the map/data maintainers. 