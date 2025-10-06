import { BaseRepository } from './base.repository';
import type { Asset, CreateAsset } from '../types';

export class AssetRepository extends BaseRepository<Asset, CreateAsset, Asset> {
  constructor() {
    super('assets');
  }

  /**
   * Find all assets for a home
   */
  findByHomeId(homeId: number): Asset[] {
    const stmt = this.db.prepare(`
      SELECT * FROM assets
      WHERE home_id = ?
      ORDER BY name ASC
    `);
    return stmt.all(homeId) as Asset[];
  }

  /**
   * Find assets by category
   */
  findByCategoryId(categoryId: number): Asset[] {
    const stmt = this.db.prepare(`
      SELECT * FROM assets
      WHERE category_id = ?
      ORDER BY name ASC
    `);
    return stmt.all(categoryId) as Asset[];
  }

  /**
   * Find assets by location
   */
  findByLocationId(locationId: number): Asset[] {
    const stmt = this.db.prepare(`
      SELECT * FROM assets
      WHERE location_id = ?
      ORDER BY name ASC
    `);
    return stmt.all(locationId) as Asset[];
  }

  /**
   * Find assets by status
   */
  findByStatus(homeId: number, status: string): Asset[] {
    const stmt = this.db.prepare(`
      SELECT * FROM assets
      WHERE home_id = ? AND status = ?
      ORDER BY name ASC
    `);
    return stmt.all(homeId, status) as Asset[];
  }

  /**
   * Find child assets of a parent asset
   */
  findByParentId(parentAssetId: number): Asset[] {
    const stmt = this.db.prepare(`
      SELECT * FROM assets
      WHERE parent_asset_id = ?
      ORDER BY name ASC
    `);
    return stmt.all(parentAssetId) as Asset[];
  }

  /**
   * Search assets by name or manufacturer
   */
  search(homeId: number, query: string): Asset[] {
    const stmt = this.db.prepare(`
      SELECT * FROM assets
      WHERE home_id = ? AND (
        name LIKE ? OR
        manufacturer LIKE ? OR
        model_number LIKE ?
      )
      ORDER BY name ASC
    `);
    const searchPattern = `%${query}%`;
    return stmt.all(homeId, searchPattern, searchPattern, searchPattern) as Asset[];
  }

  /**
   * Create a new asset
   */
  create(data: CreateAsset): Asset {
    const stmt = this.db.prepare(`
      INSERT INTO assets (
        home_id, category_id, location_id, parent_asset_id, name,
        manufacturer, model_number, serial_number, year_manufactured,
        purchase_date, installation_date, purchase_price,
        warranty_duration_months, warranty_expiration_date,
        expected_lifespan_years, estimated_replacement_date,
        estimated_replacement_cost, energy_rating, capacity, notes,
        status, custom_fields
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.home_id,
      data.category_id ?? null,
      data.location_id ?? null,
      data.parent_asset_id ?? null,
      data.name,
      data.manufacturer ?? null,
      data.model_number ?? null,
      data.serial_number ?? null,
      data.year_manufactured ?? null,
      data.purchase_date ?? null,
      data.installation_date ?? null,
      data.purchase_price ?? null,
      data.warranty_duration_months ?? null,
      data.warranty_expiration_date ?? null,
      data.expected_lifespan_years ?? null,
      data.estimated_replacement_date ?? null,
      data.estimated_replacement_cost ?? null,
      data.energy_rating ?? null,
      data.capacity ?? null,
      data.notes ?? null,
      data.status,
      data.custom_fields ?? null
    );

    const asset = this.findById(Number(result.lastInsertRowid));
    if (!asset) {
      throw new Error('Failed to create asset');
    }
    return asset;
  }

  /**
   * Update an existing asset
   */
  update(id: number, data: Partial<Asset>): Asset | undefined {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.category_id !== undefined) {
      fields.push('category_id = ?');
      values.push(data.category_id);
    }
    if (data.location_id !== undefined) {
      fields.push('location_id = ?');
      values.push(data.location_id);
    }
    if (data.parent_asset_id !== undefined) {
      fields.push('parent_asset_id = ?');
      values.push(data.parent_asset_id);
    }
    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.manufacturer !== undefined) {
      fields.push('manufacturer = ?');
      values.push(data.manufacturer);
    }
    if (data.model_number !== undefined) {
      fields.push('model_number = ?');
      values.push(data.model_number);
    }
    if (data.serial_number !== undefined) {
      fields.push('serial_number = ?');
      values.push(data.serial_number);
    }
    if (data.year_manufactured !== undefined) {
      fields.push('year_manufactured = ?');
      values.push(data.year_manufactured);
    }
    if (data.purchase_date !== undefined) {
      fields.push('purchase_date = ?');
      values.push(data.purchase_date);
    }
    if (data.installation_date !== undefined) {
      fields.push('installation_date = ?');
      values.push(data.installation_date);
    }
    if (data.purchase_price !== undefined) {
      fields.push('purchase_price = ?');
      values.push(data.purchase_price);
    }
    if (data.warranty_duration_months !== undefined) {
      fields.push('warranty_duration_months = ?');
      values.push(data.warranty_duration_months);
    }
    if (data.warranty_expiration_date !== undefined) {
      fields.push('warranty_expiration_date = ?');
      values.push(data.warranty_expiration_date);
    }
    if (data.expected_lifespan_years !== undefined) {
      fields.push('expected_lifespan_years = ?');
      values.push(data.expected_lifespan_years);
    }
    if (data.estimated_replacement_date !== undefined) {
      fields.push('estimated_replacement_date = ?');
      values.push(data.estimated_replacement_date);
    }
    if (data.estimated_replacement_cost !== undefined) {
      fields.push('estimated_replacement_cost = ?');
      values.push(data.estimated_replacement_cost);
    }
    if (data.energy_rating !== undefined) {
      fields.push('energy_rating = ?');
      values.push(data.energy_rating);
    }
    if (data.capacity !== undefined) {
      fields.push('capacity = ?');
      values.push(data.capacity);
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    if (data.custom_fields !== undefined) {
      fields.push('custom_fields = ?');
      values.push(data.custom_fields);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const stmt = this.db.prepare(`
      UPDATE assets SET ${fields.join(', ')} WHERE id = ?
    `);
    stmt.run(...values);

    return this.findById(id);
  }
}

// Export singleton instance
export const assetRepository = new AssetRepository();
