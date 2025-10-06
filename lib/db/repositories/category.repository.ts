import { BaseRepository } from './base.repository';
import type { Category, CreateCategory } from '../types';

export class CategoryRepository extends BaseRepository<Category, CreateCategory, Category> {
  constructor() {
    super('categories');
  }

  /**
   * Find all categories for a home, ordered by sort_order
   */
  findByHomeId(homeId: number): Category[] {
    const stmt = this.db.prepare(`
      SELECT * FROM categories
      WHERE home_id = ?
      ORDER BY sort_order ASC, name ASC
    `);
    return stmt.all(homeId) as Category[];
  }

  /**
   * Find system categories
   */
  findSystemCategories(homeId: number): Category[] {
    const stmt = this.db.prepare(`
      SELECT * FROM categories
      WHERE home_id = ? AND is_system = 1
      ORDER BY sort_order ASC
    `);
    return stmt.all(homeId) as Category[];
  }

  /**
   * Create a new category
   */
  create(data: CreateCategory): Category {
    const stmt = this.db.prepare(`
      INSERT INTO categories (
        home_id, name, description, icon, color, sort_order, is_system
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.home_id,
      data.name,
      data.description ?? null,
      data.icon ?? null,
      data.color ?? null,
      data.sort_order,
      data.is_system
    );

    const category = this.findById(Number(result.lastInsertRowid));
    if (!category) {
      throw new Error('Failed to create category');
    }
    return category;
  }

  /**
   * Update an existing category
   */
  update(id: number, data: Partial<Category>): Category | undefined {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.icon !== undefined) {
      fields.push('icon = ?');
      values.push(data.icon);
    }
    if (data.color !== undefined) {
      fields.push('color = ?');
      values.push(data.color);
    }
    if (data.sort_order !== undefined) {
      fields.push('sort_order = ?');
      values.push(data.sort_order);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const stmt = this.db.prepare(`
      UPDATE categories SET ${fields.join(', ')} WHERE id = ?
    `);
    stmt.run(...values);

    return this.findById(id);
  }

  /**
   * Create default system categories for a home
   */
  createDefaultCategories(homeId: number): Category[] {
    const defaultCategories = [
      { name: 'HVAC', icon: '🌡️', sort_order: 1 },
      { name: 'Plumbing', icon: '🚰', sort_order: 2 },
      { name: 'Electrical', icon: '⚡', sort_order: 3 },
      { name: 'Appliances', icon: '🔌', sort_order: 4 },
      { name: 'Exterior', icon: '🏠', sort_order: 5 },
      { name: 'Roofing', icon: '🏘️', sort_order: 6 },
      { name: 'Flooring', icon: '🪵', sort_order: 7 },
      { name: 'Windows & Doors', icon: '🚪', sort_order: 8 },
      { name: 'Landscaping', icon: '🌳', sort_order: 9 },
      { name: 'Security', icon: '🔒', sort_order: 10 },
      { name: 'Other', icon: '📦', sort_order: 11 },
    ];

    const categories: Category[] = [];
    for (const cat of defaultCategories) {
      const category = this.create({
        home_id: homeId,
        name: cat.name,
        description: null,
        icon: cat.icon,
        color: null,
        sort_order: cat.sort_order,
        is_system: 1,
      });
      categories.push(category);
    }

    return categories;
  }
}

// Export singleton instance
export const categoryRepository = new CategoryRepository();
