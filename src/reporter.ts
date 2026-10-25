import * as fs from 'fs';
import * as path from 'path';

export interface HealingEntry {
  originalSelector: string;
  healedSelector: string;
  intent: string;
  action: 'click' | 'fill';
  reasoning: string;
  confidence: number;
  timestamp: string;
  cached?: boolean;
}

const CACHE_FILE = path.resolve(process.cwd(), '.locator-cache.json');
const REPORT_FILE = path.resolve(process.cwd(), 'healing-report.json');

// In-memory run log
const sessionLogs: HealingEntry[] = [];

export function getCachedLocator(originalSelector: string): string | null {
  if (!fs.existsSync(CACHE_FILE)) return null;
  try {
    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    return cache[originalSelector] || null;
  } catch {
    return null;
  }
}

export function saveLocatorToCache(originalSelector: string, healedSelector: string): void {
  let cache: Record<string, string> = {};
  if (fs.existsSync(CACHE_FILE)) {
    try {
      cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    } catch {
      cache = {};
    }
  }
  cache[originalSelector] = healedSelector;
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
}

export function recordHealing(entry: HealingEntry): void {
  sessionLogs.push(entry);
  fs.writeFileSync(REPORT_FILE, JSON.stringify(sessionLogs, null, 2), 'utf-8');
}