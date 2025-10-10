import { NextRequest, NextResponse } from 'next/server';
import { locationRepository } from '@/lib/db/repositories';
import type { CreateLocation } from '@/lib/db/types';

/**
 * GET /api/locations
 * List all locations for a home
 * Query params:
 *  - homeId: filter by home ID (required)
 *  - topLevel: if true, only return top-level locations (no parent)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const homeId = searchParams.get('homeId');
    const topLevel = searchParams.get('topLevel') === 'true';

    if (!homeId) {
      return NextResponse.json({ error: 'homeId query parameter is required' }, { status: 400 });
    }

    const homeIdNum = parseInt(homeId);
    if (isNaN(homeIdNum)) {
      return NextResponse.json({ error: 'Invalid homeId' }, { status: 400 });
    }

    const locations = topLevel
      ? locationRepository.findTopLevel(homeIdNum)
      : locationRepository.findByHomeId(homeIdNum);

    return NextResponse.json({ data: locations, count: locations.length });
  } catch (error) {
    console.error('GET /api/locations error:', error);
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
  }
}

/**
 * POST /api/locations
 * Create a new location
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.home_id || !body.name) {
      return NextResponse.json(
        { error: 'Missing required fields: home_id, name' },
        { status: 400 }
      );
    }

    const locationData: CreateLocation = {
      home_id: body.home_id,
      name: body.name,
      description: body.description ?? null,
      floor_level: body.floor_level ?? null,
      parent_location_id: body.parent_location_id ?? null,
    };

    const newLocation = locationRepository.create(locationData);

    return NextResponse.json({ data: newLocation }, { status: 201 });
  } catch (error) {
    console.error('POST /api/locations error:', error);
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
  }
}
