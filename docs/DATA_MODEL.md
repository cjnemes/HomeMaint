# Data Model & Schema Design

## HomeMaint - Home Maintenance & Asset Tracking System

**Version:** 1.0
**Last Updated:** October 5, 2025
**Status:** Draft

---

## 1. Overview

This document defines the data model and database schema for HomeMaint. The schema is designed to be flexible, extensible, and support both relational (PostgreSQL/SQLite) and document-based storage patterns.

---

## 2. Entity Relationship Diagram

```
┌─────────────┐
│    User     │ (Optional - for multi-user cloud version)
└──────┬──────┘
       │ 1:N
       ▼
┌─────────────┐
│    Home     │
└──────┬──────┘
       │ 1:N
       ├─────────────┬──────────────┬─────────────┐
       ▼             ▼              ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐
│ Category │  │  Asset   │  │ Service  │  │  Location   │
│          │  │          │  │ Provider │  │             │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘
     │ 1:N        │ 1:N         │ 1:N           │ 1:N
     │            ├──────┬───────┴────────┬──────┤
     ▼            ▼      ▼                ▼      ▼
  ┌──────┐   ┌──────────────────┐   ┌────────────────┐
  │Asset │   │ MaintenanceRecord│   │  Attachment    │
  └──────┘   └─────────┬────────┘   └────────────────┘
                       │ 1:N              │ N:1
                       ▼                  │
              ┌─────────────────┐         │
              │  Attachment     │◄────────┘
              └─────────────────┘
                       ▲
                       │ N:1
              ┌────────┴────────┐
              │MaintenanceTask  │
              └─────────────────┘
```

---

## 3. Core Entities

### 3.1 User

**Purpose:** Represents a user account (for cloud version with authentication)

**Fields:**

| Field         | Type         | Constraints             | Description                |
| ------------- | ------------ | ----------------------- | -------------------------- |
| id            | UUID/INTEGER | PRIMARY KEY             | Unique user identifier     |
| email         | VARCHAR(255) | UNIQUE, NOT NULL        | User email (login)         |
| password_hash | VARCHAR(255) | NOT NULL                | Hashed password            |
| first_name    | VARCHAR(100) |                         | User's first name          |
| last_name     | VARCHAR(100) |                         | User's last name           |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| updated_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Last update timestamp      |
| last_login_at | TIMESTAMP    |                         | Last login timestamp       |
| is_active     | BOOLEAN      | NOT NULL, DEFAULT TRUE  | Account status             |

**Indexes:**

- PRIMARY KEY: id
- UNIQUE INDEX: email

**Notes:**

- Not needed for MVP (single-user local version)
- Required for cloud multi-user version

---

### 3.2 Home

**Purpose:** Represents a home/property being tracked

**Fields:**

| Field          | Type          | Constraints             | Description                                |
| -------------- | ------------- | ----------------------- | ------------------------------------------ |
| id             | UUID/INTEGER  | PRIMARY KEY             | Unique home identifier                     |
| user_id        | UUID/INTEGER  | FOREIGN KEY, NULL       | Reference to User (NULL for local version) |
| name           | VARCHAR(200)  | NOT NULL                | Name/identifier for the home               |
| address_line1  | VARCHAR(255)  |                         | Street address                             |
| address_line2  | VARCHAR(255)  |                         | Apt/Unit number                            |
| city           | VARCHAR(100)  |                         | City                                       |
| state          | VARCHAR(50)   |                         | State/Province                             |
| postal_code    | VARCHAR(20)   |                         | Postal/ZIP code                            |
| country        | VARCHAR(50)   |                         | Country                                    |
| year_built     | INTEGER       |                         | Year home was built                        |
| square_footage | DECIMAL(10,2) |                         | Total square footage                       |
| lot_size       | DECIMAL(10,2) |                         | Lot size in acres or sq ft                 |
| purchase_date  | DATE          |                         | Date home was purchased                    |
| purchase_price | DECIMAL(12,2) |                         | Purchase price                             |
| notes          | TEXT          |                         | General notes about the home               |
| created_at     | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Record creation timestamp                  |
| updated_at     | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Last update timestamp                      |

