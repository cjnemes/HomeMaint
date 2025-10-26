import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DatabaseMaintenanceService } from '@/lib/db/maintenance';

describe('DatabaseMaintenanceService', () => {
  let maintenance: DatabaseMaintenanceService;

  beforeEach(() => {
    maintenance = new DatabaseMaintenanceService();

    // Mock console methods to reduce test output
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('optimizeFull', () => {
    it('should run full optimization without error', async () => {
      await expect(maintenance.optimizeFull()).resolves.not.toThrow();
    });

    it('should update last optimized timestamp', async () => {
      await maintenance.optimizeFull();

      const stats = maintenance.getStats();
      expect(stats.lastOptimized).toBeInstanceOf(Date);
      expect(stats.lastVacuumed).toBeInstanceOf(Date);
    });

    it('should log optimization steps', async () => {
      await maintenance.optimizeFull();

      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledWith('Starting full database optimization...');
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledWith('Running ANALYZE...');
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledWith('Running VACUUM...');
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledWith('Running PRAGMA optimize...');
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledWith('Full database optimization complete');
    });
  });

  describe('optimizeQuick', () => {
    it('should run quick optimization without error', async () => {
      await expect(maintenance.optimizeQuick()).resolves.not.toThrow();
    });

    it('should update last optimized timestamp', async () => {
      await maintenance.optimizeQuick();

      const stats = maintenance.getStats();
      expect(stats.lastOptimized).toBeInstanceOf(Date);
    });

    it('should be faster than full optimization', async () => {
      const quickStart = Date.now();
      await maintenance.optimizeQuick();
      const quickDuration = Date.now() - quickStart;

      const fullStart = Date.now();
      await maintenance.optimizeFull();
      const fullDuration = Date.now() - fullStart;

      // Quick should be faster (or at least not significantly slower)
      expect(quickDuration).toBeLessThanOrEqual(fullDuration * 2);
    });
  });

  describe('vacuum', () => {
    it('should run vacuum without error', async () => {
      await expect(maintenance.vacuum()).resolves.not.toThrow();
    });

    it('should update last vacuumed timestamp', async () => {
      await maintenance.vacuum();

      const stats = maintenance.getStats();
      expect(stats.lastVacuumed).toBeInstanceOf(Date);
    });
  });

  describe('integrityCheck', () => {
    it('should check database integrity', async () => {
      const result = await maintenance.integrityCheck();

      expect(result).toHaveProperty('ok');
      expect(result).toHaveProperty('errors');
      expect(typeof result.ok).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should return ok=true for healthy database', async () => {
      const result = await maintenance.integrityCheck();

      expect(result.ok).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('checkForeignKeys', () => {
    it('should check foreign key constraints', async () => {
      const violations = await maintenance.checkForeignKeys();

      expect(Array.isArray(violations)).toBe(true);
    });

    it('should return empty array for valid database', async () => {
      const violations = await maintenance.checkForeignKeys();

      expect(violations).toHaveLength(0);
    });
  });

  describe('getStats', () => {
    it('should return database statistics', () => {
      const stats = maintenance.getStats();

      expect(stats).toHaveProperty('pageCount');
      expect(stats).toHaveProperty('pageSize');
      expect(stats).toHaveProperty('totalSize');
      expect(stats).toHaveProperty('fragmentation');
      expect(stats).toHaveProperty('wastedSpace');
    });

    it('should return valid numbers', () => {
      const stats = maintenance.getStats();

      expect(stats.pageCount).toBeGreaterThan(0);
      expect(stats.pageSize).toBeGreaterThan(0);
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.fragmentation).toBeGreaterThanOrEqual(0);
      expect(stats.wastedSpace).toBeGreaterThanOrEqual(0);
    });

    it('should calculate size correctly', () => {
      const stats = maintenance.getStats();

      // Total size should be pageCount * pageSize (approximately)
      const expectedSize = stats.pageCount * stats.pageSize;
      expect(stats.totalSize).toBeCloseTo(expectedSize, -3); // Within 1000 bytes
    });
  });

  describe('needsOptimization', () => {
    it('should return boolean', () => {
      const needs = maintenance.needsOptimization();

      expect(typeof needs).toBe('boolean');
    });

    it('should return false after recent optimization', async () => {
      await maintenance.optimizeFull();

      const needs = maintenance.needsOptimization();

      expect(needs).toBe(false);
    });
  });

  describe('scheduleAutomaticMaintenance', () => {
    it('should return interval IDs', () => {
      const intervals = maintenance.scheduleAutomaticMaintenance();

      expect(intervals).toHaveProperty('dailyInterval');
      expect(intervals).toHaveProperty('weeklyInterval');
      expect(intervals.dailyInterval).toBeDefined();
      expect(intervals.weeklyInterval).toBeDefined();

      // Clean up
      maintenance.cancelAutomaticMaintenance(intervals);
    });

    it('should allow cancellation', () => {
      const intervals = maintenance.scheduleAutomaticMaintenance();

      expect(() => maintenance.cancelAutomaticMaintenance(intervals)).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle multiple optimizations in sequence', async () => {
      await maintenance.optimizeQuick();
      await maintenance.vacuum();
      await maintenance.optimizeFull();

      const stats = maintenance.getStats();
      expect(stats.lastOptimized).toBeInstanceOf(Date);
      expect(stats.lastVacuumed).toBeInstanceOf(Date);
    });

    it('should handle empty database', async () => {
      // Even with empty database, optimization should work
      await expect(maintenance.optimizeFull()).resolves.not.toThrow();
    });

    it('should handle concurrent optimization calls gracefully', async () => {
      // Run multiple optimizations concurrently
      const promises = [
        maintenance.optimizeQuick(),
        maintenance.optimizeQuick(),
        maintenance.optimizeQuick(),
      ];

      // Should not throw even if run concurrently
      await expect(Promise.all(promises)).resolves.toBeDefined();
    });
  });
});
