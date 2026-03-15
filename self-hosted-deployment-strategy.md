# Self-Hosted Docker Deployment Strategy

A comprehensive guide to a production-ready, self-hosted deployment architecture using Docker, nginx-proxy with automatic SSL, GitHub Actions, and encrypted environment variables.

## Overview

This deployment strategy provides a secure, automated, and reproducible way to deploy containerized applications to a self-hosted server. It combines several battle-tested technologies to achieve:

- **Zero-downtime deployments** via Docker Compose
- **Automatic SSL certificates** via Let's Encrypt
- **Secure secrets management** via encrypted environment variables
- **CI/CD automation** via GitHub Actions with self-hosted runners
- **Multi-application hosting** on a single server with reverse proxy routing

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              HOST SERVER                                 │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     nginx-proxy Network                          │   │
│  │                                                                  │   │
│  │  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐ │   │
│  │  │ nginx-proxy  │   │ letsencrypt  │   │   Your App Container │ │   │
│  │  │  (jwilder)   │◄──│   companion  │   │                      │ │   │
│  │  │              │   │              │   │  VIRTUAL_HOST=...    │ │   │
│  │  │  Port 80/443 │   │  Auto-SSL    │   │  LETSENCRYPT_HOST=...│ │   │
│  │  └──────┬───────┘   └──────────────┘   └──────────────────────┘ │   │
│  │         │                                         │              │   │
│  └─────────┼─────────────────────────────────────────┼──────────────┘   │
│            │                                         │                   │
│            │ HTTPS                                   │                   │
│  ┌─────────┼─────────────────────────────────────────┼──────────────┐   │
│  │         │           Other Networks                │              │   │
│  │         │                                         ▼              │   │
│  │         │                              ┌──────────────────────┐  │   │
│  │         │                              │  Database Container  │  │   │
│  │         │                              │  (MySQL, Postgres,   │  │   │
│  │         │                              │   Redis, etc.)       │  │   │
│  │         │                              └──────────────────────┘  │   │
│  └─────────┼────────────────────────────────────────────────────────┘   │
│            │                                                             │
│  ┌─────────┼────────────────────────────────────────────────────────┐   │
│  │         │              GitHub Actions Runner                      │   │
│  │         │     (Self-hosted, listens for workflow triggers)        │   │
│  └─────────┼────────────────────────────────────────────────────────┘   │
│            │                                                             │
└────────────┼─────────────────────────────────────────────────────────────┘
             │
             ▼
        ┌─────────┐
        │ Internet│
        │ Traffic │
        └─────────┘
```

## Core Components

### 1. nginx-proxy (Reverse Proxy)

The `jwilder/nginx-proxy` (or `nginxproxy/nginx-proxy`) container automatically discovers Docker containers and configures nginx to route traffic based on the `VIRTUAL_HOST` environment variable.

**Key Features:**

- Automatic virtual host configuration
- WebSocket support
- Custom nginx configurations per-host
- Health check integration

### 2. Let's Encrypt Companion

The `letsencrypt-nginx-proxy-companion` (or `nginxproxy/acme-companion`) container works alongside nginx-proxy to automatically obtain and renew SSL certificates.

**Key Features:**

- Automatic certificate provisioning
- Automatic renewal (before expiration)
- Support for multiple domains
- HTTP-01 challenge handling

### 3. Docker Compose Application Stack

Each application is defined as a Docker Compose stack with:

- Multi-stage Dockerfile for optimized builds
- Environment-based configuration
- Network connectivity to nginx-proxy and databases

### 4. GitHub Actions Self-Hosted Runner

A GitHub Actions runner installed on the host server that:

- Listens for push/PR events
- Has direct access to Docker daemon
- Can read repository secrets
- Executes deployment commands

### 5. Encrypted Environment Variables

Using `@dotenvx/dotenvx` (or similar tools like `sops`, `age`) for:

- Encrypting secrets in the repository
- Decrypting at build/runtime with a private key
- Secure storage of API keys, database credentials, etc.

---

## File Templates

### 1. nginx-proxy Docker Compose (`nginx-proxy/compose.yml`)

This should be deployed once on the server and shared by all applications.

```yaml
services:
  nginx-proxy:
    image: nginxproxy/nginx-proxy:latest
    container_name: nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro
      - certs:/etc/nginx/certs:ro
      - vhost:/etc/nginx/vhost.d
      - html:/usr/share/nginx/html
      - ./conf.d:/etc/nginx/conf.d:ro  # Optional: custom nginx configs
    restart: unless-stopped
    networks:
      - nginx-proxy

  acme-companion:
    image: nginxproxy/acme-companion:latest
    container_name: nginx-proxy-acme
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - certs:/etc/nginx/certs:rw
      - vhost:/etc/nginx/vhost.d
      - html:/usr/share/nginx/html
      - acme:/etc/acme.sh
    environment:
      - DEFAULT_EMAIL=your-email@example.com
    depends_on:
      - nginx-proxy
    restart: unless-stopped
    networks:
      - nginx-proxy

