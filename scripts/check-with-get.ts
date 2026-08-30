import { d1Query } from './lib/d1';

// Re-test still-broken URLs with GET to distinguish WAF-blocked-HEAD from genuinely-broken
const stillBroken = [
  { org: 'NYC Rescue Mission',              url: 'https://www.nycrescuemission.org/volunteer/' },
  { org: 'Second Chance Rescue NYC (main)', url: 'https://www.secondchancerescuenyc.com' },
  { org: 'The Door (volunteer)',            url: 'https://www.door.org/volunteer/' },
  { org: 'Two Bridges Neighborhood',       url: 'https://twobridgesnyc.org' },
  { org: 'United Jewish Council',           url: 'https://www.ujcesnyc.org' },
  { org: 'University Settlement',           url: 'https://www.universitysettlement.org/get-involved' },
  { org: 'University Settlement (alt)',     url: 'https://www.universitysettlement.org/volunteer' },
  { org: 'The Door (main)',                 url: 'https://www.door.org' },
];

for (const { org, url } of stillBroken) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36' },
    });
    const mark = res.status < 400 ? '✅' : '❌';
    console.log(`${mark} [${res.status}] ${org} — ${url}`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`❌ [ERR: ${msg.slice(0, 60)}] ${org}`);
  }
}
