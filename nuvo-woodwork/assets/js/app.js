/* =============================================================================
   Comportamento da página: cabeçalho, menu do celular, índice de ambientes e
   formulário. O filme da casa fica em film.js e os textos dele em content.js.
   ========================================================================== */
(function () {
  'use strict';

  const C = window.NUVO || {};
  const contact = Object.assign({ phone: '(561) 770-2595', tel: '+15617702595', email: 'info@nuvowoodwork.com', formEndpoint: '' }, C.contact);

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------------ cabeçalho */
  // Transparente sobre o filme; com fundo depois que o filme termina
  const header = $('[data-header]');
  const film = $('[data-film]');
  let filmEnd = 0;
  const measure = () => {
    filmEnd = film ? film.offsetTop + film.offsetHeight - window.innerHeight : 0;
  };
  const headerState = () => {
    header.classList.toggle('is-solid', window.scrollY > Math.max(24, filmEnd - 8));
    document.documentElement.classList.toggle('on-film', window.scrollY < filmEnd);
  };
  measure();
  headerState();
  window.addEventListener('scroll', headerState, { passive: true });
  window.addEventListener('resize', () => {
    measure();
    headerState();
  });

  /* ------------------------------------------------------------ menu do celular */
  const menu = $('[data-menu]');
  const menuBtn = $('[data-menu-btn]');
  const menuLabel = $('[data-menu-label]');

  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.inert = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuLabel.textContent = open ? 'Close menu' : 'Open menu';
    menuBtn.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
    document.body.classList.toggle('menu-open', open);
    header.classList.toggle('is-solid', open || window.scrollY > Math.max(24, filmEnd - 8));
  }
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      setMenu(false);
      menuBtn.focus();
    }
  });

  /* ------------------------------------------------------------ entrada das seções */
  const reveal = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }),
      { rootMargin: '0px 0px -10% 0px' }
    );
    reveal.forEach((el) => io.observe(el));
  } else {
    reveal.forEach((el) => el.classList.add('is-in'));
  }

  /* ------------------------------------------------------------ índice de ambientes */
  // Cada linha volta ao ambiente correspondente no filme
  $$('[data-scene-link]').forEach((row) => {
    row.addEventListener('click', (e) => {
      if (!window.NUVO_FILM) return;
      e.preventDefault();
      window.NUVO_FILM.goToScene(row.dataset.sceneLink);
    });
  });

  // No computador, a foto do projeto acompanha o cursor sobre a lista
  const box = $('[data-preview-box]');
  const list = $('[data-index]');
  if (box && list && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const img = $('img', box);
    const cap = $('span', box);
    const pos = { x: 0, y: 0, px: 0, py: 0 };
    let raf = 0;
    let visible = false;

    const place = () => {
      raf = 0;
      const k = reduce.matches ? 1 : 0.2;
      pos.px += (pos.x - pos.px) * k;
      pos.py += (pos.y - pos.py) * k;
      box.style.transform = 'translate3d(' + pos.px.toFixed(1) + 'px,' + pos.py.toFixed(1) + 'px,0)';
      if (Math.abs(pos.x - pos.px) + Math.abs(pos.y - pos.py) > 0.4) raf = requestAnimationFrame(place);
    };
    const follow = (x, y) => {
      pos.x = x;
      pos.y = y;
      box.classList.toggle('is-flip', x > window.innerWidth - box.offsetWidth - 80);
      if (!raf) raf = requestAnimationFrame(place);
    };
    const show = (row, x, y) => {
      if (img.getAttribute('src') !== row.dataset.preview) img.src = row.dataset.preview;
      cap.textContent = row.dataset.caption || '';
      if (!visible) {
        pos.px = x;
        pos.py = y;
      }
      visible = true;
      box.classList.add('is-on');
      follow(x, y);
    };
    const hide = () => {
      visible = false;
      box.classList.remove('is-on');
    };

    $$('[data-preview]', list).forEach((row) => {
      row.addEventListener('pointerenter', (e) => show(row, e.clientX, e.clientY));
      row.addEventListener('focus', () => {
        const r = row.getBoundingClientRect();
        show(row, r.left + r.width * 0.62, r.top + r.height / 2);
      });
      row.addEventListener('blur', hide);
    });
    list.addEventListener('pointermove', (e) => {
      if (visible) follow(e.clientX, e.clientY);
    });
    list.addEventListener('pointerleave', hide);
    window.addEventListener('scroll', () => {
      if (visible && !list.matches(':hover')) hide();
    }, { passive: true });
  }

  /* ------------------------------------------------------------ formulário */
  // "Plan your kitchen" etc. já deixam o ambiente marcado no formulário
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-room]');
    if (!a || !a.dataset.room) return;
    const chip = $$('.chips input').find((x) => x.value === a.dataset.room);
    if (chip) chip.checked = true;
  });

  const form = $('[data-contact-form]');
  if (form) {
    const note = $('[data-form-note]', form);
    const button = $('button[type="submit"]', form);
    const say = (html, state) => {
      note.innerHTML = html;
      note.dataset.state = state || '';
    };
    const fallback =
      'Please call <a href="tel:' + esc(contact.tel) + '">' + esc(contact.phone) + '</a> or write to <a href="mailto:' +
      esc(contact.email) + '">' + esc(contact.email) + '</a>.';

    form.addEventListener('input', (e) => e.target.removeAttribute('aria-invalid'));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const get = (k) => String(data.get(k) || '').trim();
      const name = get('name');
      const phone = get('phone');
      const email = get('email');

      if (!name) {
        form.elements.name.setAttribute('aria-invalid', 'true');
        form.elements.name.focus();
        return say('Please tell us your name.', 'error');
      }
      if (!phone && !email) {
        form.elements.phone.setAttribute('aria-invalid', 'true');
        form.elements.phone.focus();
        return say('Leave a phone number or an email so we can reach you.', 'error');
      }

      if (contact.formEndpoint) {
        button.disabled = true;
        say('Sending…');
        try {
          const res = await fetch(contact.formEndpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          form.reset();
          say('Thank you, ' + esc(name.split(' ')[0]) + '. We received your request and will get back to you soon.', 'ok');
        } catch (err) {
          say('We could not send your request right now. ' + fallback, 'error');
        } finally {
          button.disabled = false;
        }
        return;
      }

      // Sem endereço de formulário: abre o e-mail com a mensagem pronta
      const rooms = data.getAll('rooms');
      const lines = ['Name: ' + name];
      if (phone) lines.push('Phone: ' + phone);
      if (email) lines.push('Email: ' + email);
      if (get('city')) lines.push('Project in: ' + get('city'));
      if (rooms.length) lines.push('Rooms: ' + rooms.join(', '));
      if (get('message')) lines.push('', get('message'));
      const subject = 'Free 3D design consultation: ' + name;
      window.location.href =
        'mailto:' + contact.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
      say('Your email app should open with the request ready to send. If it does not, ' + fallback.charAt(0).toLowerCase() + fallback.slice(1), 'ok');
    });
  }

  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
})();
