import type { Landmark, MapPattern } from "../types/core";
import { Nightlord } from "../types/core";
import { LandmarkType } from "../types/core";

export const MOCK_LANDMARKS: Landmark[] = [
  {
    id: "Gladius-0-Castle",
    type: LandmarkType.Castle,
    name: "Limveld Central Castle",
    x: 500,
    y: 500,
    icon: "castle.png",
    priority: 100,
    contents: ["Multiple bosses", "Chests"],
    notes: "Always in the center of the map.",
    patternId: "Gladius-0",
  },
  {
    id: "Gladius-0-Church",
    type: LandmarkType.Church,
    name: "First Church of Limveld",
    x: 200,
    y: 300,
    icon: "church.png",
    priority: 90,
    contents: ["Sacred Flask"],
    notes: "High priority for flask upgrade.",
    patternId: "Gladius-0",
  },
  {
    id: "Gladius-0-Fort",
    type: LandmarkType.Fort,
    name: "North Fort",
    x: 700,
    y: 200,
    icon: "fort.png",
    priority: 80,
    contents: ["Map", "Mini-boss"],
    notes: "Good for early rune farming.",
    patternId: "Gladius-0",
  },
];

export const MOCK_PATTERNS: MapPattern[] = [
  {
    id: "Gladius-0",
    nightlord: Nightlord.Gladius,
    patternIndex: 0,
    seed: 123456,
    shiftingEarthEvents: [],
    circleSequence: [
      { x: 500, y: 500, radius: 300 },
      { x: 600, y: 400, radius: 150 },
    ],
    specialEvents: ["Day 1 Meteor Strike"],
    landmarks: MOCK_LANDMARKS,
  },
]; 