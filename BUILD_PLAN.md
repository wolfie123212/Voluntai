# Service Finder — Build Plan for Claude Code

**Project:** NYC volunteer-service search platform, MVP scoped to the East Village (ZIPs 10003, 10009, 10002).
**Owner:** Wolfgang White (wolfbusterwhite@gmail.com).
**Document version:** v1.0 — 2026-05-18.
**This document is the source of truth.** Claude Code should read it end-to-end before writing any code, and re-read sections as needed during implementation. Where this document conflicts with the user's later instructions, ask before deviating.

---

## 0. Executive Summary

We are building a website where someone can type "sports" or "tutoring kids" into a search bar and see every reputable **volunteer-service opportunity** in their corner of NYC. Each opportunity has a brief overview, a composite *reputability score*, the name of the entity that verified the host organization (e.g., "Verified by AmeriCorps," "IRS 501(c)(3)," "Rated by Charity Navigator"), and a user rating + comment thread.

MVP launches with the **East Village** (a few hundred opportunities across ~30–60 organizations). Architecture is built so we can flip a switch to widen to all of NYC, then other cities, without rewrites.

**Two non-negotiables, from the project instructions:**
1. **Bring this to perfection even if it takes time.** Prefer the right way over the fast way.
2. **Don't get sued.** Every feature is designed with legal exposure in mind — UGC moderation, T&Cs, data licensing, accessibility.

**Stack at a glance:**
- **Frontend:** Astro on Cloudflare Pages
- **API:** Hono on Cloudflare Workers
- **DB:** Cloudflare D1 (SQLite) with FTS5 for search
- **Auth:** Better Auth + D1 (fallback Clerk)
- **Object storage:** R2 (org logos, optional user photos)
- **Cache:** Workers KV
- **Moderation:** Workers AI (`@cf/meta/llama-guard-3-8b`) + Cloudflare Turnstile
- **Admin gate:** Cloudflare Access (free up to 50 users)
- **All infra in one Cloudflare account, one wrangler.toml**

**Estimated monthly cost at 10K MAU:** ~$6–30. Free tier covers MVP completely.

---

## 1. Product Spec

### 1.1 Core user stories

1. *As a NYC resident,* I open the site, type "sports" into the search bar, set my location to East Village, and see a list of sports-related volunteer opportunities ranked by reputability and relevance.
2. *As a NYC resident,* I drill into an opportunity, see a 2–3 paragraph overview, a reputability score (e.g., 87/100), a row of "Verified by" badges (AmeriCorps, IRS, Charity Navigator), the org's contact link, and reviews from prior volunteers.
3. *As a signed-in user,* I leave a 1–5 star rating and a written comment after volunteering. My submission is scanned by Llama Guard for toxicity/PII before posting.
4. *As a signed-in user,* I report a review I think is fake or defamatory; an admin reviews it within 7 days.
5. *As Wolfgang (admin),* I sign in via Cloudflare Access, see the moderation queue, approve/reject reviews, and add or edit organizations and opportunities.

### 1.2 Page inventory

| Route | Purpose | Auth |
|---|---|---|
| `/` | Landing + search bar + featured East Village opportunities | Public |
| `/search?q=&zip=&radius=&category=` | Search results | Public |
| `/o/:slug` | Organization detail (badges, score, opportunities, reviews) | Public |
| `/opp/:id` | Opportunity detail | Public |
| `/o/:slug/review/new` | Submit review | Auth required |
| `/signin`, `/signup` | Auth flows | Public |
| `/account` | User profile, edit own reviews | Auth |
| `/about`, `/how-it-works`, `/verification`, `/contact` | Static content | Public |
| `/terms`, `/privacy`, `/dmca`, `/accessibility` | Legal | Public |
| `/admin/*` | Moderation + curation panel | Cloudflare Access |
| `/api/*` | Hono API routes | Mixed |

### 1.3 Categories (controlled vocabulary, MVP)

```
sports, tutoring & education, food & hunger, homelessness & housing, seniors,
children & youth, animals, environment, arts & culture, mental health,
health & medical, immigrants & refugees, LGBTQ+, women & girls, veterans,
disability services, faith-based, civic engagement, disaster response, other
```

Categories are stored as `category_slugs` (text array, comma-joined in SQLite). Search must support both free text and category filtering.

### 1.4 Out of scope for MVP (explicit "do not build")

