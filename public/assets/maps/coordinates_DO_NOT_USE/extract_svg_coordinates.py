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
    poi_type = os.path.splitext(filename)[0]
    svg_path = os.path.join(SVG_DIR, filename)
    try:
        tree = ET.parse(svg_path)
        root = tree.getroot()
        # Find the first <path> element
        path_elem = root.find('.//{http://www.w3.org/2000/svg}path')
        if path_elem is None:
            continue
        d_attr = path_elem.attrib.get('d', '')
        # Extract all numbers from the path data
        numbers = [float(n) for n in NUMBER_RE.findall(d_attr)]
        # Group into (x, y) pairs
        coords = [numbers[i:i+2] for i in range(0, len(numbers), 2) if i+1 < len(numbers)]
        if coords:
            result[poi_type] = coords
    except Exception as e:
        print(f"Error processing {filename}: {e}")

# Write to JSON
with open(OUTPUT_JSON, 'w') as f:
    json.dump(result, f, indent=2)

print(f"Extracted coordinates for {len(result)} POI types to {OUTPUT_JSON}")

# This script is robust to SVG path commands and will extract all (x, y) pairs from the path 'd' attribute.
# If a POI type has no coordinates, it will be skipped in the output. This is expected for layouts missing certain POIs. 