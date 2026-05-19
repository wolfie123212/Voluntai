// Charity Navigator GraphQL API client.
// Docs: https://www.charitynavigator.org/products-and-services/graphql-api/
// Requires CHARITY_NAV_API_KEY env var.

import { config } from './env';

const CN_ENDPOINT = 'https://api.data.charitynavigator.org/v2/graphql';

export interface CharityNavResult {
  ein: string;
  organizationName: string;
  currentRating?: {
    score: number;
    ratingImage?: { small?: string };
    advisories?: unknown[];
  };
  stars?: number;
  charityNavigatorURL?: string;
}

export async function lookupByEin(ein: string): Promise<CharityNavResult | null> {
  if (!config.charityNavApiKey) return null;

  const cleanEin = ein.replace('-', '');
  const query = `
    query {
      organization(ein: "${cleanEin}") {
        ein
        organizationName
        charityNavigatorURL
        currentRating {
          score
          ratingImage { small }
        }
      }
    }
  `;

  const res = await fetch(CN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'app_id': config.charityNavApiKey,
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) return null;
  const json = await res.json() as { data?: { organization?: CharityNavResult } };
  return json.data?.organization ?? null;
}

export function scoreToStars(score: number): number {
  if (score >= 90) return 4;
  if (score >= 75) return 3;
  if (score >= 60) return 2;
  return 1;
}
