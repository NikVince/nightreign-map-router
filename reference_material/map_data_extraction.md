# Comprehensive Technical Guide: Extracting Map Data from Elden Ring: Nightreign

## Executive Summary

This technical guide provides complete workflows for extracting map data, Point of Interest (POI) coordinates, and procedural generation information from Elden Ring: Nightreign game files. The extraction process involves specialized tools for FromSoftware's proprietary formats, coordinate system conversions, and community-developed automation scripts.

## Understanding Nightreign's Procedural Generation Architecture

**Core System Overview:**
- **320 total seed patterns** (8 Nightlords × 40 patterns each)
- **32-bit expedition seed** determines pattern selection
- **Static elements**: Sites of Grace, Spectral Hawk Trees, Spiritstreams, basic topography
- **Dynamic elements**: Forts, cathedrals, churches, camps, ruins, boss placements
- **Shifting Earth events**: Modify terrain with volcanoes, swamps, forests

The game uses a hybrid approach where base terrain remains consistent while POI spawns, enemy placements, and encounter types are procedurally generated based on the expedition seed and active remembrances.

## Essential File Formats and Locations

### Primary Game Files Structure
```
ELDEN RING NIGHTREIGN/Game/
├── data0.bdt/bhd    # Core game data
├── data1.bdt/bhd    # Additional content  
├── data2.bdt/bhd    # Map data and MSB files
├── data3.bdt/bhd    # Character models and animations
├── data4.bdt/bhd    # Item and equipment data
├── data5.bdt/bhd    # Effects and audio
└── regulation.bin   # Encrypted game parameters
```

### Critical File Formats

**MSB (Map Studio Binary)**
- Location: `data2.bdt/map/` directory
- Contains: Object placements, collision data, trigger volumes, coordinate systems
- Structure: Parts (objects), Regions (areas), Events (triggers)
- Coordinate system: Left-handed with Y-axis vertical

**PARAM Files**
- Location: `data0.bdt/param/` and within `regulation.bin`
- Contains: Game parameters, spawn logic, loot tables, procedural generation rules
- Structure: Rows with unique IDs, requires PARAMDEF files for parsing
- Key files: `ItemLotParam`, `SpawnLotParam`, `GeneratorParam`

**BND/BDT Archives**
- Format: Binary containers with DCX compression (Oodle Kraken)
- Structure: BHD (header with file list), BDT (compressed data)
- Encryption: File names are hashed in newer games

## Step-by-Step Extraction Workflow

### Phase 1: Initial Game Archive Extraction

**Step 1: Install Required Tools**
```bash
# Download and install dependencies
- .NET Framework 4.7.2+ or .NET Core 7.0+
- Visual C++ Redistributable x64
- oo2core_6_win64.dll (for Oodle compression)
```

**Step 2: Unpack Game Archives**
```bash
# Using UXM Selective Unpacker
UXM.exe --unpack "eldenring.exe"
# This creates unpacked directories in game folder

# Alternative: Selective extraction
UXM.exe --unpack "eldenring.exe" --selective
# Select: data0.bdt, data2.bdt, regulation.bin
```

**Step 3: Extract Individual Files**
```bash
# Using WitchyBND for comprehensive extraction
WitchyBND.exe --recursive --location "extracted/" data2.bdt

# Extract specific map files
WitchyBND.exe "map/m60_50_38_00.msb.dcx" --location "maps/"

# Extract regulation.bin parameters
WitchyBND.exe "regulation.bin" --location "params/"
```

### Phase 2: MSB Map Data Extraction

**Step 4: Parse MSB Files for Coordinates**
```python
# Using SoulsFormats library
from soulstruct import MSB3  # or MSBE for Elden Ring

# Load MSB file
msb = MSB3.from_path("m60_50_38_00.msb")

# Extract coordinate data
coordinates = []
for part in msb.parts:
    coord_data = {
        'id': part.name,
        'type': part.__class__.__name__,
        'x': part.translate[0],
        'y': part.translate[1],
        'z': part.translate[2],
        'rot_x': part.rotate[0],
        'rot_y': part.rotate[1], 
        'rot_z': part.rotate[2],
        'scale_x': part.scale[0],
        'scale_y': part.scale[1],
        'scale_z': part.scale[2]
    }
    coordinates.append(coord_data)
```

