# Infrastructure improvements: automated backups, database maintenance, and security hardening

## Summary

This PR implements critical infrastructure improvements for the HomeMaint application, focusing on database reliability, automated backups, filesystem-based file storage, and security hardening.

## Changes Overview

**10 files changed** | **3,407 insertions** | **3 deletions**

### New Features

#### 1. Automated Backup System (`lib/db/backup.ts`)
- **Atomic backups** using SQLite's `VACUUM INTO` command
- **7-day rotation** with automatic cleanup of old backups
- **Scheduled backups** (configurable interval, default 24 hours)
- **Safe restore** with emergency pre-restore backup and database shutdown
- **Deduplication** and integrity verification

#### 2. Database Maintenance Service (`lib/db/maintenance.ts`)
- **Automatic optimization**: ANALYZE, VACUUM, PRAGMA optimize
- **Scheduled maintenance**: Daily quick optimization, weekly full optimization
- **Fragmentation monitoring** (triggers when >10%)
- **Integrity checks**: Full integrity check and quick check
- **Foreign key violation detection**

#### 3. Filesystem-based File Storage (`lib/storage/file-storage.ts`)
- **Replaces base64 storage** in database (expected 70% database size reduction)
- **Organized by date** (year/month) for easier management
- **SHA-256 deduplication** prevents duplicate file storage
- **Security validations**:
  - File size limit: 50MB max
  - MIME type whitelist (images, PDF, text)
  - Path traversal protection with URL decoding
  - Filename validation with strict patterns
- **Automatic directory creation** with proper race condition handling

#### 4. Data Migration Script (`scripts/migrate-attachments-to-filesystem.ts`)
- **Dry-run mode** for safe testing
- **Automatic backup** before migration
- **Batch processing** with progress tracking
- **Space savings calculation**
- **Keeps base64 data** until verified (backward compatible)

#### 5. Database Reliability Improvements (`lib/db/database.ts`)
- **Connection retry logic** (3 attempts) for SQLite file locks
- **Graceful shutdown handlers** (SIGTERM, SIGINT, beforeExit)
- **Health check endpoint** for monitoring
- **Database statistics** (fragmentation, size, wasted space)
- **Automatic optimization** on shutdown

#### 6. Shared Utilities (`lib/utils/infrastructure.ts`)
- **Error sanitization**: Prevents information disclosure in production
- **File validation**: Comprehensive filename validation against attacks
- **Utility functions**: formatBytes, sleep, sanitizeError

### Security Fixes

#### Critical Issues Addressed
1. ✅ **Removed busy-wait loop** in database.ts that blocked Node.js event loop
2. ✅ **Fixed race condition** in file-storage.ts directory creation
3. ✅ **Fixed unsafe database restore** - proper shutdown, emergency backup, forced restart
4. ✅ **Enhanced path traversal protection** - URL decoding, path resolution, comprehensive patterns

#### High Priority Issues Addressed
5. ✅ **Sanitized error messages** across all services (prevents information disclosure)
6. ✅ **Added backup filename validation** with strict regex patterns
7. ✅ **Added file size limits** (50MB) and MIME type validation
8. ✅ **Fixed memory leaks** - unref() on all setInterval calls for clean shutdown

### Server Actions

#### New Actions (`app/actions/backup.ts`)
- `createManualBackup()`: Create on-demand database backup
- `getBackups()`: List all available backups
- `deleteBackup(filename)`: Delete specific backup
- `restoreFromBackup(filename)`: Restore database from backup
- `getTotalBackupSize()`: Get total size of all backups

### Documentation

#### Analysis Report (`docs/INFRASTRUCTURE_ANALYSIS_REPORT.md`)
- Comprehensive infrastructure analysis
- **3 CRITICAL**, **2 HIGH**, **5 MEDIUM**, **5 LOW** priority issues identified
- Detailed recommendations for each issue

#### Implementation Summary (`docs/INFRASTRUCTURE_IMPROVEMENTS_SUMMARY.md`)
- Feature implementation details
- Performance metrics and benefits
- Testing checklist
- Migration guide

## Database Changes

### New Migration: `002_filesystem_attachment_storage`
- `file_path_fs TEXT`: Filesystem path for attachments
- `storage_type TEXT`: Track storage type (base64 or filesystem)
- `file_hash TEXT`: SHA-256 hash for deduplication
- Index on `file_hash` for fast deduplication lookups

## Performance Impact

### Expected Improvements
- **Database size**: 70% reduction after migration from base64 to filesystem
- **Backup speed**: Atomic VACUUM INTO is faster than manual copying
- **Query performance**: Reduced database size improves overall performance
- **Fragmentation**: Automatic VACUUM when >10% prevents performance degradation

### Resource Usage
- **Disk space**: Requires space for backups (7 days × database size)
- **Memory**: No significant increase
- **CPU**: Scheduled maintenance runs during low-traffic periods

## Testing Checklist

- [ ] Manual backup creation works
- [ ] Backup list retrieval works
- [ ] Backup deletion works
- [ ] Database restore works (WARNING: destructive operation)
- [ ] File upload to filesystem works
- [ ] File deduplication works
- [ ] Path traversal attacks blocked
- [ ] File size limit enforced (50MB)
- [ ] MIME type validation enforced
- [ ] Scheduled backups execute correctly
- [ ] Database maintenance runs successfully
- [ ] Migration script works (dry-run mode)
- [ ] Graceful shutdown works (SIGTERM/SIGINT)

## Breaking Changes

**None** - All changes are backward compatible. The migration supports gradual transition from base64 to filesystem storage.

## Deployment Notes

1. **Backup before deployment**: Create manual backup of production database
2. **Run migration**: Execute `npm run migrate:attachments -- --dry-run` first to test
3. **Monitor disk space**: Ensure sufficient space for backups and attachments
4. **Schedule maintenance**: Automated schedules start on application boot
5. **Test restore**: Verify backup/restore works in staging environment first

## Security Considerations

- All error messages sanitized in production
- Path traversal protection against URL-encoded attacks
- Strict filename validation with regex patterns
- File size and MIME type limits enforced
- Emergency backups created before destructive operations

## Future Improvements (Not in this PR)

- Authentication/authorization on server actions (requires architecture changes)
- Rate limiting on expensive operations
- Comprehensive test suite
- Audit logging for backup/restore operations
- Multi-home support for backups

## Files Changed

```
app/actions/backup.ts                        |   73 ++
docs/INFRASTRUCTURE_ANALYSIS_REPORT.md       | 1254 ++++++++++++++++++++++++++
docs/INFRASTRUCTURE_IMPROVEMENTS_SUMMARY.md  |  550 +++++++++++
lib/db/backup.ts                             |  284 ++++++
lib/db/database.ts                           |  160 +++-
lib/db/maintenance.ts                        |  280 ++++++
lib/db/types.ts                              |    5 +-
lib/storage/file-storage.ts                  |  339 +++++++
lib/utils/infrastructure.ts                  |  101 +++
scripts/migrate-attachments-to-filesystem.ts |  364 ++++++++
10 files changed, 3407 insertions(+), 3 deletions(-)
```

## Commits

- `d2da426` fix: address critical security and reliability issues from code review
- `3d91c2c` docs: add infrastructure improvements implementation summary
- `37a4686` feat: implement critical infrastructure improvements
- `bb8842b` docs: add comprehensive infrastructure analysis report

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
