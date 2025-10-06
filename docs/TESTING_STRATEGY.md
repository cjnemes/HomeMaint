# Testing Strategy
## HomeMaint - Home Maintenance & Asset Tracking System

**Version:** 1.0
**Last Updated:** October 5, 2025
**Status:** Draft

---

## 1. Overview

This document outlines our comprehensive testing strategy for HomeMaint. Our goal is to maintain high code quality, prevent regressions, and ship with confidence.

**Testing Philosophy:**
- Write tests that provide value, not just coverage
- Test behavior, not implementation details
- Fast feedback loop for developers
- Catch bugs before they reach users

---

## 2. Testing Pyramid

We follow the testing pyramid principle:

```
        /\
       /  \     E2E Tests (10%)
      /____\    Few, slow, expensive
     /      \
    / Integ. \  Integration Tests (30%)
   /          \ Medium number, medium speed
  /____________\
 /              \
/ Unit Tests     \ Unit Tests (60%)
\________________/ Many, fast, cheap
```

**Distribution:**
- **60% Unit Tests**: Fast, focused, test individual functions/components
- **30% Integration Tests**: Test feature slices, component interactions
- **10% E2E Tests**: Full user flows, critical paths only

---

## 3. Testing Tools & Frameworks

### 3.1 Core Testing Stack

**Test Runner & Framework:**
- **Vitest** - Fast, Vite-native test runner
- Modern, TypeScript-first
- Compatible with Jest API
- Fast watch mode

**React Testing:**
- **React Testing Library** - Component testing
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - Custom matchers

**E2E Testing:**
- **Playwright** - End-to-end testing
- **Playwright MCP** - Browser automation via Claude Code
  - Enables autonomous E2E testing without manual intervention
  - Can navigate pages, fill forms, click buttons, verify UI
  - Can capture screenshots for visual verification
  - Runs headlessly for automated testing
- Cross-browser support (Chrome, Firefox, Safari, Mobile)
- Parallel execution
- **Critical for autonomous development**: Full UI testing automation

**Code Coverage:**
- **c8** (built into Vitest) - Coverage reporting
- **Istanbul** - Coverage visualization

### 3.2 Additional Tools

**Mocking:**
- **Vitest mocks** - Built-in mocking
- **MSW (Mock Service Worker)** - API mocking (if needed in future)

**Database Testing:**
- **sql.js** - In-memory SQLite for tests
- Fresh database per test suite

**Visual Regression (Future):**
- **Chromatic** or **Percy** - Visual diff testing

---

## 4. Unit Testing

### 4.1 What to Unit Test

**Utility Functions:**
- Date formatting and manipulation
- Validation functions
- Calculation helpers
- Data transformations

**Business Logic:**
- Asset calculations (warranty expiration, replacement dates)
- Recurring task logic
- Search and filter algorithms
- Sort functions

**Custom Hooks:**
- useAssets
- useMaintenance
- useTasks
- Form hooks

**State Management:**
- Zustand store actions
- State selectors
- State updates

### 4.2 Unit Test Structure

```typescript
// src/lib/utils/__tests__/date-utils.test.ts
import { describe, it, expect } from 'vitest';
import { calculateWarrantyExpiration, isWarrantyActive } from '../date-utils';

describe('date-utils', () => {
  describe('calculateWarrantyExpiration', () => {
    it('should calculate correct expiration date', () => {
      const purchaseDate = new Date('2024-01-15');
      const durationMonths = 12;

      const result = calculateWarrantyExpiration(purchaseDate, durationMonths);

      expect(result).toEqual(new Date('2025-01-15'));
    });

    it('should handle leap years correctly', () => {
      const purchaseDate = new Date('2024-02-29');
      const durationMonths = 12;

      const result = calculateWarrantyExpiration(purchaseDate, durationMonths);

      expect(result).toEqual(new Date('2025-02-28'));
    });

    it('should return null for invalid inputs', () => {
      expect(calculateWarrantyExpiration(null, 12)).toBeNull();
      expect(calculateWarrantyExpiration(new Date(), -1)).toBeNull();
    });
  });

  describe('isWarrantyActive', () => {
    it('should return true for active warranty', () => {
      const expirationDate = new Date('2025-12-31');
      expect(isWarrantyActive(expirationDate)).toBe(true);
    });

    it('should return false for expired warranty', () => {
      const expirationDate = new Date('2020-01-01');
      expect(isWarrantyActive(expirationDate)).toBe(false);
    });

    it('should handle today as boundary', () => {
      const today = new Date();
      expect(isWarrantyActive(today)).toBe(true);
    });
  });
});
```

