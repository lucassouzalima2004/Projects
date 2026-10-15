// Gera public/assets/js/world-dots.js: o mapa em pontos do painel (mundo e Europa), a partir do Natural Earth.
// Uso (uma vez; o resultado vai para o git):
//   npm install --no-save world-atlas@2 topojson-client@3 d3-geo@3 && node tools/make-map.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
import { geoContains } from 'd3-geo';

const require = createRequire(import.meta.url);
const land = (res) => feature(JSON.parse(readFileSync(require.resolve(`world-atlas/land-${res}.json`))), 'land');

// Grade de pontos em projeção equirretangular (com a longitude encolhida por kx, para a Europa não sair achatada);
// linhas alternadas deslocadas meio passo, o que deixa o desenho mais orgânico
function dots(geo, { lon0, lon1, lat0, lat1, step, scale, kx }) {
  const out = [];
  const lonStep = step / kx;
  let row = 0;
  for (let lat = lat1; lat >= lat0; lat -= step, row++) {
    const shift = row % 2 ? lonStep / 2 : 0;
    for (let lon = lon0 + shift; lon <= lon1; lon += lonStep) {
      if (geoContains(geo, [lon, lat])) out.push(`M${((lon - lon0) * scale * kx).toFixed(1)} ${((lat1 - lat) * scale).toFixed(1)}h0`);
    }
  }
  return out.join('');
}

const views = {
  world: { lon0: -170, lon1: 190, lat0: -56, lat1: 80, step: 2.2, scale: 2, kx: 1, res: '110m' },
  europe: { lon0: -13, lon1: 30, lat0: 34.5, lat1: 60, step: 0.4, scale: 16, kx: 0.7, res: '50m' },
};
const out = {};
for (const [name, v] of Object.entries(views)) {
  const path = dots(land(v.res), v);
  out[name] = {
    lon0: v.lon0,
    lat1: v.lat1,
    scale: v.scale,
    kx: v.kx,
    width: Math.round((v.lon1 - v.lon0) * v.scale * v.kx),
    height: Math.round((v.lat1 - v.lat0) * v.scale),
    dot: +(v.step * v.scale * 0.55).toFixed(2),
    path,
  };
  console.log(name, path.length, 'chars');
}
writeFileSync(
  new URL('../public/assets/js/world-dots.js', import.meta.url),
  `// Gerado por tools/make-map.mjs a partir do Natural Earth (domínio público). Não editar à mão.\nexport const MAPS = ${JSON.stringify(out)};\n`,
);