volumes:
  certs:
  vhost:
  html:
  acme:

networks:
  nginx-proxy:
    name: nginx-proxy
    driver: bridge
```

### 2. Application Docker Compose (`compose.yml`)

```yaml
services:
  app:
    container_name: my-app
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - DOTENV_PRIVATE_KEY=${DOTENV_PRIVATE_KEY:?DOTENV_PRIVATE_KEY is required}
    ports:
      - "8080:8080"  # Internal port mapping (optional, for debugging)
    environment:
      # Secrets decryption key (passed at runtime)
      - DOTENV_PRIVATE_KEY=${DOTENV_PRIVATE_KEY:?DOTENV_PRIVATE_KEY is required}
      
      # nginx-proxy configuration
      - VIRTUAL_HOST=app.example.com,www.app.example.com
      - VIRTUAL_PORT=8080  # The port your app listens on inside container
      
      # Let's Encrypt configuration
      - LETSENCRYPT_HOST=app.example.com,www.app.example.com
      - LETSENCRYPT_EMAIL=your-email@example.com  # Optional, overrides default
    restart: unless-stopped
    networks:
      - nginx-proxy
      - app-db  # If connecting to a database

networks:
  nginx-proxy:
    external: true
  app-db:
    external: true  # Or define inline if database is in same stack
```

### 3. Multi-Stage Dockerfile

```dockerfile
###############################
# Stage 1: Dependencies
###############################
FROM node:22-alpine AS deps
WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install all dependencies (including dev for build)
RUN npm ci --force

###############################
# Stage 2: Build
###############################
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Accept build-time secrets
ARG DOTENV_PRIVATE_KEY

# Set build environment
ENV NODE_ENV=production

# Decrypt environment variables (if using dotenvx)
RUN npm run decrypt || true

# Build the application
RUN npm run build

###############################
# Stage 3: Production Dependencies
###############################
FROM node:22-alpine AS prod-deps
WORKDIR /app

COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev --force

###############################
# Stage 4: Runtime
###############################
FROM node:22-alpine AS runner
WORKDIR /app

# Set runtime environment
ENV NODE_ENV=production
ENV PORT=8080

# Copy production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy built application artifacts
COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/.next ./.next          # For Next.js
# COPY --from=builder /app/build ./build          # For React/Vite
COPY --from=builder /app/package.json ./package.json

# Copy additional required files
COPY --from=builder /app/.env ./.env              # Encrypted env file
# COPY --from=builder /app/public ./public        # Static assets

# Expose application port
EXPOSE 8080

# Health check (optional but recommended)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start command
CMD ["node", "dist/index.js"]
```

### 4. GitHub Actions Workflow (`.github/workflows/deploy.yml`)

```yaml
name: Deploy Application

on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]
  workflow_dispatch:  # Allow manual triggers

jobs:
  deploy:
    runs-on: self-hosted

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build and deploy
        env:
          DOTENV_PRIVATE_KEY: ${{ secrets.DOTENV_PRIVATE_KEY }}
        run: docker compose up -d --build --force-recreate
```

### 5. Environment Variables (`.env`)

Using `@dotenvx/dotenvx` for encryption:

```bash
# Install dotenvx globally
npm install -g @dotenvx/dotenvx

# Initialize (generates key pair)
dotenvx init

# Encrypt a value
dotenvx set MY_SECRET "super-secret-value"

# The .env file will contain encrypted values like:
# MY_SECRET=encrypted:BASE64_ENCRYPTED_STRING...

# The private key is stored in .env.keys (add to .gitignore!)
# Store DOTENV_PRIVATE_KEY in GitHub Secrets
```

Example `.env` file:

```ini
#/-------------------[DOTENV_PUBLIC_KEY]--------------------/
#/            public-key encryption for .env files          /
#/----------------------------------------------------------/
DOTENV_PUBLIC_KEY="your-public-key-here"

