# syntax=docker/dockerfile:1.7

# ----- Build stage: install + build inside the full monorepo -----
FROM node:24-alpine AS builder

RUN corepack enable
WORKDIR /repo

COPY . .

RUN pnpm install --frozen-lockfile

# Build the docs and any workspace packages it depends on
RUN pnpm --filter @react-spring/docs... build

# Produce a self-contained dir with prod-only deps (symlinks dereferenced)
RUN pnpm --filter @react-spring/docs deploy --prod /out

# pnpm deploy doesn't carry over the build output; copy it in explicitly
RUN cp -r /repo/docs/build /out/build

# ----- Runtime stage: slim image with only what's needed to serve -----
FROM node:24-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /out ./

EXPOSE 8080
CMD ["node_modules/.bin/react-router-serve", "./build/server/index.js"]
