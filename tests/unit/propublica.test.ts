import { describe, it, expect } from 'vitest';
import { is501c3, irsStatus } from '../../scripts/lib/propublica';
import type { ProPublicaOrg } from '../../scripts/lib/propublica';

const base: ProPublicaOrg = {
  ein: 135562164,
  name: 'Test Org',
  address: '123 Main St',
  city: 'New York',
  state: 'NY',
  zipcode: '10009',
  ntee_code: 'P20',
  subsection_code: '3',
  deductibility_code: '1',
  revocation_date: null,
};

describe('is501c3', () => {
  it('returns true for active 501c3 with deductible donations', () => {
    expect(is501c3(base)).toBe(true);
  });

  it('returns false when revoked', () => {
    expect(is501c3({ ...base, revocation_date: '2020-01-01' })).toBe(false);
  });

  it('returns false when not 501c3 subsection', () => {
    expect(is501c3({ ...base, subsection_code: '4' })).toBe(false);
  });

  it('returns false when deductibility not allowed', () => {
    expect(is501c3({ ...base, deductibility_code: '2' })).toBe(false);
  });
});

describe('irsStatus', () => {
  it('returns PUBLIC_CHARITY for active 501c3', () => {
    expect(irsStatus(base)).toBe('PUBLIC_CHARITY');
  });

  it('returns REVOKED when revocation_date set', () => {
    expect(irsStatus({ ...base, revocation_date: '2021-06-01' })).toBe('REVOKED');
  });

  it('returns 501C4 for 501c4 org', () => {
    expect(irsStatus({ ...base, subsection_code: '4' })).toBe('501C4');
  });
});
