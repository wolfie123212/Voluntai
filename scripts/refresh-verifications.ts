// Nightly verification refresh — runs for all orgs with an EIN.
// Hits ProPublica, AmeriCorps, and Charity Navigator; updates org rows;
// logs every call to enrichment_runs; recomputes reputability score.
// Run: npm run refresh
// Docs: BUILD_PLAN.md §5.2

import { d1Query } from './lib/d1';
import { lookupByEin as ppLookup, searchByName, is501c3, irsStatus } from './lib/propublica';
import { fetchGrantees, buildEinIndex } from './lib/americorps';
import { lookupByEin as cnLookup, scoreToStars } from './lib/charity-nav';

// D1 REST API returns raw SQL column names (snake_case)
interface OrgRow {
  id: number;
  name: string;
  slug: string;
  ein: string | null;
  is_irs_501c3: number;
  irs_status: string | null;
  is_americorps_grantee: number;
  charity_nav_score: number | null;
  charity_nav_stars: number | null;
  logo_r2_key: string | null;
  address_line1: string | null;
  admin_verified_by: string | null;
  domain_first_seen: string | null;
}

async function logRun(orgId: number, source: string, ok: boolean, payload: unknown, error?: string) {
  await d1Query(
    'INSERT INTO enrichment_runs (org_id, source, ok, payload, error) VALUES (?, ?, ?, ?, ?)',
    [orgId, source, ok ? 1 : 0, JSON.stringify(payload), error ?? null]
  );
}

// EINs confirmed via gaycenter.org / IRS EO for orgs ProPublica name-search can't find
const KNOWN_EINS: Record<string, string> = {
  'bowery mission': '13-5562164',
  // Legal name: "Lesbian & Gay Community Services Center, Inc." — EIN from gaycenter.org
  'lgbt community center': '13-3217805',
  'lesbian': '13-3217805',
};

async function resolveEin(org: OrgRow): Promise<string | null> {
  // KNOWN_EINS takes priority — corrects any wrong EIN already stored
  const nameLower = org.name.toLowerCase().replace(/^the\s+/, '');
  for (const [key, ein] of Object.entries(KNOWN_EINS)) {
    if (nameLower.includes(key) || key.includes(nameLower.slice(0, 10))) {
      if (org.ein !== ein) {
        await d1Query('UPDATE organizations SET ein = ? WHERE id = ?', [ein, org.id]);
        console.log(`   🔍 ${org.ein ? 'Corrected' : 'Hardcoded'} EIN for ${org.name}: ${ein}`);
      }
      return ein;
    }
  }

  if (org.ein) return org.ein;

  // Try to find via ProPublica name search — only accept NY results with a close name match
  try {
    const results = await searchByName(org.name);
    const orgNameLower = org.name.toLowerCase().replace(/^the\s+/, '');
    const match = results.find((r) =>
      r.name.toLowerCase().replace(/^the\s+/, '').includes(orgNameLower.slice(0, 8)) ||
      orgNameLower.includes(r.name.toLowerCase().replace(/^the\s+/, '').slice(0, 8))
    ) ?? results[0];

    if (match) {
      const ein = String(match.ein).padStart(9, '0');
      const formatted = `${ein.slice(0, 2)}-${ein.slice(2)}`;
      await d1Query('UPDATE organizations SET ein = ? WHERE id = ?', [formatted, org.id]);
      console.log(`   🔍 Found EIN for ${org.name}: ${formatted} (matched "${match.name}")`);
      return formatted;
    }
  } catch (e) {
    console.warn(`   ⚠️  ProPublica name search failed for ${org.name}:`, e);
  }
  return null;
}

async function refreshProPublica(org: OrgRow, ein: string): Promise<Partial<OrgRow>> {
  try {
    const data = await ppLookup(ein);
    if (!data) {
      await logRun(org.id, 'propublica', false, null, 'Not found');
      return {};
    }
    await logRun(org.id, 'propublica', true, data);
    return {
      is_irs_501c3: is501c3(data) ? 1 : 0,
      irs_status: irsStatus(data),
    };
  } catch (e) {
    await logRun(org.id, 'propublica', false, null, String(e));
    console.warn(`   ⚠️  ProPublica failed for ${org.name}:`, e);
    return {};
  }
}

async function refreshCharityNav(org: OrgRow, ein: string): Promise<Partial<OrgRow>> {
  try {
    const data = await cnLookup(ein);
    if (!data?.currentRating) {
      await logRun(org.id, 'charity_navigator', false, data, 'No rating');
      return {};
    }
    await logRun(org.id, 'charity_navigator', true, data);
    return {
      charity_nav_score: data.currentRating.score,
      charity_nav_stars: scoreToStars(data.currentRating.score),
    };
  } catch (e) {
    await logRun(org.id, 'charity_navigator', false, null, String(e));
    return {};
  }
}

