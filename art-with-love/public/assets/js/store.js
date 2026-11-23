/* Antes de montar a loja, busca o que a Lulu mudou pelo painel (preços, estoque,
 * lançamento da semana). Se demorar ou falhar, a loja abre com o catálogo do arquivo. */
import SHOP from './catalog.js';
import { applyStore } from './merge.js';

try {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2500);
  const res = await fetch('/api/store', { signal: ctrl.signal, headers: { accept: 'application/json' } });
  clearTimeout(timer);
  if (res.ok) applyStore(SHOP, await res.json());
} catch { /* sem painel (ex.: abrindo os arquivos direto): segue com o catálogo */ }
