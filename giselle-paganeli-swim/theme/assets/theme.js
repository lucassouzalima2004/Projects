/* Eden — theme scripts for Giselle Paganeli Swim. No dependencies. */
(() => {
  const theme = window.theme || {};
  const routes = theme.routes || {};
  const strings = theme.strings || {};
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isDesktop = window.matchMedia('(min-width: 990px)');

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const debounce = (fn, wait = 250) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  };

  const fetchHTML = async (url, options = {}) => {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`${response.status}`);
    return new DOMParser().parseFromString(await response.text(), 'text/html');
  };

  const storage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        /* storage unavailable: keep the default */
      }
    },
  };

  let toastTimer;
  const toast = (message) => {
    const el = qs('[data-toast]');
    if (!el || !message) return;
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.hidden = true;
    }, 3600);
  };

  const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const trapFocus = (container, event) => {
    const items = qsa(FOCUSABLE, container).filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  /* ---------- Reveal on scroll ---------- */
  const revealObserver =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target.classList.add('is-revealed');
              revealObserver.unobserve(entry.target);
            });
          },
          { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
        )
      : null;

  const observeReveals = (root = document) => {
    qsa('[data-reveal]:not(.is-revealed)', root).forEach((el) => {
      if (revealObserver) revealObserver.observe(el);
      else el.classList.add('is-revealed');
    });
  };

  /* ---------- Drawers (menu, cart, search, filters, size guide) ---------- */
  class SideDrawer extends HTMLElement {
    connectedCallback() {
      this.panel = qs('.drawer__panel', this);
      if (!this.classList.contains('is-open')) this.inert = true;
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-drawer-close]')) this.close();
      });
      this.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') this.close();
        if (event.key === 'Tab') trapFocus(this.panel, event);
      });
    }

    open(trigger) {
      if (this.classList.contains('is-open')) return;
      SideDrawer.closeAll(this);
      this.trigger = trigger || document.activeElement;
      this.inert = false;
      this.classList.add('is-open');
      this.setAttribute('aria-hidden', 'false');
      qsa(`[aria-controls="${this.id}"]`).forEach((el) => el.setAttribute('aria-expanded', 'true'));
      document.body.classList.add('is-locked');
      requestAnimationFrame(() => {
        const target = qs('input[type="search"]', this) || this.panel;
        target.focus({ preventScroll: true });
      });
      this.dispatchEvent(new CustomEvent('drawer:open', { bubbles: true }));
    }

    close() {
      if (!this.classList.contains('is-open')) return;
      this.classList.remove('is-open');
      this.setAttribute('aria-hidden', 'true');
      this.inert = true;
      qsa(`[aria-controls="${this.id}"]`).forEach((el) => el.setAttribute('aria-expanded', 'false'));
      if (!qs('side-drawer.is-open')) document.body.classList.remove('is-locked');
      if (this.trigger && document.contains(this.trigger)) this.trigger.focus({ preventScroll: true });
    }

    static closeAll(except) {
      qsa('side-drawer.is-open').forEach((drawer) => drawer !== except && drawer.close());
    }
  }
  customElements.define('side-drawer', SideDrawer);

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-drawer-open]');
    if (!opener) return;
    const drawer = document.getElementById(opener.dataset.drawerOpen);
    if (!drawer || typeof drawer.open !== 'function') return;
    event.preventDefault();
    drawer.open(opener);
  });

  /* ---------- Header ---------- */
  class SiteHeader extends HTMLElement {
    connectedCallback() {
      this.section = this.closest('.section-header') || this;
      this.mode = this.dataset.sticky;
      this.lastY = window.scrollY;
      this.onScroll = this.onScroll.bind(this);
      window.addEventListener('scroll', this.onScroll, { passive: true });
      if ('ResizeObserver' in window) new ResizeObserver(() => this.measure()).observe(this.section);
      this.measure();
      this.onScroll();
      this.initMega();
    }

    measure() {
      this.height = this.section.offsetHeight;
      document.documentElement.style.setProperty('--header-h', `${this.height}px`);
      this.updateOffset();
    }

    updateOffset() {
      const visible = this.mode !== 'none' && !this.section.classList.contains('is-hidden');
      document.documentElement.style.setProperty('--header-offset', `${visible ? this.height : 0}px`);
    }

    onScroll() {
      const y = window.scrollY;
      this.classList.toggle('is-solid', y > 24);
      this.classList.toggle('is-condensed', y > 140);
      if (this.mode === 'scroll-up' && Math.abs(y - this.lastY) > 6) {
        const hide = y > this.lastY && y > this.height * 2 && !qs('.menu__item.is-open', this);
        this.section.classList.toggle('is-hidden', hide);
        this.updateOffset();
      }
      this.lastY = y;
    }

    initMega() {
      qsa('[data-mega-toggle]', this).forEach((button) => {
        const item = button.closest('.menu__item');
        let timer;
        const open = () => {
          clearTimeout(timer);
          qsa('.menu__item.is-open', this).forEach((other) => other !== item && this.closeItem(other));
          item.classList.add('is-open');
          button.setAttribute('aria-expanded', 'true');
          this.classList.add('is-menu-open');
        };
        item.addEventListener('mouseenter', () => {
          if (window.matchMedia('(hover: hover)').matches) open();
        });
        item.addEventListener('mouseleave', () => {
          timer = setTimeout(() => this.closeItem(item), 160);
        });
        button.addEventListener('click', () => (item.classList.contains('is-open') ? this.closeItem(item) : open()));
        item.addEventListener('keydown', (event) => {
          if (event.key !== 'Escape') return;
          this.closeItem(item);
          button.focus();
        });
        item.addEventListener('focusout', (event) => {
          if (!item.contains(event.relatedTarget)) this.closeItem(item);
        });
      });
    }

    closeItem(item) {
      item.classList.remove('is-open');
      const button = qs('[data-mega-toggle]', item);
      if (button) button.setAttribute('aria-expanded', 'false');
      if (!qs('.menu__item.is-open', this)) this.classList.remove('is-menu-open');
    }
  }
  customElements.define('site-header', SiteHeader);

  class AnnouncementBar extends HTMLElement {
    connectedCallback() {
      const items = qsa('.announcement__item', this);
      if (items.length < 2 || reduceMotion.matches) return;
      let index = 0;
      this.timer = setInterval(() => {
        items[index].classList.remove('is-active');
        index = (index + 1) % items.length;
        items[index].classList.add('is-active');
      }, (Number(this.dataset.interval) || 5) * 1000);
    }

    disconnectedCallback() {
      clearInterval(this.timer);
    }
  }
  customElements.define('announcement-bar', AnnouncementBar);

  /* ---------- Hero: the arch opens as you scroll ---------- */
  class GardenHero extends HTMLElement {
    connectedCallback() {
      if (reduceMotion.matches) this.classList.remove('hero--reveal');
      if (!this.classList.contains('hero--reveal')) return;
      this.windowEl = qs('.hero__window', this);
      this.intro = qs('.hero__intro', this);
      this.update = this.update.bind(this);
      this.measure = this.measure.bind(this);
      this.onScroll = () => {
        if (this.ticking) return;
        this.ticking = true;
        requestAnimationFrame(this.update);
      };
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.measure);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(this.measure);
      this.measure();
    }

    disconnectedCallback() {
      window.removeEventListener('scroll', this.onScroll);
      window.removeEventListener('resize', this.measure);
    }

    measure() {
      if (!this.windowEl || !this.intro) return;
      const top = Math.min(this.intro.offsetTop + this.intro.offsetHeight + 28, window.innerHeight * 0.62);
      this.windowEl.style.setProperty('--top', `${top}px`);
      this.update();
    }

    update() {
      this.ticking = false;
      const distance = Math.max(1, (this.offsetHeight - window.innerHeight) * 0.8);
      const progress = Math.min(1, Math.max(0, -this.getBoundingClientRect().top / distance));
      this.style.setProperty('--p', progress.toFixed(4));
      this.classList.toggle('is-open', progress > 0.75);
    }
  }
  customElements.define('garden-hero', GardenHero);

  /* ---------- Cart ---------- */
  const Cart = {
    sectionIds() {
      const ids = qsa('cart-items[data-section]').map((el) => el.dataset.section);
      return [...new Set(ids.length ? ids : qs('#CartDrawer') ? ['cart-drawer'] : [])];
    },

    async request(url, body) {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...body, sections: this.sectionIds(), sections_url: window.location.pathname }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.status) throw new Error(data.description || data.message || strings.cartError);
      this.render(data.sections || {}, data);
      return data;
    },

    add(items) {
      return this.request(`${routes.cartAdd}.js`, { items });
    },

    change(line, quantity) {
      return this.request(`${routes.cartChange}.js`, { line, quantity });
    },

    render(sections, data) {
      let count = typeof data.item_count === 'number' ? data.item_count : null;
      Object.entries(sections).forEach(([id, html]) => {
        if (!html) return;
        const doc = new DOMParser().parseFromString(html, 'text/html');
        if (id === 'cart-drawer') {
          const fresh = qs('#CartContents', doc);
          const current = qs('#CartContents');
          if (fresh && current) current.replaceWith(fresh);
          if (fresh) count = Number(fresh.dataset.itemCount);
        } else {
          const current = qs(`cart-items[data-section="${id}"]`);
          const page = current && current.closest('.cart-page');
          const fresh = qs('.cart-page', doc);
          if (page && fresh) page.replaceWith(fresh);
          observeReveals(document);
        }
      });
      if (count !== null) this.updateCount(count);
    },

    updateCount(count) {
      qsa('[data-cart-count]').forEach((badge) => {
        badge.hidden = count === 0;
        const value = qs('[data-cart-count-value]', badge);
        if (value) value.textContent = count;
        badge.classList.remove('is-bumped');
        void badge.offsetWidth;
        badge.classList.add('is-bumped');
      });
    },

    open() {
      const drawer = qs('#CartDrawer');
      if (drawer && typeof drawer.open === 'function') drawer.open();
      else window.location.href = routes.cart;
    },
  };
  window.EdenCart = Cart;

  const updateLine = async (line, quantity, source) => {
    const wrap = source && source.closest('cart-items');
    if (wrap) wrap.classList.add('is-loading');
    try {
      await Cart.change(line, quantity);
    } catch (error) {
      toast(error.message);
      if (wrap) wrap.classList.remove('is-loading');
    }
  };

  const lineTimers = new Map();

  document.addEventListener('click', (event) => {
    const step = event.target.closest('[data-qty-step]');
    if (step) {
      const input = qs('.qty__input', step.closest('[data-qty]'));
      input.value = Math.max(0, (Number(input.value) || 0) + Number(step.dataset.qtyStep));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }
    const remove = event.target.closest('[data-line-remove]');
    if (remove) {
      event.preventDefault();
      updateLine(Number(remove.dataset.lineRemove), 0, remove);
    }
  });

  document.addEventListener('change', (event) => {
    const target = event.target;
    if (target.matches('.qty__input[data-line]')) {
      const line = Number(target.dataset.line);
      clearTimeout(lineTimers.get(line));
      lineTimers.set(
        line,
        setTimeout(() => updateLine(line, Math.max(0, Number(target.value) || 0), target), 350)
      );
    } else if (target.matches('[data-cart-note]')) {
      fetch(`${routes.cartUpdate}.js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ note: target.value }),
      });
    } else if (target.matches('[data-auto-submit]') && target.form) {
      target.form.submit();
    }
  });

  /* ---------- Product page ---------- */
  class ProductInfo extends HTMLElement {
    connectedCallback() {
      const json = qs('[data-product-json]', this);
      if (!json) return;
      this.data = JSON.parse(json.textContent);
      this.form = qs('form.product-form', this);
      this.idInput = qs('[data-variant-id]', this);
      this.button = qs('[data-add-button]', this);
      this.label = qs('[data-add-label]', this);
      this.error = qs('[data-form-error]', this);
      this.optionCount = this.data.variants.length ? this.data.variants[0].options.length : 0;

      this.addEventListener('change', (event) => {
        if (event.target.matches('.variant-picker__input')) this.onChange(event.target);
      });

      const fromUrl = new URL(window.location.href).searchParams.get('variant');
      const preset = fromUrl && this.data.variants.find((variant) => String(variant.id) === fromUrl);
      if (preset) this.selectOptions(preset.options);
      else this.onChange();

      if (this.form) {
        this.form.addEventListener('submit', (event) => this.onSubmit(event));
      }
      this.setupStickyBuy();
    }

    selected() {
      return Array.from({ length: this.optionCount }, (_, index) => {
        const checked = qs(`.variant-picker__option[data-option-index="${index}"] input:checked`, this);
        return checked ? checked.value : null;
      });
    }

    selectOptions(options) {
      options.forEach((value, index) => {
        const input = qsa(`.variant-picker__option[data-option-index="${index}"] input`, this).find((el) => el.value === value);
        if (input) input.checked = true;
      });
      this.onChange();
    }

    onChange(changed) {
      const selected = this.selected();
      qsa('.variant-picker__option', this).forEach((fieldset) => {
        const value = qs('[data-option-value]', fieldset);
        if (value) value.textContent = selected[Number(fieldset.dataset.optionIndex)] || '';
        if (selected[Number(fieldset.dataset.optionIndex)]) fieldset.classList.remove('is-missing');
      });

      const complete = selected.every((value) => value !== null);
      const variant = complete
        ? this.data.variants.find((item) => item.options.every((option, index) => option === selected[index]))
        : null;

      this.markAvailability(selected);
      this.render(variant, complete);

      const optionIndex = changed ? Number(changed.closest('[data-option-index]').dataset.optionIndex) : null;
      if (changed && optionIndex === this.data.colorIndex) {
        const withMedia = this.data.variants.find((item) => item.options[optionIndex] === changed.value && item.media);
        const gallery = qs('product-gallery', this);
        if (withMedia && gallery && gallery.goTo) gallery.goTo(withMedia.media);
      }
    }

    markAvailability(selected) {
      qsa('.variant-picker__option', this).forEach((fieldset) => {
        const index = Number(fieldset.dataset.optionIndex);
        qsa('.variant-picker__input', fieldset).forEach((input) => {
          const available = this.data.variants.some(
            (variant) =>
              variant.available &&
              variant.options[index] === input.value &&
              variant.options.slice(0, index).every((option, j) => selected[j] === null || option === selected[j])
          );
          input.classList.toggle('is-unavailable', !available);
        });
      });
    }

    render(variant, complete) {
      this.variant = variant || null;
      if (this.idInput) this.idInput.value = variant ? variant.id : '';
      if (this.error) this.error.hidden = true;

      if (variant) {
        const current = qs('.product__price [data-price-current]', this);
        const compare = qs('.product__price [data-price-compare]', this);
        const price = qs('.product__price .price', this);
        if (current) current.textContent = variant.price;
        if (compare) {
          compare.hidden = !variant.compare;
          const compareValue = qs('[data-price-compare-value]', compare);
          if (compareValue) compareValue.textContent = variant.compare || '';
        }
        if (price) price.classList.toggle('price--sale', Boolean(variant.compare));
        const stickyPrice = qs('[data-sticky-price]', this);
        if (stickyPrice) stickyPrice.textContent = variant.price;
        const url = new URL(window.location.href);
        url.searchParams.set('variant', variant.id);
        window.history.replaceState(window.history.state, '', url);
      }

      if (!this.button) return;
      let text = strings.addToCart;
      let disabled = false;
      if (!complete) {
        text = strings.selectSize;
        disabled = true;
      } else if (!variant) {
        text = strings.unavailable;
        disabled = true;
      } else if (!variant.available) {
        text = strings.soldOut;
        disabled = true;
      }
      this.button.disabled = disabled;
      if (this.label) this.label.textContent = text;
    }

    flagMissing() {
      const missing = qsa('.variant-picker__option', this).filter(
        (fieldset) => !qs('input:checked', fieldset)
      );
      missing.forEach((fieldset) => fieldset.classList.add('is-missing'));
      const picker = qs('[data-variant-picker]', this);
      if (picker) picker.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
      toast(strings.selectSize);
    }

    async onSubmit(event) {
      if (!this.idInput.value) {
        event.preventDefault();
        this.flagMissing();
        return;
      }
      if (theme.cartType !== 'drawer') return;
      event.preventDefault();
      this.button.classList.add('is-loading');
      this.button.disabled = true;
      try {
        await Cart.add([{ id: Number(this.idInput.value), quantity: 1 }]);
        Cart.open();
      } catch (error) {
        if (this.error) {
          this.error.textContent = error.message;
          this.error.hidden = false;
        }
      } finally {
        this.button.classList.remove('is-loading');
        this.render(this.variant, this.selected().every((value) => value !== null));
      }
    }

    setupStickyBuy() {
      const bar = qs('[data-sticky-buy]', this);
      if (!bar || !this.button || !('IntersectionObserver' in window)) return;
      const action = qs('[data-sticky-add]', bar);
      new IntersectionObserver(([entry]) => {
        const show = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        bar.classList.toggle('is-visible', show);
        bar.setAttribute('aria-hidden', String(!show));
        action.tabIndex = show ? 0 : -1;
      }).observe(this.button);
      action.addEventListener('click', () => {
        if (!this.variant) {
          this.flagMissing();
          return;
        }
        if (this.form.requestSubmit) this.form.requestSubmit();
        else this.form.submit();
      });
    }
  }
  customElements.define('product-info', ProductInfo);

  class ProductGallery extends HTMLElement {
    connectedCallback() {
      this.list = qs('[data-media-list]', this);
      if (!this.list) return;
      this.counter = qs('[data-counter-current]', this);
      this.dots = qsa('.product__dot', this);
      this.list.addEventListener('scroll', debounce(() => this.sync(), 50), { passive: true });
      this.addEventListener('click', (event) => {
        const zoom = event.target.closest('[data-zoom]');
        if (zoom) this.zoom(Number(zoom.dataset.zoom));
      });
    }

    items() {
      return qsa('.product__media-item', this.list);
    }

    sync() {
      const index = Math.round(this.list.scrollLeft / Math.max(1, this.list.clientWidth));
      this.dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
      if (this.counter) this.counter.textContent = index + 1;
    }

    goTo(mediaId) {
      const item = this.items().find((el) => el.dataset.mediaId === String(mediaId));
      if (!item) return;
      if (isDesktop.matches) {
        this.list.prepend(item);
        const top = this.getBoundingClientRect().top;
        if (top < 0) window.scrollBy({ top: top - 100, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      } else {
        this.list.scrollTo({ left: item.offsetLeft, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      }
    }

    zoom(index) {
      const dialog = qs('[data-zoom-dialog]');
      if (!dialog || typeof dialog.showModal !== 'function') return;
      dialog.showModal();
      document.body.classList.add('is-locked');
      const target = qsa('.zoom__list li', dialog)[index];
      if (target) target.scrollIntoView({ block: 'start' });
      if (!dialog.dataset.bound) {
        dialog.dataset.bound = 'true';
        qs('[data-zoom-close]', dialog).addEventListener('click', () => dialog.close());
        dialog.addEventListener('close', () => document.body.classList.remove('is-locked'));
        dialog.addEventListener('click', (event) => {
          if (event.target.tagName === 'IMG') dialog.close();
        });
      }
    }
  }
  customElements.define('product-gallery', ProductGallery);

  /* ---------- Product card: swatches and quick add ---------- */
  class ProductCard extends HTMLElement {
    connectedCallback() {
      const json = qs('[data-card-variants]', this);
      if (!json) return;
      this.variants = JSON.parse(json.textContent);
      this.colorIndex = this.dataset.colorIndex === '' ? null : Number(this.dataset.colorIndex);
      this.sizeIndex = this.dataset.sizeIndex === '' ? null : Number(this.dataset.sizeIndex);
      this.color = this.dataset.currentColor || null;
      this.addEventListener('click', (event) => {
        const swatch = event.target.closest('.swatch[data-color]');
        if (swatch) {
          event.preventDefault();
          this.setColor(swatch.dataset.color);
          return;
        }
        const size = event.target.closest('.card__size');
        if (size) {
          event.preventDefault();
          this.quickAdd(size);
          return;
        }
        const toggle = event.target.closest('[data-quick-toggle]');
        if (toggle) {
          const panel = qs('[data-quick-add]', this);
          const open = !panel.classList.contains('is-open');
          panel.classList.toggle('is-open', open);
          toggle.setAttribute('aria-expanded', String(open));
        }
      });
      this.refreshSizes();
    }

    setColor(color) {
      this.color = color;
      qsa('.swatch[data-color]', this).forEach((swatch) => {
        const active = swatch.dataset.color === color;
        swatch.classList.toggle('is-active', active);
        swatch.setAttribute('aria-pressed', String(active));
      });
      const variants = this.variants.filter((variant) => variant.options[this.colorIndex] === color);
      const withImage = variants.find((variant) => variant.image) || variants[0];
      if (withImage) {
        const image = qs('.card__img--primary', this);
        if (image && withImage.image) {
          image.removeAttribute('srcset');
          image.src = withImage.image;
        }
        qsa('[data-card-link]', this).forEach((link) => {
          link.href = withImage.url;
        });
      }
      this.refreshSizes();
    }

    match(size) {
      return this.variants.find(
        (variant) =>
          (this.colorIndex === null || variant.options[this.colorIndex] === this.color) &&
          variant.options[this.sizeIndex] === size
      );
    }

    refreshSizes() {
      if (this.sizeIndex === null) return;
      qsa('.card__size', this).forEach((button) => {
        const variant = this.match(button.dataset.size);
        button.disabled = !variant || !variant.available;
      });
    }

    async quickAdd(button) {
      const variant = this.match(button.dataset.size);
      if (!variant || !variant.available) return;
      if (theme.cartType !== 'drawer') {
        window.location.href = `${routes.cartAdd}?id=${variant.id}&quantity=1`;
        return;
      }
      button.classList.add('is-loading');
      try {
        await Cart.add([{ id: variant.id, quantity: 1 }]);
        Cart.open();
      } catch (error) {
        toast(error.message);
      } finally {
        button.classList.remove('is-loading');
      }
    }
  }
  customElements.define('product-card', ProductCard);

  /* ---------- Collection filters ---------- */
  class FacetFilters extends HTMLElement {
    connectedCallback() {
      this.sectionId = this.dataset.section;
      this.form = qs('[data-facet-form]', this);
      this.dataset.cols = storage.get('eden:cols') || 'many';
      this.syncColumns();

      this.addEventListener('click', (event) => {
        const columns = event.target.closest('.toolbar__cols');
        if (columns) {
          this.dataset.cols = columns.dataset.cols;
          storage.set('eden:cols', columns.dataset.cols);
          this.syncColumns();
          return;
        }
        const link = event.target.closest('[data-facet-link]');
        if (link) {
          event.preventDefault();
          this.load(new URL(link.href, window.location.href).searchParams.toString());
        }
      });

      this.addEventListener('change', (event) => {
        if (event.target.name === 'sort_by' || event.target.type === 'checkbox') this.submit();
      });
      this.addEventListener(
        'input',
        debounce((event) => {
          if (event.target.type === 'number') this.submit();
        }, 600)
      );
      if (this.form) this.form.addEventListener('submit', (event) => {
        event.preventDefault();
        this.submit();
      });
      window.addEventListener('popstate', () => this.load(window.location.search.slice(1), false));
    }

    syncColumns() {
      qsa('.toolbar__cols', this).forEach((button) =>
        button.setAttribute('aria-pressed', String(button.dataset.cols === this.dataset.cols))
      );
    }

    params() {
      const params = new URLSearchParams();
      if (!this.form) return params.toString();
      new FormData(this.form).forEach((value, key) => {
        if (value !== '') params.append(key, value);
      });
      return params.toString();
    }

    submit() {
      this.load(this.params());
    }

    async load(search, push = true) {
      const grid = qs('[data-swap="grid"]', this);
      if (grid) grid.classList.add('is-loading');
      const openFacets = qsa('.facet', this).map((facet) => facet.open);
      const query = search ? `${search}&` : '';
      try {
        const doc = await fetchHTML(`${window.location.pathname}?${query}section_id=${this.sectionId}`);
        qsa('[data-swap]', this).forEach((el) => {
          const fresh = qs(`[data-swap="${el.dataset.swap}"]`, doc);
          if (fresh) el.innerHTML = fresh.innerHTML;
        });
        qsa('.facet', this).forEach((facet, index) => {
          if (openFacets[index] !== undefined) facet.open = openFacets[index];
        });
        observeReveals(this);
        if (push) window.history.pushState({}, '', `${window.location.pathname}${search ? `?${search}` : ''}`);
      } catch (error) {
        window.location.href = `${window.location.pathname}${search ? `?${search}` : ''}`;
      } finally {
        if (grid) grid.classList.remove('is-loading');
      }
    }
  }
  customElements.define('facet-filters', FacetFilters);

  /* ---------- Predictive search ---------- */
  class PredictiveSearch extends HTMLElement {
    connectedCallback() {
      this.input = qs('input[type="search"]', this);
      this.results = qs('[data-results]', this);
      this.suggestions = qs('[data-search-suggestions]', this);
      if (this.dataset.enabled !== 'true' || !this.input) return;
      this.input.addEventListener('input', debounce(() => this.search(), 260));
    }

    async search() {
      const terms = this.input.value.trim();
      if (this.controller) this.controller.abort();
      if (!terms) {
        this.results.innerHTML = '';
        if (this.suggestions) this.suggestions.hidden = false;
        this.input.setAttribute('aria-expanded', 'false');
        return;
      }
      this.controller = new AbortController();
      const params = new URLSearchParams({
        q: terms,
        'resources[type]': 'product,collection,page,query',
        'resources[limit]': '4',
        'resources[options][unavailable_products]': 'last',
        section_id: 'predictive-search',
      });
      try {
        const doc = await fetchHTML(`${routes.predictiveSearch}?${params}`, { signal: this.controller.signal });
        const content = qs('#shopify-section-predictive-search', doc) || doc.body;
        this.results.innerHTML = content.innerHTML;
        if (this.suggestions) this.suggestions.hidden = true;
        this.input.setAttribute('aria-expanded', 'true');
      } catch (error) {
        if (error.name !== 'AbortError') this.results.innerHTML = '';
      }
    }
  }
  customElements.define('predictive-search', PredictiveSearch);

  /* ---------- Recommendations ---------- */
  class ProductRecommendations extends HTMLElement {
    connectedCallback() {
      if (!this.dataset.url || !('IntersectionObserver' in window)) return;
      const observer = new IntersectionObserver(
        async ([entry]) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          try {
            const doc = await fetchHTML(this.dataset.url);
            const fresh = qs('product-recommendations', doc);
            if (fresh && fresh.innerHTML.trim()) {
              this.innerHTML = fresh.innerHTML;
              observeReveals(this);
            }
          } catch (error) {
            /* recommendations are optional */
          }
        },
        { rootMargin: '0px 0px 500px 0px' }
      );
      observer.observe(this);
    }
  }
  customElements.define('product-recommendations', ProductRecommendations);

  /* ---------- Featured collection tabs ---------- */
  class CollectionTabs extends HTMLElement {
    connectedCallback() {
      this.tabs = qsa('[role="tab"]', this);
      this.tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => this.select(index));
        tab.addEventListener('keydown', (event) => {
          if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
          const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + this.tabs.length) % this.tabs.length;
          this.select(next);
          this.tabs[next].focus();
        });
      });
    }

    select(index) {
      this.tabs.forEach((tab, i) => {
        const active = i === index;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        if (panel) {
          panel.hidden = !active;
          if (active) qsa('[data-reveal]', panel).forEach((el) => el.classList.add('is-revealed'));
        }
      });
    }
  }
  customElements.define('collection-tabs', CollectionTabs);

  /* ---------- Lookbook hotspots ---------- */
  class LookHotspot extends HTMLElement {
    connectedCallback() {
      this.button = qs('.hotspot__dot', this);
      this.card = qs('.hotspot__card', this);
      if (!this.button || !this.card) return;
      this.classList.toggle('is-flipped', parseFloat(this.style.getPropertyValue('--y')) < 35);
      this.button.addEventListener('click', (event) => {
        event.stopPropagation();
        this.toggle(this.card.hidden);
      });
      this.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          this.toggle(false);
          this.button.focus();
        }
      });
    }

    toggle(open) {
      if (open) qsa('look-hotspot').forEach((spot) => spot !== this && spot.toggle && spot.toggle(false));
      this.card.hidden = !open;
      this.button.setAttribute('aria-expanded', String(open));
    }
  }
  customElements.define('look-hotspot', LookHotspot);

  document.addEventListener('click', (event) => {
    if (event.target.closest('look-hotspot')) return;
    qsa('look-hotspot').forEach((spot) => spot.toggle && spot.card && !spot.card.hidden && spot.toggle(false));
  });

  /* ---------- Draggable gallery ---------- */
  class DragGallery extends HTMLElement {
    connectedCallback() {
      this.track = qs('.gallery__track', this);
      this.bar = qs('.gallery__progress span', this);
      if (!this.track) return;
      this.track.addEventListener('scroll', () => this.progress(), { passive: true });
      this.progress();

      let startX = 0;
      let startScroll = 0;
      let moved = false;
      this.track.addEventListener('pointerdown', (event) => {
        if (event.pointerType !== 'mouse') return;
        startX = event.clientX;
        startScroll = this.track.scrollLeft;
        moved = false;
        this.dragging = true;
      });
      window.addEventListener('pointermove', (event) => {
        if (!this.dragging) return;
        const delta = event.clientX - startX;
        if (Math.abs(delta) > 4) {
          moved = true;
          this.track.classList.add('is-dragging');
        }
        this.track.scrollLeft = startScroll - delta;
      });
      window.addEventListener('pointerup', () => {
        if (!this.dragging) return;
        this.dragging = false;
        requestAnimationFrame(() => this.track.classList.remove('is-dragging'));
      });
      this.track.addEventListener(
        'click',
        (event) => {
          if (moved) {
            event.preventDefault();
            moved = false;
          }
        },
        true
      );
    }

    progress() {
      if (!this.bar) return;
      const max = this.track.scrollWidth - this.track.clientWidth;
      const visible = this.track.clientWidth / Math.max(1, this.track.scrollWidth);
      const ratio = max > 0 ? this.track.scrollLeft / max : 1;
      this.bar.parentElement.style.setProperty('--progress', Math.max(visible, ratio).toFixed(3));
    }
  }
  customElements.define('drag-gallery', DragGallery);

  /* ---------- FAQ search ---------- */
  class FaqList extends HTMLElement {
    connectedCallback() {
      const input = qs('[data-faq-search]', this);
      if (!input) return;
      const empty = qs('[data-faq-empty]', this);
      input.addEventListener(
        'input',
        debounce(() => {
          const terms = input.value.trim().toLowerCase();
          let shown = 0;
          qsa('[data-faq-item]', this).forEach((item) => {
            const match = !terms || item.textContent.toLowerCase().includes(terms);
            item.hidden = !match;
            if (match) shown += 1;
            if (terms && match) item.open = true;
          });
          qsa('[data-faq-group]', this).forEach((group) => {
            let next = group.nextElementSibling;
            let visible = false;
            while (next && !next.matches('[data-faq-group]')) {
              if (!next.hidden) visible = true;
              next = next.nextElementSibling;
            }
            group.hidden = !visible;
          });
          if (empty) empty.hidden = shown > 0;
        }, 150)
      );
    }
  }
  customElements.define('faq-list', FaqList);

  /* ---------- Contact form: business fields ---------- */
  class ContactForm extends HTMLElement {
    connectedCallback() {
      const topic = qs('[data-topic]', this);
      if (!topic) return;
      const toggle = () => {
        const option = topic.options[topic.selectedIndex];
        const business = Boolean(option && option.hasAttribute('data-business'));
        qsa('[data-business-field]', this).forEach((field) => {
          field.hidden = !business;
          qsa('input', field).forEach((input) => {
            input.disabled = !business;
          });
        });
      };
      topic.addEventListener('change', toggle);
      toggle();
    }
  }
  customElements.define('contact-form', ContactForm);

  /* ---------- Countdown ---------- */
  class CountdownTimer extends HTMLElement {
    connectedCallback() {
      const target = new Date(this.dataset.date);
      if (Number.isNaN(target.getTime())) {
        this.hidden = true;
        return;
      }
      const units = {
        days: qs('[data-unit="days"]', this),
        hours: qs('[data-unit="hours"]', this),
        minutes: qs('[data-unit="minutes"]', this),
        seconds: qs('[data-unit="seconds"]', this),
      };
      const pad = (value) => String(value).padStart(2, '0');
      const tick = () => {
        const diff = Math.max(0, target - Date.now());
        units.days.textContent = pad(Math.floor(diff / 86400000));
        units.hours.textContent = pad(Math.floor((diff / 3600000) % 24));
        units.minutes.textContent = pad(Math.floor((diff / 60000) % 60));
        units.seconds.textContent = pad(Math.floor((diff / 1000) % 60));
        if (diff === 0) clearInterval(this.timer);
      };
      tick();
      this.timer = setInterval(tick, 1000);
    }

    disconnectedCallback() {
      clearInterval(this.timer);
    }
  }
  customElements.define('countdown-timer', CountdownTimer);

  /* ---------- Password page dialog ---------- */
  document.addEventListener('click', (event) => {
    const dialog = qs('[data-gate-dialog]');
    if (!dialog) return;
    if (event.target.closest('[data-gate-open]') && dialog.showModal) dialog.showModal();
    if (event.target.closest('[data-gate-close]')) dialog.close();
  });

  /* ---------- Boot ---------- */
  const boot = () => {
    observeReveals();
    const gate = qs('[data-gate-dialog]');
    if (gate && qs('[data-gate-error]', gate) && gate.showModal) gate.showModal();
    const success = qs('.form-message--success');
    if (success && window.location.hash) success.focus({ preventScroll: false });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  document.addEventListener('shopify:section:load', (event) => observeReveals(event.target));
})();
