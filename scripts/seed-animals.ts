// Animal-focused nonprofit seed for CityServ.
// Covers Manhattan and citywide orgs with volunteer programs accessible from Lower Manhattan.
// Run: npm run seed:animals
// Requires .env with CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_API_TOKEN.

import { d1Query } from './lib/d1';

interface OrgSeed {
  slug: string;
  name: string;
  website: string;
  email?: string;
  ein?: string;
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
    slug: 'animal-haven',
    name: 'Animal Haven',
    website: 'https://www.animalhaven.org',
    email: 'info@animalhaven.org',
    ein: '13-6188605',
    description: 'Animal Haven is a no-kill shelter and rescue located in SoHo/Tribeca, caring for homeless cats and dogs in New York City. Volunteers help with socialization, adoption events, foster care, and administrative support.',
    mission: 'To provide loving care and permanent homes for homeless cats and dogs, and to promote animal welfare through education and community outreach.',
    addressLine1: '200 Centre St',
    city: 'New York',
    state: 'NY',
    zip: '10013',
    lat: 40.7181,
    lon: -74.0028,
    neighborhood: 'Tribeca / SoHo',
    categories: 'animals',
    adminVerifiedBy: 'Wolfgang White',
  },
  {
    slug: 'aspca-nyc',
    name: 'ASPCA',
    website: 'https://www.aspca.org/take-action/volunteer',
    email: 'volunteer@aspca.org',
    ein: '13-1623829',
    description: 'The American Society for the Prevention of Cruelty to Animals (ASPCA) is one of the largest humane societies in the world. NYC volunteers support animal care, rehabilitation, community outreach, and humane law enforcement programs.',
    mission: 'To provide effective means for the prevention of cruelty to animals throughout the United States.',
    addressLine1: '424 E 92nd St',
    city: 'New York',
    state: 'NY',
    zip: '10128',
    lat: 40.7797,
    lon: -73.9476,
    neighborhood: 'Upper East Side / citywide',
    categories: 'animals',
    adminVerifiedBy: 'Wolfgang White',
  },
  {
    slug: 'anjellicle-cats-rescue',
    name: 'Anjellicle Cats Rescue',
    website: 'https://www.anjellicle.org',
    email: 'info@anjellicle.org',
    description: 'Anjellicle Cats Rescue is a volunteer-run, no-kill cat rescue operating primarily in Manhattan including the East Village. Volunteers foster cats, transport animals, assist at adoption events, and help with trap-neuter-return programs.',
    mission: 'To rescue, rehabilitate, and rehome cats in New York City while reducing the feral cat population through trap-neuter-return.',
    addressLine1: '547 E 11th St',
    city: 'New York',
    state: 'NY',
    zip: '10009',
    lat: 40.7272,
    lon: -73.9775,
    neighborhood: 'East Village',
    categories: 'animals',
    adminVerifiedBy: 'Wolfgang White',
  },
  {
    slug: 'little-wanderers-nyc',
    name: 'Little Wanderers NYC',
    website: 'https://littlewanderersnyc.com',
    email: 'volunteer@littlewanderersnyc.com',
    description: 'Little Wanderers NYC is a foster-based rescue pulling dogs and cats from shelters across the tri-state area. Volunteers foster animals in their homes, assist at weekend adoption events in Manhattan, and provide transport support.',
    mission: 'To save the lives of animals in shelters by placing them in loving foster and forever homes across New York City.',
    addressLine1: '127 W 26th St',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    lat: 40.7462,
    lon: -73.9946,
    neighborhood: 'Chelsea / citywide',
    categories: 'animals',
    adminVerifiedBy: 'Wolfgang White',
  },
  {
    slug: 'mayors-alliance-nyc-animals',
    name: "Mayor's Alliance for NYC's Animals",
    website: 'https://www.animalalliancenyc.org',
    email: 'info@animalalliancenyc.org',
    ein: '20-0285726',
    description: "The Mayor's Alliance for NYC's Animals coordinates a citywide network of rescue groups, shelters, and volunteers to reduce euthanasia and support the humane treatment of homeless animals in all five boroughs.",
    mission: "To make New York City a no-kill city through collaboration, resource sharing, and community engagement.",
    addressLine1: '244 5th Ave Suite 2722',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    lat: 40.7459,
    lon: -73.9883,
    neighborhood: 'Flatiron / citywide',
    categories: 'animals',
    adminVerifiedBy: 'Wolfgang White',
  },
  {
    slug: 'second-chance-rescue-nyc',
    name: 'Second Chance Rescue NYC',
    website: 'https://www.secondchancerescuenyc.com',
    email: 'volunteer@secondchancerescuenyc.com',
    description: 'Second Chance Rescue NYC is a 501(c)(3) rescue pulling high-risk animals from shelters in NYC and surrounding areas. Volunteers foster dogs and cats, drive transports, assist at adoption events in the city, and help with fundraising.',
    mission: 'To give every dog and cat in a New York City shelter a second chance at a loving home.',
    addressLine1: '22 W 23rd St',
    city: 'New York',
    state: 'NY',
    zip: '10010',
    lat: 40.7440,
    lon: -73.9937,
    neighborhood: 'Flatiron / citywide',
    categories: 'animals',
    adminVerifiedBy: 'Wolfgang White',
  },
  {
    slug: 'wild-bird-fund',
    name: 'Wild Bird Fund',
    website: 'https://www.wildbirdfund.org',
    email: 'volunteer@wildbirdfund.org',
    ein: '26-2518129',
    description: 'The Wild Bird Fund is NYC\'s only wildlife rehabilitation center, caring for injured and orphaned wild birds and other urban wildlife. Volunteers assist with animal care, transport, public education, and front-desk support.',
    mission: 'To rehabilitate injured, sick, and orphaned wildlife and return them to the wild, while promoting the coexistence of people and wildlife in New York City.',
    addressLine1: '565 Columbus Ave',
    city: 'New York',
    state: 'NY',
    zip: '10024',
    lat: 40.7827,
    lon: -73.9754,
    neighborhood: 'Upper West Side',
    categories: 'animals,wildlife',
    adminVerifiedBy: 'Wolfgang White',
  },
  {
    slug: 'stray-from-the-heart',
    name: 'Stray from the Heart',
    website: 'https://www.strayfromtheheart.org',
    email: 'info@strayfromtheheart.org',
    ein: '27-1830386',
    description: 'Stray from the Heart is a NYC-based rescue saving dogs from kill shelters in the South and Puerto Rico. Volunteers help with weekend adoption events in Manhattan, foster care, home visits, and transport from the airport or bus stops.',
    mission: 'To save dogs from euthanasia and find them loving forever homes in New York City and beyond.',
    addressLine1: '285 W Broadway',
    city: 'New York',
    state: 'NY',
    zip: '10013',
    lat: 40.7213,
    lon: -74.0062,
    neighborhood: 'Tribeca / SoHo',
    categories: 'animals',
    adminVerifiedBy: 'Wolfgang White',
  },
];

