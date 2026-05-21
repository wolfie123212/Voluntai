// Llama Guard 3 wrapper — screens review text before publish.
// See BUILD_PLAN.md §8.1

// Categories that send a review to pending status (Llama Guard 3 codes)
const FLAGGED_CATEGORIES = new Set(['S2', 'S3', 'S4', 'S5', 'S7', 'S10', 'S12']);

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
  if (!text.trim()) return { safe: true, flags: [], score: 0, raw: null };

  try {
    const result = await ai.run('@cf/meta/llama-guard-3-8b', {
      messages: [{ role: 'user', content: text }],
      max_tokens: 50,
    } as Parameters<Ai['run']>[1]);

    const raw = result as { response?: string };
    const response = (raw?.response ?? '').trim();
    const lines = response.split('\n').map((l) => l.trim()).filter(Boolean);
    const verdict = lines[0]?.toLowerCase();
    const allFlags = lines.slice(1).flatMap((l) => l.match(/S\d+/g) ?? []);
    const flags = allFlags.filter((f) => FLAGGED_CATEGORIES.has(f));

    // Flag if verdict is unsafe OR any flagged category appears
    const safe = verdict === 'safe' && flags.length === 0;

    return {
      safe,
      flags,
      score: safe ? 0.05 : 0.9,
      raw: result,
    };
  } catch (err) {
    // Moderation failure defaults to safe — don't silently block genuine reviews.
    // The review still gets logged; admin can audit.
    console.error('[moderate] Llama Guard error:', err);
    return { safe: true, flags: [], score: 0, raw: null };
  }
}
