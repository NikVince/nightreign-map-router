# POI Numbering Strategy and Data Integrity Workflow

## Initial Problem

- Multiple Points of Interest (POIs) on the map were being assigned the same number, even when they were at different locations.
- The same POI (with identical coordinates) could receive different numbers in different map layouts.
- This made it impossible to reliably reference, link, or update POIs across the application and database.
- The root cause was a combination of outdated or inconsistent coordinate data, and a master list that was not always regenerated from the true source of icon placement.

## Solution: Canonical, Sequential POI Numbering

### Key Principles
- **Single Source of Truth:** The only files used for POI coordinate extraction are the current map layout JSONs that drive icon placement in the frontend.
- **Deduplication:** All coordinates from all layouts are deduplicated. If a POI appears in multiple layouts at the same coordinates, it is treated as a single unique POI.
- **Sequential Numbering:** Each unique coordinate is assigned a sequential number (POI 1, POI 2, ...). This number is locked to that coordinate forever.
- **Number Locking:** If new POIs are added in the future, they are assigned the next available number (e.g., if there are 156 POIs, the next new POI will be POI 157). Existing numbers are never reassigned or shifted.
- **Human-Friendly:** Sequential numbers are easier to reference, debug, and use in documentation and CSV mapping.

### Workflow
1. **Backup:** All old coordinate and POI data files are backed up before any changes.
2. **Source Selection:** Only the layout JSONs that are used for icon placement are kept as the source for POI coordinates. All other sources are archived.
3. **Master List Generation:** A script scans all layout JSONs, extracts and deduplicates all coordinates, and assigns each a unique, sequential number. The output is a new master list (e.g., `poi_coordinates_with_ids.json`).
4. **Number Locking:** The script checks for existing numbers and only assigns new numbers to truly new coordinates, preserving all previous assignments.
5. **Frontend/Backend Sync:** The frontend and backend both use this master list for POI number assignment and reference.
6. **CSV/Pattern Mapping:** Once the numbers are correct and stable, CSV pattern matching and name-to-POI mapping can be safely performed.

### Why Not Use Hashes?
- Hashes are unique but not human-friendly.
- Sequential numbers are easier to work with, as long as the assignment is locked and never shifts for existing POIs.
- This approach is robust, maintainable, and future-proof for incremental POI additions.

## Summary Table
| Step | Description |
|------|-------------|
| Backup | Archive all old coordinate/POI data |
| Source Selection | Use only layout JSONs for POI extraction |
| Master List Generation | Deduplicate and assign sequential numbers |
| Number Locking | Never reassign or shift existing numbers |
| Frontend/Backend Sync | Both layers use the same master list |
| CSV/Pattern Mapping | Performed only after numbering is correct |

---

**This document is the reference for all future POI numbering and data integrity work.** 