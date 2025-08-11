# Implementation Phases

> **Note:** All persistent data is managed via Supabase (PostgreSQL). Database schema design and migrations should target Supabase/PostgreSQL.

## Phase 1: Foundation & Architecture (Week 1)
**Goal**: Establish development environment and core data structures

### Objectives
- Project setup with T3 app stack
- Core type definitions for game data
- Database schema design (Supabase/PostgreSQL)
- Basic UI framework implementation (mobile-first, responsive)
- Sidebar/objectives checklist toggleable via header button on mobile

### Deliverables
- Configured development environment
- TypeScript interfaces for game mechanics
- Prisma schema with initial migrations (Supabase/PostgreSQL)
- Responsive, mobile-first layout components (Header, Sidebar, Main)
- Sidebar/objectives checklist accessible via header button on mobile

## Phase 2: Map Rendering Engine (Week 2)
**Goal**: Interactive map display with coordinate system

### Objectives
- Canvas implementation with react-konva
- Coordinate system mapping (game → screen)
- Pattern display logic
- Basic interaction handling

### Deliverables
- Functional map viewport with zoom/pan
- Mock data integration
- Pattern switching capability
- Performance baseline established

## Phase 3: Asset Pipeline & Integration (Week 2-3)
**Goal**: Replace placeholders with extracted game assets

### Objectives
- Asset extraction workflow documentation
- Critical asset extraction and optimization
- Web delivery pipeline implementation
- Visual fidelity validation

### Deliverables
- Extracted and optimized game assets
- Asset loading and caching system
- Performance-optimized image delivery
- Visual accuracy verification

## Phase 4: Game Mechanics Implementation (Week 3-4) ✅ COMPLETED
**Goal**: Accurate timing and route calculations

### Objectives ✅
- Timer system for day cycles
- Route planning algorithm implementation ✅
- Nightlord-specific logic integration
- Special event handling

### Deliverables ✅
- Functional timer with circle tracking
- Basic route calculation system ✅
- Nightlord mechanics integration
- Route optimization algorithms ✅
- Day 1 and Day 2 route logic ✅
- Visual route display (red/blue lines) ✅
- Route debug panel with improved readability ✅

## Phase 5: Advanced Features (Week 4-5)
**Goal**: Polish and additional functionality

### Objectives
- Data management with tRPC endpoints
- User experience enhancements
- Community features implementation
- Performance optimization

### Deliverables
- Complete data API layer
- Route bookmarking and sharing
- Enhanced user interface
- Mobile optimization

## Phase 6: Optimization & Launch (Week 5-6)
**Goal**: Production-ready deployment

### Objectives
- Performance optimization and monitoring
- SEO and discoverability improvements
- Legal compliance and documentation
- Production deployment

### Deliverables
- Optimized production build
- Complete documentation
- Legal compliance verification
- Live deployment on Vercel