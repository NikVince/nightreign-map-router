import type { Landmark, MapPattern } from "../types/core";
import { Nightlord } from "../types/core";
import { LandmarkType } from "../types/core";

const landmarkTypeToIcon: Record<LandmarkType, string> = {
  [LandmarkType.Castle]: "Castle.png",
  [LandmarkType.Church]: "Church.png",
  [LandmarkType.Fort]: "Fort.png",
  [LandmarkType.GreatChurch]: "Great_Church.png",
  [LandmarkType.MainEncampment]: "Main_Encampment.png",
  [LandmarkType.Ruins]: "Ruins.png",
  [LandmarkType.SorcerersRise]: "Sorcerer's_Rise.png",
  [LandmarkType.Township]: "Township.png",
  [LandmarkType.Evergaol]: "Evergaol.png",
  [LandmarkType.FieldBoss]: "Field_Boss.png",
  [LandmarkType.SiteOfGrace]: "Site_of_Grace.png",
  [LandmarkType.SpectralHawkTree]: "Spectral_Hawk_Tree.png",
  [LandmarkType.Spiritstream]: "Spiritstream.png",
  [LandmarkType.Scarab]: "Scarab.png",
  [LandmarkType.TunnelEntrance]: "Tunnel_Entrance.png",
  // Add more as needed
};

export const MOCK_LANDMARKS: Landmark[] = [
  {
    id: "Gladius-0-Castle",
    type: LandmarkType.Castle,
    name: "Limveld Central Castle",
    x: 500,
    y: 500,
    icon: landmarkTypeToIcon[LandmarkType.Castle],
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
    icon: landmarkTypeToIcon[LandmarkType.Church],
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
    icon: landmarkTypeToIcon[LandmarkType.Fort],
    priority: 80,
    contents: ["Map", "Mini-boss"],
    notes: "Good for early rune farming.",
    patternId: "Gladius-0",
  },
  {
    id: "Gladius-0-Church-Center",
    type: LandmarkType.Church,
    name: "Test Center Church",
    x: 500,
    y: 500,
    icon: landmarkTypeToIcon[LandmarkType.Church],
    priority: 95,
    contents: ["Test POI for icon rendering"],
    notes: "This is a test church at the map center.",
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