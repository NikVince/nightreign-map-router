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
- [ ] Set up react-konva for rendering
  - [ ] Create map canvas component using Stage and Layer
- [ ] Implement zoom controls (mouse wheel)
- [ ] Implement pan controls (drag to move map)
- [ ] Maintain state for scale and position
- [ ] Create coordinate system mapping (game → screen)
- [ ] Ensure accurate placement of landmarks and circles
- [ ] Add mouse/touch interaction handling
  - [ ] Implement click/tap handlers for selecting landmarks
  - [ ] Add hover/cursor feedback for interactive elements

### Mock Data Integration
- [ ] Create sample pattern data (5-10 patterns)
- [ ] Integrate mock MapPattern and Landmark data
- [ ] Render landmarks as icons on the map using mock data

### Landmark Rendering & Interaction
- [ ] Implement landmark rendering with placeholder icons
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
- [ ] Extract base map textures
- [ ] Extract landmark icons
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

### Route Planning Algorithm
- [ ] Implement pathfinding algorithm
- [ ] Add landmark priority weighting
- [ ] Calculate travel times between landmarks
- [ ] Generate alternative route suggestions

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
**Active Phase**: Phase 2 - Map Rendering Engine  
**Last Updated**: 2024-06-09  
**Next Milestone**: Begin map rendering engine implementation (canvas, mock data, interaction)  
**Blockers**: None