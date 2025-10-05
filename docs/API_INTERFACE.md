# API & Data Layer Interface
## HomeMaint - Home Maintenance & Asset Tracking System

**Version:** 1.0
**Last Updated:** October 5, 2025
**Status:** Draft

---

## 1. Overview

This document defines the data layer architecture for HomeMaint, including database operations, state management, and data access patterns. Since the MVP is local-first with no backend API, this "API" refers to our data access layer that sits between React components and the local database.

**Architecture:**
```
React Components
       ↓
   Custom Hooks (useAssets, useMaintenance, etc.)
       ↓
Zustand Stores (State Management)
       ↓
   Service Layer (Business Logic)
       ↓
Repository Layer (Database Operations)
       ↓
 SQLite Database (sql.js) + IndexedDB (Files)
```

---

## 2. Database Layer

### 2.1 Database Initialization

```typescript
// src/lib/db/database.ts
import initSqlJs, { Database } from 'sql.js';

let db: Database | null = null;

export async function initializeDatabase(): Promise<Database> {
  if (db) return db;

  // Initialize sql.js
  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });

  // Try to load existing database from localStorage
  const savedDb = localStorage.getItem('homemaint-db');

  if (savedDb) {
    // Load existing database
    const buffer = Uint8Array.from(atob(savedDb), (c) => c.charCodeAt(0));
    db = new SQL.Database(buffer);
  } else {
    // Create new database
    db = new SQL.Database();
    await runMigrations(db);
  }

  // Auto-save on changes
  setupAutoSave(db);

  return db;
}

export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

export function saveDatabase(): void {
  if (!db) return;

  const data = db.export();
  const buffer = Buffer.from(data);
  const base64 = buffer.toString('base64');

  localStorage.setItem('homemaint-db', base64);
}

function setupAutoSave(database: Database): void {
  // Save database every 5 seconds if there are changes
  let hasChanges = false;

  setInterval(() => {
    if (hasChanges) {
      saveDatabase();
      hasChanges = false;
    }
  }, 5000);

  // Mark as changed on any query that modifies data
  const originalExec = database.exec.bind(database);
  database.exec = function (sql: string) {
    const result = originalExec(sql);
    if (sql.trim().toUpperCase().startsWith('INSERT') ||
        sql.trim().toUpperCase().startsWith('UPDATE') ||
        sql.trim().toUpperCase().startsWith('DELETE')) {
      hasChanges = true;
    }
    return result;
  };
}
```

### 2.2 Migrations

```typescript
// src/lib/db/migrations/index.ts
import { Database } from 'sql.js';

export interface Migration {
  version: number;
  up: (db: Database) => void;
  down: (db: Database) => void;
}

export const migrations: Migration[] = [
  {
    version: 1,
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS schema_version (
          version INTEGER PRIMARY KEY
        );

        CREATE TABLE IF NOT EXISTS homes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          address_line1 TEXT,
          city TEXT,
          state TEXT,
          postal_code TEXT,
          year_built INTEGER,
          square_footage REAL,
          notes TEXT,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          home_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          icon TEXT,
          color TEXT,
          sort_order INTEGER DEFAULT 0,
          is_system INTEGER DEFAULT 0,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (home_id) REFERENCES homes(id) ON DELETE CASCADE
        );

        CREATE INDEX idx_categories_home ON categories(home_id, sort_order);

        -- Additional tables from DATA_MODEL.md
        -- (locations, assets, service_providers, maintenance_records, maintenance_tasks, attachments)
      `);

      // Insert default home
      db.exec(`INSERT INTO homes (id, name) VALUES (1, 'My Home')`);

      // Insert default categories
      db.exec(`
        INSERT INTO categories (home_id, name, icon, color, sort_order, is_system) VALUES
        (1, 'HVAC', '🌡️', '#3b82f6', 1, 1),
        (1, 'Plumbing', '💧', '#06b6d4', 2, 1),
        (1, 'Electrical', '⚡', '#f59e0b', 3, 1),
        (1, 'Appliances', '🔌', '#8b5cf6', 4, 1),
        (1, 'Exterior', '🏡', '#10b981', 5, 1),
        (1, 'Roofing', '🏠', '#ef4444', 6, 1),
        (1, 'Other', '📦', '#6b7280', 7, 1);
      `);
    },
    down: (db) => {
      db.exec(`DROP TABLE IF EXISTS homes`);
      db.exec(`DROP TABLE IF EXISTS categories`);
      // Drop other tables
    },
  },
  // Future migrations go here
];

