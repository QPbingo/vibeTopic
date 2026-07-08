# Upload Editor and UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix current build/test blockers, then implement complete post image upload, avatar upload, richer author/home UI, real sorting verification, and user menu integration.

**Architecture:** First restore a green baseline. Then add a minimal local upload pipeline in the API that stores files under `uploads/`, records `MediaFile`, and returns URLs. ByteMD uses `uploadImages(files)` so toolbar selection, paste, and drag/drop insert uploaded image Markdown at the editor cursor; post cards derive preview media from Markdown image URLs.

**Tech Stack:** Next.js 15, React 19, ByteMD, Express, Prisma, PostgreSQL, Vitest, Tailwind CSS 4/global CSS.

## Execution Rules

- Complete tasks in order; do not start upload/profile/detail feature work until Task 1 is green.
- For every behavior change, add or update tests before implementation, then make the smallest code change that passes.
- After each task, run that task's verification command and write down any new bug as a checkbox in the same task before moving on.
- Preserve the Laser Mosaic Arcade style: square corners, staircase shadows, Zpix only for UI chrome, Inter for content, `steps()` animations only, no sidebar animation.
- Keep new UI fully dual-theme. Every new visual class needs dark and light coverage.
- Do not commit generated agent scratch artifacts such as `.superpowers/`; keep repository output limited to source, tests, docs, and required config.
- Browser QA must run against the real app services (`web` + `api` + `sse`), not the Superpowers companion page on port `63000`.

## Requirement Coverage Matrix

- Post click opens detail page with正文 and comments: Tasks 8, 13, 16.
- Detailed author homepage style: Tasks 7, 16.
- Publish entry with tags, images, paste/drop upload, and persisted URLs: Tasks 2, 3, 4, 5, 16.
- Author sees homepage prompts after likes/comments/bookmarks: Tasks 9, 13, 16.
- Real latest/hot filtering behavior: Task 11.
- Move lower-left settings into username action menu: Task 10.
- User avatar upload visible on homepage: Tasks 6, 16.
- Existing build/test/security/interaction bugs found during audit: Tasks 1, 12, 14, 15, 16.

## Current Command Evidence

- `pnpm typecheck` currently fails because `apps/web/src/components/feed/PostMedia.tsx` references `postSlug` without destructuring it.
- `pnpm test` currently fails 3 tests: SSE mock response does not write events, forgot-password route returns 503 in the local token test, and password reset redirect assertion runs before the delayed router push.
- `pnpm --filter @bingo/web run lint` currently fails because `apps/web/src/hooks/useSSE.ts` triggers `react-hooks/exhaustive-deps`.
- `pnpm audit --audit-level moderate` currently fails on `postcss <8.5.10` through `apps/web > next@15.5.20 > postcss@8.4.31`.
- `apps/api/package.json` and `apps/sse/package.json` currently use `lint: "echo 'ok'"`; backend lint coverage is missing until Task 1/15 replaces those no-op scripts.
- `git ls-files` currently shows `apps/web/.env.local` is tracked; it must be removed from the index before final handoff.

---

## Task 1: Restore Typecheck, Lint, and Test Baseline

**Files:**
- Modify: `eslint.config.mjs`
- Modify: `apps/api/package.json`
- Modify: `apps/sse/package.json`
- Modify: `apps/web/src/components/feed/PostMedia.tsx`
- Modify: `apps/api/src/routes/post.routes.ts`
- Modify: `apps/api/src/routes/notification.routes.ts`
- Modify: `apps/api/src/routes/auth.routes.ts`
- Modify: `apps/web/src/hooks/useSSE.ts`
- Modify: `apps/sse/src/connections.test.ts`
- Modify: `apps/web/src/components/auth/PasswordResetForms.test.tsx`