**Indexes:**

- PRIMARY KEY: id
- FOREIGN KEY: user_id → User.id

**Notes:**

- For MVP, assume single home per user
- Future: support multiple homes

---

### 3.3 Category

**Purpose:** Categories for organizing assets (HVAC, Plumbing, Electrical, etc.)

**Fields:**

| Field       | Type         | Constraints             | Description                     |
| ----------- | ------------ | ----------------------- | ------------------------------- |
| id          | UUID/INTEGER | PRIMARY KEY             | Unique category identifier      |
| home_id     | UUID/INTEGER | FOREIGN KEY, NOT NULL   | Reference to Home               |
| name        | VARCHAR(100) | NOT NULL                | Category name                   |
| description | TEXT         |                         | Category description            |
| icon        | VARCHAR(50)  |                         | Icon identifier/emoji           |
| color       | VARCHAR(7)   |                         | Hex color code for UI           |
| sort_order  | INTEGER      | DEFAULT 0               | Display sort order              |
| is_system   | BOOLEAN      | DEFAULT FALSE           | System category (non-deletable) |
| created_at  | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Record creation timestamp       |
| updated_at  | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Last update timestamp           |

**Indexes:**

- PRIMARY KEY: id
- FOREIGN KEY: home_id → Home.id
- INDEX: (home_id, sort_order)

**Default Categories:**

- HVAC (Heating, Ventilation, Air Conditioning)
- Plumbing
- Electrical
- Appliances
- Exterior
- Roofing
- Flooring
- Windows & Doors
- Landscaping
- Security
- Other

---

### 3.4 Location

**Purpose:** Locations within the home (for organizing assets)

**Fields:**

| Field              | Type         | Constraints             | Description                                      |
| ------------------ | ------------ | ----------------------- | ------------------------------------------------ |
| id                 | UUID/INTEGER | PRIMARY KEY             | Unique location identifier                       |
| home_id            | UUID/INTEGER | FOREIGN KEY, NOT NULL   | Reference to Home                                |
| name               | VARCHAR(100) | NOT NULL                | Location name (e.g., "Master Bedroom", "Garage") |
| description        | TEXT         |                         | Location description                             |
| floor_level        | INTEGER      |                         | Floor level (0=basement, 1=first floor, etc.)    |
| parent_location_id | UUID/INTEGER | FOREIGN KEY, NULL       | Parent location (for nested locations)           |
| created_at         | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Record creation timestamp                        |
| updated_at         | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Last update timestamp                            |

**Indexes:**

- PRIMARY KEY: id
- FOREIGN KEY: home_id → Home.id
- FOREIGN KEY: parent_location_id → Location.id

**Examples:**

- Kitchen
- Master Bedroom
- Guest Bathroom
- Garage
- Attic
- Basement
- Backyard

---

### 3.5 Asset

**Purpose:** Represents a home system, appliance, or piece of equipment

**Fields:**

