import { z } from 'zod';

/**
 * Home schemas
 */
export const createHomeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  address_line1: z.string().max(255).nullable().optional(),
  address_line2: z.string().max(255).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  state: z.string().max(50).nullable().optional(),
  postal_code: z.string().max(20).nullable().optional(),
  country: z.string().max(50).nullable().optional(),
  year_built: z.number().int().min(1800).max(2100).nullable().optional(),
  square_footage: z.number().positive().nullable().optional(),
  lot_size: z.number().positive().nullable().optional(),
  purchase_date: z.string().nullable().optional(),
  purchase_price: z.number().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const updateHomeSchema = createHomeSchema.partial();

/**
 * Category schemas
 */
export const createCategorySchema = z.object({
  home_id: z.number().int().positive(),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
  color: z.string().max(7).nullable().optional(),
  sort_order: z.number().int().min(0).default(0),
  is_system: z.number().int().min(0).max(1).default(0),
});

export const updateCategorySchema = createCategorySchema.omit({ home_id: true }).partial();

/**
 * Location schemas
 */
export const createLocationSchema = z.object({
  home_id: z.number().int().positive(),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().nullable().optional(),
  floor_level: z.number().int().nullable().optional(),
  parent_location_id: z.number().int().positive().nullable().optional(),
});

export const updateLocationSchema = createLocationSchema.omit({ home_id: true }).partial();

/**
 * Asset schemas
 */
export const createAssetSchema = z.object({
  home_id: z.number().int().positive(),
  category_id: z.number().int().positive().nullable().optional(),
  location_id: z.number().int().positive().nullable().optional(),
  parent_asset_id: z.number().int().positive().nullable().optional(),
  name: z.string().min(1, 'Name is required').max(200),
  manufacturer: z.string().max(100).nullable().optional(),
  model_number: z.string().max(100).nullable().optional(),
  serial_number: z.string().max(100).nullable().optional(),
  year_manufactured: z.number().int().min(1900).max(2100).nullable().optional(),
  purchase_date: z.string().nullable().optional(),
  installation_date: z.string().nullable().optional(),
  purchase_price: z.number().positive().nullable().optional(),
  warranty_duration_months: z.number().int().positive().nullable().optional(),
  warranty_expiration_date: z.string().nullable().optional(),
  expected_lifespan_years: z.number().int().positive().nullable().optional(),
  estimated_replacement_date: z.string().nullable().optional(),
  estimated_replacement_cost: z.number().positive().nullable().optional(),
  energy_rating: z.string().max(20).nullable().optional(),
  capacity: z.string().max(50).nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(['active', 'retired', 'replaced', 'broken']).default('active'),
  custom_fields: z.string().nullable().optional(),
});

export const updateAssetSchema = createAssetSchema.omit({ home_id: true }).partial();

/**
 * Service Provider schemas
 */
export const createServiceProviderSchema = z.object({
  home_id: z.number().int().positive(),
  company_name: z.string().min(1, 'Company name is required').max(200),
  contact_name: z.string().max(100).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  email: z.string().email().max(255).nullable().optional(),
  website: z.string().url().max(255).nullable().optional(),
  address_line1: z.string().max(255).nullable().optional(),
  address_line2: z.string().max(255).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  state: z.string().max(50).nullable().optional(),
  postal_code: z.string().max(20).nullable().optional(),
  service_types: z.string().nullable().optional(),
  license_number: z.string().max(100).nullable().optional(),
  insurance_info: z.string().nullable().optional(),
  rating: z.number().min(1).max(5).nullable().optional(),
  notes: z.string().nullable().optional(),
  is_preferred: z.number().int().min(0).max(1).default(0),
});

export const updateServiceProviderSchema = createServiceProviderSchema
  .omit({ home_id: true })
  .partial();

/**
 * Maintenance Record schemas
 */
export const createMaintenanceRecordSchema = z.object({
  asset_id: z.number().int().positive(),
  service_provider_id: z.number().int().positive().nullable().optional(),
  date_performed: z.string(),
  maintenance_type: z.enum([
    'routine',
    'repair',
    'inspection',
    'replacement',
    'emergency',
    'upgrade',
    'cleaning',
  ]),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().nullable().optional(),
  cost: z.number().positive().nullable().optional(),
  performed_by: z.string().max(100).nullable().optional(),
  parts_used: z.string().nullable().optional(),
  next_service_date: z.string().nullable().optional(),
  warranty_work: z.number().int().min(0).max(1).default(0),
  notes: z.string().nullable().optional(),
});

export const updateMaintenanceRecordSchema = createMaintenanceRecordSchema
  .omit({ asset_id: true })
  .partial();

/**
 * Maintenance Task schemas
 */
export const createMaintenanceTaskSchema = z.object({
  asset_id: z.number().int().positive(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  estimated_cost: z.number().positive().nullable().optional(),
  estimated_duration: z.number().int().positive().nullable().optional(),
  recurrence_rule: z.string().max(100).nullable().optional(),
  is_recurring: z.number().int().min(0).max(1).default(0),
  status: z
    .enum(['pending', 'in_progress', 'completed', 'cancelled', 'overdue'])
    .default('pending'),
  completed_date: z.string().nullable().optional(),
  completed_maintenance_record_id: z.number().int().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const updateMaintenanceTaskSchema = createMaintenanceTaskSchema
  .omit({ asset_id: true })
  .partial();

/**
 * Attachment schemas
 */
export const createAttachmentSchema = z.object({
  home_id: z.number().int().positive(),
  asset_id: z.number().int().positive().nullable().optional(),
  maintenance_record_id: z.number().int().positive().nullable().optional(),
  file_name: z.string().min(1, 'File name is required').max(255),
  file_path: z.string().min(1, 'File path is required').max(500),
  file_size: z.number().int().positive().nullable().optional(),
  mime_type: z.string().max(100).nullable().optional(),
  file_type: z
    .enum(['photo', 'manual', 'receipt', 'warranty', 'invoice', 'other'])
    .nullable()
    .optional(),
  description: z.string().nullable().optional(),
  taken_date: z.string().nullable().optional(),
  thumbnail_path: z.string().max(500).nullable().optional(),
  metadata: z.string().nullable().optional(),
});

export const updateAttachmentSchema = createAttachmentSchema
  .omit({ home_id: true, asset_id: true, maintenance_record_id: true })
  .partial();
