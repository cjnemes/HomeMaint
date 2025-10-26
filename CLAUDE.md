# HomeMaint - AI Development Guidelines

This document provides guidance for AI assistants working on the HomeMaint project.

## Project Overview

**HomeMaint** is a comprehensive home maintenance and asset tracking application helping homeowners manage their home systems, appliances, and maintenance records.

**Current Status:** MVP Complete, Production-Ready (15K+ LOC)
**Tech Stack:** Next.js 14, TypeScript, SQLite, better-sqlite3, Vitest, Playwright
**Deployment:** Progressive Web App (PWA) on Vercel

## Architecture

### Pattern: Repository Pattern + Server Actions

**Decision Date:** October 2025
**Validation Date:** October 26, 2025
**Status:** ✅ VALIDATED - Optimal for project requirements

**Rationale:**

- **Complex data access**: 9 repositories managing interrelated tables (assets, maintenance records, tasks, providers, attachments, etc.)
- **Single database**: SQLite (local-first), future PostgreSQL migration planned
- **High testability required**: 85%+ coverage target enables autonomous AI development
- **Evidence**: This pattern historically enabled 30+ autonomous AI PRs with zero regressions

**Pattern Rules:**

1. **All database access goes through repositories** (`lib/db/repositories/`)
2. **Server actions use repositories only** (`app/actions/`)
3. **Components NEVER access database directly**
4. **New tables require new repository** extending `BaseRepository<T, CreateT, UpdateT>`

### Directory Structure

```
HomeMaint/
├── app/
│   ├── actions/          # Server Actions (thin wrappers around repositories)
│   │   ├── assets.ts
│   │   ├── maintenance.ts
│   │   ├── tasks.ts
│   │   └── ...
│   ├── api/              # Minimal API routes (only test endpoint)
│   └── (pages)/          # Next.js App Router pages
├── lib/
│   ├── db/
│   │   ├── repositories/ # Repository Pattern implementation
│   │   │   ├── base.repository.ts      # Abstract base for all repos
│   │   │   ├── asset.repository.ts
│   │   │   ├── maintenance-record.repository.ts
│   │   │   └── ...
│   │   ├── database.ts   # Database singleton with migrations
│   │   ├── backup.ts     # Backup service (VACUUM INTO)
│   │   ├── maintenance.ts # Database optimization
│   │   └── seed.ts       # Initial data seeding
│   ├── storage/
│   │   └── file-storage.ts # Filesystem-based attachment storage
│   └── validation/
│       └── schemas.ts    # Zod schemas for validation
├── components/           # React components (never access DB)
├── tests/                # Test files (mirror source structure)
└── docs/                 # Project documentation
```

### Why NOT Other Patterns?

**Provider Pattern:** ❌ Not needed

- Provider Pattern is for 4+ data sources (multiple APIs, blockchains, etc.)
- HomeMaint has single data source (SQLite)
- Adding Provider Pattern would be over-engineering

**Three-Layer Architecture:** ❌ Not needed

- Three-Layer is for cross-platform code reuse (Python → Swift, etc.)
- HomeMaint uses PWA (single codebase runs on web, iOS, Android, desktop)
- No platform abstraction needed

**Framework MVC Only:** ❌ Insufficient

- Framework MVC works for simple CRUD (< 5 tables)
- HomeMaint has complex data access (9 repositories, complex relationships)
- Repository Pattern provides necessary abstraction

## Testing Strategy

### Coverage Targets

**Overall Minimum:** 85%
**By Layer:**

- Core Business Logic: 90%+
- Data Access (Repositories): 85%+
- API (Server Actions): 80%+
- UI Components: 70%+

**Why 85% Coverage:**

> "85%+ test coverage enabled 30+ autonomous AI PRs with zero regressions"

Without 85% coverage, HomeMaint loses its ability to support autonomous AI development.

### Testing Approach

**Unit Tests** (lib/, repositories)

```typescript
// Use vitest for unit tests
import { describe, it, expect } from 'vitest';
import { AssetRepository } from '@/lib/db/repositories/asset.repository';

describe('AssetRepository', () => {
  it('should find assets by home ID', () => {
    // Test implementation
  });
});
```

**Integration Tests** (Server Actions)

```typescript
// Mock repositories in server action tests
import { vi } from 'vitest';
import * as assetRepo from '@/lib/db/repositories/asset.repository';

vi.mock('@/lib/db/repositories/asset.repository');
```

**E2E Tests** (Critical user flows)

```typescript
// Use Playwright for E2E tests
import { test, expect } from '@playwright/test';

test('should create new asset', async ({ page }) => {
  // E2E test implementation
});
```

### Test Commands

