// IRS Exempt Organizations Business Master File (BMF) importer.
// Downloads eo_ny.csv, cross-references against our organizations table by EIN,
// and updates is_irs_501c3 + irs_status flags.
// Run: npx tsx scripts/import-irs-bmf.ts
// Docs: https://www.irs.gov/charities-non-profits/exempt-organizations-business-master-file-extract-eo-bmf

import { d1Query } from './lib/d1';

const BMF_URL = 'https://www.irs.gov/pub/irs-soi/eo_ny.csv';

interface BmfRow {
  ein: string;
  name: string;
  subsection: string;   // "3" = 501(c)(3)
  deductibility: string; // "1" = deductible contributions allowed
  status: string;        // "1" = active
  ruleDate: string;      // YYYYMM
  nteeCode: string;
}

function parseBmfCsv(csv: string): BmfRow[] {
  const lines = csv.split('\n');
  if (lines.length < 2) return [];

  // IRS BMF columns (positional — header may vary, use index):
  // 0:EIN, 1:NAME, 2:ICO, 3:STREET, 4:CITY, 5:STATE, 6:ZIP, 7:GROUP,
  // 8:SUBSECTION, 9:AFFILIATION, 10:CLASSIFICATION, 11:RULING, 12:DEDUCTIBILITY,
  // 13:FOUNDATION, 14:ACTIVITY, 15:ORGANIZATION, 16:STATUS, 17:TAX_PERIOD,
  // 18:ASSET_CD, 19:INCOME_CD, 20:FILING_REQ_CD, 21:PF_FILING_REQ_CD,
  // 22:ACCT_PD, 23:ASSET_AMT, 24:INCOME_AMT, 25:REVENUE_AMT, 26:NTEE_CD, 27:SORT_NAME

  const rows: BmfRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 17) continue;
    rows.push({
      ein: cols[0]?.trim() ?? '',
      name: cols[1]?.trim() ?? '',
      subsection: cols[8]?.trim() ?? '',
      deductibility: cols[12]?.trim() ?? '',
      status: cols[16]?.trim() ?? '',
      ruleDate: cols[11]?.trim() ?? '',
      nteeCode: cols[26]?.trim() ?? '',
    });
  }
  return rows;
}

function buildBmfIndex(rows: BmfRow[]): Map<string, BmfRow> {
  const index = new Map<string, BmfRow>();
  for (const row of rows) {
    if (row.ein) index.set(row.ein.padStart(9, '0'), row);
  }
  return index;
}

function bmfIrsStatus(row: BmfRow): string {
  if (row.status !== '1') return 'REVOKED';
  if (row.subsection === '3') return 'PUBLIC_CHARITY';
  return `501C${row.subsection}`;
}

async function main() {
  console.log('📥 Downloading IRS BMF for New York...');
  const res = await fetch(BMF_URL);
  if (!res.ok) throw new Error(`Failed to download BMF: ${res.status}`);
  const csv = await res.text();
  console.log(`   Downloaded ${Math.round(csv.length / 1024)}KB`);

  console.log('🔍 Parsing BMF...');
  const rows = parseBmfCsv(csv);
  console.log(`   ${rows.length.toLocaleString()} NY exempt organizations found`);

  const bmfIndex = buildBmfIndex(rows);

  console.log('🔗 Cross-referencing with organizations table...');
  const orgs = await d1Query(
    "SELECT id, name, ein FROM organizations WHERE ein IS NOT NULL AND ein != ''"
  );
  console.log(`   ${orgs.length} orgs with EINs to check`);

  let updated = 0;
  let notFound = 0;

  for (const org of orgs) {
    const ein = (org.ein as string).replace('-', '').padStart(9, '0');
    const bmfRow = bmfIndex.get(ein);

    if (!bmfRow) {
      notFound++;
      console.log(`   ⚠️  ${org.name} (EIN ${org.ein}) not found in NY BMF`);
      continue;
    }

    const is501c3 = bmfRow.subsection === '3' && bmfRow.deductibility === '1' && bmfRow.status === '1' ? 1 : 0;
    const status = bmfIrsStatus(bmfRow);

    await d1Query(
      'UPDATE organizations SET is_irs_501c3 = ?, irs_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [is501c3, status, org.id]
    );
    console.log(`   ✓  ${org.name}: 501(c)(3)=${is501c3}, status=${status}`);
    updated++;
  }

  console.log(`\n✅ BMF import complete. Updated: ${updated}, Not found: ${notFound}`);
}

main().catch((err) => {
  console.error('IRS BMF import failed:', err);
  process.exit(1);
});
