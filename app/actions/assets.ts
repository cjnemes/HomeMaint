'use server';

import { revalidatePath } from 'next/cache';
import { assetRepository, categoryRepository, locationRepository } from '@/lib/db/repositories';
import type { Asset, CreateAsset } from '@/lib/db/types';

/**
 * Get all assets for a home
 */
export async function getAssets(homeId: number = 1): Promise<Asset[]> {
  try {
    return assetRepository.findByHomeId(homeId);
  } catch (error) {
    console.error('Failed to get assets:', error);
    throw new Error('Failed to fetch assets');
  }
}

/**
 * Get a single asset by ID
 */
export async function getAssetById(id: number): Promise<Asset | undefined> {
  try {
    return assetRepository.findById(id);
  } catch (error) {
    console.error(`Failed to get asset ${id}:`, error);
    throw new Error('Failed to fetch asset');
  }
}

/**
 * Search assets by query
 */
export async function searchAssets(query: string, homeId: number = 1): Promise<Asset[]> {
  try {
    if (!query.trim()) {
      return assetRepository.findByHomeId(homeId);
    }
    return assetRepository.search(homeId, query);
  } catch (error) {
    console.error('Failed to search assets:', error);
    throw new Error('Failed to search assets');
  }
}

/**
 * Get assets by category
 */
export async function getAssetsByCategory(categoryId: number): Promise<Asset[]> {
  try {
    return assetRepository.findByCategoryId(categoryId);
  } catch (error) {
    console.error(`Failed to get assets for category ${categoryId}:`, error);
    throw new Error('Failed to fetch assets');
  }
}

/**
 * Get assets by location
 */
export async function getAssetsByLocation(locationId: number): Promise<Asset[]> {
  try {
    return assetRepository.findByLocationId(locationId);
  } catch (error) {
    console.error(`Failed to get assets for location ${locationId}:`, error);
    throw new Error('Failed to fetch assets');
  }
}

/**
 * Get assets by status
 */
export async function getAssetsByStatus(status: string, homeId: number = 1): Promise<Asset[]> {
  try {
    return assetRepository.findByStatus(homeId, status);
  } catch (error) {
    console.error(`Failed to get assets with status ${status}:`, error);
    throw new Error('Failed to fetch assets');
  }
}

/**
 * Create a new asset
 */
export async function createAsset(data: CreateAsset): Promise<Asset> {
  try {
    const asset = assetRepository.create(data);

    // Revalidate all pages that might show this asset
    revalidatePath('/assets');
    revalidatePath('/dashboard');
    if (data.category_id) {
      revalidatePath(`/assets?category=${data.category_id}`);
    }

    return asset;
  } catch (error) {
    console.error('Failed to create asset:', error);
    throw new Error('Failed to create asset');
  }
}

/**
 * Update an existing asset
 */
export async function updateAsset(
  id: number,
  data: Partial<Omit<Asset, 'id' | 'created_at' | 'updated_at'>>
): Promise<Asset | undefined> {
  try {
    const asset = assetRepository.update(id, data);

    if (asset) {
      // Revalidate all related pages
      revalidatePath('/assets');
      revalidatePath(`/assets/${id}`);
      revalidatePath('/dashboard');
      if (asset.category_id) {
        revalidatePath(`/assets?category=${asset.category_id}`);
      }
    }

    return asset;
  } catch (error) {
    console.error(`Failed to update asset ${id}:`, error);
    throw new Error('Failed to update asset');
  }
}

/**
 * Delete an asset
 */
export async function deleteAsset(id: number): Promise<boolean> {
  try {
    // Get asset before deleting to know which pages to revalidate
    const asset = assetRepository.findById(id);
    const success = assetRepository.delete(id);

    if (success) {
      // Revalidate all related pages
      revalidatePath('/assets');
      revalidatePath('/dashboard');
      if (asset?.category_id) {
        revalidatePath(`/assets?category=${asset.category_id}`);
      }
    }

    return success;
  } catch (error) {
    console.error(`Failed to delete asset ${id}:`, error);
    throw new Error('Failed to delete asset');
  }
}

/**
 * Get categories for asset forms
 */
export async function getCategories(homeId: number = 1) {
  try {
    return categoryRepository.findByHomeId(homeId);
  } catch (error) {
    console.error('Failed to get categories:', error);
    throw new Error('Failed to fetch categories');
  }
}

/**
 * Get locations for asset forms
 */
export async function getLocations(homeId: number = 1) {
  try {
    return locationRepository.findByHomeId(homeId);
  } catch (error) {
    console.error('Failed to get locations:', error);
    throw new Error('Failed to fetch locations');
  }
}
