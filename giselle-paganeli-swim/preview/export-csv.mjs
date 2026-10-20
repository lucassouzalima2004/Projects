// Writes ../shopify/products-import.csv (Shopify admin › Products › Import) from the sample catalog.
// Products are created as drafts with 0 stock: replace prices, texts and photos before publishing.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { products } from './data/catalog.mjs';
import { handleize } from './lib/engine.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const target = path.resolve(here, '../shopify/products-import.csv');

const columns = [
  'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published',
  'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value',
  'Variant SKU', 'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy',
  'Variant Fulfillment Service', 'Variant Price', 'Variant Requires Shipping', 'Variant Taxable',
  'Fit (product.metafields.custom.fit)', 'Status',
];

const cell = (value) => {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const rows = [columns];
for (const product of products) {
  let first = true;
  for (const color of product.colors) {
    for (const size of product.sizes) {
      rows.push([
        product.handle,
        first ? product.title : '',
        first ? product.description : '',
        first ? 'Giselle Paganeli Swim' : '',
        first ? product.type : '',
        first ? ['The Garden of Eden 2027', ...product.tags].join(', ') : '',
        first ? 'FALSE' : '',
        first ? 'Color' : '',
        color,
        first ? 'Size' : '',
        size,
        `${handleize(product.title).toUpperCase()}-${color.slice(0, 3).toUpperCase()}-${size}`,
        'shopify',
        0,
        'deny',
        'manual',
        (product.price / 100).toFixed(2),
        'TRUE',
        'TRUE',
        first ? product.fit : '',
        first ? 'draft' : '',
      ]);
      first = false;
    }
  }
}

await fs.mkdir(path.dirname(target), { recursive: true });
await fs.writeFile(target, `${rows.map((row) => row.map(cell).join(',')).join('\n')}\n`);
console.log(`${rows.length - 1} variants → ${path.relative(process.cwd(), target)}`);
