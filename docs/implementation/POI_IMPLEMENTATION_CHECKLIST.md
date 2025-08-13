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
- [x] Update Prisma schema to include POI tables and relations.
  - _**Completed:** Schema updated in `prisma/schema.prisma` for all POI/map pattern relations._
- [x] Plan for future addition of coordinates to POIs.
  - _**Completed:** See `/docs/POI_COORDINATE_SETUP.md` for coordinate assignment plan._
- [x] Create migration scripts for Supabase.
  - _**Completed:** Migrations created and applied for new/updated schema._

## 3. Data Import/Seeding
- [x] Write a script to parse the CSV and generate seed data for the database.
  - _**Completed:** Implemented CSV parsing and POI/pattern seeding logic in `scripts/seed.ts` (moved from `prisma/seed.ts`). The script parses the CSV, creates/upserts all unique Landmarks (POIs), MapPatterns, and links POIs to patterns, handling missing/empty cells and validating data integrity._
- [x] Ensure each POI is uniquely identified and linked to its pattern and type.
  - _**Completed:** Seed script ensures unique POIs and correct pattern/type linkage._
- [x] Validate data integrity and handle missing/empty cells.
  - _**Completed:** Seed script validates data and handles missing/empty cells._

## 4. Integration Points
- [x] Update backend API (tRPC) to expose POI data.
  - _**Completed:** Added a new tRPC router (`poiRouter`) for POI and map pattern data in `src/server/api/routers/poi.ts`, with endpoints for all patterns, pattern by ID (with landmarks), and all landmarks. Registered the router in `src/server/api/root.ts`._
- [x] Prepare frontend types and mock data for map rendering.
  - _**Completed:** Frontend types and mock data added in `src/data/poi.ts`, aligned with backend types and API._
- [x] Document how to assign coordinates to POIs in the future.
  - _**Completed:** See `/docs/POI_COORDINATE_SETUP.md`._

## 5. Testing & Validation
- [ ] Unit test data parsing and seeding logic.
- [ ] Integration test database queries for POIs.
- [ ] Manual validation against the CSV and in-game references.

## 6. Documentation & References
- [x] Reference all relevant files:
  - `/reference_material/Elden Ring Nightreign map patterns - Patterns.csv`
  - `/docs/DEVELOPMENT_CHECKLIST.md`
  - `/docs/PROJECT_OVERVIEW.md`
  - `/docs/GAME_MECHANICS.md`
  - `/docs/ASSET_EXTRACTION.md`
  - `/docs/DEVELOPMENT_GUIDELINES.md`
- [x] Document all type definitions and database changes.
  - _**Completed:** All type and schema changes documented in code and checklist._
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