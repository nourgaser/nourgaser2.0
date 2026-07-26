# syntax=docker/dockerfile:1

###############################
# Stage 1: Build (Bun + Astro)
###############################
FROM oven/bun:1.2 AS builder
WORKDIR /app

# Build-time arguments for environment configuration
ARG RAWG_API_KEY

# LaTeX toolchain for compiling the resume (resume/resume.tex -> public/resume.pdf).
# tex-common's postinst tries to rebuild format files for every TeX engine
# (fmtutil-sys --all), which can fail on an unrelated/unused engine and makes
# apt-get report the whole install as failed even though the packages we
# actually need (including pdflatex) unpacked and configured fine. Retry the
# format build tolerantly, patch up dpkg's state, then verify pdflatex works.
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
      texlive-latex-base \
      texlive-latex-extra \
      texlive-fonts-extra \
      texlive-fonts-recommended \
    ; fmtutil-sys --all || true \
    ; apt-get install -y -f --no-install-recommends \
    ; rm -rf /var/lib/apt/lists/*
RUN pdflatex --version

# Install dependencies first for better layer caching.
COPY package.json bun.lock* ./
RUN if [ -f bun.lock ]; then bun install --frozen-lockfile; else bun install; fi

# Copy source and build.
COPY . .
RUN RAWG_API_KEY=${RAWG_API_KEY} bun run build

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
