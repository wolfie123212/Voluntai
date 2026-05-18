// ZIP → lat/lon lookup for NYC — fully implemented in Phase 2
// See BUILD_PLAN.md §6.4

// East Village ZIPs in scope for MVP
export const MVP_ZIPS = ['10003', '10009', '10002'];

export interface LatLon {
  lat: number;
  lon: number;
}

// Populated from NYC Open Data in Phase 2; stub centroid for now
const ZIP_CENTROIDS: Record<string, LatLon> = {
  '10003': { lat: 40.7316, lon: -73.9896 },
  '10009': { lat: 40.7266, lon: -73.9796 },
  '10002': { lat: 40.7157, lon: -73.9863 },
};

export function zipToLatLon(zip: string): LatLon | null {
  return ZIP_CENTROIDS[zip] ?? null;
}

export function haversineMiles(a: LatLon, b: LatLon): number {
  const R = 3958.8;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}