- [ ] In `PostMedia.tsx`, change `export function PostMedia({ media }: PostMediaProps)` to `export function PostMedia({ media, postSlug }: PostMediaProps)`.
- [ ] In `post.routes.ts`, import `ErrorCodes` from `@bingo/shared`.
- [ ] In `notification.routes.ts`, import `error` from `../lib/response.js` and replace the failed service branch with `return error(res, result.error.code, 400, result.error.message)`.
- [ ] In `auth.routes.ts`, allow local password reset tokens only when `!config.email.enabled && !config.isProduction`; keep production safe by returning 503 if email is disabled in production.
- [ ] In `auth.service.ts`, make `requestPasswordReset()` return `{ resetToken }` only in non-production local mode; production must never return reset tokens in API responses.
- [ ] In `useSSE.ts`, store the cleanup generation in a local const and only clear the current connection/timer for that generation to satisfy `react-hooks/exhaustive-deps`.
- [ ] In `connections.test.ts`, make the fake response `{ write: vi.fn(), writable: true, destroyed: false }`.
- [ ] In `PasswordResetForms.test.tsx`, use fake timers, advance `1500ms`, then assert `router.push('/login')`.
- [ ] Replace `apps/api` and `apps/sse` no-op lint scripts with real ESLint commands that cover `src/**/*.ts`.
- [ ] Extend `eslint.config.mjs` or add scoped config so backend TypeScript files lint without applying Next-only browser rules to API/SSE code.
- [ ] Run `pnpm typecheck`, `pnpm test`, `pnpm --filter @bingo/web run lint`, `pnpm --filter @bingo/api run lint`, and `pnpm --filter @bingo/sse run lint`.

**Acceptance:** Typecheck, tests, and real lint commands for web/API/SSE pass before any feature work begins.

## Task 2: Add Post Media Persistence

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `packages/shared/src/types.ts`
- Modify: `apps/api/src/routes/post.routes.ts`
- Modify: `apps/api/src/services/post.service.ts`
- Modify: `apps/api/src/services/comment.service.ts`
- Modify: `scripts/setup-db.sql`
- Modify: `prisma/seed.ts`
- Add/modify tests near `apps/api/src/services/post.service.test.ts`

- [ ] Add `media Json @default("[]") @db.JsonB` to `Post`.
- [ ] Extend create/update schemas to accept `media?: PostMedia[]` with image/video type, URL, optional alt/title/placeholder.
- [ ] Ensure `CreatePostInput`, `UpdatePostInput`, `Post`, and `PostCard` each define the same `media?: PostMedia[]` shape.
- [ ] Add `media?: PostMedia[]` to `UpdatePostInput`; edit mode must not lose existing media when only title/content/tags are changed.
- [ ] Generate slugs with a non-empty base for punctuation-only titles and retry on Prisma unique slug collisions instead of returning a 500.
- [ ] Normalize tag slugs with the same helper everywhere; reject or transform punctuation-only tag names so tag links are stable.
- [ ] In `postService.create()`, save sanitized `media` from input.
- [ ] In `postService.update()`, support updating both `tags` and `media`; replace old `PostTag` rows in a transaction so edit mode does not silently drop tag changes.
- [ ] Recalculate `Tag.postCount` in the same transaction when posts are created, retagged, deleted, hidden, or republished so sidebar/tag counts stay accurate.
- [ ] Make application services the single source of truth for redundant counters: remove like/comment/bookmark/tag counter triggers from `scripts/setup-db.sql` and keep only the full-text search setup there.
- [ ] Update seed data so sample likes/bookmarks/comments use the same service paths or explicitly recompute counts after seeding; seed data must not depend on removed triggers.
- [ ] Make `prisma/seed.ts` idempotent for sample posts, likes, bookmarks, and follows; repeated `pnpm db:seed` must not create duplicate demo posts or drift counters.
- [ ] In `prisma/seed.ts`, derive `contentHtml` with the same `renderMarkdown()` helper used by `postService` instead of hardcoding partial unsanitized HTML snippets.
- [ ] In `postService.list()` and `getBySlug()`, return `media`.
- [ ] Update `searchService.search()` and `postService.listByTag()` to return the same `media`, `isLiked`, and `isBookmarked` fields as the homepage feed.
- [ ] Add a service test proving created media is returned on list/detail.
- [ ] Add tests proving edit mode changes tags/media, search/tag feeds include media, and counters do not double-increment after `scripts/setup-db.sql` has been applied.
- [ ] Run `pnpm db:generate` after schema update.
- [ ] Run `pnpm db:push` locally before browser QA so the `posts.media` column exists.

**Acceptance:** A post created with 1-3 uploaded image URLs returns those images on homepage cards and detail payloads.

## Task 3: Implement Local Image Upload API

**Files:**
- Modify: `apps/api/src/index.ts`
- Modify: `apps/api/src/routes/upload.routes.ts`
- Add: `apps/api/src/routes/upload.routes.test.ts`
- Modify: `docs/config.md`

