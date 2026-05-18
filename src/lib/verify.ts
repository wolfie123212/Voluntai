// Verification enrichment — implemented in Phase 1
// Sources: ProPublica, IRS BMF, AmeriCorps, Charity Navigator
// See BUILD_PLAN.md §5 and §11

export interface VerificationResult {
  isIrs501c3: boolean;
  irsStatus: string | null;
  isAmericorpsGrantee: boolean;
  americorpsProgram: string | null;
  charityNavScore: number | null;
  charityNavStars: number | null;
  charityNavUrl: string | null;
  propublicaLast990Year: number | null;
}

export async function verifyOrg(
  ein: string,
  _env: { CACHE: KVNamespace }
): Promise<VerificationResult> {
  // Stub — full implementation in Phase 1
  void ein;
  return {
    isIrs501c3: false,
    irsStatus: null,
    isAmericorpsGrantee: false,
    americorpsProgram: null,
    charityNavScore: null,
    charityNavStars: null,
    charityNavUrl: null,
    propublicaLast990Year: null,
  };
}