| Field                      | Type          | Constraints             | Description                                  |
| -------------------------- | ------------- | ----------------------- | -------------------------------------------- |
| id                         | UUID/INTEGER  | PRIMARY KEY             | Unique asset identifier                      |
| home_id                    | UUID/INTEGER  | FOREIGN KEY, NOT NULL   | Reference to Home                            |
| category_id                | UUID/INTEGER  | FOREIGN KEY, NULL       | Reference to Category                        |
| location_id                | UUID/INTEGER  | FOREIGN KEY, NULL       | Reference to Location                        |
| parent_asset_id            | UUID/INTEGER  | FOREIGN KEY, NULL       | Parent asset (for hierarchical systems)      |
| name                       | VARCHAR(200)  | NOT NULL                | Asset name/description                       |
| manufacturer               | VARCHAR(100)  |                         | Manufacturer/brand name                      |
| model_number               | VARCHAR(100)  |                         | Model number                                 |
| serial_number              | VARCHAR(100)  |                         | Serial number                                |
| year_manufactured          | INTEGER       |                         | Year of manufacture                          |
| purchase_date              | DATE          |                         | Date purchased                               |
| installation_date          | DATE          |                         | Date installed                               |
| purchase_price             | DECIMAL(10,2) |                         | Purchase price                               |
| warranty_duration_months   | INTEGER       |                         | Warranty duration in months                  |
| warranty_expiration_date   | DATE          |                         | Calculated or manual warranty expiration     |
| expected_lifespan_years    | INTEGER       |                         | Expected lifespan in years                   |
| estimated_replacement_date | DATE          |                         | Estimated replacement date                   |
| estimated_replacement_cost | DECIMAL(10,2) |                         | Estimated replacement cost                   |
| energy_rating              | VARCHAR(20)   |                         | Energy efficiency rating                     |
| capacity                   | VARCHAR(50)   |                         | Capacity/size (e.g., "5 tons", "50 gallons") |
| notes                      | TEXT          |                         | Additional notes                             |
| status                     | VARCHAR(20)   | DEFAULT 'active'        | Status: active, retired, replaced, broken    |
| custom_fields              | JSON/TEXT     |                         | Custom key-value pairs for flexibility       |
| created_at                 | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Record creation timestamp                    |
| updated_at                 | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Last update timestamp                        |

**Indexes:**

- PRIMARY KEY: id
- FOREIGN KEY: home_id → Home.id
- FOREIGN KEY: category_id → Category.id
- FOREIGN KEY: location_id → Location.id
- FOREIGN KEY: parent_asset_id → Asset.id
- INDEX: (home_id, category_id)
- INDEX: (home_id, status)

**Status Values:**

- active: Currently in use
- retired: No longer in use but kept for records
- replaced: Replaced by another asset
- broken: Not functioning, needs repair/replacement

---

### 3.6 MaintenanceRecord

**Purpose:** Historical record of maintenance performed on an asset

**Fields:**

| Field               | Type          | Constraints             | Description                                               |
| ------------------- | ------------- | ----------------------- | --------------------------------------------------------- |
| id                  | UUID/INTEGER  | PRIMARY KEY             | Unique maintenance record identifier                      |
| asset_id            | UUID/INTEGER  | FOREIGN KEY, NOT NULL   | Reference to Asset                                        |
| service_provider_id | UUID/INTEGER  | FOREIGN KEY, NULL       | Reference to ServiceProvider                              |
| date_performed      | DATE          | NOT NULL                | Date maintenance was performed                            |
| maintenance_type    | VARCHAR(50)   | NOT NULL                | Type: routine, repair, inspection, replacement, emergency |
| title               | VARCHAR(200)  | NOT NULL                | Brief title/summary                                       |
| description         | TEXT          |                         | Detailed description of work performed                    |
| cost                | DECIMAL(10,2) |                         | Cost of maintenance                                       |
| performed_by        | VARCHAR(100)  |                         | Who performed (DIY, company name, etc.)                   |
| parts_used          | TEXT          |                         | Parts/materials used                                      |
| next_service_date   | DATE          |                         | Recommended next service date                             |
| warranty_work       | BOOLEAN       | DEFAULT FALSE           | Was this warranty work?                                   |
| notes               | TEXT          |                         | Additional notes                                          |
| created_at          | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Record creation timestamp                                 |
| updated_at          | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Last update timestamp                                     |

**Indexes:**

- PRIMARY KEY: id
- FOREIGN KEY: asset_id → Asset.id
- FOREIGN KEY: service_provider_id → ServiceProvider.id
- INDEX: (asset_id, date_performed DESC)
- INDEX: (date_performed DESC)

**Maintenance Types:**

- routine: Regular scheduled maintenance
- repair: Fix something broken
- inspection: Inspection/assessment
- replacement: Part or full replacement
- emergency: Emergency repair
- upgrade: Improvement/upgrade
- cleaning: Cleaning service

---

### 3.7 MaintenanceTask