- [ ] Serve uploaded files with `app.use('/uploads', express.static(uploadDir))`.
- [ ] Increase the API JSON body limit from `1mb` to `15mb` so it matches the 10MB upload limit plus base64 overhead; document that this is temporary until multipart/OSS is wired.
- [ ] Update the global API error handler so `entity.too.large` returns JSON `{ code, data: null, message }` with HTTP 413; oversized upload attempts must not return an HTML Express error page.
- [ ] Add `POST /api/v1/media/upload` that accepts JSON `{ filename, mimeType, size, dataUrl }`.
- [ ] Remove or hard-disable the existing local `/media/upload-credential` behavior that returns `minioadmin` credentials; no endpoint may return long-lived storage credentials to the browser.
- [ ] Add an upload-specific rate limiter so authenticated users cannot spam large base64 requests.
- [ ] Validate auth, allowed image MIME types, and `OSSConfig.maxFileSize`; reject `image/svg+xml` for local uploads unless a sanitizer is added, because SVG can carry script when opened directly.
- [ ] Verify decoded bytes match the declared size and basic image magic bytes; do not trust only `mimeType` or filename.
- [ ] Normalize filenames and derive the extension from verified MIME type, not user input.
- [ ] Decode base64 safely, write file to `uploads/users/<userId>/<uuid>.<ext>`.
- [ ] Create a `MediaFile` row with URL, type, size, MIME, original name, and object key.
- [ ] Return an absolute browser-readable URL such as `http://localhost:8080/uploads/...`; derive this from a new `UPLOAD_PUBLIC_BASE_URL` config value that defaults to the API origin, because a relative `/uploads/...` URL will break when rendered by the Next.js app on port 3000.
- [ ] Return `{ url, id, fileType, mimeType }` and never return raw Prisma objects containing `BigInt`.
- [ ] Configure `express.static` for uploads with no directory listing, dotfiles ignored, and conservative cache headers for local development.
- [ ] Test success, unsupported MIME, size limit, mismatched declared size, invalid data URL, SVG rejection, and absolute URL generation.
- [ ] Add `uploads/` to `.gitignore`.

**Acceptance:** Authenticated clients can upload an image and receive a browser-readable URL without OSS configured.

## Task 4: Wire ByteMD Paste/Drop/Toolbar Upload

**Files:**
- Modify: `apps/web/src/lib/api.ts`
- Add: `apps/web/src/lib/upload.ts`
- Modify: `apps/web/src/components/posts/PostEditorForm.tsx`
- Modify: `apps/web/src/components/posts/PostEditorForm.test.tsx`

- [ ] Add `uploadImage(file)` in `apps/web/src/lib/upload.ts`; it reads the file as Data URL and posts to `/media/upload`.
- [ ] Preflight-check file type and size in the browser before reading large files into memory.
- [ ] Pass `uploadImages={uploadImages}` to `<Editor />`.
- [ ] Return ByteMD-compatible objects `{ url, alt, title }`.
- [ ] While uploading, show a pixel-styled status line in the editor header.
- [ ] On upload error, show a form error and do not insert broken Markdown.
- [ ] Handle multi-file paste/drop in order and show partial failure with the exact format `2/3 张上传成功，1 张失败`.
- [ ] Disable submit while images are uploading so posts are not published with missing image Markdown.
- [ ] Test that `uploadImages([file])` calls the API helper and returns an image URL object.

**Acceptance:** Selecting, pasting, or dragging an image into ByteMD uploads it and inserts Markdown at the cursor.

## Task 5: Extract Homepage Media From Markdown

**Files:**
- Add: `apps/api/src/lib/media.ts`
- Add: `apps/api/src/lib/media.test.ts`
- Modify: `apps/api/src/services/post.service.ts`

- [ ] Implement `extractPostMedia(contentMd, explicitMedia)` that returns explicit media first, otherwise first 3 Markdown image URLs.
- [ ] Support Markdown forms `![alt](url)` and `![alt](url "title")`.
- [ ] Preserve relative `/uploads/...` and absolute `http(s)` image URLs, but ignore `data:`, `javascript:`, and non-image links.
- [ ] Deduplicate repeated image URLs so the homepage grid does not show the same pasted image multiple times.
- [ ] Use this helper in create/update and list/detail return paths.
- [ ] Add tests for relative upload URLs, absolute CDN URLs, data URL rejection, duplicate rejection, and three-image truncation.

**Acceptance:** A post with pasted Markdown images shows the first 1-3 images in homepage media grid.

## Task 6: Avatar Upload and Auth Refresh

