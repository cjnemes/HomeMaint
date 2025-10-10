import { NextRequest, NextResponse } from 'next/server';
import { serviceProviderRepository } from '@/lib/db/repositories';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/service-providers/[id]
 * Get a single service provider by ID
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const providerId = parseInt(id);

    if (isNaN(providerId)) {
      return NextResponse.json({ error: 'Invalid provider ID' }, { status: 400 });
    }

    const provider = serviceProviderRepository.findById(providerId);

    if (!provider) {
      return NextResponse.json({ error: 'Service provider not found' }, { status: 404 });
    }

    return NextResponse.json({ data: provider });
  } catch (error) {
    console.error(`GET /api/service-providers/${(await params).id} error:`, error);
    return NextResponse.json({ error: 'Failed to fetch service provider' }, { status: 500 });
  }
}

/**
 * PUT /api/service-providers/[id]
 * Update an existing service provider
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const providerId = parseInt(id);

    if (isNaN(providerId)) {
      return NextResponse.json({ error: 'Invalid provider ID' }, { status: 400 });
    }

    // Check if provider exists
    const existingProvider = serviceProviderRepository.findById(providerId);
    if (!existingProvider) {
      return NextResponse.json({ error: 'Service provider not found' }, { status: 404 });
    }

    const body = await request.json();

    // Build update object with only provided fields
    const updateData: Partial<typeof existingProvider> = {};

    if (body.company_name !== undefined) updateData.company_name = body.company_name;
    if (body.contact_name !== undefined) updateData.contact_name = body.contact_name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.address_line1 !== undefined) updateData.address_line1 = body.address_line1;
    if (body.address_line2 !== undefined) updateData.address_line2 = body.address_line2;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.state !== undefined) updateData.state = body.state;
    if (body.postal_code !== undefined) updateData.postal_code = body.postal_code;
    if (body.service_types !== undefined) updateData.service_types = body.service_types;
    if (body.license_number !== undefined) updateData.license_number = body.license_number;
    if (body.insurance_info !== undefined) updateData.insurance_info = body.insurance_info;
    if (body.rating !== undefined) updateData.rating = body.rating;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.is_preferred !== undefined) updateData.is_preferred = body.is_preferred;

    const updatedProvider = serviceProviderRepository.update(providerId, updateData);

    if (!updatedProvider) {
      return NextResponse.json({ error: 'Failed to update service provider' }, { status: 500 });
    }

    return NextResponse.json({ data: updatedProvider });
  } catch (error) {
    console.error(`PUT /api/service-providers/${(await params).id} error:`, error);
    return NextResponse.json({ error: 'Failed to update service provider' }, { status: 500 });
  }
}

/**
 * DELETE /api/service-providers/[id]
 * Delete a service provider
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const providerId = parseInt(id);

    if (isNaN(providerId)) {
      return NextResponse.json({ error: 'Invalid provider ID' }, { status: 400 });
    }

    // Check if provider exists
    const existingProvider = serviceProviderRepository.findById(providerId);
    if (!existingProvider) {
      return NextResponse.json({ error: 'Service provider not found' }, { status: 404 });
    }

    const success = serviceProviderRepository.delete(providerId);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete service provider' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Service provider deleted successfully' });
  } catch (error) {
    console.error(`DELETE /api/service-providers/${(await params).id} error:`, error);
    return NextResponse.json({ error: 'Failed to delete service provider' }, { status: 500 });
  }
}
