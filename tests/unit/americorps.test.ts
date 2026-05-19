import { describe, it, expect } from 'vitest';
import { buildEinIndex } from '../../scripts/lib/americorps';
import type { AmericorpsGrantee } from '../../scripts/lib/americorps';

const fixtures: AmericorpsGrantee[] = [
  { organization_name: 'Test Org A', ein: '13-3383154', program_name: 'AmeriCorps VISTA' },
  { organization_name: 'Test Org B', ein: '133383155', program_name: 'AmeriCorps State' },
  { organization_name: 'No EIN Org' },
];

describe('buildEinIndex', () => {
  it('indexes grantees by 9-digit EIN', () => {
    const index = buildEinIndex(fixtures);
    expect(index.has('133383154')).toBe(true);
    expect(index.has('133383155')).toBe(true);
  });

  it('strips hyphens from EIN', () => {
    const index = buildEinIndex(fixtures);
    expect(index.get('133383154')?.organization_name).toBe('Test Org A');
  });

  it('skips entries without EIN', () => {
    const index = buildEinIndex(fixtures);
    expect(index.size).toBe(2);
  });
});