**Files:**
- Modify: `apps/web/src/lib/auth.tsx`
- Modify: `apps/web/src/app/settings/profile/page.tsx`
- Modify: `apps/api/src/routes/user.routes.ts`

- [ ] Add `refreshMe()` to `AuthContext` that reloads `/auth/me`.
- [ ] Add avatar file input on profile settings page.
- [ ] Upload selected image through the same upload helper.
- [ ] Save returned URL to `/users/me` as `avatarUrl`.
- [ ] Allow clearing an avatar by sending `avatarUrl: null` to `/users/me`; document this in the route schema and test it.
- [ ] Call `refreshMe()` after save so navbar/home avatars update immediately.
- [ ] Add image load fallback in `PixelAvatar` so a broken avatar URL falls back to initials instead of an empty square.
- [ ] Change `PixelAvatar` to render a real `<img>` when `avatarUrl` exists, with `alt`, fixed width/height, `object-fit: cover`, and `onError` fallback; do not rely on CSS `background: url(...)` because broken images cannot be detected.
- [ ] Update shared `UserUpdateInput` and API schema so `avatarUrl?: string | null` is valid; use `avatarUrl !== undefined` in the update data so `null` clears the avatar.
- [ ] After username changes, refresh auth state and route links so navbar/profile URLs use the new username immediately.
- [ ] Keep existing username and bio editing intact.

**Acceptance:** User uploads an avatar, saves profile, and sees the new avatar in navbar, homepage post cards, comments, and author profile.

## Task 7: Detailed Author Homepage

**Files:**
- Modify: `apps/api/src/routes/user.routes.ts`
- Modify: `apps/api/src/routes/project.routes.ts`
- Modify: `packages/shared/src/config.ts`
- Modify: `packages/shared/src/types.ts`
- Modify: `apps/web/src/app/u/[username]/page.tsx`
- Reuse: `apps/web/src/components/feed/PostCard.tsx`

- [ ] Add `GET /users/:id/posts` as the public user posts endpoint; return published posts for a profile with the same `PostCard` payload shape as the homepage feed.
- [ ] Make `:id` accept either UUID or username, matching `GET /users/:id`; the `/u/[username]` page must not need to know the UUID before fetching posts.
- [ ] Add or reuse a public projects endpoint for the profile page; it must accept either UUID or username, because `/u/[username]` should not need to know the UUID before fetching projects.
- [ ] Add project field constraints in shared config and API schemas: description max length, image array max count, and source URL/cover URL max length.
- [ ] Return project cards with stable fields for the author page: `id`, `title`, `description`, `coverImage`, `images`, `sourceUrl`, `createdAt`.
- [ ] Replace the single profile card with a two-section page: profile header and post list.
- [ ] Header includes avatar, username, bio, joined date, post/follow/follower/project counts, follow/edit button.
- [ ] Post list uses `PostCard` for visual consistency.
- [ ] Empty state says the author has not published posts.
- [ ] Project tab uses square pixel project cards with cover image fallback, source link, and an empty state saying the author has not added projects.

**Acceptance:** Visiting `/u/<username>` shows a polished profile plus that author’s published posts and project tab without losing the current arcade style.

## Task 8: Polished Post Detail Page

**Files:**
- Modify: `apps/web/src/app/posts/[slug]/PostDetailClient.tsx`
- Modify: `apps/web/src/components/comments/CommentSection.tsx`
- Modify: `apps/web/src/app/globals.css`
- Reuse: `apps/web/src/components/feed/PostMedia.tsx`
- Reuse: `apps/web/src/components/ui/PixelAvatar.tsx`
- Reuse: `apps/web/src/components/ui/PixelTag.tsx`
- Reuse: `apps/web/src/components/ui/StatIcons.tsx`

