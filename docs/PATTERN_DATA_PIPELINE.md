# Pattern Data Pipeline & API Design

## Overview
This document outlines the recommended approach for managing, storing, and serving map pattern data for the Nightreign Router project. It covers:
- Why use a database for pattern data
- Database schema design
- Data import pipeline (from CSV)
- tRPC API endpoint design
- Future-proofing for DLCs and updates
- Implementation checklist

---

## 1. Why Use a Database for Pattern Data?
- **Scalability:** As new patterns are added (e.g., via DLCs), a database makes it easy to add, update, or remove entries without code changes.
- **Performance:** Databases are optimized for fast lookups, even with thousands of patterns.
- **Flexibility:** Enables future features like user-generated patterns, analytics, or admin tools.
- **Maintainability:** Centralizes data management and avoids large static files in the codebase.

---

## 2. Database Schema Design

### Table: `patterns`
| Column         | Type        | Description                                 |
| --------------|------------|---------------------------------------------|
| id            | SERIAL/UUID | Primary key                                 |
| seed          | TEXT        | Unique identifier for the pattern/seed      |
| nightlord     | TEXT        | Nightlord name or ID                        |
| pattern_index | INTEGER     | Pattern number (1-40, etc.)                 |
| pois          | JSONB       | List of POIs for this pattern (see below)   |
| created_at    | TIMESTAMP   | (optional)                                  |
| updated_at    | TIMESTAMP   | (optional)                                  |

#### POI JSON Structure Example
```json
[
  {
    "id": "poi_001",
    "type": "shrine",
    "x": 1234,
    "y": 567,
    "meta": { "resource": "ember" }
  },
  ...
]
```
- Each pattern row contains all POIs for that map layout.
- You can expand the schema as needed (e.g., add DLC, region, etc.).

---

## 3. Data Import Pipeline

### Steps:
1. **Convert CSV to JSON:** Write a script to parse the CSV and output a JSON array of pattern objects.
2. **Validate Data:** Ensure all required fields are present and correctly formatted.
3. **Import to DB:** Use a migration or seed script to insert/update all patterns in the database.
4. **Automate for DLCs:** Make the import script reusable for future pattern updates.

#### Example Tools
- Node.js script using `csv-parse` or `papaparse`
- Prisma or direct SQL for DB insertion

---

## 4. tRPC API Endpoint Design

### Endpoint: `getPatternBySeed`
- **Input:** `{ seed: string, team: string[] }`
- **Output:** `{ pois: POI[], patternMeta: {...} }`
- **Logic:**
  1. Query the `patterns` table for the given seed (and optionally nightlord/pattern_index).
  2. Return the POIs and any relevant metadata.
  3. (Optional) Filter or annotate POIs based on team composition.

#### Example tRPC Procedure (TypeScript)
```ts
const getPatternBySeed = t.procedure
  .input(z.object({ seed: z.string(), team: z.array(z.string()) }))
  .query(async ({ input, ctx }) => {
    const pattern = await ctx.prisma.pattern.findUnique({ where: { seed: input.seed } });
    if (!pattern) throw new TRPCError({ code: 'NOT_FOUND' });
    // Optionally filter/annotate POIs based on team
    return { pois: pattern.pois, patternMeta: { nightlord: pattern.nightlord, pattern_index: pattern.pattern_index } };
  });
```

---

## 5. Future-Proofing for DLCs & Updates
- **Schema:** Add columns for DLC, version, or region if needed.
- **Import:** Make the import script idempotent and able to handle new/updated patterns.
- **API:** Allow filtering by DLC or version if multiple pattern sets are supported.

---

## 6. Implementation Checklist
- [ ] Design and migrate the `patterns` table in the database
- [ ] Write a CSV-to-JSON conversion script
- [ ] Write a DB import/seed script
- [ ] Implement the tRPC endpoint for pattern lookup
- [ ] Test with sample queries and team compositions
- [ ] Document the import/update process for future DLCs

---

## 7. References
- [Prisma Docs](https://www.prisma.io/docs/)
- [tRPC Docs](https://trpc.io/docs/)
- [csv-parse](https://csv.js.org/parse/)

---

*This document will be updated as the pipeline and requirements evolve.* 