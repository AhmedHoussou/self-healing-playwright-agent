import { Page } from '@playwright/test';

export async function extractInteractiveElements(page: Page): Promise<string> {
  return await page.evaluate(() => {
    const candidates = Array.from(
      document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="link"]')
    );

    return candidates
      .filter((el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== 'hidden' &&
          style.display !== 'none'
        );
      })
      .map((el) => {
        const tag = el.tagName.toLowerCase();
        const id = el.id ? ` id="${el.id}"` : '';
        const className = el.className ? ` class="${el.className}"` : '';
        const name = (el as HTMLInputElement).name ? ` name="${(el as HTMLInputElement).name}"` : '';
        const role = el.getAttribute('role') ? ` role="${el.getAttribute('role')}"` : '';
        const ariaLabel = el.getAttribute('aria-label') ? ` aria-label="${el.getAttribute('aria-label')}"` : '';
        const text = el.textContent?.trim().slice(0, 60) || '';

        return `<${tag}${id}${className}${name}${role}${ariaLabel}>${text}</${tag}>`;
      })
      .join('\n');
  });
}