- [ ] Replace ad-hoc inline layout with named classes such as `.post-detail-page`, `.post-detail-shell`, `.post-detail-hero`, `.post-detail-meta`, `.post-detail-title`, `.post-detail-body`, and `.post-detail-comments`.
- [ ] Keep the existing `page-layout` rhythm but make the detail page a focused reading surface with max width around `800-880px`.
- [ ] Add a back-to-feed link at the top that uses existing pixel button/link treatment and works with keyboard focus.
- [ ] Render author block with pixel avatar, username link, publish time, and view count.
- [ ] Make the author block visually richer than the feed card: avatar, name, role/bio snippet if available, compact stats, and follow/edit action in one aligned header row.
- [ ] Render title, tags, and owner edit/re-submit action without using pixel font for the title/body.
- [ ] Add status banners for pending/rejected owner preview states without affecting published reader layout.
- [ ] Show uploaded/parsed media near the top when `post.media` exists, using `PostMedia` and the existing 1-3 image grid rules.
- [ ] If detail media should be larger than feed media, add a detail-only class while preserving the same 1/2/3 image layout rules and square pixel styling.
- [ ] Style Markdown body: headings, paragraphs, lists, blockquotes, code, pre blocks, links, tables, and images.
- [ ] Ensure Markdown images have square corners, pixel border/shadow, and do not overflow on mobile.
- [ ] Move stats/actions into a clear footer strip that keeps like/comment/bookmark aligned and tappable.
- [ ] Build the comment area as a full detail-page section: section title, comment count, input/editor state, empty state, comment list, and reply nesting all share the same visual system.
- [ ] Restyle the comment container header and spacing so the comments read as part of the detail page, not a detached card inside a card.
- [ ] Ensure comment actions (`回复`, like, delete/moderation states if present) have clear hover/focus/disabled states and do not cause layout shift.
- [ ] Verify long titles, long code blocks, long URLs, and Chinese/English mixed text wrap cleanly.
- [ ] Add light theme overrides for every new class.
- [ ] Add responsive rules for mobile: smaller title, stacked author/actions, no horizontal overflow, bottom nav clearance.
- [ ] Add screenshot checks for desktop and mobile in dark/light themes after styling.
- [ ] Remove the stray invalid CSS brace near the current `.post-detail-content code` block.

**Acceptance:** Clicking a post opens a polished detail page with full正文、顶部图片、作者信息、标签、统计操作和评论区；dark/light/mobile all match the Laser Mosaic Arcade style.

## Task 9: Homepage Notification Prompt

**Files:**
- Modify: `apps/web/src/app/page.tsx`
- Add: `apps/web/src/components/notifications/HomeNotificationPrompt.tsx`
- Reuse: `apps/web/src/hooks/useSSE.ts`

- [ ] For authenticated users, fetch `/users/me/notifications?limit=3`.
- [ ] Show only unread `like`, `comment`, and `bookmark` notifications.
- [ ] Render a compact pixel-card prompt above tabs.
- [ ] Include actor username, action text, time, and link to `/notifications`.
- [ ] When SSE reports a new notification, refetch the newest unread notifications instead of only incrementing a number, so the prompt content is correct.
- [ ] Refetch unread notifications on SSE reconnect and browser visibility/focus return so missed events appear after a temporary disconnect.
- [ ] Do not mark notifications as read from the homepage prompt; only mark them after the user opens the notification center or explicitly dismisses the prompt.
- [ ] Keep the homepage prompt visually compact enough that it does not push the first feed card below the fold on mobile.

**Acceptance:** Authors can see recent unread engagement prompts directly on the homepage.

## Task 10: Navbar User Menu and Mobile “My” Entry

**Files:**
- Modify: `apps/web/src/components/layout/Navbar.tsx`
- Modify: `apps/web/src/components/layout/BottomNav.tsx`
- Modify: `apps/web/src/app/globals.css`

- [ ] Replace separate username/settings/logout links with a username button.
- [ ] Show the user's avatar next to the username button when available.
- [ ] Dropdown contains: `个人主页`, `编辑资料`, `通知`, `退出`.
- [ ] Preserve theme toggle and publish button.
- [ ] Mobile bottom “我的” links to `/u/<username>` when logged in, otherwise `/login`.
- [ ] Ensure dropdown is keyboard accessible and closes after clicking an item.

**Acceptance:** Settings are integrated into the username menu; the lower-left/bottom settings shortcut is gone.

## Task 11: Verify Latest/Hot Sorting

**Files:**
- Modify/add: `apps/api/src/services/post.service.test.ts`
- Modify: `apps/api/src/services/post.service.ts`
- Modify: `apps/web/src/app/page.tsx`
- Modify: `docs/implementation-status.md`

- [ ] Define the hot score in code and docs as `likeCount + commentCount * 2`, while keeping pinned posts first.
- [ ] Add test data with different `createdAt`, `likeCount`, `commentCount`, and `isPinned`.
- [ ] Test `latest` orders by pinned first, then newest.
- [ ] Test `hot` orders by pinned first, then weighted hot score, then newest.
- [ ] Ensure the homepage tab label `最热` corresponds to that weighted sort, not only raw likes.
- [ ] Confirm frontend tab changes already reset infinite scroll and refetch.

