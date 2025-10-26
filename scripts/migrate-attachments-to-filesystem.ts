/**
 * Data Migration Script: Base64 to Filesystem Storage
 *
 * This script migrates attachments from base64 storage in the database
 * to filesystem-based storage for better performance and scalability.
 *
 * Usage:
 *   npx tsx scripts/migrate-attachments-to-filesystem.ts
 *
 * Options:
 *   --dry-run    Preview changes without applying them
 *   --batch-size Number of attachments to process at once (default: 10)
 *
 * Safety:
 *   - Creates backup before migration
 *   - Keeps base64 data during migration (for rollback)
 *   - Only clears base64 data after successful migration and verification
 */

import { db } from '../lib/db/database';
import { fileStorage } from '../lib/storage/file-storage';
import { backupService } from '../lib/db/backup';

interface MigrationStats {
  total: number;
  migrated: number;
  skipped: number;
  failed: number;
  errors: Array<{ id: number; filename: string; error: string }>;
  spaceSaved: number;
}

/**
 * Main migration function
 */
async function migrateAttachmentsToFilesystem(options: {
  dryRun: boolean;
  batchSize: number;
}): Promise<MigrationStats> {
  const stats: MigrationStats = {
    total: 0,
    migrated: 0,
    skipped: 0,
    failed: 0,
    errors: [],
    spaceSaved: 0,
  };

  console.log('='.repeat(60));
  console.log('Attachment Storage Migration: Base64 → Filesystem');
  console.log('='.repeat(60));
  console.log(`Mode: ${options.dryRun ? 'DRY RUN (no changes)' : 'LIVE MIGRATION'}`);
  console.log(`Batch size: ${options.batchSize}`);
  console.log('');

  // Step 1: Create backup
  if (!options.dryRun) {
    console.log('Step 1: Creating backup...');
    try {
      const backup = await backupService.createBackup();
      console.log(`✓ Backup created: ${backup.filename}`);
      console.log('');
    } catch (error) {
      console.error('✗ Failed to create backup:', error);
      throw new Error('Migration aborted - backup failed');
    }
  } else {
    console.log('Step 1: Skipping backup (dry run)');
    console.log('');
  }

  // Step 2: Get all attachments
  console.log('Step 2: Loading attachments...');
  const database = db.getDatabase();
  const attachments = database.prepare('SELECT * FROM attachments').all() as Array<{
    id: number;
    file_name: string;
    file_path: string;
    file_path_fs: string | null;
    storage_type: string | null;
    file_size: number | null;
    mime_type: string | null;
    file_hash: string | null;
  }>;

  stats.total = attachments.length;
  console.log(`✓ Found ${stats.total} attachments`);
  console.log('');

  if (stats.total === 0) {
    console.log('No attachments to migrate.');
    return stats;
  }

  // Step 3: Migrate each attachment
  console.log('Step 3: Migrating attachments...');
  console.log('');

  for (let i = 0; i < attachments.length; i++) {
    const attachment = attachments[i]!;
    const progress = `[${i + 1}/${attachments.length}]`;

    try {
      // Skip if already migrated
      if (attachment.storage_type === 'filesystem' && attachment.file_path_fs) {
        console.log(`${progress} Skipping ${attachment.file_name} (already migrated)`);
        stats.skipped++;
        continue;
      }

      // Skip if not base64
      if (!attachment.file_path || !attachment.file_path.startsWith('data:')) {
        console.log(`${progress} Skipping ${attachment.file_name} (not base64)`);
        stats.skipped++;
        continue;
      }

      console.log(`${progress} Migrating ${attachment.file_name}...`);

      // Extract base64 data
      const matches = attachment.file_path.match(/^data:(.+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid base64 format');
      }

      const [, mimeType, base64Data] = matches;
      if (!base64Data) {
        throw new Error('Missing base64 data');
      }

      // Calculate size before migration
      const oldSize = Buffer.byteLength(attachment.file_path, 'utf-8');

      if (!options.dryRun) {
        // Store file on filesystem
        const storedFile = await fileStorage.storeBase64File(
          attachment.file_path,
          mimeType!,
          attachment.file_name
        );

        // Update database
        database
          .prepare(
            `
          UPDATE attachments
          SET file_path_fs = ?,
              storage_type = 'filesystem',
              file_hash = ?,
              file_size = ?
          WHERE id = ?
        `
          )
          .run(storedFile.relativePath, storedFile.hash, storedFile.size, attachment.id);

        console.log(`  ✓ Saved to: ${storedFile.relativePath}`);
        console.log(`  ✓ Size: ${formatBytes(storedFile.size)}`);
        console.log(`  ✓ Hash: ${storedFile.hash.substring(0, 16)}...`);

        // Calculate space saved (base64 overhead ~33%)
        const newSize = storedFile.size;
        stats.spaceSaved += oldSize - newSize;
      } else {
        console.log(`  → Would save to filesystem`);
        console.log(`  → Current size: ${formatBytes(oldSize)}`);
      }

      stats.migrated++;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`  ✗ Failed: ${errorMessage}`);

      stats.failed++;
      stats.errors.push({
        id: attachment.id,
        filename: attachment.file_name,
        error: errorMessage,
      });
    }

    console.log('');

    // Pause between batches
    if ((i + 1) % options.batchSize === 0 && i < attachments.length - 1) {
      console.log(`Processed ${i + 1} attachments. Pausing...`);
      await sleep(1000); // 1 second pause
      console.log('');
    }
  }

  return stats;
}

