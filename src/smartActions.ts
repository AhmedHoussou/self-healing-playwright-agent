import { Page } from '@playwright/test';
import { extractInteractiveElements } from './domExtractor';
import { healLocator } from './healer';
import { getCachedLocator, saveLocatorToCache, recordHealing } from './reporter';

/**
 * Smart Click: Tries original selector -> tries cache -> queries Gemini -> retries action.
 */
export async function smartClick(
  page: Page,
  selector: string,
  intent: string,
  timeoutMs: number = 2500
): Promise<void> {
  // 1. Check if we already healed this selector in a prior run
  const cached = getCachedLocator(selector);
  if (cached) {
    try {
      await page.click(cached, { timeout: timeoutMs });
      return;
    } catch {
      // If cached locator also failed, fall through to heal fresh
    }
  }

  // 2. Try original selector
  try {
    await page.click(selector, { timeout: timeoutMs });
  } catch {
    console.log(`\n\x1b[33m[Self-Healing Agent]\x1b[0m Action "click" failed on: "${selector}"`);
    console.log(`\x1b[36m[Intent]\x1b[0m ${intent}`);

    const domSnapshot = await extractInteractiveElements(page);
    const result = await healLocator(selector, intent, domSnapshot);

    console.log(`\x1b[32m[Healed Locator]\x1b[0m ${result.healedSelector}`);
    console.log(`\x1b[90m[Reasoning]\x1b[0m ${result.reasoning}`);
    console.log(`\x1b[90m[Confidence]\x1b[0m ${(result.confidence * 100).toFixed(0)}%\n`);

    // 3. Save to cache & session report
    saveLocatorToCache(selector, result.healedSelector);
    recordHealing({
      originalSelector: selector,
      healedSelector: result.healedSelector,
      intent,
      action: 'click',
      reasoning: result.reasoning,
      confidence: result.confidence,
      timestamp: new Date().toISOString(),
    });

    // 4. Retry with healed locator
    await page.click(result.healedSelector, { timeout: 5000 });
  }
}

/**
 * Smart Fill: Handles text inputs, search boxes, and forms.
 */
export async function smartFill(
  page: Page,
  selector: string,
  value: string,
  intent: string,
  timeoutMs: number = 2500
): Promise<void> {
  const cached = getCachedLocator(selector);
  if (cached) {
    try {
      await page.fill(cached, value, { timeout: timeoutMs });
      return;
    } catch {}
  }

  try {
    await page.fill(selector, value, { timeout: timeoutMs });
  } catch {
    console.log(`\n\x1b[33m[Self-Healing Agent]\x1b[0m Action "fill" failed on: "${selector}"`);
    console.log(`\x1b[36m[Intent]\x1b[0m ${intent}`);

    const domSnapshot = await extractInteractiveElements(page);
    const result = await healLocator(selector, intent, domSnapshot);

    console.log(`\x1b[32m[Healed Locator]\x1b[0m ${result.healedSelector}`);
    console.log(`\x1b[90m[Reasoning]\x1b[0m ${result.reasoning}\n`);

    saveLocatorToCache(selector, result.healedSelector);
    recordHealing({
      originalSelector: selector,
      healedSelector: result.healedSelector,
      intent,
      action: 'fill',
      reasoning: result.reasoning,
      confidence: result.confidence,
      timestamp: new Date().toISOString(),
    });

    await page.fill(result.healedSelector, value, { timeout: 5000 });
  }
}