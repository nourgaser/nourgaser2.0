# syntax=docker/dockerfile:1

###############################
# Stage 1: Build (Bun + Astro)
###############################
FROM oven/bun:1.2 AS builder
WORKDIR /app

# Install dependencies first for better layer caching.
COPY package.json bun.lock* ./
RUN if [ -f bun.lock ]; then bun install --frozen-lockfile; else bun install; fi

# Copy source and build.
COPY . .
RUN bun run build

###############################
# Stage 2: Runtime (nginx)
###############################
FROM nginx:1.27-alpine AS runner

# Static Astro output.
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
