import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Env } from '../worker';
import { searchOrgs } from '../lib/search';
import { createAuth } from '../lib/auth';
import { moderateText } from '../lib/moderate';
import { verifyTurnstile } from '../lib/turnstile';

const api = new Hono<{ Bindings: Env }>();

// ─── Health ──────────────────────────────────────────────────────────────────

api.get('/api/health', (c) => c.json({ ok: true, ts: Date.now() }));

// ─── Auth (Better Auth handles all /api/auth/* routes) ───────────────────────

api.all('/api/auth/*', async (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

// ─── Search ──────────────────────────────────────────────────────────────────

api.get('/api/search', async (c) => {
  const q = c.req.query('q') ?? '';
  const limit = Math.min(50, Number(c.req.query('limit') ?? '20'));
  try {
    const orgs = await searchOrgs(c.env.DB, { q, limit });
    return c.json({ orgs, total: orgs.length });
  } catch (err) {
    console.error('Search error:', err);
    return c.json({ error: 'Search unavailable' }, 503);
  }
});

// ─── Reviews ─────────────────────────────────────────────────────────────────

api.post('/api/reviews', async (c) => {
  const auth = createAuth(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    return c.json({ error: 'Sign in to leave a review.' }, 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid request body.' }, 400);
  }

  const { orgId, rating, reviewBody, volunteeredInYear, turnstileToken, opportunityId } = body as {
    orgId: number;
    rating: number;
    reviewBody: string;
    volunteeredInYear: number;
    turnstileToken: string;
    opportunityId?: number;
  };

  // Validate Turnstile
  const turnstileOk = await verifyTurnstile(String(turnstileToken ?? ''), c.env.TURNSTILE_SECRET_KEY);
  if (!turnstileOk) {
    return c.json({ error: 'CAPTCHA verification failed. Please try again.' }, 400);
  }

  // Validate inputs
  if (!orgId || rating < 1 || rating > 5) {
    return c.json({ error: 'Rating must be between 1 and 5.' }, 400);
  }
  const bodyText = String(reviewBody ?? '').slice(0, 2000).trim();
  const year = Number(volunteeredInYear);
  if (!year || year < 2000 || year > new Date().getFullYear()) {
    return c.json({ error: 'Please enter the year you volunteered.' }, 400);
  }

  // Rate limit: 1 review per user per org per 90 days
  const recentCheck = await c.env.DB
    .prepare(`SELECT COUNT(*) as n FROM reviews
              WHERE user_id = ? AND org_id = ?
              AND created_at > datetime('now', '-90 days')`)
    .bind(session.user.id, orgId)
    .first<{ n: number }>();
  if ((recentCheck?.n ?? 0) >= 1) {
    return c.json({ error: 'You can only review each organization once every 90 days.' }, 429);
  }

  // Daily site-wide rate limit: 5 reviews per user per day
  const dailyCheck = await c.env.DB
    .prepare(`SELECT COUNT(*) as n FROM reviews
              WHERE user_id = ?
              AND created_at > datetime('now', '-1 day')`)
    .bind(session.user.id)
    .first<{ n: number }>();
  if ((dailyCheck?.n ?? 0) >= 5) {
    return c.json({ error: 'You\'ve reached the daily review limit. Try again tomorrow.' }, 429);
  }

  // Run Llama Guard moderation
  const modResult = await moderateText(c.env.AI, bodyText || `Rating: ${rating}/5`);
  const status = modResult.safe ? 'published' : 'pending';

  // Store IP and user-agent for legal response only — never displayed
  const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? null;
  const ua = c.req.header('User-Agent') ?? null;

  const now = new Date().toISOString();
  await c.env.DB
    .prepare(`INSERT INTO reviews
              (user_id, org_id, opportunity_id, rating, body, volunteered_in_year,
               status, moderation_flags, moderation_score, ip_at_post, user_agent_at_post,
               created_at, published_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(
      session.user.id,
      orgId,
      opportunityId ?? null,
      rating,
      bodyText || null,
      year,
      status,
      JSON.stringify(modResult.flags),
      modResult.score,
      ip,
      ua,
      now,
      status === 'published' ? now : null,
    )
    .run();

  return c.json({
    ok: true,
    status,
    message: status === 'published'
      ? 'Your review has been posted.'
      : 'Your review is under review and will be posted shortly.',
  });
});

// ─── Reports ─────────────────────────────────────────────────────────────────

api.post('/api/reports', async (c) => {
  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid request body.' }, 400);
  }

  const { reviewId, orgId, reason, details, reporterEmail, reporterName, turnstileToken } = body as {
    reviewId?: number;
    orgId?: number;
    reason: string;
    details?: string;
    reporterEmail?: string;
    reporterName?: string;
    turnstileToken: string;
  };

  if (!reason) return c.json({ error: 'Reason is required.' }, 400);
  if (!reviewId && !orgId) return c.json({ error: 'Must report a review or an organization.' }, 400);

  const turnstileOk = await verifyTurnstile(String(turnstileToken ?? ''), c.env.TURNSTILE_SECRET_KEY);
  if (!turnstileOk) return c.json({ error: 'CAPTCHA verification failed.' }, 400);

  // Get reporter user ID if signed in
  const auth = createAuth(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  await c.env.DB
    .prepare(`INSERT INTO reports (review_id, org_id, reporter_user_id, reporter_email, reporter_name, reason, details)
              VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .bind(
      reviewId ?? null,
      orgId ?? null,
      session?.user?.id ?? null,
      reporterEmail ?? null,
      reporterName ?? null,
      reason,
      details ?? null,
    )
    .run();

  return c.json({ ok: true, message: 'Report submitted. We will review it within 7 days.' });
});

// ─── Admin: moderation actions ────────────────────────────────────────────────

const ADMIN_EMAIL = 'wolfbusterwhite@gmail.com';

async function requireAdmin(c: Context<{ Bindings: Env }>) {
  // Check Cloudflare Access JWT header (production)
  const cfEmail = c.req.header('Cf-Access-Authenticated-User-Email');
  if (cfEmail === ADMIN_EMAIL) return cfEmail;

  // Fallback: check Better Auth session (local dev)
  const auth = createAuth(c.env as Env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (session?.user?.email === ADMIN_EMAIL) return session.user.email;

  return null;
}

api.post('/api/admin/reviews/:id/publish', async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ error: 'Forbidden' }, 403);

  const id = Number(c.req.param('id'));
  const now = new Date().toISOString();

  await c.env.DB
    .prepare(`UPDATE reviews SET status = 'published', published_at = ? WHERE id = ?`)
    .bind(now, id).run();

  await c.env.DB
    .prepare(`INSERT INTO audit_log (actor, action, target_type, target_id) VALUES (?, 'review.publish', 'review', ?)`)
    .bind(admin, String(id)).run();

  return c.json({ ok: true });
});

api.post('/api/admin/reviews/:id/reject', async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ error: 'Forbidden' }, 403);

  const id = Number(c.req.param('id'));
  const { reason } = await c.req.json() as { reason?: string };

  await c.env.DB
    .prepare(`UPDATE reviews SET status = 'rejected', removed_reason = ? WHERE id = ?`)
    .bind(reason ?? 'Rejected by admin', id).run();

  await c.env.DB
    .prepare(`INSERT INTO audit_log (actor, action, target_type, target_id, reason) VALUES (?, 'review.reject', 'review', ?, ?)`)
    .bind(admin, String(id), reason ?? null).run();

  return c.json({ ok: true });
});

