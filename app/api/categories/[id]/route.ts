import { NextRequest, NextResponse } from 'next/server';
import { categoryRepository } from '@/lib/db/repositories';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/categories/[id]
 * Get a single category by ID
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    const category = categoryRepository.findById(categoryId);

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ data: category });
  } catch (error) {
    console.error(`GET /api/categories/${(await params).id} error:`, error);
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

/**
 * PUT /api/categories/[id]
 * Update an existing category
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    // Check if category exists
    const existingCategory = categoryRepository.findById(categoryId);
    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const body = await request.json();

    // Build update object with only provided fields
    const updateData: Partial<typeof existingCategory> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.color !== undefined) updateData.color = body.color;
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;

    const updatedCategory = categoryRepository.update(categoryId, updateData);

    if (!updatedCategory) {
      return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }

    return NextResponse.json({ data: updatedCategory });
  } catch (error) {
    console.error(`PUT /api/categories/${(await params).id} error:`, error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

/**
 * DELETE /api/categories/[id]
 * Delete a category
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    // Check if category exists
    const existingCategory = categoryRepository.findById(categoryId);
    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Prevent deleting system categories
    if (existingCategory.is_system === 1) {
      return NextResponse.json({ error: 'Cannot delete system categories' }, { status: 400 });
    }

    const success = categoryRepository.delete(categoryId);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(`DELETE /api/categories/${(await params).id} error:`, error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