# Encrypted values
DATABASE_URL=encrypted:...
API_SECRET=encrypted:...
JWT_SECRET=encrypted:...

# Public values (no need to encrypt)
NODE_ENV=production
PORT=8080
```

---

## Server Setup Guide

### Prerequisites

1. **Linux server** (Ubuntu 22.04+ recommended)
2. **Docker** and **Docker Compose** installed
3. **Domain name(s)** pointing to server IP
4. **Open ports** 80 and 443

### Step 1: Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose plugin
sudo apt install docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### Step 2: Deploy nginx-proxy Stack

```bash
# Create directory for nginx-proxy
mkdir -p ~/nginx-proxy
cd ~/nginx-proxy

# Create compose.yml (use template above)
nano compose.yml

# Optional: Create custom nginx configurations
mkdir -p conf.d

# Start nginx-proxy stack
docker compose up -d

# Verify containers are running
docker compose ps
```

### Step 3: Install GitHub Actions Runner

```bash
# Create runner directory
mkdir -p ~/actions-runner && cd ~/actions-runner

# Download latest runner (check GitHub for current version)
curl -o actions-runner-linux-x64.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.XXX.X/actions-runner-linux-x64-2.XXX.X.tar.gz

# Extract
tar xzf actions-runner-linux-x64.tar.gz

# Configure (get token from: Settings > Actions > Runners > New self-hosted runner)
./config.sh --url https://github.com/YOUR-ORG/YOUR-REPO --token YOUR-TOKEN

# Install as service
sudo ./svc.sh install
sudo ./svc.sh start

# Verify status
sudo ./svc.sh status
```

### Step 4: Configure GitHub Secrets

In your repository: **Settings > Secrets and variables > Actions**

Add the following secrets:

- `DOTENV_PRIVATE_KEY`: Your dotenvx private key (from `.env.keys`)

### Step 5: Create Database Network (if needed)

```bash
# Create external network for database
docker network create myapp-db

# Deploy database (example with MySQL)
docker run -d \
  --name mysql \
  --network myapp-db \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=myapp \
  -v mysql-data:/var/lib/mysql \
  --restart unless-stopped \
  mysql:8
```

---

## Deployment Flow

```
┌──────────────┐     ┌───────────────┐     ┌──────────────────────────┐
│  Developer   │     │    GitHub     │     │      Host Server         │
│  pushes to   │────▶│   receives    │────▶│  Self-hosted runner      │
│  main branch │     │   webhook     │     │  picks up job            │
└──────────────┘     └───────────────┘     └──────────────────────────┘
                                                      │
                                                      ▼
                                           ┌──────────────────────────┐
                                           │ 1. Checkout repository   │
                                           │ 2. docker compose build  │
                                           │    (multi-stage)         │
                                           │ 3. docker compose up -d  │
                                           │    --force-recreate      │
                                           └──────────────────────────┘
                                                      │
                                                      ▼
                                           ┌──────────────────────────┐
                                           │ nginx-proxy detects new  │
                                           │ container, updates       │
                                           │ routing configuration    │
                                           └──────────────────────────┘
                                                      │
                                                      ▼
                                           ┌──────────────────────────┐
                                           │ acme-companion obtains/  │
                                           │ renews SSL certificate   │
                                           │ if needed                │
                                           └──────────────────────────┘
                                                      │
                                                      ▼
                                           ┌──────────────────────────┐
                                           │ App is live at           │
                                           │ https://app.example.com  │
                                           └──────────────────────────┘
```

---

## Advanced Configurations

### Custom nginx Configuration per Host

Create a file in `nginx-proxy/vhost.d/` named after your virtual host:

```nginx
# nginx-proxy/vhost.d/app.example.com
client_max_body_size 100m;

# Custom headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;

# WebSocket support (if needed)
location /ws {
    proxy_pass http://upstream;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### Custom nginx Location Blocks

Create a file in `nginx-proxy/vhost.d/` with `_location` suffix:

```nginx
# nginx-proxy/vhost.d/app.example.com_location
# This content is added to the location / block

proxy_read_timeout 300s;
proxy_connect_timeout 75s;
```

### Multiple Applications Example

```
~/deployments/
├── nginx-proxy/
│   └── compose.yml           # Shared nginx-proxy stack
├── app1/
│   ├── compose.yml           # App 1 stack
│   ├── Dockerfile
│   └── ...
├── app2/
│   ├── compose.yml           # App 2 stack
│   ├── Dockerfile
│   └── ...
└── databases/
    └── compose.yml           # Shared database stack
```

### Health Checks

Always include health checks in your Dockerfile:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1
```

And implement a health endpoint in your application:

```javascript
// Express.js example
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});
```

### Rollback Strategy

If a deployment fails, you can quickly rollback:

```bash
# View available images
docker images | grep my-app

