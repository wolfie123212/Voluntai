export async function getSitemapEntries(db: D1Database) {
  const [orgs, opps] = await Promise.all([
    db
      .prepare(`SELECT slug, updated_at FROM organizations WHERE status = 'published'`)
      .all<{ slug: string; updated_at: string | null }>(),
    db
      .prepare(`SELECT id, updated_at FROM opportunities WHERE status = 'published'`)
      .all<{ id: number; updated_at: string | null }>(),
  ]);
  return { orgs: orgs.results, opps: opps.results };
}
