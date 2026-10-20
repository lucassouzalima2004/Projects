// Runs Shopify Theme Check (the same linter as the Shopify CLI) on ../theme.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { themeCheckRun } from '@shopify/theme-check-node';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../theme');
const { offenses } = await themeCheckRun(root, undefined, () => {});
const severity = ['error', 'warning', 'info'];
for (const offense of offenses) {
  const file = offense.uri.replace(`file://${root}/`, '');
  console.log(`${severity[offense.severity]}  ${offense.check}  ${file}:${(offense.start?.line ?? 0) + 1}  ${offense.message}`);
}
console.log(`Theme Check: ${offenses.length} offense(s)`);
if (offenses.some((offense) => offense.severity === 0)) process.exitCode = 1;
