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
  { value: "Ruins - Albinaurics", icon: "Ruins.png", category: "Major Base" },
  { value: "Ruins - Ancient Heroes of Zamor", icon: "Ruins.png", category: "Major Base" },
  { value: "Ruins - Battlemages", icon: "Ruins.png", category: "Major Base" },
  { value: "Ruins - Beastmen of Farum Azula", icon: "Ruins.png", category: "Major Base" },
  { value: "Ruins - Erdtree Burial Watchdogs", icon: "Ruins.png", category: "Major Base" },
  { value: "Ruins - Perfumer", icon: "Ruins.png", category: "Major Base" },
  { value: "Ruins - Runebear", icon: "Ruins.png", category: "Major Base" },
  { value: "Ruins - Sanguine Noble", icon: "Ruins.png", category: "Major Base" },
  { value: "Ruins - Wormface", icon: "Ruins.png", category: "Major Base" },
  
  { value: "Camp - Banished Knights", icon: "Main_Encampment.png", category: "Major Base" },
  { value: "Camp - Elder Lion", icon: "Main_Encampment.png", category: "Major Base" },
  { value: "Camp - Flame Chariots", icon: "Main_Encampment.png", category: "Major Base" },
  { value: "Camp - Frenzied Flame Troll", icon: "Main_Encampment.png", category: "Major Base" },
  { value: "Camp - Leonine Misbegotten", icon: "Main_Encampment.png", category: "Major Base" },
  { value: "Camp - Redmane Knights", icon: "Main_Encampment.png", category: "Major Base" },
  { value: "Camp - Royal Army Knights", icon: "Main_Encampment.png", category: "Major Base" },
  
  { value: "Fort - Abductor Virgin", icon: "Fort.png", category: "Major Base" },
  { value: "Fort - Crystalians", icon: "Fort.png", category: "Major Base" },
  { value: "Fort - Guardian Golem", icon: "Fort.png", category: "Major Base" },
  { value: "Fort - Lordsworn Captain", icon: "Fort.png", category: "Major Base" },
  
  { value: "Great Church - Fire Monk", icon: "Great_Church.png", category: "Major Base" },
  { value: "Great Church - Guardian Golem", icon: "Great_Church.png", category: "Major Base" },
  { value: "Great Church - Mausoleum Knight", icon: "Great_Church.png", category: "Major Base" },
  { value: "Great Church - Oracle Envoys", icon: "Great_Church.png", category: "Major Base" },

  // Minor Bases
  { value: "Church - Normal", icon: "Church.png", category: "Minor Base" },
  { value: "Church - Rats", icon: "Church.png", category: "Minor Base" },
  
  { value: "Sorcerer's Rise - Above Door", icon: "Sorcerer's_Rise.png", category: "Minor Base" },
  { value: "Sorcerer's Rise - Fake Building", icon: "Sorcerer's_Rise.png", category: "Minor Base" },
  { value: "Sorcerer's Rise - Fleeing Stump", icon: "Sorcerer's_Rise.png", category: "Minor Base" },
  { value: "Sorcerer's Rise - Fog Door", icon: "Sorcerer's_Rise.png", category: "Minor Base" },
  { value: "Sorcerer's Rise - Imp Statue", icon: "Sorcerer's_Rise.png", category: "Minor Base" },
  { value: "Sorcerer's Rise - Missing Statue", icon: "Sorcerer's_Rise.png", category: "Minor Base" },
  { value: "Sorcerer's Rise - Pool Reflection", icon: "Sorcerer's_Rise.png", category: "Minor Base" },
  { value: "Sorcerer's Rise - Unlit Candle", icon: "Sorcerer's_Rise.png", category: "Minor Base" },
  { value: "Sorcerer's Rise - Windy Trees", icon: "Sorcerer's_Rise.png", category: "Minor Base" },
  { value: "Sorcerer's Rise - Withered Trees", icon: "Sorcerer's_Rise.png", category: "Minor Base" },
  
  { value: "Township - Township", icon: "Township.png", category: "Minor Base" },
  
  // Note: Small Camps are intentionally not mapped - they should not appear on the map
  // Small Camp entries: Caravans, Caravans and Nobles, Demi-Humans, Dogs, Dogs and Soldiers,
  // Foot Soldiers, Guilty, Misbegotten, Nobles and Soldiers, Rats and Demi-Humans, Shack, Soldiers, Wandering Nobles

  // Evergaols
  { value: "Banished Knights", icon: "Evergaol.png", category: "Evergaol" },
  { value: "Beastly Brigade", icon: "Evergaol.png", category: "Evergaol" },
  { value: "Beastmen of Farum Azula", icon: "Evergaol.png", category: "Evergaol" },
  { value: "Bloodhound Knight", icon: "Evergaol.png", category: "Evergaol" },
  { value: "Crucible Knight with Spear", icon: "Evergaol.png", category: "Evergaol" },
  { value: "Crucible Knight with Sword", icon: "Evergaol.png", category: "Evergaol" },
  { value: "Crystalians", icon: "Evergaol.png", category: "Evergaol" },
  { value: "Godskin Apostle", icon: "Evergaol.png", category: "Evergaol" },
  { value: "Godskin Duo", icon: "Evergaol.png", category: "Evergaol" },
  { value: "Godskin Noble", icon: "Evergaol.png", category: "Evergaol" },
  { value: "Grave Warden Duelist", icon: "Evergaol.png", category: "Evergaol" },
  { value: "Nox Warriors", icon: "Evergaol.png", category: "Evergaol" },
  { value: "Omen", icon: "Evergaol.png", category: "Evergaol" },
  { value: "Stoneskin Lords", icon: "Evergaol.png", category: "Evergaol" },
  { value: "Dragonkin Soldier", icon: "Evergaol.png", category: "Evergaol" },

  // Field Bosses
  { value: "Ancient Dragon", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Ancient Hero of Zamor", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Ancestor Spirit", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Bell Bearing Hunter", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Black Blade Kindred", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Black Knife Assassin", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Death Rite Bird", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Demi-Human Queen", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Draconic Tree Sentinel", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Elder Lion", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Erdtree Avatar", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Flying Dragon", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Golden Hippopotamus", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Grafted Scion", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Leonine Misbegotten", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Magma Wyrm", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Miranda Blossom", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Night's Cavalry", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Putrid Ancestral Followers", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Royal Carian Knight", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Royal Revenant", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Ulcerated Tree Spirit", icon: "Field_Boss.png", category: "Field Boss" },

  // Arena Bosses
  { value: "Grafted Scion", icon: "Arena_Boss.png", category: "Arena Boss" },

  // New POI Types
  { value: "Spawn Point", icon: "Spawn_Location.png", category: "Spawn Point" },
  { value: "Scale-Bearing Merchant", icon: "Scale_Bearing_Merchant.png", category: "Merchant" },
  { value: "Night Boss", icon: "Event.png", category: "Night Circle" },
  { value: "Red Wolf", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Royal Revenant", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Tree Sentinel", icon: "Field_Boss.png", category: "Field Boss" },
  { value: "Trolls", icon: "Castle.png", category: "Castle" },
  { value: "Ulcerated Tree Spirit", icon: "Field_Boss.png", category: "Field Boss" },

  // Castle
  { value: "Crucible Knights", icon: "Castle.png", category: "Castle" },

  // Map Events (these might need special handling)
  { value: "Map Event - Artist's Shack", icon: "Map_Event.png", category: "Map Event" },
  { value: "Map Event - Gatefront", icon: "Map_Event.png", category: "Map Event" },
  { value: "Map Event - Minor Erdtree", icon: "Map_Event.png", category: "Map Event" },
  { value: "Map Event - Northeast Mistwood", icon: "Map_Event.png", category: "Map Event" },
  { value: "Map Event - Northeast Stormhill", icon: "Map_Event.png", category: "Map Event" },
  { value: "Map Event - Northwest Mistwood", icon: "Map_Event.png", category: "Map Event" },
  { value: "Map Event - Northwest Stormhill", icon: "Map_Event.png", category: "Map Event" },
  { value: "Map Event - South Lake", icon: "Map_Event.png", category: "Map Event" },
  { value: "Map Event - South Mistwood", icon: "Map_Event.png", category: "Map Event" },
  { value: "Map Event - Summonwater Approach", icon: "Map_Event.png", category: "Map Event" },
  { value: "Map Event - Summonwater", icon: "Map_Event.png", category: "Map Event" },
  { value: "Map Event - West Mistwood", icon: "Map_Event.png", category: "Map Event" },

  // Difficult Sorcerer's Rise (these might need special handling)
  { value: "Difficult Sorcerer's Rise - Above Door, Teleporting Trees, Missing Statue", icon: "Sorcerer's_Rise.png", category: "Minor Base" },
  { value: "Difficult Sorcerer's Rise - Fake Building, Pool Reflection, Second Floor", icon: "Sorcerer's_Rise.png", category: "Minor Base" },
  { value: "Difficult Sorcerer's Rise - Fake Building, Right of Door, Unlit Candle", icon: "Sorcerer's_Rise.png", category: "Minor Base" },
  { value: "Difficult Sorcerer's Rise - Imp Statue, Teleporting Trees, Fleeing Stump", icon: "Sorcerer's_Rise.png", category: "Minor Base" },
  { value: "Difficult Sorcerer's Rise - Imp Statue, Windy Trees, Second Floor", icon: "Sorcerer's_Rise.png", category: "Minor Base" },
  { value: "Difficult Sorcerer's Rise - Rear Withered Trees, Right of Door, Missing Statue", icon: "Sorcerer's_Rise.png", category: "Minor Base" },
];

