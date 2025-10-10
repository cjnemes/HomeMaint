'use server';

import { revalidatePath } from 'next/cache';
import { maintenanceRecordRepository } from '@/lib/db/repositories';
import type { MaintenanceRecord, CreateMaintenanceRecord } from '@/lib/db/types';

/**
 * Get all maintenance records for an asset
 */
export async function getMaintenanceRecords(assetId: number): Promise<MaintenanceRecord[]> {
  try {
    return maintenanceRecordRepository.findByAssetId(assetId);
  } catch (error) {
    console.error(`Failed to get maintenance records for asset ${assetId}:`, error);
    throw new Error('Failed to fetch maintenance records');
  }
}

/**
 * Get a single maintenance record by ID
 */
export async function getMaintenanceRecordById(id: number): Promise<MaintenanceRecord | undefined> {
  try {
    return maintenanceRecordRepository.findById(id);
  } catch (error) {
    console.error(`Failed to get maintenance record ${id}:`, error);
    throw new Error('Failed to fetch maintenance record');
  }
}

/**
 * Get recent maintenance records (last N days)
 */
export async function getRecentMaintenanceRecords(
  assetId: number,
  days: number = 90
): Promise<MaintenanceRecord[]> {
  try {
    return maintenanceRecordRepository.findRecent(assetId, days);
  } catch (error) {
    console.error(`Failed to get recent maintenance records:`, error);
    throw new Error('Failed to fetch recent maintenance records');
  }
}

/**
 * Get maintenance records by type
 */
export async function getMaintenanceRecordsByType(
  assetId: number,
  maintenanceType: string
): Promise<MaintenanceRecord[]> {
  try {
    return maintenanceRecordRepository.findByType(assetId, maintenanceType);
  } catch (error) {
    console.error(`Failed to get maintenance records by type:`, error);
    throw new Error('Failed to fetch maintenance records');
  }
}

/**
 * Create a new maintenance record
 */
export async function createMaintenanceRecord(
  data: CreateMaintenanceRecord
): Promise<MaintenanceRecord> {
  try {
    const record = maintenanceRecordRepository.create(data);

    // Revalidate asset detail page
    revalidatePath(`/assets/${data.asset_id}`);
    revalidatePath('/maintenance');

    return record;
  } catch (error) {
    console.error('Failed to create maintenance record:', error);
    throw new Error('Failed to create maintenance record');
  }
}

/**
 * Update a maintenance record
 */
export async function updateMaintenanceRecord(
  id: number,
  data: Partial<CreateMaintenanceRecord>
): Promise<MaintenanceRecord | undefined> {
  try {
    const record = maintenanceRecordRepository.update(id, data);

    if (record) {
      // Revalidate relevant pages
      revalidatePath(`/assets/${record.asset_id}`);
      revalidatePath('/maintenance');
    }

    return record;
  } catch (error) {
    console.error(`Failed to update maintenance record ${id}:`, error);
    throw new Error('Failed to update maintenance record');
  }
}

/**
 * Delete a maintenance record
 */
export async function deleteMaintenanceRecord(id: number): Promise<boolean> {
  try {
    // Get the record first to know which asset to revalidate
    const record = await getMaintenanceRecordById(id);

    const result = maintenanceRecordRepository.delete(id);

    if (result && record) {
      // Revalidate relevant pages
      revalidatePath(`/assets/${record.asset_id}`);
      revalidatePath('/maintenance');
    }

    return result;
  } catch (error) {
    console.error(`Failed to delete maintenance record ${id}:`, error);
    throw new Error('Failed to delete maintenance record');
  }
}

/**
 * Get all maintenance types (for filter dropdown)
 */
export async function getMaintenanceTypes(): Promise<string[]> {
  return ['preventive', 'repair', 'inspection', 'replacement', 'emergency', 'seasonal', 'other'];
}
