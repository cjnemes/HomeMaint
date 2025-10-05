# Development Setup & Contributing Guide
## HomeMaint - Home Maintenance & Asset Tracking System

**Version:** 1.0
**Last Updated:** October 5, 2025
**Status:** Draft

---

## 1. Overview

This guide covers everything you need to know to contribute to HomeMaint, from setting up your development environment to submitting pull requests.

---

## 2. Prerequisites

### 2.1 Required Software

**Node.js & Package Manager:**
- Node.js 18+ (LTS recommended)
- npm 9+ or pnpm 8+ (pnpm preferred for speed)

**Git:**
- Git 2.30+

**Code Editor:**
- VS Code (recommended) with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features

**Browser:**
- Chrome/Edge (with React DevTools extension)
- Firefox Developer Edition (alternative)

### 2.2 Recommended Tools

- **GitHub CLI** (`gh`) - For creating PRs
- **nvm** - Node version manager
- **React DevTools** - Browser extension
- **Lighthouse** - Performance testing (built into Chrome DevTools)

---

## 3. Getting Started

### 3.1 Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/cjnemes/HomeMaint.git
cd HomeMaint

# Or clone via SSH (if you have SSH keys set up)
git clone git@github.com:cjnemes/HomeMaint.git
cd HomeMaint
```

### 3.2 Install Dependencies

```bash
# Using npm
npm install

# Or using pnpm (recommended)
pnpm install
```

### 3.3 Run Development Server

```bash
# Start dev server (default: http://localhost:5173)
npm run dev

# Or with pnpm
pnpm dev
```

The application will open in your browser at `http://localhost:5173`.

### 3.4 Verify Setup

Once the dev server is running:

1. Navigate to `http://localhost:5173`
2. You should see the HomeMaint application
3. Try adding a test asset to verify database is working
4. Open browser DevTools to check for errors

---

## 4. Project Structure

```
HomeMaint/
├── .github/              # GitHub configuration (workflows, templates)
├── docs/                 # Documentation
│   ├── PRD.md
│   ├── TECHNICAL_ARCHITECTURE.md
│   ├── DATA_MODEL.md
│   ├── UI_UX_DESIGN.md
│   ├── USER_STORIES.md
│   ├── MVP_SCOPE.md
│   ├── DEVELOPMENT_GUIDE.md
│   ├── TESTING_STRATEGY.md
│   ├── COMPONENT_LIBRARY.md
│   └── API_INTERFACE.md
├── public/               # Static assets (images, icons, manifest.json)
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components (buttons, cards, etc.)
│   │   ├── assets/      # Asset-related components
│   │   ├── maintenance/ # Maintenance-related components
│   │   ├── tasks/       # Task-related components
│   │   └── layout/      # Layout components (Header, Sidebar, etc.)
│   ├── pages/           # Page components (Dashboard, AssetList, etc.)
│   ├── lib/             # Utility functions, helpers
│   │   ├── db/         # Database layer (SQLite/IndexedDB)
│   │   ├── utils/      # General utilities
│   │   └── validators/ # Zod schemas and validation
│   ├── hooks/           # Custom React hooks
│   ├── stores/          # Zustand stores (state management)
│   ├── types/           # TypeScript type definitions
│   ├── styles/          # Global styles, Tailwind config
│   ├── App.tsx          # Root App component
│   ├── main.tsx         # Entry point
│   └── vite-env.d.ts    # Vite type definitions
├── tests/               # Test files
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── e2e/            # End-to-end tests
├── .env.example         # Environment variables template
├── .eslintrc.json       # ESLint configuration
├── .prettierrc          # Prettier configuration
├── .gitignore
├── index.html           # HTML entry point
├── package.json
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── vite.config.ts       # Vite configuration
└── README.md
```

### 4.1 Key Directories

**`src/components/`**
- Reusable React components
- Organized by feature or purpose
- Each component should have its own folder with tests

**`src/lib/db/`**
- Database layer and data access
- SQL queries
- Database initialization
- Migration scripts

**`src/stores/`**
- Zustand state stores
- Global application state
- Async actions

**`src/hooks/`**
- Custom React hooks
- Reusable logic
- Data fetching hooks

---

## 5. Development Workflow

### 5.1 Branch Naming Convention

Use descriptive branch names with the following prefixes:

```bash
feature/  # New features
bug/      # Bug fixes
refactor/ # Code refactoring
docs/     # Documentation updates
test/     # Adding or updating tests
chore/    # Maintenance tasks
```

