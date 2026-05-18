// FTS5 query builder — implemented in Phase 2
// See BUILD_PLAN.md §6

export interface SearchParams {
  q?: string;
  zip?: string;
  radius?: number;
  category?: string;
  limit?: number;
}

export function buildFtsQuery(raw: string): string {
  // Escape FTS5 special chars, then wrap in prefix-match
  return raw.trim().replace(/['"*^()]/g, '').split(/\s+/).filter(Boolean).join(' ');
}
