# CityServ Expansion Plan — From the East Village to Every Major U.S. City

_Drafted 2026-10-05. Owner: Wolfgang White. Source of truth for how CityServ grows beyond Lower Manhattan._

## TL;DR

CityServ works today because one person hand-picked 73 organizations and 84 opportunities and checked every link. That is the right way to launch and the wrong way to scale: at the current pace, covering the 50 largest U.S. metros would take decades.

The sustainable path is to stop being the person who types in every listing and become the **platform that verifies them**. Three engines do the work:

1. **Open-data pipeline** builds the universe of legitimate nonprofits in any metro automatically (IRS Business Master File + ProPublica), so an org "exists" on CityServ before anyone has heard of us.
2. **Org self-service** lets nonprofits claim their profile and post their own opportunities. This is the only source of opportunities that scales, and it is the one we have not built yet.
3. **Chapter verification network** turns the "Verified by Friends Seminary Service Office" badge into a repeatable model: a school, college, or community group in each city verifies local listings and recruits local volunteers.

Partner feeds (VolunteerMatch, HandsOn affiliates, city service offices) accelerate this; they are not a substitute for it. The no-scrape policy stays.

We expand in four phases with hard gates between them: **own NYC → 3 pilot metros → top 50 metros → long tail.** Nothing moves to the next phase until the previous one proves orgs will claim listings and chapters will verify them without Wolfgang doing it by hand.

---

## 1. Where we are (honest baseline)

| Metric | Today |
|---|---|
| Published organizations | 73 |
| Opportunities | 84 (71 with working sign-up links) |
| Geographic coverage | East Village, LES, Chinatown, Tribeca, FiDi |
| Neighborhood labels in the database | 41 distinct free-text strings ("Lower East Side / Two Bridges waterfront", "Citywide / LES programs"…) |
| How listings got here | 100% hand-curated by Wolfgang (`scripts/seed-*.ts`) |
| Verification enrichment (`src/lib/verify.ts`) | Stub — returns no data. IRS status is set manually at seed time. |
| IRS BMF importer | Exists, New York only (`eo_ny.csv`) |
| Org self-service | None |
| Traffic | ~31 visits/day, growing; leaderboard and click tracking shipped Oct 2026 |
| Trust badge | One verifier: Friends Seminary Service Office |
| Infra cost | ~$0/month (Cloudflare Pages + D1 + KV + R2 free tiers) |

What this means: the product, brand, and legal posture are launch-ready. The **data engine** is a person, and the schema still assumes one neighborhood cluster in one city.

## 2. The scaling problem in numbers

- ~1.9 million 501(c)(3) organizations are registered with the IRS. Roughly 300–500k are the kind that use volunteers (human services, education, environment, animals, arts, health, youth, seniors, housing/food — filterable by NTEE code).
- The 50 largest metros hold about 55% of the U.S. population and a larger share of nonprofits.
- A realistic "good enough to launch" metro has **300 orgs and 600 opportunities**. 50 metros → 15,000 orgs and 30,000 opportunities.
- Hand-curation throughput has been roughly 10–15 orgs per sitting including link checking. 15,000 orgs ≈ 1,000+ sittings. Not happening.
- Opportunities go stale fast. Our first link audit found 35 of 81 sign-up URLs broken within weeks of seeding. At 30,000 opportunities, link rot alone is a full-time job unless orgs maintain their own listings.

Conclusion: every listing we hand-enter is a liability we have to maintain forever. Every listing an org maintains itself is an asset.

## 3. The three engines (plus accelerators)

### Engine A — Open-data org universe (automatic, nationwide)

Builds the **organization** layer for any metro with zero manual entry.

- **IRS Exempt Organizations BMF**: one CSV per state, public domain, monthly. Gives EIN, name, address, NTEE code, 501(c)(3) status, revocation status. We already parse `eo_ny.csv`; generalize to all 50 states + DC.
- **ProPublica Nonprofit Explorer API**: enrich with latest Form 990 year, revenue band, and canonical name. Permitted for programmatic use.
- **Filter** to volunteer-relevant NTEE major groups (see Appendix A) and to ZIPs inside the target metro.
- Result: thousands of **Tier-1 "IRS-verified" org shells** per metro, each with a profile page, EIN badge, and a "Claim this organization" button. No opportunities yet; no fabricated descriptions.