```bash
# Run all tests
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test

# Run E2E tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

## Code Quality Standards

### Anti-Patterns to Avoid

**✅ CURRENT STATUS: Zero anti-patterns detected (validated Oct 26, 2025)**

1. **No Float for Money** ✅
   - HomeMaint doesn't handle financial transactions
   - If adding pricing features: Use `Decimal` type, not `number`

2. **No Hardcoded Secrets** ✅
   - All configuration via environment variables
   - Never commit `.env.local` files

3. **No Direct Database Access** ✅
   - All DB access through repositories
   - Server Actions use repositories only
   - Components never call `db.prepare()` or `db.exec()`

4. **No Missing Error Handling** ✅
   - All catch blocks log context
   - Errors include actionable information
   - No silent failures

5. **No N+1 Queries** ✅
   - Batch queries where possible
   - Use JOINs for related data
   - Never query inside loops

### Coding Conventions

**TypeScript:**

- Strict mode enabled
- No `any` types (use proper types or `unknown`)
- Prefer interfaces over types for objects
- Use Zod schemas for runtime validation

**Naming:**

- Components: `PascalCase` (e.g., `AssetList.tsx`)
- Functions/variables: `camelCase` (e.g., `getAssets`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`)
- Files: `kebab-case.tsx` or `kebab-case.ts`

**Server Actions:**

- Mark with `'use server'` directive
- Validate inputs with Zod schemas
- Use repositories for data access
- Return plain objects (no class instances)
- Call `revalidatePath()` after mutations

## Database

### Schema Management

**Migrations:**

- Located in `lib/db/database.ts` (`migrations` array)
- Sequential numbering: `001_initial_schema.sql`, `002_filesystem_storage.sql`
- Idempotent: Check if changes exist before applying
- Never modify existing migrations (create new ones)

**Adding New Table:**

1. Create migration in `lib/db/database.ts`:

```typescript
{
  name: '003_new_feature',
  up: (db: Database.Database) => {
    // Check if table exists
    const tables = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name='new_table'
    `).all()

    if (tables.length === 0) {
      db.exec(`
        CREATE TABLE new_table (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `)
    }
    console.log('Migration 003: Created new_table')
  }
}
```

2. Create repository in `lib/db/repositories/new-feature.repository.ts`:

```typescript
export class NewFeatureRepository extends BaseRepository<
  NewFeature,
  CreateNewFeature,
  UpdateNewFeature
> {
  constructor() {
    super('new_table');
  }

  create(data: CreateNewFeature): NewFeature {
    // Implementation
  }

  update(id: number, data: Partial<UpdateNewFeature>): NewFeature | undefined {
    // Implementation
  }
}

export const newFeatureRepository = new NewFeatureRepository();
```

3. Export from `lib/db/repositories/index.ts`:

```typescript
export * from './new-feature.repository';
```

4. Create server actions in `app/actions/new-feature.ts`:

```typescript
'use server';

import { newFeatureRepository } from '@/lib/db/repositories';

export async function getNewFeatures() {
  return newFeatureRepository.findAll();
}
```

5. Add tests in `tests/lib/db/repositories/new-feature.repository.test.ts`

### Backup & Maintenance

**Automated Backup:**

```typescript
import { backupService } from '@/lib/db/backup';

// Create backup
const backup = await backupService.createBackup();

// List backups
const backups = await backupService.listBackups();

// Restore backup
await backupService.restoreBackup(backupPath);
```

**Database Optimization:**

```typescript
import { databaseMaintenance } from '@/lib/db/maintenance';

// Full optimization (ANALYZE + VACUUM + PRAGMA optimize)
await databaseMaintenance.optimizeFull();

// Quick optimization (ANALYZE only)
await databaseMaintenance.optimizeQuick();

// Check integrity
const result = await databaseMaintenance.checkIntegrity();
```

## File Storage

**Filesystem-based Attachments:**

- Files stored in `uploads/` directory
- Organized by year/month: `uploads/2025/10/hash.ext`
- Hash-based deduplication (SHA-256)
- Max file size: 50MB
- Path traversal protection enabled

**Usage:**

```typescript
import { fileStorage } from '@/lib/storage/file-storage';

// Store file
const result = await fileStorage.storeFile(buffer, 'application/pdf', 'manual.pdf');

// Retrieve file
const file = await fileStorage.getFile(result.relativePath);

