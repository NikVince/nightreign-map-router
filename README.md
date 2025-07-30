# Nightreign Router

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![T3 Stack](https://img.shields.io/badge/T3%20Stack-Next.js%20%7C%20TypeScript%20%7C%20Prisma%20%7C%20tRPC%20%7C%20Tailwind-informational)](https://create.t3.gg/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15+-black?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4+-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://prisma.io/)
[![tRPC](https://img.shields.io/badge/tRPC-Type%20Safe%20API-2596be?logo=trpc)](https://trpc.io/)
[![Deploy on Vercel](https://img.shields.io/badge/deploy-Vercel-black?logo=vercel)](https://vercel.com/)

---

## Project Status: Active Development 🚧

> **This project is in active development and is being made public to showcase the development process, receive feedback, and invite collaboration.**
>
> The web interface and features are under active construction. Expect frequent changes, incomplete features, and evolving documentation. If you are interested in the project, feel free to watch, star, or contribute!

---

## Overview

**Nightreign Router** is an interactive map and route planning tool for Elden Ring: Nightreign, designed to help players optimize their strategies across all 320 unique map patterns. This project is a fan-made, educational initiative and is **not affiliated with, endorsed by, or sponsored by FromSoftware or Bandai Namco**. All game content and assets are © FromSoftware and Bandai Namco. This project is and will always remain non-commercial.

## Current Implementation Status

### ✅ Completed Features

#### Core Architecture
- **T3 Stack Setup**: Next.js 15, TypeScript, Prisma, tRPC, Tailwind CSS
- **Database Integration**: Supabase (PostgreSQL) with Prisma ORM
- **Type Safety**: Comprehensive TypeScript interfaces for game mechanics
- **Responsive Design**: Mobile-first layout with desktop/mobile responsive behavior

#### Map Rendering Engine
- **Interactive Canvas**: React-Konva implementation with zoom/pan controls
- **Dynamic POI System**: Real-time POI rendering based on layout data
- **Pattern Data Integration**: All 320 map patterns loaded from JSON files
- **Coordinate System**: Master POI coordinate mapping with layout-specific overlays
- **Asset Pipeline**: Extracted game assets (map tiles, POI icons) with WebP optimization

#### Data Management
- **tRPC API**: Type-safe API endpoints for pattern and POI data
- **Dynamic POI Loading**: Real-time POI generation based on layout specifications
- **Layout System**: Support for different map layouts (Default, Mountaintop, Crater, Rotted Woods, Noklateo)
- **Boss Integration**: Comprehensive boss data with categories and mechanics

#### User Interface
- **Responsive Layout**: Desktop (25/75 split) and mobile (overlay) layouts
- **Dark Theme**: Elden Ring-inspired dark theme with custom CSS variables
- **Icon Toggles**: Category-based POI visibility controls
- **Layout Selector**: Pattern switching with layout information display

### 📋 Planned Features

#### Map Interaction
- **POI Selection**: Click/tap handlers for landmark interaction
- **Tooltips/Popovers**: Hover information for POI details
- **Landmark Details**: Sidebar integration for selected POI information

#### Game Mechanics
- **Timer System**: 14-minute day cycle implementation
- **Circle Phase Tracking**: Visual representation of shrinking circles
- **Route Planning**: Pathfinding algorithm development
- **Route Optimization**: Algorithm for optimal path calculation
- **Nightlord-Specific Logic**: Unique mechanics for each Nightlord

#### Performance & Polish
- **Loading States**: Comprehensive loading and error boundaries
- **Performance Optimization**: Code splitting and asset optimization
- **Accessibility**: ARIA labels and keyboard navigation
- **SEO**: Metadata and structured data implementation

## Technical Architecture

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19 with TypeScript
- **Canvas Rendering**: React-Konva for interactive map display
- **Styling**: Tailwind CSS 4 with custom Elden Ring theme
- **State Management**: React Query with tRPC for server state

### Backend
- **API**: tRPC with type-safe procedures
- **Database**: Supabase (PostgreSQL) with Prisma ORM
- **Data Processing**: Dynamic POI generation from layout specifications
- **File System**: JSON-based pattern data with coordinate mapping

### Data Structure
- **320 Map Patterns**: Complete pattern data with boss information
- **POI System**: 200+ Points of Interest with coordinate mapping
- **Boss Categories**: Nightlords, Evergaols, Field Bosses, Night Bosses, Arena Bosses
- **Layout Variants**: 5 different map layouts with shifting earth events

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NikVince/nightreign-map-router.git
   cd nightreign-map-router
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Add your Supabase database URL to `.env.local`

4. **Set up the database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

### Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks
- `npm run db:studio` - Open Prisma Studio
- `npm run generate:poi-ids` - Generate POI ID mappings

## Project Structure

```
nightreign-map-router/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── _components/        # React components
│   │   │   ├── MapCanvas.tsx   # Interactive map rendering
│   │   │   ├── Sidebar.tsx     # Objectives and controls
│   │   │   └── MainPanel.tsx   # Main layout component
│   │   └── api/                # API routes
│   ├── server/                 # Backend logic
│   │   └── api/routers/        # tRPC routers
│   ├── types/                  # TypeScript definitions
│   ├── utils/                  # Utility functions
│   └── trpc/                   # tRPC configuration
├── reference_material/          # Game data and assets
│   ├── pattern_layouts/        # 320 JSON pattern files
│   └── *.md                    # Game mechanics documentation
├── docs/                       # Project documentation
├── prisma/                     # Database schema and migrations
└── public/assets/              # Static assets and map tiles
```

## Database

This project uses **Supabase** as the managed PostgreSQL database solution. All backend data is stored and accessed via Supabase, which provides a scalable and developer-friendly Postgres environment. You can use the [Supabase dashboard](https://app.supabase.com/) to manage your database, authentication, and storage.

If you are migrating from another database (e.g., Planetscale, MySQL), please update your `.env` file with the Supabase PostgreSQL connection string. See the [Supabase docs](https://supabase.com/docs/guides/database) for more details.

## Documentation

Comprehensive documentation is available in the [`/docs`](./docs) directory:

- **[PROJECT_OVERVIEW.md](./docs/PROJECT_OVERVIEW.md)**: Project vision and goals
- **[GAME_MECHANICS.md](./docs/GAME_MECHANICS.md)**: Nightreign mechanics and timing
- **[DEVELOPMENT_GUIDELINES.md](./docs/DEVELOPMENT_GUIDELINES.md)**: Core development philosophy
- **[IMPLEMENTATION_PHASES.md](./docs/IMPLEMENTATION_PHASES.md)**: Development roadmap
- **[DEVELOPMENT_CHECKLIST.md](./docs/DEVELOPMENT_CHECKLIST.md)**: Progress tracking
- **[TECH_STACK.md](./docs/TECH_STACK.md)**: Technology stack details
- **[POI_COORDINATE_ASSIGNMENT.md](./docs/POI_COORDINATE_ASSIGNMENT.md)**: POI coordinate system
- **[DYNAMIC_POI_LOADING_IMPLEMENTATION.md](./docs/DYNAMIC_POI_LOADING_IMPLEMENTATION.md)**: Dynamic POI system

## Contributing

Contributions, feedback, and suggestions are welcome! If you notice issues, have ideas, or want to help, please open an issue or pull request. See [`/docs/DEVELOPMENT_GUIDELINES.md`](./docs/DEVELOPMENT_GUIDELINES.md) for more information on contributing.

### Development Guidelines

- **TypeScript Strict**: All code must pass strict type checking
- **Asset-First Approach**: Prioritize official game assets over placeholders
- **Game Accuracy**: All mechanics must reflect actual Nightreign behavior
- **Incremental Development**: Break complex features into testable components
- **Performance Focus**: Optimize for mobile devices and sub-3s load times

## Legal Disclaimer

This is a **fan project** created for educational and non-commercial purposes only. Nightreign Router is **not affiliated with, endorsed by, or sponsored by FromSoftware or Bandai Namco**. All referenced game content, names, and assets are © FromSoftware and Bandai Namco. No assets or code from this project may be used for commercial purposes.

## Credits

Special thanks to **thefifthmatt** for his excellent CSV file compiling all the data related to map patterns. This resource was integral to the development of this project. You can find his work and more at: https://thefifthmatt.github.io/nightreign/

## License

This project is licensed under the [MIT License](./LICENSE).