- Mobile native apps
- Direct sign-up to volunteer (we link out to the org's own sign-up)
- Payments / donations
- Org self-serve "claim your listing" portal (Phase 6+)
- Multi-language UI (English only at launch — i18n-ready strings table only)
- Real-time chat
- Calendar sync
- Email digests / notifications (Phase 5)

Do not add features in this list without checking with Wolfgang first.

---

## 2. Tech Stack — Concrete Versions

Use these exact packages and versions unless a newer minor/patch has a clear advantage. Pin major versions.

```jsonc
{
  "astro": "^5.x",
  "@astrojs/cloudflare": "^12.x",
  "hono": "^4.x",
  "better-auth": "^1.x",
  "better-auth-cloudflare": "latest",
  "drizzle-orm": "^0.x",     // ORM for D1, optional but recommended
  "drizzle-kit": "^0.x",     // migrations
  "wrangler": "^4.x",        // Cloudflare CLI
  "zod": "^3.x",             // validation
  "@cloudflare/workers-types": "latest",
  "tailwindcss": "^4.x",
  "@astrojs/tailwind": "latest",
  "vitest": "latest",
  "@playwright/test": "latest"  // e2e
}
```

**Cloudflare bindings required (in `wrangler.toml`):**

```toml
name = "service-finder"
main = "src/worker.ts"
compatibility_date = "2026-05-01"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "service-finder-db"
database_id = "<fill-in-after-create>"

[[r2_buckets]]
binding = "IMAGES"
bucket_name = "service-finder-images"

[[kv_namespaces]]
binding = "CACHE"
id = "<fill-in-after-create>"

[ai]
binding = "AI"

[vars]
ENVIRONMENT = "production"
APP_BASE_URL = "https://servicefinder.nyc"   # placeholder; replace once domain chosen
```

Secrets (set via `wrangler secret put`): `BETTER_AUTH_SECRET`, `TURNSTILE_SECRET_KEY`, `CHARITY_NAV_API_KEY` (when applicable), `PROPUBLICA_USER_AGENT` (just a contact email).

---

## 3. Repository Layout

```
service-finder/
├── README.md
├── BUILD_PLAN.md                 # this file, copied in
├── CLAUDE.md                     # short guide for future Claude Code runs (see §15)
├── package.json
├── wrangler.toml
├── astro.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── drizzle.config.ts
├── .env.example
├── public/
│   ├── favicon.svg
│   └── og-image.png
├── src/
│   ├── pages/                    # Astro routes (file-based)
│   │   ├── index.astro
│   │   ├── search.astro
│   │   ├── o/[slug].astro
│   │   ├── opp/[id].astro
│   │   ├── signin.astro
│   │   ├── signup.astro
│   │   ├── account.astro
│   │   ├── about.astro
│   │   ├── how-it-works.astro
│   │   ├── verification.astro
│   │   ├── contact.astro
│   │   ├── terms.astro
│   │   ├── privacy.astro
│   │   ├── dmca.astro
│   │   ├── accessibility.astro
│   │   └── admin/[...path].astro # rendered by Hono via Access
│   ├── components/
│   │   ├── SearchBar.astro
│   │   ├── OpportunityCard.astro
│   │   ├── OrgHeader.astro
│   │   ├── VerificationBadges.astro
│   │   ├── ReputabilityScore.astro
│   │   ├── ReviewList.astro
│   │   ├── ReviewForm.tsx        # interactive island
│   │   ├── ReportButton.tsx
│   │   └── Footer.astro
│   ├── layouts/
│   │   └── Base.astro
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts         # Drizzle schema
│   │   │   ├── client.ts         # D1 binding
│   │   │   └── migrations/
│   │   ├── auth.ts               # Better Auth config
│   │   ├── search.ts             # FTS5 query builder
│   │   ├── score.ts              # reputability formula
│   │   ├── moderate.ts           # Llama Guard wrapper
│   │   ├── verify.ts             # ProPublica + IRS BMF + AmeriCorps + CN
│   │   ├── geo.ts                # ZIP → lat/lon, radius math
│   │   └── analytics.ts          # Cloudflare Web Analytics events
│   ├── api/                      # Hono app
│   │   ├── index.ts
│   │   ├── search.ts
│   │   ├── reviews.ts
│   │   ├── reports.ts
│   │   ├── admin.ts
│   │   └── enrich.ts             # cron-triggered verification refresh
│   ├── worker.ts                 # Cloudflare entry — combines Astro SSR + Hono /api/*
│   └── styles/global.css
├── scripts/
│   ├── seed-east-village.ts      # hand-curated MVP seed
│   ├── import-nyc-open-data.ts
│   ├── import-irs-bmf.ts
│   ├── import-americorps.ts
│   └── refresh-verifications.ts  # nightly cron
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── legal/
    ├── terms-template.md
    ├── privacy-template.md
    └── dmca-template.md
```

---

## 4. Data Model (D1 / SQLite)

Use Drizzle ORM for type-safe queries. Below is the *logical* schema; translate to Drizzle in `src/lib/db/schema.ts`.

### 4.1 Tables

**`organizations`** — one row per host org.
```sql
CREATE TABLE organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,                -- url-safe, e.g. "bowery-mission"
  name TEXT NOT NULL,
  ein TEXT,                                  -- IRS Employer ID, nullable for non-501c3
  website TEXT,
  email TEXT,
  phone TEXT,
  description TEXT,                          -- markdown allowed
  mission TEXT,
  logo_r2_key TEXT,
  address_line1 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  lat REAL,
  lon REAL,
  neighborhood TEXT,                         -- "East Village", etc.
  categories TEXT,                           -- comma-joined slugs
  social_instagram TEXT,
  social_facebook TEXT,
  social_x TEXT,
  -- verification flags (cached from sources)
  is_irs_501c3 INTEGER DEFAULT 0,            -- bool from IRS BMF / ProPublica
  irs_status TEXT,                           -- "PUBLIC_CHARITY", "REVOKED", etc.
  is_americorps_grantee INTEGER DEFAULT 0,
  americorps_program TEXT,                   -- e.g. "AmeriCorps VISTA"
  charity_nav_score REAL,                    -- 0-100 if rated
  charity_nav_stars INTEGER,                 -- 1-4
  charity_nav_url TEXT,
  propublica_last_990_year INTEGER,
  domain_first_seen DATE,
  -- admin / status
  admin_verified_by TEXT,                    -- "Wolfgang White" or "Stuyvesant Service Office"
  admin_verified_at DATETIME,
  admin_notes TEXT,
  status TEXT DEFAULT 'published',           -- 'draft' | 'published' | 'flagged' | 'removed'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_orgs_zip ON organizations(zip);
CREATE INDEX idx_orgs_categories ON organizations(categories);
CREATE INDEX idx_orgs_status ON organizations(status);
```

**`opportunities`** — one row per volunteer opportunity (an org has many).
```sql
CREATE TABLE opportunities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,                              -- 1-2 sentences
  description TEXT,                          -- full markdown
  categories TEXT,                           -- comma-joined slugs
  commitment TEXT,                           -- "1 shift" | "weekly" | "ongoing"
  hours_per_week REAL,
  schedule TEXT,                             -- free text, e.g. "Sat mornings"
  is_remote INTEGER DEFAULT 0,
  in_person_address TEXT,
  in_person_zip TEXT,
  in_person_lat REAL,
  in_person_lon REAL,
  min_age INTEGER,                           -- enforce against user-declared age
  signup_url TEXT,                           -- where volunteer goes to actually sign up
  source TEXT,                               -- 'manual' | 'nyc_open_data' | 'volunteermatch' | 'school:stuyvesant'
  source_id TEXT,                            -- external id if any
  source_url TEXT,
  status TEXT DEFAULT 'published',
  posted_at DATETIME,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_opp_org ON opportunities(org_id);
CREATE INDEX idx_opp_zip ON opportunities(in_person_zip);
CREATE INDEX idx_opp_status_expires ON opportunities(status, expires_at);
```

**`opportunities_fts`** — FTS5 virtual table for search.
```sql
CREATE VIRTUAL TABLE opportunities_fts USING fts5(
  title, summary, description, categories, org_name,
  content='', tokenize='porter unicode61'
);
-- Populate via triggers on INSERT/UPDATE/DELETE of opportunities (see §6.1).
```

**`users`** — managed by Better Auth, but extend with our fields.
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,                       -- Better Auth id (uuid)
  email TEXT UNIQUE NOT NULL,
  email_verified INTEGER DEFAULT 0,
  display_name TEXT,
  avatar_r2_key TEXT,
  age_declared INTEGER,                      -- self-declared at signup, must be >= 16
  age_declared_at DATETIME,
  role TEXT DEFAULT 'user',                  -- 'user' | 'admin' | 'banned'
  banned_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- Plus Better Auth's session/account tables.
```

**`reviews`** — UGC, the highest legal-risk table.
```sql
CREATE TABLE reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id),
  org_id INTEGER NOT NULL REFERENCES organizations(id),
  opportunity_id INTEGER REFERENCES opportunities(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT,                                 -- max 2000 chars enforced at API
  volunteered_in_year INTEGER,               -- "I volunteered in 2025"
  status TEXT DEFAULT 'pending',             -- 'pending' | 'published' | 'rejected' | 'removed'
  moderation_flags TEXT,                     -- JSON from Llama Guard
  moderation_score REAL,                     -- 0..1, higher = more likely problematic
  ip_at_post TEXT,                           -- for subpoena response only, never displayed
  user_agent_at_post TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  published_at DATETIME,
  removed_reason TEXT
);
CREATE INDEX idx_reviews_org_status ON reviews(org_id, status);
CREATE INDEX idx_reviews_user ON reviews(user_id);
```

**`reports`** — abuse / takedown requests.
```sql
CREATE TABLE reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  review_id INTEGER REFERENCES reviews(id),
  org_id INTEGER REFERENCES organizations(id),
  reporter_user_id TEXT REFERENCES users(id), -- nullable if anonymous notice-and-takedown
  reporter_email TEXT,                        -- for unauthenticated DMCA / defamation notices
  reporter_name TEXT,
  reason TEXT NOT NULL,                       -- 'defamation' | 'spam' | 'harassment' | 'pii' | 'dmca' | 'inaccurate'
  details TEXT,
  status TEXT DEFAULT 'open',                 -- 'open' | 'in_review' | 'actioned' | 'dismissed'
  resolution_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME
);
```

**`audit_log`** — every admin/moderation action.
```sql
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor TEXT NOT NULL,                        -- email from Cloudflare Access
  action TEXT NOT NULL,                       -- 'review.publish' | 'review.remove' | 'org.edit' | ...
  target_type TEXT,
  target_id TEXT,
  before_json TEXT,
  after_json TEXT,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**`enrichment_runs`** — track API verification refresh history.
