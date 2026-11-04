// Prepares the site for Cloudflare: copies the static files (public/) and the admin panel (admin/) into dist/,
// and writes worker/build-info.mjs with the fingerprints the pages use to link CSS and JS.
// The pages themselves are rendered by the Worker (worker/index.mjs) from the content published in the panel.
// No dependencies, only Node 18+:  node build.mjs   (then: npx wrangler dev, see README)

import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const pub = join(root, 'public');
const out = join(root, 'dist');

const hash = (file) => createHash('sha1').update(readFileSync(file)).digest('hex').slice(0, 10);
const assets = {
  css: hash(join(pub, 'assets/css/site.css')),
  js: hash(join(pub, 'assets/js/site.js')),
  lenis: hash(join(pub, 'assets/js/lenis.min.js')),
  hero3d: hash(join(pub, 'assets/js/hero3d.js')),
};

// One id for this build of the code, so pages cached in browsers refresh after a deploy
const files = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : [join(dir, f)]));
const code = createHash('sha1');
for (const f of [...files(join(root, 'src')), ...files(join(root, 'admin')), join(root, 'worker/index.mjs'), join(root, 'worker/store.mjs'), join(root, 'worker/auth.mjs')].sort()) code.update(readFileSync(f));
const id = code.digest('hex').slice(0, 10);

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(pub, out, { recursive: true });
cpSync(join(root, 'admin'), join(out, 'admin'), { recursive: true });

// The panel's own files get the build id, so a deploy never mixes old and new panel code
const panel = join(out, 'admin/index.html');
writeFileSync(panel, readFileSync(panel, 'utf8').replace(/__BUILD__/g, id));

writeFileSync(
  join(root, 'worker/build-info.mjs'),
  `// Written by build.mjs. Do not edit.\nexport default ${JSON.stringify({ id, assets }, null, 2)};\n`,
);

console.log(`Built ${out} (static files and the panel) and worker/build-info.mjs, build ${id}`);
