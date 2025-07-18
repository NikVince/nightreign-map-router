// Core type definitions for Nightreign Map Router
// Reference: /docs/DEVELOPMENT_CHECKLIST.md, /reference_material/landmarks_map_system.md, /reference_material/nightlords_reference.md, /reference_material/timing_circle_mechanics.md

// --- Landmark Types ---
// Reference: /reference_material/landmarks_map_system.md, /reference_material/Elden Ring Nightreign map patterns - Patterns.csv
export enum LandmarkType {
  Church = "Church",
  GreatChurch = "GreatChurch",
  Castle = "Castle",
  Fort = "Fort",
  Tunnel = "Tunnel",
  MainEncampment = "MainEncampment",
  Ruins = "Ruins",
  SorcerersRise = "SorcerersRise",
  OldSorcerersRise = "OldSorcerersRise",
  Township = "Township",
  Evergaol = "Evergaol",
  ArenaBoss = "ArenaBoss", // Added for Arena Boss POIs
  FieldBoss = "FieldBoss", // Roaming bosses, revealed on day 2 or by fort map
  RottedWoods = "RottedWoods", // Special region
  RotBlessing = "RotBlessing", // Special event/bonus
  // Secondary elements (optional for core logic)
  SiteOfGrace = "SiteOfGrace",
  SpectralHawkTree = "SpectralHawkTree",
  Spiritstream = "Spiritstream",
  Scarab = "Scarab",
  TunnelEntrance = "TunnelEntrance",
}

export interface Landmark {
  id: string; // Unique identifier
  type: LandmarkType;
  name?: string; // Optional display name
  x: number; // Map coordinate (game units or null if not yet assigned)
  y: number; // Map coordinate (game units or null if not yet assigned)
  icon?: string; // Optional icon asset reference
  priority?: number; // For route calculation (higher = more important)
  contents?: string[]; // e.g. ["Mini-boss", "Merchant", "Smithing Table"]
  notes?: string; // Optional strategy or notes
  patternId?: string; // Link to MapPattern
  bossId?: string; // If this POI is a boss location
  eventType?: string; // For special events (e.g. Shifting Earth, Rot Blessing)
}

// --- Nightlord Enum/Type ---
export enum Nightlord {
  Gladius = "Gladius",
  Maris = "Maris",
  Gnoster = "Gnoster",
  Libra = "Libra",
  Fulghor = "Fulghor",
  Caligo = "Caligo",
  Adel = "Adel",
  Heolstor = "Heolstor",
}

// --- Map Pattern ---
// Reference: /reference_material/Elden Ring Nightreign map patterns - Patterns.csv
export interface MapPattern {
  id: string; // Unique pattern identifier (e.g. "Gladius-01")
  nightlord: Nightlord;
  patternIndex: number; // 0-39 (40 patterns per Nightlord)
  seed: number; // 32-bit expedition seed
  landmarks: Landmark[];
  shiftingEarthEvents?: string[]; // Optional, names or IDs of events
  circleSequence: { x: number; y: number; radius: number }[]; // Circle positions and radii for each phase
  specialEvents?: string[]; // e.g. ["Day 1 Meteor Strike", "Day 2 Night Horde"]
}

// --- Route Calculation ---
export interface RouteCalculation {
  patternId: string;
  nightlord: Nightlord;
  route: string[]; // Ordered list of landmark IDs to visit
  totalDistance: number; // Total travel distance (game units)
  estimatedTime: number; // Estimated time to complete route (seconds or minutes)
  priorities: Record<string, number>; // Priority score per landmark
  notes?: string; // Optional strategy notes
}

// --- Boss Category ---
// Reference: /reference_material/complete_boss_list.md
export enum BossCategory {
  Nightlord = "Nightlord",
  Evergaol = "Evergaol",
  Field = "Field",
  Night = "Night",
  Event = "Event",
  Remembrance = "Remembrance",
  Arena = "Arena", // Added for Arena Bosses
  Other = "Other",
}

// --- Boss Interface ---
export interface Boss {
  id: string;
  name: string;
  category: BossCategory;
  description?: string;
  expedition?: string; // e.g. "Tricephalos", "Gaping Jaw"
  phases?: number;
  weaknesses?: DamageType[];
  statusWeaknesses?: StatusEffect[];
  notes?: string;
}

// --- Nightfarer Classes ---
export enum NightfarerClassType {
  Wylder = "Wylder",
  Guardian = "Guardian",
  Ironeye = "Ironeye",
  Raider = "Raider",
  Recluse = "Recluse",
  Executor = "Executor",
  Duchess = "Duchess",
  Revenant = "Revenant",
}

export interface NightfarerClass {
  id: NightfarerClassType;
  archetype: string;
  difficulty: string;
  relicSlots: string[]; // e.g. ["Red", "Green", "Blue"]
  startingGear: string[];
  abilities: {
    passive: string;
    skill: string;
    ultimate: string;
  };
  notes?: string;
}

// --- Damage Types ---
export enum DamageType {
  Standard = "Standard",
  Strike = "Strike",
  Slash = "Slash",
  Pierce = "Pierce",
  Fire = "Fire",
  Lightning = "Lightning",
  Magic = "Magic",
  Holy = "Holy",
}

// --- Status Effects ---
export enum StatusEffect {
  BloodLoss = "BloodLoss",
  Frostbite = "Frostbite",
  Poison = "Poison",
  ScarletRot = "ScarletRot",
  Sleep = "Sleep",
  Madness = "Madness",
  DeathBlight = "DeathBlight",
}

// --- Shifting Earth Events ---
export enum ShiftingEarthEventType {
  Crater = "Crater",
  Mountaintop = "Mountaintop",
  RottedWoods = "RottedWoods",
  Noklateo = "Noklateo",
}

export interface ShiftingEarthEvent {
  id: ShiftingEarthEventType;
  name: string;
  location: string;
  theme: string;
  environmentalChanges: string;
  bosses: string[]; // Boss IDs or names
  uniqueReward: string;
  notes?: string;
}

// --- Map Component Union ---
export type MapComponent =
  | { type: "landmark"; data: Landmark }
  | { type: "boss"; data: Boss }
  | { type: "shiftingEarthEvent"; data: ShiftingEarthEvent }; 