import type { Organization } from './db/schema';

export type TrustTier = 'highly-trusted' | 'trusted' | 'verified' | 'listed';

export function trustTier(score: number | null | undefined): TrustTier {
  if (!score || score < 40) return 'listed';
  if (score >= 80) return 'highly-trusted';
  if (score >= 60) return 'trusted';
  return 'verified';
}

export const TRUST_TIER_LABEL: Record<TrustTier, string> = {
  'highly-trusted': 'Highly Trusted',
  'trusted': 'Trusted',
  'verified': 'Verified',
  'listed': 'Listed',
};

// Reputability formula v1 — see BUILD_PLAN.md §7
export function computeReputabilityScore(
  org: Pick<
    Organization,
    | 'isIrs501c3'
    | 'irsStatus'
    | 'isAmericorpsGrantee'
    | 'charityNavStars'
    | 'adminVerifiedBy'
    | 'domainFirstSeen'
    | 'logoR2Key'
    | 'addressLine1'
  >,
  stats: { nReviews: number; avgRating: number; openUnresolvedReports: number }
): number {
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

  if (stats.openUnresolvedReports >= 2) score -= 15;

  return Math.max(0, Math.min(100, Math.round(score)));
}
