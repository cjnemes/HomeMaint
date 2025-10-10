import { NextRequest, NextResponse } from 'next/server';
import { assetRepository } from '@/lib/db/repositories';
import type { CreateAsset } from '@/lib/db/types';

/**
 * GET /api/assets
 * List all assets with optional filtering
 * Query params:
 *  - homeId: filter by home ID (required)
 *  - categoryId: filter by category
 *  - locationId: filter by location
 *  - status: filter by status
 *  - search: search by name, manufacturer, or model
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const homeId = searchParams.get('homeId');
    const categoryId = searchParams.get('categoryId');
    const locationId = searchParams.get('locationId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // homeId is required for listing assets
    if (!homeId) {
      return NextResponse.json({ error: 'homeId query parameter is required' }, { status: 400 });
    }

    const homeIdNum = parseInt(homeId);
    if (isNaN(homeIdNum)) {
      return NextResponse.json({ error: 'Invalid homeId' }, { status: 400 });
    }

    let assets;

    // Apply filters based on query params
    if (search) {
      assets = assetRepository.search(homeIdNum, search);
    } else if (categoryId) {
      assets = assetRepository.findByCategoryId(parseInt(categoryId));
    } else if (locationId) {
      assets = assetRepository.findByLocationId(parseInt(locationId));
    } else if (status) {
      assets = assetRepository.findByStatus(homeIdNum, status);
    } else {
      assets = assetRepository.findByHomeId(homeIdNum);
    }

    return NextResponse.json({ data: assets, count: assets.length });
  } catch (error) {
    console.error('GET /api/assets error:', error);
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}

/**
 * POST /api/assets
 * Create a new asset
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.home_id || !body.name || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields: home_id, name, status' },
        { status: 400 }
      );
    }

    const assetData: CreateAsset = {
      home_id: body.home_id,
      category_id: body.category_id ?? null,
      location_id: body.location_id ?? null,
      parent_asset_id: body.parent_asset_id ?? null,
      name: body.name,
      manufacturer: body.manufacturer ?? null,
      model_number: body.model_number ?? null,
      serial_number: body.serial_number ?? null,
      year_manufactured: body.year_manufactured ?? null,
      purchase_date: body.purchase_date ?? null,
      installation_date: body.installation_date ?? null,
      purchase_price: body.purchase_price ?? null,
      warranty_duration_months: body.warranty_duration_months ?? null,
      warranty_expiration_date: body.warranty_expiration_date ?? null,
      expected_lifespan_years: body.expected_lifespan_years ?? null,
      estimated_replacement_date: body.estimated_replacement_date ?? null,
      estimated_replacement_cost: body.estimated_replacement_cost ?? null,
      energy_rating: body.energy_rating ?? null,
      capacity: body.capacity ?? null,
      notes: body.notes ?? null,
      status: body.status,
      custom_fields: body.custom_fields ?? null,
    };

    const newAsset = assetRepository.create(assetData);

    return NextResponse.json({ data: newAsset }, { status: 201 });
  } catch (error) {
    console.error('POST /api/assets error:', error);
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 });
  }
}