**Step 5: Extract Regions and Event Triggers**
```python
# Parse region data for POI boundaries
regions = []
for region in msb.regions:
    region_data = {
        'name': region.name,
        'type': region.__class__.__name__,
        'center_x': region.translate[0],
        'center_y': region.translate[1],
        'center_z': region.translate[2],
        'shape_type': region.shape.__class__.__name__,
        'shape_data': region.shape.get_shape_data()
    }
    regions.append(region_data)

# Parse event triggers
events = []
for event in msb.events:
    event_data = {
        'name': event.name,
        'type': event.__class__.__name__,
        'entity_id': event.entity_id,
        'part_name': event.part_name,
        'region_name': event.region_name
    }
    events.append(event_data)
```

### Phase 3: Parameter Data Extraction

**Step 6: Extract Procedural Generation Parameters**
```python
# Using RegulationBinUtilities approach
import struct

def extract_spawn_parameters(param_file):
    with open(param_file, 'rb') as f:
        # Read param header
        header = struct.unpack('<4sI', f.read(8))
        
        # Parse parameter rows
        spawn_data = []
        for row_id in range(header[1]):
            row_data = parse_param_row(f)
            if row_data['type'] == 'spawn_location':
                spawn_data.append({
                    'id': row_data['id'],
                    'x': row_data['position_x'],
                    'y': row_data['position_y'],
                    'z': row_data['position_z'],
                    'enemy_id': row_data['enemy_id'],
                    'spawn_rate': row_data['spawn_rate']
                })
        return spawn_data
```

**Step 7: Extract Seed-to-Pattern Mapping**
```python
# Based on community research by thefifthmatt
def extract_pattern_mapping():
    patterns = {}
    
    # Extract from assembly or decompiled code
    # Pattern ID = (nightlord_id * 40) + pattern_offset
    for nightlord in range(8):
        for pattern in range(40):
            pattern_id = (nightlord * 40) + pattern
            
            # Extract pattern data
            pattern_data = {
                'pattern_id': pattern_id,
                'nightlord': nightlord,
                'shifting_earth': get_shifting_earth_type(pattern),
                'poi_locations': extract_poi_for_pattern(pattern_id),
                'spawn_points': extract_spawn_points(pattern_id)
            }
            patterns[pattern_id] = pattern_data
    
    return patterns
```

## Advanced Coordinate System Conversion

### Game-to-Web Coordinate Transformation
```python
def convert_coordinates_to_web(game_coords, map_bounds):
    """Convert FromSoftware coordinates to web-compatible format"""
    
    # Coordinate system conversion (left-handed to right-handed)
    web_coords = {
        'x': game_coords['x'],
        'y': game_coords['z'],  # Z becomes Y for 2D mapping
        'z': game_coords['y']   # Y becomes Z (elevation)
    }
    
    # Normalize to map bounds (0-1 range)
    normalized = {
        'x': (web_coords['x'] - map_bounds['min_x']) / (map_bounds['max_x'] - map_bounds['min_x']),
        'y': (web_coords['y'] - map_bounds['min_y']) / (map_bounds['max_y'] - map_bounds['min_y']),
        'elevation': web_coords['z']
    }
    
    return normalized

# Example usage
map_bounds = {
    'min_x': -2048.0,
    'max_x': 2048.0,
    'min_y': -2048.0,
    'max_y': 2048.0
}

web_coords = convert_coordinates_to_web(extracted_coords, map_bounds)
```

### Export to Standard Formats
```python
# JSON Export for Web Applications
def export_to_json(coordinate_data, output_file):
    export_data = {
        'metadata': {
            'game': 'Elden Ring: Nightreign',
            'extraction_date': datetime.now().isoformat(),
            'coordinate_system': 'web_normalized',
            'total_entities': len(coordinate_data)
        },
        'poi_categories': {
            'churches': [],
            'forts': [],
            'ruins': [],
            'camps': [],
            'sites_of_grace': [],
            'boss_locations': []
        },
        'seed_patterns': {}
    }
    
    # Organize by POI type
    for entity in coordinate_data:
        poi_type = classify_poi_type(entity)
        export_data['poi_categories'][poi_type].append({
            'id': entity['id'],
            'name': entity['name'],
            'coordinates': {
                'x': entity['normalized_x'],
                'y': entity['normalized_y'],
                'elevation': entity['elevation']
            },
            'pattern_ids': entity['valid_patterns']
        })
    
    with open(output_file, 'w') as f:
        json.dump(export_data, f, indent=2)

# CSV Export for Analysis
def export_to_csv(coordinate_data, output_file):
    fieldnames = ['id', 'name', 'type', 'x', 'y', 'z', 'pattern_ids', 'spawn_conditions']
    
    with open(output_file, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        for entity in coordinate_data:
            writer.writerow({
                'id': entity['id'],
                'name': entity['name'],
                'type': entity['type'],
                'x': entity['x'],
                'y': entity['y'],
                'z': entity['z'],
                'pattern_ids': ';'.join(map(str, entity['valid_patterns'])),
                'spawn_conditions': entity['spawn_conditions']
            })
```