**Acceptance:** Sorting behavior is covered by tests and matches homepage tab labels.

## Task 12: Search Robustness and Result Consistency

**Files:**
- Modify: `apps/api/src/services/search.service.ts`
- Modify/add: `apps/api/src/services/search.service.test.ts`
- Modify: `apps/web/src/app/search/page.tsx`

- [ ] Sanitize full-text search tokens before building `to_tsquery`; remove or escape punctuation/operators so normal user searches do not rely on exception fallback.
- [ ] Add tests for search terms containing punctuation, Chinese text, spaces, quotes, colon, ampersand, and empty-after-sanitization input.
- [ ] Return `media`, `isLiked`, and `isBookmarked` in search results using the same helper used by the homepage feed.
- [ ] Remove the remaining `any` casts in search result mapping by introducing a typed mapper shared with `postService` where practical.
- [ ] Preserve stable cursor pagination for both FTS and ILIKE fallback paths.
- [ ] Show a clear validation message in the search page when the query becomes too short after trimming.

**Acceptance:** Search does not throw for common user-entered punctuation, returns the same card data shape as the homepage feed, and paginates consistently.

## Task 13: Moderation Status, Redirect, and Count Consistency

**Files:**
- Modify: `apps/api/src/services/post.service.ts`
- Modify: `apps/api/src/services/comment.service.ts`
- Modify: `apps/api/src/services/auth.service.ts`
- Modify: `apps/api/src/routes/auth.routes.ts`
- Modify: `apps/web/src/components/posts/PostEditorForm.tsx`
- Modify: `apps/web/src/app/posts/[slug]/edit/EditPostClient.tsx`
- Modify: `apps/web/src/app/posts/[slug]/page.tsx`
- Modify: `apps/web/src/app/posts/[slug]/PostDetailClient.tsx`
- Modify: `apps/web/src/app/notifications/page.tsx`
- Modify: `apps/api/src/services/notification.service.ts`
- Modify: `apps/api/src/routes/notification.routes.ts`
- Add/modify tests near affected service and component tests.

- [ ] When content safety is enabled and a new post returns `pending_review`, route the user to `/posts/<slug>?ownerPreview=1` and show an owner-visible detail/status state instead of sending them to a public detail page that 404s.
- [ ] Make post detail owner-aware for `pending_review` and `rejected` posts by doing an authenticated client fetch when `ownerPreview=1`; owners should see their own non-public posts, other users should not.
- [ ] In `EditPostClient`, redirect unauthenticated users to `/login?next=/posts/<slug>/edit` instead of leaving them stuck on the loading state.
- [ ] Show clear status banners on detail pages: `审核中`, `审核未通过`, `已隐藏`, or normal published state.
- [ ] Keep the edit/re-submit action visible for rejected owner posts.
- [ ] Add an explicit `incrementView` query flag to `GET /posts/:slug`; only public detail views pass `incrementView=true`, while editing a post, fetching owner review state, and background refreshes must not increment `viewCount`.
- [ ] In `commentService.create()`, only increment `post.commentCount` and notify the post author when the created comment is actually `published`; pending-review comments should not increase visible counts or send visible notifications.
- [ ] Reject replies to any parent comment that is not `published`; hidden/deleted/pending parent comments must not accept new replies.
- [ ] Preserve discussion context for deleted comments by returning a placeholder comment such as `该评论已被删除` when a deleted parent has published replies, instead of dropping the whole thread.
- [ ] Use guarded `updateMany` decrements with count fields greater than zero so repeated unlike/unbookmark/delete paths cannot drive `likeCount`, `bookmarkCount`, `commentCount`, or comment `likeCount` below zero.
- [ ] Change notification creation from plain `create()` to an idempotent upsert/refresh behavior: if the same actor repeats an action after the receiver read it, set `isRead=false` and update `createdAt` so the receiver sees a fresh notification.
- [ ] For follow notifications, store enough target identity to deduplicate follow/unfollow/refollow cycles; nullable `targetType`/`targetId` must not allow unlimited duplicate follow notifications.
- [ ] For notifications, resolve the target post's slug in `notificationService.list()` and return `targetPostSlug`; for reply/comment notifications also return `targetCommentId` so the UI links to `/posts/<slug>#comment-<id>` instead of a raw UUID URL.
- [ ] Make logout robust when the access token is expired: the route must clear the refresh cookie with the same `path`, `sameSite`, and `secure` options used when setting it, and should revoke the stored refresh token when a valid refresh cookie is present even if access auth fails.
- [ ] Add a regression test proving logout followed by page reload does not silently log the user back in.
- [ ] Update notification center read behavior so opening the page does not immediately mark everything read before render; add a visible “全部标为已读” button and call `/users/me/notifications/read` only after the user clicks it.
- [ ] Add tests for pending post redirect, rejected owner detail visibility, anonymous rejected detail 404, no-view-count edit fetches, pending comment count behavior, rejecting replies to non-published parents, deleted-comment placeholders with replies, nonnegative counters, duplicate notification refresh, reply notification links, and notification read timing.