**Examples:**
```bash
feature/asset-search
bug/maintenance-form-validation
refactor/database-layer
docs/update-readme
test/asset-crud-operations
chore/update-dependencies
```

### 5.2 Git Workflow

**1. Create a new branch:**
```bash
# Always branch from main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

**2. Make changes and commit:**
```bash
# Stage your changes
git add .

# Commit with descriptive message (see commit conventions below)
git commit -m "feat: add asset search functionality"
```

**3. Push to GitHub:**
```bash
git push origin feature/your-feature-name
```

**4. Create Pull Request:**
```bash
# Using GitHub CLI
gh pr create --title "Add asset search functionality" --body "Description of changes"

# Or create PR via GitHub web interface
```

### 5.3 Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, no logic change)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks, dependency updates

**Examples:**
```bash
feat(assets): add search and filter functionality

Implements instant search across asset name, manufacturer, model, and serial number.
Adds filter dropdowns for category, location, and status.

Closes #42

---

fix(maintenance): correct date validation bug

Date validation was allowing future dates for completed maintenance.
Now properly validates that date performed cannot be in the future.

Fixes #58

---

docs: update installation instructions

Added troubleshooting section and clarified Node.js version requirements.

---

test(assets): add unit tests for asset CRUD operations

Adds comprehensive test coverage for create, read, update, delete operations.
```

### 5.4 Pull Request Guidelines

**Before Creating PR:**
- [ ] Code follows style guide
- [ ] All tests pass (`npm run test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Manual testing completed
- [ ] Documentation updated if needed

**PR Description Should Include:**
1. **What**: Brief description of changes
2. **Why**: Reason for changes/problem being solved
3. **How**: Technical approach (if complex)
4. **Testing**: How you tested the changes
5. **Screenshots**: For UI changes
6. **Related Issues**: Link to GitHub issues

**PR Template:**
```markdown
## Description
Brief description of what this PR does.

## Related Issues
Closes #123

## Changes Made
- Added X feature
- Fixed Y bug
- Refactored Z component

## Testing
- [ ] Tested on desktop Chrome
- [ ] Tested on mobile Safari
- [ ] Unit tests added/updated
- [ ] All existing tests pass

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows style guide
- [ ] Tests pass
- [ ] Documentation updated
```

---

## 6. Code Style & Standards

### 6.1 TypeScript

**Always use TypeScript strict mode:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**Type everything explicitly:**
```typescript
// ✅ Good
interface Asset {
  id: number;
  name: string;
  category: string;
}

function getAsset(id: number): Asset | null {
  // implementation
}

// ❌ Bad
function getAsset(id) {
  // implementation
}
```

**Use interfaces over types for objects:**
```typescript
// ✅ Preferred
interface Asset {
  id: number;
  name: string;
}

// ⚠️ Use types for unions, intersections
type Status = 'active' | 'retired' | 'broken';
```

### 6.2 React Components

**Use functional components with TypeScript:**
```typescript
// ✅ Good
interface AssetCardProps {
  asset: Asset;
  onEdit: (id: number) => void;
}

export function AssetCard({ asset, onEdit }: AssetCardProps) {
  return (
    <div>
      <h3>{asset.name}</h3>
      <button onClick={() => onEdit(asset.id)}>Edit</button>
    </div>
  );
}

// ❌ Bad - no types
export function AssetCard({ asset, onEdit }) {
  // implementation
}
```

**Use named exports:**
```typescript
// ✅ Preferred
export function AssetCard() { }

// ❌ Avoid default exports
export default AssetCard;
```

**Component file structure:**
```typescript
// 1. Imports
import { useState } from 'react';
import { Asset } from '@/types';

// 2. Types/Interfaces
interface AssetCardProps {
  asset: Asset;
}

// 3. Component
export function AssetCard({ asset }: AssetCardProps) {
  // 3a. Hooks
  const [isExpanded, setIsExpanded] = useState(false);

  // 3b. Handlers
  const handleExpand = () => setIsExpanded(!isExpanded);

  // 3c. Render
  return <div>...</div>;
}
```

### 6.3 Naming Conventions

**Variables & Functions:**
```typescript
// camelCase for variables and functions
const assetCount = 10;
function getAssetById(id: number) { }
```

**Components:**
```typescript
// PascalCase for components
function AssetCard() { }
function MainLayout() { }
```

