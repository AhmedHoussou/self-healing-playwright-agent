import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('Missing GEMINI_API_KEY in environment variables.');
}

const ai = new GoogleGenAI({ apiKey });

export interface HealResult {
  healedSelector: string;
  reasoning: string;
  confidence: number;
}

export async function healLocator(
  failedSelector: string,
  userIntent: string,
  domSnippet: string
): Promise<HealResult> {
  const prompt = `
You are an expert E2E test automation engineer specializing in Playwright locators.
A test action failed because the selector no longer exists or changed in the DOM.

Target Intent: "${userIntent}"
Failed Selector: "${failedSelector}"

Available Interactive DOM Elements on the current screen:
\`\`\`html
${domSnippet}
\`\`\`

Task:
Analyze the available elements and identify the single best Playwright-compatible selector (e.g., CSS selector, text selector, or role locator) that satisfies the user's Target Intent.

Return valid JSON matching this schema:
{
  "healedSelector": "the best selector string to target the intended element",
  "reasoning": "brief explanation of why this element matches the intent over the failed selector",
  "confidence": 0.0 to 1.0
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    return JSON.parse(rawText) as HealResult;
  } catch (err: any) {
    console.error(`\x1b[31m[Gemini API Error]\x1b[0m Failed generating selector:`, err.message || err);
    throw err;
  }
}