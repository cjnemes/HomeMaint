# UI/UX Design Documentation
## HomeMaint - Home Maintenance & Asset Tracking System

**Version:** 1.0
**Last Updated:** October 5, 2025
**Status:** Draft

---

## 1. Overview

This document outlines the user interface and user experience design for HomeMaint. It includes wireframes, user flows, design principles, and responsive design considerations.

---

## 2. Design Principles

### 2.1 Core Principles

1. **Clarity Over Complexity**: Information should be easy to find and understand
2. **Efficiency First**: Common tasks should require minimal clicks
3. **Data-Dense but Scannable**: Show lots of information without overwhelming
4. **Mobile-First Thinking**: Design for mobile, enhance for desktop
5. **Offline-Ready**: Visual feedback for offline state and sync status
6. **Accessible by Default**: WCAG 2.1 AA compliance throughout

### 2.2 User Experience Goals

- **New asset in < 2 minutes**: Quick add with minimal required fields
- **Find any asset in < 30 seconds**: Powerful search and filtering
- **Log maintenance in < 1 minute**: Streamlined form with smart defaults
- **Zero learning curve**: Intuitive navigation, no tutorial needed

---

## 3. Design System

### 3.1 Color Palette

**Primary Colors:**
- **Primary**: `#2563eb` (Blue 600) - Primary actions, links
- **Primary Dark**: `#1e40af` (Blue 700) - Hover states
- **Primary Light**: `#dbeafe` (Blue 100) - Backgrounds, badges

**Semantic Colors:**
- **Success**: `#16a34a` (Green 600) - Completed, active status
- **Warning**: `#ea580c` (Orange 600) - Warnings, overdue items
- **Error**: `#dc2626` (Red 600) - Errors, critical items
- **Info**: `#0891b2` (Cyan 600) - Informational messages

**Neutral Colors:**
- **Gray 50**: `#f9fafb` - Page background
- **Gray 100**: `#f3f4f6` - Card backgrounds
- **Gray 200**: `#e5e7eb` - Borders, dividers
- **Gray 400**: `#9ca3af` - Disabled text
- **Gray 600**: `#4b5563` - Secondary text
- **Gray 900**: `#111827` - Primary text

**Category Colors (Pre-defined):**
- HVAC: `#3b82f6` (Blue)
- Plumbing: `#06b6d4` (Cyan)
- Electrical: `#fbbf24` (Amber)
- Appliances: `#8b5cf6` (Purple)
- Exterior: `#10b981` (Green)
- Roofing: `#ef4444` (Red)

### 3.2 Typography

**Font Family:**
- Primary: `Inter` (sans-serif)
- Fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- Monospace: `"Fira Code", "Courier New", monospace` (for serial numbers, model numbers)

**Type Scale:**
```
Display: 48px / 3rem - font-bold (Page titles - rare)
H1:      36px / 2.25rem - font-bold (Main headings)
H2:      30px / 1.875rem - font-semibold (Section headings)
H3:      24px / 1.5rem - font-semibold (Subsection headings)
H4:      20px / 1.25rem - font-semibold (Card titles)
Body:    16px / 1rem - font-normal (Body text)
Small:   14px / 0.875rem - font-normal (Secondary text)
XSmall:  12px / 0.75rem - font-normal (Labels, captions)
```

### 3.3 Spacing Scale

Using 8px base unit:
```
0:   0px
1:   4px
2:   8px
3:   12px
4:   16px
5:   20px
6:   24px
8:   32px
10:  40px
12:  48px
16:  64px
20:  80px
```

### 3.4 Component Styling

**Cards:**
- Background: White / Gray 100
- Border: 1px solid Gray 200
- Border Radius: 8px (rounded-lg)
- Shadow: subtle (0 1px 3px rgba(0,0,0,0.1))
- Padding: 16px (p-4) or 24px (p-6)

**Buttons:**
- Primary: Blue 600 background, white text, 8px radius
- Secondary: White background, blue 600 border and text
- Ghost: Transparent, blue 600 text
- Height: 40px (medium), 36px (small), 48px (large)
- Padding: 16px horizontal, 8px vertical

**Form Inputs:**
- Height: 40px
- Border: 1px solid Gray 300
- Border Radius: 6px
- Focus: Blue 500 ring
- Padding: 12px horizontal