## Community Tools and Automation Scripts

### Nightreign-Specific Tools

**1. thefifthmatt's Nightreign Randomizer**
```bash
# Installation
git clone https://github.com/thefifthmatt/nightreign-randomizer
cd nightreign-randomizer

# Generate custom seed patterns
python generate_patterns.py --count 100 --filter "no_volcano"

# Extract existing pattern data
python extract_patterns.py --output "pattern_database.json"
```

**2. Map Seed Recognition (TRC)**
```javascript
// Google Apps Script for pattern identification
function recognizePattern(churchLocations, riseLocations) {
    const patterns = loadPatternDatabase();
    
    for (let pattern of patterns) {
        if (matchesChurchConfiguration(churchLocations, pattern.churches) &&
            matchesRiseConfiguration(riseLocations, pattern.rises)) {
            return pattern.id;
        }
    }
    return null;
}
```

**3. Automated Extraction Pipeline**
```python
# Complete automation script
import subprocess
import json
import os

class NightreignExtractor:
    def __init__(self, game_path):
        self.game_path = game_path
        self.tools = {
            'uxm': 'UXM.exe',
            'witchybnd': 'WitchyBND.exe',
            'smithbox': 'Smithbox.exe'
        }
    
    def full_extraction_pipeline(self):
        # Phase 1: Unpack archives
        self.unpack_game_archives()
        
        # Phase 2: Extract MSB files
        msb_files = self.extract_msb_files()
        
        # Phase 3: Parse coordinates
        coordinates = self.parse_all_coordinates(msb_files)
        
        # Phase 4: Extract parameters
        parameters = self.extract_parameters()
        
        # Phase 5: Generate pattern mapping
        patterns = self.generate_pattern_mapping(coordinates, parameters)
        
        # Phase 6: Export data
        self.export_all_formats(coordinates, patterns)
        
        return {
            'coordinates': coordinates,
            'patterns': patterns,
            'total_entities': len(coordinates)
        }
    
    def unpack_game_archives(self):
        cmd = [self.tools['uxm'], '--unpack', f'{self.game_path}/eldenring.exe']
        subprocess.run(cmd, check=True)
    
    def extract_msb_files(self):
        map_files = []
        map_dir = f'{self.game_path}/map'
        
        for file in os.listdir(map_dir):
            if file.endswith('.msb.dcx'):
                cmd = [self.tools['witchybnd'], f'{map_dir}/{file}']
                subprocess.run(cmd, check=True)
                map_files.append(file)
        
        return map_files
    
    def parse_all_coordinates(self, msb_files):
        all_coordinates = []
        
        for msb_file in msb_files:
            coords = self.parse_msb_coordinates(msb_file)
            all_coordinates.extend(coords)
        
        return all_coordinates
```

## Performance Optimization and Batch Processing

### Multi-threaded Extraction
```python
import threading
from concurrent.futures import ThreadPoolExecutor

def parallel_extraction(file_list, max_workers=4):
    def extract_single_file(file_path):
        try:
            return extract_coordinates_from_file(file_path)
        except Exception as e:
            return {'error': str(e), 'file': file_path}
    
    results = []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(extract_single_file, f) for f in file_list]
        
        for future in futures:
            result = future.result()
            if 'error' not in result:
                results.extend(result)
    
    return results
```

### Caching System
```python
import pickle
import hashlib

class ExtractionCache:
    def __init__(self, cache_dir='./cache'):
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)
    
    def get_cache_key(self, file_path):
        with open(file_path, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()
    
    def cached_extract(self, file_path, extraction_func):
        cache_key = self.get_cache_key(file_path)
        cache_file = f'{self.cache_dir}/{cache_key}.pkl'
        
        if os.path.exists(cache_file):
            with open(cache_file, 'rb') as f:
                return pickle.load(f)
        
        result = extraction_func(file_path)
        with open(cache_file, 'wb') as f:
            pickle.dump(result, f)
        
        return result
```

## Command-Line Extraction Examples

### Basic Extraction Commands
```bash
# Extract all map files
for file in map/*.msb.dcx; do
    WitchyBND.exe "$file" --location "extracted_maps/"
done

# Extract parameters
WitchyBND.exe regulation.bin --location "params/"

# Batch process with filtering
find . -name "*.msb.dcx" -exec WitchyBND.exe {} \;

# Extract specific POI types
python extract_poi.py --type churches --output churches.json
python extract_poi.py --type forts --output forts.json
python extract_poi.py --type ruins --output ruins.json
```