**Acceptance:** Review/rejection flows do not dead-end users, private content remains private, visible counts match visible content, edit/background fetches do not inflate views, and notifications remain linkable and unread until the user has actually seen or dismissed them.

## Task 14: Security, Accessibility, and Interaction Hardening Pass

**Files:**
- Modify: `apps/api/src/lib/content.ts`
- Modify: `apps/api/src/lib/content.test.ts`
- Modify: `apps/web/src/lib/upload.ts`
- Modify: `apps/web/src/components/posts/PostEditorForm.tsx`
- Modify: `apps/web/src/components/feed/PostMedia.tsx`
- Modify: `apps/web/src/components/ui/PixelAvatar.tsx`
- Modify: `apps/web/src/components/layout/Navbar.tsx`
- Modify: `apps/web/src/app/posts/[slug]/PostDetailClient.tsx`
- Modify: `apps/web/src/components/comments/CommentSection.tsx`
- Modify: `apps/web/src/components/comments/CommentCard.tsx`
- Modify: `apps/api/src/routes/post.routes.ts`
- Modify: `apps/api/src/routes/comment.routes.ts`
- Modify: `apps/api/src/routes/follow.routes.ts`
- Modify: `apps/api/src/middleware/ratelimit.ts`
- Modify: `apps/web/src/app/globals.css`

- [ ] Add or update Markdown sanitizer tests proving `script`, event handlers, `javascript:` links, and `data:` image sources are removed, while `/uploads/...` and `https://...` images remain.
- [ ] Ensure every uploaded image rendered in `PostMedia` and detail body has useful `alt` text from the Markdown/upload filename when available.
- [ ] In `PostMedia`, make image media link to the post when `postSlug` is provided, matching video media and title click behavior.
- [ ] Ensure uploaded images have `loading="lazy"` where appropriate and fixed dimensions/aspect rules so feed layout does not jump.
- [ ] Ensure the navbar dropdown supports keyboard open/close, Escape close, outside click close, focus return, and visible focus outlines.
- [ ] Ensure every unauthenticated action redirects to login with a `next` parameter back to the current page, including comment like/reply, post like/bookmark, publish, profile edit, notification center, navbar login, bottom-nav login, and inline “登录后评论” links.
- [ ] When a user clicks reply on a comment, focus the comment textarea, display the replied-to username, and provide a clear cancel button.
- [ ] After a comment submits successfully, announce success and keep the user near the new comment instead of jumping unexpectedly.
- [ ] Ensure upload error messages are announced with `role="alert"` and do not disappear before users can read them.
- [ ] Apply `socialLimiter` or route-specific limits to post like/unlike, bookmark/unbookmark, comment create/like/unlike, and follow/unfollow so one user cannot spam counts or notifications.
- [ ] Ensure all new clickable controls use `<button>` or `<a>` correctly, not clickable `div`s.
- [ ] Verify no new CSS introduces rounded corners, smooth easing animations, one-hue palettes, nested cards, or sidebar animation.

**Acceptance:** New functionality is safe against common content/upload abuses and remains usable by keyboard and screen-reader users.

## Task 15: Dependency, Deployment, and Runtime Security Hardening

**Files:**
- Modify: `.gitignore`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `packages/shared/src/services-config.ts`
- Modify: `apps/api/.env.example`
- Modify: `apps/sse/.env.example`
- Modify: `apps/web/.env.example`
- Modify: `docs/config.md`
- Modify: `docker-compose.yml`
- Modify: `docker-compose.prod.yml`
- Modify: `apps/api/src/index.ts`
- Modify: `apps/sse/src/index.ts`
- Modify: `apps/sse/src/config.ts`
- Modify: `apps/web/next.config.ts`
- Modify: `docs/PRD.md`
- Modify: `docs/implementation-status.md`

