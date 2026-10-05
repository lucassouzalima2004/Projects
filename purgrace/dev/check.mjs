// Runs Shopify Theme Check on ../theme and prints the offenses grouped by file.
// Usage: node check.mjs            (recommended checks)
//        node check.mjs --all      (every check, including style suggestions)
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { themeCheckRun } from '@shopify/theme-check-node';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../theme');
const all = process.argv.includes('--all');
const configPath = path.resolve(here, 'node_modules/@shopify/theme-check-node/configs', all ? 'all.yml' : 'recommended.yml');

const { offenses } = await themeCheckRun(root, configPath);
const severity = ['error', 'warning', 'info'];
const byFile = new Map();
for (const o of offenses) {
  const file = path.relative(root, o.uri.replace('file://', ''));
  if (!byFile.has(file)) byFile.set(file, []);
  byFile.get(file).push(o);
}
let errors = 0;
for (const [file, list] of [...byFile].sort()) {
  console.log(`\n${file}`);
  for (const o of list.sort((a, b) => a.start.line - b.start.line)) {
    if (o.severity === 0) errors++;
    console.log(`  ${String(o.start.line + 1).padStart(4)}  ${severity[o.severity].padEnd(7)} ${o.check}: ${o.message}`);
  }
}
console.log(`\n${offenses.length} offenses, ${errors} errors`);
process.exitCode = errors ? 1 : 0;
