import { describe, it, expect, beforeEach, vi } from 'vitest';
import { exportAssetsAsCSV, exportMaintenanceAsCSV, exportTasksAsCSV } from '../export';
import {
  assetRepository,
  categoryRepository,
  locationRepository,
  maintenanceRecordRepository,
  maintenanceTaskRepository,
  homeRepository,
} from '@/lib/db/repositories';

// Mock Next.js cache revalidation
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock repositories
vi.mock('@/lib/db/repositories', () => ({
  assetRepository: {
    findByHomeId: vi.fn(),
  },
  categoryRepository: {
    findByHomeId: vi.fn(),
  },
  locationRepository: {
    findByHomeId: vi.fn(),
  },
  maintenanceRecordRepository: {
    findAll: vi.fn(),
  },
  maintenanceTaskRepository: {
    findAll: vi.fn(),
  },
  homeRepository: {
    findAll: vi.fn(),
  },
}));

describe('CSV Export Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock home for getFirstHome
    vi.mocked(homeRepository.findAll).mockReturnValue([
      {
        id: 1,
        name: 'Test Home',
        address_line1: null,
        address_line2: null,
        city: null,
        state: null,
        postal_code: null,
        country: null,
        year_built: null,
        square_footage: null,
        lot_size: null,
        purchase_date: null,
        purchase_price: null,
        notes: null,
        created_at: '2025-10-10T00:00:00.000Z',
        updated_at: '2025-10-10T00:00:00.000Z',
      },
    ]);
  });

  describe('Formula Injection Prevention', () => {
    it('should sanitize formula characters in asset names', async () => {
      vi.mocked(assetRepository.findByHomeId).mockReturnValue([
        {
          id: 1,
          home_id: 1,
          name: '=SUM(A1:A10)',
          status: 'active',
          category_id: null,
          location_id: null,
          parent_asset_id: null,
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
          custom_fields: null,
          created_at: '2025-10-10T00:00:00.000Z',
          updated_at: '2025-10-10T00:00:00.000Z',
        },
      ]);
      vi.mocked(categoryRepository.findByHomeId).mockReturnValue([]);
      vi.mocked(locationRepository.findByHomeId).mockReturnValue([]);

      const csv = await exportAssetsAsCSV();

      // Should prepend apostrophe to prevent formula execution
      expect(csv).toContain("'=SUM(A1:A10)");
      expect(csv).not.toMatch(/^=SUM\(A1:A10\)/m);
    });

    it('should sanitize + prefix in maintenance descriptions', async () => {
      vi.mocked(maintenanceRecordRepository.findAll).mockReturnValue([
        {
          id: 1,
          asset_id: 1,
          service_provider_id: null,
          maintenance_type: 'preventive',
          date_performed: '2025-10-10',
          title: '+1234567890',
          description: '+cmd|/c calc',
          cost: null,
          performed_by: null,
          parts_used: null,
          next_service_date: null,
          warranty_work: 0,
          notes: null,
          created_at: '2025-10-10T00:00:00.000Z',
          updated_at: '2025-10-10T00:00:00.000Z',
        },
      ]);
      vi.mocked(assetRepository.findByHomeId).mockReturnValue([]);

      const csv = await exportMaintenanceAsCSV();

      // Should prepend apostrophe to prevent formula execution
      expect(csv).toContain("'+1234567890");
      expect(csv).toContain("'+cmd|/c calc");
    });

    it('should sanitize @ and - prefixes in task titles', async () => {
      vi.mocked(maintenanceTaskRepository.findAll).mockReturnValue([
        {
          id: 1,
          asset_id: 1,
          title: '@SUM(1+1)',
          description: '-2+3+cmd|/c calc',
          due_date: '2025-10-20',
          priority: 'medium',
          status: 'pending',
          estimated_cost: null,
          estimated_duration: null,
          is_recurring: 0,
          recurrence_rule: null,
          completed_date: null,
          completed_maintenance_record_id: null,
          notes: null,
          created_at: '2025-10-10T00:00:00.000Z',
          updated_at: '2025-10-10T00:00:00.000Z',
        },
      ]);
      vi.mocked(assetRepository.findByHomeId).mockReturnValue([]);

      const csv = await exportTasksAsCSV();

      // Should prepend apostrophe to prevent formula execution
      expect(csv).toContain("'@SUM(1+1)");
      expect(csv).toContain("'-2+3+cmd|/c calc");
    });

    it('should not modify normal text values', async () => {
      vi.mocked(assetRepository.findByHomeId).mockReturnValue([
        {
          id: 1,
          home_id: 1,
          name: 'Normal Asset Name',
          status: 'active',
          category_id: null,
          location_id: null,
          parent_asset_id: null,
          manufacturer: 'Normal Manufacturer',
          model_number: 'ABC-123',
          serial_number: 'SN12345',
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
          custom_fields: null,
          created_at: '2025-10-10T00:00:00.000Z',
          updated_at: '2025-10-10T00:00:00.000Z',
        },
      ]);
      vi.mocked(categoryRepository.findByHomeId).mockReturnValue([]);
      vi.mocked(locationRepository.findByHomeId).mockReturnValue([]);

      const csv = await exportAssetsAsCSV();

      // Normal values should remain unchanged
      expect(csv).toContain('Normal Asset Name');
      expect(csv).toContain('Normal Manufacturer');
      expect(csv).toContain('ABC-123');
      expect(csv).not.toContain("'Normal");
    });
  });
});