- [ ] Resolve the current `pnpm audit --audit-level moderate` finding for `postcss <8.5.10` by adding a pnpm override that forces `postcss >=8.5.10`.
- [ ] Run `pnpm install --lockfile-only` after dependency override/upgrade so `pnpm-lock.yaml` records the patched PostCSS resolution.
- [ ] Add `UPLOAD_PUBLIC_BASE_URL` to shared service config and docs; default it to `http://localhost:8080` for local development.
- [ ] Add `UPLOAD_PUBLIC_BASE_URL`, `CORS_ORIGINS`, and any new upload/CORS variables to the relevant `.env.example` files.
- [ ] Align production upload behavior with this milestone's local upload implementation: set `OSS_ENABLED=false` in `docker-compose.prod.yml`, add a persistent `api_uploads` volume mounted to the API container, and document that this milestone uses local API storage.
- [ ] Do not blindly add an API upload volume to local `docker-compose.yml` because the current local compose file only runs infra services. Either add local API/web services with `uploads:/app/uploads` intentionally, or document that local `pnpm dev:api` writes to repository-local `uploads/`.
- [ ] Add API security headers without introducing a large dependency: set `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a conservative `Cross-Origin-Resource-Policy` that still allows uploaded images to render in the web app.
- [ ] Make CORS origins config-driven from `NEXT_PUBLIC_SITE_URL`/`CORS_ORIGINS` instead of hardcoding only localhost and `https://bingbingbingo.cn`.
- [ ] Make SSE service CORS origins config-driven from the same `CORS_ORIGINS` setting instead of hardcoding only localhost and `https://bingbingbingo.cn`.
- [ ] Validate `/internal/push` request body in the SSE service with a schema: `userId` must be UUID, `notificationId` must be UUID, and `secret` must match before any push occurs.
- [ ] Remove the broad `{ protocol: 'https', hostname: '**' }` image remote pattern from `apps/web/next.config.ts`; the app uses plain `<img>` for uploaded media in this milestone.
- [ ] Add `.superpowers/` to `.gitignore` so generated planning/visual companion scratch files are not accidentally committed.
- [ ] Remove tracked local env files from Git, starting with `git rm --cached apps/web/.env.local`; keep `.env.example` files tracked and do not delete the user's local env values from disk.
- [ ] Confirm `.env` files remain ignored and no secret-containing env file is tracked with `git ls-files .env .env.local .env.production 'apps/**/.env' 'apps/**/.env.local' 'apps/**/.env.production'`.
- [ ] Run `git status --short` before handoff and confirm `.superpowers/`, `uploads/`, and secret files are not staged.
- [ ] Update docs that still describe `/media/upload-credential` as the active upload path; this milestone uses `/media/upload` local API storage unless a real STS adapter is implemented.
- [ ] Update `docs/implementation-status.md` after verification so it no longer claims green build/test/upload capability unless current commands prove it.
- [ ] Run `pnpm audit --audit-level moderate` and verify it exits successfully.

**Acceptance:** Dependency audit is clean at moderate severity, upload storage survives container restarts in the chosen local-upload deployment path, and runtime headers/CORS/image origin policy do not leave broad avoidable exposure.

## Task 16: Final Visual and Regression QA

**Files:**
- No production file changes unless QA reveals bugs.

- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm --filter @bingo/web run lint`.
- [ ] Run `pnpm --filter @bingo/api run lint`.
- [ ] Run `pnpm --filter @bingo/sse run lint`.
- [ ] Run `pnpm audit --audit-level moderate`.
- [ ] Run `pnpm build` after typecheck/test/lint pass to catch Next.js route and server/client boundary issues.
- [ ] Run local API/web dev servers.
- [ ] Open the actual web app URL in the browser, not the current `http://localhost:63000/` companion page.
- [ ] In browser, verify: homepage, latest/hot tabs, post detail, comments, new post editor image paste/drop, profile avatar upload, author profile, navbar menu, notifications, pending/rejected status states, and search/tag result cards with media.
- [ ] Check browser console logs during the full flow; fix any React hydration, failed request, sanitizer, SSE, or image load errors discovered during QA.
- [ ] Check dark and light themes for new UI.
- [ ] Check desktop width, tablet width, and mobile width; confirm no text overlap, horizontal scroll, or bottom nav obstruction.
- [ ] Upload JPEG, PNG, WebP, oversize file, unsupported file, and broken file; confirm success/error states are correct.
- [ ] Confirm no new rounded corners, smooth animation curves, or sidebar animations were introduced.

**Acceptance:** All automated checks pass and the new flows work in browser in both themes.
