# Development Checklist

> **Note:** This project uses Supabase (managed PostgreSQL) for all persistent data. All database schema design, migrations, and seed data should be targeted for PostgreSQL via Supabase.

## Phase 1: Foundation & Architecture
### Project Setup
- [x] Initialize T3 app with all components
- [x] Configure ESLint, Prettier, TypeScript strict mode
- [x] Set up Vercel project and environment variables
- [x] Create project structure with asset directories

### Core Type Definitions
- [x] Define MapPattern interface
- [x] Define Landmark interface
- [x] Define Nightlord enum/type
- [x] Define RouteCalculation interface
- [x] Implement comprehensive, categorized boss lists and types (Nightlords, Night Bosses, Field Bosses, Evergaol Bosses, Event/Special Bosses, Remembrance Bosses)

### Database Schema Design (Supabase/PostgreSQL)
- [x] Design Prisma schema for patterns *(boilerplate only)*
- [x] Design Prisma schema for landmarks
- [x] Design Prisma schema for routes
- [x] Set up database migrations (target: Supabase/PostgreSQL) *(boilerplate only)*
- [x] Create seed data structure *(lightweight seeding implemented)*

### Basic UI Framework
- [x] Create layout components (Header, Sidebar, Main) *(rudimentary UI with header, objectives area, and map canvas placeholder implemented)*
- [ ] Implement responsive grid system
- [ ] Add dark/light theme support
- [ ] Set up loading states and error boundaries

## Phase 2: Map Rendering Engine
### Canvas Implementation
- [x] Set up react-konva for rendering
  - [x] Create map canvas component using Stage and Layer
  - [x] Responsive layout: objectives pane overlays on mobile, 25/75 split on desktop, map canvas 100% width on mobile
  - [x] Make the Konva canvas dynamically resize to fill the orange border exactly, with no padding or gaps
  - [x] Remove the white border from the canvas so only the orange border is visible
- [x] Implement zoom controls (mouse wheel)
- [x] Implement pan controls (drag to move map)
- [ ] Maintain state for scale and position
- [ ] Create coordinate system mapping (game → screen)
- [ ] Ensure accurate placement of landmarks and circles
- [x] Add mouse/touch interaction handling
  - [ ] Implement click/tap handlers for selecting landmarks
  - [ ] Add hover/cursor feedback for interactive elements

### Mock Data Integration
- [x] Create sample pattern data (5-10 patterns)
- [x] Integrate mock MapPattern and Landmark data
- [x] Render landmarks as icons on the map using mock data
- [x] Pattern data import pipeline (CSV-to-JSON, validation, DB import/seed) — see PATTERN_DATA_PIPELINE.md

### Landmark Rendering & Interaction
- [x] Implement landmark rendering with placeholder icons
- [ ] Add tooltips or popovers on hover/click with landmark info
- [ ] Add landmark selection functionality (highlight, show details)
- [ ] Show selected landmark details in sidebar or modal
- [ ] Test performance with multiple landmarks (populate map with more mock data)
- [ ] Check for smooth interaction and rendering

### Pattern Display Logic
- [ ] Build seed-to-pattern conversion algorithm (optional/advanced)
- [ ] Create pattern selection UI
- [ ] Implement pattern switching with transitions
- [ ] Add pattern comparison view

## Phase 3: Asset Pipeline & Integration
### Asset Extraction Setup
- [ ] Document UXM Selective Unpacker workflow
- [ ] Set up WitchyBND/Yabber for TPF extraction
- [ ] Create DDS to PNG conversion scripts
- [ ] Establish asset naming conventions

### Critical Asset Extraction
- [x] Extract base map textures
- [x] Extract landmark icons
- [ ] Extract Nightlord portraits
- [ ] Extract UI elements
- [ ] Extract circle overlay textures

### Web Optimization Pipeline
- [ ] Implement Sharp for image optimization
- [ ] Set up WebP conversion with fallbacks
- [ ] Create responsive image loading
- [ ] Add asset preloading for critical resources

## Phase 4: Game Mechanics Implementation
### Timer System
- [ ] Implement 14-minute day cycle counter
- [ ] Add circle phase tracking
- [ ] Create visual countdown timers
- [ ] Add warnings for phase transitions

### Route Planning Algorithm ✅ COMPLETED
- [x] Implement pathfinding algorithm
- [x] Add landmark priority weighting
- [x] Calculate travel times between landmarks
- [x] Generate alternative route suggestions
- [x] Implement day 1 and day 2 route logic
- [x] Add visual route display (red line for day 1, bright blue line for day 2)
- [x] Create route debug panel with improved readability

### Nightlord-Specific Logic
- [ ] Implement unique mechanics for each Nightlord
- [ ] Add weakness/resistance calculations
- [ ] Create Nightlord-specific route recommendations
- [ ] Add special event handling

## Phase 5: Advanced Features
### Data Management
- [ ] Implement tRPC endpoints for pattern queries
- [ ] Add pattern data caching with React Query
- [ ] Create offline support with service workers
- [ ] Add data export/import functionality

### User Experience Enhancements
- [ ] Add route bookmarking system
- [ ] Implement search and filtering
- [ ] Create tutorial/onboarding flow
- [ ] Add accessibility features

### Community Features
- [ ] Route sharing functionality
- [ ] Community-submitted pattern corrections
- [ ] Performance statistics tracking
- [ ] Integration with community platforms

## Phase 6: Optimization & Launch
### Performance Optimization
- [ ] Implement code splitting and lazy loading
- [ ] Optimize asset loading strategies
- [ ] Add performance monitoring
- [ ] Mobile performance testing and optimization

### SEO & Discoverability
- [ ] Add metadata and OpenGraph tags
- [ ] Implement structured data
- [ ] Create sitemap and robots.txt
- [ ] Add analytics tracking

### Legal & Documentation
- [ ] Add proper asset attribution
- [ ] Create fan project disclaimer
- [ ] Write comprehensive README
- [ ] Document API endpoints and data structures

## Current Status
**Active Phase**: Phase 4 - Game Mechanics Implementation  
**Last Updated**: 2024-12-19  
**Next Milestone**: Implement advanced route features and team composition integration  
**Blockers**: None