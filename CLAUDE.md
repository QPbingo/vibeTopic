# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**bingbingbingo** — a vertical tech community for vibe coding / AI-assisted developers in China. Developers share projects, discuss AI tools (Cursor, Claude Code, Copilot), and showcase work. Target domain: `https://bingbingbingo.cn`.

**Current phase**: Design & prototyping. Code implementation has not started. The primary artifact is `preview.html` — a self-contained, dual-theme (dark/light) interactive preview of the homepage feed.

**Planned tech stack**: Next.js 15 + Tailwind CSS 4 + shadcn/ui + bytemd (Markdown editor). Backend: PostgreSQL + JWT auth + SSE notifications. Monorepo structure expected (apps/web, apps/api, apps/sse, packages/shared).

## Design Decisions

### Visual identity: Laser Mosaic Arcade
The UI has a distinctive **classic arcade pixel aesthetic** inspired by Claude's logo blocks, Hermès pixel scarves, and Vibe Island. Key design rules:

- **Dual font system**: UI chrome (nav, tabs, buttons, tags, stats, time) uses Zpix pixel font. Content (post titles, body, usernames) uses Inter. Sidebar uses Inter only — no pixel fonts, no animations.
- **Staircase box-shadows**: Cards, buttons, and media use multi-layer `box-shadow` offsets (4/8/12/16/20px) in cyan/pink/purple — never rounded corners, never smooth transitions.
- **CRT effects**: Full-page scanline overlay with `crtFlicker` animation, screen-edge vignette via inset `box-shadow` on body.
- **Floating particles**: 10 large pixel blocks (8–16px) drift upward with rotation — pure CSS, no JS.
- **Rainbow strip**: An 8-color animated pixel bar between nav and content.
- **Animations use `steps()` only** — no easing curves, everything is hard-stepped for arcade feel. But sidebar and post content remain static.

### Post media system
Posts support 1–3 images displayed simultaneously (not a carousel):
- Single image: 130–140px height, full width
- 2-image grid: `grid-template-columns: 1fr 1fr`, 110px rows
- 3-image grid: `grid-template-columns: 1fr 1fr 1fr`, 110px rows
- Video: thumbnail with octagonal play button (matching avatar clip-path), duration badge

All placeholder images are pure CSS gradients (`.media-ph-1` through `.media-ph-6`) — no external dependencies.

### Sidebar rules
- 3 modules only: 热榜 (Hot), 推荐作者 (Authors), 热门标签 (Tags)
- All text in Inter font
- No animations whatsoever
- Stats bar ("在线/帖子/冒险者") and About module were intentionally removed

### Theme system
Dark mode is default. Toggle via ☀ button (36×36px, pixel-styled) that adds `.light` class to `<html>`. Both themes must be equally polished — every element has `.light` overrides.

## Configuration System

All external service configs are centralized in `packages/shared/src/services-config.ts`. Each service (OSS, Email, OAuth, Redis, etc.) has an `enabled` toggle — when disabled, the app uses local fallbacks (in-memory rate limiting, skip email verification, direct publish without moderation).

**Config flow**: `.env` → `services-config.ts` (single source of truth) → `apps/*/src/config.ts` (per-package consumers)

See `docs/config.md` for the complete configuration reference.

## Documentation

| File | Purpose |
|------|---------|
| `preview.html` | Self-contained interactive homepage preview. Open directly in browser. |
| `docs/PRD.md` | Product requirements — MVP feature scope, user flows |
| `docs/ui-spec.md` | Complete UI design spec v1.4.0 — colors, fonts, pixel system, animations, media, components, checklist |
| `docs/database.md` | PostgreSQL schema — tables, fields, relations |
| `docs/config.md` | **Complete configuration reference** — all env vars, defaults, production setup guide |
| `docs/error-codes.md` | Error code catalog for API responses |

## Working with preview.html

- Open directly in any browser — no build step, no server needed
- Toggle dark/light with the ☀ button in the nav bar
- Edit CSS in the `<style>` block (lines 8–~450), HTML in `<body>` (lines ~470–end)
- When adding pixel animations, always use `steps()` timing function
- When adding UI text, decide: is this chrome (Zpix) or content/sidebar (Inter)?
- Keep the dual-theme constraint: every new visual element needs both dark and light styles
- Media placeholders must be pure CSS — no external image URLs in production design
