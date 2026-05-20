// ProPublica Nonprofit Explorer API client.
// Docs: https://projects.propublica.org/nonprofits/api

import { config } from './env';

export interface ProPublicaOrg {
  ein: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  ntee_code: string | null;
  subsection_code: string; // "3" = 501(c)(3)
  deductibility_code: string; // "1" = deductible
  latest_filing?: { tax_prd_yr: number };
  revocation_date?: string | null;
}

export interface ProPublicaSearchResult {
  organizations: Array<{
    ein: number;
    name: string;
    city: string;
    state: string;
  }>;
}

export async function lookupByEin(ein: string): Promise<ProPublicaOrg | null> {
  const cleanEin = ein.replace('-', '');
  const res = await fetch(
    `https://projects.propublica.org/nonprofits/api/v2/organizations/${cleanEin}.json`,
    { headers: { 'User-Agent': config.propublicaUserAgent } }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`ProPublica error ${res.status} for EIN ${ein}`);
  const json = await res.json() as { organization: ProPublicaOrg };
  return json.organization ?? null;
}

export async function searchByName(name: string): Promise<ProPublicaSearchResult['organizations']> {
  const res = await fetch(
    `https://projects.propublica.org/nonprofits/api/v2/search.json?q=${encodeURIComponent(name)}`,
    { headers: { 'User-Agent': config.propublicaUserAgent } }
  );
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`ProPublica search error ${res.status}`);
  const json = await res.json() as ProPublicaSearchResult;
  // Filter to NY results only
  return (json.organizations ?? []).filter((o) => o.state === 'NY');
}

export function is501c3(org: ProPublicaOrg): boolean {
  // API returns numbers or strings depending on version — coerce both
  return String(org.subsection_code) === '3'
    && String(org.deductibility_code) === '1'
    && !org.revocation_date;
}

export function irsStatus(org: ProPublicaOrg): string {
  if (org.revocation_date) return 'REVOKED';
  if (String(org.subsection_code) === '3') return 'PUBLIC_CHARITY';
  return `501C${org.subsection_code}`;
}
