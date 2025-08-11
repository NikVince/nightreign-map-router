# Development Guidelines

> **Note:** All persistent data and metadata should be managed via Supabase (PostgreSQL). Database schema, migrations, and data access should target Supabase.

## Core Philosophy

### Asset-First Approach
- Always prioritize using official game assets over placeholders
- Extract assets in small batches to validate pipeline early
- Maintain 1:1 accuracy with game asset positioning and scaling
- Plan asset optimization for web delivery from the start

### Game Accuracy Priority
- All mechanics must reflect actual Nightreign behavior
- Timing calculations must match in-game measurements
- Coordinate systems must align with game world positioning
- Route suggestions must be validated against real gameplay

### Technical Precision
- Provide specific, actionable code examples
- Include exact file paths and tool parameters
- Document conversion steps for asset processing
- Maintain clear error handling and fallback strategies

### Incremental Development
- Break complex features into testable components
- Validate each step before proceeding to next
- Maintain working state at end of each development session
- Document decisions and trade-offs for future reference

## Code Standards
- TypeScript strict mode enabled
- ESLint and Prettier configuration enforced
- Meaningful variable and function names
- Comprehensive error handling
- Performance considerations for mobile devices

## Asset Management
- Organized directory structure for extracted assets
- Web-optimized formats (WebP with PNG fallbacks)
- Responsive image loading strategies
- Asset attribution documentation

## Testing Strategy
- Unit tests for game logic calculations
- Integration tests for asset loading
- Performance regression testing
- Manual validation against actual gameplay

## Documentation Requirements
- Inline code comments for complex logic
- README updates for new features
- Asset extraction procedure documentation
- Decision rationale for major architectural choices

## Mobile-First & Responsive Design

- All UI components must be designed mobile-first, ensuring full functionality and usability on small screens before scaling up to desktop.
- Sidebar/objectives checklist should be accessible via a header button on mobile, overlaying the map when open and hidden otherwise.
- Layouts should use responsive CSS (Tailwind, Flexbox, Grid) and avoid fixed pixel values where possible.
- Test all features on both mobile and desktop resolutions before merging.