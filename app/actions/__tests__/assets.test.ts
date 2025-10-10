import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getCategories,
  getLocations,
} from '../assets';
import { assetRepository, categoryRepository, locationRepository } from '@/lib/db/repositories';
import type { Asset, CreateAsset } from '@/lib/db/types';

// Mock Next.js cache revalidation
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock repositories
vi.mock('@/lib/db/repositories', () => ({
  assetRepository: {
    findByHomeId: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  categoryRepository: {
    findByHomeId: vi.fn(),
  },
  locationRepository: {
    findByHomeId: vi.fn(),
  },
}));

describe('Asset Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAssets', () => {
    it('should return all assets for a home', async () => {
      const mockAssets: Asset[] = [
        {
          id: 1,
          home_id: 1,
          name: 'Test Asset',
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
      ];

      vi.mocked(assetRepository.findByHomeId).mockResolvedValue(mockAssets);

      const result = await getAssets(1);

      expect(result).toEqual(mockAssets);
      expect(assetRepository.findByHomeId).toHaveBeenCalledWith(1);
    });

    it('should use default homeId of 1 if not provided', async () => {
      vi.mocked(assetRepository.findByHomeId).mockResolvedValue([]);

      await getAssets();

      expect(assetRepository.findByHomeId).toHaveBeenCalledWith(1);
    });

    it('should throw error when repository fails', async () => {
      vi.mocked(assetRepository.findByHomeId).mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(getAssets(1)).rejects.toThrow('Failed to fetch assets');
    });
  });

  describe('getAssetById', () => {
    it('should return a single asset by ID', async () => {
      const mockAsset: Asset = {
        id: 1,
        home_id: 1,
        name: 'Test Asset',
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
      };

      vi.mocked(assetRepository.findById).mockResolvedValue(mockAsset);

      const result = await getAssetById(1);

      expect(result).toEqual(mockAsset);
      expect(assetRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should return undefined when asset not found', async () => {
      vi.mocked(assetRepository.findById).mockResolvedValue(undefined);

      const result = await getAssetById(999);

      expect(result).toBeUndefined();
    });

    it('should throw error when repository fails', async () => {
      vi.mocked(assetRepository.findById).mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(getAssetById(1)).rejects.toThrow('Failed to fetch asset');
    });
  });

  describe('createAsset', () => {
    it('should create asset with valid data', async () => {
      const createData: CreateAsset = {
        home_id: 1,
        name: 'New Asset',
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
        expected_lifespan_years: null,
        energy_rating: null,
        capacity: null,
        notes: null,
        custom_fields: null,
      };

      const mockCreatedAsset: Asset = {
        id: 1,
        ...createData,
        warranty_expiration_date: null,
        estimated_replacement_date: null,
        estimated_replacement_cost: null,
        created_at: '2025-10-10T00:00:00.000Z',
        updated_at: '2025-10-10T00:00:00.000Z',
      };

      vi.mocked(assetRepository.create).mockReturnValue(mockCreatedAsset);

      const result = await createAsset(createData);

      expect(result).toEqual(mockCreatedAsset);
      expect(assetRepository.create).toHaveBeenCalledWith(createData);
    });

    it('should create asset with category and location', async () => {
      const createData: CreateAsset = {
        home_id: 1,
        name: 'Water Heater',
        status: 'active',
        category_id: 2,
        location_id: 3,
        parent_asset_id: null,
        manufacturer: 'Test Manufacturer',
        model_number: 'ABC-123',
        serial_number: 'SN123',
        year_manufactured: null,
        purchase_date: null,
        installation_date: null,
        purchase_price: null,
        warranty_duration_months: null,
        expected_lifespan_years: null,
        energy_rating: null,
        capacity: null,
        notes: null,
        custom_fields: null,
      };

      const mockCreatedAsset: Asset = {
        id: 2,
        ...createData,
        warranty_expiration_date: null,
        estimated_replacement_date: null,
        estimated_replacement_cost: null,
        created_at: '2025-10-10T00:00:00.000Z',
        updated_at: '2025-10-10T00:00:00.000Z',
      };

      vi.mocked(assetRepository.create).mockReturnValue(mockCreatedAsset);

      const result = await createAsset(createData);

      expect(result).toEqual(mockCreatedAsset);
    });

    it('should throw error when repository fails', async () => {
      const createData: CreateAsset = {
        home_id: 1,
        name: 'Test Asset',
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
        expected_lifespan_years: null,
        energy_rating: null,
        capacity: null,
        notes: null,
        custom_fields: null,
      };

      vi.mocked(assetRepository.create).mockImplementation(() => {
        throw new Error('Database constraint failed');
      });

      await expect(createAsset(createData)).rejects.toThrow('Failed to create asset');
    });
  });

  describe('updateAsset', () => {
    it('should update asset with valid data', async () => {
      const updateData = {
        name: 'Updated Asset Name',
        status: 'retired' as const,
      };

      const mockUpdatedAsset: Asset = {
        id: 1,
        home_id: 1,
        name: 'Updated Asset Name',
        status: 'retired',
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
        updated_at: '2025-10-10T01:00:00.000Z',
      };

      vi.mocked(assetRepository.update).mockReturnValue(mockUpdatedAsset);

      const result = await updateAsset(1, updateData);

      expect(result).toEqual(mockUpdatedAsset);
      expect(assetRepository.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should return undefined when asset not found', async () => {
      vi.mocked(assetRepository.update).mockReturnValue(undefined);

      const result = await updateAsset(999, { name: 'Test' });

      expect(result).toBeUndefined();
    });

    it('should throw error when repository fails', async () => {
      vi.mocked(assetRepository.update).mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(updateAsset(1, { name: 'Test' })).rejects.toThrow('Failed to update asset');
    });
  });

  describe('deleteAsset', () => {
    it('should delete asset successfully', async () => {
      const mockAsset: Asset = {
        id: 1,
        home_id: 1,
        name: 'Asset to Delete',
        status: 'active',
        category_id: 2,
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
      };

      vi.mocked(assetRepository.findById).mockResolvedValue(mockAsset);
      vi.mocked(assetRepository.delete).mockReturnValue(true);

      const result = await deleteAsset(1);

      expect(result).toBe(true);
      expect(assetRepository.findById).toHaveBeenCalledWith(1);
      expect(assetRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should return false when asset not found', async () => {
      vi.mocked(assetRepository.findById).mockResolvedValue(undefined);
      vi.mocked(assetRepository.delete).mockReturnValue(false);

      const result = await deleteAsset(999);

      expect(result).toBe(false);
    });

    it('should throw error when repository fails', async () => {
      vi.mocked(assetRepository.findById).mockResolvedValue({} as Asset);
      vi.mocked(assetRepository.delete).mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(deleteAsset(1)).rejects.toThrow('Failed to delete asset');
    });
  });

  describe('getCategories', () => {
    it('should return all categories for a home', async () => {
      const mockCategories = [
        {
          id: 1,
          home_id: 1,
          name: 'HVAC',
          icon: '🌡️',
          description: null,
          color: null,
          sort_order: 0,
          is_system: 1,
          created_at: '2025-10-10T00:00:00.000Z',
          updated_at: '2025-10-10T00:00:00.000Z',
        },
      ];

      vi.mocked(categoryRepository.findByHomeId).mockResolvedValue(mockCategories);

      const result = await getCategories(1);

      expect(result).toEqual(mockCategories);
      expect(categoryRepository.findByHomeId).toHaveBeenCalledWith(1);
    });

    it('should throw error when repository fails', async () => {
      vi.mocked(categoryRepository.findByHomeId).mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(getCategories(1)).rejects.toThrow('Failed to fetch categories');
    });
  });

  describe('getLocations', () => {
    it('should return all locations for a home', async () => {
      const mockLocations = [
        {
          id: 1,
          home_id: 1,
          name: 'Kitchen',
          description: null,
          floor_level: 1,
          parent_location_id: null,
          created_at: '2025-10-10T00:00:00.000Z',
          updated_at: '2025-10-10T00:00:00.000Z',
        },
      ];

      vi.mocked(locationRepository.findByHomeId).mockResolvedValue(mockLocations);

      const result = await getLocations(1);

      expect(result).toEqual(mockLocations);
      expect(locationRepository.findByHomeId).toHaveBeenCalledWith(1);
    });

    it('should throw error when repository fails', async () => {
      vi.mocked(locationRepository.findByHomeId).mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(getLocations(1)).rejects.toThrow('Failed to fetch locations');
    });
  });
});
