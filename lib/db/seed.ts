import { db } from './database';
import { homeRepository, categoryRepository, locationRepository } from './repositories';

/**
 * Initialize the database with default data
 * This runs automatically when the database is first created
 */
export function seedDatabase() {
  try {
    // Check if we already have a home
    const existingHomes = homeRepository.findAll();
    if (existingHomes.length > 0) {
      console.log('Database already seeded');
      return;
    }
  } catch {
    // If repositories aren't initialized yet (e.g., during tests), skip seeding
    console.log('Skipping seed check - repositories not ready');
    return;
  }

  console.log('Seeding database with initial data...');

  // Create default home
  const home = homeRepository.create({
    name: 'My Home',
    notes: 'Created automatically on first launch',
  });

  console.log(`Created home: ${home.name} (ID: ${home.id})`);

  // Create default categories
  const categories = categoryRepository.createDefaultCategories(home.id);
  console.log(`Created ${categories.length} default categories`);

  // Create default locations
  const defaultLocations = [
    { name: 'Kitchen', floor_level: 1 },
    { name: 'Living Room', floor_level: 1 },
    { name: 'Master Bedroom', floor_level: 2 },
    { name: 'Bathroom', floor_level: 2 },
    { name: 'Garage', floor_level: 1 },
    { name: 'Basement', floor_level: 0 },
    { name: 'Attic', floor_level: 3 },
    { name: 'Exterior', floor_level: null },
  ];

  const locations = defaultLocations.map((loc) =>
    locationRepository.create({
      home_id: home.id,
      name: loc.name,
      floor_level: loc.floor_level,
      parent_location_id: null,
      description: null,
    })
  );

  console.log(`Created ${locations.length} default locations`);
  console.log('Database seeding complete!');

  return {
    home,
    categories,
    locations,
  };
}

/**
 * Reset database and reseed
 * WARNING: This will delete all data
 */
export function resetDatabase() {
  const database = db.getDatabase();

  // Delete all data
  database.exec('DELETE FROM attachments');
  database.exec('DELETE FROM maintenance_tasks');
  database.exec('DELETE FROM maintenance_records');
  database.exec('DELETE FROM service_providers');
  database.exec('DELETE FROM assets');
  database.exec('DELETE FROM locations');
  database.exec('DELETE FROM categories');
  database.exec('DELETE FROM homes');

  // Reset auto-increment sequences to ensure consistent IDs after reset
  database.exec(
    `DELETE FROM sqlite_sequence WHERE name IN (
      'homes', 'categories', 'locations', 'assets',
      'service_providers', 'maintenance_records',
      'maintenance_tasks', 'attachments'
    )`
  );

  console.log('Database reset complete');

  // Reseed
  return seedDatabase();
}
