import { NextRequest, NextResponse } from 'next/server';
import { assetRepository } from '@/lib/db/repositories';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/assets/[id]
 * Get a single asset by ID
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const assetId = parseInt(id);

    if (isNaN(assetId)) {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 });
    }

    const asset = assetRepository.findById(assetId);

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    return NextResponse.json({ data: asset });
  } catch (error) {
    console.error(`GET /api/assets/${(await params).id} error:`, error);
    return NextResponse.json({ error: 'Failed to fetch asset' }, { status: 500 });
  }
}

/**
 * PUT /api/assets/[id]
 * Update an existing asset
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const assetId = parseInt(id);

    if (isNaN(assetId)) {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 });
    }

    // Check if asset exists
    const existingAsset = assetRepository.findById(assetId);
    if (!existingAsset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const body = await request.json();

    // Build update object with only provided fields
    const updateData: Partial<typeof existingAsset> = {};

    if (body.category_id !== undefined) updateData.category_id = body.category_id;
    if (body.location_id !== undefined) updateData.location_id = body.location_id;
    if (body.parent_asset_id !== undefined) updateData.parent_asset_id = body.parent_asset_id;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.manufacturer !== undefined) updateData.manufacturer = body.manufacturer;
    if (body.model_number !== undefined) updateData.model_number = body.model_number;
    if (body.serial_number !== undefined) updateData.serial_number = body.serial_number;
    if (body.year_manufactured !== undefined) updateData.year_manufactured = body.year_manufactured;
    if (body.purchase_date !== undefined) updateData.purchase_date = body.purchase_date;
    if (body.installation_date !== undefined) updateData.installation_date = body.installation_date;
    if (body.purchase_price !== undefined) updateData.purchase_price = body.purchase_price;
    if (body.warranty_duration_months !== undefined)
      updateData.warranty_duration_months = body.warranty_duration_months;
    if (body.warranty_expiration_date !== undefined)
      updateData.warranty_expiration_date = body.warranty_expiration_date;
    if (body.expected_lifespan_years !== undefined)
      updateData.expected_lifespan_years = body.expected_lifespan_years;
    if (body.estimated_replacement_date !== undefined)
      updateData.estimated_replacement_date = body.estimated_replacement_date;
    if (body.estimated_replacement_cost !== undefined)
      updateData.estimated_replacement_cost = body.estimated_replacement_cost;
    if (body.energy_rating !== undefined) updateData.energy_rating = body.energy_rating;
    if (body.capacity !== undefined) updateData.capacity = body.capacity;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.custom_fields !== undefined) updateData.custom_fields = body.custom_fields;

    const updatedAsset = assetRepository.update(assetId, updateData);

    if (!updatedAsset) {
      return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 });
    }

    return NextResponse.json({ data: updatedAsset });
  } catch (error) {
    console.error(`PUT /api/assets/${(await params).id} error:`, error);
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 });
  }
}

/**
 * DELETE /api/assets/[id]
 * Delete an asset
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const assetId = parseInt(id);

    if (isNaN(assetId)) {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 });
    }

    // Check if asset exists
    const existingAsset = assetRepository.findById(assetId);
    if (!existingAsset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const success = assetRepository.delete(assetId);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error(`DELETE /api/assets/${(await params).id} error:`, error);
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
  }
}
