// Fix opportunity data: remove 4 invalid orgs, update all signup_url to direct registration pages.
// Run: npx tsx scripts/fix-opportunities.ts
// Requires CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_API_TOKEN in .env

import { d1Query } from './lib/d1';

// ─── Step 1: Unpublish invalid orgs ──────────────────────────────────────────
//
// Reason for each removal:
//   dorot                           → dorot.org is The Dorot Foundation (fellowships for young
//                                     Jewish Americans), NOT the DOROT senior-services nonprofit.
//                                     Correct URL unknown — must not list wrong org.
//   tompkins-square-park-conservancy→ Not an independent nonprofit; just an NYC Parks entity.
//                                     No standalone volunteer program exists.
//   childrens-aid                   → No individual volunteer program. Group-only, $5,000 minimum
//                                     corporate contribution required. Not suitable for this directory.
//   east-village-community-coalition→ Website (evcc.nyc) is down / connection refused.

const REMOVE_SLUGS = [
  'dorot',
  'tompkins-square-park-conservancy',
  'childrens-aid',
  'east-village-community-coalition',
];

// ─── Step 2: Updated opportunity signup URLs ──────────────────────────────────
//
// These map (org_slug + title) → verified direct registration URL.
// All URLs manually confirmed against each org's website.

interface OppUpdate {
  orgSlug: string;
  title: string;
  signupUrl: string;
  summary?: string;          // override if we have better wording
  schedule?: string;         // override if we found the real schedule
  minAge?: number;           // confirmed from site
}

const OPP_UPDATES: OppUpdate[] = [
  // ── The Bowery Mission ──────────────────────────────────────────────────────
  {
    orgSlug: 'bowery-mission',
    title: 'Serve a Meal',
    signupUrl: 'https://bowery.volunteerhub.com/',
    summary: 'Help prepare and serve hot meals to guests experiencing homelessness at The Bowery Mission. No long-term commitment required — sign up for a single shift.',
    schedule: 'Daily morning and evening shifts',
    minAge: 18,
  },
  {
    orgSlug: 'bowery-mission',
    title: 'Clothing Room Assistant',
    signupUrl: 'https://bowery.volunteerhub.com/',
    summary: 'Sort donated clothing and assist guests in finding appropriate items. Sign up via VolunteerHub.',
    schedule: 'Weekdays',
    minAge: 18,
  },

  // ── Henry Street Settlement ──────────────────────────────────────────────────
  {
    orgSlug: 'henry-street-settlement',
    title: 'After-School Tutor',
    signupUrl: 'https://www.henrystreet.org/individual-volunteers/',
    summary: 'Tutor elementary and middle school students in math, reading, and science at Henry Street\'s Lower East Side community center. Complete the volunteer registration form on their site to get started.',
    schedule: 'Mon–Fri, 3–6pm',
  },
  {
    orgSlug: 'henry-street-settlement',
    title: 'Produce Pantry Volunteer',
    signupUrl: 'https://www.henrystreet.org/individual-volunteers/',
    summary: 'Pack fresh produce boxes for families in need at Henry Street\'s food pantry. Register online and the volunteer coordinator will match you to available shifts.',
    schedule: 'Weekdays — contact for times',
  },

  // ── New York Cares ───────────────────────────────────────────────────────────
  {
    orgSlug: 'new-york-cares',
    title: 'Browse East Village Volunteer Projects',
    signupUrl: 'https://www.newyorkcares.org/volunteer',
    summary: 'New York Cares connects volunteers to hundreds of projects across NYC. Create a free account and complete a short online orientation, then filter by East Village ZIP codes (10003, 10009, 10002) to find shifts near you.',
    schedule: 'Flexible — hundreds of projects available',
  },

  // ── Breaking Ground ──────────────────────────────────────────────────────────
  {
    orgSlug: 'breaking-ground',
    title: 'Group Street Outreach Support',
    signupUrl: 'https://breakingground.org/volunteer',
    summary: 'Breaking Ground\'s volunteer program primarily serves corporate and community groups. Individual spots are limited — contact them directly to inquire about current availability for street outreach and meal service support.',
    schedule: 'Evening shifts — contact for availability',
  },

  // ── God's Love We Deliver ────────────────────────────────────────────────────
  {
    orgSlug: 'gods-love-we-deliver',
    title: 'Meal Delivery Driver or Cyclist',
    signupUrl: 'https://glwd.volunteerhub.com/events/index',
    summary: 'Deliver home-cooked meals by car to homebound New Yorkers who are too ill to cook for themselves. Must have your own vehicle. Sign up directly via VolunteerHub.',
    schedule: 'Mon–Fri, 10am–1pm',
  },
  {
    orgSlug: 'gods-love-we-deliver',
    title: 'Kitchen Volunteer',
    signupUrl: 'https://glwd.volunteerhub.com/events/index',
    summary: 'Help prepare hundreds of medically tailored meals each day in the God\'s Love kitchen in SoHo. No cooking experience required. Sign up directly via VolunteerHub.',
    schedule: 'Mon–Fri, 6:30–8:30am or afternoon sessions',
  },

  // ── LGBT Community Center ────────────────────────────────────────────────────
  {
    orgSlug: 'lgbt-community-center',
    title: 'Community Events Volunteer',
    signupUrl: 'https://www.tfaforms.com/5190814',
    summary: 'Help bring art, advocacy, wellness, and celebration events to life at The Center. Fill out the volunteer interest form directly — The Center will match you to upcoming events.',
    schedule: 'Evenings and weekends',
  },
  {
    orgSlug: 'lgbt-community-center',
    title: 'Young Leaders Program',
    signupUrl: 'https://connect.clickandpledge.com/w/Form/8412ae2f-9f8b-45fc-8d8b-4768c4b8ee3a',
    summary: 'Young queer and allied New Yorkers support The Center through fundraising, events, and community outreach. Apply directly via the Young Leaders registration form.',
    schedule: 'Ongoing — events throughout the year',
  },

  // ── Loisaida Inc. ────────────────────────────────────────────────────────────
  {
    orgSlug: 'loisaida-inc',
    title: 'Cultural Event Volunteer',
    signupUrl: 'https://loisaida.org/volunteer-internship/',
    summary: 'Support the annual Loisaida Festival and other cultural events celebrating Puerto Rican and Latino heritage in the East Village. Must be 18+. Fill out the volunteer/internship form directly.',
    schedule: 'Evenings and weekends — see event calendar',
    minAge: 18,
  },
];

