# POI Coordinate Assignment Guide

> **Purpose:** This document outlines the recommended process for assigning map coordinates to Points of Interest (POIs) in Nightreign Router. It is intended to guide future work when coupling seed data with spawn point coordinates for interactive map rendering.

---

## Why Coordinate Assignment Matters
- Accurate coordinates are essential for rendering POIs on the interactive map and enabling route planning.
- Coordinates allow for spatial queries, proximity calculations, and visual feedback in the UI.
- Consistent assignment ensures that all map patterns and POIs are compatible with the rendering and routing logic.

## Recommended Process

1. **Gather Reference Data**
   - Use in-game screenshots, datamined map assets, or extracted game files to identify the true positions of each POI/spawn point.
   - Reference `/reference_material/default_map.png`, `/reference_material/Elden Ring Nightreign map patterns - Patterns.csv`, and any extracted coordinate data.
   - Review all files in `/reference_material` for additional context, including landmark definitions, boss lists, and event details.

2. **Define a Coordinate System**
   - Decide on a coordinate system (e.g., top-left origin, pixel-based, or normalized 0-1 range).
   - Document the system in this file and in code comments.
   - Ensure all POIs use the same system for consistency.

3. **Assign Coordinates to Each POI**
   - For each POI in the seed data (see `/reference_material/Elden Ring Nightreign map patterns - Patterns.csv`), determine its (x, y) position on the map.
   - Update the `x` and `y` fields in the database and in mock data.
   - If a POI is pattern-specific, ensure coordinates are correct for each pattern.

4. **Validate Placement**
   - Render POIs on the map using the frontend and visually confirm accuracy.
   - Adjust as needed for alignment with the game map and user experience.

5. **Automate Where Possible**
   - If possible, write scripts to extract or convert coordinates from game files or map images.
   - Use tools like image editors, coordinate pickers, or datamining scripts.

6. **Document All Decisions**
   - Record any assumptions, conversions, or manual adjustments in this file.
   - Reference relevant files and data sources for future contributors.
   - Review all files in `/docs` for project conventions, technical notes, and implementation guidelines.

---

## Technical Notes
- The `Landmark` type in `/src/types/core.ts` and the `landmark` table in the database both have `x` and `y` fields for coordinates.
- The frontend map renderer expects all POIs to have valid coordinates for display.
- If a POI does not have a known coordinate, set `x: 0, y: 0` as a placeholder and document it for later update.

---

## References
- `/reference_material/Elden Ring Nightreign map patterns - Patterns.csv` (primary pattern and POI data)
- `/reference_material/default_map.png` (base map image)
- All files in `/reference_material` (landmark definitions, boss lists, event details, etc.)
- `/src/types/core.ts` (Landmark type)
- `/prisma/schema.prisma` (Landmark model)
- `/src/data/poi.ts` (mock POI data)
- `/prisma/seed.ts` (seed logic)
- All files in `/docs` (project conventions, technical notes, implementation guidelines)

---

## Future Work
- As coordinate data becomes available, update the seed script and database records.
- Consider building a simple admin UI or map editor to assign and adjust coordinates visually.
- Keep this document up to date with any new conventions or tools. 

---

## Automated SVG Coordinate Extraction (Recommended Workflow)
- Use the `extract_svg_coordinates.py` script to extract POI coordinates from SVG files for any map layout.
- Place all SVGs for a given layout in a single directory (e.g., `public/assets/maps/coordinates/the_mountaintop_coordinate_data/`).
- Run the script with the SVG directory and output JSON path:
  ```sh
  python extract_svg_coordinates.py <SVG_DIR> <OUTPUT_JSON>
  ```
- Place the resulting JSON file in `public/assets/maps/coordinates/` with the naming convention `<layout>_map_layout.json` (e.g., `the_mountaintop_map_layout.json`).
- To update coordinates, simply edit the SVGs and rerun the script. The app will automatically use the new data.
- See `docs/ASSET_EXTRACTION.md` for detailed instructions and examples. 