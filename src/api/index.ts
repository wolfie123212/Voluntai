import { Hono } from 'hono';
import type { Env } from '../worker';

const api = new Hono<{ Bindings: Env }>();

// Routes added per phase:
// Phase 1: /api/enrich
// Phase 2: /api/search
// Phase 4: /api/reviews, /api/reports, /api/admin, /api/auth/*

api.get('/api/health', (c) => c.json({ ok: true, ts: Date.now() }));

export default api;
