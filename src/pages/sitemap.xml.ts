import type { APIRoute } from 'astro';
import { getSitemapEntries } from '../lib/db/sitemap';

const BASE = 'https://cityserv.org';
const STATIC = ['/', '/search', '/leaderboard', '/about', '/how-it-works', '/verification', '/contact', '/terms', '/privacy', '/dmca', '/accessibility'];

const day = (s: string | null) => (s ? s.slice(0, 10) : undefined);
const entry = (path: string, lastmod?: string) =>
  `<url><loc>${BASE}${path}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;

export const GET: APIRoute = async ({ locals }) => {
  const db = locals.runtime?.env?.DB;
  const { orgs, opps } = db ? await getSitemapEntries(db) : { orgs: [], opps: [] };

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[
  ...STATIC.map((p) => entry(p)),
  ...orgs.map((o) => entry(`/orgs/${encodeURIComponent(o.slug)}`, day(o.updated_at))),
  ...opps.map((o) => entry(`/opp/${o.id}`, day(o.updated_at))),
].join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
};
