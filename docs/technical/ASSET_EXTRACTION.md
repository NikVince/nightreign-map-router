# Asset Extraction Procedures

## Required Tools
- **UXM Selective Unpacker**: Primary tool for Nightreign file extraction
- **WitchyBND/Yabber**: TPF archive unpacking
- **Image Converter**: DDS to PNG conversion utility
- **Sharp/ImageMagick**: Web optimization pipeline

## Extraction Workflow

### Step 1: Game File Location
- Locate Nightreign installation directory
- Identify relevant archive files containing map assets
- Back up original files before extraction

### Step 2: UXM Selective Unpacker Usage
- Configure unpacker for Nightreign file structure
- Select specific asset categories to avoid unnecessary files
- Extract to organized directory structure

### Step 3: TPF Archive Processing
- Use WitchyBND/Yabber for TPF file extraction
- Maintain original directory structure for reference
- Document file naming conventions discovered

### Step 4: Asset Conversion
- Convert DDS textures to PNG format
- Apply web optimization (compression, resizing)
- Generate WebP versions with PNG fallbacks
- Create responsive image variants

## Priority Asset List
1. **Base Map Textures**: Essential for map background rendering
2. **Landmark Icons**: Visual markers for interactive elements
3. **Nightlord Portraits**: Character identification assets
4. **UI Elements**: Buttons, borders, tooltips for interface
5. **Circle Overlays**: Visual representation of shrinking areas

## File Organization

> **Note:** All asset metadata and references are stored in Supabase (PostgreSQL) for consistency and easy access by the application backend.

## Coordinate Extraction Script Usage (Robust, Future-Proof)

The script `extract_svg_coordinates.py` extracts all (x, y) coordinate pairs from the `d` attribute of the first `<path>` element in each SVG file. It is robust to all SVG path commands and will work for any standard SVG path data.

**Directory Structure:**
- All coordinate JSON files (`*_map_layout.json`) must be placed in `public/assets/maps/coordinates/`.
- For each map layout, place the relevant SVGs in a single directory (e.g., `public/assets/maps/coordinates/the_mountaintop_coordinate_data/`).
- The default layout's JSON file should be named `default_map_layout.json` and placed in the same directory as the others.

**How to update or rerun extraction:**
1. Edit or replace any SVGs for the layout you want to update (e.g., to add, remove, or move icons).
2. Run the script with the correct SVG directory and output path. For example:
   ```sh
   python extract_svg_coordinates.py public/assets/maps/coordinates/the_mountaintop_coordinate_data public/assets/maps/coordinates/the_mountaintop_map_layout.json
   ```
3. The script will overwrite the old JSON file with the new coordinates. No need to delete the old file manually.
4. Reload the app to see the updated icons.

**Notes:**
- If a POI type is missing or has no coordinates in a layout, it will be skipped in the output JSON. This is expected and will not break the app.
- The script only processes the first `<path>` element in each SVG. If you need to support multiple paths per POI type, update the script accordingly.
- Keep the directory structure consistent for all layouts to avoid confusion.
