import { describe, it, expect } from 'vitest';
import { computeReputabilityScore } from '../../src/lib/score';

const baseOrg = {
  isIrs501c3: 0,
  irsStatus: null,
  isAmericorpsGrantee: 0,
  charityNavStars: null,
  adminVerifiedBy: null,
  domainFirstSeen: null,
  logoR2Key: null,
  addressLine1: null,
};

const baseStats = { nReviews: 0, avgRating: 0, openUnresolvedReports: 0 };

describe('computeReputabilityScore', () => {
  it('starts at 30 base', () => {
    expect(computeReputabilityScore(baseOrg, baseStats)).toBe(30);
  });

  it('adds 20 for IRS 501c3', () => {
    expect(computeReputabilityScore({ ...baseOrg, isIrs501c3: 1, irsStatus: 'PUBLIC_CHARITY' }, baseStats)).toBe(55);
  });

  it('adds 15 for AmeriCorps grantee', () => {
    expect(computeReputabilityScore({ ...baseOrg, isAmericorpsGrantee: 1 }, baseStats)).toBe(45);
  });

  it('adds 10 for admin verified', () => {
    expect(computeReputabilityScore({ ...baseOrg, adminVerifiedBy: 'Wolfgang White' }, baseStats)).toBe(40);
  });

  it('adds up to 16 for charity nav stars', () => {
    expect(computeReputabilityScore({ ...baseOrg, charityNavStars: 4 }, baseStats)).toBe(46);
  });

  it('adds 2 for logo and 2 for address', () => {
    expect(computeReputabilityScore({ ...baseOrg, logoR2Key: 'logo.png', addressLine1: '123 Main St' }, baseStats)).toBe(34);
  });

  it('applies rating signal with 3+ reviews', () => {
    // avg 5.0 → signal = (5.0 - 3.0) * 10 = 20, clamped to 10
    expect(computeReputabilityScore(baseOrg, { nReviews: 3, avgRating: 5.0, openUnresolvedReports: 0 })).toBe(40);
  });

  it('deducts 15 for 2+ open unresolved reports', () => {
    expect(computeReputabilityScore(baseOrg, { nReviews: 0, avgRating: 0, openUnresolvedReports: 2 })).toBe(15);
  });

  it('clamps to 100 max', () => {
    const topOrg = {
      isIrs501c3: 1,
      irsStatus: 'PUBLIC_CHARITY',
      isAmericorpsGrantee: 1,
      charityNavStars: 4,
      adminVerifiedBy: 'Wolfgang White',
      domainFirstSeen: '2010-01-01',
      logoR2Key: 'logo.png',
      addressLine1: '123 Main St',
    };
    expect(computeReputabilityScore(topOrg, { nReviews: 10, avgRating: 5.0, openUnresolvedReports: 0 })).toBeLessThanOrEqual(100);
  });

  it('clamps to 0 min', () => {
    expect(computeReputabilityScore(baseOrg, { nReviews: 10, avgRating: 1.0, openUnresolvedReports: 5 })).toBeGreaterThanOrEqual(0);
  });
});