**Constants:**
```typescript
// UPPER_SNAKE_CASE for constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_CATEGORY = 'other';
```

**Types & Interfaces:**
```typescript
// PascalCase for types and interfaces
interface Asset { }
type AssetStatus = 'active' | 'retired';
```

**Files:**
```typescript
// kebab-case for files (except components)
asset-utils.ts
validation-helpers.ts

// PascalCase for component files
AssetCard.tsx
MainLayout.tsx
```

### 6.4 Import Organization

**Order imports:**
```typescript
// 1. External libraries
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Internal modules (absolute imports)
import { Asset } from '@/types';
import { useAssets } from '@/hooks/useAssets';
import { Button } from '@/components/ui/button';

// 3. Relative imports
import { AssetCard } from './AssetCard';
import styles from './styles.module.css';
```

### 6.5 Formatting

**Use Prettier for automatic formatting:**
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

**ESLint rules:**
```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "react/prop-types": "off"
  }
}
```

### 6.6 Comments & Documentation

**Use JSDoc for functions:**
```typescript
/**
 * Retrieves an asset by ID
 * @param id - The asset ID
 * @returns The asset if found, null otherwise
 */
export function getAssetById(id: number): Asset | null {
  // implementation
}
```

**Inline comments for complex logic:**
```typescript
// Calculate warranty expiration date based on purchase date and duration
const warrantyExpirationDate = addMonths(
  asset.purchaseDate,
  asset.warrantyDurationMonths
);
```

**Avoid obvious comments:**
```typescript
// ❌ Bad - obvious
// Set the name to the value
asset.name = value;

// ✅ Good - explains why, not what
// Use uppercase for consistency with legacy data
asset.name = value.toUpperCase();
```

---

## 7. Database Development

### 7.1 Schema Changes

**Never modify existing migrations:**
```bash
# ❌ Don't edit existing migrations
# ✅ Create new migration for changes
```

**Create migration for schema changes:**
```typescript
// src/lib/db/migrations/002_add_asset_status.ts
export const migration002 = {
  version: 2,
  up: (db: Database) => {
    db.exec(`
      ALTER TABLE assets
      ADD COLUMN status TEXT DEFAULT 'active'
    `);
  },
  down: (db: Database) => {
    db.exec(`
      ALTER TABLE assets
      DROP COLUMN status
    `);
  }
};
```

### 7.2 Database Queries

**Use parameterized queries:**
```typescript
// ✅ Good - prevents SQL injection
const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);

// ❌ Bad - SQL injection risk
const asset = db.prepare(`SELECT * FROM assets WHERE id = ${id}`).get();
```

**Use transactions for multiple operations:**
```typescript
// ✅ Good
const transaction = db.transaction((asset, maintenanceRecord) => {
  insertAsset(asset);
  insertMaintenanceRecord(maintenanceRecord);
});

transaction(assetData, maintenanceData);
```

---

## 8. Testing Standards

### 8.1 Test Coverage Requirements

**Minimum coverage targets:**
- Overall: 80%
- Critical paths (CRUD operations): 95%
- Utility functions: 90%
- Components: 75%

### 8.2 Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### 8.3 Writing Tests

**Unit test example:**
```typescript
// src/lib/utils/__tests__/date-utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, isValidDate } from '../date-utils';

describe('date-utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toBe('01/15/2024');
    });

    it('should handle invalid dates', () => {
      expect(formatDate(null)).toBe('');
    });
  });
});
```

**Component test example:**
```typescript
// src/components/AssetCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AssetCard } from './AssetCard';

describe('AssetCard', () => {
  const mockAsset = {
    id: 1,
    name: 'AC Unit',
    category: 'HVAC',
  };

  it('should render asset name', () => {
    render(<AssetCard asset={mockAsset} onEdit={() => {}} />);
    expect(screen.getByText('AC Unit')).toBeInTheDocument();
  });

  it('should call onEdit when edit button clicked', () => {
    const onEdit = vi.fn();
    render(<AssetCard asset={mockAsset} onEdit={onEdit} />);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(1);
  });
});
```

---

## 9. Performance Guidelines

### 9.1 Component Optimization

**Use React.memo for expensive components:**
```typescript
export const AssetCard = React.memo(({ asset }: AssetCardProps) => {
  return <div>{asset.name}</div>;
});
```

**Use useMemo for expensive calculations:**
```typescript
const sortedAssets = useMemo(() => {
  return assets.sort((a, b) => a.name.localeCompare(b.name));
}, [assets]);
```

