// East Village MVP seed — 11 hand-curated organizations + opportunities.
// Run: npm run seed
// Requires .env with CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_API_TOKEN.

import { d1Query } from './lib/d1';

interface OrgSeed {
  slug: string;
  name: string;
  website: string;
  email?: string;
  description: string;
  mission: string;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lon: number;
  neighborhood: string;
  categories: string;
  adminVerifiedBy: string;
}

interface OppSeed {
  orgSlug: string;
  title: string;
  summary: string;
  categories: string;
  commitment: string;
  schedule?: string;
  signupUrl: string;
  isRemote: number;
}

const orgs: OrgSeed[] = [
  {
    slug: 'dorot',
    name: 'DOROT',
    website: 'https://www.dorot.org',
    email: 'info@dorot.org',
    description: 'DOROT combats the epidemic of senior isolation by creating community for older adults and providing services that help them live independently. Volunteers visit, call, and assist seniors across Manhattan including the East Village.',
    mission: 'To combat senior isolation and help older adults live independently.',
    addressLine1: '171 W 85th St',
    city: 'New York',
    state: 'NY',
    zip: '10024',
    lat: 40.7866,
    lon: -73.9763,
    neighborhood: 'Upper West Side / citywide',
    categories: 'seniors',
    adminVerifiedBy: 'Wolfgang White',
  },
  {
    slug: 'bowery-mission',
    name: 'The Bowery Mission',
    website: 'https://www.bowery.org',
    email: 'volunteer@bowery.org',
    description: 'The Bowery Mission has served New York\'s homeless and hungry since 1879, offering meals, shelter, clothing, medical care, addiction recovery, job training, and transitional housing from its historic Lower East Side location.',
    mission: 'To serve people experiencing homelessness and poverty in New York City.',
    addressLine1: '227 Bowery',
    city: 'New York',
    state: 'NY',
    zip: '10002',
    lat: 40.7209,
    lon: -73.9938,
    neighborhood: 'Lower East Side',
    categories: 'homelessness & housing,food & hunger',
    adminVerifiedBy: 'Wolfgang White',
  },
  {
    slug: 'henry-street-settlement',
    name: 'Henry Street Settlement',
    website: 'https://www.henrystreet.org',
    email: 'volunteer@henrystreet.org',
    description: 'Henry Street Settlement has been a cornerstone of the Lower East Side since 1895, providing social services, arts programming, and community advocacy to neighbors of all ages.',
    mission: 'To empower Lower East Side residents through social services, arts, and advocacy.',
    addressLine1: '265 Henry St',
    city: 'New York',
    state: 'NY',
    zip: '10002',
    lat: 40.7136,
    lon: -73.9897,
    neighborhood: 'Lower East Side',
    categories: 'children & youth,homelessness & housing,arts & culture',
    adminVerifiedBy: 'Wolfgang White',
  },
  {
    slug: 'new-york-cares',
    name: 'New York Cares',
    website: 'https://www.newyorkcares.org',
    email: 'volunteer@newyorkcares.org',
    description: 'New York Cares is the city\'s largest volunteer network, connecting New Yorkers with over 1,000 projects each month. Volunteers can find East Village–area shifts through the online portal.',
    mission: 'To mobilize volunteers to serve communities across New York City.',
    addressLine1: '28 W 23rd St',
    city: 'New York',
    state: 'NY',
    zip: '10010',
    lat: 40.7425,
    lon: -73.9929,
    neighborhood: 'Citywide',
    categories: 'children & youth,seniors,food & hunger,environment',
    adminVerifiedBy: 'Wolfgang White',
  },
  {
    slug: 'breaking-ground',
    name: 'Breaking Ground',
    website: 'https://breakingground.org',
    email: 'volunteer@breakingground.org',
    description: 'Breaking Ground (formerly Common Ground) is one of New York\'s leading providers of supportive housing and street outreach for people experiencing homelessness, with properties across NYC including the East Village.',
    mission: 'To end street homelessness in New York City through housing and outreach.',
    addressLine1: '505 Eighth Ave',
    city: 'New York',
    state: 'NY',
    zip: '10018',
    lat: 40.7510,
    lon: -73.9942,
    neighborhood: 'Citywide / East Village',
    categories: 'homelessness & housing',
    adminVerifiedBy: 'Wolfgang White',
  },
  {
    slug: 'tompkins-square-park-conservancy',
    name: 'Tompkins Square Park Conservancy',
    website: 'https://www.nycgovparks.org/park-features/tompkins-square-park',
    description: 'The Tompkins Square Park Conservancy organizes volunteer cleanup days, plantings, and community events to maintain and improve the East Village\'s beloved neighborhood park.',
    mission: 'To maintain and improve Tompkins Square Park as a green resource for East Village residents.',
    addressLine1: 'Tompkins Square Park, Ave A & E 10th St',
    city: 'New York',
    state: 'NY',
    zip: '10009',
    lat: 40.7267,
    lon: -73.9815,
    neighborhood: 'East Village',
    categories: 'environment,civic engagement',
    adminVerifiedBy: 'Wolfgang White',
  },
  {
    slug: 'childrens-aid',
    name: "Children's Aid",
    website: 'https://www.childrensaidnyc.org',
    email: 'volunteer@childrensaidnyc.org',
    description: "Children's Aid has served New York City's most vulnerable children and families for over 170 years, providing education, health, and social services at community centers across the five boroughs including East Harlem and the Lower East Side.",
    mission: "To provide children in poverty the support they need to become self-sufficient adults.",
    addressLine1: '711 Third Ave',
    city: 'New York',
    state: 'NY',
    zip: '10017',
    lat: 40.7508,
    lon: -73.9749,
    neighborhood: 'Citywide',
    categories: 'children & youth,tutoring & education',
    adminVerifiedBy: 'Wolfgang White',
  },
  {
    slug: 'gods-love-we-deliver',
    name: "God's Love We Deliver",
    website: 'https://www.glwd.org',
    email: 'volunteer@glwd.org',
    description: "God's Love We Deliver cooks and home-delivers nutritious meals to New Yorkers who are too sick to shop or cook for themselves, regardless of income or illness. Over 7,000 volunteers help each year.",
    mission: 'To improve the health and well-being of New Yorkers living with serious illness by providing nutritious meals.',
    addressLine1: '166 Avenue of the Americas',
    city: 'New York',
    state: 'NY',
    zip: '10013',
    lat: 40.7268,
    lon: -74.0047,
    neighborhood: 'SoHo / citywide',
    categories: 'food & hunger,health & medical',
    adminVerifiedBy: 'Wolfgang White',
  },
  {
    slug: 'lgbt-community-center',
    name: 'The LGBT Community Center',
    website: 'https://gaycenter.org',
    email: 'volunteer@gaycenter.org',
    description: 'The LGBT Community Center has been at the heart of New York\'s LGBTQ+ community since 1983. Volunteers support programs in health, mental health, youth services, and arts — open to all.',
    mission: 'To foster a strong, vibrant LGBTQ+ community and connect diverse peoples through a commitment to wellness and justice.',
    addressLine1: '208 W 13th St',
    city: 'New York',
    state: 'NY',
    zip: '10011',
    lat: 40.7374,
    lon: -74.0004,
    neighborhood: 'West Village / East Village–adjacent',
    categories: 'LGBTQ+,mental health,health & medical',
    adminVerifiedBy: 'Wolfgang White',
  },
  {
    slug: 'east-village-community-coalition',
    name: 'East Village Community Coalition',
    website: 'https://www.evcc.nyc',
    description: 'The East Village Community Coalition advocates for the preservation and improvement of the East Village neighborhood through civic engagement, community organizing, and quality-of-life initiatives.',
    mission: 'To protect and enhance the quality of life in the East Village through civic advocacy.',
    addressLine1: 'P.O. Box 20223',
    city: 'New York',
    state: 'NY',
    zip: '10009',
    lat: 40.7264,
    lon: -73.9818,
    neighborhood: 'East Village',
    categories: 'civic engagement',
    adminVerifiedBy: 'Wolfgang White',
  },
  {
    slug: 'loisaida-inc',
    name: 'Loisaida Inc.',
    website: 'https://loisaida.org',
    email: 'info@loisaida.org',
    description: 'Loisaida Inc. is a cultural and community development organization rooted in the Loisaida / East Village neighborhood. It preserves the Puerto Rican and Latino heritage of the area through arts, education, and advocacy.',
    mission: 'To preserve, promote, and celebrate the cultural heritage and history of the Loisaida community.',
    addressLine1: '710 E 9th St',
    city: 'New York',
    state: 'NY',
    zip: '10009',
    lat: 40.7246,
    lon: -73.9788,
    neighborhood: 'East Village / Loisaida',
    categories: 'arts & culture,civic engagement,immigrants & refugees',
    adminVerifiedBy: 'Wolfgang White',
  },
];