### 4.3 Unit Test Best Practices

**✅ Do:**
- Test one thing per test
- Use descriptive test names
- Follow Arrange-Act-Assert pattern
- Test edge cases and error conditions
- Mock external dependencies
- Keep tests fast (<50ms per test)

**❌ Don't:**
- Test implementation details
- Test library code
- Have tests depend on each other
- Use arbitrary timeouts
- Test multiple scenarios in one test

---

## 5. Component Testing

### 5.1 What to Component Test

**UI Components:**
- Render correctly with props
- Handle user interactions (click, input, etc.)
- Display correct state
- Call callbacks appropriately
- Handle loading and error states

**Form Components:**
- Validation works
- Submit handlers called with correct data
- Error messages displayed
- Required fields enforced

**Layout Components:**
- Responsive behavior
- Navigation works
- Accessibility features

### 5.2 Component Test Structure

```typescript
// src/components/AssetCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AssetCard } from './AssetCard';
import type { Asset } from '@/types';

describe('AssetCard', () => {
  const mockAsset: Asset = {
    id: 1,
    name: 'Central AC Unit',
    category: 'HVAC',
    location: 'Backyard',
    status: 'active',
    warrantyExpirationDate: new Date('2028-06-15'),
  };

  describe('rendering', () => {
    it('should render asset name', () => {
      render(<AssetCard asset={mockAsset} onEdit={() => {}} />);

      expect(screen.getByText('Central AC Unit')).toBeInTheDocument();
    });

    it('should render category and location', () => {
      render(<AssetCard asset={mockAsset} onEdit={() => {}} />);

      expect(screen.getByText('HVAC')).toBeInTheDocument();
      expect(screen.getByText('Backyard')).toBeInTheDocument();
    });

    it('should show warranty status when warranty is active', () => {
      render(<AssetCard asset={mockAsset} onEdit={() => {}} />);

      expect(screen.getByText(/warranty active/i)).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onEdit when edit button clicked', () => {
      const onEdit = vi.fn();
      render(<AssetCard asset={mockAsset} onEdit={onEdit} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);

      expect(onEdit).toHaveBeenCalledWith(1);
      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('should expand details when card is clicked', () => {
      render(<AssetCard asset={mockAsset} onEdit={() => {}} />);

      const card = screen.getByTestId('asset-card');
      fireEvent.click(card);

      expect(screen.getByText(/model number/i)).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle missing optional fields', () => {
      const minimalAsset = {
        id: 1,
        name: 'Test Asset',
        category: 'Other',
        status: 'active',
      };

      render(<AssetCard asset={minimalAsset} onEdit={() => {}} />);

      expect(screen.getByText('Test Asset')).toBeInTheDocument();
    });

    it('should show warning for expired warranty', () => {
      const assetWithExpiredWarranty = {
        ...mockAsset,
        warrantyExpirationDate: new Date('2020-01-01'),
      };

      render(<AssetCard asset={assetWithExpiredWarranty} onEdit={() => {}} />);

      expect(screen.getByText(/warranty expired/i)).toBeInTheDocument();
    });
  });
});
```

### 5.3 Testing User Interactions

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('AssetForm', () => {
  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<AssetForm onSubmit={() => {}} />);

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);

    // Should show validation errors
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/category is required/i)).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AssetForm onSubmit={onSubmit} />);

    // Fill in form
    await user.type(screen.getByLabelText(/name/i), 'Water Heater');
    await user.selectOptions(screen.getByLabelText(/category/i), 'Plumbing');
    await user.click(screen.getByRole('button', { name: /save/i }));

    // Should call onSubmit with form data
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Water Heater',
      category: 'Plumbing',
      // ... other fields
    });
  });
});
```

### 5.4 Component Testing Best Practices

**✅ Do:**
- Query by role, label, or text (not by implementation details)
- Use `userEvent` for realistic interactions
- Test from user's perspective
- Test accessibility (keyboard nav, screen readers)
- Mock complex child components
- Test error boundaries

**❌ Don't:**
- Query by class names or test IDs (when avoidable)
- Test CSS styles (use visual regression instead)
- Snapshot test entire components
- Test library components (Button, Input, etc.)
- Make assertions on component state

---

## 6. Integration Testing

### 6.1 What to Integration Test

**Feature Slices:**
- Complete CRUD flows (create, read, update, delete assets)
- Form submission to database
- Search and filter functionality
- Task completion flow

**Database Operations:**
- Multi-table operations
- Transactions
- Data integrity constraints

**State Management:**
- Store updates propagate to components
- Actions trigger correct state changes
- Side effects work correctly

### 6.2 Integration Test Structure

```typescript
// src/features/assets/__tests__/asset-crud.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssetListPage } from '../AssetListPage';
import { initializeTestDatabase, cleanupTestDatabase } from '@/lib/db/test-utils';

