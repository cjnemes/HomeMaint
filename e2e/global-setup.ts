import { seedTestData } from './test-seed';

async function globalSetup() {
  // eslint-disable-next-line no-console
  console.log('Setting up E2E test data...');

  try {
    seedTestData();
    // eslint-disable-next-line no-console
    console.log('✓ E2E test data seeded successfully');
  } catch (error) {
    console.error('Failed to seed test data:', error);
    throw error;
  }
}

export default globalSetup;
