// Better Auth configuration — fully wired in Phase 4
// See BUILD_PLAN.md §9

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { getDb } from './db/client';
import * as schema from './db/schema';

export function createAuth(d1: D1Database) {
  const db = getDb(d1);
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
