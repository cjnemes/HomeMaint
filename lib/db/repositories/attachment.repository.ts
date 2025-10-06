import { BaseRepository } from './base.repository';
import type { Attachment, CreateAttachment } from '../types';

export class AttachmentRepository extends BaseRepository<Attachment, CreateAttachment, Attachment> {
  constructor() {
    super('attachments');
  }

  /**
   * Find all attachments for a home
   */
  findByHomeId(homeId: number): Attachment[] {
    const stmt = this.db.prepare(`
      SELECT * FROM attachments
      WHERE home_id = ?
      ORDER BY created_at DESC
    `);
    return stmt.all(homeId) as Attachment[];
  }

  /**
   * Find attachments for an asset
   */
  findByAssetId(assetId: number): Attachment[] {
    const stmt = this.db.prepare(`
      SELECT * FROM attachments
      WHERE asset_id = ?
      ORDER BY created_at DESC
    `);
    return stmt.all(assetId) as Attachment[];
  }

  /**
   * Find attachments for a maintenance record
   */
  findByMaintenanceRecordId(maintenanceRecordId: number): Attachment[] {
    const stmt = this.db.prepare(`
      SELECT * FROM attachments
      WHERE maintenance_record_id = ?
      ORDER BY created_at DESC
    `);
    return stmt.all(maintenanceRecordId) as Attachment[];
  }

  /**
   * Find attachments by file type
   */
  findByFileType(homeId: number, fileType: string): Attachment[] {
    const stmt = this.db.prepare(`
      SELECT * FROM attachments
      WHERE home_id = ? AND file_type = ?
      ORDER BY created_at DESC
    `);
    return stmt.all(homeId, fileType) as Attachment[];
  }

  /**
   * Search attachments by filename or description
   */
  search(homeId: number, query: string): Attachment[] {
    const stmt = this.db.prepare(`
      SELECT * FROM attachments
      WHERE home_id = ? AND (
        file_name LIKE ? OR
        description LIKE ?
      )
      ORDER BY created_at DESC
    `);
    const searchPattern = `%${query}%`;
    return stmt.all(homeId, searchPattern, searchPattern) as Attachment[];
  }

  /**
   * Create a new attachment
   */
  create(data: CreateAttachment): Attachment {
    // Validate that at least one of asset_id or maintenance_record_id is provided
    if (!data.asset_id && !data.maintenance_record_id) {
      throw new Error('Attachment must be associated with an asset or maintenance record');
    }

    const stmt = this.db.prepare(`
      INSERT INTO attachments (
        home_id, asset_id, maintenance_record_id, file_name, file_path,
        file_size, mime_type, file_type, description, taken_date,
        thumbnail_path, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.home_id,
      data.asset_id ?? null,
      data.maintenance_record_id ?? null,
      data.file_name,
      data.file_path,
      data.file_size ?? null,
      data.mime_type ?? null,
      data.file_type ?? null,
      data.description ?? null,
      data.taken_date ?? null,
      data.thumbnail_path ?? null,
      data.metadata ?? null
    );

    const attachment = this.findById(Number(result.lastInsertRowid));
    if (!attachment) {
      throw new Error('Failed to create attachment');
    }
    return attachment;
  }

  /**
   * Update an existing attachment
   */
  update(id: number, data: Partial<Attachment>): Attachment | undefined {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.file_name !== undefined) {
      fields.push('file_name = ?');
      values.push(data.file_name);
    }
    if (data.file_type !== undefined) {
      fields.push('file_type = ?');
      values.push(data.file_type);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.taken_date !== undefined) {
      fields.push('taken_date = ?');
      values.push(data.taken_date);
    }
    if (data.thumbnail_path !== undefined) {
      fields.push('thumbnail_path = ?');
      values.push(data.thumbnail_path);
    }
    if (data.metadata !== undefined) {
      fields.push('metadata = ?');
      values.push(data.metadata);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const stmt = this.db.prepare(`
      UPDATE attachments SET ${fields.join(', ')} WHERE id = ?
    `);
    stmt.run(...values);

    return this.findById(id);
  }

  /**
   * Get total file size for a home
   */
  getTotalFileSize(homeId: number): number {
    const stmt = this.db.prepare(`
      SELECT COALESCE(SUM(file_size), 0) as total FROM attachments WHERE home_id = ?
    `);
    const result = stmt.get(homeId) as { total: number };
    return result.total;
  }
}

// Export singleton instance
export const attachmentRepository = new AttachmentRepository();
