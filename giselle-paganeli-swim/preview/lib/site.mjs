// Puts the engine and the sample store together: renders full pages and single sections
// (Section Rendering API) the same way Shopify would.
import { createEngine } from './engine.mjs';
import { createStore } from './store.mjs';

export function createSite({ files, catalog, origin = '', contentForHeader = () => '' }) {
  const locale = JSON.parse(files['locales/en.default.json']);
  const engine = createEngine({
    files,
    locale,
    moneyFormat: catalog.shop.moneyFormat,
    currency: catalog.shop.currency,
    assetBase: `${origin}/assets/`,
  });
  const store = createStore(catalog, { origin });

  const schema = JSON.parse(files['config/settings_schema.json']);
  const data = JSON.parse(files['config/settings_data.json']);
  const preset = typeof data.current === 'string' ? data.presets[data.current] : data.current;
  const rawSettings = { ...preset, ...catalog.settingsOverrides };
  const settingTypes = schema.flatMap((group) => group.settings || []).filter((setting) => setting.id);

  const settingsFor = (resolve) =>
    Object.fromEntries(
      settingTypes.map((setting) => [setting.id, resolve(setting.type, setting.id in rawSettings ? rawSettings[setting.id] : setting.default)])
    );

  const context = ({ path, params, cart, extra }) => {
    const { route, globals } = store.globalsFor({ path, params, cartState: cart, extra });
    globals.settings = settingsFor(globals.__resolve);
    return { route, globals };
  };

  return {
    engine,
    store,

    async renderPage(path, params = new URLSearchParams(), cart = { items: [] }) {
      const { route, globals } = context({ path, params, cart });
      globals.content_for_header = contentForHeader(route, path);
      const { html, layout } = await engine.renderTemplate(route.template, globals);
      globals.content_for_layout = html;
      return { html: await engine.renderLayout(layout, globals), route };
    },

    async renderSection(sectionId, path, params = new URLSearchParams(), cart = { items: [] }, extra = {}) {
      const { globals } = context({ path, params, cart, extra });
      return engine.renderSectionById(sectionId, globals);
    },

    async renderPredictive(terms, cart) {
      const { globals } = context({ path: '/search', params: new URLSearchParams(), cart, extra: { predictive_search: store.predictive(terms) } });
      return engine.renderSectionById('predictive-search', globals);
    },

    async renderRecommendations(sectionId, productId, limit, cart) {
      const product = store.products.find((item) => item.id === Number(productId));
      if (!product) return '';
      const related = store.products
        .filter((item) => item.id !== product.id)
        .sort((a, b) => Number(b.type === product.type) - Number(a.type === product.type) || a.created_index - b.created_index)
        .slice(0, Number(limit) || 4);
      const { globals } = context({
        path: product.url,
        params: new URLSearchParams(),
        cart,
        extra: { product, recommendations: { performed: true, products: related, products_count: related.length } },
      });
      return engine.renderSectionById(sectionId, globals);
    },
  };
}
