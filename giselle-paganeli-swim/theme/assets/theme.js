/* Eden — theme scripts for Giselle Paganeli Swim. Optional dependency: Lenis (smooth scroll), loaded before this file. */
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

  /* ---------- Motion ---------- */
  const motionSettings = theme.motion || {};
  const motionAllowed = () => !reduceMotion.matches && document.body && document.body.dataset.animate === 'true';

  // One animation loop for everything that follows the scroll or the pointer.
  // A job receives the frame time and returns true while it still needs frames.
  const ticker = {
    jobs: new Set(),
    running: false,
    last: 0,
    add(job) {
      this.jobs.add(job);
      this.kick();
    },
    remove(job) {
      this.jobs.delete(job);
    },
    kick() {
      if (this.running) return;
      this.running = true;
      this.last = performance.now();
      requestAnimationFrame((time) => this.frame(time));
    },
    frame(time) {
      const dt = Math.min(64, time - this.last) || 16.7;
      this.last = time;
      let again = false;
      this.jobs.forEach((job) => {
        if (job(dt)) again = true;
      });
      if (again) requestAnimationFrame((next) => this.frame(next));
      else this.running = false;
    },
  };
  window.addEventListener('scroll', () => ticker.kick(), { passive: true });
  window.addEventListener('resize', () => ticker.kick(), { passive: true });

  // Smooth scroll with inertia on mouse and trackpad. Touch screens keep their native scrolling.
  let lenis = null;
  const startSmoothScroll = () => {
    if (lenis || !motionSettings.smoothScroll || !window.Lenis || reduceMotion.matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    lenis = new window.Lenis({
      autoRaf: true,
      lerp: 0.09,
      wheelMultiplier: 0.9,
      anchors: { offset: -120 },
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
      prevent: (node) => Boolean(node.closest && node.closest('side-drawer, dialog, [data-lenis-prevent]')),
    });
    lenis.on('scroll', () => ticker.kick());
  };

  const lockScroll = (locked) => {
    document.body.classList.toggle('is-locked', locked);
    if (lenis) {
      if (locked) lenis.stop();
      else lenis.start();
    }
  };

  // Parallax: editorial images drift slightly inside their frames.
  const parallaxItems = new Set();
  const parallaxObserver =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) =>
            entries.forEach((entry) => {
              if (entry.isIntersecting) parallaxItems.add(entry.target);
              else parallaxItems.delete(entry.target);
            }),
          { rootMargin: '20% 0px' }
        )
      : null;
  const PARALLAX = '.split__media img, .duo__media img, .banner__media img, .columns__media img, .tile__media img, .newsletter__bg img';
  const registerParallax = (root) => {
    if (!motionSettings.parallax || !parallaxObserver || !motionAllowed()) return;
    qsa(PARALLAX, root).forEach((img) => {
      if (img.hasAttribute('data-parallax')) return;
      img.setAttribute('data-parallax', '');
      parallaxObserver.observe(img);
    });
  };
  ticker.add(() => {
    if (!parallaxItems.size) return false;
    const viewport = window.innerHeight;
    const frames = Array.from(parallaxItems, (img) => [img, img.parentElement.getBoundingClientRect()]);
    frames.forEach(([img, frame]) => {
      const offset = (frame.top + frame.height / 2 - viewport / 2) / (viewport + frame.height);
      img.style.translate = `0 ${(-offset * frame.height * 0.12).toFixed(1)}px`;
    });
    return false;
  });

  // Headings rise word by word when they enter the screen.
  const SPLIT =
    '.statement__text, .section-head .h2, .page-hero__title, .collection__title, .banner__title, .split__title, .duo__title, .footer__newsletter-title, .search-page__title, .gate__title, .product__title, .page__title';
  const splitObserver =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) =>
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target.classList.add('is-split-in');
              splitObserver.unobserve(entry.target);
            }),
          { rootMargin: '0px 0px -8% 0px' }
        )
      : null;
  const splitWords = (element) => {
    let index = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          if (!child.textContent.trim()) return;
          const fragment = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (!part.trim()) {
              fragment.appendChild(document.createTextNode(part));
              return;
            }
            const outer = document.createElement('span');
            const inner = document.createElement('span');
            outer.className = 'split-word';
            inner.style.setProperty('--w', index);
            inner.textContent = part;
            index += 1;
            outer.appendChild(inner);
            fragment.appendChild(outer);
          });
          child.replaceWith(fragment);
        } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(element);
  };
  const registerSplits = (root) => {
    if (!motionSettings.splitHeadings || !splitObserver || !motionAllowed()) return;
    qsa(SPLIT, root).forEach((element) => {
      if (element.dataset.split) return;
      element.dataset.split = 'true';
      element.setAttribute('aria-label', element.textContent.replace(/\s+/g, ' ').trim());
      splitWords(element);
      splitObserver.observe(element);
    });
  };

  // Lazy images fade in once loaded instead of popping in.
  const fadeImages = (root) => {
    qsa('img[loading="lazy"]:not([data-fade]):not(.is-loaded)', root).forEach((img) => {
      if (img.complete && img.naturalWidth) {
        img.classList.add('is-loaded');
        return;
      }
      img.setAttribute('data-fade', '');
      const done = () => img.classList.add('is-loaded');
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
  };

  const enhance = (root = document) => {
    observeReveals(root);
    registerSplits(root);
    registerParallax(root);
    fadeImages(root);
  };

  // Collapsible rows open and close smoothly where the browser cannot animate <details> by itself (Safari, Firefox).
  const nativeDetails =
    window.CSS && CSS.supports && CSS.supports('selector(::details-content)') && CSS.supports('interpolate-size: allow-keywords');
  document.addEventListener('click', (event) => {
    const summary = event.target.closest('details > summary');
    if (!summary || nativeDetails || reduceMotion.matches) return;
    const details = summary.parentElement;
    const body = summary.nextElementSibling;
    if (!body || typeof body.animate !== 'function') return;
    event.preventDefault();
    if (details.dataset.animating) return;
    details.dataset.animating = 'true';
    body.style.overflow = 'hidden';
    const options = { duration: 450, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' };
    const finish = () => {
      body.style.overflow = '';
      delete details.dataset.animating;
    };
    if (details.open) {
      body.animate([{ height: `${body.offsetHeight}px`, opacity: 1 }, { height: '0px', opacity: 0 }], options).onfinish = () => {
        details.open = false;
        finish();
      };
    } else {
      details.open = true;
      body.animate([{ height: '0px', opacity: 0 }, { height: `${body.offsetHeight}px`, opacity: 1 }], options).onfinish = finish;
    }
  });

  // The product photo travels from the card to the product page (cross-document view transitions).
  document.addEventListener('click', (event) => {
    const link = event.target.closest('product-card a[href]');
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || !motionAllowed()) return;
    const image = qs('.card__img--primary', link.closest('product-card'));
    if (!image) return;
    qsa('.card__img--primary').forEach((other) => {
      other.style.viewTransitionName = '';
    });
    image.style.viewTransitionName = 'product-hero';
  });
  window.addEventListener('pageshow', () =>
    qsa('.card__img--primary').forEach((image) => {
      image.style.viewTransitionName = '';
    })
  );

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
      lockScroll(true);
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
      if (!qs('side-drawer.is-open')) lockScroll(false);
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
      // Full-screen sections subtract the bar's height so they end at the bottom of the screen.
      const measure = () => document.documentElement.style.setProperty('--announcement-h', `${this.offsetHeight}px`);
      measure();
      if ('ResizeObserver' in window) new ResizeObserver(measure).observe(this);
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

  /* ---------- Slideshow: full-screen campaign images that change on their own ---------- */
  class SlideShow extends HTMLElement {
    connectedCallback() {
      this.slides = qsa('[data-slide]', this);
      this.dots = qsa('[data-go]', this);
      this.toggle = qs('[data-toggle]', this);
      this.index = 0;
      if (this.slides.length < 2) return;
      this.interval = (Number(this.dataset.interval) || 6) * 1000;
      this.held = false;
      this.setPlaying(this.dataset.autoplay === 'true' && !reduceMotion.matches);

      this.dots.forEach((dot) => {
        dot.addEventListener('click', () => this.go(Number(dot.dataset.go)));
        dot.addEventListener('keydown', (event) => {
          if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
          event.preventDefault();
          this.go(this.index + (event.key === 'ArrowRight' ? 1 : -1));
          this.dots[this.index].focus();
        });
      });
      if (this.toggle) this.toggle.addEventListener('click', () => this.setPlaying(!this.playing));

      // Pause while the visitor points at the slideshow or moves through it with the keyboard.
      const canHover = window.matchMedia('(hover: hover)');
      this.addEventListener('mouseenter', () => canHover.matches && this.hold(true));
      this.addEventListener('mouseleave', () => canHover.matches && this.hold(false));
      this.addEventListener('focusin', () => this.hold(true));
      this.addEventListener('focusout', (event) => {
        if (!this.contains(event.relatedTarget)) this.hold(false);
      });
      this.onVisibility = () => this.hold(this.held, true);
      document.addEventListener('visibilitychange', this.onVisibility);

      // Swipe on touch screens; a swipe never opens the slide's link.
      let start = null;
      let swiped = false;
      this.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'mouse') return;
        start = { x: event.clientX, y: event.clientY };
        swiped = false;
      });
      this.addEventListener('pointerup', (event) => {
        if (!start) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        start = null;
        if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
        swiped = true;
        this.go(this.index + (dx < 0 ? 1 : -1));
      });
      this.addEventListener('pointercancel', () => (start = null));
      this.addEventListener(
        'click',
        (event) => {
          if (!swiped) return;
          swiped = false;
          event.preventDefault();
        },
        true
      );
    }

    disconnectedCallback() {
      clearTimeout(this.timer);
      if (this.onVisibility) document.removeEventListener('visibilitychange', this.onVisibility);
    }

    go(target) {
      const count = this.slides.length;
      const next = ((target % count) + count) % count;
      if (next !== this.index) {
        this.slides.forEach((slide, i) => {
          const active = i === next;
          slide.classList.toggle('is-active', active);
          slide.toggleAttribute('inert', !active);
        });
        this.dots.forEach((dot, i) => {
          if (i === next) dot.setAttribute('aria-current', 'true');
          else dot.removeAttribute('aria-current');
        });
        this.index = next;
        // Start loading the slide after this one so it is ready when its turn comes.
        const upcoming = qs('img[loading="lazy"]', this.slides[(next + 1) % count]);
        if (upcoming) upcoming.loading = 'eager';
      } else {
        // Same slide again: restart its progress line together with the timer.
        const dot = this.dots[next];
        dot.removeAttribute('aria-current');
        void dot.offsetWidth;
        dot.setAttribute('aria-current', 'true');
      }
      this.restart();
    }

    setPlaying(playing) {
      this.playing = playing;
      this.toggleAttribute('data-playing', playing);
      if (this.toggle) {
        this.toggle.setAttribute('aria-label', playing ? this.toggle.dataset.labelPause : this.toggle.dataset.labelPlay);
        this.toggle.classList.toggle('is-paused', !playing);
      }
      this.restart();
    }

    // The timer and the progress line on the active dot run together; holding pauses both.
    hold(held, fromVisibility = false) {
      if (!fromVisibility) this.held = held;
      const paused = this.held || document.hidden;
      this.classList.toggle('is-held', paused);
      if (!this.playing) return;
      if (paused) {
        clearTimeout(this.timer);
        if (this.startedAt) this.remaining = Math.max(0, this.remaining - (performance.now() - this.startedAt));
        this.startedAt = null;
      } else if (!this.startedAt) {
        this.schedule(this.remaining);
      }
    }

    restart() {
      clearTimeout(this.timer);
      this.startedAt = null;
      this.remaining = this.interval;
      if (this.playing && !this.held && !document.hidden) this.schedule(this.interval);
    }

    schedule(delay) {
      this.startedAt = performance.now();
      this.remaining = delay;
      this.timer = setTimeout(() => this.go(this.index + 1), delay);
    }
  }
  customElements.define('slide-show', SlideShow);

  /* ---------- Welcome popup ---------- */
  class WelcomePopup extends HTMLElement {
    connectedCallback() {
      this.dialog = qs('dialog', this);
      this.key = 'eden-welcome-popup';
      qsa('[data-popup-close]', this).forEach((el) => el.addEventListener('click', () => this.close()));
      this.dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        this.close();
      });
      this.dialog.addEventListener('click', (event) => {
        if (event.target === this.dialog) this.close();
      });
      const copy = qs('[data-popup-copy]', this);
      if (copy) copy.addEventListener('click', () => this.copyCode(copy));

      if (this.hasAttribute('data-success')) {
        // Back from signing up: show the code without jumping to the bottom of the page.
        if (window.location.hash === '#WelcomePopupForm') {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          window.scrollTo(0, 0);
        }
        this.open();
        return;
      }
      if (window.Shopify && window.Shopify.designMode) {
        const section = this.closest('.shopify-section');
        document.addEventListener('shopify:section:select', (event) => event.target === section && this.open());
        document.addEventListener('shopify:section:deselect', (event) => event.target === section && this.close(false));
        return;
      }
      const shownAt = Number(storage.get(this.key));
      const days = Number(this.dataset.days) || 30;
      if (shownAt && Date.now() - shownAt < days * 864e5) return;
      this.timer = setTimeout(() => this.openWhenFree(), (Number(this.dataset.delay) || 5) * 1000);
    }

    disconnectedCallback() {
      clearTimeout(this.timer);
    }

    // Wait while a drawer or another window is open.
    openWhenFree() {
      if (document.body.classList.contains('is-locked') || qs('dialog[open]')) {
        this.timer = setTimeout(() => this.openWhenFree(), 4000);
        return;
      }
      this.open();
    }

    open() {
      if (this.dialog.open) return;
      this.dialog.showModal();
      lockScroll(true);
    }

    close(remember = true) {
      if (!this.dialog.open) return;
      if (remember) storage.set(this.key, String(Date.now()));
      this.dialog.classList.add('is-closing');
      const done = () => {
        this.dialog.classList.remove('is-closing');
        this.dialog.close();
        lockScroll(false);
      };
      if (reduceMotion.matches) done();
      else setTimeout(done, 350);
    }

    showSuccess() {
      this.setAttribute('data-success', '');
      qsa('[data-popup-step]', this).forEach((step) => {
        step.hidden = step.dataset.popupStep !== 'success';
      });
      storage.set(this.key, String(Date.now()));
    }

    async copyCode(button) {
      const code = qs('[data-popup-code]', this);
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code.textContent.trim());
        button.textContent = button.dataset.copied;
      } catch (error) {
        const range = document.createRange();
        range.selectNodeContents(code);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
      }
    }
  }
  customElements.define('welcome-popup', WelcomePopup);

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
          if (fresh) {
            count = Number(fresh.dataset.itemCount);
            enhance(fresh);
          }
        } else {
          const current = qs(`cart-items[data-section="${id}"]`);
          const page = current && current.closest('.cart-page');
          const fresh = qs('.cart-page', doc);
          if (page && fresh) page.replaceWith(fresh);
          enhance(document);
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
      lockScroll(true);
      const target = qsa('.zoom__list li', dialog)[index];
      if (target) target.scrollIntoView({ block: 'start' });
      if (!dialog.dataset.bound) {
        dialog.dataset.bound = 'true';
        qs('[data-zoom-close]', dialog).addEventListener('click', () => dialog.close());
        dialog.addEventListener('close', () => lockScroll(false));
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
        enhance(this);
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
              enhance(this);
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
      if (document.startViewTransition && motionAllowed()) document.startViewTransition(() => this.show(index));
      else this.show(index);
    }

    show(index) {
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
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

      this.cursor = document.createElement('span');
      this.cursor.className = 'gallery__cursor';
      this.cursor.setAttribute('aria-hidden', 'true');
      this.cursor.textContent = strings.drag || 'Drag';
      this.appendChild(this.cursor);

      let pointerX = 0;
      let pointerY = 0;
      let cursorX = 0;
      let cursorY = 0;
      const follow = (dt) => {
        const ease = 1 - Math.pow(0.78, dt / 16.7);
        cursorX += (pointerX - cursorX) * ease;
        cursorY += (pointerY - cursorY) * ease;
        this.cursor.style.setProperty('--cx', `${cursorX.toFixed(1)}px`);
        this.cursor.style.setProperty('--cy', `${cursorY.toFixed(1)}px`);
        return Math.abs(pointerX - cursorX) > 0.3 || Math.abs(pointerY - cursorY) > 0.3;
      };
      this.track.addEventListener('pointerenter', (event) => {
        pointerX = cursorX = event.clientX;
        pointerY = cursorY = event.clientY;
        this.classList.add('is-hovered');
        ticker.add(follow);
      });
      this.track.addEventListener('pointerleave', () => {
        this.classList.remove('is-hovered');
        ticker.remove(follow);
      });

      let startX = 0;
      let startScroll = 0;
      let lastX = 0;
      let lastTime = 0;
      let velocity = 0;
      let moved = false;
      let glide = 0;
      this.track.addEventListener('pointerdown', (event) => {
        if (event.pointerType !== 'mouse') return;
        cancelAnimationFrame(glide);
        startX = lastX = event.clientX;
        lastTime = event.timeStamp;
        startScroll = this.track.scrollLeft;
        velocity = 0;
        moved = false;
        this.dragging = true;
      });
      window.addEventListener('pointermove', (event) => {
        if (this.classList.contains('is-hovered')) {
          pointerX = event.clientX;
          pointerY = event.clientY;
          ticker.kick();
        }
        if (!this.dragging) return;
        const delta = event.clientX - startX;
        if (Math.abs(delta) > 4) {
          moved = true;
          this.track.classList.add('is-dragging');
        }
        const elapsed = Math.max(1, event.timeStamp - lastTime);
        velocity = 0.8 * ((event.clientX - lastX) / elapsed) + 0.2 * velocity;
        lastX = event.clientX;
        lastTime = event.timeStamp;
        this.track.scrollLeft = startScroll - delta;
      });
      window.addEventListener('pointerup', () => {
        if (!this.dragging) return;
        this.dragging = false;
        let speed = -velocity * 16;
        const step = () => {
          if (Math.abs(speed) < 0.35) {
            this.track.classList.remove('is-dragging');
            return;
          }
          this.track.scrollLeft += speed;
          speed *= 0.94;
          glide = requestAnimationFrame(step);
        };
        glide = requestAnimationFrame(step);
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
    startSmoothScroll();
    enhance();
    const gate = qs('[data-gate-dialog]');
    if (gate && qs('[data-gate-error]', gate) && gate.showModal) gate.showModal();
    const success = qs('.form-message--success');
    if (success && window.location.hash) success.focus({ preventScroll: false });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  document.addEventListener('shopify:section:load', (event) => enhance(event.target));
  window.EdenTheme = {
    enhance,
    ticker,
    get lenis() {
      return lenis;
    },
  };
})();
