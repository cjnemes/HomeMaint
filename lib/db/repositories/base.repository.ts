import type Database from 'better-sqlite3';
import db from '../database';

/**
 * Base repository providing common CRUD operations
 */
export abstract class BaseRepository<T, CreateT, UpdateT> {
  protected db: Database.Database;
  protected tableName: string;

  constructor(tableName: string) {
    // Validate table name to prevent SQL injection
    // Table names must only contain lowercase letters, numbers, and underscores
    if (!/^[a-z_][a-z0-9_]*$/.test(tableName)) {
      throw new Error(
        `Invalid table name: "${tableName}". Table names must only contain lowercase letters, numbers, and underscores, and must start with a letter or underscore.`
      );
    }
    this.db = db.getDatabase();
    this.tableName = tableName;
  }

  /**
   * Find all records
   */
  findAll(): T[] {
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName}`);
    return stmt.all() as T[];
  }

  /**
   * Find record by ID
   */
  findById(id: number): T | undefined {
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`);
    return stmt.get(id) as T | undefined;
  }

  /**
   * Create a new record
   */
  abstract create(data: CreateT): T;

  /**
   * Update an existing record
   */
  abstract update(id: number, data: Partial<UpdateT>): T | undefined;

  /**
   * Delete a record by ID
   */
  delete(id: number): boolean {
    const stmt = this.db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Count total records
   */
  count(): number {
    const stmt = this.db.prepare(`SELECT COUNT(*) as count FROM ${this.tableName}`);
    const result = stmt.get() as { count: number };
    return result.count;
  }

  /**
   * Check if a record exists by ID
   */
  exists(id: number): boolean {
    const stmt = this.db.prepare(`SELECT 1 FROM ${this.tableName} WHERE id = ? LIMIT 1`);
    return stmt.get(id) !== undefined;
  }
}
