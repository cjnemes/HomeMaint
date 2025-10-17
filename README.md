# HomeMaint

> A comprehensive home maintenance and asset tracking application to help homeowners manage their home systems, appliances, and maintenance records.

## Overview

HomeMaint is designed to be your single source of truth for all home-related information. Track everything from HVAC systems to appliances, maintain complete service histories, and plan future maintenance—all in one organized place.

## Key Features

- **Asset Inventory**: Comprehensive tracking of all home systems, appliances, and equipment with detailed specifications
- **Maintenance History**: Complete chronological records of all service and repairs performed
- **Future Planning**: Schedule upcoming maintenance and plan for system replacements
- **Document Management**: Attach manuals, receipts, warranty documents, and photos
- **Service Provider Directory**: Keep contact information for all your contractors and service providers

## Documentation

- [Product Requirements Document (PRD)](docs/PRD.md) - Detailed product specifications and requirements
- [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md) - System architecture and technology decisions
- [Data Model](docs/DATA_MODEL.md) - Database schema and data structure

## Project Status

**Current Phase**: MVP Complete ✅ 100%

HomeMaint MVP is **feature-complete and production-ready**! All core features have been implemented, tested, and verified.

**Completed:**

- ✅ Asset Management (Full CRUD)
- ✅ Maintenance Records Tracking
- ✅ Task Management & Scheduling
- ✅ Service Provider Directory
- ✅ Dashboard with Stats & Widgets
- ✅ File Upload & Document Management
- ✅ Data Export (JSON & CSV)
- ✅ Progressive Web App (PWA) with Offline Support
- ✅ Comprehensive Settings
- ✅ Responsive Design (Mobile, Tablet, Desktop)
- ✅ Professional Visual Design System
- ✅ Comprehensive Testing (Browser automation with Playwright MCP)

**Recent Testing:** Comprehensive browser testing completed October 17, 2025. All features verified working. See [Comprehensive Test Report](docs/COMPREHENSIVE_TEST_REPORT.md) for details.

## Getting Started

### Prerequisites

- Node.js 18.17.0 or higher
- npm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd HomeMaint
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

The database will be automatically created on first run with all necessary tables.

## Technology Stack

**Framework:**

- Next.js 14+ (full-stack React framework)
- TypeScript 5+ (strict mode)

**Database:**

- better-sqlite3 (SQLite for Node.js)
- Local file-based storage

**UI:**

- Tailwind CSS + shadcn/ui
- Responsive design (mobile-first)

**Testing:**

- Vitest (unit & integration tests)
- React Testing Library (component tests)
- Playwright (E2E tests)

**Deployment:**

- Progressive Web App (PWA)
- Self-hosted / Local-first

See [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md) for complete details.

## Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # Run TypeScript type checking

# Testing
npm test                 # Run unit tests (watch mode)
npm run test:run         # Run unit tests (once)
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Run E2E tests in UI mode
npm run test:e2e:debug   # Debug E2E tests
```

## Database

The application uses SQLite with the following tables:

- **homes**: Property information
- **categories**: Asset categories (HVAC, Plumbing, etc.)
- **locations**: Rooms and areas within home
- **assets**: Systems, appliances, and equipment
- **service_providers**: Contractor information
- **maintenance_records**: Historical maintenance
- **maintenance_tasks**: Scheduled maintenance
- **attachments**: Photos, manuals, receipts

Database file: `data/homemaint.db` (automatically created, gitignored)

See [Data Model documentation](docs/DATA_MODEL.md) for detailed schema.

## Development Approach

This project uses **autonomous development** with Claude Code:

- Claude handles all coding, testing, and verification
- Comprehensive automated test suite (unit, integration, E2E)
- User reviews only at milestones (Week 4, 8, 12)
- See [Autonomous Development Guide](docs/AUTONOMOUS_DEVELOPMENT.md) for details

## Development Roadmap

### Phase 1 - MVP (Months 1-3)

- Core asset inventory management
- Basic maintenance tracking
- File attachments support
- Future maintenance planning
- Responsive web application

### Phase 2 - Enhanced Features (Months 4-6)

- Photo management improvements
- Service provider directory
- Recurring maintenance & reminders
- Reporting and analytics

### Phase 3 - Advanced Capabilities (Months 7-12)

- Native mobile applications
- Cloud sync capabilities
- Advanced planning features
- Calendar integration

## Contributing

This is currently a personal project. Contribution guidelines will be added in the future.

## License

To be determined.

## Contact

For questions or feedback, please open an issue in this repository.

---

**Built with care for homeowners who want to maintain their most valuable asset.**