// Delete file
await fileStorage.deleteFile(result.relativePath);
```

## Development Workflow

### Before Starting Work

1. Pull latest changes: `git pull origin main`
2. Install dependencies: `npm install`
3. Run type check: `npm run type-check`
4. Run tests: `npm run test:run`

### During Development

1. **Write tests first** (TDD approach)
2. Implement feature using Repository Pattern
3. Run tests: `npm run test`
4. Check coverage: `npm run test:coverage`
5. Run linter: `npm run lint`

### Before Committing

Pre-commit hooks automatically run:

- ESLint (auto-fix)
- Prettier (auto-format)
- Type check

**Manual checks:**

```bash
npm run type-check
npm run test:run
npm run test:coverage  # Ensure coverage doesn't drop
```

### Creating Pull Request

1. Ensure all tests pass
2. Verify test coverage ≥ 85% overall
3. Run production build: `npm run build`
4. Write clear PR description
5. Reference related issues

## Common Tasks

### Adding a New Feature

1. **Plan architecture**
   - Does it need a new table? → Create migration + repository
   - Does it modify existing data? → Update existing repository
   - Does it need UI? → Create component + server action

2. **Implement with TDD**
   - Write test first (what should it do?)
   - Implement minimum code to pass test
   - Refactor for clarity
   - Add edge case tests

3. **Follow pattern**
   - Database access → Repository
   - Business logic → Server Action
   - UI logic → Component
   - Validation → Zod schema

### Debugging

**Database Issues:**

```bash
# Test database connection
curl http://localhost:3000/api/db/test

# Check database file
sqlite3 homemaint.db ".tables"
sqlite3 homemaint.db ".schema assets"
```

**Test Failures:**

```bash
# Run specific test file
npx vitest run tests/path/to/test.test.ts

# Run with debugging
npx vitest run --reporter=verbose

# Check test coverage for specific file
npx vitest run --coverage path/to/file.ts
```

### Performance Optimization

**N+1 Query Prevention:**

```typescript
// ❌ BAD: N+1 query
const assets = await assetRepository.findAll();
for (const asset of assets) {
  const records = await maintenanceRepository.findByAsset(asset.id); // N queries!
}

// ✅ GOOD: Batch query
const assets = await assetRepository.findAll();
const assetIds = assets.map((a) => a.id);
const records = await maintenanceRepository.findByAssetIds(assetIds); // 1 query
const recordMap = groupBy(records, 'assetId');
```

**Bundle Size:**

- Use dynamic imports for large components
- Tree-shake unused dependencies
- Keep initial bundle < 500KB

## Environment Variables

Required environment variables (see `.env.example`):

```bash
# Database
DATABASE_PATH=./homemaint.db

# Sentry (Error Tracking)
SENTRY_DSN=your_sentry_dsn_here
NEXT_PUBLIC_SENTRY_DSN=your_public_sentry_dsn_here

# PWA
NEXT_PUBLIC_APP_NAME=HomeMaint
NEXT_PUBLIC_APP_SHORT_NAME=HomeMaint
```

## Deployment

**Platform:** Vercel
**Build Command:** `npm run build`
**Output Directory:** `.next`

**Environment Setup:**

1. Configure environment variables in Vercel dashboard
2. Set `DATABASE_PATH` to persistent storage location
3. Configure Sentry DSN for error tracking

**Post-Deployment Checks:**

- [ ] Database migrations run successfully
- [ ] PWA manifest loads correctly
- [ ] Service worker registers
- [ ] All pages render without errors
- [ ] Test endpoint responds: `/api/db/test`

## Troubleshooting

### Common Issues

**"Database is locked"**

- Cause: Multiple processes accessing SQLite
- Solution: Ensure only one process writes at a time
- Check: No orphaned Node processes (`ps aux | grep node`)

**"Migration already applied"**

- Cause: Migration tracking table out of sync
- Solution: Migrations are now idempotent (check before applying)

**"Module not found"**

- Cause: Path alias misconfigured
- Solution: Check `tsconfig.json` paths and `@/` alias

**Tests fail in CI but pass locally**

- Cause: Different Node versions or missing dependencies
- Solution: Match Node version in CI (see `.nvmrc` or `package.json#engines`)

## Project Goals

**Mission:** Help homeowners maintain their homes effectively by tracking assets, maintenance, and service providers in one organized place.

**Success Metrics:**

- ✅ 85%+ test coverage (enables autonomous AI development)
- ✅ Zero anti-patterns
- ✅ Production-ready MVP
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ PWA with offline support

**Future Roadmap:**

- Multi-home support
- Recurring task automation
- Maintenance cost tracking
- Warranty expiration alerts
- Service provider ratings

## References

**Internal Documentation:**

- [Product Requirements](docs/PRD.md)
- [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)
- [Data Model](docs/DATA_MODEL.md)
- [MVP Progress](docs/MVP_PROGRESS_ASSESSMENT.md)

**External Resources:**

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [better-sqlite3 API](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)
- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev)

## Last Updated

**Date:** October 26, 2025
**Status:** MVP Complete, Production-Ready
**Coverage:** 35.58% (Target: 85% - improvement in progress)
**Anti-Patterns:** 0 detected
**Architecture:** ✅ Validated (Repository Pattern optimal)
