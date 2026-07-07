# MVP Stabilization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the monorepo build, validate, and behave consistently with the approved PRD and Laser Mosaic Arcade UI specification, prioritizing security and user-visible correctness.

**Architecture:** Keep the existing Next.js + Express + Prisma + SSE monorepo. Fix shared behavior at its source (request/render boundaries, cursor generation, auth session lifecycle, and reusable client hooks) and cover each regression with the smallest runnable test. External services remain behind their documented feature flags; disabled development fallbacks must be honest and runnable.

**Tech Stack:** Node.js 22+, pnpm workspace, TypeScript, Next.js 15, Express 4, Prisma 6, PostgreSQL 16, Vitest/Supertest, SSE.

---

### Task 1: Deterministic toolchain and startup configuration

**Files:**
- Modify: `apps/web/package.json`
- Create: `eslint.config.mjs`
- Create: `.env.example`
- Create: `apps/web/.env.example`
- Create: `apps/api/.env.example`
- Create: `apps/sse/.env.example`
- Modify: `docker-compose.yml`
- Modify: `apps/sse/Dockerfile`
- Modify: `.gitignore`

- [ ] Replace the interactive/deprecated `next lint` script with `eslint src --max-warnings=0` and add the minimal ESLint packages already expected by Next.js.
- [ ] Add checked-in environment templates matching `docs/config.md`, including a local `DATABASE_URL` so Prisma validation has a documented path.
- [ ] Change the SSE Docker build to use the workspace root as build context, build shared + SSE packages, and start `apps/sse/dist/index.js`.
- [ ] Run `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `DATABASE_URL=... pnpm exec prisma validate`; expect exit code 0 and no runtime exception during static generation.

### Task 2: Browser-only navigation and list reset regressions

**Files:**
- Modify: `apps/web/src/app/settings/profile/page.tsx`
- Modify: `apps/web/src/hooks/useInfiniteScroll.ts`
- Modify: `apps/web/src/app/page.tsx`
- Test: `apps/web/src/hooks/useInfiniteScroll.test.tsx`

- [ ] Write a failing hook test proving a changed fetch function clears old items and loads the new query once.
- [ ] Run the focused test and confirm it fails because old feed items remain.
- [ ] Reset feed state when the query identity changes and move profile redirects into an effect after auth initialization.
- [ ] Remove the unsupported `featured` request until the backend exposes a defined featured cursor contract.
- [ ] Re-run the test and production build; expect the hook test to pass and no `location is not defined` output.

### Task 3: Content trust boundary and session lifecycle

**Files:**
- Create: `apps/api/src/lib/content.ts`
- Modify: `apps/api/src/services/post.service.ts`
- Modify: `apps/api/src/services/comment.service.ts`
- Modify: `apps/api/src/services/auth.service.ts`
- Modify: `apps/api/src/routes/auth.routes.ts`
- Test: `apps/api/src/lib/content.test.ts`
- Test: `apps/api/src/services/auth.service.test.ts`

- [ ] Write a failing test showing `<script>`, inline event handlers, and `javascript:` URLs cannot survive stored post/comment rendering.
- [ ] Render server-owned HTML from Markdown input and sanitize it; ignore client-supplied HTML at the API trust boundary.
- [ ] Write a failing auth test proving logout revokes the stored refresh token and banned/deleted users cannot refresh.
- [ ] Add `authService.logout(userId)`, call it from the route, and derive cookie lifetime from config.
- [ ] Re-run focused and full tests; expect all malicious markup removed and refresh revocation enforced.

### Task 4: Stable cursor pagination and input validation

**Files:**
- Modify: `apps/api/src/lib/pagination.ts`
- Modify: `apps/api/src/services/post.service.ts`
- Modify: `apps/api/src/services/search.service.ts`
- Modify: `apps/api/src/services/notification.service.ts`
- Modify: `apps/api/src/routes/post.routes.ts`
- Test: `apps/api/src/lib/pagination.test.ts`

- [ ] Write failing tests for invalid/negative limits and for round-tripping a cursor that contains the complete sort tuple.
- [ ] Implement an opaque base64url JSON cursor using `createdAt + id` for latest/search and `isPinned + likeCount + createdAt + id` for hot feeds.
- [ ] Apply lexicographic Prisma filters matching each `orderBy`; reject unknown sort values and clamp limits to `1..100`.
- [ ] Re-run pagination tests and API typecheck.

### Task 5: SSE correctness and notification delivery

**Files:**
- Modify: `apps/api/src/lib/jwt.ts`
- Create: `apps/api/src/services/sse.service.ts`
- Modify: interaction services/routes that create notifications
- Modify: `apps/sse/src/auth.ts`
- Modify: `apps/sse/src/connections.ts`
- Modify: `apps/sse/src/index.ts`
- Test: `apps/sse/src/connections.test.ts`

- [ ] Write a failing connection-pool test for capacity rejection before headers and cleanup of failed/closed responses.
- [ ] Add a ticket `jti`, consume tickets once in the SSE process for their short TTL, and check pool capacity before committing a 200 response.
- [ ] Centralize best-effort FC-to-SSE push after durable notification creation; keep database success independent of push failure.
- [ ] Send `id:` with notification events and keep the client callback payload consistent with the shared type.
- [ ] Re-run SSE tests, typecheck, and a curl smoke test against the running SSE service.

### Task 6: UI specification and accessible interaction cleanup

**Files:**
- Modify: `apps/web/src/app/globals.css`
- Modify: `preview.html`
- Modify: feed/detail/comment components
- Modify: navigation/sidebar components

- [ ] Replace every non-stepped animation timing function (`linear`) with an explicit `steps(...)` function in both implementation and preview.
- [ ] Add reduced-motion handling without changing the default arcade design.
- [ ] Surface failed like/bookmark/comment operations instead of silently discarding them, and route unauthenticated actions to login.
- [ ] Add accessible labels, focus-visible states, and disabled states while preserving square geometry and dual themes.
- [ ] Verify dark/light at 375, 768, 1024, and 1440 widths in the in-app browser.

### Task 7: PRD coverage audit and final verification

**Files:**
- Create: `docs/implementation-status.md`
- Modify only code required by newly reproduced failures.

- [ ] Map every PRD P0 API/page to `implemented`, `feature-flagged`, or `missing`; never describe a placeholder as production-ready.
- [ ] Implement any missing route that is required by an already-linked user action; remove or disable dead UI links until their flow exists.
- [ ] Run fresh `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, Prisma validation/format check, API health smoke test, SSE health smoke test, and browser interaction checks.
- [ ] Record any verification blocked by unavailable local infrastructure (for example Docker/PostgreSQL) with the exact blocked command; do not claim that layer passed.

