import os
import re
import json
import sys
from xml.etree import ElementTree as ET

# Usage: python extract_svg_coordinates.py <SVG_DIR> <OUTPUT_JSON>
if len(sys.argv) != 3:
    print("Usage: python extract_svg_coordinates.py <SVG_DIR> <OUTPUT_JSON>")
    sys.exit(1)

SVG_DIR = sys.argv[1]
OUTPUT_JSON = sys.argv[2]

# Regex to match all numbers (including decimals and negatives)
NUMBER_RE = re.compile(r'-?\d+\.?\d*')

result = {}

for filename in os.listdir(SVG_DIR):
    if not filename.lower().endswith('.svg'):
        continue
    svg_path = os.path.join(SVG_DIR, filename)
    try:
        tree = ET.parse(svg_path)
        root = tree.getroot()
        # Find all <path> elements
        for path_elem in root.findall('.//{http://www.w3.org/2000/svg}path'):
            poi_type = path_elem.attrib.get('id')
            if not poi_type:
                # Fallback to filename if no id is present
                poi_type = os.path.splitext(filename)[0]
        d_attr = path_elem.attrib.get('d', '')
        # Extract all numbers from the path data
        numbers = [float(n) for n in NUMBER_RE.findall(d_attr)]
        # Group into (x, y) pairs
        coords = [numbers[i:i+2] for i in range(0, len(numbers), 2) if i+1 < len(numbers)]
        if coords:
                if poi_type not in result:
                    result[poi_type] = []
                result[poi_type].extend(coords)
    except Exception as e:
        print(f"Error processing {filename}: {e}")

# Write to JSON
with open(OUTPUT_JSON, 'w') as f:
    json.dump(result, f, indent=2)

print(f"Extracted coordinates for {len(result)} POI types to {OUTPUT_JSON}")

# This script now extracts all <path> elements and groups by path id, allowing multiple POIs per SVG.
# Numbering is still handled by the generate_poi_ids.cjs script, which will not override existing numbers. 