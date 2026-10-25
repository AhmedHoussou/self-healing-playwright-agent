# ⚡ Playwright Self-Healing E2E Test Agent

An autonomous test resilience wrapper for Playwright that prevents brittle UI tests from failing on selector refactors. When a DOM selector breaks due to front-end updates, the agent intercepts the timeout, extracts the active interactive DOM tree, queries Gemini Flash Lite to identify the intended element, executes the fallback action, and caches the healed selector for fast subsequent runs.

---

## 🎯 The Problem

End-to-End (E2E) tests are notoriously fragile. Front-end teams frequently modify class names, redesign form layouts, or refactor IDs, breaking automated pipelines even when business functionality remains completely intact. This causes:

* Pipeline bottlenecks and false-positive build failures.
* Wasted engineering hours manually updating selectors.
* Test suite maintenance overhead outpacing automation value.

---

## 🏗️ Architecture

```text
[Playwright Action] 
       │
       ▼
Locator Fails? ──(No)──> [Test Passes]
       │
     (Yes)
       ▼
Check Local Cache? ──(Hit)──> [Execute Cached Selector (Instant)]
       │
     (Miss)
       ▼
[Extract Interactive Element Tree (HTML + ARIA attributes)]
       │
       ▼
[Query Gemini Flash Lite with Intent & Context]
       │
       ▼
[Update Local Cache + Save to HEALING_REPORT.md]
       │
       ▼
[Execute Action with Healed Selector]
```

1. **Failure Interception:** Intercepts standard Playwright locator timeouts without crashing the suite.
2. **Context-Optimized DOM Extraction:** Instead of passing raw, high-token HTML pages, the extractor strips the DOM down to visible, interactive elements (`<button>`, `<input>`, `<a>`, ARIA roles) to keep API latency under 1 second.
3. **Structured Healing:** Enforces structured JSON output containing the healed selector, confidence score, and architectural reasoning.
4. **Local Selector Cache:** Persists resolved selectors to `.locator-cache.json`. Subsequent test runs bypass LLM queries entirely, cutting runtime significantly.
5. **Audit & Patch Reporting:** Produces an actionable markdown diff (`HEALING_REPORT.md`) for engineers to review and commit to source code.

---

## ⚡ Performance Benchmarks

| Metric | First Run (Cold Healing) | Second Run (Cached) |
| :--- | :--- | :--- |
| **API Calls** | 2 LLM Inferences | 0 (Zero Cost) |
| **Total Test Suite Time** | 11.8s | 4.3s |
| **Pass Rate** | 100% | 100% |

---

## 🚀 Quickstart

### Prerequisites

* Node.js v20+
* Google Gemini API Key

### Installation

```bash
git clone [https://github.com/AhmedHoussou/self-healing-playwright-agent.git](https://github.com/AhmedHoussou/self-healing-playwright-agent.git)
cd self-healing-playwright-agent
npm install
npx playwright install chromium
```

### Environment Configuration

Create a `.env` file in the project root:

```env
GEMINI_API_KEY="your-api-key-here"
```

### Run the Demo Test

```bash
# Run the headed self-healing demo
npm run test:headed

# Generate the Markdown audit patch report
npm run report
```