### 3.5 Icons

**Icon Library**: Lucide React or Heroicons
**Sizes:**
- Small: 16px
- Medium: 20px
- Large: 24px
- XLarge: 32px

---

## 4. Layout Structure

### 4.1 Application Shell

```
┌─────────────────────────────────────────────────────────────┐
│  Header / Navigation Bar                                     │
├──────────────┬──────────────────────────────────────────────┤
│              │                                               │
│   Sidebar    │          Main Content Area                   │
│   (Desktop)  │                                               │
│              │                                               │
│              │                                               │
│              │                                               │
└──────────────┴──────────────────────────────────────────────┘
│  Bottom Navigation (Mobile)                                  │
└──────────────────────────────────────────────────────────────┘
```

**Header (Desktop & Mobile):**
- Height: 64px
- Logo/App name (left)
- Search bar (center, desktop only)
- Quick actions + User menu (right)

**Sidebar (Desktop only, 240px wide):**
- Dashboard
- Assets
- Maintenance
- Calendar
- Service Providers
- Settings

**Bottom Navigation (Mobile only):**
- Dashboard
- Assets
- Add (center, prominent)
- Maintenance
- More

### 4.2 Responsive Breakpoints

```
Mobile:    < 640px  (sm)
Tablet:    640px - 1024px (md, lg)
Desktop:   > 1024px (xl, 2xl)
```

**Responsive Behavior:**
- **Mobile**: Bottom nav, no sidebar, stacked layouts
- **Tablet**: Bottom nav OR sidebar (preference), 2-column grids
- **Desktop**: Sidebar always visible, multi-column layouts, more data visible

---

## 5. Key Screens & Wireframes

### 5.1 Dashboard (Home Screen)

**Purpose**: Quick overview of home status, upcoming maintenance, recent activity

**Desktop Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard                                    [+ Quick Add]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Total       │  │  Upcoming    │  │  Overdue     │      │
│  │  Assets      │  │  Tasks       │  │  Tasks       │      │
│  │    47        │  │     8        │  │     2        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Upcoming Maintenance                                  │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  ○ Oct 15 - Replace HVAC Filter          [View] [✓]  │  │
│  │  ○ Oct 20 - Annual Furnace Inspection    [View] [✓]  │  │
│  │  ○ Oct 28 - Water Heater Flush           [View] [✓]  │  │
│  │                                        [View All →]   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────┐  ┌───────────────────────────┐  │
│  │  Recent Activity       │  │  Assets by Category       │  │
│  ├────────────────────────┤  ├───────────────────────────┤  │
│  │  Oct 3 - Repaired AC   │  │  [Chart: Donut/Bar]       │  │
│  │  Sep 28 - Added Water  │  │  HVAC: 8                  │  │
│  │          Heater         │  │  Appliances: 12           │  │
│  │  Sep 15 - Filter Change│  │  Plumbing: 6              │  │
│  └────────────────────────┘  └───────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Quick Links                                          │  │
│  │  [+ Add Asset] [+ Log Maintenance] [View Calendar]   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Mobile Layout:**
```
┌──────────────────────┐
│  Dashboard        ☰ │
├──────────────────────┤
│                      │
│  ┌────────────────┐ │
│  │ Total Assets   │ │
│  │      47        │ │
│  └────────────────┘ │
│                      │
│  ┌────────────────┐ │
│  │ Upcoming: 8    │ │
│  │ Overdue: 2     │ │
│  └────────────────┘ │
│                      │
│  Upcoming Tasks      │
│  ┌────────────────┐ │
│  │ Oct 15         │ │
│  │ Replace Filter │ │
│  │ [View] [✓]     │ │
│  └────────────────┘ │
│  ┌────────────────┐ │
│  │ Oct 20         │ │
│  │ Furnace Insp.  │ │
│  └────────────────┘ │
│  [View All →]      │
│                      │
│  Recent Activity     │
│  ┌────────────────┐ │
│  │ Oct 3          │ │
│  │ Repaired AC    │ │
│  └────────────────┘ │
│                      │
└──────────────────────┘
│[🏠][📦][➕][🔧][⋯]│
└──────────────────────┘
```

**Key Elements:**
- Summary cards with key metrics
- Upcoming maintenance list (next 5-7 items)
- Recent activity feed
- Quick action buttons
- Asset distribution visualization