const opportunities: OppSeed[] = [
  // DOROT
  {
    orgSlug: 'dorot',
    title: 'Senior Friendly Visiting',
    summary: 'Visit an isolated senior in their home for conversation and companionship, once a week.',
    categories: 'seniors',
    commitment: 'weekly',
    schedule: 'Flexible — weekday or weekend mornings',
    signupUrl: 'https://www.dorot.org/volunteer',
    isRemote: 0,
  },
  {
    orgSlug: 'dorot',
    title: 'Holiday Package Delivery',
    summary: 'Help pack and deliver holiday gift packages to seniors in the East Village and surrounding neighborhoods.',
    categories: 'seniors',
    commitment: '1 shift',
    schedule: 'November–December',
    signupUrl: 'https://www.dorot.org/volunteer',
    isRemote: 0,
  },
  // Bowery Mission
  {
    orgSlug: 'bowery-mission',
    title: 'Serve a Meal',
    summary: 'Help prepare and serve hot meals to guests experiencing homelessness at the historic Bowery location.',
    categories: 'homelessness & housing,food & hunger',
    commitment: '1 shift',
    schedule: 'Daily shifts — morning and evening',
    signupUrl: 'https://www.bowery.org/volunteer',
    isRemote: 0,
  },
  {
    orgSlug: 'bowery-mission',
    title: 'Clothing Room Assistant',
    summary: 'Sort donated clothing and assist guests in selecting appropriate items at the Bowery Mission clothing room.',
    categories: 'homelessness & housing',
    commitment: 'ongoing',
    schedule: 'Weekdays',
    signupUrl: 'https://www.bowery.org/volunteer',
    isRemote: 0,
  },
  // Henry Street Settlement
  {
    orgSlug: 'henry-street-settlement',
    title: 'After-School Tutor',
    summary: 'Tutor elementary and middle school students in math, reading, and science at the Henry Street community center.',
    categories: 'children & youth,tutoring & education',
    commitment: 'weekly',
    schedule: 'Mon–Fri, 3–6pm',
    signupUrl: 'https://www.henrystreet.org/volunteer',
    isRemote: 0,
  },
  // New York Cares
  {
    orgSlug: 'new-york-cares',
    title: 'Browse East Village Volunteer Projects',
    summary: 'New York Cares lists hundreds of volunteer projects — filter by East Village ZIP code (10003, 10009, 10002) to find shifts near you.',
    categories: 'children & youth,seniors,food & hunger',
    commitment: '1 shift',
    signupUrl: 'https://www.newyorkcares.org/volunteer',
    isRemote: 0,
  },
  // Breaking Ground
  {
    orgSlug: 'breaking-ground',
    title: 'Street Outreach Team Support',
    summary: 'Join a street outreach team to help connect people experiencing homelessness with shelter and services across Manhattan.',
    categories: 'homelessness & housing',
    commitment: 'weekly',
    schedule: 'Evening shifts',
    signupUrl: 'https://breakingground.org/volunteer',
    isRemote: 0,
  },
  // Tompkins Square Park Conservancy
  {
    orgSlug: 'tompkins-square-park-conservancy',
    title: 'Park Cleanup & Planting Day',
    summary: 'Join neighbors for a morning of weeding, planting, and litter cleanup in Tompkins Square Park.',
    categories: 'environment',
    commitment: '1 shift',
    schedule: 'Monthly Saturday mornings',
    signupUrl: 'https://www.nycgovparks.org/programs/rangers/stewardship',
    isRemote: 0,
  },
  // Children's Aid
  {
    orgSlug: 'childrens-aid',
    title: 'Homework Helper',
    summary: 'Help elementary school children with homework and reading at a Children\'s Aid after-school program.',
    categories: 'children & youth,tutoring & education',
    commitment: 'weekly',
    schedule: 'Weekday afternoons',
    signupUrl: 'https://www.childrensaidnyc.org/volunteer',
    isRemote: 0,
  },
  // God's Love We Deliver
  {
    orgSlug: 'gods-love-we-deliver',
    title: 'Meal Delivery Driver or Cyclist',
    summary: 'Deliver home-cooked meals by bike, car, or on foot to homebound New Yorkers who are too ill to cook for themselves.',
    categories: 'food & hunger,health & medical',
    commitment: '1 shift',
    schedule: 'Mon–Fri, morning routes',
    signupUrl: 'https://www.glwd.org/volunteer',
    isRemote: 0,
  },
  {
    orgSlug: 'gods-love-we-deliver',
    title: 'Kitchen Volunteer',
    summary: 'Help prepare hundreds of medically tailored meals each day in the God\'s Love kitchen in SoHo.',
    categories: 'food & hunger',
    commitment: '1 shift',
    schedule: 'Mon–Fri, 8am–1pm or 1pm–5pm',
    signupUrl: 'https://www.glwd.org/volunteer',
    isRemote: 0,
  },
  // LGBT Community Center
  {
    orgSlug: 'lgbt-community-center',
    title: 'Front Desk & Community Welcome',
    summary: 'Greet visitors, answer questions, and help community members navigate Center programs and resources.',
    categories: 'LGBTQ+',
    commitment: 'weekly',
    schedule: 'Evenings and weekends',
    signupUrl: 'https://gaycenter.org/volunteer',
    isRemote: 0,
  },
  // East Village Community Coalition
  {
    orgSlug: 'east-village-community-coalition',
    title: 'Community Meeting Volunteer',
    summary: 'Help organize and facilitate community board meetings, neighborhood surveys, and civic events in the East Village.',
    categories: 'civic engagement',
    commitment: 'ongoing',
    schedule: 'Monthly meetings + event days',
    signupUrl: 'https://www.evcc.nyc/volunteer',
    isRemote: 0,
  },
  // Loisaida Inc.
  {
    orgSlug: 'loisaida-inc',
    title: 'Cultural Event Volunteer',
    summary: 'Support festivals, art exhibitions, and cultural events celebrating the Puerto Rican and Latino heritage of Loisaida.',
    categories: 'arts & culture,immigrants & refugees',
    commitment: '1 shift',
    schedule: 'Evenings and weekends — see calendar',
    signupUrl: 'https://loisaida.org/volunteer',
    isRemote: 0,
  },
];