**Purpose:** Scheduled/planned future maintenance tasks

**Fields:**

| Field                           | Type          | Constraints             | Description                                                 |
| ------------------------------- | ------------- | ----------------------- | ----------------------------------------------------------- |
| id                              | UUID/INTEGER  | PRIMARY KEY             | Unique task identifier                                      |
| asset_id                        | UUID/INTEGER  | FOREIGN KEY, NOT NULL   | Reference to Asset                                          |
| title                           | VARCHAR(200)  | NOT NULL                | Task title                                                  |
| description                     | TEXT          |                         | Task description                                            |
| due_date                        | DATE          |                         | When task is due                                            |
| priority                        | VARCHAR(20)   | DEFAULT 'medium'        | Priority: low, medium, high, critical                       |
| estimated_cost                  | DECIMAL(10,2) |                         | Estimated cost                                              |
| estimated_duration              | INTEGER       |                         | Estimated duration in minutes                               |
| recurrence_rule                 | VARCHAR(100)  |                         | Recurrence pattern (RRULE format or simple)                 |
| is_recurring                    | BOOLEAN       | DEFAULT FALSE           | Is this a recurring task?                                   |
| status                          | VARCHAR(20)   | DEFAULT 'pending'       | Status: pending, in_progress, completed, cancelled, overdue |
| completed_date                  | DATE          |                         | Date completed                                              |
| completed_maintenance_record_id | UUID/INTEGER  | FOREIGN KEY, NULL       | Reference to completed MaintenanceRecord                    |
| notes                           | TEXT          |                         | Additional notes                                            |
| created_at                      | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Record creation timestamp                                   |
| updated_at                      | TIMESTAMP     | NOT NULL, DEFAULT NOW() | Last update timestamp                                       |

**Indexes:**

- PRIMARY KEY: id
- FOREIGN KEY: asset_id → Asset.id
- FOREIGN KEY: completed_maintenance_record_id → MaintenanceRecord.id
- INDEX: (asset_id, due_date)
- INDEX: (status, due_date)
- INDEX: (due_date)

**Priority Values:**

- low: Can wait
- medium: Normal priority
- high: Should be done soon
- critical: Urgent, safety issue

**Status Values:**

- pending: Not yet started
- in_progress: Currently being worked on
- completed: Done
- cancelled: Cancelled/no longer needed
- overdue: Past due date

**Recurrence Examples:**

- "FREQ=MONTHLY;INTERVAL=3" (every 3 months)
- "FREQ=YEARLY" (annually)
- Or simple: "monthly", "quarterly", "annually"

---

### 3.8 ServiceProvider

**Purpose:** Contact information for contractors, service companies, etc.

**Fields:**

| Field          | Type         | Constraints             | Description                  |
| -------------- | ------------ | ----------------------- | ---------------------------- |
| id             | UUID/INTEGER | PRIMARY KEY             | Unique provider identifier   |
| home_id        | UUID/INTEGER | FOREIGN KEY, NOT NULL   | Reference to Home            |
| company_name   | VARCHAR(200) | NOT NULL                | Company/business name        |
| contact_name   | VARCHAR(100) |                         | Primary contact person       |
| phone          | VARCHAR(20)  |                         | Phone number                 |
| email          | VARCHAR(255) |                         | Email address                |
| website        | VARCHAR(255) |                         | Website URL                  |
| address_line1  | VARCHAR(255) |                         | Street address               |
| address_line2  | VARCHAR(255) |                         | Suite/Unit                   |
| city           | VARCHAR(100) |                         | City                         |
| state          | VARCHAR(50)  |                         | State/Province               |
| postal_code    | VARCHAR(20)  |                         | Postal code                  |
| service_types  | TEXT         |                         | Types of services offered    |
| license_number | VARCHAR(100) |                         | License/certification number |
| insurance_info | TEXT         |                         | Insurance information        |
| rating         | DECIMAL(2,1) |                         | Personal rating (1-5)        |
| notes          | TEXT         |                         | Notes about provider         |
| is_preferred   | BOOLEAN      | DEFAULT FALSE           | Preferred provider flag      |
| created_at     | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Record creation timestamp    |
| updated_at     | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Last update timestamp        |