---

### 5.2 Asset List View

**Purpose**: Browse and search all assets

**Desktop Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Assets                                       [+ Add Asset]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [🔍 Search assets...]  [Category ▼] [Location ▼] [Status ▼]│
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 📦 HVAC (8 items)                              [−]      ││
│  ├─────────────────────────────────────────────────────────┤│
│  │ ┌─────────────────────────────────────────────────────┐ ││
│  │ │ [Photo] Carrier AC Unit            Status: Active    │ ││
│  │ │         Model: 24ACC636A003        📍 Backyard       │ ││
│  │ │         Installed: Jun 2018        ⚠️  Maint. Due    │ ││
│  │ │         [View] [Edit] [Log Maint.]                   │ ││
│  │ └─────────────────────────────────────────────────────┘ ││
│  │ ┌─────────────────────────────────────────────────────┐ ││
│  │ │ [Photo] Furnace                    Status: Active    │ ││
│  │ │         Model: TM9Y0802             📍 Basement      │ ││
│  │ │         Installed: Jun 2018                          │ ││
│  │ │         [View] [Edit] [Log Maint.]                   │ ││
│  │ └─────────────────────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 🔌 Appliances (12 items)                       [+]      ││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 💧 Plumbing (6 items)                          [+]      ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Alternative Views:**
- **Grid View**: Cards in 2-3 column grid
- **Table View**: Compact table format for power users
- **Map View** (future): Show assets on floor plan

**Key Elements:**
- Search bar with instant filtering
- Category/location/status filters
- Collapsible category groups
- Asset cards with key info and quick actions
- View toggle (list/grid/table)

---

### 5.3 Asset Detail View

**Purpose**: View all information about a specific asset

**Desktop Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  ← Assets / HVAC / Carrier AC Unit              [Edit] [⋯]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  Carrier Central Air Conditioner       │
│  │                  │  Status: ✓ Active                       │
│  │   [Asset Photo]  │  Category: HVAC                        │
│  │                  │  Location: Backyard                     │
│  │                  │                                         │
│  └──────────────────┘  [View Photos (4)] [Upload Photo]     │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Details                                                │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ Manufacturer:      Carrier                            │  │
│  │ Model:             24ACC636A003                       │  │
│  │ Serial Number:     4218C12345                         │  │
│  │ Year Manufactured: 2018                               │  │
│  │ Installed:         June 15, 2018 (6 years old)       │  │
│  │ Purchase Price:    $4,500.00                          │  │
│  │ Energy Rating:     SEER 16                            │  │
│  │ Capacity:          3 tons                             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Warranty & Lifespan                                   │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ Warranty:          10 years (expires Jun 15, 2028)   │  │
│  │ Expected Lifespan: 15 years                           │  │
│  │ Est. Replacement:  June 2033 (~$6,000)               │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Maintenance History (8 records)       [+ Log Maint.]  │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ Apr 15, 2024 - Annual Maintenance           $149.00  │  │
│  │ ○ Routine service by ABC Heating & Cooling           │  │
│  │                                                       │  │
│  │ Apr 12, 2023 - Annual Maintenance           $139.00  │  │
│  │ ○ Routine service by ABC Heating & Cooling           │  │
│  │                                          [View All →] │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Upcoming Tasks (2)                      [+ Add Task]  │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ Oct 15, 2024 - Replace Air Filter                    │  │
│  │ Apr 15, 2025 - Annual HVAC Maintenance               │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Documents & Manuals (3)                [+ Upload]     │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ 📄 Owner's Manual.pdf                                │  │
│  │ 📄 Installation Receipt.pdf                          │  │
│  │ 📄 Warranty Certificate.pdf                          │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Notes                                                 │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ Annual maintenance required. Filter should be changed │  │
│  │ monthly during peak season. Located on right side of  │  │
│  │ house near fence.                                     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- Breadcrumb navigation
- Photo gallery with primary photo
- Expandable detail sections
- Maintenance history timeline
- Upcoming tasks list
- Document attachments
- Notes area
- Quick actions (edit, log maintenance)

---

### 5.4 Add/Edit Asset Form

**Purpose**: Add new asset or edit existing

