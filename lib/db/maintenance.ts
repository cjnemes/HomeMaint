import { db } from './database';
import { sanitizeError, formatBytes } from '../utils/infrastructure';

/**
 * Database maintenance statistics
 */
export interface DatabaseMaintenanceStats {
  lastOptimized?: Date;
  lastVacuumed?: Date;
  fragmentation: number;
  totalSize: number;
  wastedSpace: number;
  pageCount: number;
  pageSize: number;
}

/**
 * Database maintenance service for optimization and cleanup
 */
export class DatabaseMaintenanceService {
  private database = db.getDatabase();
  private lastOptimizedAt?: Date;
  private lastVacuumedAt?: Date;

  /**
   * Run full database optimization
   * Includes ANALYZE, VACUUM, and PRAGMA optimize
   */
  public async optimizeFull(): Promise<void> {
    console.log('Starting full database optimization...');

    try {
      // Update query planner statistics
      console.log('Running ANALYZE...');
      this.database.prepare('ANALYZE').run();

      // Reclaim unused space and defragment
      console.log('Running VACUUM...');
      this.database.prepare('VACUUM').run();
      this.lastVacuumedAt = new Date();

      // Run SQLite's built-in optimization
      console.log('Running PRAGMA optimize...');
      this.database.prepare('PRAGMA optimize').run();
      this.lastOptimizedAt = new Date();

      console.log('Full database optimization complete');
    } catch (error) {
      console.error('Database optimization failed:', error);
      throw new Error(sanitizeError(error));
    }
  }

  /**
   * Run quick optimization (ANALYZE only)
   * Safe to run frequently, doesn't lock database for long
   */
  public async optimizeQuick(): Promise<void> {
    console.log('Running quick database optimization...');

    try {
      // Update query planner statistics
      this.database.prepare('ANALYZE').run();
      this.lastOptimizedAt = new Date();

      console.log('Quick optimization complete');
    } catch (error) {
      console.error('Quick optimization failed:', error);
      throw new Error(sanitizeError(error));
    }
  }

  /**
   * Run VACUUM only (reclaim space and defragment)
   * Should be run when fragmentation is high (>10%)
   */
  public async vacuum(): Promise<void> {
    console.log('Running VACUUM...');

    try {
      this.database.prepare('VACUUM').run();
      this.lastVacuumedAt = new Date();

      console.log('VACUUM complete');
    } catch (error) {
      console.error('VACUUM failed:', error);
      throw new Error(sanitizeError(error));
    }
  }

  /**
   * Get database statistics
   */
  public getStats(): DatabaseMaintenanceStats {
    const stats = db.getStats();

    return {
      ...stats,
      lastOptimized: this.lastOptimizedAt,
      lastVacuumed: this.lastVacuumedAt,
    };
  }

  /**
   * Check if database needs optimization
   * Returns true if fragmentation > 10% or never optimized
   */
  public needsOptimization(): boolean {
    const stats = this.getStats();

    // If fragmentation is high, needs optimization
    if (stats.fragmentation > 10) {
      return true;
    }

    // If never optimized, recommend optimization
    if (!this.lastOptimizedAt) {
      return true;
    }

    // If last optimized more than 7 days ago, recommend optimization
    const daysSinceOptimization =
      (Date.now() - this.lastOptimizedAt.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceOptimization > 7;
  }

  /**
   * Schedule automatic maintenance
   * Runs quick optimization daily and full optimization weekly
   */
  public scheduleAutomaticMaintenance(): {
    dailyInterval: NodeJS.Timeout;
    weeklyInterval: NodeJS.Timeout;
  } {
    console.log('Scheduling automatic database maintenance...');

    // Daily quick optimization (every 24 hours)
    const dailyInterval = setInterval(
      async () => {
        try {
          console.log('Running scheduled daily optimization...');
          await this.optimizeQuick();
        } catch (error) {
          console.error('Scheduled daily optimization failed:', error);
        }
      },
      24 * 60 * 60 * 1000
    ); // 24 hours

    // Allow process to exit cleanly
    dailyInterval.unref();

    // Weekly full optimization (every 7 days)
    const weeklyInterval = setInterval(
      async () => {
        try {
          console.log('Running scheduled weekly optimization...');
          const stats = this.getStats();

          // Only run VACUUM if fragmentation is high
          if (stats.fragmentation > 10) {
            await this.optimizeFull();
          } else {
            await this.optimizeQuick();
          }
        } catch (error) {
          console.error('Scheduled weekly optimization failed:', error);
        }
      },
      7 * 24 * 60 * 60 * 1000
    ); // 7 days

    // Allow process to exit cleanly
    weeklyInterval.unref();

    console.log('Automatic maintenance scheduled');

    return { dailyInterval, weeklyInterval };
  }

  /**
   * Cancel scheduled maintenance
   */
  public cancelAutomaticMaintenance(intervals: {
    dailyInterval: NodeJS.Timeout;
    weeklyInterval: NodeJS.Timeout;
  }): void {
    clearInterval(intervals.dailyInterval);
    clearInterval(intervals.weeklyInterval);
    console.log('Cancelled automatic maintenance');
  }

  /**
   * Integrity check
   * Verifies database integrity
   */
  public async integrityCheck(): Promise<{ ok: boolean; errors: string[] }> {
    console.log('Running database integrity check...');

    try {
      const result = this.database.prepare('PRAGMA integrity_check').all() as Array<{
        integrity_check: string;
      }>;

      const errors = result
        .filter((row) => row.integrity_check !== 'ok')
        .map((row) => row.integrity_check);

      const ok = errors.length === 0;

      if (ok) {
        console.log('Database integrity check passed');
      } else {
        console.error('Database integrity check failed:', errors);
      }

      return { ok, errors };
    } catch (error) {
      console.error('Integrity check failed:', error);
      throw new Error(sanitizeError(error));
    }
  }

  /**
   * Quick check - verifies database can be opened and queried
   */
  public async quickCheck(): Promise<{ ok: boolean; message: string }> {
    try {
      const result = this.database.prepare('PRAGMA quick_check').get() as {
        quick_check: string;
      };

      const ok = result.quick_check === 'ok';

      return {
        ok,
        message: ok ? 'Database quick check passed' : result.quick_check,
      };
    } catch (error) {
      return {
        ok: false,
        message: sanitizeError(error),
      };
    }
  }

  /**
   * Get foreign key violations
   * Useful for debugging data integrity issues
   */
  public async checkForeignKeys(): Promise<
    Array<{ table: string; rowid: number; parent: string; fkid: number }>
  > {
    console.log('Checking foreign key violations...');

    try {
      const violations = this.database.prepare('PRAGMA foreign_key_check').all() as Array<{
        table: string;
        rowid: number;
        parent: string;
        fkid: number;
      }>;

      if (violations.length === 0) {
        console.log('No foreign key violations found');
      } else {
        console.warn(`Found ${violations.length} foreign key violations`);
      }

      return violations;
    } catch (error) {
      console.error('Foreign key check failed:', error);
      throw new Error(sanitizeError(error));
    }
  }
}

// Export singleton instance
export const maintenanceService = new DatabaseMaintenanceService();
