/* =============================================================================
   Grace theme scripts. Plain JavaScript and custom elements, no libraries.
   Everything works without this file; it adds the cart drawer, live search,
   variant switching, filters without reloads and the small animations.
   ========================================================================== */
(() => {
  'use strict';

  const config = (() => {
    try {
      return JSON.parse(document.getElementById('ThemeConfig').textContent);
    } catch (e) {
      return { routes: { cart: '/cart', cartAdd: '/cart/add', cartChange: '/cart/change', cartUpdate: '/cart/update', predictiveSearch: '/search/suggest' }, cartType: 'page', strings: {} };
    }
  })();
  const routes = config.routes;
  const strings = config.strings || {};

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const motionOK = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const debounce = (fn, wait = 300) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };
  const parseHTML = (html) => new DOMParser().parseFromString(html, 'text/html');
  const sectionInner = (html) => {
    const doc = parseHTML(html);
    const wrap = doc.querySelector('.shopify-section');
    return wrap ? wrap.innerHTML : doc.body.innerHTML;
  };

  /* -------------------------------------------------------------- dialogs */
  const openers = new WeakMap();

  function openDialog(dialog, opener) {
    if (!dialog || dialog.open) return;
    if (opener) {
      openers.set(dialog, opener);
      opener.setAttribute('aria-expanded', 'true');
    }
    dialog.showModal();
    dialog.classList.add('is-open');
    document.documentElement.classList.add('has-dialog');
    dialog.dispatchEvent(new CustomEvent('dialog:open'));
  }

  function closeDialog(dialog) {
    if (!dialog || !dialog.open || dialog.classList.contains('is-closing')) return;
    const finish = () => {
      dialog.classList.remove('is-closing', 'is-open');
      dialog.close();
      if (!$$('dialog[open]').length) document.documentElement.classList.remove('has-dialog');
      const opener = openers.get(dialog);
      if (opener) opener.setAttribute('aria-expanded', 'false');
    };
    if (!motionOK()) return finish();
    dialog.classList.add('is-closing');
    let done = false;
    const end = () => {
      if (done) return;
      done = true;
      finish();
    };
    dialog.addEventListener('animationend', end, { once: true });
    setTimeout(end, 400);
  }

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-dialog-open]');
    if (opener) {
      const dialog = document.getElementById(opener.dataset.dialogOpen);
      if (dialog && typeof dialog.showModal === 'function') {
        event.preventDefault();
        openDialog(dialog, opener);
      }
      return;
    }
    const closer = event.target.closest('[data-dialog-close]');
    if (closer) {
      closeDialog(closer.closest('dialog'));
      return;
    }
    // Click on the backdrop: the dialog box itself is the target
    if (event.target.tagName === 'DIALOG') closeDialog(event.target);
  });

  document.addEventListener(
    'cancel',
    (event) => {
      if (event.target.tagName === 'DIALOG') {
        event.preventDefault();
        closeDialog(event.target);
      }
    },
    true
  );

  /* -------------------------------------------------------------- header */
  class StickyHeader extends HTMLElement {
    connectedCallback() {
      this.onScroll = () => this.classList.toggle('is-scrolled', window.scrollY > 4);
      window.addEventListener('scroll', this.onScroll, { passive: true });
      this.onScroll();
      this.updateHeight();
      this.ro = new ResizeObserver(() => this.updateHeight());
      this.ro.observe(this);

      // Desktop dropdowns: open on hover, one at a time, close on Escape or outside click
      this.dropdowns = $$('details[data-dropdown]', this);
      this.dropdowns.forEach((details) => {
        details.addEventListener('mouseenter', () => {
          if (window.matchMedia('(hover: hover)').matches) details.open = true;
        });
        details.addEventListener('mouseleave', () => {
          if (window.matchMedia('(hover: hover)').matches) details.open = false;
        });
        details.addEventListener('toggle', () => {
          if (details.open) this.dropdowns.forEach((d) => d !== details && (d.open = false));
        });
      });
      this.onDocClick = (e) => {
        if (!this.contains(e.target)) this.dropdowns.forEach((d) => (d.open = false));
      };
      this.onKey = (e) => {
        if (e.key === 'Escape') {
          const open = this.dropdowns.find((d) => d.open);
          if (open) {
            open.open = false;
            $('summary', open).focus();
          }
        }
      };
      document.addEventListener('click', this.onDocClick);
      document.addEventListener('keydown', this.onKey);
    }
    disconnectedCallback() {
      window.removeEventListener('scroll', this.onScroll);
      document.removeEventListener('click', this.onDocClick);
      document.removeEventListener('keydown', this.onKey);
      if (this.ro) this.ro.disconnect();
    }
    updateHeight() {
      document.documentElement.style.setProperty('--header-h', `${Math.round(this.offsetHeight)}px`);
    }
  }
  customElements.define('sticky-header', StickyHeader);

  class AnnouncementBar extends HTMLElement {
    connectedCallback() {
      this.items = $$('.announcement__item', this);
      if (this.items.length < 2 || !motionOK()) return;
      this.index = 0;
      const ms = (parseInt(this.dataset.interval, 10) || 5) * 1000;
      const tick = () => {
        if (this.paused) return;
        this.items[this.index].classList.remove('is-active');
        this.items[this.index].setAttribute('aria-hidden', 'true');
        this.index = (this.index + 1) % this.items.length;
        this.items[this.index].classList.add('is-active');
        this.items[this.index].removeAttribute('aria-hidden');
      };
      this.timer = setInterval(tick, ms);
      ['mouseenter', 'focusin'].forEach((e) => this.addEventListener(e, () => (this.paused = true)));
      ['mouseleave', 'focusout'].forEach((e) => this.addEventListener(e, () => (this.paused = false)));
    }
    disconnectedCallback() {
      clearInterval(this.timer);
    }
  }
  customElements.define('announcement-bar', AnnouncementBar);

  /* -------------------------------------------------------------- predictive search */
  class PredictiveSearch extends HTMLElement {
    connectedCallback() {
      this.input = $('input[type="search"]', this);
      this.results = $('.predictive__results', this);
      if (!this.input || this.dataset.enabled === 'false') return;
      this.controller = null;
      this.input.addEventListener('input', debounce(() => this.search(), 260));
      this.input.addEventListener('keydown', (e) => this.onKey(e));
      const dialog = this.closest('dialog');
      if (dialog) dialog.addEventListener('dialog:open', () => setTimeout(() => this.input.focus(), 50));
    }
    async search() {
      const q = this.input.value.trim();
      if (!q) {
        this.results.innerHTML = '';
        this.input.setAttribute('aria-expanded', 'false');
        return;
      }
      if (this.controller) this.controller.abort();
      this.controller = new AbortController();
      const params = new URLSearchParams({
        q,
        section_id: 'predictive-search',
        'resources[type]': 'product,collection,article,page',
        'resources[limit]': '6',
        'resources[limit_scope]': 'each',
      });
      try {
        const res = await fetch(`${routes.predictiveSearch}?${params}`, { signal: this.controller.signal });
        if (!res.ok) throw new Error(res.status);
        const html = sectionInner(await res.text());
        this.results.innerHTML = html;
        this.input.setAttribute('aria-expanded', 'true');
        this.active = -1;
      } catch (e) {
        if (e.name !== 'AbortError') this.results.innerHTML = '';
      }
    }
    onKey(e) {
      const options = $$('[role="option"]', this.results);
      if (!options.length || !['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) return;
      if (e.key === 'Enter') {
        if (this.active >= 0) {
          e.preventDefault();
          $('a', options[this.active]).click();
        }
        return;
      }
      e.preventDefault();
      this.active = this.active == null ? -1 : this.active;
      this.active = (this.active + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
      options.forEach((o, i) => o.setAttribute('aria-selected', String(i === this.active)));
      this.input.setAttribute('aria-activedescendant', options[this.active].id);
      options[this.active].scrollIntoView({ block: 'nearest' });
    }
  }
  customElements.define('predictive-search', PredictiveSearch);

  /* -------------------------------------------------------------- cart */
  const cart = {
    sectionIds() {
      const ids = ['cart-icon-bubble'];
      if ($('#CartDrawer')) ids.push('cart-drawer');
      const page = $('[data-cart-page]');
      const wrap = page && page.closest('.shopify-section');
      if (wrap) ids.push(wrap.id.replace('shopify-section-', ''));
      return ids;
    },
    render(sections) {
      if (!sections) return;
      Object.entries(sections).forEach(([id, html]) => {
        if (!html) return;
        const doc = parseHTML(html);
        if (id === 'cart-icon-bubble') {
          const target = $('#cart-icon-bubble');
          const wrap = doc.querySelector('.shopify-section');
          if (target && wrap) {
            target.innerHTML = wrap.innerHTML;
            const count = $('.cart-count', target);
            if (count && motionOK()) count.classList.add('bump');
          }
        } else if (id === 'cart-drawer') {
          const next = doc.getElementById('CartDrawerInner');
          const current = $('#CartDrawerInner');
          if (next && current) current.innerHTML = next.innerHTML;
        } else {
          const next = doc.getElementById('MainCartInner');
          const current = $('#MainCartInner');
          if (next && current) current.innerHTML = next.innerHTML;
        }
      });
      document.dispatchEvent(new CustomEvent('cart:updated'));
    },
    async add(formData) {
      formData.append('sections', this.sectionIds().join(','));
      formData.append('sections_url', window.location.pathname);
      const res = await fetch(routes.cartAdd, {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/javascript' },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || data.status) throw new Error(data.description || data.message || strings.error);
      this.render(data.sections);
      return data;
    },
    async change(line, quantity) {
      const res = await fetch(routes.cartChange, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ line, quantity, sections: this.sectionIds(), sections_url: window.location.pathname }),
      });
      const data = await res.json();
      if (!res.ok || data.status) throw new Error(data.description || data.message || strings.error);
      this.render(data.sections);
      return data;
    },
    async note(note) {
      await fetch(routes.cartUpdate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ note }),
      });
    },
    open() {
      const drawer = $('#CartDrawer');
      if (drawer && config.cartType === 'drawer') openDialog(drawer, $('#CartLink'));
      else window.location.href = routes.cart;
    },
  };
  window.GraceCart = cart;

  // Add to cart: product page, featured product and quick add buttons
  document.addEventListener('submit', async (event) => {
    const form = event.target;
    if (!form.matches('form[data-type="add-to-cart-form"]')) return;
    if (!form.checkValidity()) {
      form.reportValidity();
      event.preventDefault();
      return;
    }
    event.preventDefault();
    const submitter = event.submitter || $('[type="submit"]', form);
    const buttons = [submitter, ...$$(`[form="${form.id}"][type="submit"]`)].filter(Boolean);
    const error = $('.product-form__error', form);
    buttons.forEach((b) => {
      b.setAttribute('aria-disabled', 'true');
      b.classList.add('is-loading');
    });
    if (error) error.hidden = true;
    try {
      await cart.add(new FormData(form));
      buttons.forEach((b) => b.classList.contains('card__add') && b.classList.add('is-added'));
      cart.open();
    } catch (e) {
      if (error) {
        error.textContent = e.message;
        error.hidden = false;
      } else {
        window.alert(e.message);
      }
    } finally {
      buttons.forEach((b) => {
        b.removeAttribute('aria-disabled');
        b.classList.remove('is-loading');
      });
    }
  });

  // Quantity changes and removal inside the cart drawer and the cart page
  const pendingLines = new Map();
  function queueChange(line, quantity, row) {
    clearTimeout(pendingLines.get(line));
    pendingLines.set(
      line,
      setTimeout(async () => {
        if (row) row.classList.add('is-updating');
        try {
          await cart.change(line, quantity);
        } catch (e) {
          if (row) row.classList.remove('is-updating');
          window.alert(e.message);
        }
      }, 350)
    );
  }
  document.addEventListener('change', (event) => {
    const input = event.target.closest('.cart-form .qty__input[data-line]');
    if (input) {
      queueChange(parseInt(input.dataset.line, 10), Math.max(0, parseInt(input.value, 10) || 0), input.closest('.cart-item'));
    }
    const autosubmit = event.target.closest('select[data-autosubmit]');
    if (autosubmit && autosubmit.form) autosubmit.form.submit();
  });
  document.addEventListener('click', (event) => {
    const remove = event.target.closest('.cart-item__remove[data-line]');
    if (!remove || !$('#CartDrawer, [data-cart-page]')) return;
    event.preventDefault();
    queueChange(parseInt(remove.dataset.line, 10), 0, remove.closest('.cart-item'));
  });
  document.addEventListener(
    'input',
    debounce((event) => {
      const note = event.target.closest && event.target.closest('[data-cart-note]');
      if (note) cart.note(note.value);
    }, 600)
  );

  class QuantityInput extends HTMLElement {
    connectedCallback() {
      this.input = $('input', this);
      $$('button', this).forEach((button) =>
        button.addEventListener('click', () => {
          const step = parseFloat(this.input.step) || 1;
          const min = this.input.min === '' ? 0 : parseFloat(this.input.min);
          const max = this.input.max === '' ? Infinity : parseFloat(this.input.max);
          const value = parseFloat(this.input.value) || 0;
          const next = button.name === 'plus' ? value + step : value - step;
          this.input.value = Math.min(max, Math.max(min, next));
          this.input.dispatchEvent(new Event('change', { bubbles: true }));
        })
      );
    }
  }
  customElements.define('quantity-input', QuantityInput);

  /* -------------------------------------------------------------- product */
  class ProductInfo extends HTMLElement {
    connectedCallback() {
      const json = $('[data-product-json]', this);
      if (!json) return;
      this.data = JSON.parse(json.textContent);
      this.picker = $('variant-picker', this);
      this.form = $('form[data-type="add-to-cart-form"]', this);

      // JavaScript is on: use the hidden id field instead of the fallback select
      const hidden = $('[data-variant-id]', this);
      if (hidden) {
        hidden.disabled = false;
        $$('.variant-fallback', this).forEach((el) => el.remove());
      }
      if (this.picker) {
        this.picker.addEventListener('change', () => this.onChange());
        this.updateAvailability(this.selectedOptions());
      }
    }
    selectedOptions() {
      return $$('fieldset.option', this.picker).map((fs) => {
        const checked = $('input:checked', fs);
        return checked ? checked.value : null;
      });
    }
    findVariant(options) {
      return this.data.variants.find((v) => v.options.every((o, i) => o === options[i]));
    }
    updateAvailability(selected) {
      $$('fieldset.option', this.picker).forEach((fs, index) => {
        $$('input', fs).forEach((input) => {
          const candidate = selected.slice();
          candidate[index] = input.value;
          const available = this.data.variants.some((v) => v.available && v.options.every((o, i) => o === candidate[i]));
          const label = input.nextElementSibling;
          if (!label) return;
          label.classList.toggle('is-unavailable', !available);
          const note = $('[data-unavailable-note]', label);
          if (note) note.hidden = available;
        });
        const value = $('[data-selected]', fs);
        if (value) value.textContent = selected[index] || '';
      });
    }
    onChange() {
      const selected = this.selectedOptions();
      const variant = this.findVariant(selected);
      this.updateAvailability(selected);
      const s = this.data.strings;

      const addButton = $('.product-form__submit', this);
      const label = addButton && $('.product-form__label', addButton);
      const priceInButton = addButton && $('.product-form__price', addButton);
      const sticky = $('[data-sticky-button]', this);
      const stickyVariant = $('[data-sticky-variant]', this);

      if (!variant) {
        if (addButton) addButton.disabled = true;
        if (label) label.textContent = s.unavailable;
        if (priceInButton) priceInButton.hidden = true;
        if (sticky) {
          sticky.disabled = true;
          sticky.textContent = s.unavailable;
        }
        return;
      }

      $$('[data-variant-id]', this).forEach((input) => (input.value = variant.id));
      $$('[data-price]', this).forEach((el) => (el.innerHTML = variant.priceHtml));
      if (addButton) addButton.disabled = !variant.available;
      if (label) label.textContent = variant.available ? s.add : s.soldOut;
      if (priceInButton) {
        priceInButton.textContent = variant.price;
        priceInButton.hidden = !variant.available;
      }
      if (sticky) {
        sticky.disabled = !variant.available;
        sticky.textContent = variant.available ? s.add : s.soldOut;
      }
      if (stickyVariant) stickyVariant.textContent = variant.title;

      if (variant.media) {
        const gallery = $('media-gallery', this);
        if (gallery && gallery.goTo) gallery.goTo(String(variant.media));
      }

      if (this.dataset.updateUrl === 'true') {
        const url = new URL(window.location.href);
        url.searchParams.set('variant', variant.id);
        window.history.replaceState({}, '', url.toString());
      }

      this.syncSection(variant.id);
      this.dispatchEvent(new CustomEvent('variant:change', { bubbles: true, detail: { variant } }));
    }
    async syncSection(variantId) {
      const targets = $$('[data-variant-sync]', this).filter((el) => el.dataset.variantSync !== 'add-button');
      if (!targets.length || !this.dataset.section) return;
      if (this.syncController) this.syncController.abort();
      this.syncController = new AbortController();
      try {
        const res = await fetch(`${this.dataset.url}?variant=${variantId}&section_id=${this.dataset.section}`, { signal: this.syncController.signal });
        const doc = parseHTML(await res.text());
        targets.forEach((el) => {
          const next = doc.querySelector(`[data-variant-sync="${el.dataset.variantSync}"]`);
          if (next) el.replaceWith(next);
        });
      } catch (e) {
        /* keep the current markup */
      }
    }
  }
  customElements.define('product-info', ProductInfo);

  class VariantPicker extends HTMLElement {}
  customElements.define('variant-picker', VariantPicker);

  class MediaGallery extends HTMLElement {
    connectedCallback() {
      this.track = $('.gallery__track', this);
      if (!this.track) return;
      this.items = $$('.gallery__item', this.track);
      this.thumbs = $$('.gallery__thumb', this);
      this.counter = $('[data-gallery-current]', this);
      const prev = $('[data-gallery-prev]', this);
      const next = $('[data-gallery-next]', this);
      if (prev) prev.addEventListener('click', () => this.step(-1));
      if (next) next.addEventListener('click', () => this.step(1));
      this.thumbs.forEach((thumb) => thumb.addEventListener('click', () => this.goTo(thumb.dataset.target, true)));
      this.track.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') this.step(1);
        if (e.key === 'ArrowLeft') this.step(-1);
      });
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.6) this.setCurrent(this.items.indexOf(entry.target));
          });
        },
        { root: this.track, threshold: [0.6] }
      );
      this.items.forEach((item) => this.observer.observe(item));
      const active = this.items.findIndex((item) => item.classList.contains('is-active'));
      if (active > 0) this.scrollToIndex(active, false);
    }
    disconnectedCallback() {
      if (this.observer) this.observer.disconnect();
    }
    setCurrent(index) {
      if (index < 0) return;
      this.current = index;
      this.items.forEach((item, i) => item.classList.toggle('is-active', i === index));
      this.thumbs.forEach((thumb, i) => thumb.setAttribute('aria-current', String(i === index)));
      if (this.counter) this.counter.textContent = index + 1;
    }
    scrollToIndex(index, smooth = true) {
      const item = this.items[index];
      if (!item) return;
      this.track.scrollTo({ left: item.offsetLeft - this.track.offsetLeft, behavior: smooth && motionOK() ? 'smooth' : 'auto' });
      this.setCurrent(index);
    }
    step(delta) {
      const count = this.items.length;
      this.scrollToIndex(((this.current || 0) + delta + count) % count);
    }
    goTo(mediaId, smooth = true) {
      const index = this.items.findIndex((item) => item.dataset.mediaId === String(mediaId));
      if (index >= 0) this.scrollToIndex(index, smooth);
    }
  }
  customElements.define('media-gallery', MediaGallery);

  class StickyAtc extends HTMLElement {
    connectedCallback() {
      const form = document.getElementById(this.dataset.form);
      const target = form && $('.product-form__submit', form);
      if (!target) return;
      this.hidden = false;
      // The huge bottom margin keeps the button "intersecting" while it is anywhere below the top of
      // the screen, so the bar also appears after a jump (anchor link, restored scroll position).
      this.observer = new IntersectionObserver(
        ([entry]) => {
          const passed = !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
          this.classList.toggle('is-visible', passed);
        },
        { rootMargin: '0px 0px 100000px 0px' }
      );
      this.observer.observe(target);
    }
    disconnectedCallback() {
      if (this.observer) this.observer.disconnect();
    }
  }
  customElements.define('sticky-atc', StickyAtc);

  class ProductRecommendations extends HTMLElement {
    connectedCallback() {
      if (!this.dataset.url) return;
      this.observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          this.observer.disconnect();
          this.load();
        },
        { rootMargin: '0px 0px 400px 0px' }
      );
      this.observer.observe(this);
    }
    async load() {
      try {
        const res = await fetch(this.dataset.url);
        const doc = parseHTML(await res.text());
        const selector = this.dataset.block ? `product-recommendations[data-block="${this.dataset.block}"]` : 'product-recommendations';
        const fresh = doc.querySelector(selector);
        if (fresh && fresh.innerHTML.trim()) {
          this.innerHTML = fresh.innerHTML;
          reveal.scan(this);
        }
      } catch (e) {
        /* recommendations are optional */
      }
    }
  }
  customElements.define('product-recommendations', ProductRecommendations);

  class ShareButton extends HTMLElement {
    connectedCallback() {
      const button = $('button', this);
      const status = $('.share__status', this);
      button.addEventListener('click', async () => {
        const data = { title: this.dataset.title, url: this.dataset.url };
        if (navigator.share) {
          try {
            await navigator.share(data);
          } catch (e) {
            /* closed by the visitor */
          }
          return;
        }
        try {
          await navigator.clipboard.writeText(data.url);
          status.textContent = strings.copied || 'Link copied';
          setTimeout(() => (status.textContent = ''), 2500);
        } catch (e) {
          window.prompt('', data.url);
        }
      });
    }
  }
  customElements.define('share-button', ShareButton);

  class CopyButton extends HTMLElement {
    connectedCallback() {
      const copy = async () => {
        const input = document.getElementById(this.dataset.target);
        if (!input) return;
        try {
          await navigator.clipboard.writeText(input.value);
        } catch (e) {
          input.select();
          document.execCommand('copy');
        }
        const label = this.textContent;
        this.textContent = '✓';
        setTimeout(() => (this.textContent = label), 1800);
      };
      this.addEventListener('click', copy);
      this.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), copy()));
    }
  }
  customElements.define('copy-button', CopyButton);

  class ScrollSlider extends HTMLElement {
    connectedCallback() {
      this.track = $('.slider__track', this);
      this.prev = $('[data-slider-prev]', this);
      this.next = $('[data-slider-next]', this);
      if (!this.track || !this.prev) return;
      const step = () => {
        const first = this.track.firstElementChild;
        return first ? first.getBoundingClientRect().width + 18 : this.track.clientWidth;
      };
      const scroll = (dir) => this.track.scrollBy({ left: dir * step(), behavior: motionOK() ? 'smooth' : 'auto' });
      this.prev.addEventListener('click', () => scroll(-1));
      this.next.addEventListener('click', () => scroll(1));
      const update = () => {
        const max = this.track.scrollWidth - this.track.clientWidth - 2;
        this.prev.disabled = this.track.scrollLeft <= 2;
        this.next.disabled = this.track.scrollLeft >= max;
      };
      this.track.addEventListener('scroll', debounce(update, 60), { passive: true });
      update();
    }
  }
  customElements.define('scroll-slider', ScrollSlider);

  class LocalizationForm extends HTMLElement {}
  customElements.define('localization-form', LocalizationForm);

  /* -------------------------------------------------------------- filters */
  class FacetFilters extends HTMLElement {
    connectedCallback() {
      this.sectionId = this.dataset.section;
      this.form = document.getElementById(`FacetsForm-${this.sectionId}`);
      if (!this.form) return;
      this.panel = $('[data-facets-panel]', this);

      this.addEventListener('change', (event) => {
        if (event.target.closest('[form]') && event.target.type !== 'number') this.submit();
      });
      this.addEventListener(
        'input',
        debounce((event) => {
          if (event.target.type === 'number') this.submit();
        }, 700)
      );
      this.addEventListener('click', (event) => {
        const link = event.target.closest('a[data-facet-link]');
        if (link) {
          event.preventDefault();
          this.render(new URL(link.href, window.location.origin).searchParams.toString());
          return;
        }
        if (event.target.closest('[data-facets-open]')) this.openPanel();
        if (event.target.closest('[data-facets-close]')) this.closePanel();
      });
      this.form.addEventListener('submit', (event) => {
        event.preventDefault();
        this.submit();
      });
      this.onPop = () => this.render(window.location.search.slice(1), false);
      window.addEventListener('popstate', this.onPop);
    }
    disconnectedCallback() {
      window.removeEventListener('popstate', this.onPop);
    }
    params() {
      const data = new FormData(this.form);
      const params = new URLSearchParams();
      for (const [key, value] of data.entries()) if (value !== '') params.append(key, value);
      return params.toString();
    }
    submit() {
      this.render(this.params());
    }
    async render(query, push = true) {
      const base = this.form.getAttribute('action');
      const url = `${base}?${query}`;
      this.classList.add('is-loading');
      const openIds = $$('details[open]', this).map((d) => d.id).filter(Boolean);
      const focusedId = document.activeElement && document.activeElement.id;
      try {
        const res = await fetch(`${url}${query ? '&' : ''}section_id=${this.sectionId}`);
        const doc = parseHTML(await res.text());
        $$('[data-facets-region]', this).forEach((region) => {
          const next = doc.querySelector(`[data-facets-region="${region.dataset.facetsRegion}"]`);
          if (next) region.innerHTML = next.innerHTML;
        });
        $$('details', this).forEach((d) => {
          if (d.id) d.open = openIds.includes(d.id);
        });
        if (focusedId) {
          const el = document.getElementById(focusedId);
          if (el) el.focus({ preventScroll: true });
        }
        if (push) window.history.pushState({}, '', url);
        reveal.scan(this);
      } catch (e) {
        window.location.href = url;
      } finally {
        this.classList.remove('is-loading');
      }
    }
    openPanel() {
      if (!this.panel) return;
      this.panel.classList.add('is-open');
      this.overlay = document.createElement('div');
      this.overlay.className = 'facets-overlay';
      this.overlay.addEventListener('click', () => this.closePanel());
      this.panel.after(this.overlay);
      document.documentElement.classList.add('has-dialog');
      const close = $('[data-facets-close]', this.panel);
      if (close) close.focus();
      this.onEsc = (e) => e.key === 'Escape' && this.closePanel();
      document.addEventListener('keydown', this.onEsc);
    }
    closePanel() {
      if (!this.panel) return;
      this.panel.classList.remove('is-open');
      if (this.overlay) this.overlay.remove();
      document.documentElement.classList.remove('has-dialog');
      document.removeEventListener('keydown', this.onEsc);
      const opener = $('[data-facets-open]', this);
      if (opener) opener.focus();
    }
  }
  customElements.define('facet-filters', FacetFilters);

  /* -------------------------------------------------------------- reveal on scroll */
  const reveal = {
    init() {
      if (!document.body.classList.contains('has-reveal') || !motionOK() || !('IntersectionObserver' in window)) return;
      document.documentElement.classList.add('reveal-on');
      this.io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-in');
            this.io.unobserve(entry.target);
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
      );
      this.scan(document);
    },
    scan(root) {
      if (!this.io) return;
      $$('[data-reveal]:not(.is-in), [data-stagger]:not(.is-in)', root).forEach((el) => this.io.observe(el));
    },
  };

  function splitWords(el) {
    let n = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
            else {
              const span = document.createElement('span');
              span.className = 'word';
              span.style.setProperty('--w', n++);
              span.textContent = part;
              frag.appendChild(span);
            }
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(el);
  }

  function init() {
    reveal.init();
    if (motionOK()) $$('[data-split-words]').forEach(splitWords);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Theme editor: show re-rendered sections straight away
  document.addEventListener('shopify:section:load', (event) => {
    $$('[data-reveal], [data-stagger]', event.target).forEach((el) => el.classList.add('is-in'));
  });
  document.addEventListener('shopify:section:select', (event) => {
    $$('[data-reveal], [data-stagger]', event.target).forEach((el) => el.classList.add('is-in'));
  });
})();
