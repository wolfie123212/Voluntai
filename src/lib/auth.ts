// Better Auth v1 — email+password + Google OAuth, email verification required.
// See BUILD_PLAN.md §9

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { Resend } from 'resend';
import { getDb } from './db/client';
import * as schema from './db/schema';
import type { Env } from '../worker';

export function createAuth(env: Env) {
  const db = getDb(env.DB);

  // Build the drizzle adapter with transaction:false (the default).
  // With transaction:false, adapter.transaction is literally `false` — calling it
  // throws a TypeError which Better Auth catches as "unable_to_create_user".
  //
  // With transaction:true, drizzleAdapter uses db.transaction((tx) => ...) which
  // calls Drizzle's D1 batch API. D1's batch API cannot handle the createOAuthUser
  // pattern (insert user → use returned ID → insert account), so it also throws.
  //
  // Fix: leave transaction:false, then patch adapter.transaction with a no-op that
  // simply runs the callback on the current adapter. D1 statements are individually
  // durable so we accept the (extremely unlikely) partial-write risk on low traffic.
  const dbAdapter = drizzleAdapter(db, {
    provider: 'sqlite',
    transaction: false,
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  });

  // Patch: give Better Auth a working .transaction() that bypasses D1's limitations.
  (dbAdapter as unknown as Record<string, unknown>).transaction =
    (fn: (adapter: typeof dbAdapter) => Promise<unknown>) => fn(dbAdapter);

  return betterAuth({
    database: dbAdapter,
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.APP_BASE_URL ?? 'https://cityserv.pages.dev',
    trustedOrigins: [
      'https://cityserv.org',
      'https://cityserv.pages.dev',
      'http://localhost:4321',
    ],

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
        await sendEmail(env, {
          to: user.email,
          subject: 'Verify your CityServ email',
          html: emailHtml('Verify your email', `
            <p style="color:#86efac">Thanks for signing up for CityServ!</p>
            <p style="margin:24px 0">
              <a href="${url}" style="background:#16a34a;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block">
                Verify my email →
              </a>
            </p>
            <p style="color:#4ade80;font-size:13px">If you didn't sign up, you can safely ignore this email.</p>
          `),
        });
      },
      sendResetPasswordEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
        await sendEmail(env, {
          to: user.email,
          subject: 'Reset your CityServ password',
          html: emailHtml('Reset your password', `
            <p style="margin:24px 0">
              <a href="${url}" style="background:#16a34a;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block">
                Reset password →
              </a>
            </p>
            <p style="color:#4ade80;font-size:13px">This link expires in 1 hour. If you didn't request a reset, ignore this.</p>
          `),
        });
      },
    },

    // Store OAuth state in an encrypted cookie instead of the verifications table.
    // Avoids a D1 write on every Google sign-in attempt and is fully stateless.
    account: {
      storeStateStrategy: 'cookie' as const,
    },

    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID ?? '',
        clientSecret: env.GOOGLE_CLIENT_SECRET ?? '',
      },
    },

    user: {
      fields: {
        name: 'displayName',
        image: 'avatarR2Key',
      },
      additionalFields: {
        role: {
          type: 'string',
          defaultValue: 'user',
          input: false,
        },
        ageDeclared: {
          type: 'number',
          required: false,
          input: false,
        },
      },
    },

    // D1's .bind() only accepts primitives (null, number, string, boolean, ArrayBuffer).
    // Better Auth passes createdAt/updatedAt as raw Date objects; drizzle-adapter forwards
    // them through transformInput unchanged (supportsDates defaults to true), so they land
    // in D1's prepared-statement bind as Date objects and are rejected.
    // These hooks run before the adapter sees the data and convert every Date to ISO-8601.
    databaseHooks: {
      user: {
        create: {
          before: async (data) => ({ data: datesAsIso(data) }),
        },
        update: {
          before: async (data) => ({ data: datesAsIso(data) }),
        },
      },
      account: {
        create: {
          before: async (data) => ({ data: datesAsIso(data) }),
        },
        update: {
          before: async (data) => ({ data: datesAsIso(data) }),
        },
      },
      session: {
        create: {
          before: async (data) => ({ data: datesAsIso(data) }),
        },
        update: {
          before: async (data) => ({ data: datesAsIso(data) }),
        },
      },
    },
  });
}

/** Convert every Date value in a plain object to an ISO-8601 string.
 *  D1's prepared-statement `.bind()` rejects Date objects (only primitives allowed). */
function datesAsIso<T extends Record<string, unknown>>(data: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    out[k] = v instanceof Date ? v.toISOString() : v;
  }
  return out as T;
}

async function sendEmail(
  env: Env,
  opts: { to: string; subject: string; html: string }
) {
  const resend = new Resend(env.RESEND_API_KEY);
  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL ?? 'noreply@cityserv.org',
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}

function emailHtml(title: string, body: string): string {
  return `<!DOCTYPE html><html><body style="margin:0;padding:40px 20px;font-family:Inter,system-ui,sans-serif;background:#052e16">
    <div style="max-width:480px;margin:0 auto;background:#14532d;border-radius:16px;padding:32px">
      <p style="margin:0 0 24px;font-size:22px;font-weight:700;color:#4ade80">🌿 CityServ</p>
      <h1 style="margin:0 0 16px;font-size:20px;color:white">${title}</h1>
      ${body}
      <p style="margin:24px 0 0;color:#166534;font-size:12px;border-top:1px solid #166534;padding-top:16px">
        CityServ · NYC volunteer service directory · cityserv.org
      </p>
    </div>
  </body></html>`;
}

export type Auth = ReturnType<typeof createAuth>;
