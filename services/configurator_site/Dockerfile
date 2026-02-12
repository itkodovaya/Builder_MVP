# Dockerfile for Site Configurator Service
# This is optional and can be used for containerization

FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY services/configurator_site/package.json ./services/configurator_site/
COPY shared/package.json ./shared/
COPY packages/config-typescript/package.json ./packages/config-typescript/

# Install dependencies
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the service
RUN pnpm --filter @builder-mvp/configurator-site build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built files
COPY --from=builder /app/services/configurator_site/dist ./dist
COPY --from=builder /app/services/configurator_site/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001

CMD ["node", "dist/index.js"]