async function run() {
  console.log('🔧 Starting opportunity data cleanup...\n');

  // ── 1. Unpublish invalid orgs ─────────────────────────────────────────────
  console.log('📦 Unpublishing 4 invalid orgs...');
  for (const slug of REMOVE_SLUGS) {
    await d1Query(
      `UPDATE organizations SET status = 'draft' WHERE slug = ?`,
      [slug]
    );
    await d1Query(
      `UPDATE opportunities SET status = 'draft' WHERE org_id = (SELECT id FROM organizations WHERE slug = ?)`,
      [slug]
    );
    console.log(`  ✗  Unpublished: ${slug}`);
  }

  // ── 2. Delete DOROT opportunities (wrong org) ─────────────────────────────
  // More aggressive than draft for the clearly-wrong-org case
  console.log('\n🗑  Removing DOROT opportunities (wrong org in DB)...');
  await d1Query(
    `DELETE FROM opportunities WHERE org_id = (SELECT id FROM organizations WHERE slug = 'dorot')`,
    []
  );
  console.log('  ✓  DOROT opportunities removed');

  // ── 3. Remove old "Front Desk & Community Welcome" (replaced by better opp) ─
  // The old opportunity had a vague description — we're replacing with specific ones
  console.log('\n🔄  Removing placeholder LGBT Center opportunity...');
  await d1Query(
    `DELETE FROM opportunities
     WHERE title = 'Front Desk & Community Welcome'
       AND org_id = (SELECT id FROM organizations WHERE slug = 'lgbt-community-center')`,
    []
  );

  // ── 4. Remove old Breaking Ground "Street Outreach Team Support" (wrong) ──
  await d1Query(
    `DELETE FROM opportunities
     WHERE title = 'Street Outreach Team Support'
       AND org_id = (SELECT id FROM organizations WHERE slug = 'breaking-ground')`,
    []
  );

  // ── 5. Upsert corrected opportunities ─────────────────────────────────────
  console.log('\n✏️  Updating opportunity signup URLs and summaries...');
  for (const upd of OPP_UPDATES) {
    const orgRows = await d1Query(
      `SELECT id FROM organizations WHERE slug = ?`,
      [upd.orgSlug]
    );
    if (orgRows.length === 0) {
      console.log(`  ⚠  Org not found: ${upd.orgSlug} — skipping`);
      continue;
    }
    const orgId = orgRows[0].id as number;

    // Check if opportunity already exists
    const existing = await d1Query(
      `SELECT id FROM opportunities WHERE org_id = ? AND title = ?`,
      [orgId, upd.title]
    );

    if (existing.length > 0) {
      // Update existing
      await d1Query(
        `UPDATE opportunities
         SET signup_url = ?,
             summary    = COALESCE(?, summary),
             schedule   = COALESCE(?, schedule),
             min_age    = COALESCE(?, min_age),
             status     = 'published'
         WHERE org_id = ? AND title = ?`,
        [
          upd.signupUrl,
          upd.summary ?? null,
          upd.schedule ?? null,
          upd.minAge ?? null,
          orgId,
          upd.title,
        ]
      );
      console.log(`  ✓  Updated: ${upd.orgSlug} / ${upd.title}`);
    } else {
      // Insert new
      await d1Query(
        `INSERT INTO opportunities (org_id, title, summary, categories, commitment, schedule, signup_url, min_age, is_remote, source, status)
         SELECT o.id, ?, ?, '', '', ?, ?, ?, 0, 'manual', 'published'
         FROM organizations o WHERE o.slug = ?`,
        [
          upd.title,
          upd.summary ?? '',
          upd.schedule ?? null,
          upd.signupUrl,
          upd.minAge ?? null,
          upd.orgSlug,
        ]
      );
      console.log(`  ✓  Inserted: ${upd.orgSlug} / ${upd.title}`);
    }
  }

  // ── 6. Final count ────────────────────────────────────────────────────────
  const orgCount = await d1Query(
    `SELECT COUNT(*) as n FROM organizations WHERE status = 'published'`,
    []
  );
  const oppCount = await d1Query(
    `SELECT COUNT(*) as n FROM opportunities WHERE status = 'published'`,
    []
  );

  console.log(`\n✅ Done.`);
  console.log(`   Published orgs:         ${(orgCount[0] as any).n}`);
  console.log(`   Published opportunities: ${(oppCount[0] as any).n}`);
}

run().catch((err) => { console.error(err); process.exit(1); });
