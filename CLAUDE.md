# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**bingbingbingo** — a vertical tech community for vibe coding / AI-assisted developers in China. Target domain: `https://bingbingbingo.cn`.

**Tech stack**: pnpm monorepo — Next.js 15 (App Router) + Express API + SSE push service + Prisma + PostgreSQL.

## Monorepo Structure

```
packages/shared/     — Shared types (Post, User, Comment), error codes, service config
apps/api/            — Express REST API (port 8080)
apps/sse/            — SSE push notification service (port 3001)
apps/web/            — Next.js 15 frontend (port 3000)
prisma/              — Schema + seed script
scripts/             — dev.sh (local dev manager), init-db.sql, setup-db.sql
docs/                — PRD, UI spec, database schema, config reference, error codes
```

## Essential Commands

```bash
# Setup
pnpm install                          # Install all dependencies
pnpm build:shared                     # Build shared package (needed before api/sse dev)
pnpm prisma generate                  # Generate Prisma client after schema changes

# Development
./scripts/dev.sh start                # Start all services (API + SSE + Web) in background
./scripts/dev.sh stop                 # Kill all running services
./scripts/dev.sh api                  # Start only API in foreground
./scripts/dev.sh web                  # Start only Web in foreground
./scripts/dev.sh status               # Check which ports are listening

# Database
pnpm db:push                          # Push Prisma schema to remote PG (no migrations)
pnpm db:seed                          # Seed test data (admin + demo users + sample posts)
./scripts/dev.sh db-reset             # Wipe and rebuild database
pnpm db:studio                        # Open Prisma Studio GUI on :5555

# Tests
pnpm test                             # Run all vitest tests

# Lint & Typecheck
pnpm lint                             # ESLint across workspace
pnpm typecheck                        # tsc --noEmit across workspace
```

## Infrastructure

PostgreSQL, Redis, and MinIO run on a test server at `47.93.232.84`. No local Docker needed.

| Service | Address | Auth |
|---------|---------|------|
| PostgreSQL 16 | `47.93.232.84:5432` | `bingbingbingo` / `bingo_test_pg_2024` |
| Redis 7 | `47.93.232.84:6379` | `bingo_test_redis_2024` |
| MinIO (S3) | `47.93.232.84:9000` | `bingo_admin` / `bingo_test_minio_2024` |

Server deployment: `docker compose -f docker-compose.infra.yml up -d`

### ENV Files

- `.env` (root) — `DATABASE_URL` only, for Prisma CLI
- `apps/api/.env` — Full backend config (DB, Redis, MinIO, JWT, SSE)
- `apps/sse/.env` — SSE service config (port, secrets)
- `apps/web/.env.local` — Public env vars (`NEXT_PUBLIC_*`)

All three `.env` files are pre-configured to point to the test server. The `.env.example` files serve as templates.

## Configuration System

All external service configs live in `packages/shared/src/services-config.ts`. Every service has an `enabled` boolean — when `false`, the app uses local fallbacks (e.g. in-memory rate limiting, skip email verification, direct publish without moderation).

**Config flow**: `.env` → `services-config.ts` → `apps/*/src/config.ts` (per-package consumers)

See `docs/config.md` for the complete reference.

## Architecture

### API (`apps/api`)
Express 4 with cookie-parser, cors, express-rate-limit. Middleware stack: `globalLimiter` → Zod validation → auth → route handler.

- `src/middleware/` — auth (JWT bearer + optional), admin guard, Zod validation, rate limiters
- `src/routes/` — auth, post, comment, user, follow, project, search, tag, upload, notification, SSE
- `src/services/` — Business logic layer, returns `ServiceResult<T>` (success/error discriminated union)
- `src/lib/` — Prisma client singleton, JWT sign/verify, markdown rendering (marked + sanitize-html), pagination helpers, response formatters (`success()`, `error()`, `paginated()`)

Error responses follow a unified format: `{ code: number, data: null, message: string }`. Error codes defined in `packages/shared/src/error-codes.ts`.

### SSE (`apps/sse`)
Standalone Express service. Clients connect via EventSource with a short-lived JWT ticket issued by the API (`POST /sse/token`). The API pushes notifications to SSE via an internal endpoint (`POST /internal/push`).

- `src/connections.ts` — `ConnectionPool` class: Map<userId, Set<Response>>, per-user and global limits
- `src/auth.ts` — Verify SSE tickets (JWT with one-time-use jti tracking)
- `src/heartbeat.ts` — Keep-alive pings every 30s

### Web (`apps/web`)
Next.js 15 App Router. Key pages: `/` (feed), `/login`, `/register`, `/posts/[slug]`, `/posts/new`, `/posts/[slug]/edit`, `/u/[username]`, `/tags/[slug]`, `/search`, `/notifications`, `/settings/profile`.

- `src/lib/api.ts` — Shared API client wrapping fetch with JWT token management
- `src/lib/auth.tsx` — AuthProvider context: user state, login/register/logout, token refresh on mount
- `src/lib/utils.ts` — Shared `getTimeAgo()` helper
- `src/hooks/useSSE.ts` — EventSource hook with generation-counter race-condition protection
- `src/hooks/useInfiniteScroll.ts` — IntersectionObserver-based cursor pagination

### Database (Prisma)
Single PostgreSQL database. Models: User, Post, Comment, Like, Bookmark, Tag, PostTag, UserFollow, UserToken, Project, Notification.

Key patterns:
- Soft delete via `status` field (active/deleted/banned/published/rejected)
- Denormalized counters (`likeCount`, `commentCount`, `bookmarkCount`) updated atomically via `$transaction`
- Cursor-based pagination using Prisma's `cursor: { id }, skip: 1` pattern

## Design Decisions (Visual)

### Laser Mosaic Arcade aesthetic
- **Dual font system**: UI chrome (nav, tabs, buttons, tags, stats) uses Zpix pixel font. Content (post titles, body, usernames) and sidebar use Inter.
- **Staircase box-shadows**: Multi-layer `box-shadow` offsets (4/8/12/16/20px) in cyan/pink/purple — no rounded corners, no smooth transitions.
- **CRT effects**: Full-page scanline overlay with `crtFlicker` animation, screen-edge vignette.
- **Floating particles**: Large pixel blocks drift upward — pure CSS, no JS.
- **Rainbow strip**: 8-color animated pixel bar between nav and content.
- **Animations use `steps()` only** — no easing curves. Sidebar and post content remain static.
- **Dark mode is default**. Toggle adds `.light` class to `<html>`. Every element needs both dark and light styles.

### Post media
- 1–3 images displayed simultaneously (not a carousel) with CSS grid
- Video: thumbnail with octagonal play button, clickable via Link to post detail
- Placeholder images: pure CSS gradients (`.media-ph-1` through `.media-ph-6`)

## Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema — all tables, relations, indexes |
| `packages/shared/src/services-config.ts` | All external service configs with `enabled` toggles |
| `packages/shared/src/types.ts` | Shared TypeScript types (Post, User, Comment, etc.) |
| `packages/shared/src/error-codes.ts` | Error code enum for API responses |
| `apps/api/src/index.ts` | API entry point — Express app, middleware, route registration |
| `apps/web/src/app/layout.tsx` | Root layout — PixelBackground, Navbar, RainbowStrip, Sidebar |
| `preview.html` | Original design prototype — self-contained homepage preview |
| `docker-compose.infra.yml` | Test server infrastructure (PG + Redis + MinIO) |
| `scripts/dev.sh` | Local dev lifecycle manager |
