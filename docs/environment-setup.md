# Environment Setup Guide

This document explains how to configure environment variables for local development and CI/CD deployment.

## Required Environment Variables

### RAWG_API_KEY

- **Purpose**: API key for the RAWG Video Game Database API
- **Where to get it**: https://rawg.io/apireference
- **Usage**: 
  - Fetch game data for the hobbies section and other game-related features
  - Available in code as `import.meta.env.RAWG_API_KEY` (Astro) or `process.env.RAWG_API_KEY`

## Local Development

1. Copy the template to create your `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Add your API keys:
   ```bash
   RAWG_API_KEY=your_actual_api_key_here
   ```

3. The environment variables will be automatically loaded by:
   - `astro dev` through `import.meta.env` for server-side code
   - `process.env` for non-Astro callers such as Bun or Node scripts
   - `docker compose` when you run `docker compose up`

## Using RAWG API in Code

Use the provided utility in `src/lib/rawg/client.ts`:

```typescript
import { fetchGameBySlug } from '@/lib/rawg/client';

const game = await fetchGameBySlug('patapon');
```

The utility automatically:
- Adds your API key to all requests
- Reads `import.meta.env.RAWG_API_KEY` in Astro/Vite server code
- Falls back to `process.env.RAWG_API_KEY` in Bun/Node environments
- Validates the API key on build
- Handles errors gracefully

## CI/CD Deployment (GitHub Actions)

The GitHub Actions workflow automatically passes environment variables during deployment:

1. **GitHub Secrets Setup**: 
   - Add `RAWG_API_KEY` to your repository secrets
   - Go to: Settings → Secrets and variables → Actions → New repository secret

2. **Automatic Handling**:
   - The workflow passes `RAWG_API_KEY` from GitHub Secrets to Docker build
   - Docker passes it as a build argument (`RAWG_API_KEY`)
   - Bun receives it during the build stage

## Docker Build Process

When building with Docker:

```bash
# Local build (with .env)
docker compose up -d --build

# Build with specific API key
docker compose build --build-arg RAWG_API_KEY=your_key app
```

The Dockerfile:
- Accepts `RAWG_API_KEY` as a build argument
- Passes it to the `bun run build` step (Astro static generation)
- Does NOT include the key in the final runtime image (security best practice)

## Troubleshooting

### "RAWG_API_KEY environment variable is not set"

- Check that `.env` file exists and has the `RAWG_API_KEY` set
- Restart `astro dev` after creating or changing `.env`
- Ensure `docker compose` is reading the `.env` file
- For GitHub Actions, verify the secret is set in repository settings

### API rate limiting

- Default RAWG API has rate limits based on plan
- Consider caching responses or using pagination
- Check RAWG API docs for current rate limit info

## Security Notes

- Never commit `.env` file to version control
- `.env` is in `.gitignore` by default
- API keys should only be stored in:
  - Local `.env` file (development)
  - GitHub Secrets (CI/CD)
- The build argument approach ensures the key is used during build but not embedded in the final image
