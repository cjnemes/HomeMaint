// Database entity types

export interface Home {
  id: number;
  name: string;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  year_built?: number | null;
  square_footage?: number | null;
  lot_size?: number | null;
  purchase_date?: string | null;
  purchase_price?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  home_id: number;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  sort_order: number;
  is_system: number; // 0 or 1 (SQLite boolean)
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: number;
  home_id: number;
  name: string;
  description?: string | null;
  floor_level?: number | null;
  parent_location_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: number;
  home_id: number;
  category_id?: number | null;
  location_id?: number | null;
  parent_asset_id?: number | null;
  name: string;
  manufacturer?: string | null;
  model_number?: string | null;
  serial_number?: string | null;
  year_manufactured?: number | null;
  purchase_date?: string | null;
  installation_date?: string | null;
  purchase_price?: number | null;
  warranty_duration_months?: number | null;
  warranty_expiration_date?: string | null;
  expected_lifespan_years?: number | null;
  estimated_replacement_date?: string | null;
  estimated_replacement_cost?: number | null;
  energy_rating?: string | null;
  capacity?: string | null;
  notes?: string | null;
  status: string;
  custom_fields?: string | null; // JSON as string
  created_at: string;
  updated_at: string;
}

export interface ServiceProvider {
  id: number;
  home_id: number;
  company_name: string;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  service_types?: string | null;
  license_number?: string | null;
  insurance_info?: string | null;
  rating?: number | null;
  notes?: string | null;
  is_preferred: number; // 0 or 1 (SQLite boolean)
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRecord {
  id: number;
  asset_id: number;
  service_provider_id?: number | null;
  date_performed: string;
  maintenance_type: string;
  title: string;
  description?: string | null;
  cost?: number | null;
  performed_by?: string | null;
  parts_used?: string | null;
  next_service_date?: string | null;
  warranty_work: number; // 0 or 1 (SQLite boolean)
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceTask {
  id: number;
  asset_id: number;
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority: string;
  estimated_cost?: number | null;
  estimated_duration?: number | null;
  recurrence_rule?: string | null;
  is_recurring: number; // 0 or 1 (SQLite boolean)
  status: string;
  completed_date?: string | null;
  completed_maintenance_record_id?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: number;
  home_id: number;
  asset_id?: number | null;
  maintenance_record_id?: number | null;
  file_name: string;
  file_path: string;
  file_size?: number | null;
  mime_type?: string | null;
  file_type?: string | null;
  description?: string | null;
  taken_date?: string | null;
  thumbnail_path?: string | null;
  metadata?: string | null; // JSON as string
  created_at: string;
  updated_at: string;
}

// Input types for creating new records (omit auto-generated fields)

export type CreateHome = Omit<Home, 'id' | 'created_at' | 'updated_at'>;
export type CreateCategory = Omit<Category, 'id' | 'created_at' | 'updated_at'>;
export type CreateLocation = Omit<Location, 'id' | 'created_at' | 'updated_at'>;
export type CreateAsset = Omit<Asset, 'id' | 'created_at' | 'updated_at'>;
export type CreateServiceProvider = Omit<ServiceProvider, 'id' | 'created_at' | 'updated_at'>;
export type CreateMaintenanceRecord = Omit<MaintenanceRecord, 'id' | 'created_at' | 'updated_at'>;
export type CreateMaintenanceTask = Omit<MaintenanceTask, 'id' | 'created_at' | 'updated_at'>;
export type CreateAttachment = Omit<Attachment, 'id' | 'created_at' | 'updated_at'>;

// Update types (all fields optional except id)

export type UpdateHome = Partial<Omit<Home, 'id' | 'created_at' | 'updated_at'>> & {
  id: number;
};
export type UpdateCategory = Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>> & {
  id: number;
};
export type UpdateLocation = Partial<Omit<Location, 'id' | 'created_at' | 'updated_at'>> & {
  id: number;
};
export type UpdateAsset = Partial<Omit<Asset, 'id' | 'created_at' | 'updated_at'>> & {
  id: number;
};
export type UpdateServiceProvider = Partial<
  Omit<ServiceProvider, 'id' | 'created_at' | 'updated_at'>
> & { id: number };
export type UpdateMaintenanceRecord = Partial<
  Omit<MaintenanceRecord, 'id' | 'created_at' | 'updated_at'>
> & { id: number };
export type UpdateMaintenanceTask = Partial<
  Omit<MaintenanceTask, 'id' | 'created_at' | 'updated_at'>
> & { id: number };
export type UpdateAttachment = Partial<Omit<Attachment, 'id' | 'created_at' | 'updated_at'>> & {
  id: number;
};
