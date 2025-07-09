# Asset Extraction Procedures

## Required Tools
- **UXM Selective Unpacker**: Primary tool for Nightreign file extraction
- **WitchyBND/Yabber**: TPF archive unpacking
- **Image Converter**: DDS to PNG conversion utility
- **Sharp/ImageMagick**: Web optimization pipeline

## Extraction Workflow

### Step 1: Game File Location
- Locate Nightreign installation directory
- Identify relevant archive files containing map assets
- Back up original files before extraction

### Step 2: UXM Selective Unpacker Usage
- Configure unpacker for Nightreign file structure
- Select specific asset categories to avoid unnecessary files
- Extract to organized directory structure

### Step 3: TPF Archive Processing
- Use WitchyBND/Yabber for TPF file extraction
- Maintain original directory structure for reference
- Document file naming conventions discovered

### Step 4: Asset Conversion
- Convert DDS textures to PNG format
- Apply web optimization (compression, resizing)
- Generate WebP versions with PNG fallbacks
- Create responsive image variants

## Priority Asset List
1. **Base Map Textures**: Essential for map background rendering
2. **Landmark Icons**: Visual markers for interactive elements
3. **Nightlord Portraits**: Character identification assets
4. **UI Elements**: Buttons, borders, tooltips for interface
5. **Circle Overlays**: Visual representation of shrinking areas

## File Organization

> **Note:** All asset metadata and references are stored in Supabase (PostgreSQL) for consistency and easy access by the application backend.
