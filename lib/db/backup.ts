import { existsSync, mkdirSync } from 'fs';
import { readdir, unlink, stat } from 'fs/promises';
import { join } from 'path';
import type Database from 'better-sqlite3';
import { db } from './database';

/**
 * Backup metadata interface
 */
export interface BackupInfo {
  filename: string;
  path: string;
  size: number;
  createdAt: Date;
}

/**
 * Backup service for database backup and restore operations
 */
export class BackupService {
  private backupDir: string;
  private maxBackups: number;

  constructor(maxBackups = 7) {
    this.backupDir = join(process.cwd(), 'data', 'backups');
    this.maxBackups = maxBackups;
    this.ensureBackupDirectory();
  }

  /**
   * Ensure backup directory exists
   */
  private ensureBackupDirectory(): void {
    if (!existsSync(this.backupDir)) {
      mkdirSync(this.backupDir, { recursive: true });
      console.log(`Created backup directory: ${this.backupDir}`);
    }
  }

  /**
   * Create a backup of the database
   * Uses SQLite's VACUUM INTO for atomic, consistent backups
   */
  public async createBackup(): Promise<BackupInfo> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `homemaint-${timestamp}.db`;
      const backupPath = join(this.backupDir, filename);

      // Get database instance
      const database = db.getDatabase();

      // Create backup using VACUUM INTO (atomic operation)
      // This creates a clean, optimized copy of the database
      console.log(`Creating backup: ${filename}`);
      database.prepare('VACUUM INTO ?').run(backupPath);

      // Get backup file stats
      const stats = await stat(backupPath);

      const backupInfo: BackupInfo = {
        filename,
        path: backupPath,
        size: stats.size,
        createdAt: new Date(),
      };

      console.log(
        `Backup created successfully: ${filename} (${this.formatBytes(stats.size)})`
      );

      // Clean up old backups
      await this.cleanOldBackups();

      return backupInfo;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw new Error(`Backup creation failed: ${error}`);
    }
  }

  /**
   * List all available backups
   */
  public async listBackups(): Promise<BackupInfo[]> {
    try {
      this.ensureBackupDirectory();

      const files = await readdir(this.backupDir);
      const backupFiles = files.filter((f) => f.endsWith('.db'));

      const backups: BackupInfo[] = [];

      for (const filename of backupFiles) {
        const filePath = join(this.backupDir, filename);
        const stats = await stat(filePath);

        backups.push({
          filename,
          path: filePath,
          size: stats.size,
          createdAt: stats.mtime,
        });
      }

      // Sort by creation date, newest first
      backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return backups;
    } catch (error) {
      console.error('Failed to list backups:', error);
      return [];
    }
  }

  /**
   * Delete old backups, keeping only the most recent N backups
   */
  private async cleanOldBackups(): Promise<void> {
    try {
      const backups = await this.listBackups();

      if (backups.length <= this.maxBackups) {
        return;
      }

      // Delete backups beyond the max count
      const backupsToDelete = backups.slice(this.maxBackups);

      for (const backup of backupsToDelete) {
        await unlink(backup.path);
        console.log(`Deleted old backup: ${backup.filename}`);
      }

      console.log(`Cleaned up ${backupsToDelete.length} old backup(s)`);
    } catch (error) {
      console.error('Failed to clean old backups:', error);
    }
  }

  /**
   * Delete a specific backup
   */
  public async deleteBackup(filename: string): Promise<boolean> {
    try {
      const backupPath = join(this.backupDir, filename);

      // Validate filename to prevent directory traversal
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        throw new Error('Invalid filename');
      }

      if (!existsSync(backupPath)) {
        throw new Error('Backup file not found');
      }

      await unlink(backupPath);
      console.log(`Deleted backup: ${filename}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete backup ${filename}:`, error);
      throw new Error(`Failed to delete backup: ${error}`);
    }
  }

  /**
   * Restore database from a backup
   * WARNING: This will overwrite the current database
   */
  public async restoreFromBackup(backupFilename: string): Promise<void> {
    try {
      const backupPath = join(this.backupDir, backupFilename);

      // Validate backup exists
      if (!existsSync(backupPath)) {
        throw new Error('Backup file not found');
      }

      // Validate backup integrity by trying to open it
      const Database = (await import('better-sqlite3')).default;
      const testDb = new Database(backupPath, { readonly: true });

      // Test that it's a valid database
      try {
        testDb.prepare('SELECT COUNT(*) FROM sqlite_master').get();
      } catch (error) {
        throw new Error('Backup file is corrupted or invalid');
      } finally {
        testDb.close();
      }

      // Close current database connection
      // Note: This requires the app to restart to reconnect
      console.log('Restoring from backup - database will be replaced');

      // Copy backup to main database location
      const dbPath = join(process.cwd(), 'data', 'homemaint.db');
      const fs = await import('fs/promises');
      await fs.copyFile(backupPath, dbPath);

      console.log(`Database restored from backup: ${backupFilename}`);
      console.log('IMPORTANT: Application restart required for changes to take effect');
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      throw new Error(`Restore failed: ${error}`);
    }
  }

  /**
   * Get total size of all backups
   */
  public async getTotalBackupSize(): Promise<number> {
    const backups = await this.listBackups();
    return backups.reduce((total, backup) => total + backup.size, 0);
  }

  /**
   * Format bytes to human-readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Schedule automatic backups
   * Returns an interval ID that can be used to cancel the schedule
   */
  public scheduleBackups(intervalHours = 24): NodeJS.Timeout {
    console.log(`Scheduling automatic backups every ${intervalHours} hours`);

    const intervalMs = intervalHours * 60 * 60 * 1000;

    const intervalId = setInterval(async () => {
      try {
        console.log('Running scheduled backup...');
        await this.createBackup();
      } catch (error) {
        console.error('Scheduled backup failed:', error);
      }
    }, intervalMs);

    // Create initial backup
    this.createBackup().catch((error) => {
      console.error('Initial backup failed:', error);
    });

    return intervalId;
  }

  /**
   * Cancel scheduled backups
   */
  public cancelScheduledBackups(intervalId: NodeJS.Timeout): void {
    clearInterval(intervalId);
    console.log('Cancelled scheduled backups');
  }
}

// Export singleton instance
export const backupService = new BackupService();
