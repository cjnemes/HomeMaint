'use server';

import { revalidatePath } from 'next/cache';
import { maintenanceTaskRepository } from '@/lib/db/repositories';
import type { MaintenanceTask, CreateMaintenanceTask } from '@/lib/db/types';

/**
 * Get all tasks for an asset
 */
export async function getTasks(assetId: number): Promise<MaintenanceTask[]> {
  try {
    return maintenanceTaskRepository.findByAssetId(assetId);
  } catch (error) {
    console.error(`Failed to get tasks for asset ${assetId}:`, error);
    throw new Error('Failed to fetch tasks');
  }
}

/**
 * Get a single task by ID
 */
export async function getTaskById(id: number): Promise<MaintenanceTask | undefined> {
  try {
    return maintenanceTaskRepository.findById(id);
  } catch (error) {
    console.error(`Failed to get task ${id}:`, error);
    throw new Error('Failed to fetch task');
  }
}

/**
 * Get all tasks
 */
export async function getAllTasks(): Promise<MaintenanceTask[]> {
  try {
    return maintenanceTaskRepository.findAll();
  } catch (error) {
    console.error('Failed to get all tasks:', error);
    throw new Error('Failed to fetch tasks');
  }
}

/**
 * Get tasks by status
 */
export async function getTasksByStatus(status: string): Promise<MaintenanceTask[]> {
  try {
    return maintenanceTaskRepository.findByStatus(status);
  } catch (error) {
    console.error(`Failed to get tasks by status ${status}:`, error);
    throw new Error('Failed to fetch tasks');
  }
}

/**
 * Get overdue tasks
 */
export async function getOverdueTasks(): Promise<MaintenanceTask[]> {
  try {
    return maintenanceTaskRepository.findOverdue();
  } catch (error) {
    console.error('Failed to get overdue tasks:', error);
    throw new Error('Failed to fetch overdue tasks');
  }
}

/**
 * Get upcoming tasks (next N days)
 */
export async function getUpcomingTasks(days: number = 30): Promise<MaintenanceTask[]> {
  try {
    return maintenanceTaskRepository.findUpcoming(days);
  } catch (error) {
    console.error(`Failed to get upcoming tasks:`, error);
    throw new Error('Failed to fetch upcoming tasks');
  }
}

/**
 * Get recurring tasks
 */
export async function getRecurringTasks(assetId?: number): Promise<MaintenanceTask[]> {
  try {
    return maintenanceTaskRepository.findRecurring(assetId);
  } catch (error) {
    console.error('Failed to get recurring tasks:', error);
    throw new Error('Failed to fetch recurring tasks');
  }
}

/**
 * Create a new task
 */
export async function createTask(data: CreateMaintenanceTask): Promise<MaintenanceTask> {
  try {
    const task = maintenanceTaskRepository.create(data);

    // Revalidate relevant pages
    revalidatePath(`/assets/${data.asset_id}`);
    revalidatePath('/tasks');

    return task;
  } catch (error) {
    console.error('Failed to create task:', error);
    throw new Error('Failed to create task');
  }
}

/**
 * Update a task
 */
export async function updateTask(
  id: number,
  data: Partial<CreateMaintenanceTask>
): Promise<MaintenanceTask | undefined> {
  try {
    const task = maintenanceTaskRepository.update(id, data);

    if (task) {
      // Revalidate relevant pages
      revalidatePath(`/assets/${task.asset_id}`);
      revalidatePath('/tasks');
    }

    return task;
  } catch (error) {
    console.error(`Failed to update task ${id}:`, error);
    throw new Error('Failed to update task');
  }
}

/**
 * Delete a task
 */
export async function deleteTask(id: number): Promise<boolean> {
  try {
    // Get the task first to know which asset to revalidate
    const task = await getTaskById(id);

    const result = maintenanceTaskRepository.delete(id);

    if (result && task) {
      // Revalidate relevant pages
      revalidatePath(`/assets/${task.asset_id}`);
      revalidatePath('/tasks');
    }

    return result;
  } catch (error) {
    console.error(`Failed to delete task ${id}:`, error);
    throw new Error('Failed to delete task');
  }
}

/**
 * Mark a task as completed
 */
export async function completeTask(
  id: number,
  completedDate?: string,
  maintenanceRecordId?: number
): Promise<MaintenanceTask | undefined> {
  try {
    const defaultDate = new Date().toISOString().split('T')[0];
    const task = maintenanceTaskRepository.markCompleted(
      id,
      (completedDate || defaultDate) as string,
      maintenanceRecordId
    );

    if (task) {
      // Revalidate relevant pages
      revalidatePath(`/assets/${task.asset_id}`);
      revalidatePath('/tasks');
    }

    return task;
  } catch (error) {
    console.error(`Failed to complete task ${id}:`, error);
    throw new Error('Failed to complete task');
  }
}

/**
 * Get all task statuses (for filter dropdown)
 */
export async function getTaskStatuses(): Promise<string[]> {
  return ['pending', 'in_progress', 'completed', 'cancelled', 'overdue'];
}

/**
 * Get all task priorities (for filter dropdown)
 */
export async function getTaskPriorities(): Promise<string[]> {
  return ['low', 'medium', 'high', 'critical'];
}
