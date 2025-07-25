# AI To-Do List & Revert Log

## Current To-Do List

1. **Assess and fix if necessary: Map layout (tiles) and POIs do not update when the seed is changed via the increment/decrement buttons or manual input.**
   - Ensure the correct layout and POIs are loaded and rendered for each seed change. This is crucial for dynamic map/POI functionality.

2. **After updating the icon mapping and POI filtering logic, visually check and validate that only the correct POIs and icons appear for each layout/seed.**
   - This is needed to confirm that dynamic POI loading and icon assignment are working as intended.

3. **(Pending) Expand and correct the icon mapping for all unique dynamic POI values in the layouts.**
   - Ensure all Major and Minor locations use the correct icons, and that 'Small Camp' and 'empty' values render no icon.

---

## Recent Revert: Context & Reason

### What Happened
- A series of architectural and UI changes were made to:
  - Make the pattern/seed input empty by default and require a reload button to update the map.
  - Only show fixed POIs for the default layout on initial load.
  - Load dynamic POIs and map tiles only after a valid seed and reload.
  - Refactor icon mapping for dynamic POIs, and filter out 'Small Camp' and 'empty' values.
- The intention was to make the map/POI logic more robust, testable, and visually clear.

### Why the Revert Was Necessary
- Despite these changes, the map and POIs were not updating as expected:
  - The map layout and POIs did not change when the seed was updated.
  - The correct icons for dynamic POIs were not being shown.
  - Fixed POIs (e.g., Sites of Grace) did not update with the map layout.
- The codebase became overcomplicated and difficult to debug, with state and update logic spread across multiple components.
- To restore a stable, working baseline, all local changes were reverted to the last pushed state on the remote, and the `.env` file was preserved.

### Next Steps
- Re-implement features incrementally, validating each step.
- Focus on clear, testable logic for map/POI updates and icon mapping.

---

*This log is maintained by the AI to track architectural decisions, major changes, and the current to-do list for Nightreign Map Router development.* 