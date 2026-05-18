// Cloudflare Web Analytics event helpers — wired in Phase 2
// See BUILD_PLAN.md §2 (Cloudflare Web Analytics)

export type AnalyticsEvent =
  | { name: 'search'; props: { q: string; zip: string; results: number } }
  | { name: 'org_view'; props: { slug: string } }
  | { name: 'review_submit'; props: { org_slug: string } };

// Client-side beacon via cf.js — server side is a no-op
export function trackEvent(_event: AnalyticsEvent): void {
  // Browser implementation injected by Cloudflare Web Analytics script tag
}
