// Load and validate required environment variables for scripts.
// Copy .env.example to .env and fill in values before running scripts.

import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadDotEnv() {
  try {
    const envFile = readFileSync(resolve(process.cwd(), '.env'), 'utf-8');
    for (const line of envFile.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {
    // .env not present — rely on real env vars
  }
}

loadDotEnv();

function get(key: string): string {
  return process.env[key] ?? '';
}

// Validated lazily — throws only when the value is actually used in an API call.
export const config = {
  get accountId() { return get('CLOUDFLARE_ACCOUNT_ID'); },
  get databaseId() { return get('CLOUDFLARE_D1_DATABASE_ID'); },
  get apiToken() { return get('CLOUDFLARE_API_TOKEN'); },
  propublicaUserAgent: process.env.PROPUBLICA_USER_AGENT ?? 'Voluntai/0.1 (contact@voluntai.com)',
  charityNavApiKey: process.env.CHARITY_NAV_API_KEY ?? '',
};