**Desktop Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Add New Asset                               [Save] [Cancel] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Basic Information                                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Name *                                                │  │
│  │ [Carrier Central Air Conditioner          ]          │  │
│  │                                                       │  │
│  │ Category *               Location                    │  │
│  │ [HVAC ▼            ]     [Backyard ▼            ]    │  │
│  │                                                       │  │
│  │ Status                                                │  │
│  │ ○ Active  ○ Retired  ○ Broken  ○ Replaced           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  Product Details                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Manufacturer          Model Number                    │  │
│  │ [Carrier        ]     [24ACC636A003            ]      │  │
│  │                                                       │  │
│  │ Serial Number         Year Manufactured               │  │
│  │ [4218C12345     ]     [2018                    ]      │  │
│  │                                                       │  │
│  │ Capacity              Energy Rating                   │  │
│  │ [3 tons         ]     [SEER 16                 ]      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  Purchase & Installation                                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Purchase Date         Purchase Price                  │  │
│  │ [06/10/2018 📅]       [$4,500.00               ]      │  │
│  │                                                       │  │
│  │ Installation Date                                     │  │
│  │ [06/15/2018 📅]                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  Warranty & Lifespan                                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Warranty Duration     Expected Lifespan               │  │
│  │ [10           ] years [15                    ] years  │  │
│  │                                                       │  │
│  │ Warranty Expires: Jun 15, 2028 (calculated)          │  │
│  │ Est. Replacement: Jun 15, 2033 (calculated)          │  │
│  │                                                       │  │
│  │ Estimated Replacement Cost                            │  │
│  │ [$6,000.00                                       ]    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  Photos                                                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ [Thumbnail] [Thumbnail] [Thumbnail] [+ Upload]       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  Documents                                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 📄 Owner's Manual.pdf                    [✕]         │  │
│  │ 📄 Warranty Certificate.pdf              [✕]         │  │
│  │ [+ Upload Document]                                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  Notes                                                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ [Annual maintenance required...]                      │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│                                  [Save Asset] [Cancel]        │
└─────────────────────────────────────────────────────────────┘
```

**Form Behavior:**
- Required fields marked with *
- Smart defaults (status = active)
- Auto-calculate warranty expiration and replacement dates
- Drag-and-drop file upload
- Inline validation with helpful error messages
- Save draft functionality (local storage)
- Mobile: Multi-step wizard format

---

### 5.5 Maintenance Log View

**Purpose**: View all maintenance history across all assets

**Desktop Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Maintenance History                    [+ Log Maintenance]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [🔍 Search...]  [Type ▼] [Asset ▼] [Date Range ▼]         │
│                                                               │
│  Timeline View                  [Timeline] [List] [Calendar] │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ October 2024                                          │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ Oct 3, 2024                                           │  │
│  │ ┌─────────────────────────────────────────────────┐   │  │
│  │ │ Repair - AC Unit                         $275.00│   │  │
│  │ │ Fixed refrigerant leak                          │   │  │
│  │ │ 🏠 Carrier AC Unit                               │   │  │
│  │ │ 👤 ABC Heating & Cooling                        │   │  │
│  │ │ [View Details]                                   │   │  │
│  │ └─────────────────────────────────────────────────┘   │  │
│  │                                                       │  │
│  │ September 2024                                        │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ Sep 28, 2024                                          │  │
│  │ ┌─────────────────────────────────────────────────┐   │  │
│  │ │ Routine - Water Heater                    $0.00 │   │  │
│  │ │ Flushed water heater (DIY)                      │   │  │
│  │ │ 🏠 Bradford White Water Heater                   │   │  │
│  │ │ 👤 Self                                          │   │  │
│  │ │ [View Details]                                   │   │  │
│  │ └─────────────────────────────────────────────────┘   │  │
│  │                                                       │  │
│  │ Sep 15, 2024                                          │  │
│  │ ┌─────────────────────────────────────────────────┐   │  │
│  │ │ Routine - HVAC Filter                     $15.00│   │  │
│  │ │ Replaced 16x25x1 air filter                     │   │  │
│  │ │ 🏠 Carrier AC Unit                               │   │  │
│  │ │ [View Details]                                   │   │  │
│  │ └─────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  [Load More]                                                  │
└─────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- Search and filter capabilities
- Multiple view options (timeline, list, calendar)
- Maintenance cards with key info
- Cost tracking
- Visual type indicators (icons/colors)

---

### 5.6 Upcoming Tasks / Calendar View

**Purpose**: View and manage future maintenance tasks

**Desktop Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Maintenance Calendar                      [+ Add Task]      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [List View] [Calendar View]        October 2024  [< >]      │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Sun   Mon   Tue   Wed   Thu   Fri   Sat              │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │       1     2     3     4     5     6                 │  │
│  │                                                       │  │
│  │ 7     8     9    10    11    12    13                │  │
│  │                                                       │  │
│  │14    [15]   16    17    18    19    20               │  │
│  │      ┌──┐                          ┌──┐              │  │
│  │      │🔧│                          │🔧│              │  │
│  │      └──┘                          └──┘              │  │
│  │      HVAC                           Furnace           │  │
│  │      Filter                         Insp.             │  │
│  │                                                       │  │
│  │21    22    23    24    25    26    27                │  │
│  │                              ⚠️                       │  │
│  │                              Water                    │  │
│  │                              Heater                   │  │
│  │                                                       │  │
│  │28    29    30    31                                  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  Upcoming Tasks                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ⚠️  Oct 15 - HVAC Filter Replacement        [Complete]│  │
│  │     Priority: Medium | Est. $15                      │  │
│  │                                                       │  │
│  │ ○  Oct 20 - Annual Furnace Inspection      [Complete]│  │
│  │     Priority: High | Est. $150                       │  │
│  │     📞 ABC Heating & Cooling                         │  │
│  │                                                       │  │
│  │ ○  Oct 28 - Water Heater Flush             [Complete]│  │
│  │     Priority: Medium | Est. $0 (DIY)                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  Overdue Tasks (2)                                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 🔴 Sep 30 - Gutter Cleaning                 [Complete]│  │
│  │ 🔴 Sep 15 - Smoke Detector Battery         [Complete]│  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- Calendar with task indicators
- List of upcoming tasks sorted by date
- Priority and cost information
- Quick complete action
- Overdue tasks highlighted
- Filter by priority, asset, type

---

### 5.7 Log Maintenance (Quick Add)

**Purpose**: Quickly log completed maintenance

**Modal/Drawer Layout:**
```
┌─────────────────────────────────────┐
│  Log Maintenance              [✕]   │
├─────────────────────────────────────┤
│                                     │
│ Asset *                             │
│ [Search or select asset...    ▼]   │
│                                     │
│ Date Performed *                    │
│ [10/03/2024              📅]        │
│                                     │
│ Maintenance Type *                  │
│ ○ Routine  ○ Repair  ○ Inspection  │
│ ○ Emergency  ○ Replacement          │
│                                     │
│ Title *                             │
│ [Fixed refrigerant leak        ]    │
│                                     │
│ Description                         │
│ [Technician found and fixed    ]    │
│ [leak in condenser coil...     ]    │
│                                     │
│ Cost                                │
│ [$275.00                       ]    │
│                                     │
│ Performed By                        │
│ [ABC Heating & Cooling     ▼]       │
│                                     │
│ Parts Used                          │
│ [Refrigerant, sealant          ]    │
│                                     │
│ Next Service Date                   │
│ [04/15/2025              📅]        │
│                                     │
│ Attachments                         │
│ [+ Upload Photos/Receipts]          │
│                                     │
│         [Cancel]  [Save Record]     │
└─────────────────────────────────────┘
```

**Key Elements:**
- Asset selector with search/autocomplete
- Type selection (radio buttons)
- Optional fields clearly marked
- File upload for receipts/photos
- Quick save for streamlined workflow

---

## 6. User Flows

### 6.1 First-Time User Onboarding

```
Start
  ↓
