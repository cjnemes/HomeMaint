# HomeMaint Deployment Guide

This guide covers deploying HomeMaint to production and setting up necessary infrastructure.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Sentry Configuration](#sentry-configuration)
4. [Deployment Options](#deployment-options)
5. [Post-Deployment Checklist](#post-deployment-checklist)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

Before deploying, ensure you have:

- Node.js 18.x or later
- npm 9.x or later
- A Sentry account (free tier available at https://sentry.io)
- A hosting provider account (Vercel, Netlify, or self-hosted)

---

## Environment Setup

### 1. Create Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.production
```

### 2. Configure Required Variables

Edit `.env.production` with your production values:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=your-auth-token

# Application Environment
NODE_ENV=production
```

---

## Sentry Configuration

### 1. Create Sentry Project

1. Sign up at https://sentry.io (free tier available)
2. Create a new project
3. Select **Next.js** as the platform
4. Copy your DSN from Settings → Client Keys (DSN)

### 2. Generate Auth Token

1. Go to Settings → Account → Auth Tokens
2. Create a new token with permissions:
   - `project:read`
   - `project:releases`
   - `org:read`
3. Copy the token to `SENTRY_AUTH_TOKEN`

### 3. Configure Organization & Project

- Set `SENTRY_ORG` to your organization slug (found in Settings → General)
- Set `SENTRY_PROJECT` to your project slug (found in Settings → General)

---

## Deployment Options

### Option 1: Vercel (Recommended)

#### Prerequisites

- Vercel account (https://vercel.com)
- Git repository (GitHub, GitLab, or Bitbucket)

#### Steps

1. **Push code to Git repository**

```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

2. **Import to Vercel**

- Go to https://vercel.com/new
- Import your repository
- Configure project settings:
  - Framework Preset: **Next.js**
  - Root Directory: `./`
  - Build Command: `npm run build`
  - Output Directory: `.next`

3. **Add Environment Variables**

In Vercel project settings → Environment Variables, add:

```
NEXT_PUBLIC_SENTRY_DSN=your-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-token
NODE_ENV=production
```

4. **Deploy**

Click "Deploy" and wait for the build to complete.

#### Continuous Deployment

- Every push to `main` automatically deploys to production
- Pull requests create preview deployments

---

### Option 2: Self-Hosted (Docker)

#### Prerequisites

- Docker & Docker Compose installed
- Server with public IP or domain

#### Steps

1. **Create Dockerfile**

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

2. **Create docker-compose.yml**

```yaml
version: '3.8'

services:
  homemaint:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN}
      - SENTRY_ORG=${SENTRY_ORG}
      - SENTRY_PROJECT=${SENTRY_PROJECT}
      - SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}
    restart: unless-stopped
    volumes:
      - ./data:/app/data
```

3. **Deploy**

```bash
docker-compose up -d
```

4. **Setup Reverse Proxy (Nginx)**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. **Setup SSL with Certbot**

```bash
sudo certbot --nginx -d yourdomain.com
```

---

### Option 3: Netlify

#### Steps

1. **Create netlify.toml**

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

2. **Deploy via Netlify CLI**

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

3. **Add Environment Variables**

In Netlify dashboard → Site settings → Environment variables

---

## Post-Deployment Checklist

### 1. Verify Deployment

- [ ] Application loads at production URL
- [ ] All pages render correctly
- [ ] Assets (images, fonts) load properly
- [ ] PWA installs correctly on mobile devices

### 2. Test Core Functionality

- [ ] Create a test asset
- [ ] Upload a photo attachment
- [ ] Create a maintenance record
- [ ] Create a task
- [ ] Export data (CSV and JSON)
- [ ] Verify CSV formula injection protection

### 3. Verify Sentry Integration

- [ ] Trigger a test error (dev tools console)
- [ ] Check Sentry dashboard for error report
- [ ] Verify error details and stack traces
- [ ] Test error boundary displays correctly

### 4. Performance Verification

- [ ] Run Lighthouse audit (target: 90+ performance score)
- [ ] Test on mobile devices
- [ ] Verify offline functionality (PWA)
- [ ] Check initial page load time (< 2s)

### 5. Security Verification

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] CSV exports sanitize formula characters
- [ ] File uploads validate MIME types and size limits
- [ ] SQL injection protection verified

---

## Monitoring & Maintenance

### Daily Checks

1. **Sentry Dashboard**
   - Review new errors
   - Check error frequency trends
   - Monitor performance metrics

2. **Application Health**
   - Verify uptime
   - Check response times
   - Monitor database size

### Weekly Tasks

1. **Review Metrics**
   - User engagement
   - Feature usage
   - Error rates
   - Performance trends

2. **Database Maintenance**
   - Backup database file (data/homemaint.db)
   - Verify auto-recovery mechanism

3. **Dependency Updates**
   ```bash
   npm outdated
   npm audit
   ```

### Monthly Tasks

1. **Security Audit**

   ```bash
   npm audit fix
   ```

2. **Performance Optimization**
   - Review bundle size
   - Analyze Lighthouse reports
   - Optimize slow queries

3. **User Feedback Review**
   - Address user-reported issues
   - Prioritize feature requests

---

## Backup & Recovery

### Database Backup

The SQLite database is located at `data/homemaint.db`. Back it up regularly:

```bash
# Manual backup
cp data/homemaint.db data/backups/homemaint-$(date +%Y%m%d).db

# Automated daily backup (cron)
0 2 * * * cp /path/to/data/homemaint.db /path/to/backups/homemaint-$(date +\%Y\%m\%d).db
```

### Auto-Recovery Feature

HomeMaint includes automatic database recovery:

- If the `homes` table is empty, the app automatically reseeds
- Prevents application crashes from database corruption
- See `app/actions/assets.ts:16-35` for implementation

### Restore from Backup

```bash
# Stop the application
# Replace database with backup
cp data/backups/homemaint-20250101.db data/homemaint.db
# Restart the application
```

---

## Troubleshooting

### Common Issues

#### 1. Sentry Not Receiving Errors

**Check:**

- `NEXT_PUBLIC_SENTRY_DSN` is set correctly
- `NODE_ENV=production` (Sentry is disabled in development)
- Error boundary is functioning (`app/error.tsx`)

**Solution:**

```bash
# Verify environment variables
echo $NEXT_PUBLIC_SENTRY_DSN

# Test Sentry integration
# Trigger a test error in production
```

#### 2. Build Fails

**Check:**

- All dependencies installed: `npm ci`
- TypeScript errors: `npm run type-check`
- ESLint errors: `npm run lint`

**Solution:**

```bash
rm -rf .next node_modules
npm install
npm run build
```

#### 3. Database Issues

**Check:**

- `data/` directory exists and is writable
- SQLite database file permissions
- Disk space available

**Solution:**

```bash
# Reset database (WARNING: deletes all data)
rm data/homemaint.db
# Application will auto-reseed on next start
```

#### 4. Performance Issues

**Check:**

- Sentry performance monitoring
- Database file size (should be < 100MB for MVP)
- Number of attachments (base64 storage can grow quickly)

**Solution:**

- Review long-running queries in Sentry
- Consider implementing attachment cleanup for deleted records
- Monitor database size growth

---

## Staging Environment

### Setup

1. **Create staging branch**

   ```bash
   git checkout -b staging
   ```

2. **Deploy to staging**
   - Vercel: Connect `staging` branch to preview deployment
   - Self-hosted: Deploy to separate server/subdomain

3. **Configure staging Sentry project**
   - Create separate Sentry project for staging
   - Use different DSN to separate staging/production errors

### Testing Workflow

1. Deploy feature to staging
2. Run cross-browser tests (see CROSS_BROWSER_TESTING.md)
3. Verify Sentry error reporting
4. Test on multiple devices
5. Merge to `main` for production deployment

---

## Rollback Procedure

### Vercel

1. Go to project → Deployments
2. Find last known good deployment
3. Click "⋯" → "Promote to Production"

### Self-Hosted

1. **Revert Git commit**

   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Or rollback to specific commit**

   ```bash
   git reset --hard <commit-hash>
   git push --force origin main
   ```

3. **Restore database backup if needed**
   ```bash
   cp data/backups/homemaint-<date>.db data/homemaint.db
   ```

---

## Support & Resources

- **Documentation:** See README.md
- **Cross-Browser Testing:** See CROSS_BROWSER_TESTING.md
- **Issue Tracking:** GitHub Issues
- **Sentry Dashboard:** https://sentry.io/organizations/your-org/projects/
- **Next.js Docs:** https://nextjs.org/docs

---

## Security Contacts

For security vulnerabilities, please email: security@yourdomain.com

**Do not** create public GitHub issues for security vulnerabilities.
