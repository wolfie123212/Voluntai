// Nightly verification refresh — runs for all orgs with an EIN.
// Hits ProPublica, AmeriCorps, and Charity Navigator; updates org rows;
// logs every call to enrichment_runs; recomputes reputability score.
// Run: npm run refresh
// Docs: BUILD_PLAN.md §5.2

import { d1Query } from './lib/d1';
import { lookupByEin as ppLookup, searchByName, is501c3, irsStatus } from './lib/propublica';
import { fetchGrantees, buildEinIndex } from './lib/americorps';
import { lookupByEin as cnLookup, scoreToStars } from './lib/charity-nav';

interface OrgRow {
  id: number;
  name: string;
  slug: string;
  ein: string | null;
  isIrs501c3: number;
  irsStatus: string | null;
  isAmericorpsGrantee: number;
  charityNavScore: number | null;
  charityNavStars: number | null;
  logoR2Key: string | null;
  addressLine1: string | null;
  adminVerifiedBy: string | null;
  domainFirstSeen: string | null;
}

async function logRun(orgId: number, source: string, ok: boolean, payload: unknown, error?: string) {
  await d1Query(
    'INSERT INTO enrichment_runs (org_id, source, ok, payload, error) VALUES (?, ?, ?, ?, ?)',
    [orgId, source, ok ? 1 : 0, JSON.stringify(payload), error ?? null]
  );
}

async function resolveEin(org: OrgRow): Promise<string | null> {
  if (org.ein) return org.ein;

  // Try to find via ProPublica name search
  try {
    const results = await searchByName(org.name);
    if (results.length > 0) {
      const match = results[0];
      const ein = String(match.ein).padStart(9, '0');
      const formatted = `${ein.slice(0, 2)}-${ein.slice(2)}`;
      await d1Query('UPDATE organizations SET ein = ? WHERE id = ?', [formatted, org.id]);
      console.log(`   🔍 Found EIN for ${org.name}: ${formatted}`);
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
      isIrs501c3: is501c3(data) ? 1 : 0,
      irsStatus: irsStatus(data),
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
      charityNavScore: data.currentRating.score,
      charityNavStars: scoreToStars(data.currentRating.score),
    };
  } catch (e) {
    await logRun(org.id, 'charity_navigator', false, null, String(e));
    return {};
  }
}

function computeScore(org: OrgRow, stats: { nReviews: number; avgRating: number; openReports: number }): number {
  let score = 30;
  if (org.isIrs501c3) score += 20;
  if (org.isIrs501c3 && org.irsStatus !== 'REVOKED') score += 5;
  if (org.isAmericorpsGrantee) score += 15;
  if (org.charityNavStars) score += org.charityNavStars * 4;
  if (org.adminVerifiedBy) score += 10;
  if (org.domainFirstSeen) {
    const years = (Date.now() - new Date(org.domainFirstSeen).getTime()) / (1000 * 60 * 60 * 24 * 365);
    score += Math.min(5, Math.floor(years));
  }
  if (org.logoR2Key) score += 2;
  if (org.addressLine1) score += 2;
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
      ? { isAmericorpsGrantee: 1, americorpsProgram: grantee.program_name ?? null }
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
        merged.isIrs501c3 ?? org.isIrs501c3,
        merged.irsStatus ?? org.irsStatus,
        (merged as Record<string, unknown>).isAmericorpsGrantee ?? org.isAmericorpsGrantee,
        (merged as Record<string, unknown>).americorpsProgram ?? null,
        merged.charityNavScore ?? org.charityNavScore,
        merged.charityNavStars ?? org.charityNavStars,
        repScore,
        org.id,
      ]
    );

    console.log(`   ✓  Score: ${repScore}/100 | IRS 501c3: ${merged.isIrs501c3 ?? org.isIrs501c3} | AmeriCorps: ${(merged as Record<string, unknown>).isAmericorpsGrantee ?? org.isAmericorpsGrantee}\n`);

    // Polite delay to avoid rate limits
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log('✅ Verification refresh complete.');
}

main().catch((err) => {
  console.error('Refresh failed:', err);
  process.exit(1);
});
