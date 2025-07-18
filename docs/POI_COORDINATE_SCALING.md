# POI Coordinate Scaling for Nightreign Map Router

This document explains how to align Points of Interest (POIs) with the map background in a responsive, tile-based map system, ensuring pixel-perfect placement regardless of window size or device. This method is replicable for all map layouts, including those with shifting earths.

---

## 1. **Background**
- POI coordinates are exported from SVGs in a fixed coordinate space (e.g., 2905 × 1690 pixels).
- The in-app map is assembled from tiles (e.g., 6×6 grid of 256×256px tiles = 1536 × 1536px assembled map).
- The map image may not fill the entire SVG coordinate space; there may be transparent or empty margins.

---

## 2. **Why Scaling is Needed**
- The POI coordinate system (SVG) is often wider than the actual map area.
- To avoid icons being crammed or misaligned, you must:
  - **Crop out the margins** (left/right) from the SVG coordinate system.
  - **Scale the remaining (active) map area** to the assembled map size.

---

## 3. **How to Measure the Active Map Area**
1. **Open the original SVG or exported image in Gimp (or any image editor).**
2. **Use the Rectangle Select Tool** to select only the visible map area (ignore transparent margins).
3. **Record:**
   - The X coordinate of the left edge (**leftBound**)
   - The width of the selection (**activeWidth**)
   - The height of the selection (should match the SVG height, e.g., 1690)
4. **Example:**
   - SVG width: 2905px
   - Map area starts at X = 507
   - Map area width = 1690px
   - So, leftBound = 507, activeWidth = 1690

---

## 4. **Scaling Formula**
Given:
- `x`, `y`: POI coordinates from the SVG/JSON
- `leftBound`: X coordinate where the map starts in the SVG
- `activeWidth`: Width of the map area in the SVG
- `mapWidth`, `mapHeight`: Assembled map size in the app (e.g., 1536 × 1536)
- `svgHeight`: Height of the SVG (e.g., 1690)

**Apply this formula:**
```js
const scaledX = ((x - leftBound) / activeWidth) * mapWidth;
const scaledY = (y / svgHeight) * mapHeight;
```
- Use `scaledX` and `scaledY` to render the POI icon.
- Subtract half the icon width/height for centering if needed.

---

## 5. **Replicating for Other Map Layouts**
- Repeat the measurement process for each map layout:
  1. Export the map image with transparent margins.
  2. Measure the left bound and active width as above.
  3. Update the scaling formula with the new values.
- This ensures all POIs align perfectly for every map layout, even if the map shifts or changes size.

---

## 6. **Example (Default Map Layout)**
- SVG width: 2905px
- SVG height: 1690px
- Map area starts at X = 507
- Map area width = 1690px
- Assembled map size: 1536 × 1536px

**Scaling:**
```js
const leftBound = 507;
const activeWidth = 1690;
const scaledX = ((x - leftBound) / activeWidth) * mapWidth;
const scaledY = (y / 1690) * mapHeight;
```

---

## 7. **Tips**
- Always use the same method to measure bounds for consistency.
- If the map is not square, adjust the formula for the actual assembled map size.
- Test by overlaying POIs and visually confirming alignment.

---

**This method guarantees pixel-perfect, responsive POI overlays for any map layout.**

---

## See Also
- For robust, up-to-date instructions on extracting and updating POI coordinates from SVGs, see `docs/ASSET_EXTRACTION.md` and the automated workflow in `docs/POI_COORDINATE_ASSIGNMENT.md`. 