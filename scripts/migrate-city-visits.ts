import { d1Query } from './lib/d1';

const stmts = [
  `CREATE TABLE IF NOT EXISTS city_visits_daily (
    day TEXT NOT NULL,
    country TEXT NOT NULL,
    region TEXT NOT NULL,
    city TEXT NOT NULL,
    views INTEGER NOT NULL DEFAULT 0,
    signins INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (day, country, region, city)
  )`,
  'CREATE INDEX IF NOT EXISTS idx_cvd_day ON city_visits_daily (day)',
];

for (const sql of stmts) {
  await d1Query(sql, []);
  console.log('✅', sql.slice(0, 60).replace(/\n\s+/g, ' '));
}
console.log('Done — city_visits_daily ready.');
