import {
  sqliteTable,
  integer,
  text,
  real,
  index,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ─── organizations ───────────────────────────────────────────────────────────

export const organizations = sqliteTable(
  'organizations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    ein: text('ein'),
    website: text('website'),
    email: text('email'),
    phone: text('phone'),
    description: text('description'),
    mission: text('mission'),
    logoR2Key: text('logo_r2_key'),
    addressLine1: text('address_line1'),
    city: text('city'),
    state: text('state'),
    zip: text('zip'),
    lat: real('lat'),
    lon: real('lon'),
    neighborhood: text('neighborhood'),
    categories: text('categories'),
    socialInstagram: text('social_instagram'),
    socialFacebook: text('social_facebook'),
    socialX: text('social_x'),
    // verification flags
    isIrs501c3: integer('is_irs_501c3').default(0),
    irsStatus: text('irs_status'),
    isAmericorpsGrantee: integer('is_americorps_grantee').default(0),
    americorpsProgram: text('americorps_program'),
    charityNavScore: real('charity_nav_score'),
    charityNavStars: integer('charity_nav_stars'),
    charityNavUrl: text('charity_nav_url'),
    propublicaLast990Year: integer('propublica_last_990_year'),
    domainFirstSeen: text('domain_first_seen'),
    // admin / status
    adminVerifiedBy: text('admin_verified_by'),
    adminVerifiedAt: text('admin_verified_at'),
    adminNotes: text('admin_notes'),
    reputabilityCached: integer('reputability_cached'),
    status: text('status').default('published'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [
    index('idx_orgs_zip').on(t.zip),
    index('idx_orgs_categories').on(t.categories),
    index('idx_orgs_status').on(t.status),
  ]
);

// ─── opportunities ────────────────────────────────────────────────────────────

export const opportunities = sqliteTable(
  'opportunities',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    orgId: integer('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    summary: text('summary'),
    description: text('description'),
    categories: text('categories'),
    commitment: text('commitment'),
    hoursPerWeek: real('hours_per_week'),
    schedule: text('schedule'),
    isRemote: integer('is_remote').default(0),
    inPersonAddress: text('in_person_address'),
    inPersonZip: text('in_person_zip'),
    inPersonLat: real('in_person_lat'),
    inPersonLon: real('in_person_lon'),
    minAge: integer('min_age'),
    signupUrl: text('signup_url'),
    source: text('source'),
    sourceId: text('source_id'),
    sourceUrl: text('source_url'),
    status: text('status').default('published'),
    postedAt: text('posted_at'),
    expiresAt: text('expires_at'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [
    index('idx_opp_org').on(t.orgId),
    index('idx_opp_zip').on(t.inPersonZip),
    index('idx_opp_status_expires').on(t.status, t.expiresAt),
  ]
);

// ─── users ────────────────────────────────────────────────────────────────────

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified').default(0),
  displayName: text('display_name'),
  avatarR2Key: text('avatar_r2_key'),
  ageDeclared: integer('age_declared'),
  ageDeclaredAt: text('age_declared_at'),
  role: text('role').default('user'),
  bannedReason: text('banned_reason'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Better Auth session/account tables

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  expiresAt: text('expires_at'),
  password: text('password'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const verifications = sqliteTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── reviews ─────────────────────────────────────────────────────────────────

export const reviews = sqliteTable(
  'reviews',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    orgId: integer('org_id')
      .notNull()
      .references(() => organizations.id),
    opportunityId: integer('opportunity_id').references(() => opportunities.id),
    rating: integer('rating').notNull(),
    body: text('body'),
    volunteeredInYear: integer('volunteered_in_year'),
    status: text('status').default('pending'),
    moderationFlags: text('moderation_flags'),
    moderationScore: real('moderation_score'),
    ipAtPost: text('ip_at_post'),
    userAgentAtPost: text('user_agent_at_post'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    publishedAt: text('published_at'),
    removedReason: text('removed_reason'),
  },
  (t) => [
    index('idx_reviews_org_status').on(t.orgId, t.status),
    index('idx_reviews_user').on(t.userId),
  ]
);

// ─── reports ─────────────────────────────────────────────────────────────────

export const reports = sqliteTable('reports', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  reviewId: integer('review_id').references(() => reviews.id),
  orgId: integer('org_id').references(() => organizations.id),
  reporterUserId: text('reporter_user_id').references(() => users.id),
  reporterEmail: text('reporter_email'),
  reporterName: text('reporter_name'),
  reason: text('reason').notNull(),
  details: text('details'),
  status: text('status').default('open'),
  resolutionNotes: text('resolution_notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  resolvedAt: text('resolved_at'),
});

// ─── audit_log ───────────────────────────────────────────────────────────────

export const auditLog = sqliteTable('audit_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  actor: text('actor').notNull(),
  action: text('action').notNull(),
  targetType: text('target_type'),
  targetId: text('target_id'),
  beforeJson: text('before_json'),
  afterJson: text('after_json'),
  reason: text('reason'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── enrichment_runs ─────────────────────────────────────────────────────────

export const enrichmentRuns = sqliteTable('enrichment_runs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  source: text('source').notNull(),
  orgId: integer('org_id').references(() => organizations.id),
  ok: integer('ok').notNull(),
  payload: text('payload'),
  error: text('error'),
  ranAt: text('ran_at').default(sql`CURRENT_TIMESTAMP`),
});

// ─── Type exports ─────────────────────────────────────────────────────────────

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type Opportunity = typeof opportunities.$inferSelect;
export type NewOpportunity = typeof opportunities.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type AuditLogEntry = typeof auditLog.$inferSelect;
export type EnrichmentRun = typeof enrichmentRuns.$inferSelect;
