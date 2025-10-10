import { NextRequest, NextResponse } from 'next/server';
import { maintenanceRecordRepository } from '@/lib/db/repositories';
import type { CreateMaintenanceRecord } from '@/lib/db/types';

/**
 * GET /api/maintenance-records
 * List maintenance records with optional filtering
 * Query params:
 *  - assetId: filter by asset ID (required unless serviceProviderId is provided)
 *  - serviceProviderId: filter by service provider ID
 *  - type: filter by maintenance type
 *  - days: get records from last N days (default: all)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const assetId = searchParams.get('assetId');
    const serviceProviderId = searchParams.get('serviceProviderId');
    const type = searchParams.get('type');
    const days = searchParams.get('days');

    let records;

    if (serviceProviderId) {
      records = maintenanceRecordRepository.findByServiceProviderId(parseInt(serviceProviderId));
    } else if (assetId) {
      const assetIdNum = parseInt(assetId);
      if (isNaN(assetIdNum)) {
        return NextResponse.json({ error: 'Invalid assetId' }, { status: 400 });
      }

      if (type) {
        records = maintenanceRecordRepository.findByType(assetIdNum, type);
      } else if (days) {
        records = maintenanceRecordRepository.findRecent(assetIdNum, parseInt(days));
      } else {
        records = maintenanceRecordRepository.findByAssetId(assetIdNum);
      }
    } else {
      return NextResponse.json(
        { error: 'assetId or serviceProviderId query parameter is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: records, count: records.length });
  } catch (error) {
    console.error('GET /api/maintenance-records error:', error);
    return NextResponse.json({ error: 'Failed to fetch maintenance records' }, { status: 500 });
  }
}

/**
 * POST /api/maintenance-records
 * Create a new maintenance record
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.asset_id || !body.date_performed || !body.maintenance_type || !body.title) {
      return NextResponse.json(
        {
          error: 'Missing required fields: asset_id, date_performed, maintenance_type, title',
        },
        { status: 400 }
      );
    }

    const recordData: CreateMaintenanceRecord = {
      asset_id: body.asset_id,
      service_provider_id: body.service_provider_id ?? null,
      date_performed: body.date_performed,
      maintenance_type: body.maintenance_type,
      title: body.title,
      description: body.description ?? null,
      cost: body.cost ?? null,
      performed_by: body.performed_by ?? null,
      parts_used: body.parts_used ?? null,
      next_service_date: body.next_service_date ?? null,
      warranty_work: body.warranty_work ?? 0,
      notes: body.notes ?? null,
    };

    const newRecord = maintenanceRecordRepository.create(recordData);

    return NextResponse.json({ data: newRecord }, { status: 201 });
  } catch (error) {
    console.error('POST /api/maintenance-records error:', error);
    return NextResponse.json({ error: 'Failed to create maintenance record' }, { status: 500 });
  }
}