**Indexes:**

- PRIMARY KEY: id
- FOREIGN KEY: home_id → Home.id
- INDEX: (home_id, company_name)

---

### 3.9 Attachment

**Purpose:** Files, photos, documents associated with assets or maintenance records

**Fields:**

| Field                 | Type         | Constraints             | Description                                    |
| --------------------- | ------------ | ----------------------- | ---------------------------------------------- |
| id                    | UUID/INTEGER | PRIMARY KEY             | Unique attachment identifier                   |
| home_id               | UUID/INTEGER | FOREIGN KEY, NOT NULL   | Reference to Home                              |
| asset_id              | UUID/INTEGER | FOREIGN KEY, NULL       | Reference to Asset (if associated)             |
| maintenance_record_id | UUID/INTEGER | FOREIGN KEY, NULL       | Reference to MaintenanceRecord (if associated) |
| file_name             | VARCHAR(255) | NOT NULL                | Original file name                             |
| file_path             | VARCHAR(500) | NOT NULL                | Path/URL to file                               |
| file_size             | INTEGER      |                         | File size in bytes                             |
| mime_type             | VARCHAR(100) |                         | MIME type (image/jpeg, application/pdf, etc.)  |
| file_type             | VARCHAR(20)  |                         | Type: photo, manual, receipt, warranty, other  |
| description           | TEXT         |                         | Description of attachment                      |
| taken_date            | DATE         |                         | Date photo was taken or document created       |
| thumbnail_path        | VARCHAR(500) |                         | Path to thumbnail (for images)                 |
| metadata              | JSON/TEXT    |                         | Additional metadata (EXIF, etc.)               |
| created_at            | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Upload timestamp                               |
| updated_at            | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Last update timestamp                          |

**Indexes:**

- PRIMARY KEY: id
- FOREIGN KEY: home_id → Home.id
- FOREIGN KEY: asset_id → Asset.id
- FOREIGN KEY: maintenance_record_id → MaintenanceRecord.id
- INDEX: (asset_id, created_at DESC)
- INDEX: (maintenance_record_id, created_at DESC)

**File Types:**

- photo: Photographs
- manual: User manuals, documentation
- receipt: Purchase receipts
- warranty: Warranty documents
- invoice: Service invoices
- other: Miscellaneous

**Constraints:**

- Must have either asset_id OR maintenance_record_id (or both)
- CHECK constraint to ensure at least one is not NULL

---

## 4. Supporting Entities (Future)

### 4.1 Tag

**Purpose:** Custom tags for organizing/filtering assets

| Field   | Type         | Constraints           | Description           |
| ------- | ------------ | --------------------- | --------------------- |
| id      | UUID/INTEGER | PRIMARY KEY           | Unique tag identifier |
| home_id | UUID/INTEGER | FOREIGN KEY, NOT NULL | Reference to Home     |
| name    | VARCHAR(50)  | NOT NULL              | Tag name              |
| color   | VARCHAR(7)   |                       | Hex color code        |

**Join Table: AssetTag**

| Field    | Type         | Constraints           | Description        |
| -------- | ------------ | --------------------- | ------------------ |
| asset_id | UUID/INTEGER | FOREIGN KEY, NOT NULL | Reference to Asset |
| tag_id   | UUID/INTEGER | FOREIGN KEY, NOT NULL | Reference to Tag   |

---

## 5. Schema Examples

### 5.1 SQLite Schema (MVP)

