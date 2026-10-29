/*
 * FreshFemme Thermal — interações do tema.
 * Sem dependências. Cada recurso procura seus próprios data-atributos, então as
 * seções podem ser adicionadas/removidas no editor de temas sem quebrar nada.
 */
(() => {
  const theme = window.theme || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animations = document.documentElement.hasAttribute('data-animations') && !reduced;

  /* ---------------- dinheiro e parcelamento ---------------- */
  function formatMoney(cents, format = theme.moneyFormat || 'R$ {{amount_with_comma_separator}}') {
    if (typeof cents === 'string') cents = cents.replace('.', '');
    const value = Number(cents) || 0;
    const fmt = (n, decimals, thousands = '.', decimal = ',') => {
      const fixed = (n / 100).toFixed(decimals);
      const [int, dec] = fixed.split('.');
      const withThousands = int.replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
      return dec ? withThousands + decimal + dec : withThousands;
    };
    return format.replace(/\{\{\s*(\w+)\s*\}\}/, (_, key) => {
      switch (key) {
        case 'amount': return fmt(value, 2, ',', '.');
        case 'amount_no_decimals': return fmt(value, 0, ',', '.');
        case 'amount_no_decimals_with_comma_separator': return fmt(value, 0, '.', ',');
        case 'amount_with_apostrophe_separator': return fmt(value, 2, "'", '.');
        default: return fmt(value, 2, '.', ',');
      }
    });
  }

  function installmentsHTML(price) {
    const cfg = theme.installments || {};
    if (!cfg.show) return '';
    let n = cfg.count || 12;
    if (cfg.min > 0) n = Math.min(n, Math.floor(price / cfg.min));
    if (n < 2) return '';
    const rate = (Number(cfg.rate) || 0) / 100;
    let parcel;
    if (rate > 0) {
      const f = Math.pow(1 + rate, n);
      parcel = Math.round((price * rate * f) / (f - 1));
    } else {
      parcel = Math.floor(price / n);
    }
    let html = theme.strings.installments.replace('__N__', n).replace('__AMOUNT__', formatMoney(parcel));
    if (rate === 0) html += ' ' + theme.strings.interestFree;
    return html;
  }

  function pixHTML(price) {
    const d = (theme.installments || {}).pix;
    if (!d) return '';
    return theme.strings.pix.replace('__AMOUNT__', formatMoney(Math.floor((price * (100 - d)) / 100))).replace('__DISCOUNT__', d);
  }

  /* ---------------- animações de entrada ---------------- */
  function splitWords(el) {
    if (el.dataset.split) return;
    el.dataset.split = '1';
    let w = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(' '));
              return;
            }
            const outer = document.createElement('span');
            outer.className = 'word';
            const inner = document.createElement('span');
            inner.textContent = part;
            inner.style.setProperty('--w', w++);
            outer.appendChild(inner);
            frag.appendChild(outer);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(el);
  }

  let revealObserver;
  function initReveal(root = document) {
    const items = $$('[data-reveal]', root);
    if (!items.length) return;
    if (!animations || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    }
    items.forEach((el) => {
      if (el.dataset.reveal === 'words') splitWords(el);
      revealObserver.observe(el);
    });
  }

  /* progresso de rolagem: escreve --progress (0..1) enquanto o elemento atravessa a tela */
  const progressEls = new Set();
  let progressTicking = false;
  function updateProgress() {
    progressTicking = false;
    const vh = window.innerHeight;
    progressEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      const mode = el.dataset.progress;
      let p;
      if (mode === 'sticky') {
        // 0 quando o topo encosta no topo da tela, 1 quando o fim encosta no fim
        p = -r.top / Math.max(1, r.height - vh);
      } else {
        p = (vh - r.top) / (vh + r.height);
      }
      p = Math.min(1, Math.max(0, p));
      el.style.setProperty('--progress', p.toFixed(4));
      el.dispatchEvent(new CustomEvent('progress', { detail: p }));
    });
  }
  function initProgress(root = document) {
    $$('[data-progress]', root).forEach((el) => progressEls.add(el));
    if (progressEls.size) updateProgress();
  }
  window.addEventListener('scroll', () => {
    if (!progressTicking) {
      progressTicking = true;
      requestAnimationFrame(updateProgress);
    }
  }, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });

  /* contadores numéricos */
  function initCounters(root = document) {
    $$('[data-count-to]', root).forEach((el) => {
      if (el.dataset.counted) return;
      const target = parseFloat(el.dataset.countTo);
      const decimals = (el.dataset.countTo.split('.')[1] || '').length;
      const run = () => {
        el.dataset.counted = '1';
        if (!animations) {
          el.textContent = target.toLocaleString('pt-BR', { minimumFractionDigits: decimals });
          return;
        }
        const start = performance.now();
        const dur = 1600;
        const tick = (now) => {
          const k = Math.min(1, (now - start) / dur);
          const v = target * (1 - Math.pow(1 - k, 4));
          el.textContent = v.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      };
      if (!('IntersectionObserver' in window)) return run();
      const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          io.disconnect();
          run();
        }
      }, { threshold: 0.6 });
      io.observe(el);
    });
  }

  /* inclinação 3D suave no ponteiro */
  function initTilt(root = document) {
    if (!animations || window.matchMedia('(hover: none)').matches) return;
    $$('[data-tilt]', root).forEach((el) => {
      if (el.dataset.tiltReady) return;
      el.dataset.tiltReady = '1';
      const max = parseFloat(el.dataset.tilt) || 8;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--rx', (-y * max).toFixed(2) + 'deg');
        el.style.setProperty('--ry', (x * max).toFixed(2) + 'deg');
        el.style.setProperty('--mx', ((x + 0.5) * 100).toFixed(1) + '%');
        el.style.setProperty('--my', ((y + 0.5) * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------------- header ---------------- */
  function initHeader() {
    const wrap = $('[data-header-wrap]');
    const header = $('[data-header]');
    if (!wrap || !header || wrap.dataset.ready) return;
    wrap.dataset.ready = '1';
    // o topo transparente só faz sentido se a primeira seção da página for escura (a capa)
    const first = $('#MainContent > .shopify-section:first-child [data-header-overlay]');
    if (!first) wrap.classList.remove('header-wrap--overlay');
    // "none": o cabeçalho sobe junto com a página, então não ganha fundo branco ao rolar
    const fixed = wrap.dataset.sticky !== 'none';
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      header.classList.toggle('is-solid', (fixed && y > 40) || document.body.classList.contains('menu-open'));
      if (wrap.dataset.sticky === 'hide') {
        header.classList.toggle('is-hidden', y > 400 && y > lastY && !document.body.classList.contains('drawer-open'));
      }
      lastY = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------- drawers ---------------- */
  let lastFocus = null;
  function openDrawer(drawer) {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open');
    document.documentElement.style.overflow = 'hidden';
    const focusable = drawer.querySelector('[data-drawer-close], a, button, input');
    setTimeout(() => focusable && focusable.focus({ preventScroll: true }), 50);
  }
  function closeDrawer(drawer) {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (!$('.drawer.is-open')) {
      document.body.classList.remove('drawer-open');
      document.documentElement.style.overflow = '';
    }
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-drawer-open]');
    if (opener) {
      const drawer = document.getElementById(opener.dataset.drawerOpen);
      if (drawer) {
        e.preventDefault();
        openDrawer(drawer);
      }
      return;
    }
    const closer = e.target.closest('[data-drawer-close]');
    if (closer) {
      e.preventDefault();
      closeDrawer(closer.closest('.drawer'));
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') $$('.drawer.is-open').forEach(closeDrawer);
  });

  /* ---------------- toast ---------------- */
  let toastTimer;
  function toast(msg) {
    const el = $('[data-toast]');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 3200);
  }

  /* ---------------- carrinho ---------------- */
  const cart = {
    async refresh(open = false) {
      const res = await fetch(`${theme.routes.root.replace(/\/$/, '')}/?sections=cart-drawer`);
      const data = await res.json();
      const html = new DOMParser().parseFromString(data['cart-drawer'], 'text/html');
      const fresh = html.querySelector('[data-cart-drawer-inner]');
      const current = $('[data-cart-drawer-inner]');
      if (fresh && current) current.replaceWith(fresh);
      const count = fresh ? fresh.dataset.count : null;
      if (count !== null) this.setCount(count);
      bindQuantity(document.getElementById('CartDrawer') || document);
      if (open) openDrawer(document.getElementById('CartDrawer'));
    },
    setCount(count) {
      $$('[data-cart-count]').forEach((el) => {
        el.textContent = count > 0 ? count : '';
        el.dataset.count = count;
        el.classList.remove('is-bump');
        void el.offsetWidth;
        el.classList.add('is-bump');
      });
    },
    async add(formData) {
      const res = await fetch(theme.routes.cartAdd + '.js', {
        method: 'POST',
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || data.status) throw new Error(data.description || data.message || theme.strings.cartError);
      return data;
    },
    async change(line, quantity) {
      const res = await fetch(theme.routes.cartChange + '.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ line, quantity }),
      });
      const data = await res.json();
      if (!res.ok || data.status) throw new Error(data.description || data.message || theme.strings.cartError);
      return data;
    },
  };
  window.FreshCart = cart;

  document.addEventListener('submit', async (e) => {
    const form = e.target.closest('[data-product-form]');
    if (!form) return;
    if (theme.cartType === 'page' && !form.hasAttribute('data-ajax-always')) return;
    e.preventDefault();
    const button = form.querySelector('[type="submit"]');
    if (button) button.classList.add('is-loading');
    try {
      await cart.add(new FormData(form));
      if (button) {
        button.classList.remove('is-loading');
        button.classList.add('is-added');
        setTimeout(() => button.classList.remove('is-added'), 1800);
      }
      await cart.refresh(true);
    } catch (err) {
      if (button) button.classList.remove('is-loading');
      toast(err.message);
    }
  });

  function bindQuantity(root = document) {
    $$('[data-qty]', root).forEach((wrap) => {
      if (wrap.dataset.bound) return;
      wrap.dataset.bound = '1';
      const input = wrap.querySelector('input');
      const step = (d) => {
        const min = parseInt(input.min || '0', 10);
        const v = Math.max(min, (parseInt(input.value, 10) || 0) + d);
        input.value = v;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      };
      wrap.querySelector('[data-qty-minus]')?.addEventListener('click', () => step(-1));
      wrap.querySelector('[data-qty-plus]')?.addEventListener('click', () => step(1));
    });
  }

  let changeTimer;
  document.addEventListener('change', (e) => {
    const input = e.target.closest('[data-cart-line] input[name="updates[]"], [data-cart-line] [data-line-qty]');
    if (!input) return;
    const item = input.closest('[data-cart-line]');
    clearTimeout(changeTimer);
    changeTimer = setTimeout(async () => {
      item.classList.add('is-loading');
      try {
        await cart.change(parseInt(item.dataset.cartLine, 10), parseInt(input.value, 10) || 0);
        if (item.closest('[data-cart-page]')) window.location.reload();
        else await cart.refresh();
      } catch (err) {
        item.classList.remove('is-loading');
        toast(err.message);
      }
    }, 350);
  });

  document.addEventListener('click', async (e) => {
    const remove = e.target.closest('[data-cart-remove]');
    if (!remove) return;
    e.preventDefault();
    const item = remove.closest('[data-cart-line]');
    item.classList.add('is-loading');
    try {
      await cart.change(parseInt(item.dataset.cartLine, 10), 0);
      if (item.closest('[data-cart-page]')) window.location.reload();
      else await cart.refresh();
    } catch (err) {
      item.classList.remove('is-loading');
      toast(err.message);
    }
  });

  // abrir o carrinho pelo ícone (quando o tipo é "drawer")
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-cart-toggle]');
    if (!link || theme.cartType === 'page') return;
    const drawer = document.getElementById('CartDrawer');
    if (!drawer) return;
    e.preventDefault();
    openDrawer(drawer);
  });

  /* ---------------- busca ---------------- */
  function initSearch() {
    const modal = $('[data-search-modal]');
    if (!modal) return;
    const input = $('[data-search-input]', modal);
    const results = $('[data-search-results]', modal);
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-search-open]')) {
        e.preventDefault();
        if (typeof modal.showModal === 'function') modal.showModal();
        else window.location.href = theme.routes.search;
        setTimeout(() => input.focus(), 60);
      }
      if (e.target.closest('[data-search-close]') || e.target === modal) modal.close();
    });
    let timer;
    let controller;
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    input.addEventListener('input', () => {
      clearTimeout(timer);
      const q = input.value.trim();
      if (q.length < 2) {
        results.innerHTML = '';
        return;
      }
      timer = setTimeout(async () => {
        controller?.abort();
        controller = new AbortController();
        try {
          const url = `${theme.routes.predictiveSearch}.json?q=${encodeURIComponent(q)}&resources[type]=product&resources[limit]=6&resources[options][unavailable_products]=last`;
          const res = await fetch(url, { signal: controller.signal });
          const data = await res.json();
          const products = data?.resources?.results?.products || [];
          if (!products.length) {
            results.innerHTML = `<p class="muted">${theme.strings.noResults}</p>`;
            return;
          }
          results.innerHTML = products.map((p, i) => `
            <a class="search-result" href="${p.url}" style="--i:${i}">
              ${p.image ? `<img src="${p.image}${p.image.includes('?') ? '&' : '?'}width=160" alt="" loading="lazy" width="64" height="64">` : '<span></span>'}
              <span class="search-result__title">${esc(p.title)}</span>
              <span class="search-result__price">${formatMoney(Math.round(parseFloat(p.price) * 100))}</span>
            </a>`).join('') + `<a class="link-arrow" href="${theme.routes.search}?q=${encodeURIComponent(q)}">${theme.strings.viewAll}</a>`;
        } catch (err) {
          if (err.name !== 'AbortError') results.innerHTML = '';
        }
      }, 220);
    });
  }

  /* ---------------- abas ---------------- */
  function initTabs(root = document) {
    $$('[data-tabs]', root).forEach((tabs) => {
      if (tabs.dataset.ready) return;
      tabs.dataset.ready = '1';
      const buttons = $$('[data-tab]', tabs);
      const panels = $$('[data-tab-panel]', tabs);
      const indicator = $('[data-tab-indicator]', tabs);
      const move = (btn) => {
        if (!indicator || !btn) return;
        indicator.style.setProperty('--x', btn.offsetLeft + 'px');
        indicator.style.setProperty('--w', btn.offsetWidth + 'px');
      };
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          buttons.forEach((b) => b.setAttribute('aria-selected', b === btn ? 'true' : 'false'));
          panels.forEach((p) => {
            const on = p.dataset.tabPanel === btn.dataset.tab;
            p.hidden = !on;
            if (on) {
              $$('[data-reveal]', p).forEach((el) => {
                el.classList.remove('is-visible');
                void el.offsetWidth;
                el.classList.add('is-visible');
              });
            }
          });
          move(btn);
        });
      });
      const active = buttons.find((b) => b.getAttribute('aria-selected') === 'true') || buttons[0];
      requestAnimationFrame(() => move(active));
      window.addEventListener('resize', () => move(buttons.find((b) => b.getAttribute('aria-selected') === 'true')), { passive: true });
    });
  }

  /* ---------------- acordeões (details) com altura animada ---------------- */
  function initAccordions(root = document) {
    $$('details[data-accordion]', root).forEach((details) => {
      if (details.dataset.ready) return;
      details.dataset.ready = '1';
      const summary = details.querySelector('summary');
      const content = details.querySelector('[data-accordion-content]');
      if (!summary || !content || reduced) return;
      summary.addEventListener('click', (e) => {
        e.preventDefault();
        if (details.dataset.animating) return;
        details.dataset.animating = '1';
        if (details.open) {
          const h = content.offsetHeight;
          content.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 380, easing: 'cubic-bezier(0.65,0,0.35,1)' }).onfinish = () => {
            details.open = false;
            delete details.dataset.animating;
          };
        } else {
          details.open = true;
          const h = content.offsetHeight;
          content.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 480, easing: 'cubic-bezier(0.22,1,0.36,1)' }).onfinish = () => {
            delete details.dataset.animating;
          };
        }
      });
    });
  }

  /* página Dúvidas Frequentes: cada pergunta em negrito vira um item de sanfona.
     O texto continua sendo editado na própria página da Shopify. */
  function initFaqPage(root = document) {
    $$('[data-faq-page]', root).forEach((wrap) => {
      if (wrap.dataset.ready) return;
      wrap.dataset.ready = '1';
      const source = $('[data-faq-source]', wrap);
      const icon = $('template[data-faq-icon]', wrap);
      if (!source) return;
      const text = (el) => el.textContent.replace(/\s+/g, ' ').trim();
      // perguntas escritas TODAS EM MAIÚSCULAS ficam só com a inicial maiúscula
      const tidy = (q) => {
        if (q.length < 12 || q !== q.toUpperCase()) return q;
        const lower = q.toLowerCase();
        return (lower.charAt(0).toUpperCase() + lower.slice(1)).replace(/freshfemme/gi, 'FreshFemme').replace(/anvisa/gi, 'Anvisa');
      };
      const items = [];
      // formato da loja: <ul><li><strong>Pergunta</strong><ul><li>Resposta</li></ul></li></ul>
      $$(':scope > ul > li, :scope > ol > li', source).forEach((li) => {
        const strong = li.firstElementChild;
        if (!strong || strong.tagName !== 'STRONG' || !text(strong)) return;
        const before = Array.from(li.childNodes).slice(0, Array.from(li.childNodes).indexOf(strong));
        if (before.some((n) => n.textContent.trim())) return;
        items.push({ anchor: li.parentElement, q: text(strong), answer: Array.from(li.childNodes).filter((n) => n !== strong) });
      });
      // formato alternativo: título ou parágrafo só com negrito, e a resposta logo abaixo
      if (!items.length) {
        const kids = Array.from(source.children);
        kids.forEach((el, i) => {
          const isHeading = /^H[2-4]$/.test(el.tagName);
          const onlyStrong = el.tagName === 'P' && el.children.length === 1 && el.firstElementChild.tagName === 'STRONG' && text(el) === text(el.firstElementChild);
          if (!(isHeading || onlyStrong) || !text(el)) return;
          const answer = [];
          for (let j = i + 1; j < kids.length; j++) {
            const next = kids[j];
            const nextQ = /^H[2-4]$/.test(next.tagName) || (next.tagName === 'P' && next.children.length === 1 && next.firstElementChild.tagName === 'STRONG' && text(next) === text(next.firstElementChild));
            if (nextQ || next.tagName === 'HR') break;
            answer.push(next);
          }
          items.push({ anchor: el, q: text(el), answer });
        });
      }
      if (!items.length) return;
      const list = document.createElement('div');
      list.className = 'faq__list';
      items.forEach(({ q, answer }) => {
        const details = document.createElement('details');
        details.className = 'accordion';
        details.setAttribute('data-accordion', '');
        const summary = document.createElement('summary');
        summary.className = 'accordion__summary';
        const label = document.createElement('span');
        label.textContent = tidy(q);
        const iconWrap = document.createElement('span');
        iconWrap.className = 'accordion__icon';
        iconWrap.setAttribute('aria-hidden', 'true');
        if (icon) iconWrap.appendChild(icon.content.cloneNode(true));
        summary.append(label, iconWrap);
        const content = document.createElement('div');
        content.className = 'accordion__content';
        content.setAttribute('data-accordion-content', '');
        const body = document.createElement('div');
        body.className = 'rte';
        answer.forEach((n) => body.appendChild(n));
        // resposta que é uma lista de um item só vira parágrafo
        const only = body.children.length === 1 ? body.firstElementChild : null;
        if (only && /^(UL|OL)$/.test(only.tagName) && only.children.length === 1) {
          const para = document.createElement('div');
          para.append(...only.firstElementChild.childNodes);
          only.replaceWith(para);
        }
        content.appendChild(body);
        details.append(summary, content);
        list.appendChild(details);
      });
      // o que vinha antes da primeira pergunta (uma introdução) fica no lugar
      const first = items[0].anchor;
      first.before(list);
      items.forEach(({ anchor }) => anchor.isConnected && anchor !== list && anchor.remove());
      $$(':scope > hr', source).forEach((hr) => hr.remove());
      $$(':scope > p', source).forEach((p) => { if (!text(p)) p.remove(); });
      initAccordions(wrap);
    });
  }

  /* ---------------- contagem regressiva ---------------- */
  function initCountdowns(root = document) {
    $$('[data-countdown]', root).forEach((el) => {
      if (el.dataset.ready) return;
      el.dataset.ready = '1';
      let end;
      const raw = el.dataset.countdown;
      if (raw === 'week') {
        // até domingo 23:59 da semana atual
        end = new Date();
        end.setDate(end.getDate() + ((7 - end.getDay()) % 7));
        end.setHours(23, 59, 59, 0);
      } else if (raw === 'day') {
        end = new Date();
        end.setHours(23, 59, 59, 0);
      } else {
        end = new Date(raw);
      }
      const parts = { d: $('[data-cd="d"]', el), h: $('[data-cd="h"]', el), m: $('[data-cd="m"]', el), s: $('[data-cd="s"]', el) };
      const tick = () => {
        let diff = Math.max(0, end - new Date());
        const d = Math.floor(diff / 864e5); diff -= d * 864e5;
        const h = Math.floor(diff / 36e5); diff -= h * 36e5;
        const m = Math.floor(diff / 6e4); diff -= m * 6e4;
        const s = Math.floor(diff / 1e3);
        const pad = (n) => String(n).padStart(2, '0');
        if (parts.d) parts.d.textContent = pad(d);
        if (parts.h) parts.h.textContent = pad(h);
        if (parts.m) parts.m.textContent = pad(m);
        if (parts.s) parts.s.textContent = pad(s);
      };
      tick();
      setInterval(tick, 1000);
    });
  }

  /* ---------------- vídeo (carrega o YouTube só no clique) ---------------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-video-play]');
    if (!btn) return;
    const wrap = btn.closest('[data-video]');
    const id = wrap.dataset.video;
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.title = btn.getAttribute('aria-label') || 'Vídeo';
    wrap.classList.add('is-playing');
    wrap.appendChild(iframe);
  });

  /* provas reais: setas do carrossel e o vídeo abrindo numa janela */
  document.addEventListener('click', (e) => {
    const arrow = e.target.closest('[data-proofs-prev], [data-proofs-next]');
    if (arrow) {
      const list = $('[data-proofs]', arrow.closest('.proofs'));
      if (list) list.scrollBy({ left: (arrow.hasAttribute('data-proofs-next') ? 1 : -1) * list.clientWidth * 0.9, behavior: 'smooth' });
      return;
    }
    const card = e.target.closest('[data-proof]');
    if (card) {
      const modal = $('[data-video-modal]', card.closest('section') || document);
      if (!modal || typeof modal.showModal !== 'function') return;
      const frame = $('[data-video-modal-frame]', modal);
      const { kind, src } = card.dataset;
      frame.textContent = '';
      modal.classList.toggle('is-vertical', kind === 'instagram' || !!card.closest('.proofs__list--vertical'));
      if (kind === 'file') {
        const tpl = card.parentElement.querySelector('template[data-proof-video]');
        if (tpl) frame.appendChild(tpl.content.cloneNode(true));
      } else {
        let url = '';
        if (kind === 'youtube') url = `https://www.youtube-nocookie.com/embed/${src}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
        else if (kind === 'vimeo') url = `https://player.vimeo.com/video/${src}?autoplay=1`;
        else if (kind === 'instagram') {
          const m = src.match(/instagram\.com\/(?:[\w.]+\/)?(p|reel|tv)\/([\w-]+)/);
          if (!m) {
            window.open(src, '_blank', 'noopener');
            return;
          }
          url = `https://www.instagram.com/${m[1]}/${m[2]}/embed/`;
        }
        if (!url) return;
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        iframe.allowFullscreen = true;
        iframe.title = card.getAttribute('aria-label') || '';
        frame.appendChild(iframe);
      }
      modal.showModal();
      // foco no botão de fechar: se ficasse no vídeo, o Esc iria para o YouTube e não fecharia a janela
      $('[data-video-modal-close]', modal)?.focus();
      return;
    }
    const modal = e.target.closest('[data-video-modal]');
    if (modal && (e.target === modal || e.target.closest('[data-video-modal-close]'))) modal.close();
  });
  // fechar a janela para o vídeo (o evento close não sobe, por isso a captura)
  document.addEventListener('close', (e) => {
    if (e.target.matches && e.target.matches('[data-video-modal]')) $('[data-video-modal-frame]', e.target).textContent = '';
  }, true);

  /* ---------------- produto ---------------- */
  function initProduct(root = document) {
    $$('[data-product]', root).forEach((section) => {
      if (section.dataset.ready) return;
      section.dataset.ready = '1';
      const form = $('[data-main-form]', section);
      const idInput = form ? $('input[name="id"]', form) : null;
      const priceEl = $('[data-main-price]', section);
      const addBtn = form ? $('[data-add-button]', form) : null;
      const jsonEl = $('[data-product-json]', section);
      const product = jsonEl ? JSON.parse(jsonEl.textContent) : null;

      const renderPrice = (price, compare) => {
        if (!priceEl) return;
        const current = $('[data-price-current]', priceEl);
        const cmp = $('[data-price-compare]', priceEl);
        const badge = $('[data-price-badge]', priceEl);
        if (current) current.textContent = formatMoney(price);
        if (cmp) {
          cmp.hidden = !(compare > price);
          cmp.textContent = compare > price ? formatMoney(compare) : '';
        }
        if (badge) {
          badge.hidden = !(compare > price);
          if (compare > price) badge.textContent = '-' + Math.round(((compare - price) * 100) / compare) + '%';
        }
        const inst = $('[data-installments]', priceEl);
        if (inst) inst.innerHTML = installmentsHTML(price);
        const pix = $('[data-pix]', priceEl);
        if (pix) pix.innerHTML = pix.querySelector('svg').outerHTML + pixHTML(price);
        $$('[data-sticky-price]', section).forEach((el) => (el.textContent = formatMoney(price)));
      };

      const setAvailability = (available) => {
        if (!addBtn) return;
        addBtn.disabled = !available;
        const label = $('[data-add-label]', addBtn);
        if (label) label.textContent = available ? theme.strings.addToCart : theme.strings.soldOut;
      };

      // variantes por opções
      const pickers = $$('[data-option-index]', section);
      if (product && pickers.length) {
        section.addEventListener('change', (e) => {
          if (!e.target.closest('[data-option-index]')) return;
          const selected = pickers.map((p) => {
            const checked = p.querySelector('input:checked');
            return checked ? checked.value : p.querySelector('select')?.value;
          });
          const variant = product.variants.find((v) => v.options.every((o, i) => o === selected[i]));
          pickers.forEach((p, i) => {
            const label = p.querySelector('[data-option-value]');
            if (label) label.textContent = selected[i];
          });
          if (!variant) {
            setAvailability(false);
            return;
          }
          idInput.value = variant.id;
          renderPrice(variant.price, variant.compare_at_price);
          setAvailability(variant.available);
          const url = new URL(window.location.href);
          url.searchParams.set('variant', variant.id);
          window.history.replaceState({}, '', url);
          if (variant.featured_media) {
            const slide = $(`[data-media-id="${variant.featured_media.id}"]`, section);
            if (slide) goToSlide(Number(slide.dataset.index));
          }
        });
      }

      // escolha de kits: cada opção aponta para outra variante (outro produto)
      $$('[data-kit-option]', section).forEach((opt) => {
        opt.addEventListener('change', () => {
          if (!opt.checked) return;
          idInput.value = opt.value;
          renderPrice(Number(opt.dataset.price), Number(opt.dataset.compare));
          setAvailability(opt.dataset.available === 'true');
        });
      });

      // galeria
      const track = $('[data-gallery-track]', section);
      const thumbs = $$('[data-thumb]', section);
      const dots = $$('[data-dot]', section);
      const goToSlide = (i) => {
        if (!track) return;
        const slide = track.children[i];
        if (!slide) return;
        track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: reduced ? 'auto' : 'smooth' });
      };
      thumbs.forEach((t) => t.addEventListener('click', () => goToSlide(Number(t.dataset.thumb))));
      dots.forEach((d) => d.addEventListener('click', () => goToSlide(Number(d.dataset.dot))));
      if (track) {
        $('[data-gallery-prev]', section)?.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' }));
        $('[data-gallery-next]', section)?.addEventListener('click', () => track.scrollBy({ left: track.clientWidth, behavior: 'smooth' }));
        let t;
        track.addEventListener('scroll', () => {
          clearTimeout(t);
          t = setTimeout(() => {
            const i = Math.round(track.scrollLeft / track.clientWidth);
            thumbs.forEach((th) => th.classList.toggle('is-active', Number(th.dataset.thumb) === i));
            dots.forEach((d) => d.classList.toggle('is-active', Number(d.dataset.dot) === i));
          }, 60);
        }, { passive: true });
        // zoom acompanhando o mouse
        if (window.matchMedia('(hover: hover)').matches) {
          $$('[data-zoom]', track).forEach((fig) => {
            fig.addEventListener('pointermove', (e) => {
              const r = fig.getBoundingClientRect();
              fig.style.setProperty('--zx', ((e.clientX - r.left) / r.width) * 100 + '%');
              fig.style.setProperty('--zy', ((e.clientY - r.top) / r.height) * 100 + '%');
            });
          });
        }
      }

      // barra fixa de compra quando o botão principal sai da tela
      const sticky = $('[data-sticky-atc]', section);
      if (sticky && addBtn && 'IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
          const past = !entry.isIntersecting && entry.boundingClientRect.top < 0;
          sticky.classList.toggle('is-visible', past);
        }).observe(addBtn);
        $('[data-sticky-add]', sticky)?.addEventListener('click', () => {
          if (form.requestSubmit) form.requestSubmit(addBtn);
          else addBtn.click();
        });
      }
    });
  }

  /* recomendações de produto */
  function initRecommendations(root = document) {
    $$('[data-recommendations]', root).forEach(async (el) => {
      if (el.dataset.ready) return;
      el.dataset.ready = '1';
      try {
        const res = await fetch(el.dataset.recommendations);
        const text = await res.text();
        const html = new DOMParser().parseFromString(text, 'text/html');
        const fresh = html.querySelector('[data-recommendations-grid]');
        if (fresh && fresh.children.length) {
          const grid = $('[data-recommendations-grid]', el);
          grid.replaceWith(fresh);
          initReveal(el);
        }
      } catch (e) {
        /* mantém os produtos de reserva */
      }
    });
  }

  /* filtros e ordenação de coleção */
  function initCollection(root = document) {
    $$('[data-sort]', root).forEach((select) => {
      select.addEventListener('change', () => {
        const url = new URL(window.location.href);
        url.searchParams.set('sort_by', select.value);
        url.searchParams.delete('page');
        window.location.href = url.toString();
      });
    });
    $$('[data-filter-form]', root).forEach((form) => {
      form.addEventListener('change', (e) => {
        if (e.target.matches('input[type="checkbox"]') && !form.dataset.manual) form.requestSubmit ? form.requestSubmit() : form.submit();
      });
    });
  }

  /* passos da história do spray: ativa o passo que cruza o meio da tela */
  function initStory(root = document) {
    $$('[data-story]', root).forEach((story) => {
      if (story.dataset.ready) return;
      story.dataset.ready = '1';
      const steps = $$('[data-story-step]', story);
      if (!steps.length || !('IntersectionObserver' in window)) return;
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          steps.forEach((s) => s.classList.toggle('is-active', s === entry.target));
          story.dataset.active = entry.target.dataset.storyStep;
        });
      }, { rootMargin: '-45% 0px -45% 0px' });
      steps.forEach((s) => io.observe(s));
    });
  }

  /* mensagens que se revezam (barra de anúncios) */
  function initRotators(root = document) {
    $$('[data-rotator]', root).forEach((el) => {
      if (el.dataset.ready) return;
      el.dataset.ready = '1';
      const items = Array.from(el.children);
      if (items.length < 2 || reduced) return;
      let i = 0;
      setInterval(() => {
        items[i].classList.remove('is-active');
        i = (i + 1) % items.length;
        items[i].classList.add('is-active');
      }, (parseFloat(el.dataset.interval) || 5) * 1000);
    });
  }

  /* capa: a cena térmica é o primeiro slide; quando ela termina de gelar, entram os banners */
  function initHeroSlider(root = document) {
    $$('[data-hero-slider]', root).forEach((el) => {
      if (el.dataset.ready) return;
      el.dataset.ready = '1';
      const track = $('[data-slider-track]', el);
      const slides = $$('[data-slide]', el);
      const dots = $$('[data-slider-dot]', el);
      const pauseBtn = $('[data-slider-pause]', el);
      if (!track || slides.length < 2) return;
      const interval = (parseFloat(el.dataset.interval) || 5) * 1000;
      // o frio leva 7,4 s para descer pelo corpo todo (linha do tempo em thermal.js)
      const thermalTime = (7.4 + (parseFloat(el.dataset.thermalHold) || 0)) * 1000;
      let index = 0;
      let timer = 0;
      let paused = reduced;
      let inView = true;

      const isThermal = (slide) => slide.hasAttribute('data-thermal');
      const durationFor = (slide) => (isThermal(slide) && !slide.classList.contains('thermal--fallback') ? thermalTime : interval);
      const restartThermal = () => {
        if (isThermal(slides[index])) slides[index].dispatchEvent(new CustomEvent('thermal:restart'));
      };

      const schedule = () => {
        clearTimeout(timer);
        dots.forEach((d) => d.classList.remove('is-timed'));
        if (paused || !inView || document.hidden) return;
        const ms = durationFor(slides[index]);
        const dot = dots[index];
        if (dot) {
          dot.style.setProperty('--slide-ms', ms + 'ms');
          void dot.offsetWidth; // reinicia a barrinha de progresso
          dot.classList.add('is-timed');
        }
        timer = setTimeout(() => go(index + 1), ms);
      };

      const go = (i) => {
        index = (i + slides.length) % slides.length;
        track.style.transform = `translate3d(${-100 * index}%, 0, 0)`;
        slides.forEach((slide, k) => {
          const on = k === index;
          slide.classList.toggle('is-active', on);
          slide.toggleAttribute('inert', !on);
          if (slide.hasAttribute('aria-roledescription')) slide.setAttribute('aria-hidden', on ? 'false' : 'true');
        });
        dots.forEach((d, k) => {
          d.classList.toggle('is-active', k === index);
          if (k === index) d.setAttribute('aria-current', 'true');
          else d.removeAttribute('aria-current');
        });
        restartThermal();
        schedule();
      };

      const setPaused = (value) => {
        paused = value;
        el.classList.toggle('is-paused', paused);
        if (pauseBtn) pauseBtn.setAttribute('aria-label', paused ? pauseBtn.dataset.labelPlay : pauseBtn.dataset.labelPause);
        schedule();
      };

      $('[data-slider-prev]', el)?.addEventListener('click', () => go(index - 1));
      $('[data-slider-next]', el)?.addEventListener('click', () => go(index + 1));
      dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
      pauseBtn?.addEventListener('click', () => setPaused(!paused));
      el.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') go(index - 1);
        else if (e.key === 'ArrowRight') go(index + 1);
      });

      // arrastar com o dedo (ou o mouse) troca o slide
      let startX = 0;
      let startY = 0;
      let dx = 0;
      let down = false;
      let moved = false;
      track.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        down = true;
        moved = false;
        dx = 0;
        startX = e.clientX;
        startY = e.clientY;
      });
      track.addEventListener('pointermove', (e) => {
        if (!down) return;
        dx = e.clientX - startX;
        if (!moved && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(e.clientY - startY)) {
          moved = true;
          track.classList.add('is-dragging');
          clearTimeout(timer);
          if (track.setPointerCapture) track.setPointerCapture(e.pointerId);
        }
        if (moved) track.style.transform = `translate3d(calc(${-100 * index}% + ${dx}px), 0, 0)`;
      });
      const release = () => {
        if (!down) return;
        down = false;
        track.classList.remove('is-dragging');
        if (!moved) return;
        go(Math.abs(dx) > 50 ? index + (dx < 0 ? 1 : -1) : index);
      };
      track.addEventListener('pointerup', release);
      track.addEventListener('pointercancel', release);
      // um arrasto não deve abrir o link do banner
      track.addEventListener('click', (e) => {
        if (moved) {
          e.preventDefault();
          moved = false;
        }
      }, true);

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
          const was = inView;
          inView = entry.isIntersecting;
          if (inView && !was) restartThermal();
          schedule();
        }, { threshold: 0.3 }).observe(el);
      }
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) restartThermal();
        schedule();
      });

      // editor de temas: mostra o banner selecionado e para de trocar enquanto ele está selecionado
      el.addEventListener('shopify:block:select', (e) => {
        const k = slides.indexOf(e.target.closest('[data-slide]'));
        if (k < 0) return;
        paused = true;
        go(k);
      });
      el.addEventListener('shopify:block:deselect', () => setPaused(reduced));

      setPaused(paused);
    });
  }

  /* ---------------- boot ---------------- */
  function initAll(root = document) {
    initReveal(root);
    initProgress(root);
    initCounters(root);
    initTilt(root);
    initTabs(root);
    initAccordions(root);
    initCountdowns(root);
    initProduct(root);
    initStory(root);
    initRotators(root);
    initHeroSlider(root);
    initFaqPage(root);
    initRecommendations(root);
    initCollection(root);
    bindQuantity(root);
  }

  const ready = () => {
    initHeader();
    initSearch();
    initAll();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();

  // editor de temas
  document.addEventListener('shopify:section:load', (e) => {
    initAll(e.target);
    initHeader();
  });
  document.addEventListener('shopify:section:select', (e) => {
    $$('[data-reveal]', e.target).forEach((el) => el.classList.add('is-visible'));
  });

  window.FreshTheme = { formatMoney, installmentsHTML, toast, openDrawer, closeDrawer };
})();
