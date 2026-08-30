import { d1Query } from './lib/d1';

// University Settlement: /get-involved 404 but /volunteer returns 200
await d1Query(
  `UPDATE opportunities SET signup_url = 'https://www.universitysettlement.org/volunteer'
   WHERE signup_url = 'https://www.universitysettlement.org/get-involved'`,
  []
);
console.log('✅ University Settlement → /volunteer');

// The Door: /volunteer/ 404 but main site works
await d1Query(
  `UPDATE opportunities SET signup_url = 'https://www.door.org'
   WHERE signup_url = 'https://www.door.org/volunteer/'`,
  []
);
console.log('✅ The Door → main site');

// NYC Rescue Mission, Second Chance Rescue, Two Bridges, United Jewish Council:
// Main org websites are also DNS-failing (000 curl). Clear signup_url so no broken
// button is shown; org.website fallback in breadcrumb CTA handles it gracefully.
const clearByUrl = [
  'https://www.nycrescuemission.org/volunteer/',
  'https://www.secondchancerescuenyc.com',
  'https://twobridgesnyc.org',
  'https://www.ujcesnyc.org',
];
for (const url of clearByUrl) {
  await d1Query(`UPDATE opportunities SET signup_url = NULL WHERE signup_url = ?`, [url]);
  console.log(`✅ Cleared signup_url for: ${url}`);
}

console.log('\nDone.');
