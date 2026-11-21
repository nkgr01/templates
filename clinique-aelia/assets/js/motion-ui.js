/* =========================================================
   motion-ui.js — Composants « façon Framer » en JavaScript vanilla
   Moteur : Motion (ex-Framer Motion) — https://motion.dev
   Fichier identique dans les 3 templates (Kinetik, Aelia, Orea).
   Tout est piloté par des attributs data-* : voir le README.
   ========================================================= */
(() => {
  const M = window.Motion;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;

  // Sans Motion (CDN bloqué) ou si l'utilisateur limite les animations : tout reste visible.
  const live = !!M && !reduce;
  root.classList.add(live ? 'mo-ready' : 'mo-off');
  // Si le filet de sécurité (3 s, dans le <head>) s'est déclenché sur une connexion lente, on le retire.
  if (live) root.classList.remove('mo-off');
  window.__moReady = true;

  const springSoft = { type: 'spring', stiffness: 120, damping: 20, mass: 0.8 };
  const springSnappy = { type: 'spring', stiffness: 400, damping: 34 };
  const ease = [0.22, 1, 0.36, 1];
  const animate = (...a) => (live ? M.animate(...a) : null);

  /* ---------- Année ---------- */
  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- En-tête : état « scrollé » ---------- */
  const header = $('[data-header]');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 24);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Barre de progression de lecture ---------- */
  $$('[data-scroll-progress]').forEach((bar) => {
    if (!live) return bar.remove();
    M.scroll(M.animate(bar, { scaleX: [0, 1] }, { ease: 'linear' }));
  });

  /* ---------- Navigation : pastille qui glisse sous le lien survolé ---------- */
  $$('[data-nav-pill]').forEach((nav) => {
    const pill = document.createElement('span');
    pill.className = 'nav-pill';
    pill.setAttribute('aria-hidden', 'true');
    nav.prepend(pill);
    const links = $$('a', nav);
    const current = links.find((a) => a.getAttribute('aria-current') === 'page');
    const moveTo = (a, instant) => {
      if (!a) return animate(pill, { opacity: 0 }, { duration: 0.2 });
      const opts = instant || !live ? { duration: 0 } : springSnappy;
      const box = { x: a.offsetLeft, width: a.offsetWidth, opacity: 1 };
      if (!live) return Object.assign(pill.style, { transform: `translateX(${box.x}px)`, width: box.width + 'px', opacity: 1 });
      M.animate(pill, box, opts);
    };
    requestAnimationFrame(() => moveTo(current, true));
    links.forEach((a) => a.addEventListener('mouseenter', () => moveTo(a)));
    nav.addEventListener('mouseleave', () => moveTo(current));
    addEventListener('resize', () => moveTo(current, true));
  });

  /* ---------- Menu mobile ---------- */
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-menu]');
  if (toggle && menu) {
    const items = $$('[data-menu-item]', menu);
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', open);
      toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      root.classList.toggle('menu-open', open);
      menu.classList.toggle('is-open', open);
      if (open && live) {
        M.animate(menu, { clipPath: ['inset(0 0 100% 0 round 0 0 32px 32px)', 'inset(0 0 0% 0 round 0 0 0px 0px)'] }, { duration: 0.6, ease });
        M.animate(items, { opacity: [0, 1], y: [40, 0], filter: ['blur(8px)', 'blur(0px)'] }, { delay: M.stagger(0.06, { startDelay: 0.15 }), duration: 0.6, ease });
      }
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    addEventListener('keydown', (e) => e.key === 'Escape' && setOpen(false));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => setOpen(false)));
  }

  /* ---------- Découpe d'un titre en mots (conserve <em>, <br>, <span>…) ---------- */
  function splitWords(el) {
    const words = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) return frag.append(' ');
            const w = document.createElement('span');
            w.className = 'mo-w';
            w.textContent = part;
            frag.append(w);
            words.push(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR' && !n.hasAttribute('data-rotate-words')) {
          walk(n);
        } else if (n.nodeType === 1 && n.hasAttribute('data-rotate-words')) {
          words.push(n);
        }
      });
    };
    walk(el);
    return words;
  }

  /* ---------- Texte qui apparaît en se défloutant (effet Framer « Blur in ») ---------- */
  $$('[data-blur-text]').forEach((el) => {
    const words = splitWords(el);
    if (!live) return;
    M.animate(words, { opacity: 0, filter: 'blur(12px)', y: '0.35em' }, { duration: 0 });
    M.inView(el, () => {
      M.animate(words, { opacity: 1, filter: 'blur(0px)', y: 0 }, { delay: M.stagger(0.06, { startDelay: +(el.dataset.delay || 0) }), duration: 0.9, ease });
    }, { amount: 0.3 });
  });

  /* ---------- Mots qui défilent dans un titre ---------- */
  $$('[data-rotate-words]').forEach((box) => {
    const words = box.dataset.rotateWords.split('|');
    box.textContent = '';
    const spans = words.map((w, i) => {
      const s = document.createElement('span');
      s.textContent = w;
      if (i) s.setAttribute('aria-hidden', 'true');
      box.append(s);
      return s;
    });
    spans.slice(1).forEach((s) => Object.assign(s.style, { opacity: 0 }));
    if (!live) return;
    let i = 0;
    setInterval(() => {
      const prev = spans[i];
      i = (i + 1) % spans.length;
      const next = spans[i];
      M.animate(prev, { y: ['0%', '-60%'], opacity: [1, 0], filter: ['blur(0px)', 'blur(8px)'] }, { duration: 0.5, ease });
      M.animate(next, { y: ['60%', '0%'], opacity: [0, 1], filter: ['blur(8px)', 'blur(0px)'] }, { duration: 0.6, delay: 0.1, ease });
    }, +(box.dataset.interval || 2600));
  });

  /* ---------- Apparition au scroll (opacité + glissement + flou) ---------- */
  $$('[data-appear]').forEach((el) => {
    if (!live) return;
    const y = +(el.dataset.y || 32);
    M.animate(el, { opacity: 0, y, filter: 'blur(6px)' }, { duration: 0 });
    M.inView(el, () => {
      M.animate(el, { opacity: 1, y: 0, filter: 'blur(0px)' }, { duration: 0.9, delay: +(el.dataset.delay || 0), ease });
    }, { amount: 0.2 });
  });

  /* ---------- Enfants en cascade ---------- */
  $$('[data-stagger]').forEach((el) => {
    if (!live) return;
    const kids = [...el.children];
    M.animate(kids, { opacity: 0, y: 40, scale: 0.97 }, { duration: 0 });
    M.inView(el, () => {
      M.animate(kids, { opacity: 1, y: 0, scale: 1 }, { delay: M.stagger(+(el.dataset.stagger || 0.08)), ...springSoft });
    }, { amount: 0.15 });
  });

  /* ---------- Compteurs ---------- */
  $$('[data-counter]').forEach((el) => {
    const end = parseFloat(el.dataset.counter);
    const dec = +(el.dataset.decimals || 0);
    const fmt = (v) => v.toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (!live) return (el.textContent = fmt(end));
    el.textContent = fmt(0);
    M.inView(el, () => {
      M.animate(0, end, { duration: 2, ease, onUpdate: (v) => (el.textContent = fmt(v)) });
    });
  });

  /* ---------- Bandeau défilant infini (ralentit au survol) ---------- */
  $$('[data-ticker]').forEach((box) => {
    const track = box.firstElementChild;
    track.append(...[...track.children].map((c) => { const k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); return k; }));
    if (!live) return;
    const dir = box.dataset.direction === 'right' ? ['-50%', '0%'] : ['0%', '-50%'];
    const anim = M.animate(track, { x: dir }, { duration: +(box.dataset.ticker || 30), ease: 'linear', repeat: Infinity });
    if (canHover && box.hasAttribute('data-ticker-hover')) {
      const to = (s) => M.animate(anim.speed, s, { duration: 0.6, onUpdate: (v) => (anim.speed = v) });
      box.addEventListener('mouseenter', () => to(0.2));
      box.addEventListener('mouseleave', () => to(1));
    }
  });

  /* ---------- Parallaxe liée au scroll ---------- */
  $$('[data-parallax]').forEach((el) => {
    if (!live) return;
    const k = parseFloat(el.dataset.parallax) || 0.15;
    const dist = () => el.offsetHeight * k;
    M.scroll(M.animate(el, { y: [-dist(), dist()] }, { ease: 'linear' }), { target: el.parentElement, offset: ['start end', 'end start'] });
  });

  /* ---------- Image qui dézoome pendant le scroll ---------- */
  $$('[data-zoom-scroll]').forEach((el) => {
    if (!live) return;
    const from = parseFloat(el.dataset.zoomScroll) || 1.2;
    M.scroll(M.animate(el, { scale: [from, 1] }, { ease: 'linear' }), { target: el.parentElement, offset: ['start end', 'end start'] });
  });

  /* ---------- Bloc qui s'ouvre (clip-path) lié au scroll ---------- */
  $$('[data-clip-scroll]').forEach((el) => {
    if (!live) return;
    M.scroll(
      M.animate(el, { clipPath: ['inset(14% 12% 14% 12% round 40px)', 'inset(0% 0% 0% 0% round 0px)'] }, { ease: 'linear' }),
      { target: el, offset: ['start end', 'center center'] }
    );
  });

  /* ---------- Cartes empilées (sticky) qui reculent ---------- */
  $$('[data-stack]').forEach((stack) => {
    const cards = $$('[data-stack-card]', stack);
    if (!live) return;
    cards.forEach((card, i) => {
      if (i === cards.length - 1) return;
      const end = 1 - (cards.length - 1 - i) * 0.04;
      M.scroll(M.animate(card, { scale: [1, end], filter: ['brightness(1)', 'brightness(.7)'] }, { ease: 'linear' }), {
        target: cards[i + 1],
        offset: ['start end', 'start start'],
      });
    });
  });

  /* ---------- Défilement horizontal lié au scroll vertical ---------- */
  $$('[data-hscroll]').forEach((sec) => {
    const track = $('[data-hscroll-track]', sec);
    if (!live || innerWidth < 1024) return sec.classList.add('hs-off');
    const setup = () => {
      const dist = track.scrollWidth - innerWidth + 80;
      sec.style.height = `${innerHeight + dist}px`;
      return dist;
    };
    let dist = setup();
    M.scroll((p) => { track.style.transform = `translateX(${-p * dist}px)`; }, { target: sec, offset: ['start start', 'end end'] });
    addEventListener('resize', () => (dist = setup()));
  });

  /* ---------- Boutons magnétiques (ressort) ---------- */
  if (canHover && live) {
    $$('[data-magnetic]').forEach((el) => {
      const k = parseFloat(el.dataset.magnetic) || 0.3;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        M.animate(el, { x: (e.clientX - r.left - r.width / 2) * k, y: (e.clientY - r.top - r.height / 2) * k }, springSnappy);
      });
      el.addEventListener('pointerleave', () => M.animate(el, { x: 0, y: 0 }, { type: 'spring', stiffness: 200, damping: 12 }));
    });
  }

  /* ---------- Cartes inclinables 3D + projecteur ---------- */
  $$('[data-tilt],[data-spotlight]').forEach((el) => {
    const max = parseFloat(el.dataset.tilt) || 0;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
      if (max && live && canHover) M.animate(el, { rotateY: (px - 0.5) * max * 2, rotateX: (0.5 - py) * max * 2 }, springSnappy);
    });
    el.addEventListener('pointerleave', () => max && live && M.animate(el, { rotateX: 0, rotateY: 0 }, springSoft));
  });

  /* ---------- Curseur personnalisé avec étiquette ---------- */
  if (canHover && live && document.body.hasAttribute('data-cursor')) {
    const cur = document.createElement('div');
    cur.className = 'mo-cursor';
    cur.innerHTML = '<span></span>';
    document.body.append(cur);
    const label = cur.firstChild;
    let shown = false;
    addEventListener('pointermove', (e) => {
      M.animate(cur, { x: e.clientX, y: e.clientY }, shown ? { type: 'spring', stiffness: 500, damping: 40, mass: 0.4 } : { duration: 0 });
      shown = true;
      const t = e.target.closest('[data-cursor-label]');
      const txt = t ? t.dataset.cursorLabel : '';
      if (txt !== cur.dataset.label) {
        cur.dataset.label = txt;
        label.textContent = txt;
        M.animate(cur, { width: txt ? 96 : 12, height: txt ? 96 : 12 }, springSnappy);
        M.animate(label, { opacity: txt ? 1 : 0, scale: txt ? 1 : 0.5 }, { duration: 0.2 });
      }
      cur.classList.toggle('is-link', !txt && !!e.target.closest('a,button,[role=tab]'));
    });
    document.addEventListener('mouseleave', () => M.animate(cur, { opacity: 0 }));
    document.addEventListener('mouseenter', () => M.animate(cur, { opacity: 1 }));
  }

  /* ---------- Aperçu d'image qui suit la souris sur une liste ---------- */
  $$('[data-hover-reveal]').forEach((list) => {
    if (!canHover || !live) return;
    const fig = document.createElement('div');
    fig.className = 'mo-reveal';
    fig.setAttribute('aria-hidden', 'true');
    fig.innerHTML = '<img alt="">';
    document.body.append(fig);
    const img = fig.firstChild;
    M.animate(fig, { opacity: 0, scale: 0.6 }, { duration: 0 });
    list.addEventListener('pointermove', (e) => {
      M.animate(fig, { x: e.clientX + 24, y: e.clientY - 120, rotate: (e.movementX || 0) * 0.4 }, { type: 'spring', stiffness: 260, damping: 26 });
    });
    $$('[data-reveal-img]', list).forEach((row) => {
      row.addEventListener('mouseenter', () => {
        img.src = row.dataset.revealImg;
        M.animate(fig, { opacity: 1, scale: 1 }, springSnappy);
      });
    });
    list.addEventListener('mouseleave', () => M.animate(fig, { opacity: 0, scale: 0.6 }, { duration: 0.25 }));
  });

  /* ---------- Onglets avec indicateur glissant ---------- */
  $$('[data-tabs]').forEach((box) => {
    const tabs = $$('[role="tab"]', box);
    const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
    const ind = $('[data-tab-indicator]', box);
    const place = (t, instant) => {
      if (!ind) return;
      const box2 = { x: t.offsetLeft, y: t.offsetTop, width: t.offsetWidth, height: t.offsetHeight };
      if (!live || instant) return Object.assign(ind.style, { transform: `translate(${box2.x}px,${box2.y}px)`, width: box2.width + 'px', height: box2.height + 'px' });
      M.animate(ind, box2, springSnappy);
    };
    const select = (t, focus) => {
      tabs.forEach((x, i) => {
        const on = x === t;
        x.setAttribute('aria-selected', on);
        x.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
        if (on && live) M.animate(panels[i], { opacity: [0, 1], y: [16, 0], filter: ['blur(6px)', 'blur(0px)'] }, { duration: 0.5, ease });
      });
      place(t);
      if (focus) t.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
      });
    });
    const first = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
    requestAnimationFrame(() => place(first, true));
    addEventListener('resize', () => place(tabs.find((t) => t.getAttribute('aria-selected') === 'true'), true));
  });

  /* ---------- Accordéon (hauteur animée au ressort) ---------- */
  $$('[data-accordion]').forEach((acc) => {
    const single = acc.dataset.accordion !== 'multi';
    const items = $$('[data-acc-item]', acc);
    const set = (item, open) => {
      const btn = $('button', item), panel = $('[data-acc-panel]', item), icon = $('[data-acc-icon]', item);
      btn.setAttribute('aria-expanded', open);
      item.classList.toggle('is-open', open);
      if (icon) live ? M.animate(icon, { rotate: open ? 45 : 0 }, springSnappy) : (icon.style.transform = `rotate(${open ? 45 : 0}deg)`);
      if (!live) return (panel.hidden = !open);
      if (open) {
        panel.hidden = false;
        const h = panel.scrollHeight;
        M.animate(panel, { height: [0, h], opacity: [0, 1] }, { type: 'spring', stiffness: 260, damping: 30 }).then(() => (panel.style.height = 'auto'));
      } else {
        M.animate(panel, { height: [panel.offsetHeight, 0], opacity: [1, 0] }, { duration: 0.3, ease }).then(() => {
          if (btn.getAttribute('aria-expanded') === 'false') panel.hidden = true;
        });
      }
    };
    items.forEach((item) => {
      $('button', item).addEventListener('click', () => {
        const open = $('button', item).getAttribute('aria-expanded') !== 'true';
        if (single && open) items.forEach((o) => o !== item && $('button', o).getAttribute('aria-expanded') === 'true' && set(o, false));
        set(item, open);
      });
    });
  });

  /* ---------- Carrousel à glisser (drag + ressort + inertie) ---------- */
  $$('[data-carousel]').forEach((box) => {
    const track = $('[data-carousel-track]', box);
    const slides = [...track.children];
    let x = 0, start = 0, origin = 0, vx = 0, lastX = 0, lastT = 0, dragging = false, moved = false;
    const max = () => Math.max(0, track.scrollWidth - box.clientWidth);
    const snaps = () => slides.map((s) => Math.min(s.offsetLeft - slides[0].offsetLeft, max()));
    const go = (to, v = 0) => {
      x = Math.max(-max(), Math.min(0, to));
      const nearest = snaps().reduce((a, b) => (Math.abs(-b - x) < Math.abs(-a - x) ? b : a), 0);
      x = -nearest;
      live ? M.animate(track, { x }, { type: 'spring', stiffness: 220, damping: 32, velocity: v }) : (track.style.transform = `translateX(${x}px)`);
      updateDots();
    };
    const dots = $('[data-carousel-dots]', box);
    const idx = () => { const s = snaps(); return s.reduce((bi, b, i) => (Math.abs(-b - x) < Math.abs(-s[bi] - x) ? i : bi), 0); };
    const updateDots = () => dots && $$('button', dots).forEach((d, i) => d.setAttribute('aria-current', i === idx()));
    if (dots) {
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `Aller à l'élément ${i + 1}`);
        b.addEventListener('click', () => go(-snaps()[i]));
        dots.append(b);
      });
    }
    track.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      dragging = true; moved = false;
      start = e.clientX; origin = x; lastX = e.clientX; lastT = performance.now(); vx = 0;
      track.setPointerCapture(e.pointerId);
      box.classList.add('is-dragging');
    });
    track.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - start;
      if (Math.abs(dx) > 4) moved = true;
      let nx = origin + dx;
      if (nx > 0) nx *= 0.35; // résistance élastique aux bords
      if (nx < -max()) nx = -max() + (nx + max()) * 0.35;
      x = nx;
      track.style.transform = `translateX(${x}px)`;
      const now = performance.now();
      vx = ((e.clientX - lastX) / Math.max(1, now - lastT)) * 1000;
      lastX = e.clientX; lastT = now;
    });
    const end = () => {
      if (!dragging) return;
      dragging = false;
      box.classList.remove('is-dragging');
      go(x + vx * 0.25, vx);
    };
    track.addEventListener('pointerup', end);
    track.addEventListener('pointercancel', end);
    track.addEventListener('click', (e) => moved && e.preventDefault(), true);
    track.addEventListener('dragstart', (e) => e.preventDefault());
    $('[data-carousel-prev]', box)?.addEventListener('click', () => go(-snaps()[Math.max(0, idx() - 1)]));
    $('[data-carousel-next]', box)?.addEventListener('click', () => go(-snaps()[Math.min(slides.length - 1, idx() + 1)]));
    box.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') go(-snaps()[Math.min(slides.length - 1, idx() + 1)]);
      if (e.key === 'ArrowLeft') go(-snaps()[Math.max(0, idx() - 1)]);
    });
    addEventListener('resize', () => go(x));
    updateDots();
  });

  /* ---------- Filtres avec animation de mise en page (FLIP) ---------- */
  $$('[data-filter-group]').forEach((group) => {
    const grid = document.getElementById(group.dataset.filterGroup);
    const items = $$('[data-cat]', grid);
    const btns = $$('[data-filter]', group);
    const pill = $('[data-filter-pill]', group);
    const place = (b, instant) => {
      if (!pill) return;
      const v = { x: b.offsetLeft, width: b.offsetWidth };
      !live || instant ? Object.assign(pill.style, { transform: `translateX(${v.x}px)`, width: v.width + 'px' }) : M.animate(pill, v, springSnappy);
    };
    const count = $('[data-filter-count]');
    btns.forEach((b) => b.addEventListener('click', () => {
      const f = b.dataset.filter;
      btns.forEach((x) => x.setAttribute('aria-pressed', x === b));
      place(b);
      const before = new Map(items.filter((i) => !i.hidden).map((i) => [i, i.getBoundingClientRect()]));
      items.forEach((i) => (i.hidden = !(f === 'all' || i.dataset.cat.split(' ').includes(f))));
      if (count) count.textContent = items.filter((i) => !i.hidden).length;
      if (!live) return;
      items.filter((i) => !i.hidden).forEach((i) => {
        const now = i.getBoundingClientRect();
        const old = before.get(i);
        if (old) M.animate(i, { x: [old.left - now.left, 0], y: [old.top - now.top, 0] }, { type: 'spring', stiffness: 300, damping: 32 });
        else M.animate(i, { opacity: [0, 1], scale: [0.9, 1] }, { type: 'spring', stiffness: 300, damping: 28 });
      });
    }));
    const first = btns.find((b) => b.getAttribute('aria-pressed') === 'true') || btns[0];
    requestAnimationFrame(() => place(first, true));
    addEventListener('resize', () => place(btns.find((b) => b.getAttribute('aria-pressed') === 'true') || first, true));
  });

  /* ---------- Carte qui s'agrandit en fenêtre (élément partagé, façon layoutId) ---------- */
  const modal = $('[data-modal]');
  if (modal) {
    const panel = $('[data-modal-panel]', modal);
    const mImg = $('[data-modal-img]', modal);
    const content = $('[data-modal-content]', modal);
    let srcImg = null, lastFocus = null, busy = false;
    // Une copie de l'image « vole » du rectangle de départ au rectangle d'arrivée.
    const fly = (fromEl, toEl, opts) => {
      const f = fromEl.getBoundingClientRect(), t = toEl.getBoundingClientRect();
      const c = document.createElement('img');
      c.src = mImg.src; c.alt = ''; c.className = 'mo-fly';
      Object.assign(c.style, { left: f.left + 'px', top: f.top + 'px', width: f.width + 'px', height: f.height + 'px', borderRadius: getComputedStyle(fromEl).borderRadius });
      document.body.append(c);
      fromEl.style.visibility = toEl.style.visibility = 'hidden';
      return M.animate(c, { left: t.left, top: t.top, width: t.width, height: t.height, borderRadius: getComputedStyle(toEl).borderRadius }, opts)
        .then(() => { c.remove(); fromEl.style.visibility = toEl.style.visibility = ''; });
    };
    const close = async () => {
      if (modal.hidden || busy) return;
      busy = true;
      if (live && srcImg) {
        M.animate(panel, { opacity: 0, y: 24 }, { duration: 0.3, delay: 0.05 });
        M.animate(modal, { backgroundColor: 'rgba(20,18,15,0)' }, { duration: 0.4 });
        await fly(mImg, srcImg, { duration: 0.45, ease });
      }
      modal.hidden = true;
      root.classList.remove('modal-open');
      busy = false;
      lastFocus?.focus();
    };
    $$('[data-expand]').forEach((card) => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        if (busy) return;
        lastFocus = document.activeElement;
        const tpl = $('template', card);
        content.innerHTML = tpl ? tpl.innerHTML : '';
        srcImg = $('img', card);
        mImg.src = srcImg.currentSrc || srcImg.src;
        mImg.alt = srcImg.alt;
        modal.hidden = false;
        modal.scrollTop = 0;
        root.classList.add('modal-open');
        $('[data-modal-close]', modal).focus({ preventScroll: true });
        if (!live) return;
        busy = true;
        M.animate(modal, { backgroundColor: ['rgba(20,18,15,0)', 'rgba(20,18,15,.72)'] }, { duration: 0.4 });
        M.animate(panel, { opacity: [0, 1], y: [24, 0] }, { duration: 0.4, ease });
        fly(srcImg, mImg, { type: 'spring', stiffness: 200, damping: 26 }).then(() => (busy = false));
      });
    });
    $$('[data-modal-close]', modal).forEach((b) => b.addEventListener('click', close));
    modal.addEventListener('click', (e) => e.target === modal && close());
    addEventListener('keydown', (e) => e.key === 'Escape' && close());
  }

  /* ---------- Formulaire en plusieurs étapes ---------- */
  $$('[data-steps]').forEach((form) => {
    const steps = $$('[data-step]', form);
    const bar = $('[data-steps-bar]', form);
    const label = $('[data-steps-label]', form);
    let i = 0;
    const show = (n, dir = 1) => {
      steps[i].hidden = true;
      i = n;
      steps[i].hidden = false;
      if (live) M.animate(steps[i], { opacity: [0, 1], x: [dir * 40, 0], filter: ['blur(6px)', 'blur(0px)'] }, { duration: 0.5, ease });
      const p = (i + 1) / steps.length;
      if (bar) live ? M.animate(bar, { scaleX: p }, springSoft) : (bar.style.transform = `scaleX(${p})`);
      if (label) label.textContent = `Étape ${i + 1} sur ${steps.length}`;
      $('input,select,textarea,button', steps[i])?.focus({ preventScroll: true });
    };
    steps.forEach((s, k) => (s.hidden = k !== 0));
    if (bar) bar.style.transform = `scaleX(${1 / steps.length})`;
    $$('[data-step-next]', form).forEach((b) => b.addEventListener('click', () => {
      const fields = $$('input,select,textarea', steps[i]);
      const bad = fields.find((f) => !f.checkValidity());
      if (bad) {
        bad.reportValidity();
        if (live) M.animate(steps[i], { x: [0, -10, 10, -6, 6, 0] }, { duration: 0.4 });
        return;
      }
      show(Math.min(steps.length - 1, i + 1), 1);
    }));
    $$('[data-step-prev]', form).forEach((b) => b.addEventListener('click', () => show(Math.max(0, i - 1), -1)));
  });

  /* ---------- Curseurs avec valeur affichée en direct ---------- */
  $$('input[type="range"][data-output]').forEach((r) => {
    const out = document.getElementById(r.dataset.output);
    const unit = r.dataset.unit || '';
    const upd = () => {
      out.textContent = (+r.value).toLocaleString('fr-FR') + unit;
      if (live) M.animate(out, { scale: [1.08, 1] }, springSnappy);
    };
    r.addEventListener('input', upd);
    upd();
  });

  /* ---------- Envoi des formulaires ---------- */
  $$('form[data-form]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) return form.reportValidity();
      const btn = $('[type="submit"]', form);
      const ok = $('[data-form-success]', form.parentElement);
      const err = $('[data-form-error]', form.parentElement);
      btn.disabled = true;
      btn.dataset.label = btn.dataset.label || btn.innerHTML;
      btn.textContent = 'Envoi…';
      try {
        if (form.getAttribute('action')) {
          const r = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
          if (!r.ok) throw new Error(r.status);
        } else {
          await new Promise((r) => setTimeout(r, 900)); // démo : envoi simulé
        }
        form.hidden = true;
        if (ok) {
          ok.hidden = false;
          if (live) M.animate(ok, { opacity: [0, 1], scale: [0.9, 1] }, springSoft);
          ok.focus?.();
        }
      } catch {
        if (err) err.hidden = false;
        btn.disabled = false;
        btn.innerHTML = btn.dataset.label;
      }
    });
  });

  /* ---------- Transition entre les pages (fondu + flou) ---------- */
  const page = $('[data-page]');
  if (page && live) {
    // Filtre retiré à la fin : un filtre résiduel casserait les éléments position:fixed.
    const clear = () => (page.style.filter = page.style.transform = '');
    M.animate(page, { opacity: [0, 1], filter: ['blur(8px)', 'blur(0px)'] }, { duration: 0.6, ease }).then(clear);
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname || !/\.html$|\/$/.test(url.pathname)) return;
      e.preventDefault();
      M.animate(page, { opacity: 0, filter: 'blur(8px)', y: -12 }, { duration: 0.35, ease }).then(() => (location.href = a.href));
    });
    addEventListener('pageshow', (e) => e.persisted && M.animate(page, { opacity: 1, filter: 'blur(0px)', y: 0 }, { duration: 0.3 }).then(clear));
  }
})();
