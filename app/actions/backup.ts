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

    // Delete the database file
    const { unlinkSync, existsSync } = await import('fs');
    const { join } = await import('path');
    const dbPath = join(process.cwd(), 'data', 'homemaint.db');

    if (existsSync(dbPath)) {
      unlinkSync(dbPath);
    }

    // Database will be recreated on next access by the initialization code
  } catch (error) {
    console.error('Failed to reset data:', error);
    throw new Error(sanitizeError(error));
  }
}
