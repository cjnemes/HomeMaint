import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DatabaseService } from './database';
import type { Home, Category } from './types';

describe('DatabaseService', () => {
  let dbService: DatabaseService;

  beforeAll(() => {
    dbService = DatabaseService.getInstance();
  });

  afterAll(() => {
    // Clean up test data
    const db = dbService.getDatabase();
    db.exec('DELETE FROM homes');
  });

  describe('Database Connection', () => {
    it('should create a singleton instance', () => {
      const instance1 = DatabaseService.getInstance();
      const instance2 = DatabaseService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should have foreign keys enabled', () => {
      const db = dbService.getDatabase();
      const result = db.pragma('foreign_keys') as unknown as { foreign_keys: number }[];
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]?.foreign_keys).toBe(1);
    });
  });

  describe('Schema', () => {
    it('should have all required tables', () => {
      const db = dbService.getDatabase();
      const tables = db
        .prepare(
          `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
        )
        .all() as { name: string }[];

      const tableNames = tables.map((t) => t.name);

      expect(tableNames).toContain('homes');
      expect(tableNames).toContain('categories');
      expect(tableNames).toContain('locations');
      expect(tableNames).toContain('assets');
      expect(tableNames).toContain('service_providers');
      expect(tableNames).toContain('maintenance_records');
      expect(tableNames).toContain('maintenance_tasks');
      expect(tableNames).toContain('attachments');
    });
  });

  describe('CRUD Operations', () => {
    it('should insert and retrieve a home', () => {
      const db = dbService.getDatabase();

      // Insert a home
      const insertStmt = db.prepare(`
        INSERT INTO homes (name, city, state)
        VALUES (?, ?, ?)
      `);
      const result = insertStmt.run('Test Home', 'San Francisco', 'CA');
      const homeId = result.lastInsertRowid;

      // Retrieve the home
      const selectStmt = db.prepare('SELECT * FROM homes WHERE id = ?');
      const home = selectStmt.get(homeId) as Home;

      expect(home).toBeDefined();
      expect(home.name).toBe('Test Home');
      expect(home.city).toBe('San Francisco');
      expect(home.state).toBe('CA');
    });

    it('should create a category for a home', () => {
      const db = dbService.getDatabase();

      // Get the test home
      const home = db.prepare('SELECT * FROM homes LIMIT 1').get() as Home;

      // Insert a category
      const insertStmt = db.prepare(`
        INSERT INTO categories (home_id, name, description, sort_order)
        VALUES (?, ?, ?, ?)
      `);
      const result = insertStmt.run(home.id, 'HVAC', 'Heating and cooling systems', 1);
      const categoryId = result.lastInsertRowid;

      // Retrieve the category
      const selectStmt = db.prepare('SELECT * FROM categories WHERE id = ?');
      const category = selectStmt.get(categoryId) as Category;

      expect(category).toBeDefined();
      expect(category.name).toBe('HVAC');
      expect(category.home_id).toBe(home.id);
    });
  });

  describe('Triggers', () => {
    it('should auto-update updated_at timestamp', async () => {
      const db = dbService.getDatabase();

      // Get the test home
      const home = db.prepare('SELECT * FROM homes LIMIT 1').get() as Home;
      const originalUpdatedAt = home.updated_at;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update the home
      db.prepare('UPDATE homes SET name = ? WHERE id = ?').run('Updated Home', home.id);

      // Get updated home
      const updatedHome = db.prepare('SELECT * FROM homes WHERE id = ?').get(home.id) as Home;

      expect(updatedHome.updated_at).not.toBe(originalUpdatedAt);
    });
  });
});
