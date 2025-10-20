'use server';

import { backupService } from '@/lib/db/backup';
import type { BackupInfo } from '@/lib/db/backup';

/**
 * Create a manual backup of the database
 */
export async function createManualBackup(): Promise<BackupInfo> {
  try {
    const backup = await backupService.createBackup();
    return backup;
  } catch (error) {
    console.error('Failed to create manual backup:', error);
    throw new Error('Failed to create backup');
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
    throw new Error('Failed to list backups');
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
    throw new Error('Failed to delete backup');
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
    throw new Error('Failed to restore from backup');
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
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