# Rollback to previous image
docker compose down
docker tag my-app:previous my-app:latest
docker compose up -d
```

Or use image tags:

```yaml
# In compose.yml, specify a version tag
services:
  app:
    image: my-app:v1.2.3
```

---

## Security Considerations

### 1. Secrets Management

- **Never** commit unencrypted secrets to the repository
- Use encrypted environment variables (dotenvx, sops, etc.)
- Store private keys in GitHub Secrets or a secrets manager
- Rotate secrets periodically

### 2. Network Security

- Keep database networks internal (not exposed via nginx-proxy)
- Use Docker networks for inter-container communication
- Don't expose unnecessary ports to the host

### 3. Container Security

- Use specific image tags (not `latest` in production)
- Run containers as non-root users when possible
- Keep base images updated
- Scan images for vulnerabilities

### 4. Server Security

- Keep the server updated
- Use SSH key authentication (disable password auth)
- Configure firewall (ufw/iptables)
- Regular backups

---

## Troubleshooting

### Common Issues

**1. SSL certificate not being issued**

```bash
# Check acme-companion logs
docker logs nginx-proxy-acme

# Verify domain DNS is pointing to server
dig app.example.com

# Check if port 80 is accessible (needed for HTTP-01 challenge)
curl http://app.example.com/.well-known/acme-challenge/test
```

**2. Container not being picked up by nginx-proxy**

```bash
# Verify container is on the nginx-proxy network
docker network inspect nginx-proxy

# Check VIRTUAL_HOST is set
docker inspect my-app | grep VIRTUAL_HOST

# Check nginx-proxy logs
docker logs nginx-proxy
```

**3. Database connection issues**

```bash
# Verify containers are on the same network
docker network inspect myapp-db

# Test connection from app container
docker exec -it my-app ping database-container-name
```

**4. GitHub Actions runner not picking up jobs**

```bash
# Check runner status
cd ~/actions-runner
sudo ./svc.sh status

# Restart runner
sudo ./svc.sh stop
sudo ./svc.sh start

# Check logs
tail -f ~/actions-runner/_diag/*.log
```

---

## Dockerfile Examples by Framework

### Next.js

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG DOTENV_PRIVATE_KEY
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

### Vite/React (Static)

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Python/FastAPI

```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim AS runner
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY . .
ENV PORT=8000
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Go

```dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

FROM alpine:latest AS runner
WORKDIR /app
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]
```

---

## Quick Reference

### Commands Cheat Sheet

```bash
# Deploy/Update application
docker compose up -d --build --force-recreate

# View logs
docker compose logs -f

# Stop application
docker compose down

# Remove with volumes (careful!)
docker compose down -v

# Restart nginx-proxy
cd ~/nginx-proxy && docker compose restart

# Force SSL certificate renewal
docker exec nginx-proxy-acme /app/signal_le_service

# Prune unused Docker resources
docker system prune -af
```

### Environment Variables Reference

| Variable             | Required         | Description                           |
| -------------------- | ---------------- | ------------------------------------- |
| `VIRTUAL_HOST`       | Yes              | Domain(s) for nginx-proxy routing     |
| `VIRTUAL_PORT`       | No               | Port app listens on (default: 80)     |
| `LETSENCRYPT_HOST`   | Yes              | Domain(s) for SSL certificates        |
| `LETSENCRYPT_EMAIL`  | No               | Email for Let's Encrypt notifications |
| `DOTENV_PRIVATE_KEY` | If using dotenvx | Key to decrypt .env file              |

---

## Summary

This deployment strategy provides:

✅ **Simplicity** - Single `docker compose up` command to deploy  
✅ **Security** - Encrypted secrets, automatic SSL, isolated networks  
✅ **Automation** - Push to main branch triggers deployment  
✅ **Scalability** - Easy to add more applications to the same server  
✅ **Reliability** - Health checks, restart policies, rollback capability  
✅ **Cost-effective** - Self-hosted, no expensive managed services  

By following this guide, you can deploy any containerized application with minimal configuration changes.