```sql
CREATE TABLE enrichment_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,                       -- 'propublica' | 'irs_bmf' | 'americorps' | 'charity_navigator'
  org_id INTEGER REFERENCES organizations(id),
  ok INTEGER NOT NULL,                        -- bool
  payload TEXT,                               -- raw JSON we got back
  error TEXT,
  ran_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 Migrations

Use Drizzle Kit. Generate one migration per logical change; never edit a migration after it's been applied. Migrations live in `src/lib/db/migrations/`. Run on deploy via `wrangler d1 migrations apply`.

---

## 5. Verification System — the "Verified by" feature

This is core to the product. **Every organization must display the entity that verified its existence/legitimacy.** Show a row of badges with hover tooltips that explain what each one means.

### 5.1 Verification tiers (most → least authoritative)

| Tier | Badge text | Source | Trigger |
|---|---|---|---|
| 1 | **AmeriCorps grantee** | `data.americorps.gov` Socrata API | EIN appears in grantee dataset |
| 2 | **IRS 501(c)(3)** | ProPublica Nonprofit Explorer + IRS BMF | EIN appears with deductibility = `1` and not revoked |
| 3 | **Charity Navigator rated** | Charity Navigator GraphQL API | API returns stars + score; display stars |
| 4 | **NYC Service partner** | NYC Open Data + NYC Service partnership (Phase 5+) | Org appears in NYC Open Data org dataset |
| 5 | **School-verified** | Stuyvesant / Wolfgang's school service office (Phase 2) | Admin uploads CSV of partner orgs; sets `admin_verified_by = "Stuyvesant Service Office"` |
| 6 | **Admin-verified** | Site admin manual check | `admin_verified_by IS NOT NULL` |
| Soft | Established domain (>2 yr), active social, active Google Business | RDAP + Places API | Not shown as a badge, used only to boost score |

**Display rule:** Show *every* tier that applies, in a horizontal row. Use color-coded chips: green = government/regulator, blue = independent rater, gray = admin/manual. A tooltip on hover gives the one-sentence definition (`/verification` page has the full glossary).

### 5.2 Verification data refresh

- **Cron Worker:** runs nightly at 03:00 ET.
- For each org with an EIN, hit ProPublica (`/organizations/{ein}.json`) and check for changes.
- Once per week: re-pull AmeriCorps grantee dataset (it changes slowly).
- Charity Navigator: refresh weekly per org (free tier rate-limited).
- IRS BMF: re-download bulk file monthly, diff against `organizations.ein`, update flags.
- Every call logged to `enrichment_runs` for debugging and auditability.
- KV cache: 24h for ProPublica responses, 7d for Charity Navigator, 30d for IRS BMF lookups.

### 5.3 What the user sees on the org page

```
[ Bowery Mission ]
[ AmeriCorps ] [ IRS 501(c)(3) ] [ Charity Navigator ★★★★ 92/100 ] [ Verified by Wolfgang ]
Reputability score: 91 / 100
```

The `/verification` page **must** explain:
- What each badge means
- That admin-verification is a human check, not a regulator endorsement
- That a missing badge does not mean the org is illegitimate, only that we couldn't confirm it from the source

This wording matters legally — see §10.

---

## 6. Search

### 6.1 FTS5 setup

After creating `opportunities_fts`, add triggers so it stays in sync:

```sql
CREATE TRIGGER opp_ai AFTER INSERT ON opportunities BEGIN
  INSERT INTO opportunities_fts(rowid, title, summary, description, categories, org_name)
  SELECT new.id, new.title, new.summary, new.description, new.categories,
         (SELECT name FROM organizations WHERE id = new.org_id);
