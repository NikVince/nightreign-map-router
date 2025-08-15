# Nightreign Map Router - Documentation

This folder contains comprehensive documentation for the Nightreign Map Router project, organized into logical categories for easier navigation and reference.

## 📁 Folder Organization

### 🏗️ **project/** - Project Overview & High-Level Documentation
- **PROJECT_OVERVIEW.md** - Project vision, functionality, and success metrics
- **TECH_STACK.md** - Technology stack and dependencies
- **docs_structure.md** - Documentation structure overview

### ⚙️ **technical/** - Technical Implementation & Algorithms
- **ROUTE_ALGORITHM_IMPLEMENTATION.md** - Core routing algorithm implementation
- **POI_COORDINATE_SETUP.md** - POI coordinate system setup and assignment
- **POI_COORDINATE_MAPPING.md** - Coordinate scaling and transformation for map rendering
- **DATA_PIPELINE_OVERVIEW.md** - Data processing pipeline for map patterns
- **ASSET_EXTRACTION.md** - Game asset extraction and processing

### 🛠️ **development/** - Development Guidelines & Workflows
- **DEVELOPMENT_GUIDELINES.md** - Coding standards and best practices
- **DEVELOPMENT_CHECKLIST.md** - Development tasks and milestones
- **AI_TODO_AND_REVERT_LOG.md** - AI-assisted development log

### 🎮 **game-mechanics/** - Game-Specific Mechanics & POI Information
- **POI_PRIORITY_SCORES.md** - Complete POI reference with priority scores (0-100)
- **GAME_MECHANICS.md** - Core game mechanics and systems
- **PATTERN_LAYOUTS_OVERVIEW.md** - Map pattern layouts and variations

### 📋 **implementation/** - Implementation Phases & Workflows
- **IMPLEMENTATION_PHASES.md** - Project implementation phases
- **POI_IMPLEMENTATION_CHECKLIST.md** - POI implementation tasks
- **POI_MANAGEMENT_WORKFLOW.md** - POI modification and management workflow
- **POI_NAMING_RESOLUTION.md** - POI naming conflict resolution
- **POI_LOADING_SYSTEM.md** - Dynamic POI loading system
- **POI_NUMBERING_SYSTEM.md** - Global POI numbering system
- **POI_NUMBERING_RULES.md** - POI numbering strategy and rules
- **POI_DATA_LINKING.md** - Data linking and relationship workflows

### 📦 **backup/** - Backup Documentation
- Contains backup versions of important documents

## 🔍 Quick Reference

- **Getting Started**: Start with `project/PROJECT_OVERVIEW.md`
- **Technical Details**: See `technical/` folder for implementation specifics
- **Development**: Check `development/` for guidelines and checklists
- **Game Logic**: Review `game-mechanics/` for game-specific information
- **Implementation**: Use `implementation/` for detailed workflows and phases

## ⚠️ Route Suggestion Feature - Development Halted

**Status**: Development temporarily halted

The route suggestion feature has been paused in development due to project scope considerations. While this feature was initially planned to provide automated routing between POIs, the current focus has shifted to optimizing the core map display functionality.

**Current Priority**: Improving the map layout search and display experience
- **Problem**: Users must manually search through 320 available layouts, which is time-consuming
- **Goal**: Create an intuitive interface for players to quickly find and view relevant map layouts
- **Focus**: Streamlining the map discovery process rather than automated routing

**Future**: Route suggestion may be revisited once the core map display functionality is optimized and user experience is improved.

## 🔧 Temporarily Commented-Out Features

**Status**: Features temporarily disabled but logic preserved

The following features have been temporarily commented out to focus development efforts on core map display functionality. All logic and functionality remains intact and can be easily restored when needed.

### **Team Composition Panel** (Left Sidebar)
- **Location**: `src/app/_components/Sidebar.tsx` (lines ~164-259)
- **Purpose**: Team member management and route calculation trigger
- **Features**: 
  - Add/remove team members (1-3 players)
  - Nightfarer class selection for each player
  - Stonesword Key starting item toggle
  - Route calculation button with full algorithm integration
- **Status**: Commented out with `{/* Team Composition - TEMPORARILY COMMENTED OUT */}`

### **Route Debug Menu** (Canvas Overlay)
- **Location**: `src/app/_components/MainPanel.tsx` (lines ~82-118)
- **Purpose**: Debug information display and route testing
- **Features**:
  - Route debug panel toggle button
  - Priority calculations display
  - Route state monitoring
  - Debug route manipulation tools
- **Status**: Commented out with `{/* Route Debug Dropdown - TEMPORARILY COMMENTED OUT */}`

### **Restoration Instructions**
To restore these features:
1. Remove the comment blocks from the respective files
2. Ensure all required props and state variables are properly passed
3. Verify that the `TeamComposition` and `RouteDebugPanel` components are imported
4. Test functionality to ensure no breaking changes occurred during development

**Note**: These features contain significant routing algorithm logic and should be preserved for future route suggestion implementation.

## 📝 Document Maintenance

Documents are organized by content type and purpose. When adding new documentation:
1. Choose the appropriate category folder
2. Follow the existing naming convention (UPPERCASE_WITH_UNDERSCORES.md)
3. Update this README if adding new categories

---

*Last updated: August 13, 2024*