export async function runMigrations(db: Database): Promise<void> {
  // Get current version
  let currentVersion = 0;
  try {
    const result = db.exec('SELECT MAX(version) as version FROM schema_version');
    if (result[0]?.values[0]) {
      currentVersion = result[0].values[0][0] as number;
    }
  } catch (e) {
    // schema_version table doesn't exist yet
  }

  // Run pending migrations
  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      console.log(`Running migration ${migration.version}`);
      migration.up(db);
      db.exec(`INSERT INTO schema_version (version) VALUES (${migration.version})`);
    }
  }
}
```

---

## 3. Repository Layer (Database Operations)

### 3.1 Asset Repository

```typescript
// src/lib/db/repositories/asset-repository.ts
import { Database } from 'sql.js';
import type { Asset, CreateAssetInput, UpdateAssetInput } from '@/types';

export class AssetRepository {
  constructor(private db: Database) {}

  /**
   * Get all assets for a home
   */
  findAll(homeId: number = 1): Asset[] {
    const stmt = this.db.prepare(`
      SELECT
        a.*,
        c.name as category_name,
        c.color as category_color,
        l.name as location_name
      FROM assets a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN locations l ON a.location_id = l.id
      WHERE a.home_id = ?
      ORDER BY a.name ASC
    `);

    stmt.bind([homeId]);

    const assets: Asset[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      assets.push(this.mapRowToAsset(row));
    }

    stmt.free();
    return assets;
  }

  /**
   * Get single asset by ID
   */
  findById(id: number): Asset | null {
    const stmt = this.db.prepare(`
      SELECT
        a.*,
        c.name as category_name,
        c.color as category_color,
        l.name as location_name
      FROM assets a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN locations l ON a.location_id = l.id
      WHERE a.id = ?
    `);

    stmt.bind([id]);

    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return this.mapRowToAsset(row);
    }