END;

CREATE TRIGGER opp_au AFTER UPDATE ON opportunities BEGIN
  UPDATE opportunities_fts SET
    title=new.title, summary=new.summary, description=new.description,
    categories=new.categories,
    org_name=(SELECT name FROM organizations WHERE id = new.org_id)
  WHERE rowid=new.id;
END;

CREATE TRIGGER opp_ad AFTER DELETE ON opportunities BEGIN
  DELETE FROM opportunities_fts WHERE rowid=old.id;
END;
```

### 6.2 Query

A search is the cross product of: free-text BM25 match, optional category filter, ZIP/radius proximity, and a sort that mixes relevance with reputability. Pseudo-query for `/api/search?q=sports&zip=10003&radius=2&category=children-youth`:

```sql
SELECT
  o.id AS opp_id,
  o.title, o.summary, o.signup_url,
  org.id AS org_id, org.name, org.slug,
  -- haversine distance in miles
  (3958.8 * acos(cos(radians(:user_lat)) * cos(radians(o.in_person_lat))
       * cos(radians(o.in_person_lon) - radians(:user_lon))
       + sin(radians(:user_lat)) * sin(radians(o.in_person_lat)))) AS miles,
  -- reputability score lookup
  COALESCE(org.reputability_cached, 50) AS rep,
  bm25(opportunities_fts) AS relevance
FROM opportunities_fts f
JOIN opportunities o ON o.id = f.rowid
JOIN organizations org ON org.id = o.org_id
WHERE f.opportunities_fts MATCH :q
  AND o.status = 'published'
  AND org.status = 'published'
  AND (:category IS NULL OR o.categories LIKE '%' || :category || '%')
  AND miles <= :radius
ORDER BY (relevance * 0.6) - (rep / 100.0 * 0.4) ASC   -- relevance ascending (lower BM25 = better), rep descending
LIMIT 50;
```

> SQLite doesn't ship `acos`/`radians` by default — D1 does include them via SQLite's `math` extension which is enabled by default. Verify on first run; if not, do a coarse bounding-box prefilter on lat/lon and compute exact distance in JS.

### 6.3 Empty-query behavior

If `q` is empty, show top-rated opportunities in the area sorted by `rep DESC, posted_at DESC`. The site should always feel populated even with no query.

### 6.4 ZIP geocoding

Hardcode a small lookup table of NYC ZIP → centroid lat/lon for MVP (about 200 entries — generate from NYC Open Data). Save as `src/lib/geo-zips.json`. Avoid runtime geocoding API calls.

---

## 7. Reputability Score

A single number 0–100 displayed on each org. Computed and cached on `organizations.reputability_cached`, recomputed nightly and on any verification change.

### 7.1 Formula (v1)

```
base                = 30
+ is_irs_501c3      ? +20 : 0
+ irs_status_not_revoked ? +5 : 0
+ is_americorps_grantee ? +15 : 0
+ charity_nav_stars * 4    (max +16 if 4 stars)
+ admin_verified_by ? +10 : 0
+ domain_age_years_clipped * 1  (max +5 for 5+ years)
+ has_logo ? +2 : 0
+ has_complete_address ? +2 : 0
+ ratings_signal
        where ratings_signal =
            if (n_reviews >= 3) clamp((avg_rating - 3.0) * 10, -10, +10)
            else 0
