import { NextRequest, NextResponse } from 'next/server';
import { maintenanceRecordRepository } from '@/lib/db/repositories';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/maintenance-records/[id]
 * Get a single maintenance record by ID
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const recordId = parseInt(id);

    if (isNaN(recordId)) {
      return NextResponse.json({ error: 'Invalid record ID' }, { status: 400 });
    }

    const record = maintenanceRecordRepository.findById(recordId);

    if (!record) {
      return NextResponse.json({ error: 'Maintenance record not found' }, { status: 404 });
    }

    return NextResponse.json({ data: record });
  } catch (error) {
    console.error(`GET /api/maintenance-records/${(await params).id} error:`, error);
    return NextResponse.json({ error: 'Failed to fetch maintenance record' }, { status: 500 });
  }
}

/**
 * PUT /api/maintenance-records/[id]
 * Update an existing maintenance record
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const recordId = parseInt(id);

    if (isNaN(recordId)) {
      return NextResponse.json({ error: 'Invalid record ID' }, { status: 400 });
    }

    // Check if record exists
    const existingRecord = maintenanceRecordRepository.findById(recordId);
    if (!existingRecord) {
      return NextResponse.json({ error: 'Maintenance record not found' }, { status: 404 });
    }

    const body = await request.json();

    // Build update object with only provided fields
    const updateData: Partial<typeof existingRecord> = {};

    if (body.service_provider_id !== undefined)
      updateData.service_provider_id = body.service_provider_id;
    if (body.date_performed !== undefined) updateData.date_performed = body.date_performed;
    if (body.maintenance_type !== undefined) updateData.maintenance_type = body.maintenance_type;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.cost !== undefined) updateData.cost = body.cost;
    if (body.performed_by !== undefined) updateData.performed_by = body.performed_by;
    if (body.parts_used !== undefined) updateData.parts_used = body.parts_used;
    if (body.next_service_date !== undefined) updateData.next_service_date = body.next_service_date;
    if (body.warranty_work !== undefined) updateData.warranty_work = body.warranty_work;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const updatedRecord = maintenanceRecordRepository.update(recordId, updateData);

    if (!updatedRecord) {
      return NextResponse.json({ error: 'Failed to update maintenance record' }, { status: 500 });
    }

    return NextResponse.json({ data: updatedRecord });
  } catch (error) {
    console.error(`PUT /api/maintenance-records/${(await params).id} error:`, error);
    return NextResponse.json({ error: 'Failed to update maintenance record' }, { status: 500 });
  }
}

/**
 * DELETE /api/maintenance-records/[id]
 * Delete a maintenance record
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const recordId = parseInt(id);

    if (isNaN(recordId)) {
      return NextResponse.json({ error: 'Invalid record ID' }, { status: 400 });
    }

    // Check if record exists
    const existingRecord = maintenanceRecordRepository.findById(recordId);
    if (!existingRecord) {
      return NextResponse.json({ error: 'Maintenance record not found' }, { status: 404 });
    }

    const success = maintenanceRecordRepository.delete(recordId);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete maintenance record' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Maintenance record deleted successfully' });
  } catch (error) {
    console.error(`DELETE /api/maintenance-records/${(await params).id} error:`, error);
    return NextResponse.json({ error: 'Failed to delete maintenance record' }, { status: 500 });
  }
}
