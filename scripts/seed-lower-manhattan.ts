// Lower Manhattan seed — 50 hand-curated organizations spanning East Village,
// Lower East Side, Chinatown, Two Bridges, SoHo, Tribeca, the Seaport, and FiDi.
// Run: npx tsx scripts/seed-lower-manhattan.ts
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

  // ── East Village / Loisaida ──────────────────────────────────────────────────

  {
    slug: 'cooper-square-committee',
    name: 'Cooper Square Committee',
    website: 'https://coopersquare.org',
    email: 'csc@coopersquare.org',
    description: 'Founded in 1959, Cooper Square Committee is a tenants\' rights and community development organization protecting affordable housing and cultural spaces in the East Village and Lower East Side. It also runs the Cooper Square Mutual Housing Association and hosts free theater arts classes for adults.',
    mission: 'To preserve affordable housing and community spaces, and maintain the racial and economic diversity of the Lower East Side and East Village.',
    addressLine1: '61 E 4th St',
    city: 'New York',
    state: 'NY',
    zip: '10003',
    lat: 40.7264,
    lon: -73.9913,
    neighborhood: 'East Village',
    categories: 'homelessness & housing,civic engagement,arts & culture',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'third-street-music-school',
    name: 'Third Street Music School Settlement',
    website: 'https://www.thirdstreet.nyc',
    email: 'info@thirdstreet.nyc',
    description: 'Founded in 1894, Third Street Music School Settlement is the oldest community music school in the United States. It provides high-quality, affordable music and dance education to students of all ages, backgrounds, and abilities in the East Village and beyond.',
    mission: 'To provide high-quality, affordable music and dance education to New Yorkers of all ages, backgrounds, and abilities.',
    addressLine1: '235 E 11th St',
    city: 'New York',
    state: 'NY',
    zip: '10003',
    lat: 40.7291,
    lon: -73.9822,
    neighborhood: 'East Village',
    categories: 'arts & culture,children & youth,tutoring & education',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'fabnyc',
    name: 'Fourth Arts Block (FABnyc)',
    website: 'https://www.fabnyc.org',
    email: 'info@fabnyc.org',
    description: 'FABnyc is the leadership organization for the East 4th Street cultural corridor, one of the densest concentrations of nonprofit arts organizations in NYC. It advocates for arts infrastructure, produces community programs, and connects neighbors with 20+ resident cultural groups.',
    mission: 'To build a thriving arts ecosystem on the East Village\'s Fourth Street corridor through advocacy, convening, and community programming.',
    addressLine1: '97 E 4th St',
    city: 'New York',
    state: 'NY',
    zip: '10003',
    lat: 40.7259,
    lon: -73.9908,
    neighborhood: 'East Village',
    categories: 'arts & culture,civic engagement',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'lower-eastside-girls-club',
    name: 'The Lower Eastside Girls Club',
    website: 'https://www.girlsclub.org',
    email: 'volunteer@girlsclub.org',
    description: 'Since 1996, the Lower Eastside Girls Club has offered free, year-round programming in STEM, visual arts, digital media, performing arts, wellness, and civic leadership to young women and gender-expansive youth of color in the East Village and Lower East Side.',
    mission: 'To connect young women and gender-expansive youth of color to healthy and successful futures through free, innovative programming and mentoring.',
    addressLine1: '402 E 8th St',
    city: 'New York',
    state: 'NY',
    zip: '10009',
    lat: 40.7243,
    lon: -73.9800,
    neighborhood: 'East Village',
    categories: 'children & youth,arts & culture,tutoring & education',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'goles',
    name: 'GOLES (Good Old Lower East Side)',
    website: 'https://www.goles.org',
    description: 'GOLES has been a neighborhood housing and preservation organization serving the Lower East Side since 1977. It fights displacement through tenant organizing, housing counseling, affordable housing advocacy, and community development.',
    mission: 'To preserve the Lower East Side as a diverse, affordable community through tenant organizing and housing advocacy.',
    addressLine1: '173 Avenue B',
    city: 'New York',
    state: 'NY',
    zip: '10009',
    lat: 40.7254,
    lon: -73.9775,
    neighborhood: 'East Village / Loisaida',
    categories: 'homelessness & housing,civic engagement',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'nuyorican-poets-cafe',
    name: 'Nuyorican Poets Cafe',
    website: 'https://www.nuyorican.org',
    description: 'Founded in 1973, the Nuyorican Poets Cafe is a legendary nonprofit arts venue rooted in the Puerto Rican and Afro-Caribbean cultural tradition of the Lower East Side. It hosts poetry slams, open mics, theater, and visual art, centering the voices of people of color and the working class. Currently undergoing building renovation.',
    mission: 'To nurture and celebrate the artistic traditions of Nuyorican and multicultural art forms, centering communities of color.',
    addressLine1: '236 E 3rd St',
    city: 'New York',
    state: 'NY',
    zip: '10009',
    lat: 40.7218,
    lon: -73.9820,
    neighborhood: 'East Village / Loisaida',
    categories: 'arts & culture,immigrants & refugees',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'abc-no-rio',
    name: 'ABC No Rio',
    website: 'https://www.abcnorio.org',
    description: 'ABC No Rio is a collectively-run nonprofit arts and activist center on the Lower East Side, founded in 1980. It offers darkroom access, a silkscreen studio, zine library, and hosts punk/hardcore concerts, art shows, and community events — all sliding-scale or free.',
    mission: 'To foster art and activism, providing community space and resources to underrepresented artists and political organizers.',
    addressLine1: '156 Rivington St',
    city: 'New York',
    state: 'NY',
    zip: '10002',
    lat: 40.7197,
    lon: -73.9871,
    neighborhood: 'Lower East Side',
    categories: 'arts & culture,civic engagement',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'les-ecology-center',
    name: 'LES Ecology Center',
    website: 'https://www.lesecologycenter.org',
    email: 'info@lesecologycenter.org',
    description: 'Founded in 1987, the Lower East Side Ecology Center runs NYC\'s largest composting program, e-waste recycling drop-offs, and environmental stewardship in East River Park. Hundreds of volunteers help collect compost at farmers markets and green spaces across lower Manhattan.',
    mission: 'To create a more ecologically sustainable New York City through composting, e-waste recycling, and community environmental education.',
    addressLine1: 'East River Park Fireboat House, Grand St',
    city: 'New York',
    state: 'NY',
    zip: '10002',
    lat: 40.7148,
    lon: -73.9748,
    neighborhood: 'Lower East Side / East River Park',
    categories: 'environment',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'st-marks-church',
    name: "St. Mark's Church in-the-Bowery",
    website: 'https://stmarksbowery.org',
    description: "St. Mark's Church in-the-Bowery is one of New York City's oldest continuously operating churches (1799) and a renowned center for poetry, dance, theater, and community services in the East Village. It hosts the Poetry Project, Danspace Project, and regular food distribution for neighbors in need.",
    mission: 'To serve as a spiritual home and cultural hub in the East Village, offering arts programs and community support open to all.',
    addressLine1: '131 E 10th St',
    city: 'New York',
    state: 'NY',
    zip: '10003',
    lat: 40.7285,
    lon: -73.9841,
    neighborhood: 'East Village',
    categories: 'arts & culture,food & hunger,civic engagement',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'gvshp',
    name: 'Greenwich Village Society for Historic Preservation',
    website: 'https://www.gvshp.org',
    email: 'info@gvshp.org',
    description: 'GVSHP advocates for the architectural and cultural preservation of Greenwich Village, the East Village, NoHo, and South Village. It leads neighborhood walking tours, publishes research, testifies at public hearings, and organizes residents to protect historic buildings and local character.',
    mission: 'To preserve the architectural character and cultural heritage of Greenwich Village, the East Village, and surrounding neighborhoods.',
    addressLine1: '232 E 11th St',
    city: 'New York',
    state: 'NY',
    zip: '10003',
    lat: 40.7293,
    lon: -73.9820,
    neighborhood: 'East Village / Greenwich Village',
    categories: 'civic engagement,arts & culture',
    adminVerifiedBy: 'Wolfgang White',
  },

  // ── Lower East Side ──────────────────────────────────────────────────────────

  {
    slug: 'grand-street-settlement',
    name: 'Grand Street Settlement',
    website: 'https://www.grandstreet.org',
    email: 'info@grandstreet.org',
    description: 'Grand Street Settlement has served Lower East Side residents since 1916, offering early childhood education, after-school programs, workforce development, senior services, and support for individuals with developmental disabilities. Its programs serve thousands of neighbors each year.',
    mission: 'To build strong families and a vital community on the Lower East Side through education, social services, and arts programs.',
    addressLine1: '80 Pitt St',
    city: 'New York',
    state: 'NY',
    zip: '10002',
    lat: 40.7166,
    lon: -73.9808,
    neighborhood: 'Lower East Side',
    categories: 'children & youth,seniors,tutoring & education',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'university-settlement',
    name: 'University Settlement',
    website: 'https://www.universitysettlement.org',
    email: 'volunteer@universitysettlement.org',
    description: 'Founded in 1886 as America\'s first settlement house, University Settlement provides early childhood education, mental health services, arts programs, senior services, and adult literacy programs to over 10,000 Lower East Side residents annually.',
    mission: 'To empower individuals and strengthen communities through education, social services, and arts programming on the Lower East Side.',
    addressLine1: '184 Eldridge St',
    city: 'New York',
    state: 'NY',
    zip: '10002',
    lat: 40.7186,
    lon: -73.9919,
    neighborhood: 'Lower East Side',
    categories: 'children & youth,seniors,arts & culture,tutoring & education',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'educational-alliance',
    name: 'Educational Alliance',
    website: 'https://www.edalliance.org',
    email: 'volunteer@edalliance.org',
    description: 'Educational Alliance has been a cornerstone of the Lower East Side since 1889, serving over 60,000 New Yorkers annually through early childhood, K–12, adult education, fitness, mental health, seniors services, and arts programs at 15 sites across Lower Manhattan.',
    mission: 'To provide programs in education, health & wellness, arts & culture, and civic engagement that improve lives and strengthen community.',
    addressLine1: '197 E Broadway',
    city: 'New York',
    state: 'NY',
    zip: '10002',
    lat: 40.7139,
    lon: -73.9905,
    neighborhood: 'Lower East Side',
    categories: 'children & youth,seniors,health & medical,tutoring & education',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'united-jewish-council-les',
    name: 'United Jewish Council of the East Side',
    website: 'https://www.ujcesnyc.org',
    email: 'info@ujcesnyc.org',
    description: 'The United Jewish Council of the East Side (UJCES) has served the Lower East Side community since 1971, providing housing assistance, senior services, case management, food pantry programs, and community development to preserve the diverse fabric of the neighborhood.',
    mission: 'To preserve and stabilize the Lower East Side community through human services, housing advocacy, and community development.',
    addressLine1: '465 Grand St, 4th Fl',
    city: 'New York',
    state: 'NY',
    zip: '10002',
    lat: 40.7155,
    lon: -73.9815,
    neighborhood: 'Lower East Side',
    categories: 'seniors,homelessness & housing,food & hunger',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'hamilton-madison-house',
    name: 'Hamilton-Madison House',
    website: 'https://hamiltonmadisonhouse.org',
    email: 'info@hamiltonmadisonhouse.org',
    description: 'Founded in 1898, Hamilton-Madison House is a settlement house serving the Two Bridges and Chinatown communities of lower Manhattan. It provides licensed mental health care, youth education, family support, and services for older adults and caregivers, with a strong focus on the Chinese-American community.',
    mission: 'To improve the quality of life of residents in the Two Bridges/Chinatown area through health, education, and community engagement programs.',
    addressLine1: '253 South St, 2nd Fl',
    city: 'New York',
    state: 'NY',
    zip: '10002',
    lat: 40.7106,
    lon: -73.9973,
    neighborhood: 'Two Bridges / Chinatown',
    categories: 'immigrants & refugees,children & youth,seniors,mental health',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'immigrant-social-services',
    name: 'Immigrant Social Services (ISS)',
    website: 'https://issnyc.org',
    email: 'programs@issnyc.org',
    description: 'Immigrant Social Services has been improving the lives of immigrants and under-resourced New Yorkers in Chinatown and the Lower East Side since 1972. Volunteers tutor K–8 students in English literacy and homework support at public schools in the neighborhood.',
    mission: 'To improve the conditions of immigrants and under-resourced persons through education and social support in lower Manhattan.',
    addressLine1: 'Chinatown / Lower East Side schools',
    city: 'New York',
    state: 'NY',
    zip: '10002',
    lat: 40.7162,
    lon: -73.9966,
    neighborhood: 'Chinatown / Lower East Side',
    categories: 'immigrants & refugees,children & youth,tutoring & education',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'tenement-museum',
    name: 'Lower East Side Tenement Museum',
    website: 'https://www.tenement.org',
    email: 'volunteer@tenement.org',
    description: 'The Tenement Museum preserves a 19th-century Lower East Side tenement building and tells the stories of the immigrant and migrant families who lived there. Through tours, education programs, and advocacy, it connects America\'s past to the immigrant experience of today.',
    mission: 'To promote tolerance and historical perspective through the preservation and interpretation of the immigrant experience on the Lower East Side.',
    addressLine1: '97 Orchard St',
    city: 'New York',
    state: 'NY',
    zip: '10002',
    lat: 40.7193,
    lon: -73.9902,
    neighborhood: 'Lower East Side',
    categories: 'arts & culture,immigrants & refugees,tutoring & education',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'museum-at-eldridge-street',
    name: 'Museum at Eldridge Street',
    website: 'https://www.eldridgestreet.org',
    email: 'volunteer@eldridgestreet.org',
    description: 'The Museum at Eldridge Street preserves the landmark 1887 Eldridge Street Synagogue, the first great house of worship built by Eastern European Jewish immigrants in the United States. It offers tours, public programs, and arts events celebrating the immigrant heritage of the Lower East Side.',
    mission: 'To celebrate American Jewish heritage and the immigrant story of the Lower East Side through preservation and public programming.',
    addressLine1: '12 Eldridge St',
    city: 'New York',
    state: 'NY',
    zip: '10002',
    lat: 40.7148,
    lon: -73.9964,
    neighborhood: 'Lower East Side / Chinatown',
    categories: 'arts & culture,immigrants & refugees',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'hester-street-collaborative',
    name: 'Hester Street Collaborative',
    website: 'https://hesterstreet.org',
    email: 'info@hesterstreet.org',
    description: 'Hester Street Collaborative is a community planning and design nonprofit serving low-income and immigrant communities across New York City, with deep roots in the Lower East Side and Chinatown. It partners with residents to design affordable housing, parks, and public spaces that reflect community needs.',
    mission: 'To advance community-driven planning and design so that all New Yorkers — especially low-income and immigrant communities — can shape the places where they live.',
    addressLine1: '137 Hester St',
    city: 'New York',
    state: 'NY',
    zip: '10002',
    lat: 40.7157,
    lon: -73.9970,
    neighborhood: 'Lower East Side / Chinatown',
    categories: 'civic engagement,homelessness & housing,immigrants & refugees',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'two-bridges-neighborhood-council',
    name: 'Two Bridges Neighborhood Council',
    website: 'https://twobridgesnyc.org',
    description: 'The Two Bridges Neighborhood Council has served the small, tightly-knit Two Bridges community between the Manhattan and Brooklyn Bridges since 1972. It advocates for affordable housing, quality-of-life improvements, and community resources for this mixed-income, immigrant-rich neighborhood.',
    mission: 'To maintain and improve the quality of life in the Two Bridges neighborhood through advocacy, organizing, and community services.',
    addressLine1: '286 Monroe St',
    city: 'New York',
    state: 'NY',
    zip: '10002',
    lat: 40.7122,
    lon: -73.9925,
    neighborhood: 'Two Bridges',
    categories: 'civic engagement,homelessness & housing,immigrants & refugees',
    adminVerifiedBy: 'Wolfgang White',
  },

  // ── Chinatown ───────────────────────────────────────────────────────────────

  {
    slug: 'cpc-nyc',
    name: 'Chinese-American Planning Council (CPC)',
    website: 'https://www.cpc-nyc.org',
    email: 'volunteer@cpc-nyc.org',
    description: 'The Chinese-American Planning Council (CPC) is the largest Asian-American social service agency in the United States, serving over 60,000 New Yorkers annually. Founded in 1965, CPC provides early childhood education, workforce development, senior services, mental health, housing assistance, and immigration support across NYC.',
    mission: 'To promote the social and economic empowerment of Chinese American and immigrant communities.',
    addressLine1: '45 Suffolk St',
    city: 'New York',
    state: 'NY',
    zip: '10002',
    lat: 40.7148,
    lon: -73.9868,
    neighborhood: 'Lower East Side / Chinatown',
    categories: 'immigrants & refugees,seniors,children & youth,tutoring & education',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'aafe',
    name: 'Asian Americans for Equality (AAFE)',
    website: 'https://www.aafe.org',
    email: 'info@aafe.org',
    description: 'Founded in 1974, Asian Americans for Equality is a civil rights and affordable housing nonprofit rooted in Chinatown. AAFE develops affordable housing, provides small business loans, offers tenant counseling, and runs after-school and youth programs across Lower Manhattan and Flushing.',
    mission: 'To advance the rights and opportunities of Asian Americans and other underserved communities through affordable housing, economic development, and advocacy.',
    addressLine1: '111 Division St',
    city: 'New York',
    state: 'NY',
    zip: '10002',
    lat: 40.7139,
    lon: -73.9976,
    neighborhood: 'Chinatown',
    categories: 'homelessness & housing,civic engagement,immigrants & refugees',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'moca-nyc',
    name: 'Museum of Chinese in America (MOCA)',
    website: 'https://www.mocanyc.org',
    email: 'volunteer@mocanyc.org',
    description: 'The Museum of Chinese in America (MOCA) is a national cultural institution dedicated to preserving and presenting the history, heritage, and experiences of people of Chinese descent in the United States. Located in Chinatown since 1980, MOCA offers exhibitions, public programs, and rich archival collections.',
    mission: 'To reclaim, preserve, and expand the history of Chinese in America through educational and cultural programs.',
    addressLine1: '215 Centre St',
    city: 'New York',
    state: 'NY',
    zip: '10013',
    lat: 40.7176,
    lon: -74.0004,
    neighborhood: 'Chinatown',
    categories: 'arts & culture,immigrants & refugees',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'chinatown-partnership',
    name: 'Chinatown Partnership LDC',
    website: 'https://chinatown.nyc',
    email: 'info@chinatown.nyc',
    description: 'Chinatown Partnership is a nonprofit local development corporation that works with residents, businesses, and community groups to support Manhattan\'s Chinatown, preserve its unique culture, and ensure its future vitality through economic development, streetscape improvements, and marketing.',
    mission: 'To revitalize and preserve Chinatown as a thriving neighborhood by supporting businesses, maintaining public spaces, and celebrating Chinese heritage.',
    addressLine1: '60 St James Pl',
    city: 'New York',
    state: 'NY',
    zip: '10038',
    lat: 40.7129,
    lon: -74.0001,
    neighborhood: 'Chinatown',
    categories: 'civic engagement,arts & culture,immigrants & refugees',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'chinatown-manpower-project',
    name: 'Chinatown Manpower Project',
    website: 'https://www.cmpny.org',
    email: 'info@cmpny.org',
    description: 'The Chinatown Manpower Project (CMP) has promoted economic self-sufficiency since 1971, offering English-language instruction, vocational training, job placement, youth programs, and senior services to immigrants and under-resourced New Yorkers in Chinatown and across the city.',
    mission: 'To promote economic self-sufficiency and career advancement for Asian-American immigrants and underserved communities.',
    addressLine1: '70 Mulberry St, 2nd Fl',
    city: 'New York',
    state: 'NY',
    zip: '10013',
    lat: 40.7158,
    lon: -73.9989,
    neighborhood: 'Chinatown',
    categories: 'immigrants & refugees,tutoring & education,children & youth,seniors',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'think-chinatown',
    name: 'Think!Chinatown',
    website: 'https://www.thinkchinatown.org',
    description: 'Think!Chinatown is an intergenerational nonprofit rooted in Manhattan\'s Chinatown that fosters belonging through neighborhood storytelling, arts programming, and civic engagement. Its oral history projects, pop-up events, and youth programs connect long-time residents with newcomers.',
    mission: 'To foster belonging and intergenerational connection in Chinatown through storytelling, the arts, and community engagement.',
    addressLine1: 'Chinatown, Manhattan',
    city: 'New York',
    state: 'NY',
    zip: '10013',
    lat: 40.7158,
    lon: -73.9988,
    neighborhood: 'Chinatown',
    categories: 'arts & culture,immigrants & refugees,civic engagement',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'welcome-to-chinatown',
    name: 'Welcome to Chinatown',
    website: 'https://welcometochinatown.com',
    description: 'Welcome to Chinatown is a grassroots nonprofit that launched during the COVID-19 pandemic to support small businesses and local merchants in Manhattan\'s Chinatown. It raises awareness of anti-Asian hate, promotes local businesses, and creates community events to draw visitors and support the neighborhood\'s recovery.',
    mission: 'To support and amplify the small businesses and cultural community of Manhattan\'s Chinatown.',
    addressLine1: 'Chinatown, Manhattan',
    city: 'New York',
    state: 'NY',
    zip: '10013',
    lat: 40.7157,
    lon: -73.9979,
    neighborhood: 'Chinatown',
    categories: 'civic engagement,immigrants & refugees',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'caaav',
    name: 'CAAAV: Organizing Asian Communities',
    website: 'https://caaav.org',
    email: 'info@caaav.org',
    description: 'CAAAV: Organizing Asian Communities is a citywide organization that builds power among low-income Asian immigrants in NYC. Founded in 1986, CAAAV organizes Southeast Asian and South Asian tenants in Chinatown and the Bronx, fighting for affordable housing, workers\' rights, and police accountability.',
    mission: 'To build power among low-income Asian immigrant communities to fight for racial, economic, and social justice.',
    addressLine1: '46 Hester St',
    city: 'New York',
    state: 'NY',
    zip: '10002',
    lat: 40.7145,
    lon: -73.9966,
    neighborhood: 'Chinatown',
    categories: 'civic engagement,homelessness & housing,immigrants & refugees',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'chinatown-ymca',
    name: 'Chinatown YMCA',
    website: 'https://ymcanyc.org/locations/chinatown-ymca',
    email: 'chinatown@ymcanyc.org',
    description: 'The Chinatown YMCA has been an integral part of the Chinatown and Lower East Side community since the 1970s. Its Houston Street Center features a fitness center, pool, gymnasium, and offers afterschool programs, youth sports, adult classes, senior fitness, and family programming open to all.',
    mission: 'To nurture the potential of every child, promote healthy living, and foster a sense of social responsibility in the Chinatown community and beyond.',
    addressLine1: '273 Bowery',
    city: 'New York',
    state: 'NY',
    zip: '10002',
    lat: 40.7214,
    lon: -73.9937,
    neighborhood: 'Lower East Side / Chinatown',
    categories: 'children & youth,seniors,health & medical',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'asian-american-federation',
    name: 'Asian American Federation',
    website: 'https://www.aafny.org',
    email: 'info@aafny.org',
    description: 'The Asian American Federation strengthens the capacity of Asian-American nonprofits across New York City and advocates for policies that serve the growing Asian-American community. Through research, advocacy, and direct service, it addresses health, civic, and economic needs of NYC\'s 1.4 million Asian Americans.',
    mission: 'To advance the well-being of the pan-Asian American community through advocacy, research, and capacity-building of member agencies.',
    addressLine1: '120 Wall St, 3rd Fl',
    city: 'New York',
    state: 'NY',
    zip: '10005',
    lat: 40.7070,
    lon: -74.0097,
    neighborhood: 'Financial District / Chinatown-serving',
    categories: 'immigrants & refugees,civic engagement,health & medical',
    adminVerifiedBy: 'Wolfgang White',
  },

  // ── SoHo / NoHo / Hudson Square ─────────────────────────────────────────────

  {
    slug: 'housing-works-soho',
    name: 'Housing Works (SoHo)',
    website: 'https://www.housingworks.org',
    email: 'volunteer@housingworks.org',
    description: 'Housing Works is a healing community of people living with and affected by HIV/AIDS. Its SoHo thrift shop and beloved bookstore & café generate revenue to fund housing, healthcare, and advocacy services for New Yorkers living with HIV/AIDS. Volunteers staff both locations.',
    mission: 'To end the dual crises of homelessness and AIDS through advocacy, services, and community for people living with HIV/AIDS.',
    addressLine1: '126 Crosby St',
    city: 'New York',
    state: 'NY',
    zip: '10012',
    lat: 40.7243,
    lon: -73.9971,
    neighborhood: 'SoHo',
    categories: 'homelessness & housing,health & medical,LGBTQ+',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'the-door',
    name: 'The Door — A Center of Alternatives',
    website: 'https://www.door.org',
    email: 'volunteer@door.org',
    description: 'The Door has served NYC youth since 1972, providing over 10,000 young adults (ages 12–24) each year with healthcare, education, mental health counseling, legal assistance, career development, housing support, arts programs, and free daily meals — all under one roof in Hudson Square.',
    mission: 'To empower young adults to reach their full potential by providing comprehensive, integrated youth development services.',
    addressLine1: '121 Avenue of the Americas',
    city: 'New York',
    state: 'NY',
    zip: '10013',
    lat: 40.7262,
    lon: -74.0052,
    neighborhood: 'Hudson Square / SoHo',
    categories: 'children & youth,mental health,health & medical,homelessness & housing',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'cityarts',
    name: 'CITYarts',
    website: 'https://www.cityarts.org',
    email: 'info@cityarts.org',
    description: 'CITYarts has created over 300 large-scale public murals across New York City since 1968, engaging youth, artists, and community members in the collaborative process of making art in public spaces. Many of its murals are in Lower East Side, East Village, and Chinatown.',
    mission: 'To transform communities by engaging youth and professional artists in creating public art that reflects neighborhood history and values.',
    addressLine1: '111 John St, Ste 700',
    city: 'New York',
    state: 'NY',
    zip: '10038',
    lat: 40.7087,
    lon: -74.0083,
    neighborhood: 'Citywide / Lower Manhattan',
    categories: 'arts & culture,children & youth',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'project-renewal',
    name: 'Project Renewal',
    website: 'https://www.projectrenewal.org',
    email: 'volunteer@projectrenewal.org',
    description: 'Project Renewal helps New Yorkers experiencing homelessness rebuild their lives through health care, mental health treatment, substance use services, job training, and supportive housing. Its downtown programs operate near SoHo and Tribeca, reaching some of the city\'s most vulnerable residents.',
    mission: 'To end the cycle of homelessness by empowering people to renew their lives with health, homes, and jobs.',
    addressLine1: '200 Varick St',
    city: 'New York',
    state: 'NY',
    zip: '10014',
    lat: 40.7281,
    lon: -74.0057,
    neighborhood: 'Hudson Square / SoHo',
    categories: 'homelessness & housing,mental health,health & medical',
    adminVerifiedBy: 'Wolfgang White',
  },

  // ── Tribeca ──────────────────────────────────────────────────────────────────

  {
    slug: 'the-flea-theater',
    name: 'The Flea Theater',
    website: 'https://theflea.org',
    email: 'info@theflea.org',
    description: 'The Flea is a leading off-off-Broadway theater in Tribeca that champions experimental, new American plays and emerging artists. Its resident company of emerging artists (The Bats) creates bold, affordable theater, and the Flea actively engages downtown neighbors through community programs.',
    mission: 'To develop and present innovative theater by emerging artists that challenges and inspires, with deep roots in the Tribeca community.',
    addressLine1: '20 Thomas St',
    city: 'New York',
    state: 'NY',
    zip: '10007',
    lat: 40.7143,
    lon: -74.0097,
    neighborhood: 'Tribeca',
    categories: 'arts & culture',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'good-shepherd-services',
    name: 'Good Shepherd Services',
    website: 'https://www.goodshepherds.org',
    email: 'volunteer@goodshepherds.org',
    description: 'Good Shepherd Services provides educational, family, and youth development programs at over 90 locations in Brooklyn, the Bronx, and Manhattan — including in the Lower East Side. Its programs reach over 30,000 youth and families annually through after-school, counseling, foster care, and workforce programs.',
    mission: 'To provide youth and families with the tools they need to develop to their full potential through educational, family, and community-based programs.',
    addressLine1: '305 Seventh Ave',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    lat: 40.7467,
    lon: -73.9942,
    neighborhood: 'Citywide / LES programs',
    categories: 'children & youth,tutoring & education,mental health',
    adminVerifiedBy: 'Wolfgang White',
  },

  // ── Seaport / Financial District ─────────────────────────────────────────────

  {
    slug: 'south-street-seaport-museum',
    name: 'South Street Seaport Museum',
    website: 'https://southstreetseaportmuseum.org',
    email: 'volunteer@seany.org',
    description: 'The South Street Seaport Museum preserves and celebrates New York\'s maritime heritage with a fleet of historic ships, exhibits at Pier 16, and programming about the city\'s waterfront history. Volunteers help as ship docents, educators, and crew during public sailing programs.',
    mission: 'To preserve and interpret New York\'s history as a great port city and its role in shaping the nation\'s commerce and culture.',
    addressLine1: '12 Fulton St',
    city: 'New York',
    state: 'NY',
    zip: '10038',
    lat: 40.7066,
    lon: -74.0032,
    neighborhood: 'Seaport / Financial District',
    categories: 'arts & culture,environment',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'billion-oyster-project',
    name: 'Billion Oyster Project',
    website: 'https://www.billionoysterproject.org',
    email: 'volunteer@billionoysterproject.org',
    description: 'The Billion Oyster Project is restoring one billion oysters to New York Harbor by 2035. It collects used oyster shells from NYC restaurants, grows oysters at Governors Island, and engages thousands of students and volunteers in hands-on harbor restoration and environmental education.',
    mission: 'To restore New York Harbor\'s oyster reefs while creating educational opportunities and community engagement around marine conservation.',
    addressLine1: '10 South St, Slip 7',
    city: 'New York',
    state: 'NY',
    zip: '10004',
    lat: 40.7007,
    lon: -74.0148,
    neighborhood: 'Financial District / Governors Island',
    categories: 'environment',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'the-battery-conservancy',
    name: 'The Battery Conservancy',
    website: 'https://www.thebattery.org',
    email: 'volunteer@thebattery.org',
    description: 'The Battery Conservancy has transformed Battery Park — Manhattan\'s oldest public park — into a world-class waterfront destination. Volunteers help maintain the park\'s gardens, participate in stewardship workdays, and assist with public events at the southern tip of Manhattan.',
    mission: 'To create, sustain, and program Battery Park as a dynamic public space for all New Yorkers and visitors.',
    addressLine1: 'State St at Battery Place',
    city: 'New York',
    state: 'NY',
    zip: '10004',
    lat: 40.7033,
    lon: -74.0170,
    neighborhood: 'Battery Park / Financial District',
    categories: 'environment,civic engagement',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'food-bank-nyc',
    name: 'Food Bank for New York City',
    website: 'https://www.foodbanknyc.org',
    email: 'volunteer@foodbanknyc.org',
    description: 'The Food Bank for New York City is the city\'s major food distribution nonprofit, supplying 500+ community food programs across the five boroughs. Its Manhattan distribution hub is in the Financial District. Volunteers sort and pack millions of pounds of food annually at the warehouse and at community partner sites.',
    mission: 'To end hunger in New York City by organizing food, information, and support for community members in need.',
    addressLine1: '39 Broadway, 10th Fl',
    city: 'New York',
    state: 'NY',
    zip: '10006',
    lat: 40.7077,
    lon: -74.0130,
    neighborhood: 'Financial District',
    categories: 'food & hunger',
    adminVerifiedBy: 'Wolfgang White',
  },

  // ── Additional Lower Manhattan ────────────────────────────────────────────────

  {
    slug: 'city-harvest',
    name: 'City Harvest',
    website: 'https://www.cityharvest.org',
    email: 'volunteer@cityharvest.org',
    description: 'City Harvest is New York City\'s largest food rescue organization, collecting surplus food from restaurants, grocers, and farms and delivering it free-of-charge to hundreds of community food programs. Its mobile markets serve lower Manhattan neighborhoods including the Lower East Side and Chinatown.',
    mission: 'To end hunger in New York City through food rescue and by supporting communities\' access to nutritious food.',
    addressLine1: '6 MetroTech Center',
    city: 'New York',
    state: 'NY',
    zip: '11201',
    lat: 40.6940,
    lon: -73.9863,
    neighborhood: 'Citywide / LES & Chinatown programs',
    categories: 'food & hunger',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'judson-memorial-church',
    name: 'Judson Memorial Church',
    website: 'https://www.judson.org',
    description: 'Judson Memorial Church is a progressive Baptist congregation and cultural center at the south edge of Washington Square Park. It has a long history of social justice activism, LGBTQ+ inclusion, arts programming, and support for immigrant communities — with volunteer and advocacy opportunities open to all.',
    mission: 'To serve as a community of faith and action, combining arts, activism, and spiritual life in service of justice.',
    addressLine1: '55 Washington Square S',
    city: 'New York',
    state: 'NY',
    zip: '10012',
    lat: 40.7295,
    lon: -74.0002,
    neighborhood: 'Greenwich Village / NoHo',
    categories: 'civic engagement,arts & culture,LGBTQ+',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'ryan-health-nena',
    name: 'Ryan Health | NENA',
    website: 'https://ryanhealth.org',
    email: 'volunteer@ryanhealth.org',
    description: 'Ryan Health | NENA is a Federally Qualified Health Center serving the East Village since the 1960s. Located on East 3rd Street, it provides primary care, behavioral health, dental, and social services to all patients regardless of ability to pay, with a focus on the uninsured and underinsured.',
    mission: 'To provide comprehensive, high-quality, patient-centered healthcare to underserved New Yorkers in the East Village and beyond.',
    addressLine1: '279 E 3rd St',
    city: 'New York',
    state: 'NY',
    zip: '10009',
    lat: 40.7222,
    lon: -73.9817,
    neighborhood: 'East Village',
    categories: 'health & medical',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'grace-church-community',
    name: 'Grace Church Community Programs',
    website: 'https://www.gracechurchnyc.org',
    description: 'Grace Church is a historic Episcopal church at the corner of Broadway and 10th Street whose community programs include a food pantry, refugee assistance, ESL tutoring, and ministry to unhoused neighbors. Its volunteers help run regular distributions and support services for East Village residents.',
    mission: 'To serve God and neighbor through worship, artistic excellence, and compassionate ministry in the East Village and citywide.',
    addressLine1: '802 Broadway',
    city: 'New York',
    state: 'NY',
    zip: '10003',
    lat: 40.7315,
    lon: -73.9908,
    neighborhood: 'East Village / NoHo',
    categories: 'food & hunger,immigrants & refugees,civic engagement',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'nyc-charter-school-center',
    name: 'East Side Community School Support',
    website: 'https://www.eschs.org',
    description: 'East Side Community High School is a public school in the East Village with a strong tradition of project-based learning and community engagement. Its affiliated foundation accepts community volunteers for mentoring, tutoring, and college access support for East Village students.',
    mission: 'To prepare East Village youth for college, civic participation, and lives of purpose through rigorous, community-embedded education.',
    addressLine1: '420 E 12th St',
    city: 'New York',
    state: 'NY',
    zip: '10009',
    lat: 40.7299,
    lon: -73.9791,
    neighborhood: 'East Village',
    categories: 'children & youth,tutoring & education',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'lower-east-side-conservancy',
    name: 'Lower East Side Jewish Conservancy',
    website: 'https://nylj.org',
    email: 'info@nylj.org',
    description: 'The Lower East Side Jewish Conservancy documents and celebrates the Jewish immigrant heritage of the Lower East Side through walking tours, oral histories, and educational programs. Its volunteers lead neighborhood tours visiting historic synagogues, tenements, and cultural landmarks.',
    mission: 'To preserve and promote the history and culture of the Jewish Lower East Side through education, heritage tourism, and community engagement.',
    addressLine1: '91 Rivington St',
    city: 'New York',
    state: 'NY',
    zip: '10002',
    lat: 40.7196,
    lon: -73.9880,
    neighborhood: 'Lower East Side',
    categories: 'arts & culture,immigrants & refugees',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'greater-chinatown-community-assoc',
    name: 'Greater Chinatown Community Association',
    website: 'https://gcca.community',
    description: 'The Greater Chinatown Community Association works to improve the quality of life in Chinatown and surrounding neighborhoods through community organizing, social services, and resource coordination. It connects residents with housing support, health programs, and civic engagement opportunities.',
    mission: 'To strengthen and support the Chinatown and Two Bridges community through advocacy, social services, and community organizing.',
    addressLine1: 'Chinatown, Manhattan',
    city: 'New York',
    state: 'NY',
    zip: '10013',
    lat: 40.7158,
    lon: -73.9985,
    neighborhood: 'Chinatown',
    categories: 'civic engagement,immigrants & refugees',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'battery-to-bridges',
    name: 'Battery to Bridges Coalition',
    website: 'https://batterytobridges.org',
    description: 'Battery to Bridges is a community-based nonprofit focused on waterfront stewardship, climate resilience, and public access along Lower Manhattan\'s East River shoreline from Battery Park to the Manhattan Bridge. It organizes community clean-ups, advocacy events, and public education around waterfront access.',
    mission: 'To protect and activate Lower Manhattan\'s East River waterfront as an equitable, climate-resilient public resource for all residents.',
    addressLine1: 'Lower Manhattan East River Waterfront',
    city: 'New York',
    state: 'NY',
    zip: '10002',
    lat: 40.7110,
    lon: -73.9748,
    neighborhood: 'Lower East Side / Two Bridges waterfront',
    categories: 'environment,civic engagement',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'city-parks-foundation',
    name: 'City Parks Foundation',
    website: 'https://www.cityparksfoundation.org',
    email: 'volunteer@cityparksfoundation.org',
    description: 'City Parks Foundation is the leading nonprofit partner of NYC Parks, offering free arts, sports, nature, and community programs in parks across all five boroughs. In lower Manhattan it supports programming in Tompkins Square, Sara Roosevelt, and East River parks.',
    mission: 'To strengthen communities across New York City by bringing free, high-quality programs to parks in every neighborhood.',
    addressLine1: '830 5th Ave',
    city: 'New York',
    state: 'NY',
    zip: '10065',
    lat: 40.7733,
    lon: -73.9731,
    neighborhood: 'Citywide / Lower Manhattan parks',
    categories: 'environment,arts & culture,children & youth',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'new-yorkers-for-parks',
    name: 'New Yorkers for Parks',
    website: 'https://www.ny4p.org',
    email: 'info@ny4p.org',
    description: 'New Yorkers for Parks is the citywide parks advocacy organization, fighting for equitable park funding, open space access, and park quality in all five boroughs. It leads community stewardship campaigns and volunteer workdays at parks across lower Manhattan including Sara Roosevelt and East River.',
    mission: 'To ensure that all New Yorkers have access to high-quality parks and open space through advocacy, research, and stewardship.',
    addressLine1: '57 W 57th St, Ste 1400',
    city: 'New York',
    state: 'NY',
    zip: '10019',
    lat: 40.7646,
    lon: -73.9762,
    neighborhood: 'Citywide / Lower Manhattan parks',
    categories: 'environment,civic engagement',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'legal-aid-society',
    name: 'Legal Aid Society (Lower Manhattan)',
    website: 'https://legalaidnyc.org',
    email: 'volunteer@legal-aid.org',
    description: 'The Legal Aid Society is the oldest and largest provider of free legal services in the United States. Its criminal defense, civil, and juvenile rights attorneys serve low-income New Yorkers across all five boroughs, with civil attorneys based in lower Manhattan handling housing, benefits, and immigration cases.',
    mission: 'To provide free, high-quality legal representation to low-income New Yorkers who cannot afford an attorney.',
    addressLine1: '40 Worth St',
    city: 'New York',
    state: 'NY',
    zip: '10013',
    lat: 40.7148,
    lon: -74.0087,
    neighborhood: 'Tribeca / Lower Manhattan',
    categories: 'civic engagement,homelessness & housing,immigrants & refugees',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'les-history-project',
    name: 'Lower East Side History Project',
    website: 'https://leshistoryproject.org',
    description: 'The Lower East Side History Project researches, documents, and preserves the history of the Lower East Side through walking tours, educational programs, lectures, and publications. It spotlights the overlooked stories of the neighborhood\'s successive waves of immigrant communities.',
    mission: 'To document and celebrate the rich, layered history of the Lower East Side for the education and benefit of all New Yorkers.',
    addressLine1: 'Lower East Side, Manhattan',
    city: 'New York',
    state: 'NY',
    zip: '10002',
    lat: 40.7178,
    lon: -73.9900,
    neighborhood: 'Lower East Side',
    categories: 'arts & culture,immigrants & refugees',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'bowery-arts-science',
    name: 'Bowery Arts + Science',
    website: 'https://www.boweryartsandscience.org',
    description: 'Bowery Arts + Science (formerly Bowery Arts) is a lower Manhattan nonprofit that integrates arts, science, and civic education for youth in the East Village, LES, and Chinatown. Its programs bring creative science and maker-space workshops into schools and community centers in the area.',
    mission: 'To expand access to arts and science learning for underserved youth in lower Manhattan through hands-on, creative programming.',
    addressLine1: 'Lower East Side / East Village',
    city: 'New York',
    state: 'NY',
    zip: '10002',
    lat: 40.7190,
    lon: -73.9880,
    neighborhood: 'Lower East Side / East Village',
    categories: 'children & youth,arts & culture,tutoring & education',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'nyc-rescue-mission',
    name: 'NYC Rescue Mission',
    website: 'https://nycrescuemission.org',
    email: 'volunteer@nycrescuemission.org',
    description: 'NYC Rescue Mission has served people experiencing homelessness in lower Manhattan since 1872. Located near Tribeca, it provides hot meals, shelter, recovery programs, job training, and transitional housing. Hundreds of volunteers help serve meals and run life-skills workshops year-round.',
    mission: 'To provide holistic care — food, shelter, recovery, and community — to men and women experiencing homelessness in New York City.',
    addressLine1: '90 Lafayette St',
    city: 'New York',
    state: 'NY',
    zip: '10013',
    lat: 40.7179,
    lon: -74.0049,
    neighborhood: 'Tribeca / Chinatown border',
    categories: 'homelessness & housing,food & hunger',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'church-street-school',
    name: 'Church Street School for Music and Art',
    website: 'https://www.churchstreetschool.org',
    email: 'info@churchstreetschool.org',
    description: 'Church Street School for Music and Art is a community arts school in Tribeca offering affordable private lessons in music, visual art, and movement to children and adults of all backgrounds. It also runs free outreach programs in nearby schools and community centers.',
    mission: 'To make the arts accessible to all in lower Manhattan through affordable instruction and free community outreach programs.',
    addressLine1: '74 Warren St',
    city: 'New York',
    state: 'NY',
    zip: '10007',
    lat: 40.7149,
    lon: -74.0103,
    neighborhood: 'Tribeca',
    categories: 'arts & culture,children & youth',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'les-printshop',
    name: 'Lower East Side Printshop',
    website: 'https://www.lesprintshop.org',
    email: 'info@lesprintshop.org',
    description: 'Founded in 1968, the Lower East Side Printshop is one of New York\'s oldest nonprofit printmaking studios. It provides access to professional printmaking equipment for emerging and established artists, offers affordable classes, and runs a community outreach program connecting teens with printmaking through its Keyholder Artists-in-Residence program.',
    mission: 'To make professional printmaking accessible to artists at all levels and to foster creativity in New York City\'s diverse communities.',
    addressLine1: '306 W 37th St, 6th Fl',
    city: 'New York',
    state: 'NY',
    zip: '10018',
    lat: 40.7539,
    lon: -73.9965,
    neighborhood: 'Garment District (serves LES community)',
    categories: 'arts & culture,children & youth',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'new-settlement-community',
    name: 'Goddard Riverside Community Center',
    website: 'https://www.goddard.org',
    email: 'volunteer@goddard.org',
    description: 'Goddard Riverside Community Center provides a broad range of social services on the Upper West Side and beyond, with programs that support children, youth, adults, seniors, and people experiencing homelessness. Its Options Center places volunteers in tutoring and mentoring roles across NYC neighborhoods.',
    mission: 'To help New York City\'s most vulnerable communities thrive through a wide range of social and educational programs.',
    addressLine1: '593 Columbus Ave',
    city: 'New York',
    state: 'NY',
    zip: '10024',
    lat: 40.7841,
    lon: -73.9761,
    neighborhood: 'Citywide / Manhattan programs',
    categories: 'children & youth,seniors,homelessness & housing,tutoring & education',
    adminVerifiedBy: 'Wolfgang White',
  },

  {
    slug: 'el-puente-brooklyn',
    name: 'El Puente Academy',
    website: 'https://www.elpuente.us',
    email: 'info@elpuente.us',
    description: 'El Puente is a human rights organization rooted in the Williamsburg community that models peace through community-building, arts, and wellness. It runs environmental justice campaigns, arts programs, and a public high school — and actively recruits volunteers from across NYC including lower Manhattan.',
    mission: 'To inspire and nurture leadership for peace and justice through community-building, arts, and wellness programs.',
    addressLine1: '211 S 4th St',
    city: 'Brooklyn',
    state: 'NY',
    zip: '11211',
    lat: 40.7118,
    lon: -73.9584,
    neighborhood: 'Williamsburg / LES-accessible',
    categories: 'civic engagement,arts & culture,environment,children & youth',
    adminVerifiedBy: 'Wolfgang White',
  },

];

