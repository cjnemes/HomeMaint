/**
 * Sample data generator for onboarding
 * Creates realistic demo data to showcase app features
 */

import { db } from '@/lib/db/database';

export async function generateSampleData(homeId: number): Promise<void> {
  // Sample Assets
  const sampleAssets = [
    {
      home_id: homeId,
      name: 'Gas Furnace',
      category_id: await getCategoryId(homeId, 'HVAC'),
      location_id: await getLocationId(homeId, 'Basement'),
      manufacturer: 'Carrier',
      model_number: '59SP5A100V21-20',
      serial_number: '2819F12345',
      year_manufactured: 2019,
      purchase_date: '2019-10-15',
      expected_lifespan_years: 20,
      notes: 'High-efficiency furnace installed by ABC Heating',
      status: 'active' as const,
    },
    {
      home_id: homeId,
      name: 'Central Air Conditioner',
      category_id: await getCategoryId(homeId, 'HVAC'),
      location_id: await getLocationId(homeId, 'Exterior'),
      manufacturer: 'Carrier',
      model_number: '24ACC636A003',
      serial_number: '2819C54321',
      year_manufactured: 2019,
      purchase_date: '2019-10-15',
      purchase_price: 3500,
      warranty_duration_months: 120,
      expected_lifespan_years: 15,
      notes: 'Installed with furnace by ABC Heating',
      status: 'active' as const,
    },
    {
      home_id: homeId,
      name: 'Kitchen Refrigerator',
      category_id: await getCategoryId(homeId, 'Appliances'),
      location_id: await getLocationId(homeId, 'Kitchen'),
      manufacturer: 'Samsung',
      model_number: 'RF28R7351SR',
      serial_number: 'RF28SAMPLE123',
      year_manufactured: 2021,
      purchase_date: '2021-06-20',
      purchase_price: 1899,
      warranty_duration_months: 24,
      expected_lifespan_years: 14,
      notes: 'French door with built-in water/ice dispenser',
      status: 'active' as const,
    },
    {
      home_id: homeId,
      name: 'Asphalt Shingle Roof',
      category_id: await getCategoryId(homeId, 'Roofing'),
      location_id: await getLocationId(homeId, 'Exterior'),
      manufacturer: 'CertainTeed',
      model_number: 'Landmark Series',
      year_manufactured: 2018,
      purchase_date: '2018-08-10',
      purchase_price: 8500,
      expected_lifespan_years: 25,
      notes: '30-year architectural shingles, installed by Pro Roofing',
      status: 'active' as const,
    },
  ];

  const assetIds: number[] = [];
  for (const assetData of sampleAssets) {
    const result = db
      .getDatabase()
      .prepare(
        `INSERT INTO assets (home_id, name, category_id, location_id, manufacturer, model_number,
         serial_number, year_manufactured, purchase_date, purchase_price, warranty_duration_months,
         expected_lifespan_years, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        assetData.home_id,
        assetData.name,
        assetData.category_id,
        assetData.location_id,
        assetData.manufacturer,
        assetData.model_number,
        assetData.serial_number || null,
        assetData.year_manufactured || null,
        assetData.purchase_date || null,
        assetData.purchase_price || null,
        assetData.warranty_duration_months || null,
        assetData.expected_lifespan_years || null,
        assetData.notes || null,
        assetData.status
      );
    assetIds.push(Number(result.lastInsertRowid));
  }

  // Sample Maintenance Records
  const sampleRecords = [
    {
      asset_id: assetIds[0], // Furnace
      date_performed: '2024-09-15',
      maintenance_type: 'routine',
      title: 'Annual Furnace Inspection',
      description: 'Cleaned burners, checked gas pressure, tested ignition system',
      cost: 125,
      performed_by: 'ABC Heating & Cooling',
      next_service_date: '2025-09-15',
      notes: 'All systems operating normally. Recommend filter change every 3 months.',
    },
    {
      asset_id: assetIds[1], // AC
      date_performed: '2024-05-20',
      maintenance_type: 'routine',
      title: 'AC Pre-Season Tune-Up',
      description: 'Checked refrigerant levels, cleaned coils, tested compressor',
      cost: 95,
      performed_by: 'ABC Heating & Cooling',
      next_service_date: '2025-05-20',
      notes: 'Ready for summer. Refrigerant levels good.',
    },
    {
      asset_id: assetIds[3], // Roof
      date_performed: '2024-10-05',
      maintenance_type: 'inspection',
      title: 'Fall Roof Inspection',
      description: 'Inspected for damaged shingles, checked flashing, cleaned gutters',
      cost: 150,
      performed_by: 'Pro Roofing Services',
      notes: 'No issues found. All shingles intact. Gutters cleaned.',
    },
  ];

  for (const recordData of sampleRecords) {
    db.getDatabase()
      .prepare(
        `INSERT INTO maintenance_records (asset_id, date_performed, maintenance_type, title,
       description, cost, performed_by, next_service_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        recordData.asset_id,
        recordData.date_performed,
        recordData.maintenance_type,
        recordData.title,
        recordData.description,
        recordData.cost,
        recordData.performed_by,
        recordData.next_service_date || null,
        recordData.notes || null
      );
  }

  // Sample Tasks
  const sampleTasks = [
    {
      asset_id: assetIds[0], // Furnace
      title: 'Replace furnace filter',
      description: 'Replace 20x25x4 MERV 11 filter',
      due_date: getDateOffset(30),
      priority: 'medium',
      estimated_cost: 25,
      recurrence_rule: 'Every 3 months',
      is_recurring: 1,
      status: 'pending',
      notes: 'Filters stored in basement storage closet',
    },
    {
      asset_id: assetIds[2], // Refrigerator
      title: 'Clean refrigerator coils',
      description: 'Vacuum dust from condenser coils on back/bottom of unit',
      due_date: getDateOffset(60),
      priority: 'low',
      estimated_cost: 0,
      recurrence_rule: 'Every 6 months',
      is_recurring: 1,
      status: 'pending',
      notes: 'Improves efficiency and extends life',
    },
    {
      asset_id: assetIds[3], // Roof
      title: 'Inspect for damaged shingles',
      description: 'Visual inspection from ground and attic for any damage or leaks',
      due_date: getDateOffset(90),
      priority: 'medium',
      estimated_cost: 0,
      recurrence_rule: 'Twice per year (spring and fall)',
      is_recurring: 1,
      status: 'pending',
      notes: 'Check after major storms',
    },
  ];

  for (const taskData of sampleTasks) {
    db.getDatabase()
      .prepare(
        `INSERT INTO maintenance_tasks (asset_id, title, description, due_date, priority,
       estimated_cost, recurrence_rule, is_recurring, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        taskData.asset_id,
        taskData.title,
        taskData.description,
        taskData.due_date,
        taskData.priority,
        taskData.estimated_cost,
        taskData.recurrence_rule || null,
        taskData.is_recurring,
        taskData.status,
        taskData.notes || null
      );
  }

  // Sample Service Providers
  const sampleProviders = [
    {
      home_id: homeId,
      company_name: 'ABC Heating & Cooling',
      contact_name: 'Mike Johnson',
      phone: '(555) 234-5678',
      email: 'service@abchvac.com',
      website: 'https://www.abchvac.com',
      service_types: 'HVAC, Furnace, Air Conditioning, Duct Cleaning',
      city: 'Denver',
      state: 'CO',
      postal_code: '80202',
      license_number: 'HVAC-CO-12345',
      rating: 4.8,
      is_preferred: 1,
      notes: '24/7 emergency service available',
    },
    {
      home_id: homeId,
      company_name: 'Pro Roofing Services',
      contact_name: 'Sarah Martinez',
      phone: '(555) 345-6789',
      email: 'info@proroofing.com',
      website: 'https://www.proroofing.com',
      service_types: 'Roofing, Gutters, Siding, Storm Damage',
      city: 'Denver',
      state: 'CO',
      postal_code: '80203',
      license_number: 'ROOF-CO-67890',
      rating: 4.9,
      is_preferred: 1,
      notes: 'Free inspections, 10-year workmanship warranty',
    },
    {
      home_id: homeId,
      company_name: 'Expert Appliance Repair',
      contact_name: 'Tom Chen',
      phone: '(555) 456-7890',
      email: 'repairs@expertappliance.com',
      service_types: 'Refrigerators, Washers, Dryers, Dishwashers, Ovens',
      city: 'Denver',
      state: 'CO',
      postal_code: '80204',
      rating: 4.5,
      is_preferred: 0,
      notes: 'Same-day service available for most repairs',
    },
  ];

  for (const providerData of sampleProviders) {
    db.getDatabase()
      .prepare(
        `INSERT INTO service_providers (home_id, company_name, contact_name, phone, email, website,
       service_types, city, state, postal_code, license_number, rating,
       is_preferred, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        providerData.home_id,
        providerData.company_name,
        providerData.contact_name,
        providerData.phone,
        providerData.email,
        providerData.website || null,
        providerData.service_types,
        providerData.city || null,
        providerData.state || null,
        providerData.postal_code || null,
        providerData.license_number || null,
        providerData.rating || null,
        providerData.is_preferred,
        providerData.notes || null
      );
  }
}

// Helper functions
async function getCategoryId(homeId: number, categoryName: string): Promise<number | null> {
  const category = db
    .getDatabase()
    .prepare('SELECT id FROM categories WHERE home_id = ? AND name = ? LIMIT 1')
    .get(homeId, categoryName) as { id: number } | undefined;
  return category?.id || null;
}

async function getLocationId(homeId: number, locationName: string): Promise<number | null> {
  const location = db
    .getDatabase()
    .prepare('SELECT id FROM locations WHERE home_id = ? AND name = ? LIMIT 1')
    .get(homeId, locationName) as { id: number } | undefined;
  return location?.id || null;
}

function getDateOffset(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0]!;
}
