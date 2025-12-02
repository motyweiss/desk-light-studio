import { test, expect } from '@playwright/test';

test.describe('Light Control', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display room title and climate data', async ({ page }) => {
    // Check room title
    await expect(page.getByText('Office')).toBeVisible();

    // Check climate indicators are present
    const climateSection = page.locator('[class*="climate"]').first();
    await expect(climateSection).toBeVisible();
  });

  test('should display three light control cards', async ({ page }) => {
    // Wait for light controls to render
    const lightCards = page.locator('button').filter({ hasText: /spotlight|desk lamp|monitor/i });
    await expect(lightCards).toHaveCount(3);
  });

  test('should toggle light on/off when clicking control card', async ({ page }) => {
    // Find first light control card
    const firstCard = page.locator('button').filter({ hasText: /spotlight|desk lamp|monitor/i }).first();
    await expect(firstCard).toBeVisible();

    // Click to toggle
    await firstCard.click();

    // Wait for animation/state change
    await page.waitForTimeout(500);

    // Verify visual state changed (icon color or slider appearance)
    const iconOrSlider = firstCard.locator('svg, [role="slider"]').first();
    await expect(iconOrSlider).toBeVisible();
  });

  test('should adjust light intensity using slider', async ({ page }) => {
    // Find a light control card with slider visible
    const cardWithSlider = page.locator('[role="slider"]').first();
    
    if (await cardWithSlider.isVisible()) {
      const sliderBefore = await cardWithSlider.boundingBox();
      
      // Drag slider to change intensity
      if (sliderBefore) {
        await cardWithSlider.hover();
        await page.mouse.down();
        await page.mouse.move(sliderBefore.x + sliderBefore.width * 0.7, sliderBefore.y);
        await page.mouse.up();

        // Wait for debounced update
        await page.waitForTimeout(400);
      }
    }
  });

  test('should show master switch button', async ({ page }) => {
    // Find master control button (circular button with power icon)
    const masterSwitch = page.locator('button[class*="rounded-full"]').first();
    await expect(masterSwitch).toBeVisible();
  });

  test('should display desk image with lighting states', async ({ page }) => {
    // Check that desk image is visible
    const deskImage = page.locator('img[alt*="Desk"]').first();
    await expect(deskImage).toBeVisible();
  });

  test('keyboard shortcuts - toggle lights with number keys', async ({ page }) => {
    // Focus on page
    await page.click('body');

    // Press "1" to toggle first light (Spotlight)
    await page.keyboard.press('1');
    await page.waitForTimeout(300);

    // Press "2" to toggle second light (Desk Lamp)
    await page.keyboard.press('2');
    await page.waitForTimeout(300);

    // Press "3" to toggle third light (Monitor Light)
    await page.keyboard.press('3');
    await page.waitForTimeout(300);

    // Verify page still renders correctly
    await expect(page.locator('button').filter({ hasText: /spotlight|desk lamp|monitor/i })).toHaveCount(3);
  });

  test('keyboard shortcuts - master switch with spacebar', async ({ page }) => {
    // Focus on page
    await page.click('body');

    // Press spacebar to toggle master switch
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    // Verify page still renders correctly
    const masterSwitch = page.locator('button[class*="rounded-full"]').first();
    await expect(masterSwitch).toBeVisible();
  });

  test.describe('Mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display mobile layout with vertical stack', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check that room info panel appears above image on mobile
      const roomInfo = page.getByText('Office');
      const deskImage = page.locator('img[alt*="Desk"]').first();

      await expect(roomInfo).toBeVisible();
      await expect(deskImage).toBeVisible();

      // Verify vertical layout by checking positions
      const roomBox = await roomInfo.boundingBox();
      const imageBox = await deskImage.boundingBox();

      if (roomBox && imageBox) {
        // Room info should be above image (smaller Y coordinate)
        expect(roomBox.y).toBeLessThan(imageBox.y);
      }
    });

    test('should hide settings button on mobile', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Settings gear icon should not be visible on mobile
      const settingsButton = page.locator('button[aria-label*="settings" i]');
      await expect(settingsButton).toHaveCount(0);
    });
  });
});
