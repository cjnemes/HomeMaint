import { NextRequest, NextResponse } from 'next/server';
import { maintenanceTaskRepository } from '@/lib/db/repositories';
import type { CreateMaintenanceTask } from '@/lib/db/types';

/**
 * GET /api/maintenance-tasks
 * List maintenance tasks with optional filtering
 * Query params:
 *  - assetId: filter by asset ID
 *  - status: filter by status
 *  - overdue: if true, only return overdue tasks
 *  - upcoming: get tasks due in next N days
 *  - recurring: if true, only return recurring tasks
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const assetId = searchParams.get('assetId');
    const status = searchParams.get('status');
    const overdue = searchParams.get('overdue') === 'true';
    const upcoming = searchParams.get('upcoming');
    const recurring = searchParams.get('recurring') === 'true';

    let tasks;

    if (overdue) {
      tasks = maintenanceTaskRepository.findOverdue();
    } else if (upcoming) {
      tasks = maintenanceTaskRepository.findUpcoming(parseInt(upcoming));
    } else if (recurring) {
      tasks = assetId
        ? maintenanceTaskRepository.findRecurring(parseInt(assetId))
        : maintenanceTaskRepository.findRecurring();
    } else if (status) {
      tasks = maintenanceTaskRepository.findByStatus(status);
    } else if (assetId) {
      tasks = maintenanceTaskRepository.findByAssetId(parseInt(assetId));
    } else {
      // Return all tasks if no filter specified
      tasks = maintenanceTaskRepository.findAll();
    }

    return NextResponse.json({ data: tasks, count: tasks.length });
  } catch (error) {
    console.error('GET /api/maintenance-tasks error:', error);
    return NextResponse.json({ error: 'Failed to fetch maintenance tasks' }, { status: 500 });
  }
}

/**
 * POST /api/maintenance-tasks
 * Create a new maintenance task
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.asset_id || !body.title || !body.priority || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields: asset_id, title, priority, status' },
        { status: 400 }
      );
    }

    const taskData: CreateMaintenanceTask = {
      asset_id: body.asset_id,
      title: body.title,
      description: body.description ?? null,
      due_date: body.due_date ?? null,
      priority: body.priority,
      estimated_cost: body.estimated_cost ?? null,
      estimated_duration: body.estimated_duration ?? null,
      recurrence_rule: body.recurrence_rule ?? null,
      is_recurring: body.is_recurring ?? 0,
      status: body.status,
      completed_date: body.completed_date ?? null,
      completed_maintenance_record_id: body.completed_maintenance_record_id ?? null,
      notes: body.notes ?? null,
    };

    const newTask = maintenanceTaskRepository.create(taskData);

    return NextResponse.json({ data: newTask }, { status: 201 });
  } catch (error) {
    console.error('POST /api/maintenance-tasks error:', error);
    return NextResponse.json({ error: 'Failed to create maintenance task' }, { status: 500 });
  }
}
