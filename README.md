# Nightreign Router

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![T3 Stack](https://img.shields.io/badge/T3%20Stack-Next.js%20%7C%20TypeScript%20%7C%20Prisma%20%7C%20tRPC%20%7C%20Tailwind-informational)](https://create.t3.gg/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3+-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://prisma.io/)
[![tRPC](https://img.shields.io/badge/tRPC-Type%20Safe%20API-2596be?logo=trpc)](https://trpc.io/)
[![Deploy on Vercel](https://img.shields.io/badge/deploy-Vercel-black?logo=vercel)](https://vercel.com/)

---

## Project Status: Work in Progress 🚧

> **This project is in early development and is being made public to showcase the development process, receive feedback, and invite collaboration.**
>
> The web interface and features are under active construction. Expect frequent changes, incomplete features, and evolving documentation. If you are interested in the project, feel free to watch, star, or contribute!

---

> **Nightreign Router** is an interactive map and route planning tool for Elden Ring: Nightreign, designed to help players optimize their strategies across all 320 unique map patterns. This project is a fan-made, educational initiative and is **not affiliated with, endorsed by, or sponsored by FromSoftware or Bandai Namco**. All game content and assets are © FromSoftware and Bandai Namco. This project is and will always remain non-commercial.

## Features
- **Interactive Map Display**: Explore and interact with Nightreign's map patterns
- **Pattern Selection**: Choose from 320 combinations (8 Nightlords × 40 patterns)
- **Route Optimization**: Plan optimal paths considering time constraints
- **Timer Integration**: Track 14-minute day cycles and circle phases
- **Landmark Information**: View priorities, resources, and strategic value

## Database
This project uses **Supabase** as the managed PostgreSQL database solution. All backend data is stored and accessed via Supabase, which provides a scalable and developer-friendly Postgres environment. You can use the [Supabase dashboard](https://app.supabase.com/) to manage your database, authentication, and storage.

If you are migrating from another database (e.g., Planetscale, MySQL), please update your `.env` file with the Supabase PostgreSQL connection string. See the [Supabase docs](https://supabase.com/docs/guides/database) for more details.

> **Note:** A `.env.example` file will be added soon to help contributors set up their environment. Please do not commit real secrets or credentials.

## Documentation
Comprehensive documentation is available in the [`/docs`](./docs) directory:
- **[PROJECT_OVERVIEW.md](./docs/PROJECT_OVERVIEW.md)**: Project vision and goals
- **[GAME_MECHANICS.md](./docs/GAME_MECHANICS.md)**: Nightreign mechanics and timing
- **[DEVELOPMENT_GUIDELINES.md](./docs/DEVELOPMENT_GUIDELINES.md)**: Core development philosophy
- **[ASSET_EXTRACTION.md](./docs/ASSET_EXTRACTION.md)**: Game asset extraction procedures
- **[IMPLEMENTATION_PHASES.md](./docs/IMPLEMENTATION_PHASES.md)**: Development roadmap
- **[DEVELOPMENT_CHECKLIST.md](./docs/DEVELOPMENT_CHECKLIST.md)**: Progress tracking
- **[TECH_STACK.md](./docs/TECH_STACK.md)**: Technology stack details
- **[docs_structure.md](./docs/docs_structure.md)**: Documentation hub

## Contributing

Contributions, feedback, and suggestions are welcome! If you notice issues, have ideas, or want to help, please open an issue or pull request. See [`/docs/DEVELOPMENT_GUIDELINES.md`](./docs/DEVELOPMENT_GUIDELINES.md) for more information on contributing.

## Legal Disclaimer
This is a **fan project** created for educational and non-commercial purposes only. Nightreign Router is **not affiliated with, endorsed by, or sponsored by FromSoftware or Bandai Namco**. All referenced game content, names, and assets are © FromSoftware and Bandai Namco. No assets or code from this project may be used for commercial purposes.

## License
This project is licensed under the [MIT License](./LICENSE).
