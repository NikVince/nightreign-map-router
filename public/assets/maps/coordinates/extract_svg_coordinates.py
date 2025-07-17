import os
import re
import json
from xml.etree import ElementTree as ET

# Directory containing SVGs
SVG_DIR = os.path.join(os.path.dirname(__file__), 'default_map_layout_svgs')
OUTPUT_JSON = os.path.join(os.path.dirname(__file__), 'default_map_layout.json')

# Regex to match coordinate pairs (e.g., 123.45,678.90)
COORD_PAIR_RE = re.compile(r'([0-9]+\.?[0-9]*),([0-9]+\.?[0-9]*)')

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
        # Find all coordinate pairs
        coords = [
            [float(x), float(y)]
            for x, y in COORD_PAIR_RE.findall(d_attr)
        ]
        result[poi_type] = coords
    except Exception as e:
        print(f"Error processing {filename}: {e}")

# Write to JSON
with open(OUTPUT_JSON, 'w') as f:
    json.dump(result, f, indent=2)

print(f"Extracted coordinates for {len(result)} POI types to {OUTPUT_JSON}") 