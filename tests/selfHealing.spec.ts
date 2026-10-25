import { test, expect } from '@playwright/test';
import path from 'path';
import { pathToFileURL } from 'url';
import { smartClick, smartFill } from '../src/smartActions';

test('should self-heal multiple broken locators (fill and click) and generate report', async ({ page }) => {
  const fixturePath = pathToFileURL(path.resolve(__dirname, '../fixtures/sample.html')).href;
  await page.goto(fixturePath);

  // 1. Broken input field selector: #coupon-code
  await smartFill(
    page,
    '#coupon-code',
    'SAVE50',
    'Input field for entering a discount or promo code'
  );

  // 2. Broken button selector: #old-checkout-btn
  await smartClick(
    page,
    '#old-checkout-btn',
    'Button to submit and confirm the order'
  );

  // 3. Verify final state
  const statusElement = page.locator('#order-status');
  await expect(statusElement).toHaveText('Order placed with code "SAVE50"!');
});