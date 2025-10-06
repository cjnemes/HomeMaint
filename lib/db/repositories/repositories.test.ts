import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  homeRepository,
  categoryRepository,
  locationRepository,
  assetRepository,
  serviceProviderRepository,
  maintenanceRecordRepository,
  maintenanceTaskRepository,
  attachmentRepository,
} from './index';
import db from '../database';

describe('Repository Pattern', () => {
  let testHomeId: number;

  beforeAll(() => {
    // Create a test home
    const home = homeRepository.create({
      name: 'Test Home',
      city: 'San Francisco',
      state: 'CA',
      address_line1: null,
      address_line2: null,
      postal_code: null,
      country: null,
      year_built: null,
      square_footage: null,
      lot_size: null,
      purchase_date: null,
      purchase_price: null,
      notes: null,
    });
    testHomeId = home.id;
  });

  afterAll(() => {
    // Clean up test data
    const database = db.getDatabase();
    database.exec('DELETE FROM homes');
  });

  describe('HomeRepository', () => {
    it('should create and retrieve a home', () => {
      const home = homeRepository.findById(testHomeId);
      expect(home).toBeDefined();
      expect(home?.name).toBe('Test Home');
    });

    it('should update a home', () => {
      const updated = homeRepository.update(testHomeId, {
        year_built: 2020,
      });
      expect(updated?.year_built).toBe(2020);
    });

    it('should count homes', () => {
      const count = homeRepository.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('CategoryRepository', () => {
    beforeEach(async () => {
      // Clean up categories before each test
      const database = db.getDatabase();
      database.exec('DELETE FROM categories');
    });

    it('should create a category', () => {
      const category = categoryRepository.create({
        home_id: testHomeId,
        name: 'HVAC',
        description: 'Heating and cooling',
        icon: '🌡️',
        color: null,
        sort_order: 1,
        is_system: 1,
      });
      expect(category.name).toBe('HVAC');
      expect(category.id).toBeDefined();
    });

    it('should find categories by home', () => {
      categoryRepository.create({
        home_id: testHomeId,
        name: 'Plumbing',
        description: null,
        icon: '🚰',
        color: null,
        sort_order: 2,
        is_system: 1,
      });

      const categories = categoryRepository.findByHomeId(testHomeId);
      expect(categories.length).toBeGreaterThan(0);
    });

    it('should create default categories', () => {
      const categories = categoryRepository.createDefaultCategories(testHomeId);
      expect(categories.length).toBe(11);
      expect(categories[0]?.name).toBe('HVAC');
    });
  });

  describe('LocationRepository', () => {
    beforeEach(() => {
      const database = db.getDatabase();
      database.exec('DELETE FROM locations');
    });

    it('should create a location', () => {
      const location = locationRepository.create({
        home_id: testHomeId,
        name: 'Kitchen',
        description: 'Main kitchen',
        floor_level: 1,
        parent_location_id: null,
      });
      expect(location.name).toBe('Kitchen');
      expect(location.id).toBeDefined();
    });

    it('should find locations by home', () => {
      locationRepository.create({
        home_id: testHomeId,
        name: 'Garage',
        description: null,
        floor_level: 0,
        parent_location_id: null,
      });

      const locations = locationRepository.findByHomeId(testHomeId);
      expect(locations.length).toBeGreaterThan(0);
    });

    it('should find top-level locations', () => {
      const topLevel = locationRepository.findTopLevel(testHomeId);
      expect(Array.isArray(topLevel)).toBe(true);
    });
  });

  describe('AssetRepository', () => {
    beforeEach(() => {
      const database = db.getDatabase();
      database.exec('DELETE FROM assets');
    });

    it('should create an asset', () => {
      const asset = assetRepository.create({
        home_id: testHomeId,
        category_id: null,
        location_id: null,
        parent_asset_id: null,
        name: 'HVAC System',
        manufacturer: 'Carrier',
        model_number: 'ABC123',
        serial_number: null,
        year_manufactured: null,
        purchase_date: null,
        installation_date: null,
        purchase_price: null,
        warranty_duration_months: null,
        warranty_expiration_date: null,
        expected_lifespan_years: null,
        estimated_replacement_date: null,
        estimated_replacement_cost: null,
        energy_rating: null,
        capacity: null,
        notes: null,
        status: 'active',
        custom_fields: null,
      });
      expect(asset.name).toBe('HVAC System');
      expect(asset.id).toBeDefined();
    });

    it('should find assets by home', () => {
      assetRepository.create({
        home_id: testHomeId,
        category_id: null,
        location_id: null,
        parent_asset_id: null,
        name: 'Water Heater',
        manufacturer: null,
        model_number: null,
        serial_number: null,
        year_manufactured: null,
        purchase_date: null,
        installation_date: null,
        purchase_price: null,
        warranty_duration_months: null,
        warranty_expiration_date: null,
        expected_lifespan_years: null,
        estimated_replacement_date: null,
        estimated_replacement_cost: null,
        energy_rating: null,
        capacity: null,
        notes: null,
        status: 'active',
        custom_fields: null,
      });

      const assets = assetRepository.findByHomeId(testHomeId);
      expect(assets.length).toBeGreaterThan(0);
    });

    it('should find assets by status', () => {
      const assets = assetRepository.findByStatus(testHomeId, 'active');
      expect(Array.isArray(assets)).toBe(true);
    });

    it('should search assets', () => {
      const assets = assetRepository.search(testHomeId, 'HVAC');
      expect(Array.isArray(assets)).toBe(true);
    });
  });

  describe('ServiceProviderRepository', () => {
    beforeEach(() => {
      const database = db.getDatabase();
      database.exec('DELETE FROM service_providers');
    });

    it('should create a service provider', () => {
      const provider = serviceProviderRepository.create({
        home_id: testHomeId,
        company_name: 'ABC Plumbing',
        contact_name: 'John Doe',
        phone: '555-1234',
        email: null,
        website: null,
        address_line1: null,
        address_line2: null,
        city: null,
        state: null,
        postal_code: null,
        service_types: 'Plumbing',
        license_number: null,
        insurance_info: null,
        rating: null,
        notes: null,
        is_preferred: 1,
      });
      expect(provider.company_name).toBe('ABC Plumbing');
    });

    it('should find preferred providers', () => {
      const providers = serviceProviderRepository.findPreferred(testHomeId);
      expect(Array.isArray(providers)).toBe(true);
    });
  });

  describe('MaintenanceRecordRepository', () => {
    let assetId: number;

    beforeAll(() => {
      const database = db.getDatabase();
      database.exec('DELETE FROM assets');
      const asset = assetRepository.create({
        home_id: testHomeId,
        category_id: null,
        location_id: null,
        parent_asset_id: null,
        name: 'Test Asset',
        manufacturer: null,
        model_number: null,
        serial_number: null,
        year_manufactured: null,
        purchase_date: null,
        installation_date: null,
        purchase_price: null,
        warranty_duration_months: null,
        warranty_expiration_date: null,
        expected_lifespan_years: null,
        estimated_replacement_date: null,
        estimated_replacement_cost: null,
        energy_rating: null,
        capacity: null,
        notes: null,
        status: 'active',
        custom_fields: null,
      });
      assetId = asset.id;
    });

    beforeEach(() => {
      const database = db.getDatabase();
      database.exec('DELETE FROM maintenance_records');
    });

    it('should create a maintenance record', () => {
      const record = maintenanceRecordRepository.create({
        asset_id: assetId,
        service_provider_id: null,
        date_performed: '2024-01-15',
        maintenance_type: 'routine',
        title: 'Annual Maintenance',
        description: null,
        cost: null,
        performed_by: null,
        parts_used: null,
        next_service_date: null,
        warranty_work: 0,
        notes: null,
      });
      expect(record.title).toBe('Annual Maintenance');
    });

    it('should find records by asset', () => {
      const records = maintenanceRecordRepository.findByAssetId(assetId);
      expect(Array.isArray(records)).toBe(true);
    });
  });

  describe('MaintenanceTaskRepository', () => {
    let assetId: number;

    beforeAll(() => {
      const assets = assetRepository.findByHomeId(testHomeId);
      if (assets[0]) {
        assetId = assets[0].id;
      }
    });

    beforeEach(() => {
      const database = db.getDatabase();
      database.exec('DELETE FROM maintenance_tasks');
    });

    it('should create a maintenance task', () => {
      const task = maintenanceTaskRepository.create({
        asset_id: assetId,
        title: 'Replace air filter',
        description: null,
        due_date: '2024-12-01',
        priority: 'medium',
        estimated_cost: null,
        estimated_duration: null,
        recurrence_rule: null,
        is_recurring: 0,
        status: 'pending',
        completed_date: null,
        completed_maintenance_record_id: null,
        notes: null,
      });
      expect(task.title).toBe('Replace air filter');
    });

    it('should find tasks by status', () => {
      const tasks = maintenanceTaskRepository.findByStatus('pending');
      expect(Array.isArray(tasks)).toBe(true);
    });

    it('should find overdue tasks', () => {
      const tasks = maintenanceTaskRepository.findOverdue();
      expect(Array.isArray(tasks)).toBe(true);
    });
  });

  describe('AttachmentRepository', () => {
    let assetId: number;

    beforeAll(() => {
      const assets = assetRepository.findByHomeId(testHomeId);
      if (assets[0]) {
        assetId = assets[0].id;
      }
    });

    beforeEach(() => {
      const database = db.getDatabase();
      database.exec('DELETE FROM attachments');
    });

    it('should create an attachment', () => {
      const attachment = attachmentRepository.create({
        home_id: testHomeId,
        asset_id: assetId,
        maintenance_record_id: null,
        file_name: 'manual.pdf',
        file_path: '/uploads/manual.pdf',
        file_size: 1024,
        mime_type: 'application/pdf',
        file_type: 'manual',
        description: null,
        taken_date: null,
        thumbnail_path: null,
        metadata: null,
      });
      expect(attachment.file_name).toBe('manual.pdf');
    });

    it('should find attachments by asset', () => {
      const attachments = attachmentRepository.findByAssetId(assetId);
      expect(Array.isArray(attachments)).toBe(true);
    });

    it('should calculate total file size', () => {
      const totalSize = attachmentRepository.getTotalFileSize(testHomeId);
      expect(typeof totalSize).toBe('number');
    });

    it('should require asset_id or maintenance_record_id', () => {
      expect(() => {
        attachmentRepository.create({
          home_id: testHomeId,
          asset_id: null,
          maintenance_record_id: null,
          file_name: 'test.pdf',
          file_path: '/test.pdf',
          file_size: null,
          mime_type: null,
          file_type: null,
          description: null,
          taken_date: null,
          thumbnail_path: null,
          metadata: null,
        });
      }).toThrow('Attachment must be associated with an asset or maintenance record');
    });
  });
});
