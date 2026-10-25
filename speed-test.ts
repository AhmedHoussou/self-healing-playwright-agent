import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Missing GEMINI_API_KEY');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

// Candidate models from your account's active model list
const candidateModels = [
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-3-flash-preview',
  'gemini-2.5-flash-lite',
];

async function runBenchmark() {
  console.log('Testing model response speeds...\n');

  for (const model of candidateModels) {
    process.stdout.write(`Testing [${model}]... `);
    const start = Date.now();

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: 'Return JSON: {"status": "ok"}',
        config: { responseMimeType: 'application/json' },
      });

      const elapsed = ((Date.now() - start) / 1000).toFixed(2);
      console.log(`✅ Responded in ${elapsed}s -> ${response.text?.trim()}`);
    } catch (err: any) {
      const elapsed = ((Date.now() - start) / 1000).toFixed(2);
      const msg = err.message || '';
      const cleanMsg = msg.includes('{') ? msg.slice(msg.indexOf('{')) : msg;
      console.log(`❌ Failed in ${elapsed}s: ${cleanMsg.slice(0, 80)}...`);
    }
  }
}

runBenchmark();