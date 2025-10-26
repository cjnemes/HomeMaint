'use server';

import { backupService } from '@/lib/db/backup';
import type { BackupInfo } from '@/lib/db/backup';
import { sanitizeError, formatBytes as formatBytesUtil } from '@/lib/utils/infrastructure';

// Re-export BackupInfo type for client components
export type { BackupInfo };

/**
 * Create a manual backup of the database
 */
export async function createManualBackup(): Promise<BackupInfo> {
  try {
    const backup = await backupService.createBackup();
    return backup;
  } catch (error) {
    console.error('Failed to create manual backup:', error);
    throw new Error(sanitizeError(error));
  }
}

/**
 * Get list of all available backups
 */
export async function getBackups(): Promise<BackupInfo[]> {
  try {
    return await backupService.listBackups();
  } catch (error) {
    console.error('Failed to list backups:', error);
    throw new Error(sanitizeError(error));
  }
}

/**
 * Delete a specific backup
 */
export async function deleteBackup(filename: string): Promise<boolean> {
  try {
    return await backupService.deleteBackup(filename);
  } catch (error) {
    console.error('Failed to delete backup:', error);
    throw new Error(sanitizeError(error));
  }
}

/**
 * Restore database from a backup
 * WARNING: This will replace the current database
 */
export async function restoreFromBackup(filename: string): Promise<void> {
  try {
    await backupService.restoreFromBackup(filename);
  } catch (error) {
    console.error('Failed to restore from backup:', error);
    throw new Error(sanitizeError(error));
  }
}

/**
 * Get total size of all backups
 */
export async function getTotalBackupSize(): Promise<number> {
  try {
    return await backupService.getTotalBackupSize();
  } catch (error) {
    console.error('Failed to get backup size:', error);
    return 0;
  }
}

/**
 * Format bytes to human-readable string
 * Re-exported from utils for convenience
 */
export const formatBytes = formatBytesUtil;

/**
 * Reset all data in the database
 * WARNING: This will delete ALL data and cannot be undone!
 * A backup is automatically created before reset.
 */
export async function resetAllData(): Promise<void> {
  try {
    // Create a backup before resetting
    await backupService.createBackup();

    // Use SQL to clear all data instead of deleting the file
    // This keeps the connection alive and prevents server crashes
    const { db } = await import('@/lib/db/database');
    const database = db.getDatabase();

    // Delete all data from tables (in correct order due to foreign keys)
    database.prepare('DELETE FROM attachments').run();
    database.prepare('DELETE FROM maintenance_records').run();
    database.prepare('DELETE FROM maintenance_tasks').run();
    database.prepare('DELETE FROM assets').run();
    database.prepare('DELETE FROM service_providers').run();
    database.prepare('DELETE FROM locations').run();
    database.prepare('DELETE FROM categories').run();
    database.prepare('DELETE FROM homes').run();

    // Reset SQLite sequences
    database.prepare('DELETE FROM sqlite_sequence').run();

    // Vacuum to reclaim space
    database.prepare('VACUUM').run();

    // Database will be re-initialized on next access with default data
  } catch (error) {
    console.error('Failed to reset data:', error);
    throw new Error(sanitizeError(error));
  }
}