Welcome Screen
  ↓
Create Home Profile (optional)
  ↓
Add First Asset (guided)
  ↓
Dashboard (with tutorial tooltips)
  ↓
Explore Features
```

**Onboarding Principles:**
- Minimal required information to get started
- Progressive disclosure - show features as needed
- Allow skip and return later
- Show value immediately

### 6.2 Add New Asset Flow

```
Assets List
  ↓
Click "+ Add Asset"
  ↓
Quick Add Mode OR Detailed Mode
  ↓
[Quick: Name, Category, Location only]
[Detailed: Full form]
  ↓
Upload Photos/Documents (optional)
  ↓
Save
  ↓
View Asset Detail
  ↓
Prompt: "Add maintenance task?"
```

**Flow Variations:**
- **Quick Add**: Mobile-friendly, minimal fields
- **Detailed Add**: Desktop, all fields available
- **Import**: Bulk import from spreadsheet (future)

### 6.3 Log Maintenance Flow

```
Trigger:
  - Dashboard "Log Maintenance" button
  - Asset detail page
  - Complete task from calendar
  ↓
Log Maintenance Form
  ↓
Select Asset (if not pre-selected)
  ↓
Enter maintenance details
  ↓
Upload photos/receipts (optional)
  ↓
Save
  ↓
