# Cityserv

Read `BUILD_PLAN.md` for the full spec. It is the source of truth.

## Quick orient
- Stack: Astro 5 + Hono + D1 + R2 + KV on Cloudflare.
- One ORM: Drizzle (drizzle-orm ^0.45, drizzle-kit ^0.31).
- One auth: Better Auth v1 (fallback Clerk).
- Moderation: Workers AI `@cf/meta/llama-guard-3-8b`.
- Tailwind 4 via `@tailwindcss/vite` (NOT @astrojs/tailwind — incompatible with Tailwind 4).
- Brand: multi-shade greens + white text, clean/human/high-tech, nonprofit.

## Local dev
```
npm install && npm run dev        # Astro + Miniflare (D1 local)
npm run db:generate               # generate migration from schema changes
npm run db:migrate:local          # apply migrations to local D1
npm run seed                      # load East Village fixtures
```

## Before merging any PR
```
npm run lint && npm run typecheck && npm run test && npm run a11y
```

## Where things live
- DB schema: `src/lib/db/schema.ts`
- Migrations: `src/lib/db/migrations/`
- API routes: `src/api/`
- UI pages: `src/pages/`
- Lib modules: `src/lib/` (score, search, moderate, verify, geo, auth, analytics)
- Legal templates: `legal/`
- Seed scripts: `scripts/`

## Phase status
- [x] Phase 0 — Foundation
- [ ] Phase 1 — Data model + seed
- [ ] Phase 2 — Public browsing
- [ ] Phase 3 — Reputability score
- [ ] Phase 4 — Auth + reviews + moderation
- [ ] Phase 5 — Legal launch readiness
- [ ] Phase 6 — Soft launch + monitoring

## Don'ts
- No scraping (ever).
- No raw SQL strings outside `src/lib/db/`.
- No editing review text — remove or reject in full only.
- No new top-level deps without Wolfgang's approval.
- No deploy to prod without Wolfgang approving the PR.
- Never expose ip_at_post / user_agent_at_post through any UI.
- Never call an org "bad," "scam," or make factual claims beyond what verification sources say.

## Key decisions log
- Astro 6.3.5 was installed by create-astro but downgraded to 5.x to match @astrojs/cloudflare@12.x peer requirement.
- @astrojs/tailwind replaced by @tailwindcss/vite — correct integration for Tailwind 4.
- drizzle-orm bumped to ^0.45.2 and drizzle-kit to ^0.31.4 to satisfy better-auth@1.x peer deps.
- School badge: "Verified by Friends Seminary Service Office"
- Admin: wolfbusterwhite@gmail.com (Cloudflare Access, single user for now)
