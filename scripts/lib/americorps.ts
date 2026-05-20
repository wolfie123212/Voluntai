// AmeriCorps Open Data (Socrata SODA) API client.
// Docs: https://data.americorps.gov/

const AMERICORPS_BASE = 'https://data.americorps.gov/resource';

// Known dataset IDs — AmeriCorps occasionally reorganizes their open data portal.
// If all fail, the refresh script skips AmeriCorps checks gracefully.
const GRANTEE_DATASET_IDS = [
  'uua4-22bw', // Current Grantee Resources
  'qmye-b73f', // AmeriCorps State & National Grantees
  'x8s3-5dih', // Legacy grantee dataset
];

export interface AmericorpsGrantee {
  organization_name: string;
  ein?: string;
  program_name?: string;
  grant_type?: string;
}

export async function fetchGrantees(): Promise<AmericorpsGrantee[]> {
  for (const id of GRANTEE_DATASET_IDS) {
    const url = `${AMERICORPS_BASE}/${id}.json?$limit=50000`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json() as AmericorpsGrantee[];
      if (Array.isArray(data) && data.length > 0) return data;
    }
  }
  throw new Error('AmeriCorps grantee dataset unavailable — all known dataset IDs returned 404. Check data.americorps.gov for the current ID and update scripts/lib/americorps.ts.');
}

export function buildEinIndex(grantees: AmericorpsGrantee[]): Map<string, AmericorpsGrantee> {
  const index = new Map<string, AmericorpsGrantee>();
  for (const g of grantees) {
    if (g.ein) {
      const clean = g.ein.replace(/\D/g, '');
      if (clean.length === 9) index.set(clean, g);
    }
  }
  return index;
}
