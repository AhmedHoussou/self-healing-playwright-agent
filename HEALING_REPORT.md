# 🛠️ Playwright Self-Healing Agent: Run Report

**Execution Time:** Sun, 25 Oct 2026 12:55:31 GMT  
**Total Locators Healed:** 2  

> **Action Required:** Update the following selectors in your test files to prevent test drift and remove runtime healing overhead.

| Action | Broken Selector | Healed Replacement | Confidence | Reasoning |
| :--- | :--- | :--- | :--- | :--- |
| `fill` | `#coupon-code` | `#promo-input-v3` | **95%** | The failed selector '#coupon-code' no longer exists. The DOM now contains an input with id 'promo-input-v3' and name 'discountCode', which directly matches the intent of entering a discount or promo code. |
| `click` | `#old-checkout-btn` | `#btn-submit-order-v2` | **99%** | The new button has an updated ID 'btn-submit-order-v2' and text indicating order confirmation, matching the user intent to submit and confirm the order. |

### Suggested Code Patch

```diff
- await page.fill('#coupon-code', value);
+ await page.fill('#promo-input-v3', value); // Auto-healed: Input field for entering a discount or promo code
- await page.click('#old-checkout-btn');
+ await page.click('#btn-submit-order-v2'); // Auto-healed: Button to submit and confirm the order
```
