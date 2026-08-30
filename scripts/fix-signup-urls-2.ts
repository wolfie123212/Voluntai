import { d1Query } from './lib/d1';

const FIXES = [
  { orgSlug: 'church-street-school',        oldUrl: 'https://www.churchstreetschool.org/volunteer', newUrl: 'https://www.churchstreetschool.org' },
  { orgSlug: 'fabnyc',                       oldUrl: 'https://www.fabnyc.org/get-involved',          newUrl: 'https://www.fabnyc.org' },
  { orgSlug: 'grace-church-community',       oldUrl: 'https://www.gracechurchnyc.org/connect/get-involved/', newUrl: 'https://www.gracechurchnyc.org' },
  { orgSlug: 'lower-east-side-conservancy',  oldUrl: 'https://nylj.org/volunteer',                   newUrl: 'https://nylj.org' },
  { orgSlug: 'les-printshop',                oldUrl: 'https://www.lesprintshop.org/volunteer',        newUrl: 'https://www.lesprintshop.org' },
  { orgSlug: 'st-marks-church',              oldUrl: 'https://stmarksbowery.org/get-involved',        newUrl: 'https://stmarksbowery.org' },
  { orgSlug: 'united-jewish-council-les',    oldUrl: 'https://www.ujcesnyc.org/volunteer',             newUrl: 'https://www.ujcesnyc.org' },
];

for (const fix of FIXES) {
  const orgRows = await d1Query('SELECT id FROM organizations WHERE slug = ?', [fix.orgSlug]);
  if (orgRows.length === 0) { console.log(`SKIP: ${fix.orgSlug}`); continue; }
  const orgId = orgRows[0].id;
  await d1Query('UPDATE opportunities SET signup_url = ? WHERE org_id = ? AND signup_url = ?', [fix.newUrl, orgId, fix.oldUrl]);
  console.log(`✅ Fixed ${fix.orgSlug} → ${fix.newUrl}`);
}
console.log('Done.');