const opps: OppSeed[] = [
  // Animal Haven
  {
    orgSlug: 'animal-haven',
    title: 'Cat Socialization Volunteer',
    summary: 'Spend time with shelter cats to help them become comfortable around people and improve their chances of adoption. Includes playtime, grooming, and observation for behavior notes.',
    categories: 'animals',
    commitment: '2–4 hours/week',
    schedule: 'Flexible, 7 days a week',
    signupUrl: 'https://www.animalhaven.org/volunteer/',
    isRemote: 0,
  },
  {
    orgSlug: 'animal-haven',
    title: 'Adoption Event Assistant',
    summary: 'Help staff off-site adoption events around Manhattan — set up kennels and crates, assist potential adopters, and care for animals during the event.',
    categories: 'animals',
    commitment: 'Events on weekends',
    schedule: 'Saturday and Sunday events',
    signupUrl: 'https://www.animalhaven.org/volunteer/',
    isRemote: 0,
  },

  // ASPCA
  {
    orgSlug: 'aspca-nyc',
    title: 'Animal Care Volunteer',
    summary: 'Provide enrichment and socialization to dogs and cats awaiting adoption. Tasks include walking dogs, socializing cats, and assisting animal care staff with feeding and cleaning.',
    categories: 'animals',
    commitment: '4 hours/week minimum',
    schedule: 'Weekday and weekend shifts available',
    signupUrl: 'https://www.aspca.org/take-action/volunteer',
    isRemote: 0,
  },
  {
    orgSlug: 'aspca-nyc',
    title: 'Community Outreach Volunteer',
    summary: 'Assist the ASPCA\'s community programs by staffing outreach events, distributing pet food, and connecting low-income pet owners with veterinary resources.',
    categories: 'animals,community',
    commitment: 'Flexible, event-based',
    schedule: 'Various dates throughout the year',
    signupUrl: 'https://www.aspca.org/take-action/volunteer',
    isRemote: 0,
  },

  // Anjellicle Cats Rescue
  {
    orgSlug: 'anjellicle-cats-rescue',
    title: 'Cat Foster Parent',
    summary: 'Open your home to cats awaiting adoption. Anjellicle provides food, supplies, and vet care — you provide the love. Great for East Village residents with flexible schedules.',
    categories: 'animals',
    commitment: '2–8 weeks per cat',
    schedule: 'Ongoing, flexible',
    signupUrl: 'https://www.anjellicle.org/volunteer',
    isRemote: 0,
  },
  {
    orgSlug: 'anjellicle-cats-rescue',
    title: 'TNR (Trap-Neuter-Return) Volunteer',
    summary: 'Help manage feral cat colonies in the East Village and Lower East Side through trap-neuter-return programs. Training provided. Makes a real dent in the neighborhood\'s stray cat population.',
    categories: 'animals',
    commitment: 'Flexible',
    schedule: 'Evening and early morning trapping sessions',
    signupUrl: 'https://www.anjellicle.org/tnr',
    isRemote: 0,
  },

  // Little Wanderers
  {
    orgSlug: 'little-wanderers-nyc',
    title: 'Dog or Cat Foster',
    summary: 'Foster a dog or cat pulled from a high-risk shelter situation. Little Wanderers covers all vet costs and provides supplies. Fosters in Manhattan are always needed.',
    categories: 'animals',
    commitment: '2 weeks to 2 months',
    schedule: 'Ongoing',
    signupUrl: 'https://littlewanderersnyc.com/volunteer',
    isRemote: 0,
  },
  {
    orgSlug: 'little-wanderers-nyc',
    title: 'Weekend Adoption Event Staff',
    summary: 'Help run adoption events in Chelsea and other Manhattan neighborhoods on weekends. Greet adopters, assist with paperwork, and provide care for the animals on display.',
    categories: 'animals',
    commitment: '4–6 hours per event',
    schedule: 'Saturdays and Sundays',
    signupUrl: 'https://littlewanderersnyc.com/volunteer',
    isRemote: 0,
  },

  // Mayor's Alliance
  {
    orgSlug: 'mayors-alliance-nyc-animals',
    title: 'Animal Transport Driver',
    summary: 'Drive animals between rescue partners, foster homes, vet clinics, and adoption events across NYC. A car is not required — you can also assist with subway/taxi transport for smaller animals.',
    categories: 'animals',
    commitment: 'Flexible, as available',
    schedule: 'Weekdays and weekends',
    signupUrl: 'https://www.animalalliancenyc.org/volunteer',
    isRemote: 0,
  },

  // Second Chance Rescue
  {
    orgSlug: 'second-chance-rescue-nyc',
    title: 'Foster a Rescue Dog or Cat',
    summary: 'Provide a safe and loving temporary home for a rescue animal until they find their forever family. Second Chance covers all medical expenses and provides supplies.',
    categories: 'animals',
    commitment: '2 weeks to several months',
    schedule: 'Ongoing, flexible',
    signupUrl: 'https://www.secondchancerescuenyc.com/volunteer',
    isRemote: 0,
  },
  {
    orgSlug: 'second-chance-rescue-nyc',
    title: 'Adoption Event Coordinator Helper',
    summary: 'Assist at Saturday adoption events at PetSmart and Petco locations in Manhattan. Help set up, greet potential adopters, handle the animals, and break down at the end.',
    categories: 'animals',
    commitment: '5–6 hours on Saturdays',
    schedule: 'Saturdays, various locations',
    signupUrl: 'https://www.secondchancerescuenyc.com/volunteer',
    isRemote: 0,
  },

  // Wild Bird Fund
  {
    orgSlug: 'wild-bird-fund',
    title: 'Wildlife Rehabilitation Assistant',
    summary: 'Help care for injured and orphaned wild birds and other urban wildlife at NYC\'s only wildlife rehab center. Tasks include feeding, cleaning enclosures, and assisting with intake.',
    categories: 'animals,wildlife',
    commitment: '4 hours/week minimum',
    schedule: 'Morning and afternoon shifts, 7 days a week',
    signupUrl: 'https://www.wildbirdfund.org/volunteer/',
    isRemote: 0,
  },
  {
    orgSlug: 'wild-bird-fund',
    title: 'Animal Intake and Front Desk Volunteer',
    summary: 'Greet members of the public bringing in injured wildlife, answer questions, process intake paperwork, and provide basic triage support under staff supervision.',
    categories: 'animals,wildlife',
    commitment: '3–4 hours per shift',
    schedule: 'Flexible shifts available',
    signupUrl: 'https://www.wildbirdfund.org/volunteer/',
    isRemote: 0,
  },

  // Stray from the Heart
  {
    orgSlug: 'stray-from-the-heart',
    title: 'Rescue Dog Foster',
    summary: 'Foster a dog flown in from a Southern shelter or Puerto Rico while they wait for their forever home. Stray from the Heart covers all vet care and provides guidance throughout.',
    categories: 'animals',
    commitment: '2 weeks to 2 months',
    schedule: 'Ongoing',
    signupUrl: 'https://www.strayfromtheheart.org/volunteer',
    isRemote: 0,
  },
  {
    orgSlug: 'stray-from-the-heart',
    title: 'Adoption Event Volunteer',
    summary: 'Join the team at weekly adoption events in Tribeca and SoHo. Help potential adopters meet dogs, assist with paperwork, and provide enrichment for the pups during the event.',
    categories: 'animals',
    commitment: '3–5 hours on weekends',
    schedule: 'Saturdays and Sundays',
    signupUrl: 'https://www.strayfromtheheart.org/volunteer',
    isRemote: 0,
  },
];

