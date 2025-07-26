// POI Icon Mapping Utility
// Maps POI values from layout files to appropriate icons

export interface POIIconMapping {
  value: string;
  icon: string;
  category: string;
}

// Mapping from layout file values to icons
export const POI_VALUE_TO_ICON_MAP: POIIconMapping[] = [
  // Major Bases
  { value: "Ruins - Depraved Perfumer", icon: "Ruins.png", category: "Major Base" },
  { value: "Ruins - Albinauric Archers", icon: "Ruins.png", category: "Major Base" },
  { value: "Camp - Frenzied Flame Troll", icon: "Main_Encampment.png", category: "Major Base" },
  { value: "Fort - Guardian Golem", icon: "Fort.png", category: "Major Base" },
  { value: "Great Church - Mausoleum Knight", icon: "Great_Church.png", category: "Major Base" },
  { value: "Great Church - Fire Monk", icon: "Great_Church.png", category: "Major Base" },
  { value: "Ruins - Beastmen of Farum Azula", icon: "Ruins.png", category: "Major Base" },
  { value: "Camp - Redmane Knights", icon: "Main_Encampment.png", category: "Major Base" },
  { value: "Camp - Royal Army Knights", icon: "Main_Encampment.png", category: "Major Base" },
  { value: "Fort - Crystalians", icon: "Fort.png", category: "Major Base" },
  { value: "Ruins - Erdtree Burial Watchdogs", icon: "Ruins.png", category: "Major Base" },
  { value: "Camp - Leonine Misbegotten", icon: "Main_Encampment.png", category: "Major Base" },
  { value: "Camp - Flame Chariots", icon: "Main_Encampment.png", category: "Major Base" },
  { value: "Ruins - Sanguine Noble", icon: "Ruins.png", category: "Major Base" },
  { value: "Ruins - Battlemages", icon: "Ruins.png", category: "Major Base" },
  { value: "Great Church - Oracle Envoys", icon: "Great_Church.png", category: "Major Base" },
  { value: "Fort - Lordsworn Captain", icon: "Fort.png", category: "Major Base" },
  { value: "Fort - Guardian Golem", icon: "Fort.png", category: "Major Base" },

  // Minor Bases
  { value: "Church - Normal", icon: "Church.png", category: "Minor Base" },
  { value: "Sorcerer's Rise - Unlit Candle", icon: "Sorcerer's_Rise.png", category: "Minor Base" },
  { value: "Small Camp - Dogs and Soldiers", icon: "Main_Encampment.png", category: "Minor Base" },
  { value: "Small Camp - Caravans", icon: "Main_Encampment.png", category: "Minor Base" },
  { value: "Small Camp - Demi-Humans", icon: "Main_Encampment.png", category: "Minor Base" },
  { value: "Small Camp - Dogs", icon: "Main_Encampment.png", category: "Minor Base" },
  { value: "Sorcerer's Rise - Fog Door", icon: "Sorcerer's_Rise.png", category: "Minor Base" },
  { value: "Township - Township", icon: "Township.png", category: "Minor Base" },
  { value: "Small Camp - Caravans and Nobles", icon: "Main_Encampment.png", category: "Minor Base" },

  // Evergaols
  { value: "Nox Warriors", icon: "Evergaol.png", category: "Evergaol" },
  { value: "Bloodhound Knight", icon: "Evergaol.png", category: "Evergaol" },
  { value: "Beastmen of Farum Azula", icon: "Evergaol.png", category: "Evergaol" },
  { value: "Grave Warden Duelist", icon: "Evergaol.png", category: "Evergaol" },
  { value: "Banished Knights", icon: "Evergaol.png", category: "Evergaol" },
  { value: "Godskin Apostle", icon: "Evergaol.png", category: "Evergaol" },
  { value: "Crucible Knight with Sword", icon: "Evergaol.png", category: "Evergaol" },
  { value: "Crucible Knight with Spear", icon: "Evergaol.png", category: "Evergaol" },
  { value: "Beastly Brigade", icon: "Evergaol.png", category: "Evergaol" },
  { value: "Crystalians", icon: "Evergaol.png", category: "Evergaol" },

  // Field Bosses
  { value: "Leonine Misbegotten", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Bell Bearing Hunter", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Red Wolf", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Elder Lion", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Royal Carian Knight", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Night's Cavalry", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Golden Hippopotamus", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Ulcerated Tree Spirit", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Royal Revenant", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Death Rite Bird", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Magma Wyrm", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Black Blade Kindred", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Ancient Hero of Zamor", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Grafted Scion", icon: "Field_Boss.png", category: "Field Boss" },

  // Arena Bosses
  { value: "Grafted Scion", icon: "Field_Boss.png", category: "Arena Boss" },
  { value: "Ancestor Spirit", icon: "Field_Boss.png", category: "Field Boss" },

  // Castle
  { value: "Trolls", icon: "Castle.png", category: "Castle" },
];

// Function to get icon for a POI value
export function getIconForPOIValue(value: string): string {
  const mapping = POI_VALUE_TO_ICON_MAP.find(m => m.value === value);
  return mapping?.icon || "Ruins.png"; // Default fallback
}

// Function to get category for a POI value
export function getCategoryForPOIValue(value: string): string {
  const mapping = POI_VALUE_TO_ICON_MAP.find(m => m.value === value);
  return mapping?.category || "Unknown";
}

// Function to check if a POI value should be shown
export function shouldShowPOI(value: string): boolean {
  return value !== "empty";
} 