// Function to get icon for a POI value (legacy function for backward compatibility)
export function getIconForPOIValue(value: string): string | null {
  const mapping = POI_VALUE_TO_ICON_MAP.find(m => m.value === value);
  return mapping?.icon || null; // Return null instead of default fallback
}

// New function that considers both key context and value for icon assignment
export function getIconForPOIWithContext(key: string, value: string, specialEvent?: string): string | null {
  // First, check if the key provides context about the POI type
  const keyType = key.split(' - ')[0]; // Extract type from key (e.g., "Evergaol", "Field Boss", etc.)
  
  // Special handling for Dragonkin Soldier based on context
  if (value === "Dragonkin Soldier") {
    if (keyType === "Evergaol") {
      return "Evergaol.png";
    } else if (keyType === "Field Boss" || keyType === "Night") {
      return "Field_Boss.png";
    }
  }
  
  // Special handling for meteor strikes and frenzy towers
  if (specialEvent) {
    // Check if this is a meteor strike or frenzy tower event
    const isMeteorStrike = specialEvent.includes("Meteor Strike");
    const isFrenzyTower = specialEvent.includes("Frenzy Tower");
    
    // If this is a Map Event POI and we have a meteor strike event,
    // override the icon to Event.png
    if (isMeteorStrike && value.startsWith("Map Event -")) {
      return "Event.png";
    }
    
    // For frenzy towers, they have their own POI entries, so no override needed here
  }
  
  // For other cases, use the existing mapping logic
  const mapping = POI_VALUE_TO_ICON_MAP.find(m => m.value === value);
  return mapping?.icon || null;
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