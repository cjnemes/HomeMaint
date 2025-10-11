'use server';

import {
  assetRepository,
  categoryRepository,
  locationRepository,
  maintenanceRecordRepository,
  maintenanceTaskRepository,
  attachmentRepository,
} from '@/lib/db/repositories';

/**
 * Export all data as JSON for complete backup
 */
export async function exportAllDataAsJSON(): Promise<string> {
  try {
    const data = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      data: {
        assets: assetRepository.findAll(),
        categories: categoryRepository.findAll(),
        locations: locationRepository.findAll(),
        maintenance_records: maintenanceRecordRepository.findAll(),
        tasks: maintenanceTaskRepository.findAll(),
        // Include file metadata but not file_data (too large)
        files_metadata: attachmentRepository.findAll().map((file) => ({
          ...file,
          file_path: file.file_path ? '[BASE64_DATA_OMITTED]' : null,
        })),
      },
    };

    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Failed to export data as JSON:', error);
    throw new Error('Failed to export data');
  }
}

/**
 * Export assets as CSV
 */
export async function exportAssetsAsCSV(): Promise<string> {
  try {
    const assets = assetRepository.findByHomeId(1);
    const categories = categoryRepository.findByHomeId(1);
    const locations = locationRepository.findByHomeId(1);

    // Create category and location lookup maps
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
    const locationMap = new Map(locations.map((l) => [l.id, l.name]));

    // CSV Headers
    const headers = [
      'ID',
      'Name',
      'Category',
      'Location',
      'Manufacturer',
      'Model Number',
      'Serial Number',
      'Year Manufactured',
      'Purchase Date',
      'Purchase Price',
      'Warranty Duration (months)',
      'Warranty Expiration',
      'Expected Lifespan (years)',
      'Status',
      'Notes',
      'Created At',
      'Updated At',
    ];

    // Convert assets to CSV rows
    const rows = assets.map((asset) => [
      asset.id,
      asset.name,
      asset.category_id ? categoryMap.get(asset.category_id) || '' : '',
      asset.location_id ? locationMap.get(asset.location_id) || '' : '',
      asset.manufacturer || '',
      asset.model_number || '',
      asset.serial_number || '',
      asset.year_manufactured || '',
      asset.purchase_date || '',
      asset.purchase_price || '',
      asset.warranty_duration_months || '',
      asset.warranty_expiration_date || '',
      asset.expected_lifespan_years || '',
      asset.status,
      asset.notes || '',
      asset.created_at,
      asset.updated_at,
    ]);

    return convertToCSV(headers, rows);
  } catch (error) {
    console.error('Failed to export assets as CSV:', error);
    throw new Error('Failed to export assets');
  }
}

/**
 * Export maintenance records as CSV
 */
export async function exportMaintenanceAsCSV(): Promise<string> {
  try {
    const records = maintenanceRecordRepository.findAll();
    const assets = assetRepository.findByHomeId(1);

    // Create asset lookup map
    const assetMap = new Map(assets.map((a) => [a.id, a.name]));

    // CSV Headers
    const headers = [
      'ID',
      'Asset',
      'Type',
      'Date Performed',
      'Title',
      'Description',
      'Cost',
      'Performed By',
      'Parts Used',
      'Next Service Date',
      'Warranty Work',
      'Notes',
      'Created At',
      'Updated At',
    ];

    // Convert records to CSV rows
    const rows = records.map((record) => [
      record.id,
      assetMap.get(record.asset_id) || '',
      record.maintenance_type,
      record.date_performed,
      record.title,
      record.description || '',
      record.cost || '',
      record.performed_by || '',
      record.parts_used || '',
      record.next_service_date || '',
      record.warranty_work ? 'Yes' : 'No',
      record.notes || '',
      record.created_at,
      record.updated_at,
    ]);

    return convertToCSV(headers, rows);
  } catch (error) {
    console.error('Failed to export maintenance records as CSV:', error);
    throw new Error('Failed to export maintenance records');
  }
}

/**
 * Export tasks as CSV
 */
export async function exportTasksAsCSV(): Promise<string> {
  try {
    const tasks = maintenanceTaskRepository.findAll();
    const assets = assetRepository.findByHomeId(1);

    // Create asset lookup map
    const assetMap = new Map(assets.map((a) => [a.id, a.name]));

    // CSV Headers
    const headers = [
      'ID',
      'Asset',
      'Title',
      'Description',
      'Due Date',
      'Priority',
      'Status',
      'Estimated Cost',
      'Estimated Duration (mins)',
      'Is Recurring',
      'Recurrence Rule',
      'Completed Date',
      'Notes',
      'Created At',
      'Updated At',
    ];

    // Convert tasks to CSV rows
    const rows = tasks.map((task) => [
      task.id,
      assetMap.get(task.asset_id) || '',
      task.title,
      task.description || '',
      task.due_date || '',
      task.priority,
      task.status,
      task.estimated_cost || '',
      task.estimated_duration || '',
      task.is_recurring ? 'Yes' : 'No',
      task.recurrence_rule || '',
      task.completed_date || '',
      task.notes || '',
      task.created_at,
      task.updated_at,
    ]);

    return convertToCSV(headers, rows);
  } catch (error) {
    console.error('Failed to export tasks as CSV:', error);
    throw new Error('Failed to export tasks');
  }
}

/**
 * Helper function to convert data to CSV format
 */
function convertToCSV(headers: string[], rows: (string | number)[][]): string {
  // Escape CSV fields
  const escapeField = (field: string | number): string => {
    const str = String(field);
    // If field contains comma, quote, or newline, wrap in quotes and escape quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Build CSV string
  const headerRow = headers.map(escapeField).join(',');
  const dataRows = rows.map((row) => row.map(escapeField).join(',')).join('\n');

  return `${headerRow}\n${dataRows}`;
}

/**
 * Get current date in YYYY-MM-DD format for filenames
 */
export async function getExportFilename(prefix: string, extension: string): Promise<string> {
  const date = new Date().toISOString().split('T')[0];
  return `${prefix}-${date}.${extension}`;
}
