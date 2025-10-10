import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export class DatabaseService {
  private static instance: DatabaseService;
  private db: Database.Database;

  private constructor() {
    // Create data directory if it doesn't exist
    const dataDir = join(process.cwd(), 'data');
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }

    // Initialize database
    const dbPath = join(dataDir, 'homemaint.db');
    this.db = new Database(dbPath);

    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');

    // Run migrations
    this.runMigrations();

    // Seed database with initial data if needed
    this.seedIfNeeded();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public getDatabase(): Database.Database {
    return this.db;
  }

  private runMigrations(): void {
    // Create migrations table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        executed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get list of executed migrations
    const executedMigrations = this.db.prepare('SELECT name FROM migrations').all() as {
      name: string;
    }[];
    const executedSet = new Set(executedMigrations.map((m) => m.name));

    // Import and run pending migrations
    const migrations = this.getMigrations();

    for (const migration of migrations) {
      if (!executedSet.has(migration.name)) {
        console.log(`Running migration: ${migration.name}`);
        migration.up(this.db);
        this.db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migration.name);
        console.log(`Migration completed: ${migration.name}`);
      }
    }
  }

  private getMigrations(): Array<{
    name: string;
    up: (db: Database.Database) => void;
  }> {
    // Import migration files
    // For now, we'll define the initial migration inline
    return [
      {
        name: '001_initial_schema',
        up: (db: Database.Database) => {
          // Create homes table
          db.exec(`
            CREATE TABLE homes (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              address_line1 TEXT,
              address_line2 TEXT,
              city TEXT,
              state TEXT,
              postal_code TEXT,
              country TEXT,
              year_built INTEGER,
              square_footage REAL,
              lot_size REAL,
              purchase_date DATE,
              purchase_price REAL,
              notes TEXT,
              created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
          `);

          // Create categories table
          db.exec(`
            CREATE TABLE categories (
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
          `);

          // Create locations table
          db.exec(`
            CREATE TABLE locations (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              home_id INTEGER NOT NULL,
              name TEXT NOT NULL,
              description TEXT,
              floor_level INTEGER,
              parent_location_id INTEGER,
              created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (home_id) REFERENCES homes(id) ON DELETE CASCADE,
              FOREIGN KEY (parent_location_id) REFERENCES locations(id) ON DELETE SET NULL
            );

            CREATE INDEX idx_locations_home ON locations(home_id);
          `);

          // Create assets table
          db.exec(`
            CREATE TABLE assets (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              home_id INTEGER NOT NULL,
              category_id INTEGER,
              location_id INTEGER,
              parent_asset_id INTEGER,
              name TEXT NOT NULL,
              manufacturer TEXT,
              model_number TEXT,
              serial_number TEXT,
              year_manufactured INTEGER,
              purchase_date DATE,
              installation_date DATE,
              purchase_price REAL,
              warranty_duration_months INTEGER,
              warranty_expiration_date DATE,
              expected_lifespan_years INTEGER,
              estimated_replacement_date DATE,
              estimated_replacement_cost REAL,
              energy_rating TEXT,
              capacity TEXT,
              notes TEXT,
              status TEXT DEFAULT 'active',
              custom_fields TEXT,
              created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (home_id) REFERENCES homes(id) ON DELETE CASCADE,
              FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
              FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
              FOREIGN KEY (parent_asset_id) REFERENCES assets(id) ON DELETE SET NULL
            );

            CREATE INDEX idx_assets_home ON assets(home_id);
            CREATE INDEX idx_assets_category ON assets(category_id);
            CREATE INDEX idx_assets_status ON assets(home_id, status);
          `);

          // Create service_providers table
          db.exec(`
            CREATE TABLE service_providers (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              home_id INTEGER NOT NULL,
              company_name TEXT NOT NULL,
              contact_name TEXT,
              phone TEXT,
              email TEXT,
              website TEXT,
              address_line1 TEXT,
              address_line2 TEXT,
              city TEXT,
              state TEXT,
              postal_code TEXT,
              service_types TEXT,
              license_number TEXT,
              insurance_info TEXT,
              rating REAL,
              notes TEXT,
              is_preferred INTEGER DEFAULT 0,
              created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (home_id) REFERENCES homes(id) ON DELETE CASCADE
            );

            CREATE INDEX idx_providers_home ON service_providers(home_id);
          `);

          // Create maintenance_records table
          db.exec(`
            CREATE TABLE maintenance_records (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              asset_id INTEGER NOT NULL,
              service_provider_id INTEGER,
              date_performed DATE NOT NULL,
              maintenance_type TEXT NOT NULL,
              title TEXT NOT NULL,
              description TEXT,
              cost REAL,
              performed_by TEXT,
              parts_used TEXT,
              next_service_date DATE,
              warranty_work INTEGER DEFAULT 0,
              notes TEXT,
              created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
              FOREIGN KEY (service_provider_id) REFERENCES service_providers(id) ON DELETE SET NULL
            );

            CREATE INDEX idx_maintenance_asset ON maintenance_records(asset_id, date_performed DESC);
            CREATE INDEX idx_maintenance_date ON maintenance_records(date_performed DESC);
          `);

          // Create maintenance_tasks table
          db.exec(`
            CREATE TABLE maintenance_tasks (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              asset_id INTEGER NOT NULL,
              title TEXT NOT NULL,
              description TEXT,
              due_date DATE,
              priority TEXT DEFAULT 'medium',
              estimated_cost REAL,
              estimated_duration INTEGER,
              recurrence_rule TEXT,
              is_recurring INTEGER DEFAULT 0,
              status TEXT DEFAULT 'pending',
              completed_date DATE,
              completed_maintenance_record_id INTEGER,
              notes TEXT,
              created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
              FOREIGN KEY (completed_maintenance_record_id) REFERENCES maintenance_records(id) ON DELETE SET NULL
            );

            CREATE INDEX idx_tasks_asset ON maintenance_tasks(asset_id, due_date);
            CREATE INDEX idx_tasks_status ON maintenance_tasks(status, due_date);
            CREATE INDEX idx_tasks_due ON maintenance_tasks(due_date);
          `);

          // Create attachments table
          db.exec(`
            CREATE TABLE attachments (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              home_id INTEGER NOT NULL,
              asset_id INTEGER,
              maintenance_record_id INTEGER,
              file_name TEXT NOT NULL,
              file_path TEXT NOT NULL,
              file_size INTEGER,
              mime_type TEXT,
              file_type TEXT,
              description TEXT,
              taken_date DATE,
              thumbnail_path TEXT,
              metadata TEXT,
              created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (home_id) REFERENCES homes(id) ON DELETE CASCADE,
              FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
              FOREIGN KEY (maintenance_record_id) REFERENCES maintenance_records(id) ON DELETE CASCADE,
              CHECK (asset_id IS NOT NULL OR maintenance_record_id IS NOT NULL)
            );

            CREATE INDEX idx_attachments_asset ON attachments(asset_id, created_at DESC);
            CREATE INDEX idx_attachments_maintenance ON attachments(maintenance_record_id, created_at DESC);
          `);

          // Create triggers for updated_at timestamps
          db.exec(`
            CREATE TRIGGER update_homes_timestamp AFTER UPDATE ON homes
            BEGIN
              UPDATE homes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END;

            CREATE TRIGGER update_categories_timestamp AFTER UPDATE ON categories
            BEGIN
              UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END;

            CREATE TRIGGER update_locations_timestamp AFTER UPDATE ON locations
            BEGIN
              UPDATE locations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END;

            CREATE TRIGGER update_assets_timestamp AFTER UPDATE ON assets
            BEGIN
              UPDATE assets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END;

            CREATE TRIGGER update_service_providers_timestamp AFTER UPDATE ON service_providers
            BEGIN
              UPDATE service_providers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END;

            CREATE TRIGGER update_maintenance_records_timestamp AFTER UPDATE ON maintenance_records
            BEGIN
              UPDATE maintenance_records SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END;

            CREATE TRIGGER update_maintenance_tasks_timestamp AFTER UPDATE ON maintenance_tasks
            BEGIN
              UPDATE maintenance_tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END;

            CREATE TRIGGER update_attachments_timestamp AFTER UPDATE ON attachments
            BEGIN
              UPDATE attachments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END;
          `);
        },
      },
    ];
  }

  private seedIfNeeded(): void {
    // Check if database needs seeding (no homes exist)
    try {
      const result = this.db.prepare('SELECT COUNT(*) as count FROM homes').get() as {
        count: number;
      };

      if (result.count === 0) {
        console.log('Database is empty, running seed...');
        // Import and run seed - must be done dynamically to avoid circular dependency
        import('./seed').then(({ seedDatabase }) => {
          seedDatabase();
        });
      }
    } catch (error) {
      console.error('Error checking database seed status:', error);
    }
  }

  public close(): void {
    this.db.close();
  }
}

export const db = DatabaseService.getInstance();
export default db;
