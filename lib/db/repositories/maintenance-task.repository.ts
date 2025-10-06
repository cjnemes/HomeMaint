import { BaseRepository } from './base.repository';
import type { MaintenanceTask, CreateMaintenanceTask } from '../types';

export class MaintenanceTaskRepository extends BaseRepository<
  MaintenanceTask,
  CreateMaintenanceTask,
  MaintenanceTask
> {
  constructor() {
    super('maintenance_tasks');
  }

  /**
   * Find all tasks for an asset
   */
  findByAssetId(assetId: number): MaintenanceTask[] {
    const stmt = this.db.prepare(`
      SELECT * FROM maintenance_tasks
      WHERE asset_id = ?
      ORDER BY due_date ASC
    `);
    return stmt.all(assetId) as MaintenanceTask[];
  }

  /**
   * Find tasks by status
   */
  findByStatus(status: string): MaintenanceTask[] {
    const stmt = this.db.prepare(`
      SELECT * FROM maintenance_tasks
      WHERE status = ?
      ORDER BY due_date ASC
    `);
    return stmt.all(status) as MaintenanceTask[];
  }

  /**
   * Find overdue tasks
   */
  findOverdue(): MaintenanceTask[] {
    const stmt = this.db.prepare(`
      SELECT * FROM maintenance_tasks
      WHERE status != 'completed' AND status != 'cancelled'
        AND due_date < date('now')
      ORDER BY due_date ASC
    `);
    return stmt.all() as MaintenanceTask[];
  }

  /**
   * Find upcoming tasks (next N days)
   */
  findUpcoming(days: number = 30): MaintenanceTask[] {
    const stmt = this.db.prepare(`
      SELECT * FROM maintenance_tasks
      WHERE status = 'pending'
        AND due_date BETWEEN date('now') AND date('now', '+' || ? || ' days')
      ORDER BY due_date ASC
    `);
    return stmt.all(days) as MaintenanceTask[];
  }

  /**
   * Find recurring tasks
   */
  findRecurring(assetId?: number): MaintenanceTask[] {
    let query = `
      SELECT * FROM maintenance_tasks
      WHERE is_recurring = 1
    `;

    if (assetId !== undefined) {
      query += ` AND asset_id = ?`;
      const stmt = this.db.prepare(query + ` ORDER BY due_date ASC`);
      return stmt.all(assetId) as MaintenanceTask[];
    }

    const stmt = this.db.prepare(query + ` ORDER BY due_date ASC`);
    return stmt.all() as MaintenanceTask[];
  }

  /**
   * Create a new maintenance task
   */
  create(data: CreateMaintenanceTask): MaintenanceTask {
    const stmt = this.db.prepare(`
      INSERT INTO maintenance_tasks (
        asset_id, title, description, due_date, priority,
        estimated_cost, estimated_duration, recurrence_rule,
        is_recurring, status, completed_date,
        completed_maintenance_record_id, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.asset_id,
      data.title,
      data.description ?? null,
      data.due_date ?? null,
      data.priority,
      data.estimated_cost ?? null,
      data.estimated_duration ?? null,
      data.recurrence_rule ?? null,
      data.is_recurring,
      data.status,
      data.completed_date ?? null,
      data.completed_maintenance_record_id ?? null,
      data.notes ?? null
    );

    const task = this.findById(Number(result.lastInsertRowid));
    if (!task) {
      throw new Error('Failed to create maintenance task');
    }
    return task;
  }

  /**
   * Update an existing maintenance task
   */
  update(id: number, data: Partial<MaintenanceTask>): MaintenanceTask | undefined {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.title !== undefined) {
      fields.push('title = ?');
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.due_date !== undefined) {
      fields.push('due_date = ?');
      values.push(data.due_date);
    }
    if (data.priority !== undefined) {
      fields.push('priority = ?');
      values.push(data.priority);
    }
    if (data.estimated_cost !== undefined) {
      fields.push('estimated_cost = ?');
      values.push(data.estimated_cost);
    }
    if (data.estimated_duration !== undefined) {
      fields.push('estimated_duration = ?');
      values.push(data.estimated_duration);
    }
    if (data.recurrence_rule !== undefined) {
      fields.push('recurrence_rule = ?');
      values.push(data.recurrence_rule);
    }
    if (data.is_recurring !== undefined) {
      fields.push('is_recurring = ?');
      values.push(data.is_recurring);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    if (data.completed_date !== undefined) {
      fields.push('completed_date = ?');
      values.push(data.completed_date);
    }
    if (data.completed_maintenance_record_id !== undefined) {
      fields.push('completed_maintenance_record_id = ?');
      values.push(data.completed_maintenance_record_id);
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
      UPDATE maintenance_tasks SET ${fields.join(', ')} WHERE id = ?
    `);
    stmt.run(...values);

    return this.findById(id);
  }

  /**
   * Mark a task as completed
   */
  markCompleted(
    id: number,
    completedDate: string,
    maintenanceRecordId?: number
  ): MaintenanceTask | undefined {
    return this.update(id, {
      status: 'completed',
      completed_date: completedDate,
      completed_maintenance_record_id: maintenanceRecordId ?? null,
    });
  }
}

// Export singleton instance
export const maintenanceTaskRepository = new MaintenanceTaskRepository();
