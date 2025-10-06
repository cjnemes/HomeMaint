import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the application title', async ({ page }) => {
    await page.goto('/');

    // Check for the main heading
    await expect(page.getByRole('heading', { name: 'HomeMaint' })).toBeVisible();
  });

  test('should display the tagline', async ({ page }) => {
    await page.goto('/');

    // Check for the description
    await expect(page.getByText('Home Maintenance & Asset Tracking')).toBeVisible();
  });

  test('should display action buttons', async ({ page }) => {
    await page.goto('/');

    // Check for buttons
    await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Learn More' })).toBeVisible();
  });

  test('should have accessible buttons', async ({ page }) => {
    await page.goto('/');

    // Verify buttons are present and clickable
    const getStartedBtn = page.getByRole('button', { name: 'Get Started' });
    const learnMoreBtn = page.getByRole('button', { name: 'Learn More' });

    await expect(getStartedBtn).toBeEnabled();
    await expect(learnMoreBtn).toBeEnabled();

    // Test that buttons can be focused
    await getStartedBtn.focus();
    await expect(getStartedBtn).toBeFocused();
  });
});
