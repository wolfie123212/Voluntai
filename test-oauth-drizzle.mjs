/**
 * Test Better Auth OAuth user creation with real Drizzle adapter + mock D1.
 *
 * Uses a mock D1 that captures all queries and returns realistic responses.
 */
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/d1';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Mirror our production schema exactly
const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  emailVerified: integer('email_verified').default(0),
  displayName: text('display_name'),
  avatarR2Key: text('avatar_r2_key'),
  ageDeclared: integer('age_declared'),
  ageDeclaredAt: text('age_declared_at'),
  role: text('role').default('user'),
  bannedReason: text('banned_reason'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  token: text('token').notNull(),
  expiresAt: text('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: text('access_token_expires_at'),
  refreshTokenExpiresAt: text('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

const verifications = sqliteTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

// Mock D1 that logs all queries and returns realistic responses
const queryLog = [];
let mockStorage = { users: {}, accounts: {}, sessions: {}, verifications: {} };

const mockD1 = {
  prepare(sqlStr) {
    return {
      bind(...params) {
        return {
          all: async () => {
            queryLog.push({ type: 'all', sql: sqlStr, params });
            // Return empty for SELECT queries on non-existent rows
            return { results: [], success: true };
          },
          run: async () => {
            queryLog.push({ type: 'run', sql: sqlStr, params });
            return { success: true, meta: { last_row_id: 1, changes: 1 } };
          },
          first: async () => {
            queryLog.push({ type: 'first', sql: sqlStr, params });
            return null;
          },
        };
      },
      all: async () => {
        queryLog.push({ type: 'all-direct', sql: sqlStr });
        return { results: [], success: true };
      },
    };
  },
  batch: async (stmts) => {
    queryLog.push({ type: 'batch', count: stmts.length });
    return stmts.map(() => ({ results: [], success: true }));
  },
  dump: async () => new ArrayBuffer(0),
  exec: async () => ({ results: [], count: 0, duration: 0 }),
};

// Create drizzle instance with mock D1
const db = drizzle(mockD1, {
  schema: { users, sessions, accounts, verifications },
});

// Override the drizzle insert to capture what values are being inserted
// by monkey-patching the database object
const originalInsert = db.insert.bind(db);
db.insert = (table) => {
  const builder = originalInsert(table);
  const originalValues = builder.values.bind(builder);
  builder.values = (vals) => {
    console.log('\n📝 INSERT called on table:', table[Symbol.for('drizzle:Name')] || Object.keys(vals).join(','));
    console.log('   Values keys:', Object.keys(vals));
    console.log('   Values:', JSON.stringify(vals, (k, v) => v instanceof Date ? v.toISOString() : v));
    const innerBuilder = originalValues(vals);
    // Patch .returning() to return a fake row
    const originalReturning = innerBuilder.returning?.bind(innerBuilder);
    if (originalReturning) {
      innerBuilder.returning = () => {
        const ret = originalReturning();
        const originalExecute = ret.then ? ret : null;
        return {
          then: (resolve, reject) => {
            console.log('   .returning() called');
            // Return a fake row that matches what was inserted
            const fakeRow = {
              id: vals.id || `fake-id-${Date.now()}`,
              email: vals.email,
              emailVerified: vals.emailVerified,
              displayName: vals.display_name || vals.displayName,
              avatarR2Key: vals.avatar_r2_key || vals.avatarR2Key,
              role: vals.role || 'user',
              createdAt: vals.created_at || vals.createdAt,
              updatedAt: vals.updated_at || vals.updatedAt,
              ageDeclared: vals.ageDeclared || null,
              ageDeclaredAt: vals.ageDeclaredAt || null,
              bannedReason: null,
            };
            console.log('   Fake .returning() result:', JSON.stringify(fakeRow));
            resolve([fakeRow]);
          },
        };
      };
    }
    return innerBuilder;
  };
  return builder;
};

const dbAdapter = drizzleAdapter(db, {
  provider: 'sqlite',
  transaction: false,
  schema: {
    user: users,
    session: sessions,
    account: accounts,
    verification: verifications,
  },
});

const auth = betterAuth({
  secret: 'test-secret-for-local-testing-only-1234567890',
  baseURL: 'http://localhost:4321',
  database: dbAdapter,
  account: { storeStateStrategy: 'cookie' },
  socialProviders: {
    google: { clientId: 'fake-client-id', clientSecret: 'fake-client-secret' },
  },
  user: {
    fields: {
      name: 'displayName',
      image: 'avatarR2Key',
    },
    additionalFields: {
      role: { type: 'string', defaultValue: 'user', input: false },
      ageDeclared: { type: 'number', required: false, input: false },
    },
  },
});

const authCtx = await auth.$context;
console.log('\n=== Testing createOAuthUser ===\n');

try {
  const result = await authCtx.internalAdapter.createOAuthUser(
    {
      name: 'Wolfgang White',
      email: 'wolfbusterwhite@gmail.com',
      image: 'https://lh3.googleusercontent.com/test',
      emailVerified: true,
    },
    {
      accountId: 'google-12345',
      providerId: 'google',
      accessToken: 'ya29.test-token',
      scope: 'email profile',
    }
  );

  console.log('\n✅ createOAuthUser SUCCESS!');
  console.log('User:', JSON.stringify(result.user, null, 2));
  console.log('Account:', JSON.stringify(result.account, null, 2));
} catch (e) {
  console.error('\n❌ createOAuthUser FAILED!');
  console.error('Error:', e.message);
  console.error('Stack:', e.stack?.slice(0, 800));
}

console.log('\n=== DB Query Log ===');
queryLog.forEach((q, i) => console.log(`${i + 1}.`, JSON.stringify(q)));