describe('Asset CRUD Integration', () => {
  beforeEach(async () => {
    await initializeTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  it('should complete full asset lifecycle', async () => {
    const user = userEvent.setup();
    render(<AssetListPage />);

    // 1. Create asset
    await user.click(screen.getByRole('button', { name: /add asset/i }));

    await user.type(screen.getByLabelText(/name/i), 'Test AC Unit');
    await user.selectOptions(screen.getByLabelText(/category/i), 'HVAC');
    await user.click(screen.getByRole('button', { name: /save/i }));

    // 2. Verify asset appears in list
    await waitFor(() => {
      expect(screen.getByText('Test AC Unit')).toBeInTheDocument();
    });

    // 3. Edit asset
    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.clear(screen.getByLabelText(/name/i));
    await user.type(screen.getByLabelText(/name/i), 'Updated AC Unit');
    await user.click(screen.getByRole('button', { name: /save/i }));

    // 4. Verify update
    await waitFor(() => {
      expect(screen.getByText('Updated AC Unit')).toBeInTheDocument();
      expect(screen.queryByText('Test AC Unit')).not.toBeInTheDocument();
    });

    // 5. Delete asset
    await user.click(screen.getByRole('button', { name: /delete/i }));
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    // 6. Verify deletion
    await waitFor(() => {
      expect(screen.queryByText('Updated AC Unit')).not.toBeInTheDocument();
    });
  });

  it('should maintain data integrity across relationships', async () => {
    const user = userEvent.setup();
    render(<AssetDetailPage />);

    // Create asset with maintenance record
    // ...

    // Verify cascade delete works
    // When asset deleted, maintenance records should also be deleted
  });
});
```

### 6.3 Database Test Utilities

```typescript
// src/lib/db/test-utils.ts
import Database from 'sql.js';
import { runMigrations } from './migrations';

let testDb: Database | null = null;

export async function initializeTestDatabase(): Promise<Database> {
  const SQL = await initSqlJs();
  testDb = new SQL.Database();

  // Run migrations
  await runMigrations(testDb);

  return testDb;
}

export async function cleanupTestDatabase(): Promise<void> {
  if (testDb) {
    testDb.close();
    testDb = null;
  }
}

export async function seedTestData(db: Database, data: any): Promise<void> {
  // Insert seed data for tests
}

export function getTestDatabase(): Database {
  if (!testDb) {
    throw new Error('Test database not initialized');
  }
  return testDb;
}
```

### 6.4 Integration Test Best Practices

**✅ Do:**
- Test realistic user scenarios
- Use actual database (in-memory SQLite)
- Test transactions and rollbacks
- Test data integrity constraints
- Clean up after each test
- Test async operations properly

**❌ Don't:**
- Mock the database layer
- Share state between tests
- Test every edge case (use unit tests)
- Make tests too long/complex

---

## 7. End-to-End (E2E) Testing

### 7.1 What to E2E Test

**Critical User Flows:**
- New user onboarding
- Add first asset
- Log maintenance
- Complete scheduled task
- Search for asset
- Export data

**Cross-Browser Scenarios:**
- Installation as PWA
- Offline functionality
- File uploads
- Responsive design

### 7.2 E2E Test Structure

```typescript
// tests/e2e/asset-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Asset Management', () => {
  test('should allow user to add and view asset', async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:5173');

    // Click "Add Asset" button
    await page.click('text=Add Asset');

    // Fill in asset form
    await page.fill('input[name="name"]', 'Central AC Unit');
    await page.selectOption('select[name="category"]', 'HVAC');
    await page.fill('input[name="manufacturer"]', 'Carrier');
    await page.fill('input[name="modelNumber"]', '24ACC636A003');

    // Upload photo
    await page.setInputFiles('input[type="file"]', 'tests/fixtures/ac-unit.jpg');

    // Submit form
    await page.click('button:has-text("Save Asset")');

    // Wait for redirect to asset detail
    await page.waitForURL('**/assets/**');

    // Verify asset details are displayed
    await expect(page.locator('h1')).toContainText('Central AC Unit');
    await expect(page.locator('text=Carrier')).toBeVisible();
    await expect(page.locator('text=24ACC636A003')).toBeVisible();

    // Verify photo is displayed
    await expect(page.locator('img[alt*="AC Unit"]')).toBeVisible();
  });

  test('should search for assets', async ({ page }) => {
    await page.goto('http://localhost:5173/assets');

    // Type in search box
    await page.fill('input[placeholder*="Search"]', 'AC');

    // Wait for results
    await page.waitForTimeout(500);

    // Should show matching assets
    await expect(page.locator('text=Central AC Unit')).toBeVisible();
    await expect(page.locator('text=Window AC')).toBeVisible();

    // Should not show non-matching
    await expect(page.locator('text=Water Heater')).not.toBeVisible();
  });
});