// ── helpers ──────────────────────────────────────────────────────────────────

async function upsertOrg(org: OrgSeed): Promise<number> {
  const existing = await d1Query('SELECT id FROM organizations WHERE slug = ?', [org.slug]);
  if (existing.length > 0) {
    console.log(`  skip org: ${org.slug}`);
    return existing[0].id as number;
  }
  await d1Query(
    `INSERT INTO organizations
       (slug, name, website, email, ein, description, mission,
        address_line1, city, state, zip, lat, lon,
        neighborhood, categories, status,
        is_irs_501c3, admin_verified_by, reputability_cached)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 1, ?, 70)`,
    [
      org.slug, org.name, org.website, org.email ?? null, org.ein ?? null,
      org.description, org.mission,
      org.addressLine1, org.city, org.state, org.zip, org.lat, org.lon,
      org.neighborhood, org.categories,
      org.adminVerifiedBy,
    ],
  );
  const row = await d1Query('SELECT id FROM organizations WHERE slug = ?', [org.slug]);
  console.log(`  added org: ${org.slug} (id ${row[0].id})`);
  return row[0].id as number;
}

async function upsertOpp(opp: OppSeed, orgIdMap: Map<string, number>): Promise<void> {
  const orgId = orgIdMap.get(opp.orgSlug);
  if (!orgId) throw new Error(`Unknown org slug: ${opp.orgSlug}`);
  const existing = await d1Query(
    'SELECT id FROM opportunities WHERE org_id = ? AND title = ?',
    [orgId, opp.title],
  );
  if (existing.length > 0) {
    console.log(`    skip opp: ${opp.title}`);
    return;
  }
  await d1Query(
    `INSERT INTO opportunities
       (org_id, title, summary, categories, commitment, schedule,
        signup_url, is_remote, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published')`,
    [
      orgId, opp.title, opp.summary, opp.categories,
      opp.commitment, opp.schedule ?? null,
      opp.signupUrl, opp.isRemote,
    ],
  );
  console.log(`    added opp: ${opp.title}`);
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Seeding animal organizations…');
  const orgIdMap = new Map<string, number>();
  for (const org of orgs) {
    const id = await upsertOrg(org);
    orgIdMap.set(org.slug, id);
  }
  console.log(`\nSeeding opportunities…`);
  for (const opp of opps) {
    await upsertOpp(opp, orgIdMap);
  }
  console.log(`\nDone. ${orgs.length} orgs, ${opps.length} opportunities.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
