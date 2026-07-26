# syntax=docker/dockerfile:1

###############################
# Stage 1: Compile the résumé (LaTeX)
###############################
# A hand-picked, minimal set of TeX Live packages instead of a full
# distribution. apt's texlive-fonts-extra and the prebuilt texlive/texlive
# image both come to ~500MB+ (texlive/texlive:latest is 2.3GB — every
# language and font, not just what resume.tex uses). Installing exactly
# what's needed, with --no-doc-install/--no-src-install, comes to ~220MB.
# Verified locally: clean install (no fmtutil errors), identical PDF output.
FROM debian:bookworm-slim AS resume
RUN apt-get update && apt-get install -y --no-install-recommends \
      wget perl xz-utils ca-certificates fontconfig \
    && rm -rf /var/lib/apt/lists/*

ARG CTAN_MIRROR=https://mirror.ctan.org/systems/texlive/tlnet
RUN wget -q "${CTAN_MIRROR}/install-tl-unx.tar.gz" -O /tmp/install-tl.tar.gz \
    && mkdir /tmp/install-tl \
    && tar -xzf /tmp/install-tl.tar.gz -C /tmp/install-tl --strip-components=1 \
    && cd /tmp/install-tl \
    && ./install-tl --repository "${CTAN_MIRROR}" --no-interaction \
         --no-doc-install --no-src-install --scheme=infraonly \
         --texdir=/usr/local/texlive \
    && ln -s "$(find /usr/local/texlive/bin -mindepth 1 -maxdepth 1 -type d | head -1)" /usr/local/texlive/bin/current \
    && rm -rf /tmp/install-tl*

ENV PATH="/usr/local/texlive/bin/current:${PATH}"

# Exactly the packages resume.tex's preamble needs (plus preprint for
# fullpage.sty, which — despite the name — isn't part of collection-latex).
RUN tlmgr option repository "${CTAN_MIRROR}" \
    && tlmgr option docfiles 0 \
    && tlmgr option srcfiles 0 \
    && tlmgr install collection-latex \
         preprint titlesec marvosym enumitem hyperref fancyhdr \
         fira fontaxes xkeyval babel-english

WORKDIR /resume
COPY resume/resume.tex .
RUN pdflatex -interaction=nonstopmode -jobname=resume resume.tex && \
    pdflatex -interaction=nonstopmode -jobname=resume resume.tex

###############################
# Stage 2: Build (Bun + Astro)
###############################
FROM oven/bun:1.2 AS builder
WORKDIR /app

# Build-time arguments for environment configuration
ARG RAWG_API_KEY

# Install dependencies first for better layer caching.
COPY package.json bun.lock* ./
RUN if [ -f bun.lock ]; then bun install --frozen-lockfile; else bun install; fi

# Copy source, drop in the résumé compiled by the resume stage, and build.
# node_modules/.astro is Astro's image-transform cache — keyed by content hash,
# so unchanged images are skipped instead of reprocessed by sharp every build.
# It's gitignored and normally wiped with the rest of node_modules each build;
# mounting it as a cache persists it across builds on this runner.
COPY . .
COPY --from=resume /resume/resume.pdf public/resume.pdf
RUN --mount=type=cache,target=/app/node_modules/.astro,sharing=locked \
    RAWG_API_KEY=${RAWG_API_KEY} bunx astro build

###############################
# Stage 3: Runtime (nginx)
###############################
FROM nginx:1.27-alpine AS runner

# Static Astro output.
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