test.describe('Offline Functionality', () => {
  test('should work offline', async ({ page, context }) => {
    // Go online first and load app
    await page.goto('http://localhost:5173');

    // Wait for service worker registration
    await page.waitForTimeout(2000);

    // Go offline
    await context.setOffline(true);

    // Navigate to different page
    await page.click('text=Assets');

    // Should still work
    await expect(page.locator('h1')).toContainText('Assets');

    // Add asset while offline
    await page.click('text=Add Asset');
    await page.fill('input[name="name"]', 'Offline Asset');
    await page.selectOption('select[name="category"]', 'Other');
    await page.click('button:has-text("Save Asset")');

    // Should show offline indicator
    await expect(page.locator('text=Offline')).toBeVisible();

    // Asset should be saved locally
    await expect(page.locator('text=Offline Asset')).toBeVisible();

    // Go back online
    await context.setOffline(false);

    // Offline indicator should disappear
    await expect(page.locator('text=Offline')).not.toBeVisible();
  });
});
```

### 7.3 E2E Test Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 7.4 E2E Test Best Practices

**✅ Do:**
- Test critical user journeys
- Test on multiple browsers/devices
- Use page objects for complex interactions
- Test offline scenarios
- Test error recovery
- Run in CI pipeline

**❌ Don't:**
- Test every scenario (focus on critical paths)
- Make tests depend on each other
- Use arbitrary timeouts (use proper waits)
- Test implementation details
- Snapshot entire pages

---

## 8. Test Coverage Goals

### 8.1 Coverage Targets

**Overall Coverage:**
- **Statements**: ≥ 80%
- **Branches**: ≥ 75%
- **Functions**: ≥ 80%
- **Lines**: ≥ 80%

**Critical Code:**
- **Database Operations**: ≥ 95%
- **Business Logic**: ≥ 90%
- **Utility Functions**: ≥ 90%
- **Components**: ≥ 75%

### 8.2 Running Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html
```

### 8.3 Coverage Requirements

**What Must Be Covered:**
- All CRUD operations
- All validation logic
- All calculations (warranty, replacement dates)
- All data transformations
- All user-facing features

**What Can Have Lower Coverage:**
- Type definitions
- Configuration files
- Simple presentational components
- Third-party integrations (mocked)

---

## 9. Testing Workflows

### 9.1 During Development

```bash
# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test src/lib/utils/date-utils.test.ts

# Run tests matching pattern
npm run test:watch -- asset

# Update snapshots
npm run test -- -u
```

### 9.2 Before Committing

```bash
# Pre-commit hook (automatic via Husky)
npm run lint
npm run type-check
npm run test

# If all pass, commit proceeds
```

### 9.3 In CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Build
        run: npm run build
```

---

## 10. Testing Utilities & Helpers

### 10.1 Test Fixtures

```typescript
// tests/fixtures/assets.ts
export const mockAsset = {
  id: 1,
  name: 'Central AC Unit',
  category: 'HVAC',
  manufacturer: 'Carrier',
  modelNumber: '24ACC636A003',
  status: 'active',
  // ... all fields
};

export const mockAssetList = [
  mockAsset,
  { id: 2, name: 'Water Heater', category: 'Plumbing', ... },
  { id: 3, name: 'Furnace', category: 'HVAC', ... },
];
```

### 10.2 Custom Render Functions

```typescript
// tests/utils/test-utils.tsx
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

export function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

export function renderWithProviders(ui: React.ReactElement, options = {}) {
  const { initialState = {} } = options;

  return render(
    <AppProviders initialState={initialState}>{ui}</AppProviders>
  );
}
```

### 10.3 Custom Matchers

```typescript
// tests/utils/custom-matchers.ts
import { expect } from 'vitest';