    stmt.free();
    return null;
  }

  /**
   * Create new asset
   */
  create(input: CreateAssetInput): Asset {
    const stmt = this.db.prepare(`
      INSERT INTO assets (
        home_id, category_id, location_id, name, manufacturer,
        model_number, serial_number, year_manufactured, purchase_date,
        installation_date, purchase_price, warranty_duration_months,
        warranty_expiration_date, expected_lifespan_years,
        estimated_replacement_date, estimated_replacement_cost,
        energy_rating, capacity, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Calculate dates if needed
    const warrantyExpiration = input.warrantyDurationMonths
      ? this.calculateWarrantyExpiration(input.purchaseDate, input.warrantyDurationMonths)
      : null;

    const estimatedReplacement = input.expectedLifespanYears
      ? this.calculateReplacementDate(input.installationDate, input.expectedLifespanYears)
      : null;

    stmt.run([
      input.homeId || 1,
      input.categoryId,
      input.locationId,
      input.name,
      input.manufacturer,
      input.modelNumber,
      input.serialNumber,
      input.yearManufactured,
      input.purchaseDate,
      input.installationDate,
      input.purchasePrice,
      input.warrantyDurationMonths,
      warrantyExpiration,
      input.expectedLifespanYears,
      estimatedReplacement,
      input.estimatedReplacementCost,
      input.energyRating,
      input.capacity,
      input.notes,
      input.status || 'active',
    ]);

    stmt.free();

    // Get the inserted ID
    const id = this.db.exec('SELECT last_insert_rowid() as id')[0].values[0][0] as number;

    return this.findById(id)!;
  }

  /**
   * Update existing asset
   */
  update(id: number, input: UpdateAssetInput): Asset {
    const stmt = this.db.prepare(`
      UPDATE assets SET
        category_id = ?,
        location_id = ?,
        name = ?,
        manufacturer = ?,
        model_number = ?,
        serial_number = ?,
        year_manufactured = ?,
        purchase_date = ?,
        installation_date = ?,
        purchase_price = ?,
        warranty_duration_months = ?,
        warranty_expiration_date = ?,
        expected_lifespan_years = ?,
        estimated_replacement_date = ?,
        estimated_replacement_cost = ?,
        energy_rating = ?,
        capacity = ?,
        notes = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    // Recalculate dates if needed
    const warrantyExpiration = input.warrantyDurationMonths
      ? this.calculateWarrantyExpiration(input.purchaseDate, input.warrantyDurationMonths)
      : null;

    const estimatedReplacement = input.expectedLifespanYears
      ? this.calculateReplacementDate(input.installationDate, input.expectedLifespanYears)
      : null;

    stmt.run([
      input.categoryId,
      input.locationId,
      input.name,
      input.manufacturer,
      input.modelNumber,
      input.serialNumber,
      input.yearManufactured,
      input.purchaseDate,
      input.installationDate,
      input.purchasePrice,
      input.warrantyDurationMonths,
      warrantyExpiration,
      input.expectedLifespanYears,
      estimatedReplacement,
      input.estimatedReplacementCost,
      input.energyRating,
      input.capacity,
      input.notes,
      input.status,
      id,
    ]);

    stmt.free();

    return this.findById(id)!;
  }

  /**
   * Delete asset (cascade deletes maintenance records, tasks, attachments)
   */
  delete(id: number): void {
    const stmt = this.db.prepare('DELETE FROM assets WHERE id = ?');
    stmt.run([id]);
    stmt.free();
  }

  /**
   * Search assets by query
   */
  search(query: string, homeId: number = 1): Asset[] {
    const stmt = this.db.prepare(`
      SELECT
        a.*,
        c.name as category_name,
        c.color as category_color,
        l.name as location_name
      FROM assets a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN locations l ON a.location_id = l.id
      WHERE a.home_id = ?
        AND (
          a.name LIKE ? OR
          a.manufacturer LIKE ? OR
          a.model_number LIKE ? OR
          a.serial_number LIKE ?
        )
      ORDER BY a.name ASC
    `);

    const searchPattern = `%${query}%`;
    stmt.bind([homeId, searchPattern, searchPattern, searchPattern, searchPattern]);

    const assets: Asset[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      assets.push(this.mapRowToAsset(row));
    }

    stmt.free();
    return assets;
  }

  /**
   * Filter assets by category, location, status
   */
  filter(filters: AssetFilters, homeId: number = 1): Asset[] {
    let sql = `
      SELECT
        a.*,
        c.name as category_name,
        c.color as category_color,
        l.name as location_name
      FROM assets a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN locations l ON a.location_id = l.id
      WHERE a.home_id = ?
    `;

    const params: any[] = [homeId];

    if (filters.categoryId) {
      sql += ' AND a.category_id = ?';
      params.push(filters.categoryId);
    }

    if (filters.locationId) {
      sql += ' AND a.location_id = ?';
      params.push(filters.locationId);
    }

    if (filters.status) {
      sql += ' AND a.status = ?';
      params.push(filters.status);
    }

    sql += ' ORDER BY a.name ASC';

    const stmt = this.db.prepare(sql);
    stmt.bind(params);

    const assets: Asset[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      assets.push(this.mapRowToAsset(row));
    }

    stmt.free();
    return assets;
  }

  // Helper methods
  private mapRowToAsset(row: any): Asset {
    return {
      id: row.id,
      homeId: row.home_id,
      categoryId: row.category_id,
      locationId: row.location_id,
      name: row.name,
      manufacturer: row.manufacturer,
      modelNumber: row.model_number,
      serialNumber: row.serial_number,
      yearManufactured: row.year_manufactured,
      purchaseDate: row.purchase_date ? new Date(row.purchase_date) : null,
      installationDate: row.installation_date ? new Date(row.installation_date) : null,
      purchasePrice: row.purchase_price,
      warrantyDurationMonths: row.warranty_duration_months,
      warrantyExpirationDate: row.warranty_expiration_date
        ? new Date(row.warranty_expiration_date)
        : null,
      expectedLifespanYears: row.expected_lifespan_years,
      estimatedReplacementDate: row.estimated_replacement_date
        ? new Date(row.estimated_replacement_date)
        : null,
      estimatedReplacementCost: row.estimated_replacement_cost,
      energyRating: row.energy_rating,
      capacity: row.capacity,
      notes: row.notes,
      status: row.status,
      categoryName: row.category_name,
      categoryColor: row.category_color,
      locationName: row.location_name,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private calculateWarrantyExpiration(purchaseDate: Date, months: number): Date {
    const date = new Date(purchaseDate);
    date.setMonth(date.getMonth() + months);
    return date;
  }

  private calculateReplacementDate(installDate: Date, years: number): Date {
    const date = new Date(installDate);
    date.setFullYear(date.getFullYear() + years);
    return date;
  }
}
```

### 3.2 Maintenance Repository

```typescript
// src/lib/db/repositories/maintenance-repository.ts
export class MaintenanceRepository {
  constructor(private db: Database) {}

  findAll(homeId: number = 1): MaintenanceRecord[] {
    const stmt = this.db.prepare(`
      SELECT
        m.*,
        a.name as asset_name,
        sp.company_name as service_provider_name
      FROM maintenance_records m
      INNER JOIN assets a ON m.asset_id = a.id
      LEFT JOIN service_providers sp ON m.service_provider_id = sp.id
      WHERE a.home_id = ?
      ORDER BY m.date_performed DESC
    `);

    stmt.bind([homeId]);

    const records: MaintenanceRecord[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      records.push(this.mapRowToRecord(row));
    }

    stmt.free();
    return records;
  }

  findByAssetId(assetId: number): MaintenanceRecord[] {
    const stmt = this.db.prepare(`
      SELECT
        m.*,
        a.name as asset_name,
        sp.company_name as service_provider_name
      FROM maintenance_records m
      INNER JOIN assets a ON m.asset_id = a.id
      LEFT JOIN service_providers sp ON m.service_provider_id = sp.id
      WHERE m.asset_id = ?
      ORDER BY m.date_performed DESC
    `);

    stmt.bind([assetId]);

    const records: MaintenanceRecord[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      records.push(this.mapRowToRecord(row));
    }

    stmt.free();
    return records;
  }

  create(input: CreateMaintenanceInput): MaintenanceRecord {
    const stmt = this.db.prepare(`
      INSERT INTO maintenance_records (
        asset_id, service_provider_id, date_performed, maintenance_type,
        title, description, cost, performed_by, parts_used,
        next_service_date, warranty_work, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
      input.assetId,
      input.serviceProviderId,
      input.datePerformed,
      input.maintenanceType,
      input.title,
      input.description,
      input.cost,
      input.performedBy,
      input.partsUsed,
      input.nextServiceDate,
      input.warrantyWork ? 1 : 0,
      input.notes,
    ]);

    stmt.free();

    const id = this.db.exec('SELECT last_insert_rowid() as id')[0].values[0][0] as number;
    return this.findById(id)!;
  }

  // ... update, delete, filter methods
}
```

---

## 4. Service Layer (Business Logic)

```typescript
// src/lib/services/asset-service.ts
import { AssetRepository } from '@/lib/db/repositories/asset-repository';
import { getDatabase } from '@/lib/db/database';
import type { Asset, CreateAssetInput, UpdateAssetInput } from '@/types';

export class AssetService {
  private repository: AssetRepository;

  constructor() {
    const db = getDatabase();
    this.repository = new AssetRepository(db);
  }

  async getAllAssets(): Promise<Asset[]> {
    return this.repository.findAll();
  }

  async getAssetById(id: number): Promise<Asset | null> {
    return this.repository.findById(id);
  }

  async createAsset(input: CreateAssetInput): Promise<Asset> {
    // Business logic validation
    if (!input.name?.trim()) {
      throw new Error('Asset name is required');
    }

    if (!input.categoryId) {
      throw new Error('Category is required');
    }

    // Additional business logic
    return this.repository.create(input);
  }

  async updateAsset(id: number, input: UpdateAssetInput): Promise<Asset> {
    // Check if asset exists
    const existing = await this.getAssetById(id);
    if (!existing) {
      throw new Error(`Asset with ID ${id} not found`);
    }

    // Validation
    if (!input.name?.trim()) {
      throw new Error('Asset name is required');
    }

    return this.repository.update(id, input);
  }

  async deleteAsset(id: number): Promise<void> {
    // Check if asset exists
    const existing = await this.getAssetById(id);
    if (!existing) {
      throw new Error(`Asset with ID ${id} not found`);
    }

    return this.repository.delete(id);
  }

  async searchAssets(query: string): Promise<Asset[]> {
    if (!query.trim()) {
      return this.getAllAssets();
    }

    return this.repository.search(query);
  }

  async filterAssets(filters: AssetFilters): Promise<Asset[]> {
    return this.repository.filter(filters);
  }

  // Business logic helpers
  isWarrantyActive(asset: Asset): boolean {
    if (!asset.warrantyExpirationDate) return false;
    return new Date() < asset.warrantyExpirationDate;
  }

  isWarrantyExpiringSoon(asset: Asset, daysThreshold: number = 90): boolean {
    if (!asset.warrantyExpirationDate) return false;

    const today = new Date();
    const daysUntilExpiration =
      (asset.warrantyExpirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

    return daysUntilExpiration > 0 && daysUntilExpiration <= daysThreshold;
  }

  needsReplacement(asset: Asset): boolean {
    if (!asset.estimatedReplacementDate) return false;
    return new Date() >= asset.estimatedReplacementDate;
  }
}

// Export singleton instance
export const assetService = new AssetService();
```

---

## 5. State Management (Zustand)

```typescript
// src/stores/asset-store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { assetService } from '@/lib/services/asset-service';
import type { Asset, CreateAssetInput, UpdateAssetInput, AssetFilters } from '@/types';

interface AssetStore {
  // State
  assets: Asset[];
  selectedAsset: Asset | null;
  isLoading: boolean;
  error: string | null;
  filters: AssetFilters;
  searchQuery: string;

  // Computed/filtered assets
  filteredAssets: () => Asset[];

  // Actions
  loadAssets: () => Promise<void>;
  getAsset: (id: number) => Promise<void>;
  createAsset: (input: CreateAssetInput) => Promise<Asset>;
  updateAsset: (id: number, input: UpdateAssetInput) => Promise<Asset>;
  deleteAsset: (id: number) => Promise<void>;
  setFilters: (filters: AssetFilters) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  clearError: () => void;
}

export const useAssetStore = create<AssetStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      assets: [],
      selectedAsset: null,
      isLoading: false,
      error: null,
      filters: {},
      searchQuery: '',

      // Computed
      filteredAssets: () => {
        const { assets, filters, searchQuery } = get();

        let filtered = assets;

        // Apply search
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (asset) =>
              asset.name.toLowerCase().includes(query) ||
              asset.manufacturer?.toLowerCase().includes(query) ||
              asset.modelNumber?.toLowerCase().includes(query) ||
              asset.serialNumber?.toLowerCase().includes(query)
          );
        }

        // Apply filters
        if (filters.categoryId) {
          filtered = filtered.filter((asset) => asset.categoryId === filters.categoryId);
        }

        if (filters.locationId) {
          filtered = filtered.filter((asset) => asset.locationId === filters.locationId);
        }

        if (filters.status) {
          filtered = filtered.filter((asset) => asset.status === filters.status);
        }

        return filtered;
      },

      // Actions
      loadAssets: async () => {
        set({ isLoading: true, error: null });
        try {
          const assets = await assetService.getAllAssets();
          set({ assets, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load assets',
            isLoading: false,
          });
        }
      },

      getAsset: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const asset = await assetService.getAssetById(id);
          set({ selectedAsset: asset, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load asset',
            isLoading: false,
          });
        }
      },

      createAsset: async (input) => {
        set({ isLoading: true, error: null });
        try {
          const asset = await assetService.createAsset(input);
          set((state) => ({
            assets: [...state.assets, asset],
            isLoading: false,
          }));
          return asset;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to create asset';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      updateAsset: async (id, input) => {
        set({ isLoading: true, error: null });
        try {
          const updatedAsset = await assetService.updateAsset(id, input);
          set((state) => ({
            assets: state.assets.map((a) => (a.id === id ? updatedAsset : a)),
            selectedAsset: state.selectedAsset?.id === id ? updatedAsset : state.selectedAsset,
            isLoading: false,
          }));
          return updatedAsset;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to update asset';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      deleteAsset: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await assetService.deleteAsset(id);
          set((state) => ({
            assets: state.assets.filter((a) => a.id !== id),
            selectedAsset: state.selectedAsset?.id === id ? null : state.selectedAsset,
            isLoading: false,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to delete asset';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      setFilters: (filters) => set({ filters }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      clearFilters: () => set({ filters: {}, searchQuery: '' }),
      clearError: () => set({ error: null }),
    }),
    { name: 'AssetStore' }
  )
);
```

---

## 6. Custom Hooks

```typescript
// src/hooks/useAssets.ts
import { useEffect } from 'react';
import { useAssetStore } from '@/stores/asset-store';

/**
 * Hook for managing assets
 */
export function useAssets() {
  const {
    assets,
    filteredAssets,
    isLoading,
    error,
    filters,
    searchQuery,
    loadAssets,
    createAsset,
    updateAsset,
    deleteAsset,
    setFilters,
    setSearchQuery,
    clearFilters,
    clearError,
  } = useAssetStore();

  // Load assets on mount
  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  return {
    // Data
    assets: filteredAssets(),
    allAssets: assets,
    isLoading,
    error,
    filters,
    searchQuery,

    // Actions
    createAsset,
    updateAsset,
    deleteAsset,
    setFilters,
    setSearchQuery,
    clearFilters,
    clearError,
    refresh: loadAssets,
  };
}

/**
 * Hook for a single asset
 */
export function useAsset(id: number) {
  const { selectedAsset, isLoading, error, getAsset, updateAsset, deleteAsset } =
    useAssetStore();

  useEffect(() => {
    if (id) {
      getAsset(id);
    }
  }, [id, getAsset]);

  return {
    asset: selectedAsset,
    isLoading,
    error,
    updateAsset: (input: UpdateAssetInput) => updateAsset(id, input),
    deleteAsset: () => deleteAsset(id),
  };
}
```

---

## 7. File Storage (IndexedDB)

```typescript
// src/lib/storage/file-storage.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface FileDB extends DBSchema {
  files: {
    key: string;
    value: {
      id: string;
      fileName: string;
      mimeType: string;
      size: number;
      data: Blob;
      uploadedAt: Date;
    };
  };
}

let db: IDBPDatabase<FileDB> | null = null;

async function getDB(): Promise<IDBPDatabase<FileDB>> {
  if (!db) {
    db = await openDB<FileDB>('homemaint-files', 1, {
      upgrade(db) {
        db.createObjectStore('files', { keyPath: 'id' });
      },
    });
  }
  return db;
}

export async function uploadFile(file: File): Promise<string> {
  const database = await getDB();

  // Generate unique ID
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Store file
  await database.put('files', {
    id,
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
    data: file,
    uploadedAt: new Date(),
  });

  return id;
}

export async function getFile(id: string): Promise<File | null> {
  const database = await getDB();
  const record = await database.get('files', id);

  if (!record) return null;

  return new File([record.data], record.fileName, { type: record.mimeType });
}

export async function deleteFile(id: string): Promise<void> {
  const database = await getDB();
  await database.delete('files', id);
}

export async function getFileURL(id: string): Promise<string | null> {
  const file = await getFile(id);
  if (!file) return null;

  return URL.createObjectURL(file);
}
```

---

## 8. Data Export/Import

```typescript
// src/lib/export/export-service.ts
import { getDatabase } from '@/lib/db/database';

export async function exportToJSON(): Promise<string> {
  const db = getDatabase();

  // Export all tables
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    homes: queryAll(db, 'SELECT * FROM homes'),
    categories: queryAll(db, 'SELECT * FROM categories'),
    locations: queryAll(db, 'SELECT * FROM locations'),
    assets: queryAll(db, 'SELECT * FROM assets'),
    maintenanceRecords: queryAll(db, 'SELECT * FROM maintenance_records'),
    maintenanceTasks: queryAll(db, 'SELECT * FROM maintenance_tasks'),
    serviceProviders: queryAll(db, 'SELECT * FROM service_providers'),
    attachments: queryAll(db, 'SELECT * FROM attachments'),
  };

  return JSON.stringify(data, null, 2);
}

export async function exportToCSV(table: 'assets' | 'maintenance_records'): Promise<string> {
  const db = getDatabase();

  let query = '';
  if (table === 'assets') {
    query = `
      SELECT
        id, name, category_id, location_id, manufacturer, model_number,
        serial_number, purchase_date, warranty_expiration_date, status
      FROM assets
    `;
  } else if (table === 'maintenance_records') {
    query = `
      SELECT
        id, asset_id, date_performed, maintenance_type, title,
        description, cost, performed_by
      FROM maintenance_records
    `;
  }

  const results = db.exec(query);
  if (!results.length) return '';

  const columns = results[0].columns;
  const rows = results[0].values;

  // Build CSV
  const csv = [
    columns.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csv;
}

function queryAll(db: Database, sql: string): any[] {
  const results = db.exec(sql);
  if (!results.length) return [];

  const columns = results[0].columns;
  const rows = results[0].values;

  return rows.map((row) => {
    const obj: any = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });
}
```

---

## 9. Error Handling

```typescript
// src/lib/errors/app-errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: number | string) {
    super(`${resource} with ID ${id} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 'DATABASE_ERROR', 500);
    this.name = 'DatabaseError';
  }
}

// Error handler utility
export function handleError(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}
```

---

## 10. Type Definitions

```typescript
// src/types/asset.ts
export interface Asset {
  id: number;
  homeId: number;
  categoryId: number | null;
  locationId: number | null;
  name: string;
  manufacturer: string | null;
  modelNumber: string | null;
  serialNumber: string | null;
  yearManufactured: number | null;
  purchaseDate: Date | null;
  installationDate: Date | null;
  purchasePrice: number | null;
  warrantyDurationMonths: number | null;
  warrantyExpirationDate: Date | null;
  expectedLifespanYears: number | null;
  estimatedReplacementDate: Date | null;
  estimatedReplacementCost: number | null;
  energyRating: string | null;
  capacity: string | null;
  notes: string | null;
  status: AssetStatus;
  categoryName?: string;
  categoryColor?: string;
  locationName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AssetStatus = 'active' | 'retired' | 'broken' | 'replaced';

export interface CreateAssetInput {
  homeId?: number;
  categoryId: number;
  locationId?: number | null;
  name: string;
  manufacturer?: string | null;
  modelNumber?: string | null;
  serialNumber?: string | null;
  yearManufactured?: number | null;
  purchaseDate?: Date | null;
  installationDate?: Date | null;
  purchasePrice?: number | null;
  warrantyDurationMonths?: number | null;
  expectedLifespanYears?: number | null;
  estimatedReplacementCost?: number | null;
  energyRating?: string | null;
  capacity?: string | null;
  notes?: string | null;
  status?: AssetStatus;
}

export interface UpdateAssetInput extends CreateAssetInput {
  // Same as CreateAssetInput but all fields optional
}

export interface AssetFilters {
  categoryId?: number;
  locationId?: number;
  status?: AssetStatus;
}
```

---

## 11. Performance Optimization

### 11.1 Database Indexing

```sql
-- Already included in migrations
CREATE INDEX idx_assets_category ON assets(category_id);
CREATE INDEX idx_assets_location ON assets(location_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_maintenance_asset ON maintenance_records(asset_id, date_performed DESC);
CREATE INDEX idx_tasks_due ON maintenance_tasks(due_date, status);
```

### 11.2 Query Optimization

- Use prepared statements
- Select only needed columns
- Use indexes for WHERE clauses
- Limit results with pagination (future)

### 11.3 State Management Optimization

- Use selectors to avoid unnecessary re-renders
- Memoize computed values
- Debounce search queries

```typescript
// Debounced search
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const [searchInput, setSearchInput] = useState('');
const debouncedSearch = useDebouncedValue(searchInput, 300);

useEffect(() => {
  setSearchQuery(debouncedSearch);
}, [debouncedSearch]);
```

---

**This data layer architecture provides a solid, performant foundation for HomeMaint with clear separation of concerns and excellent developer experience!**