```sql
-- Home table
CREATE TABLE homes (
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

-- Category table
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

-- Location table
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

-- Asset table
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
    custom_fields TEXT, -- JSON as text
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

-- ServiceProvider table
CREATE TABLE service_providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    home_id INTEGER NOT NULL,
    company_name TEXT NOT NULL,
    contact_name TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    address_line1 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    service_types TEXT,
    license_number TEXT,
    rating REAL,
    notes TEXT,
    is_preferred INTEGER DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (home_id) REFERENCES homes(id) ON DELETE CASCADE
);

CREATE INDEX idx_providers_home ON service_providers(home_id);

-- MaintenanceRecord table
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

-- MaintenanceTask table
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

-- Attachment table
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
    metadata TEXT, -- JSON as text
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (home_id) REFERENCES homes(id) ON DELETE CASCADE,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (maintenance_record_id) REFERENCES maintenance_records(id) ON DELETE CASCADE,
    CHECK (asset_id IS NOT NULL OR maintenance_record_id IS NOT NULL)
);

CREATE INDEX idx_attachments_asset ON attachments(asset_id, created_at DESC);
CREATE INDEX idx_attachments_maintenance ON attachments(maintenance_record_id, created_at DESC);

-- Triggers for updated_at timestamps
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
```

---

## 6. Sample Data

### 6.1 Sample Asset Entry

```json
{
  "id": 1,
  "home_id": 1,
  "category_id": 1,
  "location_id": 5,
  "name": "Carrier Central Air Conditioner",
  "manufacturer": "Carrier",
  "model_number": "24ACC636A003",
  "serial_number": "4218C12345",
  "year_manufactured": 2018,
  "installation_date": "2018-06-15",
  "purchase_price": 4500.0,
  "warranty_duration_months": 120,
  "warranty_expiration_date": "2028-06-15",
  "expected_lifespan_years": 15,
  "estimated_replacement_date": "2033-06-15",
  "estimated_replacement_cost": 6000.0,
  "energy_rating": "SEER 16",
  "capacity": "3 tons",
  "notes": "Annual maintenance required. Filter in attic should be changed monthly.",
  "status": "active"
}
```

### 6.2 Sample Maintenance Record

```json
{
  "id": 1,
  "asset_id": 1,
  "service_provider_id": 3,
  "date_performed": "2024-04-15",
  "maintenance_type": "routine",
  "title": "Annual HVAC Maintenance",
  "description": "Inspected system, cleaned coils, checked refrigerant levels, tested all functions. System operating normally.",
  "cost": 149.0,
  "performed_by": "ABC Heating & Cooling",
  "parts_used": "Air filter (16x25x1)",
  "next_service_date": "2025-04-15",
  "warranty_work": false,
  "notes": "Technician recommends replacing capacitor in next 1-2 years"
}
```

### 6.3 Sample Maintenance Task

```json
{
  "id": 1,
  "asset_id": 1,
  "title": "Replace HVAC Air Filter",
  "description": "Replace 16x25x1 air filter in attic",
  "due_date": "2024-11-01",
  "priority": "medium",
  "estimated_cost": 15.0,
  "estimated_duration": 10,
  "recurrence_rule": "FREQ=MONTHLY",
  "is_recurring": true,
  "status": "pending"
}
```

---

## 7. Data Validation Rules

### Asset Validation

- Name is required (max 200 chars)
- Status must be one of: active, retired, replaced, broken
- If purchase_date is set, it should be <= today
- If warranty_duration_months is set, auto-calculate warranty_expiration_date
- If expected_lifespan_years is set, auto-calculate estimated_replacement_date

### Maintenance Record Validation

- date_performed is required and should be <= today
- maintenance_type must be one of: routine, repair, inspection, replacement, emergency, upgrade, cleaning
- cost should be >= 0
- Must reference a valid asset

### Maintenance Task Validation

- Title is required
- Priority must be one of: low, medium, high, critical
- Status must be one of: pending, in_progress, completed, cancelled, overdue
- If completed, completed_date should be set
- estimated_cost should be >= 0

### Attachment Validation

- Must reference either asset_id OR maintenance_record_id (or both)
- file_name and file_path are required
- MIME type should match file extension
- file_size should be within limits (e.g., 10MB)

---

## 8. Data Migration Considerations

### From Spreadsheet

- Map columns to asset fields
- Parse dates carefully (various formats)
- Handle missing data gracefully
- Create default category if none specified