Confirmation + View Options
  ↓
Return to previous screen OR View asset
```

### 6.4 Complete Scheduled Task Flow

```
Calendar/Task List
  ↓
Click "Complete" on task
  ↓
Quick Complete Modal
  - Pre-filled with task info
  - Add actual cost
  - Add notes
  - Upload receipts
  ↓
Save
  ↓
Task marked complete
  ↓
Maintenance record created
  ↓
If recurring: Next instance created
```

### 6.5 Search for Asset Flow

```
Any Screen
  ↓
Click Search OR use keyboard shortcut (⌘K/Ctrl+K)
  ↓
Search Modal Opens
  ↓
Type search query
  ↓
See instant results (assets, maintenance, tasks)
  ↓
Select result
  ↓
Navigate to detail page
```

---

## 7. Responsive Design Patterns

### 7.1 Mobile Adaptations

**Navigation:**
- Sidebar → Bottom navigation bar (5 icons max)
- Hamburger menu for additional options
- Sticky header with back button

**Forms:**
- Single column layout
- Larger touch targets (min 44px)
- Native date/number pickers
- Bottom sheet modals instead of centered
- Floating action button for primary action

**Lists & Cards:**
- Single column, full-width cards
- Swipe gestures (swipe to delete, complete)
- Pull to refresh
- Infinite scroll instead of pagination

**Data Display:**
- Collapse secondary information
- Show/hide details on tap
- Use accordions for grouped content
- Truncate long text with expand option

### 7.2 Tablet Adaptations

**Navigation:**
- Can use sidebar OR bottom nav (user preference)
- More space for filters and actions

**Layout:**
- 2-column grids where appropriate
- Side-by-side forms on landscape
- Split view for list + detail (landscape)

**Interactions:**
- Support both touch and cursor
- Larger clickable areas than desktop
- Hover states for cursor users

---

## 8. Accessibility Considerations

### 8.1 WCAG 2.1 AA Compliance

**Color Contrast:**
- Text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

**Keyboard Navigation:**
- All interactive elements keyboard accessible
- Visible focus indicators
- Logical tab order
- Skip links for main content
- Keyboard shortcuts (with help overlay)

**Screen Reader Support:**
- Semantic HTML elements
- ARIA labels where needed
- Alt text for all images
- Form labels properly associated
- Status announcements for dynamic content

**Visual Considerations:**
- Responsive text sizing
- Zoom up to 200% without breaking
- No reliance on color alone
- Clear visual hierarchy

### 8.2 Accessibility Features

- **Dark Mode**: Reduce eye strain, respect system preference
- **Font Size Controls**: User-adjustable text size
- **Reduced Motion**: Respect prefers-reduced-motion
- **High Contrast Mode**: Optional high contrast theme
- **Focus Visible**: Clear focus indicators

---

## 9. Interaction Patterns

### 9.1 Empty States

**No Assets:**
```
┌─────────────────────────────────┐
│                                 │
│         [Large Icon]            │
│                                 │
│    No assets added yet          │
│                                 │
│  Start by adding your first     │
│  home system or appliance       │
│                                 │
│      [+ Add First Asset]        │
│                                 │
└─────────────────────────────────┘
```

**No Maintenance Records:**
```
┌─────────────────────────────────┐
│         [Icon]                  │
│                                 │
│  No maintenance history yet     │
│                                 │
│  Log your first service record  │
│                                 │
│   [+ Log Maintenance]           │
└─────────────────────────────────┘
```

### 9.2 Loading States

- **Initial Load**: Skeleton screens matching layout
- **Data Fetch**: Shimmer effect on cards
- **Action Processing**: Button spinner, disabled state
- **Image Load**: Blur-up or placeholder

### 9.3 Error States

- **Network Error**: Retry button, offline indicator
- **Validation Error**: Inline, near field, clear message
- **System Error**: Friendly message, report option
- **Not Found**: Helpful message with navigation

### 9.4 Success Feedback

- **Toast Notifications**: Non-intrusive, auto-dismiss
- **Inline Success**: Green checkmark, success message
- **Confetti/Celebration**: First asset, milestones
- **Undo Option**: For destructive actions

### 9.5 Confirmations

**Destructive Actions:**
```
┌─────────────────────────────────┐
│  Delete Asset?             [✕]  │
├─────────────────────────────────┤
│                                 │
│  Are you sure you want to       │
│  delete "Carrier AC Unit"?      │
│                                 │
│  This will also delete:         │
│  • 8 maintenance records        │
│  • 12 photos and documents      │
│  • 2 scheduled tasks            │
│                                 │
│  This action cannot be undone.  │
│                                 │
│    [Cancel]  [Delete Asset]     │
└─────────────────────────────────┘
```

---

## 10. Animation & Transitions

### 10.1 Animation Principles

- **Purpose-Driven**: Only animate to provide feedback or guide attention
- **Performant**: Use CSS transforms, avoid layout thrashing
- **Subtle**: 200-300ms for most transitions
- **Respectful**: Honor prefers-reduced-motion

### 10.2 Common Animations

**Page Transitions:**
- Fade in/out: 200ms
- Slide in/out: 250ms (for modals, drawers)

**Micro-interactions:**
- Button press: Scale down slightly (95%), 100ms
- Checkbox/toggle: Smooth transition, 150ms
- Hover effects: 150ms

**Loading:**
- Skeleton shimmer: 2s loop
- Spinner rotation: 1s linear infinite

**List Animations:**
- Stagger items: 50ms delay between items
- Add item: Fade + slide in from top
- Remove item: Fade + slide out + collapse

---

## 11. Dark Mode

### 11.1 Dark Mode Colors

**Background:**
- Primary: `#0f172a` (Slate 900)
- Secondary: `#1e293b` (Slate 800)
- Tertiary: `#334155` (Slate 700)

