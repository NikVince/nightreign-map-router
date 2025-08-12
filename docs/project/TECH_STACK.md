# Technology Stack

## Core Framework: Create T3 App
**Command**: `npx create-t3-app@latest nightreign-map --typescript --tailwind --nextjs --prisma --trpc`

### Components
- **Next.js 15+**: App router, SSR for SEO, performance optimization
- **TypeScript**: Type safety for complex game data structures
- **Tailwind CSS**: Rapid responsive UI development
- **Prisma**: Database ORM for pattern/landmark data, connected to Supabase (PostgreSQL)
- **Supabase**: Managed PostgreSQL database platform
- **tRPC**: Type-safe API layer for seed-to-pattern lookups
- **NextAuth.js**: Optional user authentication for saved routes

## Additional Dependencies
```bash
npm install konva react-konva
npm install -D @types/konva sharp
```