Policy decision: BMF-sourced profiles are published with a clear "Unclaimed · IRS-verified 501(c)(3)" state. This is factual (we show only what the IRS says) and gives orgs a reason to claim. Opportunities appear only from Engine B, Engine C, or licensed partner feeds.

### Engine B — Org self-service (the one that actually scales)

The single most important build. Nonprofits claim their shell and post opportunities themselves.

- **Claim flow**: sign in → search org by name/EIN → verify control by (a) email at the org's domain, or (b) a code sent to the phone/email on the IRS record, or (c) chapter attestation. Store in `org_claims`.
- **Org dashboard**: edit mission/description/categories, add opportunities with structured fields (commitment, schedule, min age, sign-up URL), mark filled/expired, see click and completion counts from `volunteer_actions`.
- **Freshness contract**: opportunities expire after 90 days unless renewed; a weekly email asks the org to confirm. Dead sign-up links (the existing `check-signup-urls.ts`, moved to a scheduled Worker) auto-unpublish the opportunity and notify the org.
- **Moderation**: Llama Guard pass on all org-submitted text (already wired for reviews), plus the review queue.

Why orgs will do it: free, verified listing on a site students actually use; sign-up clicks flow straight to their own form (no middleman); analytics they don't get elsewhere. The leaderboard and school chapters create the student demand that makes the listing worth maintaining.

### Engine C — Chapter verification network (distributed trust + distributed demand)

The Friends Seminary badge is the prototype. Generalize it:

- A **chapter** is a school service office, college civic-engagement center, Key Club / NHS / Scouts troop, or a community group with a named adult lead.
- Chapters get a `chapters` row, a badge ("Verified by Lincoln High Service Office"), and a lightweight admin view: verify a local org (we've worked with them / we checked them), flag a problem, and see their students on the leaderboard.
- Chapters are also the **go-to-market**: they bring students (demand), students bring completions (trust signal), and orgs claim listings because students are showing up.
- Recruiting channels: Campus Compact (1,000+ member colleges with civic-engagement offices), National Honor Society and Key Club chapters, independent-school service-learning coordinators, city youth councils.

### Accelerators — partner feeds (licensed, never scraped)

- **HandsOn Network / Points of Light affiliates** exist in most large metros (New York Cares, Boston Cares, Chicago Cares, LA Works, Hands On Atlanta, Volunteer Houston, HandsOn Twin Cities, and others — confirm current roster at launch). A partnership with one affiliate per metro can seed hundreds of live opportunities with a structured feed.
- **City service offices** (NYC Service, Serve Illinois, LA Volunteer Corps, etc.) often publish open data or will share a feed.
- **VolunteerMatch / Idealist** commercial API tiers — pursue once there is revenue or a sponsor; the free tiers prohibit aggregator use (see `BUILD_PLAN.md §11.2`).
- **GivePulse / Galaxy Digital** — many universities already run these; a chapter at such a school can ask for an export.

Every partner feed row carries `source`, `source_url`, `fetched_at` so it can be attributed and removed on request.

## 4. Foundation work before metro #2

These are blocking. Doing them while we are still only in NYC is cheap; doing them after we have 10 cities of data is a migration nightmare.

| # | Change | Why |
|---|---|---|
| F1 | **Normalize geography**: `metros` and `neighborhoods` tables; `organizations.metro_id`, `neighborhood_id`; ZIP→metro lookup table. Migrate the 41 free-text labels. | Search, SEO landing pages, and chapter scoping all key off metro. Free text cannot be filtered. |
| F2 | **Provenance on every row**: `source` (`irs_bmf`, `propublica`, `org_claimed`, `chapter`, `partner:<name>`, `manual`), `source_url`, `fetched_at`, `confidence`. | Required to show "where this came from," honor takedowns, and debug bad data at scale. |
| F3 | **`org_claims` + org-admin role** on `users`. | Engine B. |
| F4 | **`chapters` table** and generalize the verifier badge from a hard-coded string to a relation. | Engine C. |
| F5 | **Implement `verify.ts` for real**: ProPublica lookup, BMF status, revocation list, cached in KV. Scheduled monthly refresh. | Today "IRS-verified" is a manual flag. At scale it must be automatic or the badge is meaningless. |
| F6 | **Nationwide BMF import**: loop all state files, filter by NTEE + metro ZIPs, write org shells with `status='unclaimed'`. | Engine A. |
| F7 | **Freshness jobs** as Cloudflare scheduled Workers: link health (HEAD/GET with browser UA, 403-from-WAF tolerant), opportunity expiry, org renewal emails via Resend. | Prevents the link-rot problem we already hit. |
| F8 | **Metro landing pages** (`/nyc`, `/boston`…) generated from `metros`, with per-metro featured orgs, categories, and chapter badges. | SEO is the cheapest acquisition channel for "volunteer opportunities in {city}." |
| F9 | **Search by metro + radius**: FTS5 already exists; add metro filter and lat/lon distance (`geo.ts`). | A Boston student must never see NYC results by default. |
| F10 | **Admin tooling**: claim approvals, chapter approvals, moderation queue with SLA, audit log views. | Wolfgang's time is the scarcest resource; every manual action needs a one-click UI, not a script. |

Opportunity volume to design for: D1 comfortably handles millions of rows; 30k opportunities and 15k orgs is small. The constraint is moderation and freshness, not storage.

## 5. Phased rollout with gates

### Phase A — Own New York (now → ~3 months)

Scope: all five boroughs, 300+ orgs, 600+ opportunities, F1–F10 shipped.

- Run Engine A for NYC ZIPs → thousands of unclaimed IRS-verified shells.
- Ship the claim flow and org dashboard; personally onboard the 73 existing orgs as the first claimers (email each one — this is also how we learn what orgs need).
- Recruit two more NYC chapters (one public high school, one college civic-engagement office).
- Wire contact-form and renewal emails through Resend (already configured).
- Publish `/nyc` landing page; retire free-text neighborhoods.

**Gate to Phase B** (all must be true):
- ≥ 25% of published opportunities are org-maintained (claimed), not hand-seeded.
- Sign-up link health ≥ 95% for 4 consecutive weekly runs with zero manual fixes.
- ≥ 3 active chapters, ≥ 200 monthly active users, ≥ 50 completions logged in a month.
- Wolfgang spends < 3 hours/week on data entry.

### Phase B — Three pilot metros (months 3–8)

Pick metros where the launch kit can be tested with minimal Wolfgang involvement.

Selection criteria (score each 0–2):
1. A chapter lead already identified (friend's school, a college contact).
2. An active HandsOn/Points of Light affiliate or city service office willing to share a feed.
3. Dense nonprofit sector and strong school service-hour culture.
4. Reachable for an in-person visit (Northeast corridor first).

Likely candidates: **Boston, Philadelphia, Washington DC**. Alternates: Chicago, Los Angeles. Final picks depend on criterion 1 — a committed local lead matters more than city size.

The **6-week metro launch kit** (repeatable):
- Week 1: Engine A import for the metro; create `metros` row; `/city` page live with unclaimed shells.
- Week 2: Chapter lead onboarded; chapter verifies its 10–20 known partner orgs.
- Weeks 2–4: Chapter emails those orgs to claim; partner-feed import if an affiliate agreed.
- Weeks 4–6: Student launch at the chapter's school; leaderboard seeded; first completions.

**Gate to Phase C**: at least two of three pilots reach 100 claimed orgs and 150 live opportunities within 8 weeks with < 5 hours of Wolfgang's time per metro.

### Phase C — Top 50 metros (months 8–20)

- Engine A runs for all 50 at once (it is just a filter over the same national files).
- Chapter recruitment goes programmatic: a "Start a CityServ chapter" page, a Campus Compact and NHS outreach campaign, a one-page PDF for service coordinators.
- Org outreach is automated: when a chapter verifies an org, or a student clicks an unclaimed org's website, the org receives a "claim your free verified listing" email (rate-limited, opt-out honored, CAN-SPAM compliant).
- Partner-feed partnerships pursued in parallel (one affiliate per metro where available).
- Metrics dashboard per metro: claimed %, live opportunities, chapters, MAU, completions, link health.

**Gate to Phase D**: ≥ 30 metros past the Phase B bar; moderation queue median response < 48h with volunteer moderators handling ≥ 70% of items.

### Phase D — Long tail and depth (month 20+)

Smaller cities and rural counties via chapters-first (the IRS data is already there). Depth features: saved interests + notifications, semantic search (Vectorize), school hour-tracking exports, org-side analytics upgrades. Consider a national nonprofit partnership (Points of Light, Campus Compact) to co-brand the chapter program.

## 6. Sustainability

### Cost

| Component | Phase A | Phase C (50 metros) |
|---|---|---|
| Cloudflare Pages + Workers | $0 | $5/mo (Workers paid plan for scheduled jobs) |
| D1 | free tier | ~$5–20/mo (reads scale with traffic; storage trivial) |
| KV / R2 | free tier | < $5/mo |
| Workers AI (Llama Guard moderation) | free allotment | ~$10–30/mo at thousands of submissions/month |
| Resend email | free (3k/mo) | $20/mo (50k/mo) for renewal + claim emails |
| Domain, misc | ~$2/mo | ~$2/mo |
| **Total** | **≈ $0** | **≈ $50–80/mo** |

This is fundable by a single small grant or school sponsorship. No paid data licenses are assumed; VolunteerMatch commercial access is optional and only if a sponsor covers it.

### People

- **Wolfgang**: product owner, final approver on PRs and policy, chapter-program lead.
- **Chapter leads** (volunteer, one per metro): verify orgs, recruit students, first-line flagging.
- **Volunteer moderators** (recruited from chapters, Phase C): review queue under Wolfgang's rules; no editing review text, remove-or-reject only.
- **One volunteer engineer** by Phase C to own freshness jobs and imports so Wolfgang is not the only person who can deploy.

### Legal and trust posture (unchanged principles, scaled)

- **No scraping, ever.** Open data, licensed feeds, and org-submitted content only. Document every source in `legal/data-sources.md`.
- **Section 230 posture**: we host org- and user-submitted content; we remove or reject, never edit. Keep the notice-and-takedown flow and DMCA agent current.
- **Factual claims only**: "IRS-verified 501(c)(3)" means exactly what the BMF says. Never call an org bad, a scam, or make claims beyond the sources.
- **Privacy**: age gate stays (no under-13 accounts). Leaderboard shows first name + last initial only. Plan for CCPA/CPRA obligations if California users approach 100k; the data model already keeps IP/user-agent out of every UI.
- **Email**: claim/renewal emails are transactional or clearly opt-out; honor unsubscribes immediately.
- **Organization**: operate under a fiscal sponsor (school or a youth-org sponsor) until revenue or grants justify a standalone 501(c)(3).

### What we never do

Scrape. Sell or share user data. Pay-to-rank or pay-to-verify. Fabricate descriptions for unclaimed orgs. Track whether a student "really" volunteered beyond what they self-report and what orgs confirm.

## 7. Risks and mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Orgs don't claim listings | Medium | Chapters drive student demand first; claim emails triggered by real student clicks; dashboard analytics as the carrot. Measure claim rate weekly; if < 10% after Phase A outreach, rethink before Phase B. |
| Unclaimed IRS shells look like endorsements | Medium | Explicit "Unclaimed" state, no description, only IRS facts; no opportunities. Clear disclaimer on every unclaimed page. |
| Link rot and stale opportunities | High (already observed) | Scheduled link health + 90-day expiry + org renewal emails; auto-unpublish. |
| Moderation load outgrows one person | High by Phase C | Llama Guard pre-filter; chapter moderators; queue SLA metric gates Phase D. |
| Chapter quality varies | Medium | Chapter approval by Wolfgang; badge shows chapter name so trust is attributable; chapters can be paused. |
| Partner feed terms change | Medium | Provenance on every row; feeds are accelerators, not dependencies; drop a feed without losing the org layer. |
| Wolfgang bandwidth | High | Every phase gate includes a "Wolfgang hours/week" ceiling; F10 admin tooling; volunteer engineer by Phase C. |
| Leaderboard gaming | Low–Medium | Self-reported completions are labeled as such; chapters can confirm; rate limits on actions per user per day. |

## 8. Wolfgang's 90-day action list

Things only Wolfgang can do (Claude can draft every email and build every feature):

1. **Approve the Phase A build order** (F1–F10) and decide the "unclaimed shell" policy in §3A.
2. **Email the 73 current orgs** to introduce CityServ and invite them to claim their listing once the flow ships (draft ready on request).
3. **Email NYC Service** (`nycservice@cityhall.nyc.gov`) about a data partnership; **email New York Cares** about a HandsOn-style feed.
4. **Recruit two NYC chapters**: one public high school service coordinator, one college civic-engagement office.
5. **Apply** for the Charity Navigator developer key; **inquire** about VolunteerMatch commercial pricing (no commitment).
6. **Identify one potential chapter lead** in each of Boston, Philadelphia, and DC from your own network.
7. **Finish email**: create `contact@cityserv.org`, forward to Gmail, add `takedown@` alias (blocked on the GoDaddy TXT record).
8. **Decide on fiscal sponsorship** path with the school.

## Appendix A — Volunteer-relevant NTEE major groups (Engine A filter)

| NTEE | Group | Include |
|---|---|---|
| A | Arts, Culture & Humanities | Yes |
| B | Education | Yes (exclude B40–B50 universities themselves unless they run community programs) |
| C | Environment | Yes |
| D | Animal-related | Yes |
| E–H | Health, Mental Health, Disease-specific | Yes (hospitals: only if volunteer programs exist — claim-only) |
| I | Crime & Legal-related | Yes |
| J | Employment | Yes |
| K | Food, Agriculture & Nutrition | Yes |
| L | Housing & Shelter | Yes |
| M | Public Safety & Disaster | Yes |
| N | Recreation & Sports | Yes |
| O | Youth Development | Yes |
| P | Human Services | Yes |
| Q | International | Case by case |
| R–W | Civil rights, community improvement, philanthropy, science, public benefit | Case by case (community improvement S: yes) |
| X | Religion-related | Only orgs with non-sectarian community programs; claim-only |
| Y, Z | Mutual benefit, unknown | No |

## Appendix B — Metro launch-order candidates

Order is a proposal; a committed chapter lead moves a metro up the list.

| Tier | Metros | Notes |
|---|---|---|
| Pilot (Phase B) | Boston, Philadelphia, Washington DC | Northeast corridor; strong school service culture; Boston Cares / city service offices to approach. |
| Wave 1 (Phase C) | Chicago, Los Angeles, San Francisco Bay Area, Seattle, Atlanta, Houston, Dallas–Fort Worth, Minneapolis–St. Paul, Denver, Miami | Large nonprofit sectors; HandsOn affiliates in several (confirm current roster). |
| Wave 2 | Phoenix, San Diego, Austin, Portland, Baltimore, Pittsburgh, Detroit, St. Louis, Nashville, Charlotte, Raleigh–Durham, Salt Lake City, Sacramento, Kansas City, Columbus, Indianapolis, Cleveland, Cincinnati, Milwaukee, Orlando, Tampa, San Antonio, Las Vegas, New Orleans, Richmond, Providence, Hartford, Buffalo, Albany, Rochester | Remaining top-50; pipeline-first, chapters as they appear. |

## Appendix C — Schema sketch for the foundation work

```
metros(id, slug, name, state, center_lat, center_lon, timezone)
neighborhoods(id, metro_id, slug, name)
zip_metro(zip, metro_id)
organizations(+ metro_id, neighborhood_id, source, source_url, fetched_at, confidence, claim_status)
org_claims(id, org_id, user_id, method, evidence, status, reviewed_by, created_at, decided_at)
chapters(id, slug, name, metro_id, kind, lead_user_id, status, created_at)
chapter_verifications(id, chapter_id, org_id, note, created_at)
opportunities(+ source, source_url, fetched_at, expires_at (enforced), renewed_at, last_link_check_at, link_ok)
users(+ role: 'user' | 'org_admin' | 'chapter_lead' | 'moderator' | 'admin')
```

All raw SQL stays in `src/lib/db/`; migrations via Drizzle; no new top-level dependencies without approval.