### Advanced Automation
```bash
# Complete extraction pipeline
#!/bin/bash
GAME_PATH="/path/to/ELDEN RING NIGHTREIGN/Game"
OUTPUT_DIR="/path/to/extraction_output"

# Create output directories
mkdir -p "$OUTPUT_DIR"/{maps,params,coordinates,patterns}

# Unpack game archives
UXM.exe --unpack "$GAME_PATH/eldenring.exe"

# Extract map files
find "$GAME_PATH/map" -name "*.msb.dcx" -exec WitchyBND.exe {} --location "$OUTPUT_DIR/maps/" \;

# Extract parameters
WitchyBND.exe "$GAME_PATH/regulation.bin" --location "$OUTPUT_DIR/params/"

# Parse coordinates
python parse_coordinates.py --input "$OUTPUT_DIR/maps/" --output "$OUTPUT_DIR/coordinates/all_coordinates.json"

# Generate pattern mapping
python generate_patterns.py --coordinates "$OUTPUT_DIR/coordinates/all_coordinates.json" --output "$OUTPUT_DIR/patterns/pattern_mapping.json"

# Export web-compatible formats
python export_formats.py --input "$OUTPUT_DIR/coordinates/all_coordinates.json" --output-dir "$OUTPUT_DIR/web_exports/"
```

## Troubleshooting Common Issues

### File Access Problems
```python
def diagnose_extraction_issues(file_path):
    issues = []
    
    # Check file existence
    if not os.path.exists(file_path):
        issues.append("File does not exist")
    
    # Check permissions
    if not os.access(file_path, os.R_OK):
        issues.append("Permission denied - run as administrator")
    
    # Check file size
    if os.path.getsize(file_path) == 0:
        issues.append("File is empty")
    
    # Check file format
    with open(file_path, 'rb') as f:
        header = f.read(4)
        if header not in [b'BND3', b'BND4', b'DCX\x00']:
            issues.append("Invalid file format")
    
    return issues
```

### Memory Management
```python
def memory_efficient_extraction(large_file_path):
    # Process in chunks to avoid memory issues
    chunk_size = 1024 * 1024  # 1MB chunks
    
    with open(large_file_path, 'rb') as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            
            # Process chunk
            process_data_chunk(chunk)
            
            # Clear memory
            del chunk
```

## Integration with External Tools

### Blender Import Script
```python
import bpy
import json

def import_nightreign_coordinates(json_file):
    with open(json_file, 'r') as f:
        data = json.load(f)
    
    # Clear existing objects
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    
    # Import coordinates as objects
    for entity in data['poi_categories']['churches']:
        # Create mesh
        mesh = bpy.data.meshes.new(entity['name'])
        obj = bpy.data.objects.new(entity['name'], mesh)
        
        # Set location (convert coordinates)
        obj.location = (
            entity['coordinates']['x'] * 100,  # Scale up
            entity['coordinates']['y'] * 100,
            entity['coordinates']['elevation']
        )
        
        # Link to scene
        bpy.context.collection.objects.link(obj)
```

### Web Application Integration
```javascript
// JavaScript for web mapping applications
class NightreignMapData {
    constructor(coordinateData) {
        this.data = coordinateData;
        this.patterns = this.data.seed_patterns;
        this.pois = this.data.poi_categories;
    }
    
    getPatternPOIs(patternId) {
        return this.patterns[patternId] || [];
    }
    
    getPOIsByType(type) {
        return this.pois[type] || [];
    }
    
    searchPOIs(query) {
        const results = [];
        for (const [type, pois] of Object.entries(this.pois)) {
            for (const poi of pois) {
                if (poi.name.toLowerCase().includes(query.toLowerCase())) {
                    results.push({...poi, type});
                }
            }
        }
        return results;
    }
}
```

## Final Recommendations

**Tool Selection:**
- **Primary**: WitchyBND + Smithbox for comprehensive extraction
- **Programming**: SoulsFormats library for custom scripts
- **Automation**: Community tools from thefifthmatt for Nightreign-specific features

**Workflow Priority:**
1. Use UXM to unpack initial archives
2. Extract MSB files with WitchyBND
3. Parse coordinates with SoulsFormats or custom scripts
4. Apply community tools for pattern recognition
5. Export to web-compatible formats

**Performance Considerations:**
- Implement caching for repeated extractions
- Use parallel processing for large datasets
- Process files in batches to manage memory
- Cache intermediate results to avoid re-processing

This comprehensive guide provides the technical foundation for extracting all coordinate data and procedural generation information from Elden Ring: Nightreign, with specific attention to the game's unique 320-pattern system and community-developed tools.