async function upsertOrg(org: OrgSeed): Promise<number> {
  // Check if org already exists
  const existing = await d1Query(
    'SELECT id FROM organizations WHERE slug = ?',
    [org.slug]
  );

  if (existing.length > 0) {
    console.log(`  ↩  ${org.name} already exists — skipping`);
    return existing[0].id as number;
  }

  await d1Query(
    `INSERT INTO organizations
      (slug, name, website, email, description, mission,
       address_line1, city, state, zip, lat, lon,
       neighborhood, categories, admin_verified_by, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')`,
    [
      org.slug, org.name, org.website, org.email ?? null,
      org.description, org.mission,
      org.addressLine1, org.city, org.state, org.zip,
      org.lat, org.lon,
      org.neighborhood, org.categories, org.adminVerifiedBy,
    ]
  );

  const row = await d1Query('SELECT id FROM organizations WHERE slug = ?', [org.slug]);
  console.log(`  ✓  Inserted ${org.name} (id=${row[0].id})`);
  return row[0].id as number;
}

async function upsertOpp(opp: OppSeed, orgIdMap: Map<string, number>): Promise<void> {
  const orgId = orgIdMap.get(opp.orgSlug);
  if (!orgId) throw new Error(`Unknown org slug: ${opp.orgSlug}`);

  const existing = await d1Query(
    'SELECT id FROM opportunities WHERE org_id = ? AND title = ?',
    [orgId, opp.title]
  );
  if (existing.length > 0) {
    console.log(`    ↩  "${opp.title}" already exists — skipping`);
    return;
  }

  await d1Query(
    `INSERT INTO opportunities
      (org_id, title, summary, categories, commitment, schedule,
       signup_url, is_remote, source, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'manual', 'published')`,
    [
      orgId, opp.title, opp.summary, opp.categories,
      opp.commitment, opp.schedule ?? null,
      opp.signupUrl, opp.isRemote,
    ]
  );
  console.log(`    ✓  "${opp.title}"`);
}

async function main() {
  console.log('🌱 Seeding East Village organizations...\n');

  const orgIdMap = new Map<string, number>();
  for (const org of orgs) {
    const id = await upsertOrg(org);
    orgIdMap.set(org.slug, id);
  }

  console.log('\n🌱 Seeding opportunities...\n');
  for (const opp of opportunities) {
    await upsertOpp(opp, orgIdMap);
  }

  console.log(`\n✅ Seed complete. ${orgs.length} orgs, ${opportunities.length} opportunities.`);
  console.log('Run "npm run refresh" to enrich with ProPublica/IRS/AmeriCorps data.\n');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
