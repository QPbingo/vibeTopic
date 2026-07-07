# =============================================================================
# bingbingbingo Web — Production Dockerfile
# Next.js 15 standalone output
# =============================================================================

FROM node:22-alpine AS build
WORKDIR /app

# Build-time args (injected as NEXT_PUBLIC_* at build time)
ARG NEXT_PUBLIC_APP_NAME=bingbingbingo
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
ARG NEXT_PUBLIC_SSE_URL=http://localhost:3001

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/tsconfig.json packages/shared/
COPY apps/web/package.json apps/web/tsconfig.json apps/web/

# Install all deps
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/shared/src packages/shared/src
COPY apps/web/src apps/web/src
COPY apps/web/public apps/web/public
COPY apps/web/next.config.ts apps/web/

# Build-time env for Next.js
ENV NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_SSE_URL=${NEXT_PUBLIC_SSE_URL}

# Build
RUN pnpm --filter @bingo/shared build \
  && cd apps/web && npx next build

# =============================================================================
# Production image (standalone)
# =============================================================================
FROM node:22-alpine
WORKDIR /app

# Copy standalone output
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static apps/web/.next/static
COPY --from=build /app/apps/web/public apps/web/public

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000 || exit 1

CMD ["node", "apps/web/server.js"]
