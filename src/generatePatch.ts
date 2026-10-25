import * as fs from 'fs';
import * as path from 'path';
import { HealingEntry } from './reporter';

const REPORT_FILE = path.resolve(process.cwd(), 'healing-report.json');
const OUTPUT_MD = path.resolve(process.cwd(), 'HEALING_REPORT.md');

function generateMarkdownReport() {
  if (!fs.existsSync(REPORT_FILE)) {
    console.log('No healing report found. Run tests first.');
    return;
  }

  const entries: HealingEntry[] = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf-8'));

  if (entries.length === 0) {
    console.log('No healing incidents recorded in this session.');
    return;
  }

  let md = `# 🛠️ Playwright Self-Healing Agent: Run Report\n\n`;
  md += `**Execution Time:** ${new Date().toUTCString()}  \n`;
  md += `**Total Locators Healed:** ${entries.length}  \n\n`;
  md += `> **Action Required:** Update the following selectors in your test files to prevent test drift and remove runtime healing overhead.\n\n`;
  md += `| Action | Broken Selector | Healed Replacement | Confidence | Reasoning |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;

  for (const entry of entries) {
    const conf = entry.confidence ? `${(entry.confidence * 100).toFixed(0)}%` : 'N/A';
    md += `| \`${entry.action}\` | \`${entry.originalSelector}\` | \`${entry.healedSelector}\` | **${conf}** | ${entry.reasoning} |\n`;
  }

  md += `\n### Suggested Code Patch\n\n\`\`\`diff\n`;
  for (const entry of entries) {
    if (entry.action === 'fill') {
      md += `- await page.fill('${entry.originalSelector}', value);\n`;
      md += `+ await page.fill('${entry.healedSelector}', value); // Auto-healed: ${entry.intent}\n`;
    } else {
      md += `- await page.click('${entry.originalSelector}');\n`;
      md += `+ await page.click('${entry.healedSelector}'); // Auto-healed: ${entry.intent}\n`;
    }
  }
  md += `\`\`\`\n`;

  fs.writeFileSync(OUTPUT_MD, md, 'utf-8');
  console.log(`\n\x1b[32m[Report Generated]\x1b[0m Successfully created HEALING_REPORT.md`);
}

generateMarkdownReport();