# Autonomous Development Workflow

## HomeMaint - Home Maintenance & Asset Tracking System

**Version:** 1.0
**Last Updated:** October 5, 2025
**Status:** Final

---

## 1. Overview

This document outlines how development will proceed autonomously with Claude handling all coding, testing, and verification. The user only participates in visual/UX testing at predefined milestones.

---

## 2. Autonomous Development Philosophy

**Claude Handles:**

- ✅ All code implementation
- ✅ All automated testing (unit, integration, E2E)
- ✅ Running tests and verifying they pass
- ✅ Building and verifying builds succeed
- ✅ Code quality checks (linting, type checking)
- ✅ Git commits and pushing to repository
- ✅ Documentation updates
- ✅ Bug fixes based on test failures

**User Handles:**

- ✅ Visual/UX review at milestones (Week 4, 8, 12)
- ✅ User acceptance testing
- ✅ Feedback on features
- ✅ Final approval for release

---

## 3. Revised Tech Stack (Optimized for Autonomous Development)

### 3.1 Core Stack

**Framework: Next.js 14+ with App Router**

- Full-stack React framework
- Built-in API routes (no separate backend needed)
- Server-side rendering + static generation
- Excellent TypeScript support
- **Why**: Single application I can fully test without browser interaction

**Database: better-sqlite3 (Node.js)**

- SQLite in Node.js (not browser)
- Synchronous API (easier to test)
- File-based database
- **Why**: I can run actual database operations in tests, verify queries work

**Language: TypeScript (Strict Mode)**

- Type safety throughout
- Catch errors at compile time
- **Why**: Reduces runtime errors, better IDE support

**Styling: Tailwind CSS + shadcn/ui**

- Utility-first CSS
- Copy-paste components
- **Why**: Consistent styling, no runtime CSS-in-JS overhead

**State Management: Zustand**

- Simple, lightweight
- TypeScript-first
- **Why**: Easy to test, minimal boilerplate

**Forms: React Hook Form + Zod**

- Type-safe form validation
- **Why**: Validation rules testable, great DX

### 3.2 Testing Stack

**Unit & Integration Tests: Vitest**

- Vite-native test runner
- Fast, watch mode
- **Why**: Can run all tests via bash, get immediate feedback

**Component Tests: React Testing Library**

- Test behavior, not implementation
- **Why**: Verify components work without browser

**E2E Tests: Playwright + Playwright MCP**

- Headless browser testing via Playwright
- Browser automation via Playwright MCP (Claude Code integration)
  - Navigate pages, fill forms, click buttons
  - Verify UI elements and text content
  - Capture screenshots for visual verification
  - Test responsive design across devices
- Cross-browser support (Chrome, Firefox, Safari, Mobile)
- **Why**: Can verify full user flows and visual output autonomously

**Coverage: c8 (built into Vitest)**

- Track code coverage
- **Why**: Ensure high test coverage

---

## 4. Development Workflow

### 4.1 Standard Development Cycle

```
1. Implement Feature
   ↓
2. Write Comprehensive Tests
   - Unit tests for utilities/helpers
   - Component tests for React components
   - Integration tests for API routes
   - E2E tests for user flows
   ↓
3. Run Tests Locally
   $ npm run test              # Unit + integration
   $ npm run test:e2e          # E2E tests (headless)
   $ npm run lint              # ESLint
   $ npm run type-check        # TypeScript
   ↓
4. Verify All Pass ✅
   ↓
5. Build Application
   $ npm run build
   ↓
6. Verify Build Succeeds ✅
   ↓
7. Commit & Push
   $ git add .
   $ git commit -m "feat: implement feature X"
   $ git push
   ↓
8. Repeat for Next Feature
```

### 4.2 How I Verify Everything Works

**Without Opening Browser:**

1. **Database Operations**

   ```bash
   # I can run these and see actual results
   npm run test -- db/repositories
   # Tests create real SQLite database, insert data, query, verify
   ```

2. **API Routes**

   ```bash
   # I can test API endpoints
   npm run test -- app/api
   # Tests make actual HTTP requests, verify responses
   ```

3. **React Components**

   ```bash
   # I can verify components render correctly
   npm run test -- components
   # Tests verify DOM output, interactions work
   ```

