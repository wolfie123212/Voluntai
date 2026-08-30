// Check all opportunity signup_urls are reachable.
// Run: npx tsx scripts/check-signup-urls.ts
import { d1Query } from './lib/d1';

interface Row {
  org_name: string;
  org_website: string;
  opp_title: string;
  signup_url: string;
}

async function checkUrl(url: string): Promise<{ ok: boolean; status: number | string }> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'CityServ-LinkChecker/1.0' },
    });
    return { ok: res.status < 400, status: res.status };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, status: msg.includes('timeout') ? 'TIMEOUT' : 'ERROR' };
  }
}

async function main() {
  const rows = await d1Query(
    `SELECT o.name as org_name, o.website as org_website,
            opp.title as opp_title, opp.signup_url
     FROM opportunities opp
     JOIN organizations o ON o.id = opp.org_id
     WHERE opp.status = 'published' AND opp.signup_url IS NOT NULL
     ORDER BY o.name, opp.title`,
    []
  ) as unknown as Row[];

  console.log(`Checking ${rows.length} signup URLs…\n`);

  const bad: Row[] = [];
  for (const row of rows) {
    const { ok, status } = await checkUrl(row.signup_url);
    const mark = ok ? '✅' : '❌';
    console.log(`${mark} [${status}] ${row.org_name} — ${row.opp_title}`);
    if (!ok) {
      console.log(`        URL: ${row.signup_url}`);
      console.log(`        ORG: ${row.org_website}`);
      bad.push(row);
    }
  }

  console.log(`\n${'─'.repeat(60)}`);
  if (bad.length === 0) {
    console.log('All signup URLs are reachable ✅');
  } else {
    console.log(`${bad.length} broken URL(s):\n`);
    for (const b of bad) {
      console.log(`  ❌ ${b.org_name}`);
      console.log(`     opp   : ${b.opp_title}`);
      console.log(`     broken: ${b.signup_url}`);
      console.log(`     org   : ${b.org_website}`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
