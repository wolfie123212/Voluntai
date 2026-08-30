import { d1Query } from './lib/d1';
const rows = await d1Query("SELECT slug, name FROM organizations WHERE name LIKE '%Church Street%' OR name LIKE '%Fourth Arts%' OR name LIKE '%Grace Church%' OR name LIKE '%Jewish Conservancy%' OR name LIKE '%Printshop%' OR name LIKE '%Mark%' OR name LIKE '%United Jewish%'", []);
rows.forEach(r => console.log(r.slug, '|', r.name));
