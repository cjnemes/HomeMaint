import { NextRequest, NextResponse } from 'next/server';
import { locationRepository } from '@/lib/db/repositories';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/locations/[id]
 * Get a single location by ID
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const locationId = parseInt(id);

    if (isNaN(locationId)) {
      return NextResponse.json({ error: 'Invalid location ID' }, { status: 400 });
    }

    const location = locationRepository.findById(locationId);

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    return NextResponse.json({ data: location });
  } catch (error) {
    console.error(`GET /api/locations/${(await params).id} error:`, error);
    return NextResponse.json({ error: 'Failed to fetch location' }, { status: 500 });
  }
}

/**
 * PUT /api/locations/[id]
 * Update an existing location
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const locationId = parseInt(id);

    if (isNaN(locationId)) {
      return NextResponse.json({ error: 'Invalid location ID' }, { status: 400 });
    }

    // Check if location exists
    const existingLocation = locationRepository.findById(locationId);
    if (!existingLocation) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    const body = await request.json();

    // Build update object with only provided fields
    const updateData: Partial<typeof existingLocation> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.floor_level !== undefined) updateData.floor_level = body.floor_level;
    if (body.parent_location_id !== undefined)
      updateData.parent_location_id = body.parent_location_id;

    const updatedLocation = locationRepository.update(locationId, updateData);

    if (!updatedLocation) {
      return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
    }

    return NextResponse.json({ data: updatedLocation });
  } catch (error) {
    console.error(`PUT /api/locations/${(await params).id} error:`, error);
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}

/**
 * DELETE /api/locations/[id]
 * Delete a location
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const locationId = parseInt(id);

    if (isNaN(locationId)) {
      return NextResponse.json({ error: 'Invalid location ID' }, { status: 400 });
    }

    // Check if location exists
    const existingLocation = locationRepository.findById(locationId);
    if (!existingLocation) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    const success = locationRepository.delete(locationId);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error(`DELETE /api/locations/${(await params).id} error:`, error);
    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
  }
}
