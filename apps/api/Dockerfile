# =============================================================================
# bingbingbingo API — Production Dockerfile
# Express + TypeScript + Prisma
# =============================================================================

FROM node:22-alpine AS build
WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/tsconfig.json packages/shared/
COPY apps/api/package.json apps/api/tsconfig.json apps/api/

# Install all deps (needed for build)
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/shared/src packages/shared/src
COPY apps/api/src apps/api/src

# Generate Prisma client + build
RUN pnpm --filter @bingo/shared build \
  && cd apps/api && npx prisma generate \
  && pnpm --filter @bingo/api build

# =============================================================================
# Production image
# =============================================================================
FROM node:22-alpine
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/api/package.json apps/api/package.json

# Install production deps only
RUN pnpm install --frozen-lockfile --prod --filter @bingo/api...

# Copy built artifacts
COPY --from=build /app/packages/shared/dist packages/shared/dist
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/api/node_modules/.prisma apps/api/node_modules/.prisma

# Copy Prisma schema (needed at runtime for some Prisma features)
COPY prisma prisma

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

CMD ["node", "apps/api/dist/index.js"]
