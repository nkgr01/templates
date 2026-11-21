/* =========================================================
   main.js — Interactions communes (Vanilla JS + GSAP + Lenis)
   Tout est piloté par des attributs data-* dans le HTML :
   data-header, data-menu-toggle, data-menu, data-curtain,
   data-split, data-reveal, data-stagger, data-parallax, data-flatten, data-scale-in,
   data-count, data-tilt, data-magnetic, data-tabs,
   data-filter-group, data-billing-toggle, data-hscroll,
   data-form, data-year, .cursor
   ========================================================= */
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';
  const hasST = hasGSAP && typeof window.ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (hasST) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis ? lenis.scrollTo(el, { offset: -90 }) : el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Header au scroll ---------- */
  const header = document.querySelector('[data-header]');
  if (header) {
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 24);
      header.classList.toggle('is-hidden', y > 400 && y > last && !document.body.classList.contains('menu-open'));
      last = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Menu mobile ---------- */
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  if (toggle && menu) {
    const setMenu = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      if (lenis) open ? lenis.stop() : lenis.start();
    };
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  }

  /* ---------- Rideau de transition entre pages ---------- */
  const curtain = document.querySelector('[data-curtain]');
  if (curtain && hasGSAP && !reduce) {
    curtain.classList.add('is-live');
    gsap.to(curtain, { yPercent: -100, duration: 1, ease: 'expo.inOut', delay: 0.05 });
    document.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || a.target === '_blank' || a.hasAttribute('download')) return;
      a.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        gsap.fromTo(curtain, { yPercent: 100 }, {
          yPercent: 0, duration: 0.65, ease: 'expo.in',
          onComplete: () => { window.location.href = a.href; },
        });
      });
    });
    window.addEventListener('pageshow', (e) => { if (e.persisted) gsap.set(curtain, { yPercent: -100 }); });
  } else if (curtain) {
    curtain.remove();
  }

  /* ---------- Découpage de titres en mots ---------- */
  const splitEl = (el) => {
    const frag = document.createDocumentFragment();
    const wrap = (node) => {
      const w = document.createElement('span');
      w.className = 'split-w';
      const i = document.createElement('span');
      i.className = 'split-i';
      i.appendChild(node);
      w.appendChild(i);
      return w;
    };
    [...el.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach((part, idx) => {
          if (!part) return;
          // Ponctuation collée à l'élément précédent (ex. </em>.) : on la garde dans le même mot
          const prev = frag.lastChild;
          if (idx === 0 && prev && prev.classList && prev.classList.contains('split-w') && !/^\s/.test(part)) {
            prev.firstChild.appendChild(document.createTextNode(part));
            return;
          }
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(' '));
          else frag.appendChild(wrap(document.createTextNode(part)));
        });
      } else if (node.nodeName === 'BR') {
        frag.appendChild(node.cloneNode());
      } else {
        frag.appendChild(wrap(node.cloneNode(true)));
      }
    });
    el.innerHTML = '';
    el.appendChild(frag);
  };
  document.querySelectorAll('[data-split]').forEach(splitEl);

  /* ---------- Animations au scroll ---------- */
  if (hasST && !reduce) {
    gsap.utils.toArray('[data-split]').forEach((el) => {
      gsap.from(el.querySelectorAll('.split-i'), {
        yPercent: 115, rotate: 4, duration: 1.2, ease: 'expo.out', stagger: 0.055,
        delay: parseFloat(el.dataset.delay || 0),
        scrollTrigger: { trigger: el, start: 'top 90%' },
      });
    });
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      gsap.from(el, {
        y: 48, autoAlpha: 0, duration: 1.1, ease: 'power3.out',
        delay: parseFloat(el.dataset.delay || 0),
        scrollTrigger: { trigger: el, start: 'top 90%' },
      });
    });
    gsap.utils.toArray('[data-stagger]').forEach((el) => {
      gsap.from(el.children, {
        y: 40, autoAlpha: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09,
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });
    gsap.utils.toArray('[data-parallax]').forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.2;
      gsap.to(el, {
        yPercent: -speed * 100, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
    gsap.utils.toArray('[data-scale-in]').forEach((el) => {
      gsap.fromTo(el, { clipPath: 'inset(12% 8% 12% 8% round 24px)' }, {
        clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 25%', scrub: true },
      });
    });

    gsap.utils.toArray('[data-flatten]').forEach((el) => {
      gsap.fromTo(el, { rotateX: 24, scale: 0.9, transformOrigin: '50% 0%' }, {
        rotateX: 0, scale: 1, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 25%', scrub: true },
      });
    });

    /* Scroll horizontal épinglé (desktop uniquement) */
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      gsap.utils.toArray('[data-hscroll]').forEach((wrap) => {
        const track = wrap.querySelector('[data-hscroll-track]');
        if (!track) return;
        const dist = () => track.scrollWidth - wrap.clientWidth;
        gsap.to(track, {
          x: () => -dist(), ease: 'none',
          scrollTrigger: { trigger: wrap, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true },
        });
      });
    });
  }

  /* ---------- Compteurs ---------- */
  document.querySelectorAll('[data-count]').forEach((el) => {
    const raw = el.dataset.count;
    const end = parseFloat(raw);
    const dec = (raw.split('.')[1] || '').length;
    const fmt = (v) => v.toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (!hasST || reduce) { el.textContent = fmt(end); return; }
    const o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 2.2, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(o.v); } }),
    });
  });

  /* ---------- Tilt 3D & boutons magnétiques ---------- */
  if (canHover && !reduce) {
    document.querySelectorAll('[data-tilt]').forEach((el) => {
      const max = parseFloat(el.dataset.tilt) || 8;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(1000px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)`;
        el.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`);
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const s = parseFloat(el.dataset.magnetic) || 0.3;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * s}px, ${(e.clientY - r.top - r.height / 2) * s}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    /* Curseur personnalisé (si un élément .cursor existe) */
    const cursor = document.querySelector('.cursor');
    if (cursor) {
      let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
      window.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; cursor.classList.add('is-visible'); });
      document.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
      document.querySelectorAll('a, button, [data-tilt]').forEach((el) => {
        el.addEventListener('pointerenter', () => cursor.classList.add('is-hover'));
        el.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
      });
      const loop = () => {
        cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
        cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
        requestAnimationFrame(loop);
      };
      loop();
    }
  } else {
    document.querySelector('.cursor')?.remove();
  }

  /* ---------- Onglets accessibles ---------- */
  document.querySelectorAll('[data-tabs]').forEach((wrap) => {
    const tabs = [...wrap.querySelectorAll('[role="tab"]')];
    const select = (tab) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (hasGSAP && !reduce) {
        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        gsap.from(panel, { y: 16, autoAlpha: 0, duration: 0.5, ease: 'power2.out' });
      }
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        const next = tabs[(i + d + tabs.length) % tabs.length];
        next.focus(); select(next);
      });
    });
  });

  /* ---------- Filtres (portfolio) ---------- */
  document.querySelectorAll('[data-filter-group]').forEach((group) => {
    const btns = group.querySelectorAll('[data-filter]');
    const items = document.querySelectorAll(group.dataset.filterGroup);
    btns.forEach((b) => b.addEventListener('click', () => {
      const f = b.dataset.filter;
      btns.forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
      items.forEach((it) => {
        const show = f === 'all' || (it.dataset.cat || '').split(' ').includes(f);
        it.hidden = !show;
        if (show && hasGSAP && !reduce) gsap.fromTo(it, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' });
      });
      if (hasST) ScrollTrigger.refresh();
    }));
  });

  /* ---------- Tarifs mensuel / annuel ---------- */
  const billing = document.querySelector('[data-billing-toggle]');
  if (billing) {
    billing.addEventListener('click', () => {
      const yearly = billing.getAttribute('aria-checked') !== 'true';
      billing.setAttribute('aria-checked', String(yearly));
      document.querySelectorAll('[data-monthly]').forEach((p) => {
        p.textContent = yearly ? p.dataset.yearly : p.dataset.monthly;
      });
      document.querySelectorAll('[data-billing-label]').forEach((l) => {
        l.textContent = yearly ? l.dataset.yearlyLabel : l.dataset.monthlyLabel;
      });
    });
  }

  /* ---------- Formulaires ----------
     Sans attribut action : simulation d'envoi (démo).
     Avec action (ex. https://formspree.io/f/xxxx) : envoi réel en fetch. */
  document.querySelectorAll('form[data-form]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const ok = form.querySelector('[data-form-success]');
      const err = form.querySelector('[data-form-error]');
      const btn = form.querySelector('[type="submit"]');
      btn && (btn.disabled = true);
      try {
        const action = form.getAttribute('action');
        if (action) {
          const res = await fetch(action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
          if (!res.ok) throw new Error('Envoi impossible');
        } else {
          await new Promise((r) => setTimeout(r, 700));
        }
        form.reset();
        if (ok) ok.hidden = false;
        if (err) err.hidden = true;
      } catch {
        if (err) err.hidden = false;
      } finally {
        btn && (btn.disabled = false);
      }
    });
  });

  /* ---------- Divers ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  window.addEventListener('load', () => { if (hasST) ScrollTrigger.refresh(); });
})();
