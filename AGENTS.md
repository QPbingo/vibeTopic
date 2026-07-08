# Repository Guidelines

## Project Structure & Module Organization

This is a pnpm monorepo for **bingbingbingo**, a Next.js + API + SSE community app.

- `apps/web/`: Next.js 15 frontend. App routes live in `src/app`, shared UI in `src/components`, hooks in `src/hooks`, and client helpers in `src/lib`.
- `apps/api/`: TypeScript API service. Routes are in `src/routes`, business logic in `src/services`, middleware in `src/middleware`, and response/util helpers in `src/lib`.
- `apps/sse/`: Standalone SSE notification service.
- `packages/shared/`: Shared config, error codes, and types.
- `prisma/`: Prisma schema and seed data.
- `docs/`: PRD, UI spec, database, config, and error-code documentation.

Tests sit beside source files as `*.test.ts` or `*.test.tsx`.

## Build, Test, and Development Commands

- `pnpm dev`: builds shared package, then starts all app dev servers.
- `pnpm dev:web`, `pnpm dev:api`, `pnpm dev:sse`: run one service locally.
- `pnpm build`: builds every workspace package.
- `pnpm lint`: runs ESLint across workspaces.
- `pnpm typecheck`: runs TypeScript checks across workspaces.
- `pnpm test`: runs Vitest tests.
- `pnpm db:generate`: generates Prisma client.
- `pnpm db:setup`: pushes schema, loads setup SQL, and seeds data.

Use Node `>=22` and pnpm `>=9`.

## Coding Style & Naming Conventions

Use TypeScript throughout. Follow existing React Server/Client Component boundaries and add `'use client'` only when hooks, browser APIs, or client state are required. Components use `PascalCase`, hooks use `useCamelCase`, utilities use `camelCase`, and route folders follow Next.js conventions such as `posts/[slug]`.

The frontend uses Tailwind CSS 4 plus project CSS tokens in `apps/web/src/app/globals.css`. Preserve the pixel-arcade style: square corners, Zpix for UI chrome, Inter for content, and explicit dark/light theme support.

## Testing Guidelines

Vitest is the test runner. Add focused tests next to changed logic using `*.test.ts` or `*.test.tsx`. Prefer small behavioral tests for services, route helpers, hooks, and form components. Run `pnpm test` before submitting, plus `pnpm typecheck` for TypeScript changes.

## Commit & Pull Request Guidelines

Recent history uses short Chinese summaries and occasional Conventional prefixes, for example `chore: update .gitignore`. Keep commits concise and action-oriented.

PRs should include a short description, linked issue when available, test results, and screenshots for UI changes. Call out database, environment, or API contract changes explicitly.

## Security & Configuration Tips

Do not commit secrets or local `.env` files. Keep required variables documented in `docs/config.md`. For schema changes, update `prisma/schema.prisma`, regenerate Prisma client, and note migration/setup steps in the PR.
