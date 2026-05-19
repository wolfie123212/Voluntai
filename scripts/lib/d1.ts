// D1 REST API client for use in Node.js scripts (not Workers).
// Requires CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_API_TOKEN in env.

import { config } from './env';

interface D1Result {
  results: Record<string, unknown>[];
  success: boolean;
  errors: { message: string }[];
}

export async function d1Query(sql: string, params: unknown[] = []): Promise<Record<string, unknown>[]> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/d1/database/${config.databaseId}/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params }),
  });

  const json = await res.json() as { success: boolean; errors: { message: string }[]; result: D1Result[] };
  if (!json.success) throw new Error(`D1 error: ${JSON.stringify(json.errors)}`);

  return json.result[0]?.results ?? [];
}

export async function d1Exec(statements: { sql: string; params?: unknown[] }[]): Promise<void> {
  for (const stmt of statements) {
    await d1Query(stmt.sql, stmt.params ?? []);
  }
}
