# HomeMaint Cross-Browser Testing Checklist

This document provides a comprehensive testing checklist for validating HomeMaint across different browsers, devices, and screen sizes before production deployment.

## Table of Contents

1. [Browser Support Matrix](#browser-support-matrix)
2. [Testing Environment Setup](#testing-environment-setup)
3. [Core Functionality Tests](#core-functionality-tests)
4. [Browser-Specific Tests](#browser-specific-tests)
5. [Device & Screen Size Tests](#device--screen-size-tests)
6. [PWA Functionality Tests](#pwa-functionality-tests)
7. [Performance Tests](#performance-tests)
8. [Accessibility Tests](#accessibility-tests)

---

## Browser Support Matrix

### Desktop Browsers (Target Support)

| Browser | Version           | Priority   | Status |
| ------- | ----------------- | ---------- | ------ |
| Chrome  | Latest 2 versions | **High**   | ☐      |
| Firefox | Latest 2 versions | **High**   | ☐      |
| Safari  | Latest 2 versions | **High**   | ☐      |
| Edge    | Latest 2 versions | **Medium** | ☐      |
| Brave   | Latest version    | **Low**    | ☐      |

### Mobile Browsers (Target Support)

| Browser          | Platform    | Priority   | Status |
| ---------------- | ----------- | ---------- | ------ |
| Safari           | iOS 15+     | **High**   | ☐      |
| Chrome           | Android 10+ | **High**   | ☐      |
| Samsung Internet | Android 10+ | **Medium** | ☐      |
| Firefox          | Android 10+ | **Low**    | ☐      |

### Minimum Requirements

- **Desktop:** 1280x720 resolution
- **Tablet:** 768x1024 resolution
- **Mobile:** 375x667 resolution (iPhone SE)
- **JavaScript:** Required (ES2020+)
- **Storage:** IndexedDB, LocalStorage, Service Workers

---

## Testing Environment Setup

### Option 1: Local Testing with BrowserStack

```bash
# Sign up for free trial at https://www.browserstack.com
# Use BrowserStack Live for manual testing
# Use BrowserStack Automate for automated tests
```

### Option 2: Local Device Testing

```bash
# Start development server
npm run dev

# Access from other devices on local network
# Find your local IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Access at http://YOUR_IP:3000
```

### Option 3: ngrok for Remote Testing

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Share the https URL with testers
```

### Option 4: Staging Environment

Deploy to staging and test at public URL (recommended).

---

## Core Functionality Tests

Run these tests on **all browsers** in the support matrix.

### 1. Initial Load & Navigation

| Test                             | Chrome | Firefox | Safari | Edge | Mobile Safari | Mobile Chrome |
| -------------------------------- | ------ | ------- | ------ | ---- | ------------- | ------------- |
| Application loads without errors | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Dashboard displays correctly     | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Navigation menu works            | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Mobile menu opens/closes         | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Page transitions are smooth      | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Back button works correctly      | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |

### 2. Asset Management

| Test                           | Chrome | Firefox | Safari | Edge | Mobile Safari | Mobile Chrome |
| ------------------------------ | ------ | ------- | ------ | ---- | ------------- | ------------- |
| View asset list                | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Create new asset               | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Edit existing asset            | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Delete asset with confirmation | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| View asset details page        | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Filter/search assets           | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Category dropdown works        | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Location dropdown works        | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |

### 3. File Uploads

| Test                              | Chrome | Firefox | Safari | Edge | Mobile Safari | Mobile Chrome |
| --------------------------------- | ------ | ------- | ------ | ---- | ------------- | ------------- |
| Upload photo (JPEG)               | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Upload photo (PNG)                | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Upload photo (HEIC - iOS)         | N/A    | N/A     | N/A    | N/A  | ☐             | N/A           |
| Upload document (PDF)             | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| File size validation (10MB limit) | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| File type validation              | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| View uploaded file                | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Delete uploaded file              | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Take photo with camera (mobile)   | N/A    | N/A     | N/A    | N/A  | ☐             | ☐             |

### 4. Maintenance Records

| Test                        | Chrome | Firefox | Safari | Edge | Mobile Safari | Mobile Chrome |
| --------------------------- | ------ | ------- | ------ | ---- | ------------- | ------------- |
| View maintenance list       | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Create maintenance record   | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Edit maintenance record     | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Delete maintenance record   | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Date picker works           | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Cost input accepts decimals | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |

### 5. Task Management

| Test                    | Chrome | Firefox | Safari | Edge | Mobile Safari | Mobile Chrome |
| ----------------------- | ------ | ------- | ------ | ---- | ------------- | ------------- |
| View task list          | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Create new task         | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Edit existing task      | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Complete task           | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Delete task             | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Priority dropdown works | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Due date picker works   | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |

### 6. Data Export

| Test                                     | Chrome | Firefox | Safari | Edge | Mobile Safari | Mobile Chrome |
| ---------------------------------------- | ------ | ------- | ------ | ---- | ------------- | ------------- |
| Export assets as CSV                     | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Export maintenance as CSV                | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Export tasks as CSV                      | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Export all data as JSON                  | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| CSV download triggers                    | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |
| Open CSV in Excel (no formula execution) | ☐      | ☐       | ☐      | ☐    | N/A           | N/A           |
| Open CSV in Google Sheets                | ☐      | ☐       | ☐      | ☐    | ☐             | ☐             |

---

## Browser-Specific Tests

### Safari-Specific Issues

| Test                             | Status | Notes                         |
| -------------------------------- | ------ | ----------------------------- |
| Date input works (native picker) | ☐      | Safari has unique date picker |
| HEIC photo upload works          | ☐      | iOS-specific format           |
| Touch gestures work              | ☐      | Swipe, pinch, etc.            |
| IndexedDB works correctly        | ☐      | Safari has storage limits     |
| Service Worker installs          | ☐      | Check PWA functionality       |

### Firefox-Specific Issues

| Test                             | Status | Notes                   |
| -------------------------------- | ------ | ----------------------- |
| Flexbox layouts render correctly | ☐      | Some flex differences   |
| Dialog animations work           | ☐      | Check backdrop-filter   |
| File upload dialog appears       | ☐      | Firefox has unique UI   |
| Console shows no warnings        | ☐      | Check developer console |

### Chrome/Edge-Specific Issues

| Test                           | Status | Notes               |
| ------------------------------ | ------ | ------------------- |
| PWA install prompt appears     | ☐      | Chrome/Edge only    |
| Notifications permission works | ☐      | Future feature prep |
| DevTools show no errors        | ☐      | Check console       |

---

## Device & Screen Size Tests

### Desktop Resolutions

| Resolution     | Browser | Layout OK | Scrolling OK | Interactions OK |
| -------------- | ------- | --------- | ------------ | --------------- |
| 1920x1080      | Chrome  | ☐         | ☐            | ☐               |
| 1920x1080      | Firefox | ☐         | ☐            | ☐               |
| 1920x1080      | Safari  | ☐         | ☐            | ☐               |
| 1366x768       | Chrome  | ☐         | ☐            | ☐               |
| 1280x720 (min) | Chrome  | ☐         | ☐            | ☐               |

### Tablet Devices

| Device             | Orientation | Browser | Layout OK | Touch OK | Status |
| ------------------ | ----------- | ------- | --------- | -------- | ------ |
| iPad Pro 12.9"     | Portrait    | Safari  | ☐         | ☐        | ☐      |
| iPad Pro 12.9"     | Landscape   | Safari  | ☐         | ☐        | ☐      |
| iPad Air 10.9"     | Portrait    | Safari  | ☐         | ☐        | ☐      |
| iPad Air 10.9"     | Landscape   | Safari  | ☐         | ☐        | ☐      |
| Samsung Galaxy Tab | Portrait    | Chrome  | ☐         | ☐        | ☐      |
| Samsung Galaxy Tab | Landscape   | Chrome  | ☐         | ☐        | ☐      |

### Mobile Devices

| Device            | Browser          | Layout OK | Touch OK | Camera Works | Status |
| ----------------- | ---------------- | --------- | -------- | ------------ | ------ |
| iPhone 15 Pro     | Safari           | ☐         | ☐        | ☐            | ☐      |
| iPhone SE (small) | Safari           | ☐         | ☐        | ☐            | ☐      |
| iPhone 11         | Safari           | ☐         | ☐        | ☐            | ☐      |
| Pixel 7           | Chrome           | ☐         | ☐        | ☐            | ☐      |
| Samsung S23       | Samsung Internet | ☐         | ☐        | ☐            | ☐      |
| Samsung S23       | Chrome           | ☐         | ☐        | ☐            | ☐      |

### Responsive Breakpoints

Test at these specific widths:

| Breakpoint | Width  | Purpose          | Layout OK | Status |
| ---------- | ------ | ---------------- | --------- | ------ |
| Mobile     | 375px  | iPhone SE        | ☐         | ☐      |
| Mobile L   | 425px  | Large phones     | ☐         | ☐      |
| Tablet     | 768px  | iPad portrait    | ☐         | ☐      |
| Laptop     | 1024px | Small laptops    | ☐         | ☐      |
| Desktop    | 1440px | Standard desktop | ☐         | ☐      |

---

## PWA Functionality Tests

### Installation

| Test                            | Chrome | Safari | Edge | Mobile Safari | Mobile Chrome | Status |
| ------------------------------- | ------ | ------ | ---- | ------------- | ------------- | ------ |
| Install prompt appears          | ☐      | N/A    | ☐    | ☐             | ☐             | ☐      |
| App installs successfully       | ☐      | ☐      | ☐    | ☐             | ☐             | ☐      |
| App icon appears on home screen | ☐      | ☐      | ☐    | ☐             | ☐             | ☐      |
| App opens in standalone mode    | ☐      | ☐      | ☐    | ☐             | ☐             | ☐      |
| Splash screen displays          | ☐      | ☐      | ☐    | ☐             | ☐             | ☐      |

### Offline Functionality

| Test                                      | Status | Notes                        |
| ----------------------------------------- | ------ | ---------------------------- |
| Service worker registers                  | ☐      | Check DevTools → Application |
| App loads offline (cached)                | ☐      | Turn off network, reload     |
| Offline message displays (uncached pages) | ☐      | Visit new page offline       |
| App updates when back online              | ☐      | Turn network back on         |

### Storage

| Test                       | Status | Notes                   |
| -------------------------- | ------ | ----------------------- |
| LocalStorage works         | ☐      | Settings persist        |
| IndexedDB works            | ☐      | Large data storage      |
| Service Worker cache works | ☐      | Assets cached           |
| Storage quota sufficient   | ☐      | Check quota in DevTools |

---

## Performance Tests

Run with **Lighthouse** (Chrome DevTools → Lighthouse tab).

### Desktop Performance

| Browser | Performance       | Accessibility     | Best Practices    | SEO         | PWA | Status |
| ------- | ----------------- | ----------------- | ----------------- | ----------- | --- | ------ |
| Chrome  | Target: 90+       | Target: 95+       | Target: 95+       | Target: 90+ | ☐   | ☐      |
| Firefox | Use dev tools     | Use dev tools     | Use dev tools     | N/A         | N/A | ☐      |
| Safari  | Use Web Inspector | Use Web Inspector | Use Web Inspector | N/A         | N/A | ☐      |

### Mobile Performance

| Device                | Performance | FCP | LCP   | TTI   | CLS  | Status |
| --------------------- | ----------- | --- | ----- | ----- | ---- | ------ |
| iPhone 15 (throttled) | Target: 80+ | <2s | <2.5s | <3.8s | <0.1 | ☐      |
| Pixel 7 (throttled)   | Target: 80+ | <2s | <2.5s | <3.8s | <0.1 | ☐      |

**Throttling:** Test with "Slow 4G" network and "4x CPU slowdown" enabled.

### Load Time Tests

| Page         | Desktop (<1s) | Mobile (<2s) | Status |
| ------------ | ------------- | ------------ | ------ |
| Dashboard    | ☐             | ☐            | ☐      |
| Assets List  | ☐             | ☐            | ☐      |
| Asset Detail | ☐             | ☐            | ☐      |
| Maintenance  | ☐             | ☐            | ☐      |
| Tasks        | ☐             | ☐            | ☐      |
| Settings     | ☐             | ☐            | ☐      |

---

## Accessibility Tests

### Keyboard Navigation

| Test                                | Status | Notes                    |
| ----------------------------------- | ------ | ------------------------ |
| Tab order is logical                | ☐      | Tab through all elements |
| Focus indicators visible            | ☐      | See what's focused       |
| All buttons accessible via keyboard | ☐      | Enter/Space activates    |
| Dropdowns work with arrow keys      | ☐      | Navigate with keyboard   |
| Dialogs trap focus                  | ☐      | Can't tab outside dialog |
| Escape closes dialogs               | ☐      | ESC key works            |
| All forms submittable via Enter     | ☐      | No mouse required        |

### Screen Reader Testing

| Browser/SR                | Homepage | Create Asset | Upload File | Export Data | Status |
| ------------------------- | -------- | ------------ | ----------- | ----------- | ------ |
| NVDA (Windows/Firefox)    | ☐        | ☐            | ☐           | ☐           | ☐      |
| JAWS (Windows/Chrome)     | ☐        | ☐            | ☐           | ☐           | ☐      |
| VoiceOver (macOS/Safari)  | ☐        | ☐            | ☐           | ☐           | ☐      |
| VoiceOver (iOS/Safari)    | ☐        | ☐            | ☐           | ☐           | ☐      |
| TalkBack (Android/Chrome) | ☐        | ☐            | ☐           | ☐           | ☐      |

### Color & Contrast

| Test                         | Status | Tool                  |
| ---------------------------- | ------ | --------------------- |
| Color contrast ratio ≥ 4.5:1 | ☐      | Lighthouse, WAVE      |
| No color-only information    | ☐      | Manual inspection     |
| Focus indicators contrast    | ☐      | Manual inspection     |
| Works in high contrast mode  | ☐      | Windows High Contrast |
| Works with dark mode         | ☐      | System dark mode      |

### ARIA & Semantics

| Test                          | Status | Notes              |
| ----------------------------- | ------ | ------------------ |
| Heading hierarchy correct     | ☐      | h1 → h2 → h3       |
| Buttons have accessible names | ☐      | aria-label present |
| Form inputs have labels       | ☐      | Associated labels  |
| Dialogs have aria-modal       | ☐      | Announced as modal |
| Alerts use aria-live          | ☐      | Announcements work |

---

## Security & Privacy Tests

| Test                            | Status | Notes              |
| ------------------------------- | ------ | ------------------ |
| HTTPS enforced                  | ☐      | No mixed content   |
| Content Security Policy active  | ☐      | Check headers      |
| No console errors in production | ☐      | Clean console      |
| Sentry captures errors          | ☐      | Trigger test error |
| CSV formula injection prevented | ☐      | Export with `=1+1` |
| File upload validates MIME type | ☐      | Try uploading .exe |
| File upload validates size      | ☐      | Try 11MB file      |
| No sensitive data in URLs       | ☐      | Check address bar  |

---

## Bug Reporting Template

When you find a bug, report it with this format:

```markdown
**Browser:** Chrome 120 / macOS 14.1
**Device:** MacBook Pro 14" 2023
**Screen Size:** 1920x1080
**Steps to Reproduce:**

1. Navigate to Assets page
2. Click "Add Asset"
3. Fill in form
4. Click "Save"

**Expected Result:** Asset should be created and appear in list

**Actual Result:** Form submits but asset doesn't appear

**Screenshots:** [Attach screenshot]

**Console Errors:** [Paste any errors from DevTools]

**Additional Context:** Only happens when offline mode is enabled
```

---

## Testing Sign-Off

Once all tests are complete, sign off before production deployment:

| Category              | Tester | Date | Status | Notes |
| --------------------- | ------ | ---- | ------ | ----- |
| Core Functionality    |        |      | ☐      |       |
| Browser Compatibility |        |      | ☐      |       |
| Responsive Design     |        |      | ☐      |       |
| PWA Functionality     |        |      | ☐      |       |
| Performance           |        |      | ☐      |       |
| Accessibility         |        |      | ☐      |       |
| Security              |        |      | ☐      |       |

**Final Approval:**

- [ ] All high-priority tests passing
- [ ] All critical bugs fixed
- [ ] Sentry configured and tested
- [ ] Performance meets targets
- [ ] Accessibility meets WCAG 2.1 AA
- [ ] Ready for production deployment

**Approved By:** ******\_\_\_\_******
**Date:** ******\_\_\_\_******

---

## Automated Testing

### Setup Playwright for Cross-Browser Testing

```bash
npm install -D @playwright/test
npx playwright install
```

### Example Test

```typescript
// e2e/asset-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Asset Management', () => {
  test('should create a new asset', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Assets');
    await page.click('text=Add Asset');

    await page.fill('input[name="name"]', 'Test Furnace');
    await page.selectOption('select[name="category"]', 'hvac');
    await page.click('button:has-text("Save")');

    await expect(page.locator('text=Test Furnace')).toBeVisible();
  });
});
```

### Run Tests

```bash
# Run on all browsers
npx playwright test

# Run on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

---

## Resources

- **Browser Testing Tools:**
  - BrowserStack: https://www.browserstack.com
  - LambdaTest: https://www.lambdatest.com
  - Sauce Labs: https://saucelabs.com

- **Performance Testing:**
  - Lighthouse: Built into Chrome DevTools
  - WebPageTest: https://www.webpagetest.org
  - GTmetrix: https://gtmetrix.com

- **Accessibility Testing:**
  - WAVE: https://wave.webaim.org
  - axe DevTools: https://www.deque.com/axe/devtools/
  - Lighthouse: Accessibility audit

- **Mobile Testing:**
  - Chrome DevTools Device Mode
  - Safari Responsive Design Mode
  - BrowserStack Real Devices

---

**Last Updated:** 2025-10-12
**Next Review:** Before each major release