function computeScore(org: OrgRow, stats: { nReviews: number; avgRating: number; openReports: number }): number {
  let score = 30;
  if (org.is_irs_501c3) score += 20;
  if (org.is_irs_501c3 && org.irs_status !== 'REVOKED') score += 5;
  if (org.is_americorps_grantee) score += 15;
  if (org.charity_nav_stars) score += org.charity_nav_stars * 4;
  if (org.admin_verified_by) score += 10;
  if (org.domain_first_seen) {
    const years = (Date.now() - new Date(org.domain_first_seen).getTime()) / (1000 * 60 * 60 * 24 * 365);
    score += Math.min(5, Math.floor(years));
  }
  if (org.logo_r2_key) score += 2;
  if (org.address_line1) score += 2;
  if (stats.nReviews >= 3) {
    const signal = (stats.avgRating - 3.0) * 10;
    score += Math.max(-10, Math.min(10, signal));
  }
  if (stats.openReports >= 2) score -= 15;
  return Math.max(0, Math.min(100, Math.round(score)));
}

async function main() {
  console.log('🔄 Starting verification refresh...\n');

  // Load AmeriCorps grantee index once (dataset is large, fetch once)
  console.log('📥 Fetching AmeriCorps grantee list...');
  let americorpsIndex: Map<string, { program_name?: string }> = new Map();
  try {
    const grantees = await fetchGrantees();
    americorpsIndex = buildEinIndex(grantees);
    console.log(`   ${americorpsIndex.size} grantees indexed by EIN`);
  } catch (e) {
    console.warn('   ⚠️  AmeriCorps fetch failed — skipping AmeriCorps checks:', e);
  }

  const orgs = await d1Query(
    "SELECT id, name, slug, ein, is_irs_501c3, irs_status, is_americorps_grantee, charity_nav_score, charity_nav_stars, logo_r2_key, address_line1, admin_verified_by, domain_first_seen FROM organizations WHERE status = 'published'"
  ) as unknown as OrgRow[];

  console.log(`\n🏢 Processing ${orgs.length} organizations...\n`);

  for (const org of orgs) {
    console.log(`▶ ${org.name}`);

    const ein = await resolveEin(org);
    if (!ein) {
      console.log('   ⚠️  No EIN — skipping API checks\n');
      continue;
    }

    // ProPublica
    const ppUpdates = await refreshProPublica(org, ein);

    // AmeriCorps
    const cleanEin = ein.replace('-', '').padStart(9, '0');
    const grantee = americorpsIndex.get(cleanEin);
    const americorpsUpdates = grantee
      ? { is_americorps_grantee: 1, americorps_program: grantee.program_name ?? null }
      : {};
    if (grantee) {
      await logRun(org.id, 'americorps', true, grantee);
      console.log(`   ✓  AmeriCorps grantee: ${grantee.program_name ?? 'yes'}`);
    }

    // Charity Navigator
    const cnUpdates = await refreshCharityNav(org, ein);

    // Merge updates
    const merged = { ...org, ...ppUpdates, ...americorpsUpdates, ...cnUpdates };

    // Reputability score
    const statsRows = await d1Query(
      "SELECT COUNT(*) as n, AVG(rating) as avg FROM reviews WHERE org_id = ? AND status = 'published'",
      [org.id]
    );
    const reportsRows = await d1Query(
      "SELECT COUNT(*) as n FROM reports WHERE org_id = ? AND status IN ('open','in_review')",
      [org.id]
    );
    const stats = {
      nReviews: Number(statsRows[0]?.n ?? 0),
      avgRating: Number(statsRows[0]?.avg ?? 3),
      openReports: Number(reportsRows[0]?.n ?? 0),
    };
    const repScore = computeScore(merged as OrgRow, stats);

    // Persist
    await d1Query(
      `UPDATE organizations SET
        is_irs_501c3 = ?, irs_status = ?,
        is_americorps_grantee = ?, americorps_program = ?,
        charity_nav_score = ?, charity_nav_stars = ?,
        reputability_cached = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        merged.is_irs_501c3 ?? org.is_irs_501c3,
        merged.irs_status ?? org.irs_status,
        (merged as Record<string, unknown>).is_americorps_grantee ?? org.is_americorps_grantee,
        (merged as Record<string, unknown>).americorps_program ?? null,
        merged.charity_nav_score ?? org.charity_nav_score,
        merged.charity_nav_stars ?? org.charity_nav_stars,
        repScore,
        org.id,
      ]
    );

    console.log(`   ✓  Score: ${repScore}/100 | IRS 501c3: ${merged.is_irs_501c3 ?? org.is_irs_501c3} | AmeriCorps: ${(merged as Record<string, unknown>).is_americorps_grantee ?? org.is_americorps_grantee}\n`);

    // Polite delay to avoid rate limits
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log('✅ Verification refresh complete.');
}

main().catch((err) => {
  console.error('Refresh failed:', err);
  process.exit(1);
});
