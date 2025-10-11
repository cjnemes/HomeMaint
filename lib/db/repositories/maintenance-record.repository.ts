import { BaseRepository } from './base.repository';
import type { MaintenanceRecord, CreateMaintenanceRecord } from '../types';

export class MaintenanceRecordRepository extends BaseRepository<
  MaintenanceRecord,
  CreateMaintenanceRecord,
  MaintenanceRecord
> {
  constructor() {
    super('maintenance_records');
  }

  /**
   * Find all maintenance records
   */
  findAll(): MaintenanceRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM maintenance_records
      ORDER BY date_performed DESC
    `);
    return stmt.all() as MaintenanceRecord[];
  }

  /**
   * Find all maintenance records for an asset
   */
  findByAssetId(assetId: number): MaintenanceRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM maintenance_records
      WHERE asset_id = ?
      ORDER BY date_performed DESC
    `);
    return stmt.all(assetId) as MaintenanceRecord[];
  }

  /**
   * Find maintenance records by service provider
   */
  findByServiceProviderId(serviceProviderId: number): MaintenanceRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM maintenance_records
      WHERE service_provider_id = ?
      ORDER BY date_performed DESC
    `);
    return stmt.all(serviceProviderId) as MaintenanceRecord[];
  }

  /**
   * Find maintenance records by type
   */
  findByType(assetId: number, maintenanceType: string): MaintenanceRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM maintenance_records
      WHERE asset_id = ? AND maintenance_type = ?
      ORDER BY date_performed DESC
    `);
    return stmt.all(assetId, maintenanceType) as MaintenanceRecord[];
  }

  /**
   * Find recent maintenance records (last N days)
   */
  findRecent(assetId: number, days: number = 90): MaintenanceRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM maintenance_records
      WHERE asset_id = ? AND date_performed >= date('now', '-' || ? || ' days')
      ORDER BY date_performed DESC
    `);
    return stmt.all(assetId, days) as MaintenanceRecord[];
  }

  /**
   * Create a new maintenance record
   */
  create(data: CreateMaintenanceRecord): MaintenanceRecord {
    const stmt = this.db.prepare(`
      INSERT INTO maintenance_records (
        asset_id, service_provider_id, date_performed, maintenance_type,
        title, description, cost, performed_by, parts_used,
        next_service_date, warranty_work, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.asset_id,
      data.service_provider_id ?? null,
      data.date_performed,
      data.maintenance_type,
      data.title,
      data.description ?? null,
      data.cost ?? null,
      data.performed_by ?? null,
      data.parts_used ?? null,
      data.next_service_date ?? null,
      data.warranty_work,
      data.notes ?? null
    );

    const record = this.findById(Number(result.lastInsertRowid));
    if (!record) {
      throw new Error('Failed to create maintenance record');
    }
    return record;
  }

  /**
   * Update an existing maintenance record
   */
  update(id: number, data: Partial<MaintenanceRecord>): MaintenanceRecord | undefined {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.service_provider_id !== undefined) {
      fields.push('service_provider_id = ?');
      values.push(data.service_provider_id);
    }
    if (data.date_performed !== undefined) {
      fields.push('date_performed = ?');
      values.push(data.date_performed);
    }
    if (data.maintenance_type !== undefined) {
      fields.push('maintenance_type = ?');
      values.push(data.maintenance_type);
    }
    if (data.title !== undefined) {
      fields.push('title = ?');
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.cost !== undefined) {
      fields.push('cost = ?');
      values.push(data.cost);
    }
    if (data.performed_by !== undefined) {
      fields.push('performed_by = ?');
      values.push(data.performed_by);
    }
    if (data.parts_used !== undefined) {
      fields.push('parts_used = ?');
      values.push(data.parts_used);
    }
    if (data.next_service_date !== undefined) {
      fields.push('next_service_date = ?');
      values.push(data.next_service_date);
    }
    if (data.warranty_work !== undefined) {
      fields.push('warranty_work = ?');
      values.push(data.warranty_work);
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
      UPDATE maintenance_records SET ${fields.join(', ')} WHERE id = ?
    `);
    stmt.run(...values);

    return this.findById(id);
  }
}

// Export singleton instance
export const maintenanceRecordRepository = new MaintenanceRecordRepository();