const opportunities: OppSeed[] = [

  // Cooper Square Committee
  { orgSlug: 'cooper-square-committee', title: 'Tenant Rights Hotline Volunteer', summary: 'Answer calls on the tenant rights hotline, help residents understand their rights, and connect callers to housing resources.', categories: 'homelessness & housing,civic engagement', commitment: 'weekly', schedule: 'Weekday evenings', signupUrl: 'https://coopersquare.org/volunteer', isRemote: 0 },

  // Third Street Music School
  { orgSlug: 'third-street-music-school', title: 'Music Program Assistant', summary: 'Support instructors in group music and dance classes for children and adults at one of America\'s oldest community music schools.', categories: 'arts & culture,children & youth', commitment: 'ongoing', schedule: 'Afternoons and weekends', signupUrl: 'https://www.thirdstreet.nyc/volunteer', isRemote: 0 },

  // FABnyc
  { orgSlug: 'fabnyc', title: 'Community Arts Event Volunteer', summary: 'Help FABnyc produce public arts events, street festivals, and community gatherings on the East 4th Street cultural corridor.', categories: 'arts & culture', commitment: '1 shift', schedule: 'Evenings and weekends', signupUrl: 'https://www.fabnyc.org/get-involved', isRemote: 0 },

  // Lower Eastside Girls Club
  { orgSlug: 'lower-eastside-girls-club', title: 'STEM Mentor', summary: 'Mentor young women and gender-expansive youth through hands-on science, technology, engineering, and math projects at the Girls Club.', categories: 'children & youth,tutoring & education', commitment: 'weekly', schedule: 'After school hours, Mon–Fri', signupUrl: 'https://www.girlsclub.org/volunteer', isRemote: 0 },

  // GOLES
  { orgSlug: 'goles', title: 'Housing Counseling Assistant', summary: 'Help LES tenants understand their lease rights, navigate housing court, and access resources through GOLES housing counseling sessions.', categories: 'homelessness & housing,civic engagement', commitment: 'ongoing', schedule: 'Weekdays', signupUrl: 'https://www.goles.org/volunteer', isRemote: 0 },

  // Nuyorican Poets Cafe
  { orgSlug: 'nuyorican-poets-cafe', title: 'Renovation & Programming Volunteer', summary: 'Support the Cafe\'s building renovation and pre-reopening programming events as it prepares to reopen to the public.', categories: 'arts & culture', commitment: '1 shift', schedule: 'Weekends', signupUrl: 'https://www.nuyorican.org/volunteer', isRemote: 0 },

  // ABC No Rio
  { orgSlug: 'abc-no-rio', title: 'Darkroom & Studio Assistant', summary: 'Help run ABC No Rio\'s darkroom, silkscreen studio, or computer lab during open sessions, assisting community members with art projects.', categories: 'arts & culture', commitment: 'weekly', schedule: 'Rotating shifts', signupUrl: 'https://www.abcnorio.org/volunteer.html', isRemote: 0 },

  // LES Ecology Center
  { orgSlug: 'les-ecology-center', title: 'Compost Collection Volunteer', summary: 'Collect food scraps at farmers markets, park drop-off sites, and community events across lower Manhattan, helping divert organic waste from landfill.', categories: 'environment', commitment: '1 shift', schedule: 'Saturdays at farmers markets', signupUrl: 'https://www.lesecologycenter.org/volunteer/', isRemote: 0 },

  // St. Mark's Church
  { orgSlug: 'st-marks-church', title: 'Community Food Distribution', summary: 'Help distribute food to East Village neighbors in need through St. Mark\'s weekly food distribution program in the historic churchyard.', categories: 'food & hunger', commitment: 'weekly', schedule: 'Thursdays', signupUrl: 'https://stmarksbowery.org/get-involved', isRemote: 0 },

  // GVSHP
  { orgSlug: 'gvshp', title: 'Neighborhood Tour Guide', summary: 'Lead public walking tours of the East Village or Greenwich Village highlighting historic buildings, immigrant stories, and architectural preservation.', categories: 'arts & culture,civic engagement', commitment: 'ongoing', schedule: 'Weekends', signupUrl: 'https://www.gvshp.org/get-involved/', isRemote: 0 },

  // Grand Street Settlement
  { orgSlug: 'grand-street-settlement', title: 'After-School Program Tutor', summary: 'Tutor elementary school students in reading and math at Grand Street Settlement\'s after-school program in the Lower East Side.', categories: 'children & youth,tutoring & education', commitment: 'weekly', schedule: 'Mon–Fri, 2:30–6pm', signupUrl: 'https://www.grandstreet.org/volunteer', isRemote: 0 },

  // University Settlement
  { orgSlug: 'university-settlement', title: 'Adult Literacy Tutor', summary: 'Teach English literacy and basic skills to adult learners at University Settlement, one of America\'s oldest settlement houses on the Lower East Side.', categories: 'tutoring & education,immigrants & refugees', commitment: 'weekly', schedule: 'Mornings or evenings', signupUrl: 'https://www.universitysettlement.org/get-involved/', isRemote: 0 },

  // Educational Alliance
  { orgSlug: 'educational-alliance', title: 'Senior Center Activity Leader', summary: 'Lead group activities, exercise classes, or social programming for older adults at the Educational Alliance\'s LES senior center.', categories: 'seniors', commitment: 'weekly', schedule: 'Weekday mornings', signupUrl: 'https://www.edalliance.org/volunteer', isRemote: 0 },

  // United Jewish Council LES
  { orgSlug: 'united-jewish-council-les', title: 'Food Pantry Volunteer', summary: 'Help sort donations and distribute food at the United Jewish Council\'s food pantry serving LES seniors and families in need.', categories: 'food & hunger,seniors', commitment: 'ongoing', schedule: 'Weekdays', signupUrl: 'https://www.ujcesnyc.org/volunteer', isRemote: 0 },

  // Hamilton-Madison House
  { orgSlug: 'hamilton-madison-house', title: 'Grocery Delivery for Seniors', summary: 'Deliver groceries to isolated older adults in the Alfred E. Smith Houses in the Two Bridges area on a biweekly basis.', categories: 'seniors,immigrants & refugees', commitment: 'biweekly', schedule: 'Weekday mornings, every other week', signupUrl: 'https://hamiltonmadisonhouse.org/join-us/', isRemote: 0 },

  // Immigrant Social Services
  { orgSlug: 'immigrant-social-services', title: 'Literacy Buddy (K–8 Tutoring)', summary: 'Meet weekly with a Chinatown/LES student to support English reading comprehension and literacy skills during after-school hours.', categories: 'children & youth,tutoring & education,immigrants & refugees', commitment: 'weekly', schedule: 'Mon–Fri, 2:30–5:30pm', signupUrl: 'https://issnyc.org/volunteer/', isRemote: 0 },

  // Tenement Museum
  { orgSlug: 'tenement-museum', title: 'Museum Volunteer Guide', summary: 'Welcome visitors, support educators, and help interpret the immigrant history of the Lower East Side at the Tenement Museum.', categories: 'arts & culture,immigrants & refugees', commitment: 'ongoing', schedule: 'Weekdays and weekends', signupUrl: 'https://www.tenement.org/volunteer', isRemote: 0 },

  // Museum at Eldridge Street
  { orgSlug: 'museum-at-eldridge-street', title: 'Gallery Host & Tour Assistant', summary: 'Welcome visitors to the landmark 1887 Eldridge Street Synagogue, share the history of the building, and support public programs and tours.', categories: 'arts & culture,immigrants & refugees', commitment: 'ongoing', schedule: 'Sundays', signupUrl: 'https://www.eldridgestreet.org/volunteer', isRemote: 0 },

  // Hester Street Collaborative
  { orgSlug: 'hester-street-collaborative', title: 'Community Planning Outreach Volunteer', summary: 'Help conduct community surveys, facilitate public meetings, and translate materials for Hester Street\'s participatory planning projects in lower Manhattan.', categories: 'civic engagement,homelessness & housing', commitment: 'project-based', schedule: 'Varies by project', signupUrl: 'https://hesterstreet.org/get-involved', isRemote: 0 },

  // Two Bridges Neighborhood Council
  { orgSlug: 'two-bridges-neighborhood-council', title: 'Community Outreach Volunteer', summary: 'Help distribute information, connect residents with services, and support community meetings in the Two Bridges neighborhood between the Manhattan and Brooklyn Bridges.', categories: 'civic engagement', commitment: 'ongoing', schedule: 'Flexible', signupUrl: 'https://twobridgesnyc.org/get-involved', isRemote: 0 },

  // CPC
  { orgSlug: 'cpc-nyc', title: 'Senior Meal Site Volunteer', summary: 'Help serve meals and engage with Chinese-American seniors at CPC\'s meal sites in Chinatown, providing companionship and light assistance.', categories: 'seniors,immigrants & refugees', commitment: 'ongoing', schedule: 'Weekday lunches', signupUrl: 'https://www.cpc-nyc.org/volunteer', isRemote: 0 },

  // AAFE
  { orgSlug: 'aafe', title: 'Housing Intake Volunteer', summary: 'Assist AAFE staff in conducting intake screenings and providing information to tenants and homeowners seeking housing counseling and affordable housing services.', categories: 'homelessness & housing,civic engagement', commitment: 'ongoing', schedule: 'Weekdays', signupUrl: 'https://www.aafe.org/get-involved/', isRemote: 0 },

  // MOCA
  { orgSlug: 'moca-nyc', title: 'Museum Docent & Gallery Guide', summary: 'Lead visitors through MOCA\'s exhibitions on Chinese-American history and culture, and support community programs and public events.', categories: 'arts & culture,immigrants & refugees', commitment: 'ongoing', schedule: 'Weekends', signupUrl: 'https://www.mocanyc.org/get-involved/', isRemote: 0 },

  // Chinatown Partnership
  { orgSlug: 'chinatown-partnership', title: 'Neighborhood Ambassador', summary: 'Serve as a volunteer ambassador welcoming visitors to Chinatown, distributing maps, sharing local history, and helping direct foot traffic to small businesses.', categories: 'civic engagement', commitment: '1 shift', schedule: 'Weekends', signupUrl: 'https://chinatown.nyc/support-volunteer/', isRemote: 0 },

  // Chinatown Manpower Project
  { orgSlug: 'chinatown-manpower-project', title: 'English Conversation Partner', summary: 'Practice conversational English with adult immigrant students enrolled in CMP\'s English-language programs in Chinatown.', categories: 'immigrants & refugees,tutoring & education', commitment: 'weekly', schedule: 'Flexible', signupUrl: 'https://www.cmpny.org/volunteer', isRemote: 0 },

  // Think!Chinatown
  { orgSlug: 'think-chinatown', title: 'Community Story Collector', summary: 'Interview long-time Chinatown residents and business owners for Think!Chinatown\'s oral history and storytelling projects, helping document neighborhood memory.', categories: 'arts & culture,immigrants & refugees', commitment: 'project-based', schedule: 'Flexible', signupUrl: 'https://www.thinkchinatown.org/volunteer', isRemote: 0 },

  // Welcome to Chinatown
  { orgSlug: 'welcome-to-chinatown', title: 'Small Business Outreach Volunteer', summary: 'Help document and promote Chinatown small businesses through photography, social media, and in-person outreach for the Welcome to Chinatown network.', categories: 'civic engagement', commitment: 'project-based', schedule: 'Flexible', signupUrl: 'https://welcometochinatown.com/contact', isRemote: 0 },

  // CAAAV
  { orgSlug: 'caaav', title: 'Community Canvassing Volunteer', summary: 'Join CAAAV canvassing teams in Chinatown to talk with residents about housing rights, tenant organizing, and upcoming community actions.', categories: 'civic engagement,homelessness & housing', commitment: '1 shift', schedule: 'Weekends', signupUrl: 'https://caaav.org/volunteer', isRemote: 0 },

  // Chinatown YMCA
  { orgSlug: 'chinatown-ymca', title: 'Youth Sports Coach Volunteer', summary: 'Assist with youth basketball, swimming, or other sports programs at the Chinatown YMCA, helping young people build fitness and teamwork skills.', categories: 'children & youth', commitment: 'ongoing', schedule: 'Afternoons and weekends', signupUrl: 'https://ymcanyc.org/locations/chinatown-ymca', isRemote: 0 },

  // Asian American Federation
  { orgSlug: 'asian-american-federation', title: 'Research & Advocacy Assistant', summary: 'Support AAF\'s policy research on issues affecting NYC\'s Asian-American community, including data analysis, survey work, and advocacy campaigns.', categories: 'civic engagement,immigrants & refugees', commitment: 'project-based', schedule: 'Weekdays', signupUrl: 'https://www.aafny.org/get-involved/', isRemote: 1 },

  // Housing Works SoHo
  { orgSlug: 'housing-works-soho', title: 'Thrift Shop Floor Volunteer', summary: 'Sort donations, assist customers, and maintain displays at the Housing Works SoHo thrift shop, generating revenue for HIV/AIDS services and housing.', categories: 'homelessness & housing,health & medical', commitment: 'ongoing', schedule: 'Flexible shifts daily', signupUrl: 'https://www.housingworks.org/volunteer/thrift-shops', isRemote: 0 },

  // The Door
  { orgSlug: 'the-door', title: 'Youth Mentor', summary: 'Mentor a young adult (ages 16–24) at The Door, providing career guidance, college application support, or life skills coaching over an extended relationship.', categories: 'children & youth', commitment: 'weekly', schedule: 'Afternoon and evening hours', signupUrl: 'https://www.door.org/get-involved/volunteer/', isRemote: 0 },

  // CITYarts
  { orgSlug: 'cityarts', title: 'Public Mural Project Assistant', summary: 'Join a CITYarts mural project team, working alongside professional artists and neighborhood youth to paint large-scale public art in lower Manhattan.', categories: 'arts & culture,children & youth', commitment: 'project-based', schedule: 'Weekends during active projects', signupUrl: 'https://www.cityarts.org/volunteer', isRemote: 0 },

  // Project Renewal
  { orgSlug: 'project-renewal', title: 'Job Readiness Workshop Facilitator', summary: 'Lead or co-facilitate resume-writing, interview prep, and workplace skills workshops for adults in Project Renewal\'s workforce development programs.', categories: 'homelessness & housing', commitment: 'ongoing', schedule: 'Weekdays', signupUrl: 'https://www.projectrenewal.org/volunteer/', isRemote: 0 },

  // The Flea Theater
  { orgSlug: 'the-flea-theater', title: 'Box Office & Event Volunteer', summary: 'Staff the box office, welcome audiences, and help run performances and events at the Flea, one of Tribeca\'s leading off-off-Broadway theaters.', categories: 'arts & culture', commitment: '1 shift', schedule: 'Evenings and weekends', signupUrl: 'https://theflea.org/support/', isRemote: 0 },

  // Good Shepherd Services
  { orgSlug: 'good-shepherd-services', title: 'After-School Tutor', summary: 'Tutor elementary and middle school students in reading and math through Good Shepherd Services\' after-school programs in Lower Manhattan.', categories: 'children & youth,tutoring & education', commitment: 'weekly', schedule: 'Mon–Fri, 3–6pm', signupUrl: 'https://www.goodshepherds.org/volunteer', isRemote: 0 },

  // South Street Seaport Museum
  { orgSlug: 'south-street-seaport-museum', title: 'Historic Ship Docent', summary: 'Lead tours of the museum\'s fleet of 19th-century tall ships docked at Pier 16, sharing stories of New York\'s maritime heritage with visitors.', categories: 'arts & culture', commitment: 'ongoing', schedule: 'Weekends', signupUrl: 'https://southstreetseaportmuseum.org/volunteer/', isRemote: 0 },

  // Billion Oyster Project
  { orgSlug: 'billion-oyster-project', title: 'Oyster Shell Collection Volunteer', summary: 'Help collect used oyster shells from NYC restaurants and prepare them for re-seeding into New York Harbor at volunteer collection events across lower Manhattan.', categories: 'environment', commitment: '1 shift', schedule: 'Monthly collection events', signupUrl: 'https://www.billionoysterproject.org/volunteer', isRemote: 0 },

  // The Battery Conservancy
  { orgSlug: 'the-battery-conservancy', title: 'Park Stewardship Workday', summary: 'Join a Battery Park stewardship workday — weeding, planting, and maintaining the historic gardens and green spaces at the southern tip of Manhattan.', categories: 'environment', commitment: '1 shift', schedule: 'Saturdays, spring through fall', signupUrl: 'https://www.thebattery.org/volunteer/', isRemote: 0 },

  // Food Bank NYC
  { orgSlug: 'food-bank-nyc', title: 'Food Distribution Warehouse Volunteer', summary: 'Sort, pack, and prepare food for distribution at the Food Bank for New York City\'s downtown distribution center, helping supply 500+ community food programs.', categories: 'food & hunger', commitment: '1 shift', schedule: 'Monday–Saturday, various shifts', signupUrl: 'https://www.foodbanknyc.org/volunteer/', isRemote: 0 },

  // City Harvest
  { orgSlug: 'city-harvest', title: 'Mobile Market Volunteer', summary: 'Help distribute free fresh produce at City Harvest mobile markets serving lower Manhattan neighborhoods including Chinatown and the Lower East Side.', categories: 'food & hunger', commitment: '1 shift', schedule: 'Monthly mobile market events', signupUrl: 'https://www.cityharvest.org/volunteer/', isRemote: 0 },

  // Judson Memorial Church
  { orgSlug: 'judson-memorial-church', title: 'Immigrant Support Volunteer', summary: 'Help Judson Memorial\'s community outreach programs supporting immigrant neighbors through language assistance, ESL tutoring, or resource navigation.', categories: 'civic engagement,immigrants & refugees', commitment: 'ongoing', schedule: 'Weekdays and weekends', signupUrl: 'https://www.judson.org/volunteer', isRemote: 0 },

  // Ryan Health NENA
  { orgSlug: 'ryan-health-nena', title: 'Patient Navigator Volunteer', summary: 'Help patients at the Ryan Health NENA clinic navigate services, complete intake paperwork, and connect with social support resources in the East Village.', categories: 'health & medical', commitment: 'weekly', schedule: 'Weekday mornings', signupUrl: 'https://ryanhealth.org/volunteer', isRemote: 0 },

  // Grace Church
  { orgSlug: 'grace-church-community', title: 'Food Pantry Distribution Volunteer', summary: 'Help sort and distribute groceries at Grace Church\'s food pantry, serving unhoused neighbors and food-insecure East Village residents.', categories: 'food & hunger', commitment: 'weekly', schedule: 'Thursdays, 10am–1pm', signupUrl: 'https://www.gracechurchnyc.org/connect/get-involved/', isRemote: 0 },

  // LES Jewish Conservancy
  { orgSlug: 'lower-east-side-conservancy', title: 'Heritage Walking Tour Guide', summary: 'Lead public walking tours of the Lower East Side highlighting historic synagogues, tenements, and the neighborhood\'s Jewish immigrant legacy.', categories: 'arts & culture,immigrants & refugees', commitment: 'ongoing', schedule: 'Sundays', signupUrl: 'https://nylj.org/volunteer', isRemote: 0 },

  // Battery to Bridges
  { orgSlug: 'battery-to-bridges', title: 'East River Waterfront Cleanup', summary: 'Join Battery to Bridges waterfront stewardship events, picking up litter, planting native species, and advocating for public access along the lower Manhattan East River shoreline.', categories: 'environment,civic engagement', commitment: '1 shift', schedule: 'Monthly cleanup events', signupUrl: 'https://batterytobridges.org/volunteer', isRemote: 0 },

  // City Parks Foundation
  { orgSlug: 'city-parks-foundation', title: 'Park Program Volunteer', summary: 'Assist City Parks Foundation staff in delivering free sports, arts, and nature programs at Tompkins Square Park, Sara Roosevelt Park, or East River Park.', categories: 'environment,children & youth', commitment: '1 shift', schedule: 'Evenings and weekends, summer season', signupUrl: 'https://www.cityparksfoundation.org/volunteer', isRemote: 0 },

  // Legal Aid Society
  { orgSlug: 'legal-aid-society', title: '"Know Your Rights" Workshop Volunteer', summary: 'Help Legal Aid staff run "know your rights" workshops for tenants, immigrants, and low-income residents at community centers across lower Manhattan.', categories: 'civic engagement,homelessness & housing', commitment: 'ongoing', schedule: 'Evening workshops', signupUrl: 'https://legalaidnyc.org/get-involved/volunteer/', isRemote: 0 },

  // NYC Rescue Mission
  { orgSlug: 'nyc-rescue-mission', title: 'Serve a Meal', summary: 'Help prepare and serve hot meals to men and women experiencing homelessness at NYC Rescue Mission\'s Tribeca dining room.', categories: 'homelessness & housing,food & hunger', commitment: '1 shift', schedule: 'Daily breakfast and dinner shifts', signupUrl: 'https://nycrescuemission.org/volunteer/', isRemote: 0 },

  // Church Street School
  { orgSlug: 'church-street-school', title: 'Arts Outreach Teaching Assistant', summary: 'Assist Church Street School teaching artists who bring free music and art workshops to public schools and community centers in Tribeca and lower Manhattan.', categories: 'arts & culture,children & youth', commitment: 'ongoing', schedule: 'School hours, weekdays', signupUrl: 'https://www.churchstreetschool.org/volunteer', isRemote: 0 },

  // LES Printshop
  { orgSlug: 'les-printshop', title: 'Open Studio Monitor', summary: 'Support artists during open studio sessions at the Lower East Side Printshop by providing guidance on equipment use and maintaining a welcoming studio environment.', categories: 'arts & culture', commitment: 'ongoing', schedule: 'Rotating studio hours', signupUrl: 'https://www.lesprintshop.org/volunteer', isRemote: 0 },

];

// ── Helpers ────────────────────────────────────────────────────────────────────

async function upsertOrg(org: OrgSeed): Promise<number> {
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
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'seed', 'published')`,
    [
      orgId, opp.title, opp.summary, opp.categories,
      opp.commitment, opp.schedule ?? null,
      opp.signupUrl, opp.isRemote,
    ]
  );
  console.log(`    ✓  "${opp.title}"`);
}

async function main() {
  console.log(`🌱 Seeding lower Manhattan organizations (${orgs.length} orgs)...\n`);

  const orgIdMap = new Map<string, number>();
  for (const org of orgs) {
    const id = await upsertOrg(org);
    orgIdMap.set(org.slug, id);
  }

  console.log(`\n🌱 Seeding opportunities (${opportunities.length} opps)...\n`);
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
