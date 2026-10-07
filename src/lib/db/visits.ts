// Aggregate visit counts by city. Only Cloudflare's derived location is stored,
// as daily totals; no IP address, user agent, or user id is ever written here.

export interface GeoHint {
  country?: string | null;
  region?: string | null;
  city?: string | null;
}

export type VisitKind = 'view' | 'signin';

export async function recordCityVisit(db: D1Database, geo: GeoHint, kind: VisitKind = 'view'): Promise<void> {
  const day = new Date().toISOString().slice(0, 10);
  const country = (geo.country || 'Unknown').slice(0, 2);
  const region = (geo.region || 'Unknown').slice(0, 80);
  const city = (geo.city || 'Unknown').slice(0, 80);
  const col = kind === 'signin' ? 'signins' : 'views';
  await db
    .prepare(
      `INSERT INTO city_visits_daily (day, country, region, city, ${col})
       VALUES (?, ?, ?, ?, 1)
       ON CONFLICT(day, country, region, city) DO UPDATE SET ${col} = ${col} + 1`
    )
    .bind(day, country, region, city)
    .run();
}

export interface CityRow {
  country: string;
  region: string;
  city: string;
  views: number;
  signins: number;
}

export interface DayRow {
  day: string;
  views: number;
  signins: number;
}

export async function getCityStats(db: D1Database, days: number) {
  const since = new Date(Date.now() - (days - 1) * 86400000).toISOString().slice(0, 10);
  const [cities, daily, totals] = await Promise.all([
    db
      .prepare(
        `SELECT country, region, city, SUM(views) AS views, SUM(signins) AS signins
         FROM city_visits_daily WHERE day >= ?
         GROUP BY country, region, city
         ORDER BY views DESC LIMIT 50`
      )
      .bind(since)
      .all<CityRow>(),
    db
      .prepare(
        `SELECT day, SUM(views) AS views, SUM(signins) AS signins
         FROM city_visits_daily WHERE day >= ?
         GROUP BY day ORDER BY day`
      )
      .bind(since)
      .all<DayRow>(),
    db
      .prepare(
        `SELECT COALESCE(SUM(views),0) AS views, COALESCE(SUM(signins),0) AS signins,
                COUNT(DISTINCT city || '|' || region || '|' || country) AS cities
         FROM city_visits_daily WHERE day >= ?`
      )
      .bind(since)
      .first<{ views: number; signins: number; cities: number }>(),
  ]);
  return { since, cities: cities.results, daily: daily.results, totals: totals ?? { views: 0, signins: 0, cities: 0 } };
}