4. **Full User Flows**

   ```bash
   # I can run E2E tests headlessly
   npm run test:e2e
   # Playwright simulates user, verifies flows work
   ```

5. **Build Process**
   ```bash
   # I can verify production build works
   npm run build
   # Ensures no build errors, all imports resolve
   ```

**All of this happens without you needing to open a browser or run anything!**

---

## 5. Milestone Review Process

### Milestone 1: Week 4 - Core Foundation

**I Complete:**

- Database layer with migrations
- API routes for assets CRUD
- Basic asset list and detail pages
- Comprehensive test suite
- All tests passing ✅

**You Review:**

- Open `http://localhost:3000`
- Test adding an asset via UI
- Visual review of design
- UX feedback
- ~30 minutes testing

### Milestone 2: Week 8 - Feature Complete

**I Complete:**

- All MVP features implemented
- Maintenance tracking
- Task management
- File uploads
- All tests passing ✅

**You Review:**

- Test all major user flows
- Visual polish feedback
- Performance check
- ~1 hour testing

### Milestone 3: Week 12 - Launch Ready

**I Complete:**

- All features polished
- PWA configured
- Export functionality
- All tests + E2E passing ✅
- Production build ready

**You Review:**

- Full acceptance testing
- Cross-device testing
- Final UX review
- Launch decision
- ~2 hours testing

---

## 6. Architecture for Testability

### 6.1 Next.js App Structure

```
HomeMaint/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes (testable in Node)
│   │   ├── assets/
│   │   │   ├── route.ts      # GET /api/assets (list)
│   │   │   └── [id]/
│   │   │       └── route.ts  # GET/PUT/DELETE /api/assets/:id
│   │   ├── maintenance/
│   │   └── tasks/
│   ├── assets/               # Asset pages
│   │   ├── page.tsx          # Asset list
│   │   └── [id]/
│   │       └── page.tsx      # Asset detail
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Dashboard
├── components/               # React components
├── lib/
│   ├── db/                   # Database layer
│   │   ├── database.ts       # DB initialization (better-sqlite3)
│   │   ├── migrations/       # DB migrations
│   │   └── repositories/     # Data access
│   ├── services/             # Business logic
│   └── utils/                # Utilities
├── tests/
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   └── e2e/                  # Playwright E2E tests
├── public/                   # Static assets
└── data/                     # SQLite database file
    └── homemaint.db
```

### 6.2 Testable API Routes

```typescript
// app/api/assets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { assetRepository } from '@/lib/db/repositories/asset-repository';

export async function GET(request: NextRequest) {
  try {
    const assets = await assetRepository.findAll();
    return NextResponse.json(assets);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const asset = await assetRepository.create(body);
    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 400 });
  }
}
```

**Test:**

```typescript
// tests/integration/api/assets.test.ts
import { GET, POST } from '@/app/api/assets/route';
import { NextRequest } from 'next/server';

describe('Assets API', () => {
  it('should return all assets', async () => {
    const request = new NextRequest('http://localhost:3000/api/assets');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it('should create new asset', async () => {
    const request = new NextRequest('http://localhost:3000/api/assets', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test AC Unit',
        categoryId: 1,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.name).toBe('Test AC Unit');
  });
});
```

**I can run this test and verify it actually works!**

---

## 7. Testing Strategy for Autonomous Development

### 7.1 Test Coverage Requirements

**Minimum Coverage:**

