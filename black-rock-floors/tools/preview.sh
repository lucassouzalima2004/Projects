#!/bin/bash
# Publica uma PRÉVIA separada do site, para o Gabriel aprovar antes de ir para o domínio.
# Não mexe no blackrockfloors.com: é outro Worker, no endereço .workers.dev, que o Google não indexa.
#
# Uso (na conta Cloudflare do Lucas, com o login do wrangler): bash tools/preview.sh
set -euo pipefail
cd "$(dirname "$0")/.."

WORKER=blackrock-remodeling-preview
SITE_URL="https://$WORKER.lucassouzalima10.workers.dev"
OUT=_site

rm -rf "$OUT"
mkdir -p "$OUT"
rsync -a --exclude _site --exclude .wrangler --exclude tools --exclude README.md --exclude .gitignore \
  --exclude .claude --exclude worker.js --exclude __pycache__ --exclude wrangler.preview.jsonc ./ "$OUT"/

# O mesmo que o deploy faz em cada página: endereço completo no og:image, canonical e og:url
python3 -E - "$OUT" "$SITE_URL" <<'PY'
import pathlib, re, sys
out, site = pathlib.Path(sys.argv[1]), sys.argv[2]
paths = []
for f in sorted(out.rglob('index.html')):
    path = '/' + str(f.parent.relative_to(out)).replace('.', '', 1) if f.parent == out else f'/{f.parent.relative_to(out)}/'
    paths.append(path)
    s = f.read_text()
    s = re.sub(r'content="(?:\.\./)*assets/img/og-image\.jpg(\?v=\d+)?"', lambda m: f'content="{site}/assets/img/og-image.jpg{m.group(1) or ""}"', s)
    s = s.replace('</title>', f'</title>\n  <link rel="canonical" href="{site}{path}">\n  <meta property="og:url" content="{site}{path}">', 1)
    f.write_text(s)
urls = ''.join(f'  <url><loc>{site}{p}</loc></url>\n' for p in paths)
(out / 'sitemap.xml').write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n')
(out / 'robots.txt').write_text('User-agent: *\nDisallow: /\n')
print(len(paths), 'páginas')
PY

cat > wrangler.preview.jsonc <<EOF
{
  "name": "$WORKER",
  "main": "./worker.js",
  "compatibility_date": "2025-10-01",
  "workers_dev": true,
  "preview_urls": false,
  "vars": { "MAIL_TO": "br.remodelingwa@gmail.com", "MAIL_FROM": "Black Rock Website <estimates@send.blackrockfloors.com>" },
  "assets": {
    "directory": "./$OUT",
    "binding": "ASSETS",
    "not_found_handling": "none",
    "html_handling": "auto-trailing-slash",
    "run_worker_first": ["/assets/video/*", "/api/*"]
  }
}
EOF

if [ "${1:-}" = "--dev" ]; then
  # Testa no computador com o Worker de verdade (vídeo por pedaços, /api/estimate, _redirects)
  exec env -u CLOUDFLARE_API_TOKEN -u CF_API_TOKEN npx --yes wrangler@4 dev --config wrangler.preview.jsonc --port 8787
fi
env -u CLOUDFLARE_API_TOKEN -u CF_API_TOKEN npx --yes wrangler@4 deploy --config wrangler.preview.jsonc