/**
 * Clear base64 data from migrated attachments
 * Run this after verifying the migration was successful
 */
async function clearBase64Data(dryRun: boolean): Promise<number> {
  console.log('='.repeat(60));
  console.log('Clearing Base64 Data from Migrated Attachments');
  console.log('='.repeat(60));
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log('');

  const database = db.getDatabase();

  // Find attachments that are migrated but still have base64 data
  const attachments = database
    .prepare(
      `
    SELECT id, file_name, file_path, file_path_fs
    FROM attachments
    WHERE storage_type = 'filesystem'
      AND file_path_fs IS NOT NULL
      AND file_path LIKE 'data:%'
  `
    )
    .all() as Array<{
    id: number;
    file_name: string;
    file_path: string;
    file_path_fs: string;
  }>;

  console.log(`Found ${attachments.length} attachments to clean up`);
  console.log('');

  if (attachments.length === 0) {
    return 0;
  }

  if (!dryRun) {
    // Verify all files exist before clearing
    console.log('Verifying all files exist...');
    for (const attachment of attachments) {
      if (!fileStorage.fileExists(attachment.file_path_fs)) {
        throw new Error(`File missing: ${attachment.file_path_fs} for attachment ${attachment.id}`);
      }
    }
    console.log('✓ All files verified');
    console.log('');

    // Clear base64 data
    database
      .prepare(
        `
      UPDATE attachments
      SET file_path = file_path_fs
      WHERE storage_type = 'filesystem'
        AND file_path_fs IS NOT NULL
        AND file_path LIKE 'data:%'
    `
      )
      .run();

    console.log(`✓ Cleared base64 data from ${attachments.length} attachments`);
  } else {
    console.log(`Would clear base64 data from ${attachments.length} attachments`);
  }

  return attachments.length;
}

/**
 * Print migration summary
 */
function printSummary(stats: MigrationStats, dryRun: boolean): void {
  console.log('');
  console.log('='.repeat(60));
  console.log('Migration Summary');
  console.log('='.repeat(60));
  console.log(`Total attachments:     ${stats.total}`);
  console.log(`Migrated:              ${stats.migrated}`);
  console.log(`Skipped:               ${stats.skipped}`);
  console.log(`Failed:                ${stats.failed}`);
  console.log(`Space saved:           ${formatBytes(stats.spaceSaved)}`);

  if (stats.errors.length > 0) {
    console.log('');
    console.log('Errors:');
    stats.errors.forEach((error) => {
      console.log(`  - ID ${error.id} (${error.filename}): ${error.error}`);
    });
  }

  console.log('');

  if (dryRun) {
    console.log('This was a DRY RUN - no changes were made.');
    console.log('Run without --dry-run to apply changes.');
  } else if (stats.migrated > 0) {
    console.log('Migration completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Verify all attachments are accessible in the application');
    console.log('2. Run with --clear-base64 to remove base64 data and free space');
    console.log('3. Run VACUUM to reclaim disk space');
  }

  console.log('='.repeat(60));
}

/**
 * Helper: Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper: Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const clearBase64 = args.includes('--clear-base64');
  const batchSizeArg = args.find((arg) => arg.startsWith('--batch-size='));
  const batchSize = batchSizeArg ? parseInt(batchSizeArg.split('=')[1]!, 10) : 10;

  try {
    if (clearBase64) {
      const count = await clearBase64Data(dryRun);
      if (!dryRun && count > 0) {
        console.log('');
        console.log('Run VACUUM to reclaim disk space:');
        console.log('  npx tsx scripts/vacuum-database.ts');
      }
    } else {
      const stats = await migrateAttachmentsToFilesystem({ dryRun, batchSize });
      printSummary(stats, dryRun);
    }

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('FATAL ERROR:', error);
    console.error('');
    console.error('Migration aborted.');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { migrateAttachmentsToFilesystem, clearBase64Data };