- if (open_unresolved_reports >= 2) 15
```

Clamp final value to `[0, 100]`. Round to integer.

The formula is **explained on the `/verification` page** so users (and orgs) understand it. Reputability does not equal "good" — it's a transparency proxy. Frame it that way in copy.

### 7.2 Important framing

The score is **not** a recommendation. Copy should say: *"This score combines third-party verifications and user ratings. It is a transparency signal, not an endorsement."* This wording reduces defamation exposure.

---

## 8. User-Generated Content (Reviews + Comments)

This is the highest-legal-risk surface. Build it carefully.

### 8.1 Submission flow

1. User must be signed in. User must have declared age >= 16 at signup.
2. Review form lives at `/o/:slug/review/new`. Cloudflare Turnstile widget required.
3. Fields: rating (1–5, required), body (0–2000 chars), `volunteered_in_year` (required), opportunity (optional dropdown).
4. On submit, POST to `/api/reviews`:
   - Server validates rating, length, profanity baseline.
   - Server calls `AI.run('@cf/meta/llama-guard-3-8b', ...)` with the body.
   - If Llama Guard flags `S2 (Defamation)`, `S5 (Hate)`, `S10 (Sexual)`, or `S11 (Privacy/PII)` → review enters `status='pending'` and goes to mod queue.
   - Otherwise → `status='published'` and visible immediately.
   - Llama Guard JSON stored in `moderation_flags`.
5. Rate-limit: max 1 review per user per org per 90 days. Max 5 reviews per user per day across the site.
6. Store `ip_at_post` and `user_agent_at_post` for legal response — *never* expose to any other user, including admins through the normal UI. Only accessible via direct DB query for subpoena response.

### 8.2 Moderation queue

`/admin/moderation` lists `reviews WHERE status='pending'` plus `reports WHERE status='open'`. Actions:
- Publish (sets `status='published'`, `published_at=NOW()`, logs to `audit_log`)
- Reject (sets `status='rejected'` with reason, never deleted — kept for audit)
- Remove (a published review reported as defamatory — set `status='removed'`, `removed_reason='...defamation_takedown...'`)

### 8.3 Notice-and-takedown

A public form at `/contact?type=takedown` and a documented email (`takedown@<domain>`) that creates a `report`. Acknowledge within 72 hours, resolve within 7 days. Document every action in `audit_log`. This is essential for Section 230 + DMCA safe harbor preservation.

### 8.4 What we never do (preserves Section 230)

- Never edit user review text substantively. We can remove or reject in full, but rewriting can pierce 230 immunity.
- Never prompt users to write specific accusations (e.g., a dropdown "Is this org a scam?" is forbidden — see *Fair Housing Council v. Roommates.com*).
- Never claim editorial endorsement of any specific review.

### 8.5 Copy guardrails on the review form

Below the textarea, render:
> Share your honest experience. Stick to what you saw and did. Avoid accusations you can't back up — defamatory or harassing reviews will be removed. Your post is governed by our [Terms](/terms).

---

## 9. Authentication

### 9.1 Better Auth + D1

Use `better-auth-cloudflare`. Configure in `src/lib/auth.ts`:
- Email + password (with verification email — use Cloudflare Email Routing → free + a transactional sender like Resend in Phase 2)
- Magic link as alternative
- Session cookies, HttpOnly, SameSite=Lax, Secure
- Sessions stored in D1, instantly revocable
- Password hashing: argon2id via Better Auth defaults

### 9.2 Age gate at signup

A required numeric input "Year of birth." Compute age. If under 16, block signup with message: *"You must be at least 16 to create an account. You can still browse opportunities without an account."*

This satisfies COPPA (no under-13 collection) and substantially reduces CA AADC / NY AADC exposure. Do not use a single "I am 16+" checkbox — collect year of birth and compute.

### 9.3 Admin gate

Wrap `/admin/*` and `/api/admin/*` in Cloudflare Access policy: email matches `wolfbusterwhite@gmail.com` OR a future admin list. No code required to maintain auth for admin — Access handles it. Pull the user's email from the `Cf-Access-Jwt-Assertion` header in the Worker.

### 9.4 Known caveat

There is an open issue (as of Jan 2026) with session management on Better Auth + Workers + D1 under certain edge cases. Before launch, write an integration test that signs in, signs out, signs in again, and asserts a fresh session id. If it fails, fall back to **Clerk** (free up to 10K MAU, drop-in).

---

## 10. Legal — Terms, Privacy, DMCA, Accessibility

### 10.1 Threshold disclaimer (must appear in every legal doc)

> ServiceFinder is an information directory. We do not employ, endorse, vet, or supervise any organization listed. Verification badges indicate only that a third-party source (named on the badge) has the organization in its records — they are not endorsements of safety or quality. Always use your own judgment, especially when volunteering with children or vulnerable populations.

### 10.2 Terms & Conditions — must-have clauses

Render `/terms` from `legal/terms-template.md` (a placeholder we'll write — see §10.6). Use **clickwrap** on signup: an unchecked checkbox saying *"I have read and agree to the Terms and Privacy Policy"* — disabled signup button until checked. (Avoid browsewrap; *Berkson v. Gogo* held browsewrap unenforceable on most sites.)

Required clauses:
1. Acceptance, eligibility (16+), parental consent path for minors.
2. Account responsibilities (one account, no sharing, accurate info).
3. User content license — perpetual, royalty-free, worldwide, sublicensable, irrevocable. We need this to host and re-display reviews.
4. Acceptable use policy: no defamation, harassment, doxxing, spam, illegal content, PII of third parties.
5. Right to moderate — broadly worded: "we may remove any content for any reason."
6. DMCA notice and takedown procedure (with designated agent name + email).
7. Disclaimers — site provided "AS IS," no warranty about org accuracy or volunteer safety.
8. Limitation of liability — cap at greater of $100 or fees paid (no fees in MVP, so effectively $100).
9. Indemnification by user.
10. Choice of law: New York. Venue: Manhattan (NY County) state and federal courts. Carve out small-claims.
11. Mandatory arbitration (AAA Consumer Rules) **with** class-action waiver, **but** carve out IP disputes and small-claims (boilerplate from EFF model). Note: arbitration enforceability evolves; revisit before launch.
12. Section 230 reservation: we are an "interactive computer service," not a publisher.
13. Severability, modification (notice required for material changes), survival, entire agreement.
14. Termination — we may terminate accounts at our sole discretion.
15. Anti-SLAPP friendly language reminding users their reviews are public-interest speech.

### 10.3 Privacy Policy — must-have clauses

Render `/privacy` from `legal/privacy-template.md`.

1. What we collect: email, year of birth, display name, IP and user-agent at post (security/legal compliance only), Cloudflare Web Analytics (privacy-respecting).
2. Why: account, security, abuse prevention, legal response.
3. Sharing: never sold. Disclosed only on lawful process or to protect rights.
4. Third parties: Cloudflare (host), Better Auth (auth), Resend (email — Phase 2), Turnstile.
5. Retention: until account deletion + 90 days for backups. IP logs purged after 1 year unless tied to an open report.
6. User rights: access, correction, deletion. Honor CCPA/CPRA-style rights even though we're NY-based — easier to operate one policy.
7. Children: account holders must be 16+. Reasonable measures to delete data of under-13 if discovered.
8. Security: SHIELD Act compliance — describe measures (encryption in transit, access controls, Cloudflare WAF).
9. Breach notification commitment (NY-required within "the most expedient time possible").
10. Contact: a clearly-listed email (`privacy@<domain>`).

### 10.4 DMCA Agent

Register the DMCA designated agent with the U.S. Copyright Office ($6, online). Publish the agent's name, address, email, and phone on `/dmca`. Required for safe harbor.

### 10.5 Accessibility — WCAG 2.1 AA

SDNY/EDNY are the #1 venues for ADA web suits. Treat WCAG 2.1 AA as a build requirement, not a polish step.

- All images have meaningful `alt`.
- Semantic HTML; one `h1` per page.
- Keyboard nav works (tab through search, results, review form).
- Focus states visible.
- Color contrast ≥ 4.5:1 for normal text, ≥ 3:1 for large.
- Form labels associated with inputs (`<label for>` or wrapping).
- Errors announced (`aria-live`).
- Skip-to-content link.
- Run `axe-core` in CI on every page.
- Publish an `/accessibility` statement with a contact for accessibility issues.

### 10.6 Legal templates

The `legal/*.md` files in the repo should be **placeholder templates** that say at the top:

> **DRAFT — NOT LEGAL ADVICE.** This template was generated based on common UGC platform clauses. Before launch, Wolfgang must have a New York–licensed attorney review and finalize these documents.

Claude Code should write the drafts based on the clauses above, but the final review must be done by a human lawyer. Recommend: a NY small-firm internet/media attorney, or a service like LegalZoom + a follow-up review. Budget $500–2,500 for review.

---

## 11. Data Sources — How to Wire Them Up

### 11.1 Free, ready to integrate today

| Source | Endpoint | Auth | Use for | Cache |
|---|---|---|---|---|
| **ProPublica Nonprofit Explorer** | `https://projects.propublica.org/nonprofits/api/v2/organizations/{ein}.json` and `/search.json?q=...` | None, but send `User-Agent: ServiceFinder/0.1 (contact@<domain>)` | Confirm EIN, get latest 990 year, address | KV 24h |
| **IRS EO BMF bulk** | `https://www.irs.gov/pub/irs-soi/eo_xx.csv` (one per state) — pull `eo_ny.csv` | None | Authoritative 501(c)(3) status + revocation list | Re-download monthly |
| **AmeriCorps Open Data** | Socrata SODA on `data.americorps.gov` (search relevant dataset IDs at runtime; cache them) | None for low volume; app token recommended | Mark `is_americorps_grantee` | Weekly refresh |
| **NYC Open Data — Volunteer Opps** | `https://data.cityofnewyork.us/resource/shpd-5q9m.json` | None for low volume | Seed org list with NYC orgs; not real-time | Monthly refresh |
| **NYC Open Data — Community Based Orgs** | `https://data.cityofnewyork.us/resource/i4kb-6ab6.json` | None | Cross-reference NYC nonprofits | Monthly |
| **Charity Navigator GraphQL** | `https://api.data.charitynavigator.org/...` | API key (free tier — sign up at developer.charitynavigator.org) | Stars + score badge | KV 7d |

### 11.2 Apply for access (Phase 5+)

- **VolunteerMatch / Idealist Open Network API** — apply at `developers.volunteermatch.org`. Their free tier is for nonprofits, not for commercial aggregators. We need the paid Commercial-Use tier — contact `solutions.volunteermatch.org/api/pricing`. Until we have funding or a partnership, do not build on the free key.
- **NYC Service partnership** — email `nycservice@cityhall.nyc.gov` to ask for a structured feed or partnership. Mention the East Village MVP. Wolfgang should send this email, not Claude.
- **GivePulse** — email `support@givepulse.com`.

### 11.3 No-scrape policy (MVP)

We do **not** scrape any site for MVP. Even if `hiQ` says public-data scraping isn't a CFAA crime, the breach-of-contract risk and reputational risk aren't worth it. Three exceptions, all permission-based:

1. NYC Open Data — open license, public domain.
2. ProPublica Nonprofit Explorer API — explicitly permits programmatic use.
3. Our own school's service office — if Wolfgang's school gives us a CSV.

If Phase 5 requires scraping a site, we get **written permission first** (email confirmation is enough). Document it in `legal/data-sources.md`.

### 11.4 Manual curation for the East Village MVP

The MVP launches with **hand-curated** opportunities seeded via `scripts/seed-east-village.ts`. Target list (Wolfgang to review and approve):

- DOROT (seniors, 14th–96th St including East Village)
- Bowery Mission (homelessness, Lower East Side)
- Henry Street Settlement (Lower East Side)
- New York Cares (citywide — filter for East Village shifts)
- Common Ground / Breaking Ground (housing)
- Tompkins Square Park Conservancy (environment)
- Children's Aid (children/youth)
- God's Love We Deliver (food/health, West Village–adjacent)
- LGBT Community Center (LGBTQ+, 13th St — East Village–adjacent)
- East Village Community Coalition (civic)
- Loisaida Inc. (arts/culture)

Seed each with the org row, 1–3 opportunity rows, EIN if known. The cron then enriches via ProPublica/IRS/AmeriCorps.

---

## 12. Build Phases — for Claude Code to follow in order

Each phase ends with a **demo gate**: Wolfgang reviews the output before Phase N+1 begins. Tasks are listed in dependency order within each phase.

### Phase 0 — Project foundation (target: 1 sitting)
1. Initialize repo (Astro + TypeScript + Tailwind v4).
2. Add Cloudflare adapter, wire `wrangler.toml` with placeholders.
3. Set up Drizzle + D1 binding. Create empty database.
4. Generate first migration with all tables in §4.
5. Add Vitest + Playwright config.
6. Add CI: GitHub Actions on PR — typecheck, lint, unit tests, axe-core a11y check on built pages.
7. Add `CLAUDE.md` (§15) and copy this `BUILD_PLAN.md` in.

**Demo gate:** repo builds, deploys to a `*.pages.dev` preview, all checks green on PR.

### Phase 1 — Data model + seed (target: 1–2 sittings)
1. Implement all schema files in `src/lib/db/schema.ts`.
2. Write `scripts/seed-east-village.ts` with the 11-org starter list. Wolfgang reviews the seed data; iterate.
3. Apply seed to local dev D1 and to prod D1.
4. Write `scripts/import-irs-bmf.ts` — downloads `eo_ny.csv`, parses, updates `organizations.is_irs_501c3` / `irs_status`.
5. Write `scripts/refresh-verifications.ts` — for each org with an EIN, hit ProPublica + AmeriCorps + Charity Navigator (gated by env), update org row, log to `enrichment_runs`.
6. Add unit tests for parsing each source's response shape.

**Demo gate:** running `npm run refresh` populates verification flags for all seeded orgs. SQL `SELECT name, is_irs_501c3, is_americorps_grantee, charity_nav_stars FROM organizations` shows real data.

### Phase 2 — Public browsing (target: 2–3 sittings)
1. Build `Base.astro` layout (header, footer, skip link).
2. Build `/` landing page with search bar + featured opportunities (top 6 by reputability).
3. Build `/search` with FTS5 query (Hono `/api/search`) + filters (category, ZIP, radius).
4. Build `/o/:slug` org detail page with `VerificationBadges` and `ReputabilityScore` components.
5. Build `/opp/:id` opportunity detail page with link out to `signup_url`.
6. Build `/about`, `/how-it-works`, `/verification` static pages — the verification page is content-heavy (glossary of each badge).
7. Add Cloudflare Web Analytics.

**Demo gate:** anonymous user can land, search "sports" within East Village, click into an org, read the description, click the external sign-up link.

### Phase 3 — Reputability score (target: 1 sitting)
1. Implement `src/lib/score.ts` with formula in §7.
2. Add a `reputability_cached` column to `organizations`; compute on enrichment runs.
3. Display the score on org card and detail page.
4. Add the `/verification` page formula explanation and the "transparency signal, not endorsement" copy.

**Demo gate:** every seeded org has a non-default reputability score, and the math is reproducible from a SQL dump of that org's fields.

### Phase 4 — Auth + reviews + moderation (target: 3–4 sittings)
1. Install + configure Better Auth on `/api/auth/*`.
2. Build signup with age gate (year of birth) and Turnstile.
3. Build signin, magic link, email verification.
4. Add `/account` page (edit display name, list of my reviews, delete account).
5. Build review form with Turnstile.
6. Implement Llama Guard moderation in `src/lib/moderate.ts`.
7. Build `/admin/moderation` (gated by Cloudflare Access).
8. Build reports flow (`/contact?type=takedown`, email parsing into `reports`).
9. Run a deliberate adversarial test: post a defamatory-looking review as a test user, confirm it lands in `pending`, approve it, then file a report, confirm it ends in `removed` with audit log entries.

**Demo gate:** end-to-end review submission with moderation works, including the take-down path. Audit log shows all admin actions.

### Phase 5 — Legal launch readiness (target: 1–2 sittings + lawyer review)
1. Generate `legal/terms-template.md`, `legal/privacy-template.md`, `legal/dmca-template.md` from §10.
2. Render those at `/terms`, `/privacy`, `/dmca`.
3. Add `/accessibility` statement.
4. Add clickwrap on signup. Block signup until checkbox is checked.
5. Run axe-core on all public pages. Fix all violations.
6. Register the DMCA agent ($6) — Wolfgang completes this.
7. Wolfgang sends the legal docs to a NY internet/media attorney for review. Iterate based on counsel's redlines.
8. Add cookie/analytics notice (Cloudflare Web Analytics is privacy-preserving but mention it in privacy policy regardless).

**Demo gate:** all legal pages live, lawyer-reviewed, accessibility scan passes.

### Phase 6 — Soft launch + monitoring (target: 1 sitting)
1. Custom domain attached.
2. Cloudflare WAF rules: rate-limit POST /api/* to 60/min/IP, block known bad bots.
3. Sentry or Cloudflare Logs Engine for error monitoring.
4. Status page (Cloudflare Pages — separate tiny project).
5. Soft launch to friends & a few East Village orgs. Collect feedback.
6. Add structured `feedback@<domain>` inbox.

### Phase 7 — Scale prep (post-MVP)
1. Apply for VolunteerMatch / Idealist commercial API tier.
2. Expand seed to all of Manhattan, then NYC.
3. Add semantic search (Vectorize + `@cf/baai/bge-base-en-v1.5`).
4. Add email notifications for new opportunities matching saved interests (requires Resend + double opt-in).
5. Add org self-serve "claim your listing" — high complexity, separate spec.

---

## 13. Operational Guardrails for Claude Code

Read these before starting each work session.

**DO:**
- Read this file end-to-end before starting Phase 0. Re-read the relevant phase at the start of each session.
- Use Drizzle for all DB access. No raw SQL strings outside `src/lib/db/`.
- Write tests for every `src/lib/*.ts` module (unit) and for every API route (integration with `miniflare`).
- Commit small, atomic PRs. One PR per task within a phase.
- Use `wrangler d1 migrations` workflow — never edit applied migrations.
- Ask Wolfgang before installing any new top-level dependency not in §2.
- Run `npm run lint && npm run typecheck && npm run test` before every commit.
- Run `npm run a11y` (axe-core CLI) before merging any UI-touching PR.
- When unsure between two designs, pick the one that's easier to delete.

**DO NOT:**
- Do not add features outside the scoped phase without asking.
- Do not write any scraping code. Period.
- Do not edit user review text. Remove or reject in full, never rewrite.
- Do not display IP/user-agent of any user to any other user, including admins through normal UI.
- Do not commit secrets. Use `wrangler secret put`.
- Do not introduce a second framework, ORM, or auth library.
- Do not change the reputability formula without Wolfgang's approval. Bump the formula version if it changes (`score_v` column).
- Do not deploy to prod without Wolfgang explicitly approving the PR.
- Do not write copy that calls any listed org "bad," "good," "scam," "fake," or makes any factual claim about the org beyond what the verification sources literally say.

**When stuck:**
- If a Cloudflare product behaves differently than this doc describes, check the Cloudflare docs (linked in §16), then ask Wolfgang.
- If a third-party API returns unexpected shapes, log the raw payload to `enrichment_runs.payload` and skip — don't crash the cron.
- If you discover something this plan got wrong, propose a `BUILD_PLAN.md` patch as a separate PR labeled `docs:plan-update`.

---

## 14. Testing Strategy

### 14.1 Unit (Vitest)
- `score.ts` — given a row, expected score.
- `search.ts` — query parsing.
- `moderate.ts` — given mocked Llama Guard output, expected status.
- `verify.ts` — given fixtures of ProPublica/IRS/AmeriCorps responses, expected org-row mutations.

### 14.2 Integration (Miniflare + Vitest)
- `/api/search` — seed an in-memory DB, hit the route, assert shape.
- `/api/reviews` — happy path, age gate, rate limit, moderation flag.
- `/api/reports` — submit, observe queue.

### 14.3 End-to-end (Playwright)
- Anonymous user: search → org page → external signup link.
- Auth user: signup (age gate) → submit review → see it pending → admin approves → see it published.
- Accessibility: axe-core in Playwright on every page.

### 14.4 Adversarial
- Submit reviews with known PII, hate, defamation patterns; confirm Llama Guard catches them.
- Try to create accounts under 16; confirm blocked.
- Try to scrape our own search via a script; confirm rate limits kick in.

---

## 15. CLAUDE.md (place at repo root)

Short orientation file for future Claude Code runs in this repo. Suggested contents:

```markdown
# Service Finder

Read `BUILD_PLAN.md` for the full spec. It is the source of truth.

## Quick orient
- Stack: Astro + Hono + D1 + R2 + KV on Cloudflare.
- One ORM: Drizzle.
- One auth: Better Auth (fallback Clerk).
- Moderation: Workers AI `@cf/meta/llama-guard-3-8b`.

## Local dev
`npm install && npm run dev` boots Astro + Miniflare (D1 local).
`npm run db:generate && npm run db:migrate` to update schema.
`npm run seed` to load East Village fixtures.

## Before merging
`npm run lint && npm run typecheck && npm run test && npm run a11y`

## Where things live
- DB schema: `src/lib/db/schema.ts`
- API routes: `src/api/*`
- UI pages: `src/pages/*`
- Legal templates: `legal/*.md`

## Don'ts
- No scraping.
- No raw SQL outside `src/lib/db/`.
- No editing review text (remove-only).
- No new top-level deps without owner approval.
```

---

## 16. Reference Links

**Cloudflare**
- D1 limits: https://developers.cloudflare.com/d1/platform/limits/
- D1 read replication: https://developers.cloudflare.com/d1/best-practices/read-replication/
- Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Workers AI models: https://developers.cloudflare.com/workers-ai/models/
- Turnstile: https://developers.cloudflare.com/turnstile/
- Zero Trust / Access: https://www.cloudflare.com/plans/zero-trust-services/
- Astro on Pages: https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/

**Data sources**
- ProPublica Nonprofit Explorer API: https://projects.propublica.org/nonprofits/api
- IRS EO BMF: https://www.irs.gov/charities-non-profits/exempt-organizations-business-master-file-extract-eo-bmf
- AmeriCorps Open Data: https://data.americorps.gov/
- NYC Open Data — Volunteer Ops dataset: https://data.cityofnewyork.us/Social-Services/Volunteer-Opportunities-and-Finding-Organizations/shpd-5q9m
- Charity Navigator GraphQL: https://www.charitynavigator.org/products-and-services/graphql-api/
- VolunteerMatch developer portal: https://developers.volunteermatch.org/

**Auth**
- Better Auth Cloudflare: https://github.com/zpg6/better-auth-cloudflare
- Clerk (fallback): https://clerk.com/

**Legal precedents referenced**
- Van Buren v. United States, 593 U.S. 374 (2021)
- hiQ Labs v. LinkedIn, 31 F.4th 1180 (9th Cir. 2022)
- Zeran v. AOL, 129 F.3d 327 (4th Cir. 1997)
- Fair Housing Council v. Roommates.com, 521 F.3d 1157 (9th Cir. 2008)
- Berkson v. Gogo, 97 F. Supp. 3d 359 (E.D.N.Y. 2015)
- Gonzalez v. Google, 598 U.S. 617 (2023)
- Robles v. Domino's, 913 F.3d 898 (9th Cir. 2019)
- NY Civil Rights Law §§ 70-a, 76-a (anti-SLAPP, amended 2020)
- NY GBL § 899-bb (SHIELD Act)
- COPPA, 15 U.S.C. § 6501 + FTC 2025 amendments

---

## 17. Open Questions for Wolfgang (please answer before Phase 0)

1. **Domain name** — do you have one in mind? (servicefinder.nyc, eastvillageservice.org, etc.) Need this before going live, not before Phase 0, but earlier = better.
2. **School affiliation** — what school's service office should we add as a "School-verified" tier? Will you ask the office for a CSV of approved orgs?
3. **"GoPass"** — you mentioned "certified by GoPass" as a desired verification source. I couldn't confirm which service this is (could be x2VOL / GoPass / MobileServe / Track It Forward — there are several student-hour-tracking apps). Confirm the exact platform so we can check whether it has an API or a public partner list we can integrate as a verification tier.
4. **Brand / visual identity** — any colors, fonts, vibe you want, or should we propose? (Recommend: clean serif headlines, generous whitespace, NYC-civic palette of deep blue + warm gray.)
5. **Lawyer budget** — comfortable with ~$500–2,500 for a one-time legal review of T&Cs/Privacy by a NY internet attorney before launch?
6. **Email** — okay to use Cloudflare Email Routing → Gmail for `contact@`/`takedown@`/`privacy@` until we add Resend?
7. **Admin team** — just you, or others? Affects Cloudflare Access policy.
8. **Soft launch audience** — who's the first 20 people you'd show this to? Useful for shaping the seed data.

---

*End of plan. v1.0 — 2026-05-18.*
