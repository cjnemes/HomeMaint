import { NextRequest, NextResponse } from 'next/server';
import { categoryRepository } from '@/lib/db/repositories';
import type { CreateCategory } from '@/lib/db/types';

/**
 * GET /api/categories
 * List all categories for a home
 * Query params:
 *  - homeId: filter by home ID (required)
 *  - system: if true, only return system categories
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const homeId = searchParams.get('homeId');
    const systemOnly = searchParams.get('system') === 'true';

    if (!homeId) {
      return NextResponse.json({ error: 'homeId query parameter is required' }, { status: 400 });
    }

    const homeIdNum = parseInt(homeId);
    if (isNaN(homeIdNum)) {
      return NextResponse.json({ error: 'Invalid homeId' }, { status: 400 });
    }

    const categories = systemOnly
      ? categoryRepository.findSystemCategories(homeIdNum)
      : categoryRepository.findByHomeId(homeIdNum);

    return NextResponse.json({ data: categories, count: categories.length });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

/**
 * POST /api/categories
 * Create a new category
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

    const categoryData: CreateCategory = {
      home_id: body.home_id,
      name: body.name,
      description: body.description ?? null,
      icon: body.icon ?? null,
      color: body.color ?? null,
      sort_order: body.sort_order ?? 0,
      is_system: body.is_system ?? 0,
    };

    const newCategory = categoryRepository.create(categoryData);

    return NextResponse.json({ data: newCategory }, { status: 201 });
  } catch (error) {
    console.error('POST /api/categories error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
