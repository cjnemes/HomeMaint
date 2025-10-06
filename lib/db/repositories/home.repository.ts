import { BaseRepository } from './base.repository';
import type { Home, CreateHome } from '../types';

export class HomeRepository extends BaseRepository<Home, CreateHome, Home> {
  constructor() {
    super('homes');
  }

  /**
   * Create a new home
   */
  create(data: CreateHome): Home {
    const stmt = this.db.prepare(`
      INSERT INTO homes (
        name, address_line1, address_line2, city, state, postal_code,
        country, year_built, square_footage, lot_size, purchase_date,
        purchase_price, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.name,
      data.address_line1 ?? null,
      data.address_line2 ?? null,
      data.city ?? null,
      data.state ?? null,
      data.postal_code ?? null,
      data.country ?? null,
      data.year_built ?? null,
      data.square_footage ?? null,
      data.lot_size ?? null,
      data.purchase_date ?? null,
      data.purchase_price ?? null,
      data.notes ?? null
    );

    const home = this.findById(Number(result.lastInsertRowid));
    if (!home) {
      throw new Error('Failed to create home');
    }
    return home;
  }

  /**
   * Update an existing home
   */
  update(id: number, data: Partial<Home>): Home | undefined {
    const fields: string[] = [];
    const values: unknown[] = [];

    // Build dynamic update query
    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.address_line1 !== undefined) {
      fields.push('address_line1 = ?');
      values.push(data.address_line1);
    }
    if (data.address_line2 !== undefined) {
      fields.push('address_line2 = ?');
      values.push(data.address_line2);
    }
    if (data.city !== undefined) {
      fields.push('city = ?');
      values.push(data.city);
    }
    if (data.state !== undefined) {
      fields.push('state = ?');
      values.push(data.state);
    }
    if (data.postal_code !== undefined) {
      fields.push('postal_code = ?');
      values.push(data.postal_code);
    }
    if (data.country !== undefined) {
      fields.push('country = ?');
      values.push(data.country);
    }
    if (data.year_built !== undefined) {
      fields.push('year_built = ?');
      values.push(data.year_built);
    }
    if (data.square_footage !== undefined) {
      fields.push('square_footage = ?');
      values.push(data.square_footage);
    }
    if (data.lot_size !== undefined) {
      fields.push('lot_size = ?');
      values.push(data.lot_size);
    }
    if (data.purchase_date !== undefined) {
      fields.push('purchase_date = ?');
      values.push(data.purchase_date);
    }
    if (data.purchase_price !== undefined) {
      fields.push('purchase_price = ?');
      values.push(data.purchase_price);
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const stmt = this.db.prepare(`
      UPDATE homes SET ${fields.join(', ')} WHERE id = ?
    `);
    stmt.run(...values);

    return this.findById(id);
  }
}

// Export singleton instance
export const homeRepository = new HomeRepository();
