import { NextRequest, NextResponse } from 'next/server';
import { serviceProviderRepository } from '@/lib/db/repositories';
import type { CreateServiceProvider } from '@/lib/db/types';

/**
 * GET /api/service-providers
 * List all service providers for a home
 * Query params:
 *  - homeId: filter by home ID (required)
 *  - preferred: if true, only return preferred providers
 *  - search: search by company name or service type
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const homeId = searchParams.get('homeId');
    const preferred = searchParams.get('preferred') === 'true';
    const search = searchParams.get('search');

    if (!homeId) {
      return NextResponse.json({ error: 'homeId query parameter is required' }, { status: 400 });
    }

    const homeIdNum = parseInt(homeId);
    if (isNaN(homeIdNum)) {
      return NextResponse.json({ error: 'Invalid homeId' }, { status: 400 });
    }

    let providers;

    if (search) {
      providers = serviceProviderRepository.search(homeIdNum, search);
    } else if (preferred) {
      providers = serviceProviderRepository.findPreferred(homeIdNum);
    } else {
      providers = serviceProviderRepository.findByHomeId(homeIdNum);
    }

    return NextResponse.json({ data: providers, count: providers.length });
  } catch (error) {
    console.error('GET /api/service-providers error:', error);
    return NextResponse.json({ error: 'Failed to fetch service providers' }, { status: 500 });
  }
}

/**
 * POST /api/service-providers
 * Create a new service provider
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.home_id || !body.company_name) {
      return NextResponse.json(
        { error: 'Missing required fields: home_id, company_name' },
        { status: 400 }
      );
    }

    const providerData: CreateServiceProvider = {
      home_id: body.home_id,
      company_name: body.company_name,
      contact_name: body.contact_name ?? null,
      phone: body.phone ?? null,
      email: body.email ?? null,
      website: body.website ?? null,
      address_line1: body.address_line1 ?? null,
      address_line2: body.address_line2 ?? null,
      city: body.city ?? null,
      state: body.state ?? null,
      postal_code: body.postal_code ?? null,
      service_types: body.service_types ?? null,
      license_number: body.license_number ?? null,
      insurance_info: body.insurance_info ?? null,
      rating: body.rating ?? null,
      notes: body.notes ?? null,
      is_preferred: body.is_preferred ?? 0,
    };

    const newProvider = serviceProviderRepository.create(providerData);

    return NextResponse.json({ data: newProvider }, { status: 201 });
  } catch (error) {
    console.error('POST /api/service-providers error:', error);
    return NextResponse.json({ error: 'Failed to create service provider' }, { status: 500 });
  }
}
