import type { D1Database } from '@cloudflare/workers-types';

export interface SearchParams {
  q?: string;
  zip?: string;
  radius?: number;
  category?: string;
  limit?: number;
}

export interface OrgSearchRow {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  mission: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  categories: string | null;
  neighborhood: string | null;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  is_irs_501c3: number;
  irs_status: string | null;
  is_americorps_grantee: number;
  charity_nav_stars: number | null;
  admin_verified_by: string | null;
  reputability_cached: number | null;
  logo_r2_key: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
}

export interface OpportunityRow {
  id: number;
  org_id: number;
  title: string;
  summary: string | null;
  commitment: string | null;
  hours_per_week: number | null;
  schedule: string | null;
  is_remote: number;
  in_person_address: string | null;
  min_age: number | null;
  signup_url: string | null;
  categories: string | null;
}

export function buildFtsQuery(raw: string): string {
  return raw.trim().replace(/['"*^()]/g, '').split(/\s+/).filter(Boolean).join(' ');
}

export function parseCategories(raw: string | null): string[] {
  if (!raw) return [];
  return raw.split(',').map((c) => c.trim()).filter(Boolean);
}

export async function searchOrgs(d1: D1Database, params: SearchParams): Promise<OrgSearchRow[]> {
  const limit = params.limit ?? 20;
  const q = params.q?.trim();

  if (!q) {
    const result = await d1
      .prepare(
        `SELECT * FROM organizations WHERE status = 'published'
         ORDER BY reputability_cached DESC LIMIT ?`
      )
      .bind(limit)
      .all<OrgSearchRow>();
    return result.results;
  }

  const likeQ = `%${q}%`;
  const result = await d1
    .prepare(
      `SELECT DISTINCT o.* FROM organizations o
       LEFT JOIN opportunities opp ON opp.org_id = o.id AND opp.status = 'published'
       WHERE o.status = 'published'
       AND (o.name LIKE ? OR o.description LIKE ? OR o.categories LIKE ?
            OR opp.title LIKE ? OR opp.summary LIKE ?)
       ORDER BY o.reputability_cached DESC
       LIMIT ?`
    )
    .bind(likeQ, likeQ, likeQ, likeQ, likeQ, limit)
    .all<OrgSearchRow>();
  return result.results;
}

export async function getOrgOpportunities(d1: D1Database, orgId: number): Promise<OpportunityRow[]> {
  const result = await d1
    .prepare(
      `SELECT * FROM opportunities WHERE org_id = ? AND status = 'published'
       ORDER BY created_at DESC`
    )
    .bind(orgId)
    .all<OpportunityRow>();
  return result.results;
}
