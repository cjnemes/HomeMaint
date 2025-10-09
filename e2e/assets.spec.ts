import { test, expect } from '@playwright/test';

test.describe('Asset Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/assets');
  });

  test.describe('Asset List', () => {
    test('should display asset list with mock data', async ({ page }) => {
      // Should show header with count
      await expect(page.getByRole('heading', { name: 'Assets' })).toBeVisible();
      await expect(page.getByText('6')).toBeVisible(); // 6 mock assets

      // Should show category groups
      await expect(page.getByRole('heading', { name: /HVAC/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /Plumbing/i })).toBeVisible();

      // Should show asset cards
      await expect(page.getByText('Central Air Conditioning Unit')).toBeVisible();
      await expect(page.getByText('Water Heater')).toBeVisible();
    });

    test('should search assets by name', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search assets/i);

      // Search for "water"
      await searchInput.fill('water');
      await expect(page.getByText('Water Heater')).toBeVisible();
      await expect(page.getByText('Central Air Conditioning Unit')).not.toBeVisible();

      // Clear search
      await searchInput.clear();
      await expect(page.getByText('Central Air Conditioning Unit')).toBeVisible();
    });

    test('should search assets by manufacturer', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search assets/i);

      // Search for "carrier"
      await searchInput.fill('carrier');
      await expect(page.getByText('Central Air Conditioning Unit')).toBeVisible();
      await expect(page.getByText('Water Heater')).not.toBeVisible();
    });

    test('should filter assets by category', async ({ page }) => {
      // Open category filter
      const categoryFilter = page.getByRole('combobox').first();
      await categoryFilter.click();

      // Select HVAC category
      await page.getByRole('option', { name: /HVAC/i }).click();

      // Should only show HVAC assets
      await expect(page.getByText('Central Air Conditioning Unit')).toBeVisible();
      await expect(page.getByText('Furnace')).toBeVisible();
      await expect(page.getByText('Water Heater')).not.toBeVisible();
    });

    test('should filter assets by status', async ({ page }) => {
      // Open status filter (second combobox)
      const statusFilter = page.getByRole('combobox').nth(1);
      await statusFilter.click();

      // Select active status
      await page.getByRole('option', { name: 'Active' }).click();

      // All mock assets are active, should see all
      await expect(page.getByText('Central Air Conditioning Unit')).toBeVisible();
      await expect(page.getByText('Water Heater')).toBeVisible();
    });

    test('should combine search and filters', async ({ page }) => {
      // Search + filter
      await page.getByPlaceholder(/search assets/i).fill('air');

      const categoryFilter = page.getByRole('combobox').first();
      await categoryFilter.click();
      await page.getByRole('option', { name: /HVAC/i }).click();

      // Should show matching asset
      await expect(page.getByText('Central Air Conditioning Unit')).toBeVisible();
      await expect(page.getByText('Furnace')).not.toBeVisible();
    });

    test('should show no results message when filters match nothing', async ({ page }) => {
      await page.getByPlaceholder(/search assets/i).fill('nonexistent asset name');

      await expect(page.getByText('No assets found')).toBeVisible();
      await expect(page.getByText(/try adjusting your search/i)).toBeVisible();
    });

    test('should navigate to asset detail on card click', async ({ page }) => {
      // Click on first asset card
      await page.getByText('Central Air Conditioning Unit').click();

      // Should navigate to detail page
      await expect(page).toHaveURL(/\/assets\/\d+/);
      await expect(
        page.getByRole('heading', { name: 'Central Air Conditioning Unit' })
      ).toBeVisible();
    });
  });

  test.describe('Add Asset Dialog', () => {
    test('should open add asset dialog', async ({ page }) => {
      await page
        .getByRole('button', { name: /add asset/i })
        .first()
        .click();

      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Add New Asset' })).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page
        .getByRole('button', { name: /add asset/i })
        .first()
        .click();

      // Try to submit without filling required fields
      await page.getByRole('button', { name: 'Add Asset' }).last().click();

      // Should show validation error
      await expect(page.getByText(/name is required/i)).toBeVisible();
    });

    test('should fill and submit add asset form', async ({ page }) => {
      await page
        .getByRole('button', { name: /add asset/i })
        .first()
        .click();

      // Fill form fields
      await page.getByLabel(/asset name/i).fill('Test Asset');
      await page.getByLabel(/manufacturer/i).fill('Test Manufacturer');
      await page.getByLabel(/model number/i).fill('MODEL-123');
      await page.getByLabel(/serial number/i).fill('SN-123456');

      // Select category
      const categorySelect = page.getByRole('combobox', { name: /category/i });
      await categorySelect.click();
      await page.getByRole('option', { name: /HVAC/i }).click();

      // Select location
      const locationSelect = page.getByRole('combobox', { name: /location/i });
      await locationSelect.click();
      await page.getByRole('option', { name: 'Kitchen' }).click();

      // Fill purchase info
      await page.getByLabel(/purchase price/i).fill('1500');
      await page.getByLabel(/warranty duration/i).fill('24');

      // Add notes
      await page.getByLabel(/notes/i).fill('Test notes for this asset');

      // Submit form
      await page.getByRole('button', { name: 'Add Asset' }).last().click();

      // Dialog should close
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });

    test('should cancel add asset dialog', async ({ page }) => {
      await page
        .getByRole('button', { name: /add asset/i })
        .first()
        .click();

      // Fill some data
      await page.getByLabel(/asset name/i).fill('Test Asset');

      // Click cancel
      await page.getByRole('button', { name: 'Cancel' }).click();

      // Dialog should close
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });
  });

  test.describe('Asset Detail Page', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to first asset detail page
      await page.getByText('Central Air Conditioning Unit').click();
    });

    test('should display asset details', async ({ page }) => {
      // Header info
      await expect(
        page.getByRole('heading', { name: 'Central Air Conditioning Unit' })
      ).toBeVisible();
      await expect(page.getByText('Carrier')).toBeVisible();
      await expect(page.getByText(/24ACC636A003/)).toBeVisible();

      // Basic information card
      await expect(page.getByText('Category')).toBeVisible();
      await expect(page.getByText(/HVAC/)).toBeVisible();

      // Purchase & Warranty card
      await expect(page.getByText('Purchase Date')).toBeVisible();
      await expect(page.getByText('Warranty Expires')).toBeVisible();
    });

    test('should navigate back to asset list', async ({ page }) => {
      // Click back button
      await page.getByRole('button').first().click();

      // Should be back on assets page
      await expect(page).toHaveURL('/assets');
      await expect(page.getByRole('heading', { name: 'Assets' })).toBeVisible();
    });

    test('should show quick stats sidebar', async ({ page }) => {
      await expect(page.getByText('Quick Stats')).toBeVisible();
      await expect(page.getByText('Maintenance Records')).toBeVisible();
      await expect(page.getByText('Upcoming Tasks')).toBeVisible();
      await expect(page.getByText('Total Spent')).toBeVisible();
    });

    test('should show empty maintenance history', async ({ page }) => {
      await expect(page.getByText('Maintenance History')).toBeVisible();
      await expect(page.getByText('No maintenance records yet')).toBeVisible();
    });

    test('should show empty upcoming tasks', async ({ page }) => {
      await expect(page.getByText('Upcoming Tasks')).toBeVisible();
      await expect(page.getByText('No scheduled tasks')).toBeVisible();
    });

    test('should show empty documents', async ({ page }) => {
      await expect(page.getByText('Documents')).toBeVisible();
      await expect(page.getByText('No documents uploaded')).toBeVisible();
    });
  });

  test.describe('Edit Asset', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to asset detail page
      await page.getByText('Central Air Conditioning Unit').click();
    });

    test('should open edit asset dialog', async ({ page }) => {
      await page.getByRole('button', { name: /edit/i }).click();

      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Edit Asset' })).toBeVisible();
    });

    test('should pre-fill form with asset data', async ({ page }) => {
      await page.getByRole('button', { name: /edit/i }).click();

      // Check that fields are pre-filled
      const nameInput = page.getByLabel(/asset name/i);
      await expect(nameInput).toHaveValue('Central Air Conditioning Unit');

      const manufacturerInput = page.getByLabel(/manufacturer/i);
      await expect(manufacturerInput).toHaveValue('Carrier');

      const modelInput = page.getByLabel(/model number/i);
      await expect(modelInput).toHaveValue('24ACC636A003');
    });

    test('should update asset details', async ({ page }) => {
      await page.getByRole('button', { name: /edit/i }).click();

      // Update name
      const nameInput = page.getByLabel(/asset name/i);
      await nameInput.clear();
      await nameInput.fill('Updated AC Unit Name');

      // Update notes
      await page.getByLabel(/notes/i).fill('Updated notes for testing');

      // Save changes
      await page.getByRole('button', { name: 'Save Changes' }).click();

      // Dialog should close
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });

    test('should cancel edit dialog', async ({ page }) => {
      await page.getByRole('button', { name: /edit/i }).click();

      // Make changes
      await page.getByLabel(/asset name/i).fill('Changed Name');

      // Cancel
      await page.getByRole('button', { name: 'Cancel' }).click();

      // Dialog should close
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });

    test('should change asset status', async ({ page }) => {
      await page.getByRole('button', { name: /edit/i }).click();

      // Change status
      const statusSelect = page.getByRole('combobox', { name: /status/i });
      await statusSelect.click();
      await page.getByRole('option', { name: 'Retired' }).click();

      // Save
      await page.getByRole('button', { name: 'Save Changes' }).click();

      await expect(page.getByRole('dialog')).not.toBeVisible();
    });
  });

  test.describe('Delete Asset', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to asset detail page
      await page.getByText('Central Air Conditioning Unit').click();
    });

    test('should show delete confirmation dialog', async ({ page }) => {
      await page.getByRole('button', { name: /delete/i }).click();

      // Should show AlertDialog
      await expect(page.getByRole('alertdialog')).toBeVisible();
      await expect(page.getByText('Are you sure?')).toBeVisible();
      await expect(
        page.getByText(/this will permanently delete.*Central Air Conditioning Unit/i)
      ).toBeVisible();
    });

    test('should cancel delete action', async ({ page }) => {
      await page.getByRole('button', { name: /delete/i }).click();

      // Click cancel
      await page.getByRole('button', { name: 'Cancel' }).click();

      // Should remain on detail page
      await expect(page).toHaveURL(/\/assets\/\d+/);
      await expect(
        page.getByRole('heading', { name: 'Central Air Conditioning Unit' })
      ).toBeVisible();
    });

    test('should confirm delete and navigate to list', async ({ page }) => {
      await page.getByRole('button', { name: /delete/i }).click();

      // Confirm delete
      await page.getByRole('button', { name: 'Delete Asset' }).click();

      // Should navigate back to assets list
      await expect(page).toHaveURL('/assets');
      await expect(page.getByRole('heading', { name: 'Assets' })).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should display properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/assets');

      // Should show asset list
      await expect(page.getByRole('heading', { name: 'Assets' })).toBeVisible();

      // Cards should stack vertically
      await expect(page.getByText('Central Air Conditioning Unit')).toBeVisible();
      await expect(page.getByText('Water Heater')).toBeVisible();
    });

    test('should display asset detail properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.getByText('Central Air Conditioning Unit').click();

      // Should show all sections
      await expect(
        page.getByRole('heading', { name: 'Central Air Conditioning Unit' })
      ).toBeVisible();
      await expect(page.getByText('Basic Information')).toBeVisible();
      await expect(page.getByText('Purchase & Warranty')).toBeVisible();
    });
  });
});