**Use useCallback for event handlers:**
```typescript
const handleEdit = useCallback((id: number) => {
  // handler logic
}, []);
```

### 9.2 Bundle Size

**Use dynamic imports for routes:**
```typescript
// ✅ Good - code splitting
const AssetDetail = lazy(() => import('./pages/AssetDetail'));

// ❌ Bad - increases initial bundle
import { AssetDetail } from './pages/AssetDetail';
```

**Tree-shake unused code:**
```typescript
// ✅ Good - import only what you need
import { useState, useEffect } from 'react';

// ❌ Bad - imports entire library
import * as React from 'react';
```

---

## 10. Accessibility Guidelines

### 10.1 Semantic HTML

**Use semantic elements:**
```tsx
// ✅ Good
<button onClick={handleClick}>Click me</button>
<nav>...</nav>
<main>...</main>

// ❌ Bad
<div onClick={handleClick}>Click me</div>
```

### 10.2 ARIA Labels

**Provide labels for interactive elements:**
```tsx
<button aria-label="Delete asset">
  <TrashIcon />
</button>

<input
  type="text"
  aria-label="Search assets"
  placeholder="Search..."
/>
```

### 10.3 Keyboard Navigation

**Ensure keyboard accessibility:**
```tsx
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  onClick={handleClick}
>
  Click me
</div>
```

---

## 11. Common Commands

### 11.1 Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format
```

### 11.2 Database

```bash
# Run migrations
npm run db:migrate

# Seed database (development)
npm run db:seed

# Reset database
npm run db:reset
```

### 11.3 Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E with UI
npm run test:e2e:ui
```

---

## 12. Troubleshooting

### 12.1 Common Issues

**Issue: Port 5173 already in use**
```bash
# Kill process using port
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

**Issue: Database locked**
```bash
# Close all browser tabs
# Clear browser storage
# Restart dev server
```

**Issue: Type errors after dependency update**
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### 12.2 Getting Help

- Check documentation in `/docs` folder
- Search existing GitHub issues
- Ask in project discussions
- Review code examples in tests

---

## 13. Release Process

### 13.1 Version Numbering

We follow [Semantic Versioning](https://semver.org/):
- MAJOR.MINOR.PATCH (e.g., 1.0.0)
- MAJOR: Breaking changes
- MINOR: New features (backwards compatible)
- PATCH: Bug fixes

### 13.2 Creating a Release

```bash
# 1. Update version in package.json
npm version patch  # or minor, or major

# 2. Create changelog entry
# Update CHANGELOG.md with release notes

# 3. Commit and tag
git add .
git commit -m "chore: release v1.0.1"
git tag v1.0.1

# 4. Push with tags
git push origin main --tags

# 5. Create GitHub release
gh release create v1.0.1 --notes "Release notes here"
```

---

## 14. Code Review Checklist

**For Reviewers:**
- [ ] Code follows style guide
- [ ] Tests are included and pass
- [ ] No console.log statements (use console.warn/error if needed)
- [ ] Accessibility considered (keyboard nav, ARIA labels)
- [ ] Performance considered (no unnecessary re-renders)
- [ ] Error handling implemented
- [ ] TypeScript types are accurate
- [ ] Documentation updated if needed
- [ ] No security issues (SQL injection, XSS, etc.)

**For Authors:**
- [ ] Self-reviewed code
- [ ] Tested on multiple browsers
- [ ] Tested on mobile
- [ ] No merge conflicts
- [ ] Branch is up to date with main
- [ ] Commit messages follow convention
- [ ] PR description is complete

---

## 15. Resources

### 15.1 Documentation
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

### 15.2 Tools
- [Can I Use](https://caniuse.com/) - Browser compatibility
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/) - Performance auditing
- [WAVE](https://wave.webaim.org/) - Accessibility testing

### 15.3 Learning
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [React Patterns](https://reactpatterns.com/)
- [Web.dev](https://web.dev/) - Modern web development

---

## 16. Contact & Support

**Questions?**
- Open a GitHub issue with `question` label
- Start a discussion in GitHub Discussions

**Found a bug?**
- Open a GitHub issue with `bug` label
- Include reproduction steps
- Include browser/OS information

**Want to contribute?**
- Check open issues labeled `good first issue`
- Read this guide thoroughly
- Submit a draft PR if you want early feedback

---

**Happy coding! 🚀**
