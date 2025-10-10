import { NextRequest, NextResponse } from 'next/server';
import { maintenanceTaskRepository } from '@/lib/db/repositories';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/maintenance-tasks/[id]
 * Get a single maintenance task by ID
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const task = maintenanceTaskRepository.findById(taskId);

    if (!task) {
      return NextResponse.json({ error: 'Maintenance task not found' }, { status: 404 });
    }

    return NextResponse.json({ data: task });
  } catch (error) {
    console.error(`GET /api/maintenance-tasks/${(await params).id} error:`, error);
    return NextResponse.json({ error: 'Failed to fetch maintenance task' }, { status: 500 });
  }
}

/**
 * PUT /api/maintenance-tasks/[id]
 * Update an existing maintenance task
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    // Check if task exists
    const existingTask = maintenanceTaskRepository.findById(taskId);
    if (!existingTask) {
      return NextResponse.json({ error: 'Maintenance task not found' }, { status: 404 });
    }

    const body = await request.json();

    // Build update object with only provided fields
    const updateData: Partial<typeof existingTask> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.due_date !== undefined) updateData.due_date = body.due_date;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.estimated_cost !== undefined) updateData.estimated_cost = body.estimated_cost;
    if (body.estimated_duration !== undefined)
      updateData.estimated_duration = body.estimated_duration;
    if (body.recurrence_rule !== undefined) updateData.recurrence_rule = body.recurrence_rule;
    if (body.is_recurring !== undefined) updateData.is_recurring = body.is_recurring;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.completed_date !== undefined) updateData.completed_date = body.completed_date;
    if (body.completed_maintenance_record_id !== undefined)
      updateData.completed_maintenance_record_id = body.completed_maintenance_record_id;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const updatedTask = maintenanceTaskRepository.update(taskId, updateData);

    if (!updatedTask) {
      return NextResponse.json({ error: 'Failed to update maintenance task' }, { status: 500 });
    }

    return NextResponse.json({ data: updatedTask });
  } catch (error) {
    console.error(`PUT /api/maintenance-tasks/${(await params).id} error:`, error);
    return NextResponse.json({ error: 'Failed to update maintenance task' }, { status: 500 });
  }
}

/**
 * DELETE /api/maintenance-tasks/[id]
 * Delete a maintenance task
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    // Check if task exists
    const existingTask = maintenanceTaskRepository.findById(taskId);
    if (!existingTask) {
      return NextResponse.json({ error: 'Maintenance task not found' }, { status: 404 });
    }

    const success = maintenanceTaskRepository.delete(taskId);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete maintenance task' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Maintenance task deleted successfully' });
  } catch (error) {
    console.error(`DELETE /api/maintenance-tasks/${(await params).id} error:`, error);
    return NextResponse.json({ error: 'Failed to delete maintenance task' }, { status: 500 });
  }
}
