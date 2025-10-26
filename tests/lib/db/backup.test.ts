import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BackupService } from '@/lib/db/backup';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';
import { writeFile } from 'fs/promises';

describe('BackupService', () => {
  let backupService: BackupService;
  const actualBackupDir = join(process.cwd(), 'data', 'backups');

  beforeEach(async () => {
    // Clean up existing backup directory before each test
    if (existsSync(actualBackupDir)) {
      const files = await import('fs/promises').then((fs) => fs.readdir(actualBackupDir));
      for (const file of files) {
        if (file.endsWith('.db')) {
          await import('fs/promises').then((fs) => fs.unlink(join(actualBackupDir, file)));
        }
      }
    }

    // Create backup service
    backupService = new BackupService(7);

    // Mock console methods to reduce test output
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    // Clean up test backups after each test
    if (existsSync(actualBackupDir)) {
      const files = await import('fs/promises').then((fs) => fs.readdir(actualBackupDir));
      for (const file of files) {
        if (file.endsWith('.db')) {
          await import('fs/promises').then((fs) => fs.unlink(join(actualBackupDir, file)));
        }
      }
    }

    vi.restoreAllMocks();
  });

  describe('createBackup', () => {
    it('should create backup successfully', async () => {
      const backup = await backupService.createBackup();

      expect(backup.filename).toMatch(/homemaint-.*\.db/);
      expect(backup.size).toBeGreaterThan(0);
      expect(backup.path).toContain('backups');
      expect(backup.createdAt).toBeInstanceOf(Date);
      expect(existsSync(backup.path)).toBe(true);
    });

    it('should create backup with timestamp in filename', async () => {
      const backup = await backupService.createBackup();

      // Filename should follow pattern: homemaint-YYYY-MM-DDTHH-MM-SS-mmmZ.db
      expect(backup.filename).toMatch(/^homemaint-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.db$/);
    });

    it('should create backup with valid size', async () => {
      const backup = await backupService.createBackup();

      // Backup should be at least 8KB (SQLite header + some data)
      expect(backup.size).toBeGreaterThan(8192);
    });

    it('should log backup creation', async () => {
      await backupService.createBackup();

      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Creating backup:'));
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Backup created successfully:')
      );
    });

    it('should handle backup creation errors', async () => {
      // Create backup service with invalid directory that can't be created
      const invalidService = new BackupService(7);

      // Mock db.getDatabase to throw error
      const { db } = await import('@/lib/db/database');
      const mockGetDatabase = vi.spyOn(db, 'getDatabase').mockImplementation(() => {
        throw new Error('Database not available');
      });

      await expect(invalidService.createBackup()).rejects.toThrow();

      mockGetDatabase.mockRestore();
    });
  });

  describe('listBackups', () => {
    it('should list empty backups when none exist', async () => {
      const backups = await backupService.listBackups();

      expect(backups).toEqual([]);
    });

    it('should list all backup files', async () => {
      // Create multiple backups
      await backupService.createBackup();
      await backupService.createBackup();
      await backupService.createBackup();

      const backups = await backupService.listBackups();

      expect(backups.length).toBeGreaterThanOrEqual(3);
      expect(backups[0]).toHaveProperty('filename');
      expect(backups[0]).toHaveProperty('path');
      expect(backups[0]).toHaveProperty('size');
      expect(backups[0]).toHaveProperty('createdAt');
    });

    it('should sort backups by creation date (newest first)', async () => {
      // Create backups with delays to ensure different timestamps
      await backupService.createBackup();
      await new Promise((resolve) => setTimeout(resolve, 100));
      await backupService.createBackup();
      await new Promise((resolve) => setTimeout(resolve, 100));
      await backupService.createBackup();

      const backups = await backupService.listBackups();

      // Verify backups are sorted by date (newest first)
      for (let i = 0; i < backups.length - 1; i++) {
        expect(backups[i]!.createdAt.getTime()).toBeGreaterThanOrEqual(
          backups[i + 1]!.createdAt.getTime()
        );
      }
    });

    it('should only list .db files', async () => {
      // Create a backup
      await backupService.createBackup();

      // Create a non-backup file
      const nonBackupFile = join(actualBackupDir, 'not-a-backup.txt');
      await writeFile(nonBackupFile, 'test content');

      const backups = await backupService.listBackups();

      // Should only include .db files
      expect(backups.every((b) => b.filename.endsWith('.db'))).toBe(true);
    });
  });

  describe('cleanOldBackups', () => {
    it('should keep only maxBackups (7) most recent backups', async () => {
      // Create 10 backups
      for (let i = 0; i < 10; i++) {
        await backupService.createBackup();
        // Small delay to ensure different timestamps
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      const backups = await backupService.listBackups();

      // Should only keep 7 most recent
      expect(backups.length).toBeLessThanOrEqual(7);
    });

    it('should delete oldest backups first', async () => {
      // Create backups
      const firstBackup = await backupService.createBackup();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Create more backups to exceed limit
      for (let i = 0; i < 8; i++) {
        await backupService.createBackup();
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      const remainingBackups = await backupService.listBackups();

      // First backup should be deleted
      expect(remainingBackups.find((b) => b.filename === firstBackup.filename)).toBeUndefined();
    });
  });

  describe('restoreFromBackup', () => {
    it('should throw error for non-existent backup', async () => {
      await expect(backupService.restoreFromBackup('non-existent.db')).rejects.toThrow();
    });

    it('should throw error for corrupted backup', async () => {
      // Create a corrupted backup file
      const corruptedFilename = `homemaint-${new Date().toISOString().replace(/[:.]/g, '-')}.db`;
      const corruptedPath = join(actualBackupDir, corruptedFilename);
      await writeFile(corruptedPath, 'This is not a valid SQLite database');

      await expect(backupService.restoreFromBackup(corruptedFilename)).rejects.toThrow();
    });

    it('should validate backup is a valid SQLite database', async () => {
      // Create a non-database file with valid filename pattern
      const invalidFilename = `homemaint-${new Date().toISOString().replace(/[:.]/g, '-')}.db`;
      const invalidPath = join(actualBackupDir, invalidFilename);
      await writeFile(invalidPath, 'Invalid content');

      await expect(backupService.restoreFromBackup(invalidFilename)).rejects.toThrow();
    });

    it('should validate filename pattern', async () => {
      await expect(backupService.restoreFromBackup('invalid-filename.db')).rejects.toThrow();
    });

    it('should reject path traversal attempts', async () => {
      await expect(backupService.restoreFromBackup('../../../etc/passwd')).rejects.toThrow();
    });

    // Note: Full restore test would require mocking process.exit and db.close
    // which is complex and might interfere with other tests
  });

  describe('deleteBackup', () => {
    it('should delete backup successfully', async () => {
      const backup = await backupService.createBackup();

      await backupService.deleteBackup(backup.filename);

      expect(existsSync(backup.path)).toBe(false);
    });

    it('should throw error for non-existent backup', async () => {
      await expect(backupService.deleteBackup('non-existent.db')).rejects.toThrow();
    });

    it('should validate filename to prevent path traversal', async () => {
      // Try to delete file outside backup directory
      await expect(backupService.deleteBackup('../../../etc/passwd')).rejects.toThrow();
    });

    it('should only delete files in backup directory', async () => {
      const backup = await backupService.createBackup();
      const backupPath = backup.path;

      await backupService.deleteBackup(backup.filename);

      // Backup should be deleted
      expect(existsSync(backupPath)).toBe(false);

      // But backup directory should still exist
      expect(existsSync(actualBackupDir)).toBe(true);
    });
  });

  describe('getTotalBackupSize', () => {
    it('should return 0 when no backups exist', async () => {
      const totalSize = await backupService.getTotalBackupSize();
      expect(totalSize).toBe(0);
    });

    it('should calculate total size of all backups', async () => {
      await backupService.createBackup();
      await backupService.createBackup();
      await backupService.createBackup();

      const totalSize = await backupService.getTotalBackupSize();

      expect(totalSize).toBeGreaterThan(0);
    });

    it('should sum sizes correctly', async () => {
      const backup1 = await backupService.createBackup();
      const backup2 = await backupService.createBackup();

      const totalSize = await backupService.getTotalBackupSize();

      expect(totalSize).toBeGreaterThanOrEqual(backup1.size + backup2.size);
    });
  });

  describe('scheduleBackups', () => {
    it('should return interval ID', () => {
      const intervalId = backupService.scheduleBackups(24);

      expect(intervalId).toBeDefined();
      expect(typeof intervalId).toBe('object');

      // Clean up
      backupService.cancelScheduledBackups(intervalId);
    });

    it('should create initial backup immediately', async () => {
      const intervalId = backupService.scheduleBackups(24);

      // Wait a bit for initial backup to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const backups = await backupService.listBackups();
      expect(backups.length).toBeGreaterThan(0);

      // Clean up
      backupService.cancelScheduledBackups(intervalId);
    });

    it('should allow cancellation', () => {
      const intervalId = backupService.scheduleBackups(24);

      expect(() => backupService.cancelScheduledBackups(intervalId)).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle concurrent backup creation', async () => {
      // Create multiple backups concurrently
      const backupPromises = [
        backupService.createBackup(),
        backupService.createBackup(),
        backupService.createBackup(),
      ];

      const backups = await Promise.all(backupPromises);

      // All backups should be created with unique filenames
      const filenames = backups.map((b) => b.filename);
      const uniqueFilenames = new Set(filenames);
      expect(uniqueFilenames.size).toBe(filenames.length);
    });

    it('should handle backup directory creation race condition', async () => {
      // Delete backup directory
      if (existsSync(actualBackupDir)) {
        rmSync(actualBackupDir, { recursive: true });
      }

      // Create new service (should recreate directory)
      const newService = new BackupService(7);
      const backup = await newService.createBackup();

      expect(backup).toBeDefined();
      expect(existsSync(actualBackupDir)).toBe(true);
    });

    it('should handle empty database', async () => {
      // Even with empty database, backup should work
      const backup = await backupService.createBackup();

      expect(backup.size).toBeGreaterThan(0); // SQLite header is always present
    });
  });
});
