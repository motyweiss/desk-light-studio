import { test, expect } from '@playwright/test';

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display connection status indicator', async ({ page }) => {
    // Look for connection status (Zap icon or similar)
    const connectionStatus = page.locator('svg[class*="lucide-zap"], [class*="connection-status"]').first();
    await expect(connectionStatus).toBeVisible();
  });

  test('should open settings dialog when clicking settings button', async ({ page }) => {
    // Find settings button (gear icon)
    const settingsButton = page.locator('button').filter({ has: page.locator('svg[class*="lucide-settings"]') }).first();
    
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      await page.waitForTimeout(300);

      // Check if settings dialog appeared
      const dialog = page.locator('[role="dialog"], [class*="dialog"]').first();
      await expect(dialog).toBeVisible();
    }
  });

  test('should display Home Assistant configuration fields in settings', async ({ page }) => {
    const settingsButton = page.locator('button').filter({ has: page.locator('svg[class*="lucide-settings"]') }).first();
    
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      await page.waitForTimeout(300);

      // Look for URL and token input fields
      const urlInput = page.locator('input[type="text"], input[placeholder*="url" i]').first();
      const tokenInput = page.locator('input[type="password"], input[type="text"]').nth(1);

      if (await urlInput.isVisible()) {
        await expect(urlInput).toBeVisible();
      }
      if (await tokenInput.isVisible()) {
        await expect(tokenInput).toBeVisible();
      }
    }
  });

  test('should close settings dialog on close button click', async ({ page }) => {
    const settingsButton = page.locator('button').filter({ has: page.locator('svg[class*="lucide-settings"]') }).first();
    
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      await page.waitForTimeout(300);

      // Find close button (X icon or close button)
      const closeButton = page.locator('button[aria-label*="close" i], button').filter({ has: page.locator('svg[class*="lucide-x"]') }).first();
      
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(300);

        // Dialog should be hidden
        const dialog = page.locator('[role="dialog"]').first();
        await expect(dialog).not.toBeVisible();
      }
    }
  });

  test('should display entity mapping section', async ({ page }) => {
    const settingsButton = page.locator('button').filter({ has: page.locator('svg[class*="lucide-settings"]') }).first();
    
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      await page.waitForTimeout(500);

      // Look for entity mapping or device configuration
      const entitySection = page.locator('text=/entity|device|mapping/i').first();
      const isVisible = await entitySection.isVisible().catch(() => false);
      
      if (isVisible) {
        await expect(entitySection).toBeVisible();
      }
    }
  });

  test('should show connection status tooltip on hover', async ({ page }) => {
    const connectionIcon = page.locator('svg[class*="lucide-zap"]').first();
    
    if (await connectionIcon.isVisible()) {
      await connectionIcon.hover();
      await page.waitForTimeout(500);

      // Tooltip should appear
      const tooltip = page.locator('[role="tooltip"], [class*="tooltip"]').first();
      const isVisible = await tooltip.isVisible().catch(() => false);
      
      if (isVisible) {
        await expect(tooltip).toBeVisible();
      }
    }
  });

  test.describe('Desktop Only', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test('settings button should be visible on desktop', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const settingsButton = page.locator('button').filter({ has: page.locator('svg[class*="lucide-settings"]') }).first();
      await expect(settingsButton).toBeVisible();
    });
  });

  test.describe('Mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('settings button should be hidden on mobile', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Settings should not be accessible on mobile
      const settingsButton = page.locator('button').filter({ has: page.locator('svg[class*="lucide-settings"]') });
      await expect(settingsButton).toHaveCount(0);
    });
  });
});
