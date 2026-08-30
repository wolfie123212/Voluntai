import { d1Query } from './lib/d1';

// DOROT: /volunteer/ returns 404; use main site
await d1Query(
  `UPDATE opportunities SET signup_url = 'https://www.dorot.org'
   WHERE signup_url = 'https://www.dorot.org/volunteer/'`,
  []
);
console.log('✅ DOROT → main site (https://www.dorot.org)');

// 5 orgs whose main websites are DNS-unreachable:
// anjellicle.org, littlewanderersnyc.com, grandstreet.org, nylj.org, lesprintshop.org, aafny.org
// Clear signup_url so no broken button appears (org detail CTA falls back to org.website sidebar)
const deadUrls = [
  'https://www.anjellicle.org',
  'https://littlewanderersnyc.com',
  'https://www.grandstreet.org',
  'https://nylj.org',
  'https://www.lesprintshop.org',
  'https://www.aafny.org/volunteer',
];
for (const url of deadUrls) {
  await d1Query(`UPDATE opportunities SET signup_url = NULL WHERE signup_url = ?`, [url]);
  console.log(`✅ Cleared: ${url}`);
}

// Tenement Museum: /support/volunteer/ returns 403 from crawlers but works in browsers — keep it.
// (WAF blocks HEAD/GET from non-browser user agents; real users get a proper page.)
console.log('ℹ️  Tenement Museum /support/volunteer/ kept — 403 is WAF only, works for real browsers.');

console.log('\nDone.');