- Overall: 85% (higher than typical because I'm testing everything)
- API Routes: 95% (critical path)
- Database Layer: 95% (data integrity)
- Business Logic: 90% (calculations, validation)
- Components: 80% (UI behavior)

### 7.2 What I Test Automatically

**✅ Database Operations**

```typescript
describe('AssetRepository', () => {
  beforeEach(() => {
    // Create fresh test database
    initTestDatabase();
  });

  it('should create and retrieve asset', () => {
    const created = repository.create({
      name: 'AC Unit',
      categoryId: 1,
    });

    const retrieved = repository.findById(created.id);

    expect(retrieved).toBeDefined();
    expect(retrieved.name).toBe('AC Unit');
  });

  // I verify actual SQL queries work!
});
```

**✅ Business Logic**

```typescript
describe('Asset Calculations', () => {
  it('should calculate warranty expiration correctly', () => {
    const purchaseDate = new Date('2024-01-01');
    const durationMonths = 12;

    const expiration = calculateWarrantyExpiration(purchaseDate, durationMonths);

    expect(expiration).toEqual(new Date('2025-01-01'));
  });

  // I verify all calculations are correct!
});
```

**✅ API Endpoints**

```typescript
describe('Asset API', () => {
  it('should handle validation errors', async () => {
    const response = await POST(
      new NextRequest('...', {
        body: JSON.stringify({ name: '' }), // Invalid
      })
    );

    expect(response.status).toBe(400);
    // I verify error handling works!
  });
});
```

**✅ React Components**

```typescript
describe('AssetCard', () => {
  it('should render asset information', () => {
    render(<AssetCard asset={mockAsset} />);

    expect(screen.getByText('AC Unit')).toBeInTheDocument();
    expect(screen.getByText('HVAC')).toBeInTheDocument();
    // I verify components render correctly!
  });
});
```

**✅ User Flows**

```typescript
test('user can add new asset', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('text=Add Asset');
  await page.fill('input[name="name"]', 'Water Heater');
  await page.selectOption('select[name="category"]', 'Plumbing');
  await page.click('button:has-text("Save")');

  await expect(page.locator('text=Water Heater')).toBeVisible();
  // I verify entire user flow works!
});
```

---

## 8. Quality Assurance Without Browser

### 8.1 Pre-Commit Checks (Automated)

Every commit automatically verifies:

```bash
# 1. TypeScript compiles
npm run type-check

# 2. Linting passes
npm run lint

# 3. All tests pass
npm run test

# 4. Build succeeds
npm run build
```

**If any fail, I don't commit. I fix and retry.**

### 8.2 CI/CD Pipeline (Future)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:coverage
      - run: npm run test:e2e
      - run: npm run build
```

**Every push runs full test suite automatically.**

---

## 9. Development Timeline (Autonomous)

### Week 1: Project Setup

- [x] Initialize Next.js project
- [x] Configure TypeScript, ESLint, Prettier
- [x] Set up Tailwind CSS + shadcn/ui
- [x] Configure database (better-sqlite3)
- [x] Set up testing infrastructure (Vitest, Playwright)
- [x] Create initial migrations
- [x] Write first tests

**Verification:** All setup tests pass ✅

### Week 2-3: Asset Management

- [ ] Implement asset repository
- [ ] Create asset API routes
- [ ] Build asset list page
- [ ] Build asset detail page
- [ ] Build asset form
- [ ] Write comprehensive tests
- [ ] All tests pass ✅

### Week 4: **MILESTONE 1 - User Review**

### Week 5-6: Maintenance Tracking

- [ ] Implement maintenance repository
- [ ] Create maintenance API routes
- [ ] Build maintenance timeline
- [ ] Build maintenance form
- [ ] Write tests
- [ ] All tests pass ✅

### Week 7-8: Task Management

- [ ] Implement task repository
- [ ] Create task API routes
- [ ] Build task list/calendar
- [ ] Build task form
- [ ] Recurring task logic
- [ ] Write tests
- [ ] All tests pass ✅

### Week 8: **MILESTONE 2 - User Review**

### Week 9-10: File Management & Polish

- [ ] Implement file storage
- [ ] File upload/download
- [ ] Export functionality
- [ ] Dashboard widgets
- [ ] Write tests
- [ ] All tests pass ✅

### Week 11: PWA & Offline

- [ ] Configure PWA
- [ ] Offline support
- [ ] Service worker
- [ ] Write offline tests
- [ ] All tests pass ✅

### Week 12: Final Testing & Polish

- [ ] Complete E2E test suite
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Production build verification
- [ ] All tests pass ✅

### Week 12: **MILESTONE 3 - Final Review & Launch**

---

## 10. Communication During Development

### 10.1 Progress Updates

After each major feature, I'll provide:

```
✅ Feature: Asset CRUD Operations
- Implemented: Repository, API routes, UI pages
- Tests: 47 tests, all passing
- Coverage: 92%
- Build: Success
- Ready for: Next feature

[Link to commit]
```

### 10.2 When I Need Input

I'll only ask for input if:

1. **Ambiguity in requirements** - Need clarification on feature behavior
2. **Major architectural decision** - Affects multiple features
3. **Blocked by external factor** - Can't proceed without decision

Otherwise, I proceed autonomously based on documentation.

### 10.3 Milestone Reviews

At each milestone, I'll provide:

- Demo instructions (how to run locally)
- Feature checklist (what's implemented)
- Test report (coverage, passing tests)
- Known issues (if any)
- Next steps

You provide:

- Visual/UX feedback
- Feature acceptance
- Priority adjustments (if needed)

---

## 11. Advantages of This Approach

### For You:

✅ Minimal time investment (only milestone reviews)
✅ High confidence (comprehensive automated testing)
✅ Fast development (no waiting for manual testing between features)
✅ Quality code (enforced by tests and type checking)
✅ Working software at every milestone

### For Me:

✅ Can verify everything works without browser
✅ Immediate feedback from tests
✅ Can refactor with confidence (tests catch regressions)
✅ Can work continuously without interruption
✅ Clear success criteria (all tests pass)

---

## 12. Risk Mitigation

**Risk:** Visual/UX issues not caught until milestone
**Mitigation:**

- Follow design system strictly
- Use established component library (shadcn/ui)
- Implement exactly per wireframes
- Playwright visual regression tests (screenshots)

**Risk:** Feature doesn't meet expectations
**Mitigation:**

- Clear user stories with acceptance criteria
- Implement exactly as documented
- Comprehensive E2E tests verify user stories

**Risk:** Performance issues
**Mitigation:**

- Performance tests in CI/CD
- Lighthouse scores in automated tests
- Optimize as I build (not after)

**Risk:** Technical blocker
**Mitigation:**

- Communicate immediately
- Provide options with tradeoffs
- Document decision

---

## 13. Success Criteria

**For Each Feature:**

- ✅ All tests pass (unit, integration, E2E)
- ✅ Type checking passes (no TypeScript errors)
- ✅ Linting passes (no ESLint errors)
- ✅ Build succeeds (no build errors)
- ✅ Coverage meets targets (>85%)
- ✅ Committed and pushed to GitHub

**For Each Milestone:**

- ✅ All features from milestone completed
- ✅ User review completed
- ✅ Feedback incorporated
- ✅ Approved to proceed

**For Launch:**

- ✅ All MVP features complete
- ✅ All tests passing
- ✅ Production build verified
- ✅ User acceptance testing passed
- ✅ Documentation complete

---

## 14. What You Need to Do

### One-Time Setup (Before I Start)

```bash
# 1. Clone repository
git clone https://github.com/cjnemes/HomeMaint.git
cd HomeMaint

# 2. Install dependencies
npm install

# That's it! You're ready for milestone reviews.
```

### At Each Milestone

```bash
# 1. Pull latest code
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Run development server
npm run dev

# 4. Open browser to http://localhost:3000

# 5. Test features and provide feedback
```

**Time commitment: 30 min - 2 hours per milestone (3 milestones total)**

---

## 15. Example Development Session

```
[Claude starts work on Asset Management]

1. Create database migration for assets table
2. Implement AssetRepository with CRUD methods
3. Write unit tests for AssetRepository
4. Run tests: npm run test -- AssetRepository
   ✅ All 15 tests pass

5. Create API route /api/assets
6. Write integration tests for API route
7. Run tests: npm run test -- api/assets
   ✅ All 8 tests pass

8. Create AssetListPage component
9. Write component tests
10. Run tests: npm run test -- AssetListPage
    ✅ All 6 tests pass

11. Create E2E test for "user can view assets"
12. Run E2E test: npm run test:e2e -- assets
    ✅ Test passes (headless browser)

13. Run full test suite: npm run test
    ✅ 142 tests pass, 0 fail

14. Type check: npm run type-check
    ✅ No errors

15. Lint: npm run lint
    ✅ No errors

16. Build: npm run build
    ✅ Build successful

17. Commit and push
    git add .
    git commit -m "feat: implement asset list and detail views"
    git push origin main

[Continue to next feature...]
```

**All of this happens without you needing to do anything!**

---

## 16. Summary

**This approach lets me:**

- Develop completely autonomously
- Verify everything works through automated tests
- Deliver working, tested features continuously
- Catch bugs immediately (not at milestone)

**You only need to:**

- Review visual/UX at 3 milestones
- Provide feedback
- Approve to proceed

**Result:**

- High-quality application
- Minimal time investment
- Fast development
- High confidence at launch

---

**Let's build something amazing! 🚀**
