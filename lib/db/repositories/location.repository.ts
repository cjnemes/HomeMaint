import { BaseRepository } from './base.repository';
import type { Location, CreateLocation } from '../types';

export class LocationRepository extends BaseRepository<Location, CreateLocation, Location> {
  constructor() {
    super('locations');
  }

  /**
   * Find all locations for a home
   */
  findByHomeId(homeId: number): Location[] {
    const stmt = this.db.prepare(`
      SELECT * FROM locations
      WHERE home_id = ?
      ORDER BY floor_level ASC, name ASC
    `);
    return stmt.all(homeId) as Location[];
  }

  /**
   * Find child locations of a parent location
   */
  findByParentId(parentLocationId: number): Location[] {
    const stmt = this.db.prepare(`
      SELECT * FROM locations
      WHERE parent_location_id = ?
      ORDER BY name ASC
    `);
    return stmt.all(parentLocationId) as Location[];
  }

  /**
   * Find top-level locations (no parent)
   */
  findTopLevel(homeId: number): Location[] {
    const stmt = this.db.prepare(`
      SELECT * FROM locations
      WHERE home_id = ? AND parent_location_id IS NULL
      ORDER BY floor_level ASC, name ASC
    `);
    return stmt.all(homeId) as Location[];
  }

  /**
   * Create a new location
   */
  create(data: CreateLocation): Location {
    const stmt = this.db.prepare(`
      INSERT INTO locations (
        home_id, name, description, floor_level, parent_location_id
      ) VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.home_id,
      data.name,
      data.description ?? null,
      data.floor_level ?? null,
      data.parent_location_id ?? null
    );

    const location = this.findById(Number(result.lastInsertRowid));
    if (!location) {
      throw new Error('Failed to create location');
    }
    return location;
  }

  /**
   * Update an existing location
   */
  update(id: number, data: Partial<Location>): Location | undefined {
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
    if (data.floor_level !== undefined) {
      fields.push('floor_level = ?');
      values.push(data.floor_level);
    }
    if (data.parent_location_id !== undefined) {
      fields.push('parent_location_id = ?');
      values.push(data.parent_location_id);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const stmt = this.db.prepare(`
      UPDATE locations SET ${fields.join(', ')} WHERE id = ?
    `);
    stmt.run(...values);

    return this.findById(id);
  }
}

// Export singleton instance
export const locationRepository = new LocationRepository();
