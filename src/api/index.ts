import { Hono } from 'hono';
import type { Env } from '../worker';
import { searchOrgs } from '../lib/search';

const api = new Hono<{ Bindings: Env }>();

api.get('/api/health', (c) => c.json({ ok: true, ts: Date.now() }));

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

export default api;
