# CLAUDE.md — MyGuitars

## Project Overview

MyGuitars is a guitar collection tracker built with **Next.js (App Router)**, **TypeScript**, **TypeORM**, and **MariaDB**. Users can register, log in, manage their guitar collection with detailed specs, and browse other collectors.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Database | MariaDB via `mysql2` driver |
| ORM | TypeORM 0.3 with decorators |
| Auth | NextAuth 4 (JWT, credentials provider) |
| Validation | Zod schemas + react-hook-form |
| Styling | CSS variables (dark/light theme via next-themes) |

## Commands

```bash
npm run dev      # Start dev server on http://localhost:3000
npm run build    # Production build
npm run start    # Run production server
```

No test suite exists yet.

## Environment Setup

Create `.env.local` with:

```
MARIADB_HOST=localhost
MARIADB_PORT=3306
MARIADB_USER=gtrsadmin
MARIADB_PASSWORD=<password>
MARIADB_DATABASE=myguitars
NEXTAUTH_SECRET=<random secret>
NEXTAUTH_URL=http://localhost:3000
```

Database schema: run `mariadb_schema.sql`, then any `mariadb_migration_*.sql` files in order.

## Architecture

### Server Actions vs API Routes

- **Server Actions** (`app/actions/guitars.ts`): used for all guitar CRUD — these run server-side and call TypeORM directly.
- **API Routes** (`app/api/`): used for image uploads/deletions (binary data) and NextAuth.

### Auth & Ownership

- NextAuth JWT sessions; `session.user.id` is the UUID from the `USERS` table.
- All guitar queries include a `userId` check — users can only see and modify their own guitars.

### Database Connection

- `lib/db.ts` exports a singleton `AppDataSource`. Call `initializeDataSource()` before any query; it no-ops if already connected.
- Connection pool is capped at 4 (optimized for low-resource environments).

### Image Storage

- Images are stored as base64-encoded `LONGTEXT` in the `GUITAR_IMAGES` table (not on disk).
- Max 10 MB per image; supported MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`.
- The legacy `image_data` column on `GUITARS` is superseded by the `GUITAR_IMAGES` table.

### Validation

- `lib/schemas.ts` holds Zod schemas. Server actions validate input with these schemas before writing to the DB.
- Client forms also use the same schemas via react-hook-form's `zodResolver`.

## Key Files

| File | Purpose |
|---|---|
| `app/actions/guitars.ts` | All guitar CRUD server actions |
| `entities/Guitar.ts` | TypeORM Guitar entity (25+ spec fields) |
| `entities/GuitarImage.ts` | Gallery images (one-to-many with Guitar) |
| `lib/auth.ts` | NextAuth config with credentials provider |
| `lib/db.ts` | TypeORM DataSource singleton |
| `lib/schemas.ts` | Zod validation schemas |
| `components/GuitarForm.tsx` | Create/edit guitar form (client component) |
| `components/ImageSlideshow.tsx` | Multi-image gallery viewer |
| `mariadb_schema.sql` | Canonical DB schema |

## Conventions

- **Path alias**: `@/` maps to the project root (e.g. `@/lib/db`).
- **Server components by default**: only add `"use client"` when React hooks or browser APIs are needed.
- **`revalidatePath()`** after every mutation in server actions to bust the Next.js cache.
- **TypeORM decorators** require `"experimentalDecorators": true` and `"emitDecoratorMetadata": true` (already set in `tsconfig.json`).
- Guitar `type` and `condition` fields use TypeScript string literal union types — keep Zod enum and TypeORM column `enum` in sync.

## deploying
after each change made ask if you should deploy 
use the ssh-deploy script. you can edit the script if needed.