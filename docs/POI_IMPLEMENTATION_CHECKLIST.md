# Nightreign Map POI Implementation Checklist

> **Purpose:** Guide the implementation of Points of Interest (POIs) and map pattern data from the CSV into the project database and codebase, preparing for future assignment of coordinates and map integration.

---

## 1. Analyze and Model Data
- [x] Review all unique POI types and categories from the CSV and documentation.
- [x] Define TypeScript types/interfaces for:
  - `MapPattern`
  - `PointOfInterest` (POI)
  - Boss/Event types
  - Landmark categories
  - _**Completed:** Extended `LandmarkType`, `Landmark`, `MapPattern`, and `BossCategory` in `src/types/core.ts` to cover all POI categories and event/boss types from the CSV and documentation. Added doc references and new fields for extensibility._
- [x] Design database schema for POIs and their relationships to patterns.
  - _**Completed:** Extended `LandmarkType` and `BossCategory` enums in `prisma/schema.prisma` to match the new/extended types in `src/types/core.ts` (added `ArenaBoss`, `RottedWoods`, `RotBlessing`, `Arena`, etc.), added a `specialEvents String[]` field to `MapPattern`, and added documentation comments referencing the relevant docs and CSV._

## 2. Database Preparation
- [ ] Update Prisma schema to include POI tables and relations.
- [ ] Plan for future addition of coordinates to POIs.
- [ ] Create migration scripts for Supabase.

## 3. Data Import/Seeding
- [x] Write a script to parse the CSV and generate seed data for the database.
  - _**Completed:** Implemented CSV parsing and POI/pattern seeding logic in `prisma/seed.ts`. The script parses the CSV, creates/upserts all unique Landmarks (POIs), MapPatterns, and links POIs to patterns, handling missing/empty cells and validating data integrity._
- [ ] Ensure each POI is uniquely identified and linked to its pattern and type.
- [ ] Validate data integrity and handle missing/empty cells.

## 4. Integration Points
- [x] Update backend API (tRPC) to expose POI data.
  - _**Completed:** Added a new tRPC router (`poiRouter`) for POI and map pattern data in `src/server/api/routers/poi.ts`, with endpoints for all patterns, pattern by ID (with landmarks), and all landmarks. Registered the router in `src/server/api/root.ts`._
- [ ] Prepare frontend types and mock data for map rendering.
- [ ] Document how to assign coordinates to POIs in the future.

## 5. Testing & Validation
- [ ] Unit test data parsing and seeding logic.
- [ ] Integration test database queries for POIs.
- [ ] Manual validation against the CSV and in-game references.

## 6. Documentation & References
- [ ] Reference all relevant files:
  - `/reference_material/Elden Ring Nightreign map patterns - Patterns.csv`
  - `/docs/DEVELOPMENT_CHECKLIST.md`
  - `/docs/PROJECT_OVERVIEW.md`
  - `/docs/GAME_MECHANICS.md`
  - `/docs/ASSET_EXTRACTION.md`
  - `/docs/DEVELOPMENT_GUIDELINES.md`
- [ ] Document all type definitions and database changes.
- [ ] Add a “Getting Started” section for contributors.

---

## Getting Started

1. **Read this checklist and the referenced documentation.**
2. **Familiarize yourself with the CSV structure and the types of POIs.**
3. **Begin by defining the TypeScript types and database schema.**
4. **Use this checklist to track progress and ensure all steps are completed.**

---

## Useful References
- [Development Checklist](./DEVELOPMENT_CHECKLIST.md)
- [Project Overview](./PROJECT_OVERVIEW.md)
- [Game Mechanics](./GAME_MECHANICS.md)
- [Asset Extraction](./ASSET_EXTRACTION.md)
- [Development Guidelines](./DEVELOPMENT_GUIDELINES.md)
- [Map Patterns CSV](../reference_material/Elden Ring Nightreign map patterns - Patterns.csv) 