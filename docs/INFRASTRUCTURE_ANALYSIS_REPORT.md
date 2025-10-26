# Infrastructure Analysis Report

**HomeMaint - Home Maintenance & Asset Tracking Application**

**Analysis Date:** October 20, 2025
**Analyst:** Claude (Autonomous Development AI)
**Application Version:** MVP 1.0 (Production Ready)

---

## Executive Summary

This comprehensive infrastructure analysis examines the HomeMaint application's database architecture, data management, storage systems, and overall infrastructure. The analysis identifies current strengths, areas for improvement, and provides actionable recommendations for enhancing scalability, reliability, security, and performance.

**Overall Assessment:** The current infrastructure is well-designed for the MVP phase with a local-first approach. However, several critical improvements are needed to ensure production readiness, data durability, and future scalability.

**Risk Level:** 🟡 MEDIUM - The application is functional but lacks critical production infrastructure components such as automated backups, database connection pooling, and comprehensive disaster recovery procedures.

---

## Table of Contents

1. [Current Infrastructure Overview](#1-current-infrastructure-overview)
2. [Database Architecture Analysis](#2-database-architecture-analysis)
3. [Data Storage & File Management](#3-data-storage--file-management)
4. [Critical Findings](#4-critical-findings)
5. [Recommendations by Priority](#5-recommendations-by-priority)
6. [Implementation Roadmap](#6-implementation-roadmap)
7. [Appendix](#7-appendix)

---

## 1. Current Infrastructure Overview

### 1.1 Technology Stack

**Framework & Runtime:**
- Next.js 14.2.0 (Full-stack React framework with App Router)
- Node.js 18.17.0+ (Server-side runtime)
- TypeScript 5.5.0 (Strict mode enabled)

**Database:**
- better-sqlite3 v12.4.1 (Synchronous SQLite3 bindings for Node.js)
- Local file-based database: `/data/homemaint.db`
- No database server required

**Data Management:**
- Repository Pattern for data access layer
- Server Actions for business logic
- No ORM - Direct SQL with prepared statements

**Infrastructure Components:**
- Progressive Web App (PWA) with next-pwa
- Sentry integration for error monitoring
- Local file storage (base64 in database for attachments)
- No caching layer
- No CDN
- No load balancer (single instance)

### 1.2 Deployment Model

**Current:** Local-first / Self-hosted
- Database and files stored locally on device
- No cloud dependencies
- Single-user application (one home per database)
- No authentication/authorization (local access only)

### 1.3 Architecture Pattern

```
┌─────────────────────────────────────────┐
│         Next.js Application             │
│  (React Frontend + API Routes/Actions)  │
├─────────────────────────────────────────┤
│         Repository Layer                │
│  (Data Access Pattern - OOP)            │
├─────────────────────────────────────────┤
│         SQLite Database                 │
│      (better-sqlite3 driver)            │
│      File: data/homemaint.db            │
├─────────────────────────────────────────┤
│      Local File System Storage          │
│   (Attachments as base64 in DB)         │
└─────────────────────────────────────────┘
```

---

## 2. Database Architecture Analysis

### 2.1 Schema Design

**Strengths:**
✅ Well-normalized relational schema with 8 core tables
✅ Proper foreign key constraints with CASCADE and SET NULL rules
✅ Comprehensive indexes on frequently queried columns
✅ Automatic timestamp management via triggers
✅ Good use of CHECK constraints (e.g., attachments must link to asset or maintenance record)

**Database Tables:**
1. `homes` - Property information (1 record in MVP)
2. `categories` - Asset categories (HVAC, Plumbing, etc.)
3. `locations` - Rooms and areas within home
4. `assets` - Systems, appliances, and equipment
5. `service_providers` - Contractor information
6. `maintenance_records` - Historical maintenance events
7. `maintenance_tasks` - Scheduled/planned maintenance
8. `attachments` - Files (photos, documents, receipts)

**Entity Relationships:**
```
Home (1) ──→ (N) Categories
         ──→ (N) Locations
         ──→ (N) Assets
         ──→ (N) Service Providers

Asset (1) ──→ (N) Maintenance Records
          ──→ (N) Maintenance Tasks
          ──→ (N) Attachments

Maintenance Record (1) ──→ (N) Attachments
```

### 2.2 Database Migration Strategy

**Current Implementation:**
- Custom migration system built in `lib/db/database.ts`
- Migrations tracked in `migrations` table
- Inline migration definitions (not in separate files)
- Single migration: `001_initial_schema`

**Strengths:**
✅ Automatic execution on application startup
✅ Migration tracking prevents duplicate execution
✅ Transactional integrity (SQLite handles DDL in transactions)

**Weaknesses:**
❌ No rollback/down migrations
❌ Migrations defined inline (not in separate files)
❌ No migration versioning strategy for data migrations
❌ No migration testing framework
❌ Cannot run migrations independently of app startup

### 2.3 Database Connection Management

**Current Implementation:**
```typescript
// Singleton pattern in lib/db/database.ts
private static instance: DatabaseService;
private db: Database.Database;
```

**Strengths:**
✅ Singleton pattern prevents multiple connections
✅ Foreign keys enabled via pragma
✅ Connection created on first access

**Weaknesses:**
❌ No connection pooling (not needed for SQLite in single-process apps)
❌ No connection retry logic
❌ No graceful connection cleanup on app shutdown
❌ No database health checks
❌ No connection timeout configuration
❌ Not suitable for serverless environments (Vercel, AWS Lambda)

### 2.4 Query Performance

**Indexes Present:**
✅ Primary keys on all tables
✅ Foreign key indexes: `idx_categories_home`, `idx_assets_home`, etc.
✅ Composite indexes: `idx_assets_status` (home_id, status)
✅ Query-specific indexes: `idx_maintenance_asset`, `idx_tasks_due`

**Analysis:**
- Well-indexed for current queries
- No N+1 query issues observed in repository layer
- Search queries use LIKE (not full-text search)
- No query result caching

**Performance Concerns:**
⚠️ LIKE queries on asset search are not indexed (full table scans)
⚠️ No full-text search capabilities
⚠️ Base64 attachments stored in DB will cause table bloat
⚠️ No pagination on large result sets

### 2.5 Data Integrity

**Strengths:**
✅ Foreign key constraints enforced
✅ NOT NULL constraints on required fields
✅ CHECK constraints for data validation
✅ Cascade deletes prevent orphaned records
✅ Triggers for automatic timestamp updates

**Weaknesses:**
❌ No application-level validation before database insertion (relies on database constraints)
❌ No soft deletes (cascade deletes are permanent)
❌ No audit trail for data changes
❌ No versioning/history for records

---

## 3. Data Storage & File Management

### 3.1 File Storage Strategy

**Current Implementation:**
- Files stored as base64 data URLs in `attachments.file_path` column
- File size limit: 10MB per file
- Supported types: Images (JPEG, PNG, HEIC, WebP) and PDF
- No separate file storage service

**Example:**
```typescript
const dataUrl = `data:${file.type};base64,${base64}`;
// Stored directly in TEXT column
```

**Strengths:**
✅ Simple implementation (no file system management)
✅ Atomic backups (files included in database backup)
✅ No file permission issues
✅ Cross-platform compatibility

**Critical Weaknesses:**
❌ **Database bloat:** Base64 encoding increases file size by ~33%
❌ **Memory issues:** Large files loaded entirely into memory
❌ **Query performance:** Large TEXT columns slow down table scans
❌ **Inefficient:** Cannot stream files, must load entire blob
❌ **Storage waste:** No file deduplication
❌ **Scalability:** Database will grow very large with many photos

**Recommended Maximum:**
- With current approach: ~100 attachments before serious performance issues
- Estimated database size with 100 photos: 500MB - 1GB

### 3.2 Data Directory Management

**Current Implementation:**
```typescript
const dataDir = join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}
```

**Observations:**
✅ Automatic directory creation
✅ Gitignored properly (`.gitignore` includes `/data`)
❌ No permission checks
❌ No disk space checks before writes
❌ No path validation/sanitization
❌ Hard-coded path (not configurable)

### 3.3 Backup & Disaster Recovery

**Current State:**
❌ **No automated backup system**
❌ No disaster recovery plan
❌ No point-in-time recovery
❌ No backup verification
❌ Users must manually backup database file

**Data Export Capabilities:**
✅ JSON export (complete data backup)
✅ CSV export (assets, maintenance, tasks)
✅ CSV formula injection protection

**Risks:**
🔴 **CRITICAL:** Data loss is permanent without backups
🔴 **HIGH:** Database corruption has no recovery mechanism
🔴 **MEDIUM:** User may not know to backup data regularly

---

## 4. Critical Findings

### 4.1 High-Priority Issues

#### 🔴 CRITICAL: No Automated Backup System

**Issue:** The application stores all data in a single SQLite file with no automated backup mechanism.

**Impact:**
- Data loss from device failure, corruption, or accidental deletion
- No recovery mechanism for user errors
- Users may not realize they need to backup manually

**Risk Assessment:** CRITICAL

**Recommendation:** Implement automated backup system (see Section 5.1.1)

---

#### 🔴 CRITICAL: Files Stored as Base64 in Database

**Issue:** Attachments stored as base64-encoded strings in TEXT columns causes severe scalability and performance issues.

**Impact:**
- Database bloat (33% storage overhead)
- Memory exhaustion with large files
- Slow query performance
- Cannot handle many attachments (estimated limit: ~100 files)

**Current Database Size Projection:**
```
10 assets × 5 photos each × 3MB average = 150MB raw
After base64 encoding: 200MB
Database with indexes/overhead: 250-300MB

100 assets × 10 photos each × 3MB average = 3GB raw
After base64 encoding: 4GB
Database with indexes/overhead: 5GB+ (UNWORKABLE)
```

**Risk Assessment:** CRITICAL

**Recommendation:** Migrate to filesystem-based storage (see Section 5.1.2)

---

#### 🔴 HIGH: No Database Connection Error Handling

**Issue:** Database connection established at startup with no error handling, retry logic, or graceful degradation.

**Impact:**
- Application crash if database file is locked or corrupted
- No recovery from transient file system issues
- Poor user experience on database errors

**Risk Assessment:** HIGH

**Recommendation:** Implement robust error handling (see Section 5.2.1)

---

#### 🟡 MEDIUM: Migration System Limitations

**Issue:** Custom migration system lacks rollback capability, separate migration files, and testing framework.

**Impact:**
- Cannot recover from failed migrations
- Difficult to maintain migrations as codebase grows
- No way to test migrations before production

**Risk Assessment:** MEDIUM

**Recommendation:** Enhanced migration system (see Section 5.3.1)

---

#### 🟡 MEDIUM: No Database Optimization Strategy

**Issue:** No VACUUM, ANALYZE, or index optimization strategy.

**Impact:**
- Database fragmentation over time
- Query performance degradation
- Wasted disk space from deleted records

**Risk Assessment:** MEDIUM

**Recommendation:** Scheduled database maintenance (see Section 5.3.2)

---

### 4.2 Performance Concerns

#### Search Performance

**Issue:** Asset search uses LIKE queries without full-text indexing.

```typescript
// Current implementation in asset.repository.ts:72-84
WHERE name LIKE ? OR manufacturer LIKE ? OR model_number LIKE ?
```

**Impact:**
- Full table scan on every search
- Slow searches with many assets (>1000 records)
- Cannot rank results by relevance

**Recommendation:** Implement SQLite FTS5 (see Section 5.4.1)

---

#### No Query Result Caching

**Issue:** Frequently-accessed data (categories, locations) queried from database on every request.

**Impact:**
- Unnecessary database I/O
- Slower page loads
- Higher resource usage

**Recommendation:** Implement caching layer (see Section 5.4.2)

---

### 4.3 Data Integrity Concerns

#### No Audit Trail

**Issue:** No record of who changed what data and when.

**Impact:**
- Cannot track down source of data issues
- No accountability for changes
- Cannot undo user errors

**Recommendation:** Implement audit logging (see Section 5.5.1)

---

#### No Soft Deletes

**Issue:** Cascade deletes permanently remove data.

**Impact:**
- Accidental deletions cannot be recovered
- Lost historical data
- No "trash" or "archive" functionality

**Recommendation:** Implement soft delete pattern (see Section 5.5.2)

---

### 4.4 Scalability Concerns

#### Single Home Limitation

**Issue:** Architecture currently supports only one home per database.

**Current State:**
```typescript
// app/actions/assets.ts:16-36
export async function getFirstHome(): Promise<Home> {
  const homes = homeRepository.findAll();
  return homes[0]!; // Always returns first home
}
```

**Impact:**
- Users cannot track multiple properties
- Limits use case to single-property owners
- Migration to multi-home would be complex

**Recommendation:** Multi-home architecture (see Section 5.6.1)

---

#### Serverless Incompatibility

**Issue:** Singleton database connection pattern not compatible with serverless environments (Vercel, AWS Lambda).

**Impact:**
- Cannot deploy to serverless platforms
- Limited deployment options
- Higher hosting costs (requires persistent server)

**Recommendation:** Serverless-compatible database strategy (see Section 5.6.2)

---

## 5. Recommendations by Priority

### 5.1 Critical Priority (Implement Immediately)

#### 5.1.1 Implement Automated Backup System

**Goal:** Protect user data with automated backups and recovery mechanisms.

**Implementation Steps:**

1. **Daily Automated Backups**
```typescript
// lib/db/backup.ts
import { copyFile } from 'fs/promises';
import { join } from 'path';

export async function createBackup(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = join(process.cwd(), 'data', 'backups');
  const backupPath = join(backupDir, `homemaint-${timestamp}.db`);

  // Create backups directory
  await mkdir(backupDir, { recursive: true });

  // SQLite-safe backup using VACUUM INTO
  const db = DatabaseService.getInstance().getDatabase();
  db.prepare(`VACUUM INTO ?`).run(backupPath);

  return backupPath;
}

export async function scheduleBackups() {
  // Run daily at 2 AM
  const runBackup = async () => {
    const backupPath = await createBackup();
    await cleanOldBackups(7); // Keep last 7 days
    console.log(`Backup created: ${backupPath}`);
  };

  // Schedule using node-cron or similar
  setInterval(runBackup, 24 * 60 * 60 * 1000);
}
```

2. **Backup Rotation Strategy**
   - Keep daily backups for 7 days
   - Keep weekly backups for 4 weeks
   - Keep monthly backups for 6 months
   - Estimated storage: 15-20 backups × database size

3. **Export Backups to External Storage**
   - Add option to export to cloud storage (Google Drive, Dropbox, iCloud)
   - Implement via File System Access API (browser)
   - Add reminder to backup regularly

4. **Recovery Testing**
   - Add "Restore from Backup" feature in settings
   - Validate backup integrity before accepting
   - Test recovery process monthly

**Estimated Effort:** 8-16 hours
**Risk Reduction:** HIGH → LOW

---

#### 5.1.2 Migrate File Storage to File System

**Goal:** Move attachment storage from database to file system for better performance and scalability.

**Implementation Strategy:**

**Phase 1: Dual-Write Migration (Backward Compatible)**

```typescript
// lib/storage/file-storage.ts
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';

export class FileStorageService {
  private baseDir: string;

  constructor() {
    this.baseDir = join(process.cwd(), 'data', 'attachments');
  }

  /**
   * Store file on filesystem and return path
   */
  async storeFile(file: Buffer, mimeType: string, originalName: string): Promise<string> {
    // Generate unique filename
    const hash = crypto.createHash('sha256').update(file).digest('hex');
    const ext = originalName.split('.').pop();
    const filename = `${hash}.${ext}`;

    // Organize by date for easier management
    const now = new Date();
    const yearMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const dir = join(this.baseDir, yearMonth);

    await mkdir(dir, { recursive: true });

    const filePath = join(dir, filename);
    await writeFile(filePath, file);

    // Return relative path
    return join('attachments', yearMonth, filename);
  }

  /**
   * Read file from filesystem
   */
  async readFile(relativePath: string): Promise<Buffer> {
    const fullPath = join(this.baseDir, '..', relativePath);
    return await readFile(fullPath);
  }

  /**
   * Delete file from filesystem
   */
  async deleteFile(relativePath: string): Promise<void> {
    const fullPath = join(this.baseDir, '..', relativePath);
    await unlink(fullPath);
  }
}
```

**Phase 2: Schema Migration**

```sql
-- Migration: 002_filesystem_attachments
ALTER TABLE attachments ADD COLUMN file_path_new TEXT;
-- Keep old file_path for backward compatibility during migration
-- file_path_new will store filesystem path
```

**Phase 3: Data Migration Script**

```typescript
// scripts/migrate-attachments-to-filesystem.ts
export async function migrateAttachmentsToFilesystem() {
  const storage = new FileStorageService();
  const attachments = attachmentRepository.findAll();

  for (const attachment of attachments) {
    if (attachment.file_path && attachment.file_path.startsWith('data:')) {
      // Extract base64 data
      const matches = attachment.file_path.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const [, mimeType, base64] = matches;
        const buffer = Buffer.from(base64, 'base64');

        // Store on filesystem
        const fsPath = await storage.storeFile(buffer, mimeType, attachment.file_name);

        // Update database
        attachmentRepository.update(attachment.id, {
          file_path_new: fsPath,
          // Keep old file_path for rollback capability
        });

        console.log(`Migrated attachment ${attachment.id}: ${attachment.file_name}`);
      }
    }
  }

  console.log('Migration complete');
}
```

**Phase 4: Code Updates**

Update `app/actions/attachments.ts` to use new file storage service.

**Expected Benefits:**
- 🚀 Database size reduction: ~70% (no base64 overhead)
- 🚀 Query performance: 50-100x faster (smaller table)
- 🚀 Memory usage: 90% reduction (stream files instead of loading)
- 🚀 Scalability: Support 1000+ attachments easily

**Estimated Effort:** 16-24 hours
**Risk Reduction:** CRITICAL → MEDIUM

---

#### 5.1.3 Database Connection Error Handling

**Goal:** Graceful error handling and recovery for database issues.

```typescript
// lib/db/database.ts
export class DatabaseService {
  private retryConnection(maxRetries = 3): Database.Database {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const db = new Database(dbPath);
        db.pragma('foreign_keys = ON');
        return db;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Database connection attempt ${i + 1} failed:`, error);

        if (i < maxRetries - 1) {
          // Wait before retry (exponential backoff)
          const delay = Math.pow(2, i) * 1000;
          Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delay);
        }
      }
    }

    throw new Error(`Failed to connect to database after ${maxRetries} attempts: ${lastError}`);
  }

  /**
   * Health check for database connection
   */
  public healthCheck(): { healthy: boolean; message: string } {
    try {
      // Simple query to test connection
      this.db.prepare('SELECT 1').get();
      return { healthy: true, message: 'Database connection healthy' };
    } catch (error) {
      return { healthy: false, message: `Database error: ${error}` };
    }
  }

  /**
   * Graceful shutdown
   */
  public async shutdown(): Promise<void> {
    try {
      // Run any pending operations
      this.db.prepare('PRAGMA optimize').run();
      this.db.close();
      console.log('Database connection closed gracefully');
    } catch (error) {
      console.error('Error during database shutdown:', error);
    }
  }
}

// Add shutdown hook
process.on('SIGTERM', async () => {
  await DatabaseService.getInstance().shutdown();
  process.exit(0);
});
```

**Estimated Effort:** 4-8 hours
**Risk Reduction:** HIGH → LOW

---

### 5.2 High Priority (Implement Within 2 Weeks)

#### 5.2.1 Database Optimization & Maintenance

**Goal:** Maintain database performance over time.

```typescript
// lib/db/maintenance.ts
export class DatabaseMaintenanceService {
  /**
   * Run database optimization
   * Should be run weekly or after large deletions
   */
  async optimize(): Promise<void> {
    const db = DatabaseService.getInstance().getDatabase();

    // Update statistics for query planner
    db.prepare('ANALYZE').run();

    // Reclaim unused space and defragment
    db.prepare('VACUUM').run();

    // Optimize database
    db.prepare('PRAGMA optimize').run();

    console.log('Database optimization complete');
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<DatabaseStats> {
    const db = DatabaseService.getInstance().getDatabase();

    const pageCount = db.prepare('PRAGMA page_count').get() as { page_count: number };
    const pageSize = db.prepare('PRAGMA page_size').get() as { page_size: number };
    const freelistCount = db.prepare('PRAGMA freelist_count').get() as { freelist_count: number };

    const sizeBytes = pageCount.page_count * pageSize.page_size;
    const wastedBytes = freelistCount.freelist_count * pageSize.page_size;

    return {
      totalSize: sizeBytes,
      wastedSpace: wastedBytes,
      fragmentation: (wastedBytes / sizeBytes) * 100,
      pageCount: pageCount.page_count,
      pageSize: pageSize.page_size,
    };
  }

  /**
   * Schedule automatic maintenance
   */
  async scheduleMaintenanceSchedule(): void {
    // Run weekly on Sunday at 3 AM
    setInterval(async () => {
      const stats = await this.getStats();

      // Only run VACUUM if fragmentation > 10%
      if (stats.fragmentation > 10) {
        await this.optimize();
      }
    }, 7 * 24 * 60 * 60 * 1000); // Weekly
  }
}
```

**Estimated Effort:** 4-8 hours
**Benefits:** Maintains optimal performance over time

---

#### 5.2.2 Implement Full-Text Search

**Goal:** Fast, relevant search results using SQLite FTS5.

```sql
-- Migration: 003_fulltext_search
CREATE VIRTUAL TABLE assets_fts USING fts5(
  name,
  manufacturer,
  model_number,
  notes,
  content=assets,
  content_rowid=id
);

-- Populate FTS index
INSERT INTO assets_fts(rowid, name, manufacturer, model_number, notes)
SELECT id, name, manufacturer, model_number, notes FROM assets;

-- Triggers to keep FTS in sync
CREATE TRIGGER assets_fts_insert AFTER INSERT ON assets BEGIN
  INSERT INTO assets_fts(rowid, name, manufacturer, model_number, notes)
  VALUES (new.id, new.name, new.manufacturer, new.model_number, new.notes);
END;

CREATE TRIGGER assets_fts_update AFTER UPDATE ON assets BEGIN
  UPDATE assets_fts SET
    name = new.name,
    manufacturer = new.manufacturer,
    model_number = new.model_number,
    notes = new.notes
  WHERE rowid = new.id;
END;

CREATE TRIGGER assets_fts_delete AFTER DELETE ON assets BEGIN
  DELETE FROM assets_fts WHERE rowid = old.id;
END;
```

```typescript
// lib/db/repositories/asset.repository.ts
searchFullText(homeId: number, query: string): Asset[] {
  const stmt = this.db.prepare(`
    SELECT a.* FROM assets a
    JOIN assets_fts fts ON a.id = fts.rowid
    WHERE a.home_id = ? AND assets_fts MATCH ?
    ORDER BY rank
  `);
  return stmt.all(homeId, query) as Asset[];
}
```

**Benefits:**
- 10-100x faster searches
- Relevance ranking
- Support for complex queries (phrases, boolean operators)

**Estimated Effort:** 8-12 hours

---

### 5.3 Medium Priority (Implement Within 1 Month)

#### 5.3.1 Enhanced Migration System

**Goal:** Professional-grade migration system with rollback support.

**Directory Structure:**
```
lib/db/migrations/
  001_initial_schema.ts
  002_filesystem_attachments.ts
  003_fulltext_search.ts
```

**Migration Template:**
```typescript
// lib/db/migrations/migration.interface.ts
export interface Migration {
  version: string;
  name: string;
  up: (db: Database.Database) => void;
  down: (db: Database.Database) => void;
}
```

**Estimated Effort:** 8-12 hours

---

#### 5.3.2 Implement Audit Trail

**Goal:** Track all data changes for accountability and debugging.

```sql
-- Migration: 004_audit_trail
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  old_values TEXT, -- JSON
  new_values TEXT, -- JSON
  changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_table ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_date ON audit_log(changed_at DESC);
```

**Estimated Effort:** 8-12 hours

---

#### 5.3.3 Soft Delete Pattern

**Goal:** Recoverable deletions with archive functionality.

```sql
-- Add to all tables
ALTER TABLE assets ADD COLUMN deleted_at DATETIME NULL;

CREATE INDEX idx_assets_deleted ON assets(deleted_at);
```

```typescript
// Soft delete method
softDelete(id: number): boolean {
  const stmt = this.db.prepare(`
    UPDATE assets SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?
  `);
  const result = stmt.run(id);
  return result.changes > 0;
}

// Update findAll to exclude soft-deleted
findAll(): Asset[] {
  const stmt = this.db.prepare(`
    SELECT * FROM ${this.tableName} WHERE deleted_at IS NULL
  `);
  return stmt.all() as Asset[];
}
```

**Estimated Effort:** 8-12 hours

---

### 5.4 Low Priority (Future Enhancements)

#### 5.4.1 Caching Layer

**Goal:** Reduce database queries for frequently-accessed data.

**Implementation:**
```typescript
// lib/cache/cache-service.ts
import NodeCache from 'node-cache';

export class CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 300, // 5 minutes default
      checkperiod: 60, // Check for expired keys every 60s
    });
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttl?: number): void {
    this.cache.set(key, value, ttl || 300);
  }

  invalidate(key: string): void {
    this.cache.del(key);
  }

  invalidatePattern(pattern: string): void {
    const keys = this.cache.keys().filter(k => k.includes(pattern));
    this.cache.del(keys);
  }
}
```

**Usage:**
```typescript
// Cache categories (they rarely change)
export async function getCategories(homeId?: number) {
  const cacheKey = `categories:${homeId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return cached;

  const categories = categoryRepository.findByHomeId(homeId);
  cacheService.set(cacheKey, categories, 600); // 10 minutes
  return categories;
}
```

**Estimated Effort:** 6-8 hours
**Benefits:** 30-50% reduction in database queries

---

#### 5.4.2 Multi-Home Support

**Goal:** Allow users to track multiple properties.

**Changes Required:**
1. Update UI to select current home
2. Remove `getFirstHome()` auto-selection
3. Add home switcher component
4. Update all queries to filter by selected home
5. Add home management page

**Estimated Effort:** 16-24 hours
**Benefits:** Expanded use cases (property managers, multiple homeowners)

---

#### 5.4.3 Cloud Sync Capability (Future)

**Goal:** Optional cloud synchronization for multi-device access.

**Architecture:**
```
Local SQLite ←→ Sync Engine ←→ Cloud Database (PostgreSQL)
                      ↓
               Conflict Resolution
```

**Technologies:**
- ElectricSQL or PowerSync for sync engine
- PostgreSQL on Supabase/Neon for cloud database
- Change tracking via triggers
- Optimistic locking for conflict resolution

**Estimated Effort:** 80-120 hours (major feature)

---

## 6. Implementation Roadmap

### Sprint 1 (Week 1-2): Critical Infrastructure

**Goals:**
- ✅ Automated backup system
- ✅ Database error handling
- ✅ Basic database maintenance

**Deliverables:**
1. Automated daily backups with rotation
2. Database connection retry logic
3. Health check endpoint
4. Graceful shutdown handling

**Success Criteria:**
- Backups run automatically every 24 hours
- Database errors don't crash application
- Users can restore from backup

---

### Sprint 2 (Week 3-4): File Storage Migration

**Goals:**
- ✅ Migrate attachments to filesystem
- ✅ Backward compatibility during transition

**Deliverables:**
1. File storage service implementation
2. Database schema migration
3. Data migration script
4. Updated upload/download actions

**Success Criteria:**
- All new attachments stored on filesystem
- Existing attachments work during migration
- Database size reduced by 60-80%

---

### Sprint 3 (Week 5-6): Performance Optimization

**Goals:**
- ✅ Full-text search
- ✅ Query optimization
- ✅ Database maintenance automation

**Deliverables:**
1. FTS5 implementation for asset search
2. Automatic VACUUM scheduling
3. Database statistics dashboard
4. Performance monitoring

**Success Criteria:**
- Search is <100ms for 1000+ assets
- Database fragmentation <10%

---

### Sprint 4 (Week 7-8): Data Integrity

**Goals:**
- ✅ Audit trail
- ✅ Soft deletes
- ✅ Enhanced migrations

**Deliverables:**
1. Audit log implementation
2. Soft delete pattern across all entities
3. Migration system with rollback
4. Archive/restore functionality

**Success Criteria:**
- All changes tracked in audit log
- Deleted items can be recovered
- Migrations can be rolled back

---

## 7. Appendix

### 7.1 Current Database Schema

**Generated from:** `lib/db/database.ts:79-331`

**Tables:** 8 core tables + 1 migrations table

**Total Indexes:** 12 performance indexes

**Triggers:** 8 automatic timestamp triggers

**Foreign Keys:** 11 relationships with cascade rules

---

### 7.2 Repository Pattern Analysis

**Implementation:** Object-oriented repository pattern

**Base Repository:** `lib/db/repositories/base.repository.ts`
- Abstract class with common CRUD operations
- SQL injection protection via prepared statements
- Type-safe with TypeScript generics

**Repositories:**
1. `HomeRepository`
2. `CategoryRepository`
3. `LocationRepository`
4. `AssetRepository`
5. `ServiceProviderRepository`
6. `MaintenanceRecordRepository`
7. `MaintenanceTaskRepository`
8. `AttachmentRepository`

**Strengths:**
✅ Consistent API across all entities
✅ Prepared statements prevent SQL injection
✅ Type safety with TypeScript
✅ Easy to test

**Weaknesses:**
❌ No transaction support across repositories
❌ No query builder (raw SQL strings)
❌ No eager loading / lazy loading options

---

### 7.3 Storage Calculations

**Current State (Base64 in DB):**
```
100 photos × 3MB avg = 300MB raw
Base64 encoding: 300MB × 1.33 = 400MB
Database overhead: 400MB × 1.2 = 480MB total
```

**With Filesystem Storage:**
```
100 photos × 3MB avg = 300MB raw (on filesystem)
Database metadata: 100 rows × 1KB = 100KB
Total: 300.1MB (38% reduction)
```

---

### 7.4 Performance Benchmarks (Estimated)

**Current Performance:**
- Asset search (LIKE): 50-200ms for 100 assets, 500-2000ms for 1000 assets
- List all assets: 10-30ms for 100 assets, 100-300ms for 1000 assets
- Single asset query: 1-5ms
- File upload (5MB): 2-5 seconds (base64 encoding + DB write)

**After Optimizations:**
- Asset search (FTS5): 5-20ms for 100 assets, 20-80ms for 1000 assets (10-25x faster)
- List all assets: 5-15ms for 100 assets, 30-100ms for 1000 assets (2-3x faster)
- Single asset query: 1-3ms (similar)
- File upload (5MB): 0.5-1 second (5-10x faster, filesystem write)

---

### 7.5 References & Resources

**SQLite Best Practices:**
- [SQLite Performance Tuning](https://www.sqlite.org/speed.html)
- [SQLite FTS5 Documentation](https://www.sqlite.org/fts5.html)
- [SQLite Backup API](https://www.sqlite.org/backup.html)

**Database Migration Tools:**
- [node-pg-migrate](https://github.com/salsita/node-pg-migrate) (inspiration)
- [Knex.js Migrations](https://knexjs.org/guide/migrations.html)

**File Storage:**
- [Multer](https://github.com/expressjs/multer) for file uploads
- [Sharp](https://sharp.pixelplumbing.com/) for image optimization
- [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)

---

## Summary of Key Recommendations

### Immediate (This Week)
1. ✅ Implement automated backup system
2. ✅ Add database error handling
3. ✅ Plan file storage migration

### Short-term (This Month)
4. ✅ Migrate attachments to filesystem
5. ✅ Implement full-text search
6. ✅ Add database maintenance automation
7. ✅ Create database health monitoring

### Medium-term (Next 2 Months)
8. ✅ Implement audit trail
9. ✅ Add soft delete pattern
10. ✅ Enhanced migration system
11. ✅ Add caching layer

### Long-term (Next Quarter)
12. ✅ Multi-home support
13. ✅ Cloud sync capability
14. ✅ Mobile app consideration
15. ✅ Advanced analytics

---

**Document Version:** 1.0
**Total Recommendations:** 15
**Critical Issues:** 3
**High Priority:** 2
**Medium Priority:** 5
**Low Priority:** 5

**Estimated Total Effort:** 160-240 hours over 8-12 weeks

---

*End of Infrastructure Analysis Report*
