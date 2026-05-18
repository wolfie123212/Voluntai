// Llama Guard wrapper — implemented in Phase 4
// See BUILD_PLAN.md §8

// Categories that trigger pending status
const FLAGGED_CATEGORIES = new Set(['S2', 'S5', 'S10', 'S11']);

export interface ModerationResult {
  safe: boolean;
  flags: string[];
  score: number;
  raw: unknown;
}

export async function moderateText(
  ai: Ai,
  text: string
): Promise<ModerationResult> {
  const result = await ai.run('@cf/meta/llama-guard-3-8b', {
    prompt: text,
  } as Parameters<Ai['run']>[1]);

  const raw = result as { response?: string };
  const response = raw?.response ?? '';
  const flags = (response.match(/S\d+/g) ?? []).filter((f) => FLAGGED_CATEGORIES.has(f));

  return {
    safe: flags.length === 0,
    flags,
    score: flags.length > 0 ? 0.9 : 0.05,
    raw: result,
  };
}
