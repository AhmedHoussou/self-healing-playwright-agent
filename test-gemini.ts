import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: Missing GEMINI_API_KEY in .env');
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  console.log('1. Checking model list from Google AI...');
  try {
    const listResponse = await ai.models.list();
    const modelNames: string[] = [];
    for await (const m of listResponse) {
      if (m.name) modelNames.push(m.name);
    }
    console.log(`Found ${modelNames.length} models. Active Flash/Pro models:`);
    console.log(
      modelNames
        .filter((n) => n.includes('flash') || n.includes('pro'))
        .slice(0, 10)
        .map((n) => `  - ${n}`)
        .join('\n')
    );
  } catch (err: any) {
    console.log('List check failed:', err.message);
  }

  console.log('\n2. Testing direct generation with "gemini-3.8-flash"...');
  const start = Date.now();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Respond with the word "CONNECTED" only.',
    });
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`✅ Success in ${elapsed}s: ${response.text?.trim()}`);
  } catch (err: any) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    console.error(`❌ Call failed after ${elapsed}s:`, err.message || err);
  }
}

run();