# Pattern Layouts Overview

## Purpose
This document describes the architecture and workflow for generating, storing, and using precomputed map layout files for the Elden Ring Nightreign map project. The approach is designed to minimize client-side computation and optimize performance for web deployment (e.g., on Vercel).

---

## Directory Structure

- `reference_material/`
  - `Elden Ring Nightreign map patterns - Patterns.csv`  
    _Source data: Contains all POI and layout information._
  - `patterns.json`  
    _JSON extraction of the CSV; may not contain all columns/rows._
  - `pattern_layouts/`  
    _Generated output: Contains 320 JSON files, one for each map layout/seed._
    - `layout_001.json`
    - ...
- `public/assets/maps/`
  - `poi_coordinates_with_ids.json`  
    _Reference: List of all current POIs and their assigned numbers and coordinates._
  - `coordinates_backup/poi_name_coordinate_map.js`  
    _Reference: Direct mapping of POI numbers to their descriptive titles, as used in the CSV and for linking to map content._

---

## Generation Workflow

1. **Source Data**: All POI and layout data is maintained in the CSV file.
2. **Generation Script**: A robust, reusable script (`scripts/generate_pattern_layouts_ignore.cjs`) reads the CSV and generates 320 JSON files (one per layout/seed) in `reference_material/pattern_layouts/`.
    - The script is Node.js-only and excluded from type-checking/linting for compatibility.
    - The script should be idempotent and safe to rerun after any data changes.
    - It should support partial or full regeneration as needed.
    - Run it with: `node scripts/generate_pattern_layouts_ignore.cjs`
3. **Webapp Usage**: When a user selects a seed (1–320), the webapp fetches the corresponding JSON file and displays the precomputed layout.

---

## Script Requirements
- **Robustness**: The script must handle changes in the CSV, such as added/removed/modified POIs or layouts.
- **Reusability**: It should be easy to rerun the script after data updates, with minimal manual intervention.
- **Validation**: The script should validate the output and report any inconsistencies or errors.
- **Documentation**: The script should be well-documented and easy to maintain.

---

## Update Workflow
1. **Modify Source Data**: Update the CSV as needed (e.g., add or edit POIs).
2. **Rerun Generation Script**: Execute the script to regenerate the JSON files in `pattern_layouts/`.
3. **Deploy**: Deploy the updated JSON files to your static hosting (e.g., Vercel).
4. **Verify**: Ensure the webapp loads and displays the correct layouts for each seed.

---

## Future Updates
- This document should be updated as the workflow or requirements evolve.
- Add details about the script usage, CLI options, or troubleshooting as they are developed.

---

## References
- See also: `PATTERN_DATA_PIPELINE.md` for more details on the data pipeline.
- See also: `map_data_extraction.md` for extraction logic and data sources.
- **POI Number Reference:** `public/assets/maps/poi_coordinates_with_ids.json` — All POIs and their assigned numbers/coordinates.
- **POI Name Mapping:** `public/assets/maps/coordinates_backup/poi_name_coordinate_map.js` — Maps POI numbers to descriptive titles for linking with CSV content. 