**Text:**
- Primary: `#f1f5f9` (Slate 100)
- Secondary: `#cbd5e1` (Slate 300)
- Tertiary: `#94a3b8` (Slate 400)

**Borders:**
- `#334155` (Slate 700)

**Adjustments:**
- Reduce image/photo brightness slightly
- Increase contrast for text
- Soften shadows

---

## 12. Progressive Web App (PWA) Features

### 12.1 Install Prompt

- Show install banner after 2+ visits
- Custom install prompt in settings
- A2HS (Add to Home Screen) support

### 12.2 Offline Indicator

```
┌─────────────────────────────────┐
│  ⚠️  You're offline              │
│  Changes will sync when online  │
└─────────────────────────────────┘
```

### 12.3 Update Available

```
┌─────────────────────────────────┐
│  ⬆️  Update Available            │
│  Refresh to get the latest      │
│                    [Refresh]    │
└─────────────────────────────────┘
```

---

## 13. Design Handoff Notes

### 13.1 For Developers

- All spacing uses 8px grid system
- Components should be built with shadcn/ui or similar
- Use Tailwind CSS utility classes
- Icons: Lucide React (consistent 20px stroke width)
- Responsive: Mobile-first approach

### 13.2 Design Tokens

Create design tokens file:
```javascript
colors: {
  primary: { ... },
  gray: { ... },
  success: '#16a34a',
  // etc
}
spacing: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80],
borderRadius: { sm: 4, md: 6, lg: 8, xl: 12 },
// etc
```

---

## Appendix A: Design Inspiration

**Similar Apps:**
- HomeZada (home inventory)
- Sortly (inventory management)
- Notion (flexibility, data organization)
- Linear (clean, fast UI)

**Design Systems:**
- Tailwind UI
- shadcn/ui
- Radix Themes
- Material Design 3

---

## Appendix B: Future UI Enhancements

- **Floor Plan View**: Drag-drop assets onto floor plan
- **AR View**: Use camera to identify and tag assets
- **Voice Input**: "Log maintenance for AC unit"
- **Smart Suggestions**: AI-powered maintenance recommendations
- **Sharing**: Generate shareable reports for contractors
- **Widgets**: Dashboard widgets for key metrics
