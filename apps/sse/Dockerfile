FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/tsconfig.json packages/shared/
COPY apps/sse/package.json apps/sse/tsconfig.json apps/sse/
RUN pnpm install --frozen-lockfile
COPY packages/shared/src packages/shared/src
COPY apps/sse/src apps/sse/src
RUN pnpm --filter @bingo/shared build && pnpm --filter @bingo/sse build

FROM node:22-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/sse/package.json apps/sse/package.json
RUN pnpm install --frozen-lockfile --prod --filter @bingo/sse...
COPY --from=build /app/packages/shared/dist packages/shared/dist
COPY --from=build /app/apps/sse/dist apps/sse/dist
EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1
CMD ["node", "apps/sse/dist/index.js"]
