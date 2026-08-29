/**
 * Test script: simulate Better Auth's OAuth user creation with our exact schema.
 * Uses the in-memory adapter to bypass D1 and isolate the issue.
 */
import { betterAuth } from 'better-auth';

// Use in-memory adapter (no DB required)
const auth = betterAuth({
  secret: 'test-secret-1234567890abcdef',
  baseURL: 'http://localhost:4321',
  // No database: uses memory adapter
  emailAndPassword: { enabled: false },
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

// Access the internal adapter
const ctx = auth.$context;
if (!ctx) {
  console.error('ERROR: Cannot access auth.$context');
  process.exit(1);
}

const authCtx = await ctx;
console.log('Auth context keys:', Object.keys(authCtx));

// Try to call createOAuthUser directly
const internalAdapter = authCtx.internalAdapter;
if (!internalAdapter) {
  console.error('ERROR: No internalAdapter found');
  process.exit(1);
}

console.log('Internal adapter methods:', Object.keys(internalAdapter));

try {
  const result = await internalAdapter.createOAuthUser(
    {
      name: 'Test User',
      email: 'test@example.com',
      image: 'https://example.com/avatar.jpg',
      emailVerified: true,
    },
    {
      id: `acc-${Date.now()}`,
      accountId: `google-${Date.now()}`,
      providerId: 'google',
      accessToken: 'test-token',
      scope: 'email profile',
      updatedAt: new Date(),
      createdAt: new Date(),
    }
  );
  console.log('createOAuthUser SUCCESS:', JSON.stringify(result, null, 2));
} catch (e) {
  console.error('createOAuthUser FAILED:', e.message);
  console.error('Stack:', e.stack?.slice(0, 500));
}