### Export Formats

- CSV: One row per asset with flattened relationships
- JSON: Full hierarchical structure
- PDF: Formatted report with images
- Backup: SQLite database file or SQL dump

---

## 9. Data Retention & Archival

### Retention Policy

- Active assets: Indefinite
- Retired assets: Keep for tax/warranty purposes (7 years recommended)
- Maintenance records: Keep indefinitely for historical value
- Attachments: Keep as long as associated asset/record exists

### Archival Strategy

- Soft delete (set status to 'retired' instead of DELETE)
- Archive old records to separate table after N years
- Provide export before archival
- Keep audit log of deletions

---

## 10. Performance Optimization

### Indexing Strategy

- Index all foreign keys
- Composite indexes for common queries:
  - (home_id, category_id) for filtered asset lists
  - (asset_id, date_performed DESC) for maintenance history
  - (due_date, status) for task lists

### Query Optimization

- Use pagination for large lists (100 records per page)
- Lazy load attachments
- Cache category/location lookups
- Denormalize computed fields (warranty_expiration_date)

### Storage Optimization

- Compress images before storage
- Limit file attachment sizes
- Clean up orphaned files
- Vacuum SQLite database periodically

---

## 11. Future Enhancements

### Phase 2 Schema Additions

- **Activity Log**: Track all changes for audit trail
- **Notifications**: Stored notification preferences and history
- **Custom Fields per Category**: Define custom fields at category level
- **Energy Tracking**: Link utility bills to assets
- **Insurance Items**: Flag items for insurance inventory

### Phase 3 Schema Additions

- **Multi-User**: Share home access with family
- **Permissions**: Role-based access control
- **Versioning**: Track asset/maintenance record versions
- **Integrations**: Link to external services (warranties, smart home)

---

## Appendix A: Full Prisma Schema Example

```prisma
// For reference if using Prisma ORM

model Home {
  id            Int      @id @default(autoincrement())
  name          String
  addressLine1  String?
  city          String?
  state         String?
  postalCode    String?
  yearBuilt     Int?
  squareFootage Decimal?
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  categories        Category[]
  locations         Location[]
  assets            Asset[]
  serviceProviders  ServiceProvider[]
  attachments       Attachment[]
}

model Category {
  id          Int      @id @default(autoincrement())
  homeId      Int
  name        String
  description String?
  icon        String?
  color       String?
  sortOrder   Int      @default(0)
  isSystem    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  home   Home    @relation(fields: [homeId], references: [id], onDelete: Cascade)
  assets Asset[]

  @@index([homeId, sortOrder])
}

model Asset {
  id                        Int       @id @default(autoincrement())
  homeId                    Int
  categoryId                Int?
  locationId                Int?
  parentAssetId             Int?
  name                      String
  manufacturer              String?
  modelNumber               String?
  serialNumber              String?
  yearManufactured          Int?
  purchaseDate              DateTime?
  installationDate          DateTime?
  purchasePrice             Decimal?
  warrantyDurationMonths    Int?
  warrantyExpirationDate    DateTime?
  expectedLifespanYears     Int?
  estimatedReplacementDate  DateTime?
  estimatedReplacementCost  Decimal?
  energyRating              String?
  capacity                  String?
  notes                     String?
  status                    String    @default("active")
  customFields              Json?
  createdAt                 DateTime  @default(now())
  updatedAt                 DateTime  @updatedAt

  home              Home               @relation(fields: [homeId], references: [id], onDelete: Cascade)
  category          Category?          @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  location          Location?          @relation(fields: [locationId], references: [id], onDelete: SetNull)
  parentAsset       Asset?             @relation("AssetHierarchy", fields: [parentAssetId], references: [id])
  childAssets       Asset[]            @relation("AssetHierarchy")
  maintenanceRecords MaintenanceRecord[]
  maintenanceTasks   MaintenanceTask[]
  attachments        Attachment[]

  @@index([homeId])
  @@index([categoryId])
  @@index([homeId, status])
}

// ... Additional models following same pattern
```
