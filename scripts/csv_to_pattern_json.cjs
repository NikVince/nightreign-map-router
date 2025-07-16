"use strict";
// csv_to_pattern_json.ts
// Script to convert Elden Ring Nightreign map patterns CSV to JSON for DB import
// Usage: ts-node scripts/csv_to_pattern_json.ts
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var sync_1 = require("csv-parse/sync");
// Path to the CSV file
var csvPath = path.join(__dirname, '../reference_material/Elden Ring Nightreign map patterns - Patterns.csv');
// Output path for the generated JSON
var outputPath = path.join(__dirname, '../reference_material/patterns.json');
// Read CSV file
var csvContent = fs.readFileSync(csvPath, 'utf-8');
// Parse CSV
var records = (0, sync_1.parse)(csvContent, {
    columns: true,
    skip_empty_lines: true,
});
// Helper: Clean up POI fields (remove empty, trim, etc.)
function extractPOIs(record) {
    // All columns after the first 10 are POI columns (adjust if needed)
    var poiKeys = Object.keys(record).slice(10);
    return poiKeys
        .map(function (key, idx) {
        var _a;
        var value = (_a = record[key]) === null || _a === void 0 ? void 0 : _a.trim();
        if (!value)
            return null;
        return {
            id: "poi_".concat(idx),
            name: key,
            label: value,
            // Add more fields as needed (e.g., coordinates, type)
        };
    })
        .filter(Boolean);
}
// Convert records to pattern objects
var patterns = records.map(function (record, i) {
    return {
        seed: record[''], // The first column is usually the seed/index
        nightlord: record['Nightlord'],
        patternIndex: parseInt(record['']),
        pois: extractPOIs(record),
        // Add more fields if needed
    };
});
// Write to JSON
fs.writeFileSync(outputPath, JSON.stringify(patterns, null, 2));
console.log("Converted ".concat(patterns.length, " patterns to JSON. Output: ").concat(outputPath));
