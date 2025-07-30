// POI Location Mapping Utility
// Maps layout location names to POI IDs from the master coordinate list

export interface POILocationMapping {
  layoutLocation: string;
  poiId: number;
  description?: string;
}

// Mapping from layout location names to POI IDs
// This mapping connects the location names in layout files to the POI IDs in poi_coordinates_with_ids.json
export const POI_LOCATION_TO_ID_MAP: POILocationMapping[] = [
  // Castle
  { layoutLocation: "Castle", poiId: 159, description: "Main Castle enemy" },
  
  // Major Bases
  { layoutLocation: "South Lake", poiId: 93 },
  { layoutLocation: "Groveside", poiId: 94 },
  { layoutLocation: "Gatefront", poiId: 96 },
  { layoutLocation: "Stormhill North of Gate", poiId: 95 },
  { layoutLocation: "Alexander Spot", poiId: 98 },
  { layoutLocation: "Northwest Stormhill", poiId: 97 },
  { layoutLocation: "Northeast Stormhill", poiId: 99 },
  { layoutLocation: "South Mistwood", poiId: 107 },
  { layoutLocation: "Waypoint Ruins", poiId: 108 },
  { layoutLocation: "Minor Erdtree", poiId: 106 },
  { layoutLocation: "West Mistwood", poiId: 105 },
  { layoutLocation: "Northwest Mistwood", poiId: 103 },
  { layoutLocation: "Artist's Shack", poiId: 102 },
  { layoutLocation: "Northeast Mistwood", poiId: 104 },
  { layoutLocation: "Summonwater Approach", poiId: 100 },
  { layoutLocation: "Summonwater", poiId: 101 },

  // Minor Bases
  { layoutLocation: "Far Southwest", poiId: 31 },
  { layoutLocation: "Lake", poiId: 30, description: "Minor Base Lake" },
  { layoutLocation: "Stormhill South of Gate", poiId: 32 },
  { layoutLocation: "Above Stormhill Tunnel Entrance", poiId: 34 },
  { layoutLocation: "West of Warmaster's Shack", poiId: 33 },
  { layoutLocation: "Southeast of Lake", poiId: 28 },
  { layoutLocation: "East of Cavalry Bridge", poiId: 29 },
  { layoutLocation: "Below Summonwater Hawk", poiId: 36 },
  { layoutLocation: "Third Church", poiId: 37 },
  { layoutLocation: "Northeast of Saintsbridge", poiId: 35 },

  // Evergaols
  { layoutLocation: "Northwest of Lake", poiId: 82 },
  { layoutLocation: "Murkwater Terminus", poiId: 78 },
  { layoutLocation: "Stormhill", poiId: 76 },
  { layoutLocation: "Highroad", poiId: 77 },
  { layoutLocation: "East of Lake", poiId: 81 },
  { layoutLocation: "Mistwood", poiId: 80 },
  { layoutLocation: "Northeast Tunnel Entrance", poiId: 79 },

  // Field Bosses
  { layoutLocation: "Far Southwest of Lake", poiId: 85 },
  { layoutLocation: "Lake Field Boss", poiId: 84, description: "Field Boss Lake" },
  { layoutLocation: "North of Stormhill Tunnel Entrance", poiId: 86 },
  { layoutLocation: "North of Murkwater Terminus", poiId: 87 },
  { layoutLocation: "Stormhill Spectral Hawk", poiId: 88 },
  { layoutLocation: "Northwest Stormhill Cliffside", poiId: 89 },
  { layoutLocation: "Mistwood Spectral Hawk", poiId: 83 },
  { layoutLocation: "North Mistwood", poiId: 92 },
  { layoutLocation: "East of Murkwater Terminus", poiId: 90 },
  { layoutLocation: "Northwest of Summonwater", poiId: 91 },

  // Arena Bosses
  { layoutLocation: "Castle Basement", poiId: 23 },
  { layoutLocation: "Castle Rooftop", poiId: 158 },

  // Rotted Woods
  { layoutLocation: "Southwest", poiId: 154 },
  { layoutLocation: "Southeast", poiId: 155 },
  { layoutLocation: "Center West", poiId: 151 },
  { layoutLocation: "Center East", poiId: 153 },
  { layoutLocation: "Far Northwest", poiId: 150 },
  { layoutLocation: "Northwest", poiId: 167 },
  { layoutLocation: "Northeast", poiId: 152 },
  { layoutLocation: "Far Northeast", poiId: 168 },

  // Spawn Points
  { layoutLocation: "Above Stormhill Tunnel Entrance", poiId: 34 },
  { layoutLocation: "Below Summonwater Hawk", poiId: 36 },
  { layoutLocation: "East of Cavalry Bridge", poiId: 29 },
  { layoutLocation: "Far Southwest", poiId: 31 },
  { layoutLocation: "Minor Erdtree", poiId: 106 },
  { layoutLocation: "Northeast of Saintsbridge", poiId: 35 },
  { layoutLocation: "Southeast of Lake", poiId: 28 },
  { layoutLocation: "Stormhill South of Gate", poiId: 32 },
  { layoutLocation: "West of Warmaster's Shack", poiId: 33 },

  // Night Circles
  { layoutLocation: "East of Saintsbridge", poiId: 182 },
  { layoutLocation: "Northeast Corner", poiId: 177 },
  { layoutLocation: "Northeast of Lake", poiId: 184 },
  { layoutLocation: "Northwest Corner", poiId: 178 },
  { layoutLocation: "Northwest Lake", poiId: 185 },
  { layoutLocation: "Northwest Mistwood Pond", poiId: 181 },
  { layoutLocation: "Northwest of Castle", poiId: 183 },
  { layoutLocation: "South Lake", poiId: 179 },
  { layoutLocation: "South of Castle Night Circle", poiId: 187, description: "Night Circle South of Castle" },
  { layoutLocation: "Southwest Corner", poiId: 180 },
  { layoutLocation: "Southwest Mistwood", poiId: 186 },
  { layoutLocation: "West Stormhill Graveyard", poiId: 176 },
  { layoutLocation: "Noklateo Entrance", poiId: 210 },
  { layoutLocation: "North of Crater", poiId: 211 },
  { layoutLocation: "Northwest Rotted Woods", poiId: 150 },
  { layoutLocation: "Southeast Mountaintop", poiId: 212 },
  { layoutLocation: "Southeast Rotted Woods", poiId: 213 },

  // Scale-Bearing Merchant Locations
  { layoutLocation: "Castle Front", poiId: 174 },
  { layoutLocation: "Ruins North of Castle", poiId: 170 },
  { layoutLocation: "Southeast Lakeshore", poiId: 172 },
  { layoutLocation: "South of Castle", poiId: 169, description: "Scale-Bearing Merchant South of Castle" },
];

// Function to get POI ID for a layout location
export function getPOIIdForLocation(location: string): number | null {
  const mapping = POI_LOCATION_TO_ID_MAP.find(m => m.layoutLocation === location);
  return mapping?.poiId || null;
}

// Function to get all POI IDs for a list of locations
export function getPOIIdsForLocations(locations: string[]): number[] {
  return locations
    .map(location => getPOIIdForLocation(location))
    .filter((id): id is number => id !== null);
} 