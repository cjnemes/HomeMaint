import {
  homeRepository,
  categoryRepository,
  locationRepository,
  assetRepository,
} from '@/lib/db/repositories';

/**
 * Seed database with test data for E2E tests
 */
export function seedTestData() {
  // Get or create home
  const homes = homeRepository.findAll();
  let home = homes.length > 0 ? homes[0] : undefined;
  if (!home) {
    home = homeRepository.create({
      name: 'Test Home',
      notes: 'Test home for E2E tests',
    });
  }

  // Get categories (should already exist from default seed)
  const categories = categoryRepository.findByHomeId(home.id);
  const hvacCategory = categories.find((c) => c.name === 'HVAC');
  const plumbingCategory = categories.find((c) => c.name === 'Plumbing');
  const electricalCategory = categories.find((c) => c.name === 'Electrical');

  // Get locations (should already exist from default seed)
  const locations = locationRepository.findByHomeId(home.id);
  const kitchen = locations.find((l) => l.name === 'Kitchen');
  const livingRoom = locations.find((l) => l.name === 'Living Room');
  const garage = locations.find((l) => l.name === 'Garage');

  // Clear existing assets
  const existingAssets = assetRepository.findByHomeId(home.id);
  existingAssets.forEach((asset) => {
    assetRepository.delete(asset.id);
  });

  // Create test assets
  const testAssets = [
    {
      home_id: home.id,
      name: 'Central Air Conditioning Unit',
      manufacturer: 'Carrier',
      model_number: '24ACC636A003',
      serial_number: 'SN123456ABC',
      category_id: hvacCategory?.id || null,
      location_id: livingRoom?.id || null,
      status: 'active' as const,
      purchase_date: '2020-05-15',
      purchase_price: 4500,
      warranty_duration_months: 60,
      expected_lifespan_years: 15,
      notes: 'Main AC unit for the house',
      parent_asset_id: null,
      year_manufactured: null,
      installation_date: null,
      energy_rating: null,
      capacity: null,
      custom_fields: null,
    },
    {
      home_id: home.id,
      name: 'Water Heater',
      manufacturer: 'Rheem',
      model_number: 'XE50T10HS45U0',
      serial_number: 'WH789012DEF',
      category_id: plumbingCategory?.id || null,
      location_id: garage?.id || null,
      status: 'active' as const,
      purchase_date: '2021-03-20',
      purchase_price: 850,
      warranty_duration_months: 72,
      expected_lifespan_years: 12,
      notes: '50-gallon electric water heater',
      parent_asset_id: null,
      year_manufactured: null,
      installation_date: null,
      energy_rating: null,
      capacity: null,
      custom_fields: null,
    },
    {
      home_id: home.id,
      name: 'Furnace',
      manufacturer: 'Lennox',
      model_number: 'ML296V',
      serial_number: 'FN345678GHI',
      category_id: hvacCategory?.id || null,
      location_id: garage?.id || null,
      status: 'active' as const,
      purchase_date: '2019-11-10',
      purchase_price: 3200,
      warranty_duration_months: 120,
      expected_lifespan_years: 20,
      notes: 'High-efficiency gas furnace',
      parent_asset_id: null,
      year_manufactured: null,
      installation_date: null,
      energy_rating: null,
      capacity: null,
      custom_fields: null,
    },
    {
      home_id: home.id,
      name: 'Dishwasher',
      manufacturer: 'Bosch',
      model_number: 'SHPM88Z75N',
      serial_number: 'DW901234JKL',
      category_id: electricalCategory?.id || null,
      location_id: kitchen?.id || null,
      status: 'active' as const,
      purchase_date: '2022-01-15',
      purchase_price: 1200,
      warranty_duration_months: 24,
      expected_lifespan_years: 10,
      notes: 'Quiet dishwasher with third rack',
      parent_asset_id: null,
      year_manufactured: null,
      installation_date: null,
      energy_rating: null,
      capacity: null,
      custom_fields: null,
    },
    {
      home_id: home.id,
      name: 'Thermostat',
      manufacturer: 'Nest',
      model_number: 'T3007ES',
      serial_number: 'TH567890MNO',
      category_id: hvacCategory?.id || null,
      location_id: livingRoom?.id || null,
      status: 'active' as const,
      purchase_date: '2021-06-05',
      purchase_price: 250,
      warranty_duration_months: 24,
      expected_lifespan_years: 10,
      notes: 'Smart thermostat with learning capability',
      parent_asset_id: null,
      year_manufactured: null,
      installation_date: null,
      energy_rating: null,
      capacity: null,
      custom_fields: null,
    },
    {
      home_id: home.id,
      name: 'Garage Door Opener',
      manufacturer: 'Chamberlain',
      model_number: 'WD962KD',
      serial_number: 'GD123456PQR',
      category_id: electricalCategory?.id || null,
      location_id: garage?.id || null,
      status: 'active' as const,
      purchase_date: '2020-09-12',
      purchase_price: 320,
      warranty_duration_months: 12,
      expected_lifespan_years: 15,
      notes: 'Wi-Fi enabled garage door opener',
      parent_asset_id: null,
      year_manufactured: null,
      installation_date: null,
      energy_rating: null,
      capacity: null,
      custom_fields: null,
    },
  ];

  testAssets.forEach((asset) => {
    assetRepository.create(asset);
  });

  // eslint-disable-next-line no-console
  console.log(`Seeded ${testAssets.length} test assets`);

  return {
    home,
    categories,
    locations,
    assets: assetRepository.findByHomeId(home.id),
  };
}

/**
 * Clean test data
 */
export function cleanTestData() {
  const homes = homeRepository.findAll();
  if (homes.length > 0 && homes[0]) {
    const home = homes[0];
    const assets = assetRepository.findByHomeId(home.id);
    assets.forEach((asset) => {
      assetRepository.delete(asset.id);
    });
    // eslint-disable-next-line no-console
    console.log(`Cleaned ${assets.length} test assets`);
  }
}
