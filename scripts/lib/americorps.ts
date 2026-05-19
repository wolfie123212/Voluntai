// AmeriCorps Open Data (Socrata SODA) API client.
// Docs: https://data.americorps.gov/

const AMERICORPS_BASE = 'https://data.americorps.gov/resource';

// Dataset IDs for AmeriCorps grantees — verify current IDs at data.americorps.gov
const GRANTEE_DATASET_ID = 'x8s3-5dih'; // AmeriCorps grantees — update if dataset changes

export interface AmericorpsGrantee {
  organization_name: string;
  ein?: string;
  program_name?: string;
  grant_type?: string;
}

export async function fetchGrantees(): Promise<AmericorpsGrantee[]> {
  const url = `${AMERICORPS_BASE}/${GRANTEE_DATASET_ID}.json?$limit=50000`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`AmeriCorps API error ${res.status}`);
  return await res.json() as AmericorpsGrantee[];
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
