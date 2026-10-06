import { d1Query } from './lib/d1';

const stmts = [
  `CREATE TABLE IF NOT EXISTS volunteer_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    org_id INTEGER NOT NULL,
    clicked_at TEXT,
    completed_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, opportunity_id)
  )`,
  'CREATE INDEX IF NOT EXISTS idx_va_user ON volunteer_actions (user_id)',
  'CREATE INDEX IF NOT EXISTS idx_va_completed ON volunteer_actions (completed_at)',
  'CREATE INDEX IF NOT EXISTS idx_va_org ON volunteer_actions (org_id)',
];

for (const sql of stmts) {
  await d1Query(sql, []);
  console.log('✅', sql.slice(0, 70).replace(/\n\s+/g, ' '));
}
console.log('\nDone — volunteer_actions table ready.');