expect.extend({
  toBeValidDate(received) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    return {
      pass,
      message: () => `expected ${received} to be a valid Date`,
    };
  },

  toHaveAssetId(received, expected) {
    const pass = received.id === expected;
    return {
      pass,
      message: () => `expected asset to have id ${expected}, got ${received.id}`,
    };
  },
});
```

---

## 11. Accessibility Testing

### 11.1 Automated A11y Tests

```typescript
// Component tests should include accessibility checks
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('AssetCard Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<AssetCard asset={mockAsset} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should be keyboard navigable', async () => {
    render(<AssetCard asset={mockAsset} />);

    // Tab to edit button
    await userEvent.tab();
    expect(screen.getByRole('button', { name: /edit/i })).toHaveFocus();

    // Press Enter to activate
    await userEvent.keyboard('{Enter}');
    expect(mockOnEdit).toHaveBeenCalled();
  });
});
```

### 11.2 Manual A11y Testing Checklist

- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators are visible
- [ ] Screen reader announces content correctly
- [ ] Color contrast meets WCAG AA standards
- [ ] Form labels are properly associated
- [ ] Error messages are accessible
- [ ] Skip links work
- [ ] ARIA labels are appropriate

---

## 12. Performance Testing

### 12.1 Load Time Testing

```typescript
// tests/performance/load-time.test.ts
import { test, expect } from '@playwright/test';

test('should load dashboard in under 3 seconds', async ({ page }) => {
  const startTime = Date.now();

  await page.goto('http://localhost:5173');
  await page.waitForSelector('h1');

  const loadTime = Date.now() - startTime;

  expect(loadTime).toBeLessThan(3000);
});
```

### 12.2 Lighthouse CI

```yaml
# lighthouserc.json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run preview",
      "url": ["http://localhost:4173"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:pwa": ["error", { "minScore": 1.0 }]
      }
    }
  }
}
```

---

## 13. Continuous Testing

### 13.1 Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "vitest related --run"
    ]
  }
}
```

### 13.2 CI/CD Integration

**On Every Push:**
- Run linter
- Run type checker
- Run unit and integration tests
- Generate coverage report

**On Pull Request:**
- All of the above, plus:
- Run E2E tests
- Check coverage thresholds
- Run Lighthouse CI

**Before Release:**
- Full test suite (all browsers)
- Manual QA testing
- Accessibility audit
- Performance audit

---

## 14. Test Maintenance

### 14.1 When to Update Tests

**Update tests when:**
- Feature requirements change
- Bug is found (write failing test first)
- Refactoring code
- Test is flaky
- Test is slow

**Don't update tests when:**
- Implementation details change (if tests still pass)
- Snapshot tests fail due to styling changes (use visual regression instead)

### 14.2 Dealing with Flaky Tests

**If a test is flaky:**
1. Identify the cause (timing, external dependency, shared state)
2. Fix the root cause (use proper waits, reset state, mock dependencies)
3. If can't fix, quarantine the test (skip and create issue)
4. Never increase timeouts arbitrarily

---

## 15. Testing Anti-Patterns to Avoid

**❌ Don't:**
- Test implementation details (internal state, private methods)
- Use arbitrary timeouts (`setTimeout`)
- Share state between tests
- Test third-party libraries
- Couple tests to CSS class names
- Write tests after the feature is "done"
- Aim for 100% coverage at any cost
- Mock everything (test behavior, not mocks)
- Snapshot entire components
- Skip writing tests "to move faster"

---

## 16. Testing Checklist

### 16.1 Before Submitting PR

- [ ] All new code has tests
- [ ] All tests pass locally
- [ ] Coverage meets thresholds
- [ ] No skipped or pending tests (without explanation)
- [ ] Tests are readable and maintainable
- [ ] Edge cases are covered
- [ ] Error scenarios are tested

### 16.2 Code Review - Testing Focus

- [ ] Test quality (testing behavior, not implementation)
- [ ] Test coverage (critical paths covered)
- [ ] Test readability (clear, descriptive names)
- [ ] No test anti-patterns
- [ ] Proper use of mocks
- [ ] Assertions are meaningful

---

## 17. Resources & Learning

**Testing Library:**
- [React Testing Library Docs](https://testing-library.com/react)
- [Common Mistakes with RTL](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

**Vitest:**
- [Vitest Docs](https://vitest.dev/)
- [Vitest vs Jest](https://vitest.dev/guide/comparisons.html)

**Playwright:**
- [Playwright Docs](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)

**General Testing:**
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Write Tests. Not Too Many. Mostly Integration.](https://kentcdodds.com/blog/write-tests)

---

**Remember: Tests are a tool for confidence, not a checklist. Write tests that provide value and help you ship with confidence!**