api.post('/api/admin/reviews/:id/remove', async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ error: 'Forbidden' }, 403);

  const id = Number(c.req.param('id'));
  const { reason } = await c.req.json() as { reason?: string };

  await c.env.DB
    .prepare(`UPDATE reviews SET status = 'removed', removed_reason = ? WHERE id = ?`)
    .bind(reason ?? 'Removed by admin', id).run();

  await c.env.DB
    .prepare(`INSERT INTO audit_log (actor, action, target_type, target_id, reason) VALUES (?, 'review.remove', 'review', ?, ?)`)
    .bind(admin, String(id), reason ?? null).run();

  return c.json({ ok: true });
});

api.post('/api/admin/reports/:id/resolve', async (c) => {
  const admin = await requireAdmin(c);
  if (!admin) return c.json({ error: 'Forbidden' }, 403);

  const id = Number(c.req.param('id'));
  const { status, notes } = await c.req.json() as { status: string; notes?: string };

  await c.env.DB
    .prepare(`UPDATE reports SET status = ?, resolution_notes = ?, resolved_at = ? WHERE id = ?`)
    .bind(status, notes ?? null, new Date().toISOString(), id).run();

  await c.env.DB
    .prepare(`INSERT INTO audit_log (actor, action, target_type, target_id, reason) VALUES (?, 'report.resolve', 'report', ?, ?)`)
    .bind(admin, String(id), notes ?? null).run();

  return c.json({ ok: true });
});

export default api;
