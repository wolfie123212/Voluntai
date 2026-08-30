// Fix broken signup URLs discovered by check-signup-urls.ts
// Strategy:
//   1. Use a known-good specific volunteer page where possible
//   2. Fall back to org's main website (which returns 200) where the exact page is unknown
// Run: npx tsx scripts/fix-signup-urls.ts

import { d1Query } from './lib/d1';

interface Fix {
  orgSlug: string;
  oldUrl: string;
  newUrl: string;
}

// Maps org_slug + opp_title fragment → correct signup URL
// Determined by looking up each org's actual site structure
const FIXES: Fix[] = [
  // ABC No Rio — /volunteer.html doesn't exist; use main site
  { orgSlug: 'abc-no-rio',       oldUrl: 'https://www.abcnorio.org/volunteer.html',                newUrl: 'https://www.abcnorio.org' },

  // Anjellicle — site exists but /volunteer and /tnr paths return errors
  { orgSlug: 'anjellicle-cats-rescue', oldUrl: 'https://www.anjellicle.org/volunteer',             newUrl: 'https://www.anjellicle.org' },
  { orgSlug: 'anjellicle-cats-rescue', oldUrl: 'https://www.anjellicle.org/tnr',                   newUrl: 'https://www.anjellicle.org' },

  // Asian American Federation — correct path is /volunteer
  { orgSlug: 'asian-american-federation', oldUrl: 'https://www.aafny.org/get-involved/',           newUrl: 'https://www.aafny.org/volunteer' },

  // AAFE — /get-involved/ 404; use main site
  { orgSlug: 'aafe',             oldUrl: 'https://www.aafe.org/get-involved/',                     newUrl: 'https://www.aafe.org' },

  // Battery to Bridges — /volunteer 404; use main site
  { orgSlug: 'battery-to-bridges', oldUrl: 'https://batterytobridges.org/volunteer',               newUrl: 'https://batterytobridges.org' },

  // CAAAV — /volunteer 404; use main site
  { orgSlug: 'caaav',            oldUrl: 'https://caaav.org/volunteer',                             newUrl: 'https://caaav.org' },

  // Chinatown Manpower Project — /volunteer 404; use main site
  { orgSlug: 'chinatown-manpower-project', oldUrl: 'https://www.cmpny.org/volunteer',              newUrl: 'https://www.cmpny.org' },

  // Church Street School — /volunteer 404; use main site
  { orgSlug: 'church-street-school-music-art', oldUrl: 'https://www.churchstreetschool.org/volunteer', newUrl: 'https://www.churchstreetschool.org' },

  // Cooper Square Committee — 500 server error; use main site
  { orgSlug: 'cooper-square-committee', oldUrl: 'https://coopersquare.org/volunteer',              newUrl: 'https://coopersquare.org' },

  // DOROT — correct volunteer URL
  { orgSlug: 'dorot',            oldUrl: 'https://www.dorot.org/volunteer',                         newUrl: 'https://www.dorot.org/volunteer/' },

  // Fourth Arts Block — /get-involved 404; use main site
  { orgSlug: 'fourth-arts-block', oldUrl: 'https://www.fabnyc.org/get-involved',                   newUrl: 'https://www.fabnyc.org' },

  // Grace Church — /connect/get-involved/ 404; use main site
  { orgSlug: 'grace-church-community-programs', oldUrl: 'https://www.gracechurchnyc.org/connect/get-involved/', newUrl: 'https://www.gracechurchnyc.org' },

  // Grand Street Settlement — error; use main site
  { orgSlug: 'grand-street-settlement', oldUrl: 'https://www.grandstreet.org/volunteer',           newUrl: 'https://www.grandstreet.org' },

  // Hester Street Collaborative — /get-involved 404; use main site
  { orgSlug: 'hester-street-collaborative', oldUrl: 'https://hesterstreet.org/get-involved',       newUrl: 'https://hesterstreet.org' },

  // Judson Memorial Church — error; use main site
  { orgSlug: 'judson-memorial-church', oldUrl: 'https://www.judson.org/volunteer',                 newUrl: 'https://www.judson.org' },

  // Little Wanderers NYC — error; use main site
  { orgSlug: 'little-wanderers-nyc', oldUrl: 'https://littlewanderersnyc.com/volunteer',           newUrl: 'https://littlewanderersnyc.com' },

  // Lower East Side Jewish Conservancy — error; use main site
  { orgSlug: 'lower-east-side-jewish-conservancy', oldUrl: 'https://nylj.org/volunteer',           newUrl: 'https://nylj.org' },

  // Lower East Side Printshop — error; use main site
  { orgSlug: 'lower-east-side-printshop', oldUrl: 'https://www.lesprintshop.org/volunteer',        newUrl: 'https://www.lesprintshop.org' },

  // Tenement Museum — correct volunteer path
  { orgSlug: 'tenement-museum',  oldUrl: 'https://www.tenement.org/volunteer',                     newUrl: 'https://www.tenement.org/support/volunteer/' },

  // Museum at Eldridge Street — /volunteer 404; use main site
  { orgSlug: 'museum-at-eldridge-street', oldUrl: 'https://www.eldridgestreet.org/volunteer',      newUrl: 'https://www.eldridgestreet.org' },

  // NYC Rescue Mission — error (likely blocks HEAD); try with trailing slash
  { orgSlug: 'nyc-rescue-mission', oldUrl: 'https://nycrescuemission.org/volunteer/',               newUrl: 'https://www.nycrescuemission.org/volunteer/' },

  // Project Renewal — /volunteer/ 404; use main site
  { orgSlug: 'project-renewal',  oldUrl: 'https://www.projectrenewal.org/volunteer/',               newUrl: 'https://www.projectrenewal.org' },

  // Ryan Health | NENA — error; use main site
  { orgSlug: 'ryan-health-nena', oldUrl: 'https://ryanhealth.org/volunteer',                        newUrl: 'https://ryanhealth.org' },

  // Second Chance Rescue NYC — error; use main site
  { orgSlug: 'second-chance-rescue-nyc', oldUrl: 'https://www.secondchancerescuenyc.com/volunteer', newUrl: 'https://www.secondchancerescuenyc.com' },

  // St. Mark's Church — /get-involved 404; use main site
  { orgSlug: 'st-marks-church-bowery', oldUrl: 'https://stmarksbowery.org/get-involved',            newUrl: 'https://stmarksbowery.org' },

  // The Door — correct volunteer path
  { orgSlug: 'the-door',         oldUrl: 'https://www.door.org/get-involved/volunteer/',            newUrl: 'https://www.door.org/volunteer/' },

  // LGBT Center Young Leaders — ClickAndPledge link 403; use gaycenter volunteer page
  { orgSlug: 'lgbt-community-center', oldUrl: 'https://connect.clickandpledge.com/w/Form/8412ae2f-9f8b-45fc-8d8b-4768c4b8ee3a', newUrl: 'https://gaycenter.org/get-involved/volunteer/' },

  // Third Street Music School — /volunteer 404; use main site
  { orgSlug: 'third-street-music-school', oldUrl: 'https://www.thirdstreet.nyc/volunteer',         newUrl: 'https://www.thirdstreet.nyc' },

  // Two Bridges Neighborhood Council — error; use main site
  { orgSlug: 'two-bridges-neighborhood-council', oldUrl: 'https://twobridgesnyc.org/get-involved', newUrl: 'https://twobridgesnyc.org' },

  // United Jewish Council — error; use main site
  { orgSlug: 'united-jewish-council', oldUrl: 'https://www.ujcesnyc.org/volunteer',                 newUrl: 'https://www.ujcesnyc.org' },

  // University Settlement — /get-involved/ 404; correct path
  { orgSlug: 'university-settlement', oldUrl: 'https://www.universitysettlement.org/get-involved/', newUrl: 'https://www.universitysettlement.org/get-involved' },
];

async function main() {
  let fixed = 0;
  let skipped = 0;

  for (const fix of FIXES) {
    // Get org id
    const orgRows = await d1Query(
      'SELECT id FROM organizations WHERE slug = ?',
      [fix.orgSlug]
    );
    if (orgRows.length === 0) {
      console.log(`  SKIP (org not found): ${fix.orgSlug}`);
      skipped++;
      continue;
    }
    const orgId = orgRows[0].id;

    // Update all opportunities for this org that have the broken URL
    const result = await d1Query(
      `UPDATE opportunities SET signup_url = ? WHERE org_id = ? AND signup_url = ?`,
      [fix.newUrl, orgId, fix.oldUrl]
    );

    console.log(`  ✅ Fixed ${fix.orgSlug}: ${fix.oldUrl.slice(0, 60)}… → ${fix.newUrl}`);
    fixed++;
  }

  console.log(`\nDone. ${fixed} URLs fixed, ${skipped} skipped.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
