/* =========================================================
   Verdi — Dashboard financier (JavaScript vanilla, sans dépendance)
   Les données sont factices : remplacez les tableaux DATA par les
   réponses de votre API (même forme d'objets).
   ========================================================= */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  const pct = (n) => n.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' %';
  const signed = (n) => (n > 0 ? '+ ' : '− ') + eur.format(Math.abs(n));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  /* ---------- Données de démonstration ---------- */
  const DATA = {
    ranges: {
      '7d': {
        label: '7 j',
        points: [
          ['Lun', 'Lundi 5 janv. 2026', 1180, 360, 420], ['Mar', 'Mardi 6 janv. 2026', 1080, 260, 280],
          ['Mer', 'Mercredi 7 janv. 2026', 1400, 240, 460], ['Jeu', 'Jeudi 8 janv. 2026', 1560, 300, 380],
          ['Ven', 'Vendredi 9 janv. 2026', 1290, 420, 520], ['Sam', 'Samedi 10 janv. 2026', 1620, 210, 340],
          ['Dim', 'Dimanche 11 janv. 2026', 1940, 380, 610],
        ], active: 2,
      },
      '30d': {
        label: '30 j',
        points: [
          ['S1', 'Semaine du 15 déc.', 3900, 1100, 1700], ['S2', 'Semaine du 22 déc.', 3200, 600, 2600],
          ['S3', 'Semaine du 29 déc.', 3500, 900, 1900], ['S4', 'Semaine du 5 janv.', 4400, 1500, 1500],
          ['S5', 'Semaine du 12 janv.', 4100, 1300, 1600],
        ], active: 3,
      },
      '12m': {
        label: '12 m',
        points: [
          ['F', 'Février 2025', 13200, 2900, 6400], ['M', 'Mars 2025', 13800, 3300, 6100], ['A', 'Avril 2025', 13500, 3100, 6900],
          ['M', 'Mai 2025', 14100, 3600, 6000], ['J', 'Juin 2025', 13900, 2700, 7400], ['J', 'Juillet 2025', 14600, 2400, 8200],
          ['A', 'Août 2025', 12900, 1900, 7900], ['S', 'Septembre 2025', 14800, 3900, 6200], ['O', 'Octobre 2025', 14500, 3700, 6500],
          ['N', 'Novembre 2025', 14700, 3500, 6300], ['D', 'Décembre 2025', 15600, 2600, 8900], ['J', 'Janvier 2026', 15000, 3600, 6700],
        ], active: 11,
      },
    },
    costs: [
      { total: 8450, items: [['Logement', 18], ['Remboursements', 7], ['Alimentation', 6], ['Transports', 9], ['Santé', 10], ['Investissements', 17], ['Autres', 33]] },
      { total: 7920, items: [['Logement', 19], ['Remboursements', 8], ['Alimentation', 9], ['Transports', 7], ['Santé', 5], ['Investissements', 20], ['Autres', 32]] },
      { total: 9180, items: [['Logement', 17], ['Remboursements', 7], ['Alimentation', 8], ['Transports', 12], ['Santé', 8], ['Investissements', 15], ['Autres', 33]] },
    ],
    costColors: ['#F29A4A', '#F8B26A', '#F3EA4C', '#C7E07A', '#9DCB4F', '#6FA937', '#F1F1F0'],
    health: { 7: [3720, 9.2, 68], 30: [15780, 17.5, 75], 90: [44960, 12.8, 71] },
    goals: [
      { name: 'Réserve de sécurité', saved: 7000, target: 10000, left: 'Encore 4 mois', img: 'g-reserve.webp', months: 4 },
      { name: 'Voyage', saved: 2500, target: 4000, left: 'Encore 3 mois', img: 'g-travel.webp', months: 15 },
      { name: 'Voiture', saved: 1600, target: 20000, left: 'Encore 3 ans et 6 mois', img: 'g-car.webp', months: 42 },
      { name: 'Immobilier', saved: 8300, target: 70000, left: 'Encore 5 ans et 8 mois', img: 'g-house.webp', months: 68 },
    ],
    people: [['Davis', 'p-davis.webp'], ['Elli', 'p-elli.webp'], ['Léo', 'p-leo.webp'], ['Amanda', 'p-amanda.webp'], ['Anne', 'p-ann.webp'], ['Sinan', 'p-sin.webp']],
    tx: [
      { name: 'Versement de dividendes', date: '25 févr. 2026', amount: 1100, status: 'Terminé', logo: ['DV', '#5FA83A'] },
      { name: 'Abonnements logiciels', date: '25 févr. 2026', amount: -6400, status: 'Refusé', logo: ['AB', '#2F6FDB'] },
      { name: 'Investissement ETF', date: '21 févr. 2026', amount: -900, status: 'Terminé', logo: ['V', '#5B1A3A'] },
      { name: 'Prestation de conseil', date: '21 févr. 2026', amount: -2100, status: 'Terminé', logo: ['CX', '#161616'] },
      { name: 'Achat de matériel', date: '20 févr. 2026', amount: -1700, status: 'Terminé', logo: ['MT', '#1D1D1D'] },
      { name: 'Elli Harper', date: '15 févr. 2026', amount: 600, status: 'Terminé', img: 'p-elli.webp' },
      { name: 'Davis Rowen', date: '15 févr. 2026', amount: 800, status: 'Terminé', img: 'p-davis.webp' },
    ],
  };
  const state = { balance: 12450, spent: 8600, limit: 10000, range: '7d', chart: 'bars', txFilter: 'all', sort: null, query: '' };

  /* ---------- Utilitaires ---------- */
  function countTo(el, to, { from = 0, dur = 1100, fmt = eur.format } = {}) {
    if (reduce) { el.textContent = fmt(to); return; }
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      el.textContent = fmt(Math.round(from + (to - from) * easeOut(t)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    toastEl.querySelector('span').textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 3200);
  }
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-toast]');
    if (t) { e.preventDefault(); toast(t.dataset.toast); }
  });

  /* ---------- Menu latéral ---------- */
  const app = $('#app');
  $('[data-collapse]').addEventListener('click', () => {
    const c = app.classList.toggle('is-collapsed');
    $('[data-collapse]').setAttribute('aria-label', c ? 'Déplier le menu' : 'Réduire le menu');
  });
  const subBtn = $('[data-sub-toggle]');
  subBtn.addEventListener('click', () => {
    if (app.classList.contains('is-collapsed')) app.classList.remove('is-collapsed');
    const open = subBtn.getAttribute('aria-expanded') !== 'true';
    subBtn.setAttribute('aria-expanded', open);
    $('#sub-tx').classList.toggle('is-closed', !open);
  });
  const closeMenu = () => app.classList.remove('menu-open');
  $('[data-menu-open]').addEventListener('click', () => app.classList.add('menu-open'));
  $('[data-menu-close]').addEventListener('click', closeMenu);
  $$('[data-nav]').forEach((a) => a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (href === '#') {
      e.preventDefault();
      if (!a.classList.contains('nav-item') || a.classList.contains('is-active')) return;
      toast(`« ${a.textContent.trim()} » : écran à ajouter sur le même modèle.`);
    }
    closeMenu();
  }));
  $('[data-upgrade-close]').addEventListener('click', () => {
    const u = $('#upgrade');
    u.style.opacity = '0'; u.style.transform = 'translateY(8px)';
    setTimeout(() => (u.hidden = true), 300);
  });

  /* ---------- Menus déroulants ---------- */
  const ddHandlers = {};
  $$('[data-dd]').forEach((dd) => {
    const btn = dd.querySelector('button');
    const close = () => { dd.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !dd.classList.contains('is-open');
      $$('[data-dd].is-open').forEach((o) => o.classList.remove('is-open'));
      dd.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open);
      if (open) dd.querySelector('[aria-checked="true"]')?.focus();
    });
    dd.querySelectorAll('[data-value]').forEach((opt) => opt.addEventListener('click', () => {
      dd.querySelectorAll('[data-value]').forEach((o) => o.setAttribute('aria-checked', o === opt));
      ddHandlers[dd.dataset.dd]?.(opt.dataset.value, dd.querySelector('[data-dd-label]'), opt);
      close(); btn.focus();
    }));
    dd.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { close(); btn.focus(); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const opts = [...dd.querySelectorAll('[data-value]')];
        const i = opts.indexOf(document.activeElement);
        if (i < 0) return;
        e.preventDefault();
        opts[(i + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length].focus();
      }
    });
  });
  document.addEventListener('click', () => $$('[data-dd].is-open').forEach((o) => { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); }));

  /* ---------- Graphique : barres empilées / courbes ---------- */
  const chartEl = $('#chart');
  let active = null, pinned = null;

  function niceScale(points) {
    const top = Math.max(...points.map((p) => p[2] + p[3]));
    const bottom = Math.max(...points.map((p) => p[4]));
    const raw = top / 3;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw);
    const max = Math.ceil(top / step) * step;
    const min = -Math.ceil(bottom / step) * step;
    return { min, max, step };
  }
  const shortK = (v) => (v === 0 ? '0' : (v < 0 ? '−' : '') + (Math.abs(v) >= 1000 ? (Math.abs(v) / 1000).toLocaleString('fr-FR') + 'k' : Math.abs(v)));

  function renderChart(animate = true) {
    const { points, active: def } = DATA.ranges[state.range];
    const sc = niceScale(points);
    const H = chartEl.clientHeight - 26;
    const y = (v) => ((sc.max - v) / (sc.max - sc.min)) * H; // px depuis le haut
    pinned = def;

    let html = '<div class="grid" aria-hidden="true">';
    for (let v = sc.max; v >= sc.min; v -= sc.step) html += `<div class="gl${v === 0 ? ' zero' : ''}" style="top:${y(v)}px"><span>${shortK(v)}</span></div>`;
    html += '</div>';

    if (state.chart === 'bars') {
      html += '<div class="bars">';
      points.forEach((p, i) => {
        const [lab, full, inc, sav, exp] = p;
        const z = y(0), gap = 3;
        html += `<div class="bar" tabindex="0" role="button" data-i="${i}" aria-label="${full} : revenus ${eur.format(inc)}, épargne ${eur.format(sav)}, dépenses ${eur.format(exp)}">
          <div class="stack" style="top:0;bottom:0">
            <i class="pc cap" data-t="${y(inc + sav) - 12}" data-h="7"></i>
            <i class="pc sav" data-t="${y(inc + sav)}" data-h="${y(inc) - y(inc + sav) - gap}"></i>
            <i class="pc inc" data-t="${y(inc)}" data-h="${z - y(inc)}"></i>
            <i class="pc exp" data-t="${z + gap}" data-h="${y(-exp) - z - gap}"></i>
          </div>
          <span class="xl">${lab}</span></div>`;
      });
      html += '</div><div class="tip" id="tip" style="opacity:0"></div>';
      chartEl.innerHTML = html;
      const z = y(0);
      $$('.pc', chartEl).forEach((pc) => {
        const t = +pc.dataset.t, h = Math.max(0, +pc.dataset.h);
        const finalCss = `top:${t}px;height:${h}px`;
        if (animate && !reduce) {
          const below = pc.classList.contains('exp');
          pc.style.cssText = below ? `top:${z + 3}px;height:0` : `top:${z}px;height:0`;
          requestAnimationFrame(() => requestAnimationFrame(() => (pc.style.cssText = finalCss)));
        } else pc.style.cssText = finalCss;
      });
      $$('.bar', chartEl).forEach((b) => {
        const i = +b.dataset.i;
        b.addEventListener('mouseenter', () => setActive(i));
        b.addEventListener('focus', () => setActive(i));
        b.addEventListener('click', () => { pinned = i; setActive(i); });
        b.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const n = $$('.bar', chartEl)[(i + (e.key === 'ArrowRight' ? 1 : -1) + points.length) % points.length];
            n.focus(); pinned = +n.dataset.i;
          }
        });
      });
      $('.bars', chartEl).addEventListener('mouseleave', () => setActive(pinned));
      setActive(def, true);
    } else {
      const W = chartEl.clientWidth - 40;
      const band = W / points.length;
      const x = (i) => band * i + band / 2;
      const path = (k, sign = 1) => points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(sign * p[k]).toFixed(1)}`).join('');
      const series = [[2, '#9DCB4F', 1], [3, '#E5D82E', 1], [4, '#F29A4A', -1]];
      html += `<svg class="line-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9DCB4F" stop-opacity=".25"/><stop offset="1" stop-color="#9DCB4F" stop-opacity="0"/></linearGradient></defs>
        <path class="area" d="${path(2)}L${x(points.length - 1)},${y(0)}L${x(0)},${y(0)}Z" fill="url(#ga)"/>
        <line class="cross" id="cross" y1="0" y2="${H}" x1="-10" x2="-10"/>
        ${series.map(([k, c, s]) => `<path d="${path(k, s)}" stroke="${c}" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:${animate && !reduce ? 1 : 0};transition:stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)"/>`).join('')}
        ${series.map(([k, c], j) => `<circle r="4.5" fill="${c}" data-dot="${j}" cx="-20" cy="-20"/>`).join('')}
      </svg>
      <div class="bars" style="z-index:2">${points.map((p, i) => `<div class="bar" tabindex="0" role="button" data-i="${i}" aria-label="${p[1]} : revenus ${eur.format(p[2])}, épargne ${eur.format(p[3])}, dépenses ${eur.format(p[4])}"><span class="xl">${p[0]}</span></div>`).join('')}</div>
      <div class="tip" id="tip" style="opacity:0"></div>`;
      chartEl.innerHTML = html;
      requestAnimationFrame(() => requestAnimationFrame(() => $$('.line-svg path[pathLength]', chartEl).forEach((p) => (p.style.strokeDashoffset = 0))));
      const move = (i) => {
        const cx = x(i);
        $('#cross').setAttribute('x1', cx); $('#cross').setAttribute('x2', cx);
        series.forEach(([k, , s], j) => { const d = $(`[data-dot="${j}"]`, chartEl); d.setAttribute('cx', cx); d.setAttribute('cy', y(s * points[i][k])); });
        $$('.bar', chartEl).forEach((b) => b.classList.toggle('is-active', +b.dataset.i === i));
        showTip(i, 40 + cx, y(points[i][2] + 0) - 10);
      };
      $$('.bar', chartEl).forEach((b) => {
        const i = +b.dataset.i;
        b.addEventListener('mouseenter', () => move(i));
        b.addEventListener('focus', () => move(i));
        b.addEventListener('click', () => { pinned = i; move(i); });
      });
      $('.bars', chartEl).addEventListener('mouseleave', () => move(pinned));
      move(def);
    }

    function setActive(i, first) {
      active = i;
      $$('.bar', chartEl).forEach((b) => b.classList.toggle('is-active', +b.dataset.i === i));
      const bar = $$('.bar', chartEl)[i];
      const stackTop = +bar.querySelector('.pc.sav').dataset.t;
      const cx = 40 + bar.offsetLeft + bar.offsetWidth / 2;
      showTip(i, cx + bar.offsetWidth * 0.36, stackTop, first);
    }

    function showTip(i, px, py) {
      const tip = $('#tip');
      const p = points[i];
      tip.innerHTML = `<time>${p[1]}</time>
        <div><i class="sw s-sav"></i>Épargne<b>${eur.format(p[3])}</b></div>
        <div><i class="sw s-inc"></i>Revenus<b>${eur.format(p[2])}</b></div>
        <div><i class="sw s-exp"></i>Dépenses<b>${eur.format(p[4])}</b></div>`;
      const tw = tip.offsetWidth || 160, cw = chartEl.clientWidth;
      let left = px + 6;
      if (left + tw > cw) left = px - tw - 6 - (state.chart === 'bars' ? $$('.bar', chartEl)[i].offsetWidth * 0.72 : 12);
      tip.style.left = Math.max(0, left) + 'px';
      tip.style.top = Math.max(0, py - 6) + 'px';
      tip.style.opacity = 1;
    }
  }

  ddHandlers.range = (v, label) => { state.range = v; label.textContent = DATA.ranges[v].label; renderChart(); };
  $$('[data-chart-type]').forEach((b) => b.addEventListener('click', () => {
    state.chart = b.dataset.chartType;
    $$('[data-chart-type]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    renderChart();
  }));
  let rw = 0;
  new ResizeObserver(() => { if (chartEl.clientWidth !== rw) { rw = chartEl.clientWidth; renderChart(false); } }).observe(chartEl);

  /* ---------- Plafond mensuel ---------- */
  function renderLimit() {
    const r = Math.min(1, state.spent / state.limit);
    $('#limit-fill').style.width = `calc(${(r * 100).toFixed(1)}% - 3px)`;
    $('#limit-fill').style.background = r > 0.9 ? 'var(--orange) var(--stripes)' : '';
    $('#limit-spent').textContent = eur.format(state.spent);
    $('#limit-max').textContent = eur.format(state.limit);
  }
  $('[data-limit-edit]').addEventListener('click', () => {
    const max = $('#limit-max');
    if (max.querySelector('input')) return;
    max.innerHTML = `<span class="limit-edit"><input type="number" min="500" step="100" value="${state.limit}" aria-label="Nouveau plafond en euros"> €</span>`;
    const inp = max.querySelector('input');
    inp.focus(); inp.select();
    const save = () => {
      const v = Math.round(+inp.value);
      if (v >= 500) { state.limit = v; toast(`Plafond mis à jour : ${eur.format(v)} par mois.`); }
      renderLimit();
    };
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') inp.blur(); if (e.key === 'Escape') { inp.value = state.limit; inp.blur(); } });
    inp.addEventListener('blur', save, { once: true });
  });

  /* ---------- Analyse des coûts ---------- */
  function renderCosts(m = 0, from = 0) {
    const d = DATA.costs[m];
    countTo($('#cost-total'), d.total, { from, dur: 800 }); costTotal = d.total;
    $('#cost-bar').innerHTML = d.items.map(([n, p], i) => `<i style="flex:${reduce ? p : 0.001} 1 0;background-color:${DATA.costColors[i]}" title="${n} : ${p} %" data-p="${p}"></i>`).join('');
    if (!reduce) requestAnimationFrame(() => requestAnimationFrame(() => $$('#cost-bar i').forEach((s) => (s.style.flexGrow = s.dataset.p))));
    $('#cost-list').innerHTML = d.items.map(([n, p], i) => `<li><i class="sw" style="background:${DATA.costColors[i]}${i === 6 ? ';box-shadow:inset 0 0 0 1px #E2E2E0' : ''}"></i>${n}<b>${p} %</b></li>`).join('');
  }
  let costTotal = 0;
  ddHandlers.month = (v, label, opt) => { label.textContent = opt.textContent; renderCosts(+v, costTotal); };

  /* ---------- Jauge de santé financière ---------- */
  const gauge = $('#gauge');
  const CX = 150, CY = 150, R1 = 140, R0 = 96, SEG = 5, GAP = 3;
  const polar = (r, deg) => { const a = (deg * Math.PI) / 180; return [CX + r * Math.cos(a), CY - r * Math.sin(a)]; };
  const arc = (a0, a1) => { // a0 > a1 (degrés, 180 = gauche)
    const [x0, y0] = polar(R1, a0), [x1, y1] = polar(R1, a1), [x2, y2] = polar(R0, a1), [x3, y3] = polar(R0, a0);
    const large = a0 - a1 > 180 ? 1 : 0;
    return `M${x0},${y0}A${R1},${R1} 0 ${large} 1 ${x1},${y1}L${x2},${y2}A${R0},${R0} 0 ${large} 0 ${x3},${y3}Z`;
  };
  gauge.innerHTML = `<defs>
      <linearGradient id="gg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E9EC63"/><stop offset=".45" stop-color="#B9DB5E"/><stop offset="1" stop-color="#6FA937"/></linearGradient>
      <pattern id="gs" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="2" height="7" fill="rgba(255,255,255,.25)"/></pattern>
    </defs><g id="g-bg"></g><g id="g-fg"></g>`;
  const segSpan = 180 / SEG;
  $('#g-bg').innerHTML = Array.from({ length: SEG }, (_, i) => `<path d="${arc(180 - i * segSpan - (i ? GAP / 2 : 0), 180 - (i + 1) * segSpan + (i < SEG - 1 ? GAP / 2 : 0))}" fill="#F1F1F0"/>`).join('');
  function drawGauge(v) {
    const end = 180 - (v / 100) * 180;
    let d = '';
    for (let i = 0; i < SEG; i++) {
      const a0 = 180 - i * segSpan - (i ? GAP / 2 : 0);
      const a1 = Math.max(180 - (i + 1) * segSpan + (i < SEG - 1 ? GAP / 2 : 0), end);
      if (a1 < a0) d += arc(a0, a1);
    }
    $('#g-fg').innerHTML = `<path d="${d}" fill="url(#gg)"/><path d="${d}" fill="url(#gs)"/>`;
    $('#gauge-val').textContent = Math.round(v) + ' %';
  }
  let gaugeVal = 0;
  function animateGauge(to) {
    const from = gaugeVal; gaugeVal = to;
    gauge.setAttribute('aria-label', `${to} % du revenu mensuel épargné`);
    if (reduce) return drawGauge(to);
    const t0 = performance.now();
    const step = (now) => { const t = Math.min(1, (now - t0) / 1300); drawGauge(from + (to - from) * easeOut(t)); if (t < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  let healthTotal = 0;
  function renderHealth(days) {
    const [total, trend, ratio] = DATA.health[days];
    countTo($('#health-total'), total, { from: healthTotal }); healthTotal = total;
    $('#health-trend').textContent = pct(trend);
    $('#health-note').textContent = `Calculé à partir de vos transactions des ${days} derniers jours.`;
    animateGauge(ratio);
  }
  ddHandlers.health = (v, label) => { label.textContent = v + ' j'; renderHealth(+v); };

  /* ---------- Objectifs ---------- */
  function renderGoals() {
    const year = DATA.goals.filter((g) => g.months <= 12), long = DATA.goals.filter((g) => g.months > 12);
    const row = (g) => {
      const r = Math.min(1, g.saved / g.target);
      const color = r >= 0.5 ? 'var(--green)' : 'var(--orange)';
      const visual = g.img
        ? `<img src="assets/img/${g.img}" alt="" width="50" height="50" loading="lazy">`
        : `<span style="display:grid;place-items:center;width:50px;height:50px;border-radius:10px;background:#F4F7EC;color:var(--green-3);font-weight:600">${g.name.slice(0, 2).toUpperCase()}</span>`;
      return `<div class="goal">${visual}<div>
        <div class="top"><span>${g.name}</span><span>${eur.format(g.saved)} / <em>${eur.format(g.target)}</em></span></div>
        <div class="track" role="progressbar" aria-label="${g.name}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(r * 100)}"><i style="background-color:${color}" data-w="${(r * 100).toFixed(1)}"></i></div>
        <small>${g.left}</small></div></div>`;
    };
    $('#goals').innerHTML =
      (year.length ? `<div class="goal-group">Cette année</div>${year.map(row).join('')}` : '') +
      (long.length ? `<div class="goal-group">Long terme</div>${long.map(row).join('')}` : '');
    requestAnimationFrame(() => requestAnimationFrame(() => $$('#goals .track i').forEach((i) => (i.style.width = Math.max(4, +i.dataset.w) + '%'))));
  }
  const monthsLabel = (m) => { const y = Math.floor(m / 12), r = m % 12; return 'Encore ' + [y ? `${y} an${y > 1 ? 's' : ''}` : '', r ? `${r} mois` : ''].filter(Boolean).join(' et '); };

  /* ---------- Cartes ---------- */
  const track = $('#cards-track');
  function goCard(i) {
    const card = $$('.pay-card', track)[i];
    track.style.transform = `translateX(${-card.offsetLeft}px)`;
    $$('.pay-card', track).forEach((c, j) => c.classList.toggle('is-current', j === i));
    $$('[data-card-dot]').forEach((d, j) => d.setAttribute('aria-current', j === i));
  }
  $$('.pay-card', track).forEach((c, i) => c.addEventListener('click', () => (c.classList.contains('is-current') ? toast(`${c.querySelector('.row span').textContent} sélectionnée.`) : goCard(i))));
  $$('[data-card-dot]').forEach((d, i) => d.addEventListener('click', () => goCard(i)));
  let sx = null;
  track.addEventListener('pointerdown', (e) => (sx = e.clientX));
  track.addEventListener('pointerup', (e) => {
    if (sx === null) return;
    const dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 40) goCard(dx < 0 ? 1 : 0);
  });

  /* ---------- Paiement rapide ---------- */
  $('#people').innerHTML = DATA.people.map(([n, img]) => `<button class="person" type="button" data-pay="${n}"><img src="assets/img/${img}" alt="" width="50" height="50"><span>${n}</span></button>`).join('');
  $('#pay-to').innerHTML = DATA.people.map(([n]) => `<option>${n}</option>`).join('');
  $$('[data-pay]').forEach((b) => b.addEventListener('click', () => openModal('pay-modal', b, b.dataset.pay)));

  /* ---------- Historique des transactions ---------- */
  function renderTx() {
    let list = DATA.tx.filter((t) => state.txFilter === 'all' || (state.txFilter === 'in' ? t.amount > 0 : t.amount < 0));
    if (state.query) list = list.filter((t) => t.name.toLowerCase().includes(state.query));
    if (state.sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    if (state.sort === 'amount') list = [...list].sort((a, b) => b.amount - a.amount);
    $('#tx-list').innerHTML = list.length
      ? list.map((t, i) => `<li class="tx" style="animation-delay:${i * 40}ms">
          <span class="logo" style="background:${t.logo ? t.logo[1] : '#eee'}">${t.img ? `<img src="assets/img/${t.img}" alt="" width="34" height="34">` : t.logo[0]}</span>
          <span style="min-width:0"><b>${t.name}</b><small>${t.date}</small></span>
          <span class="amt">${signed(t.amount)}<small class="${t.status === 'Refusé' ? 'declined' : ''}">${t.status}</small></span></li>`).join('')
      : `<li class="tx-empty">Aucune transaction pour « ${state.query} »</li>`;
  }
  ddHandlers.tx = (v, label, opt) => { state.txFilter = v; label.textContent = opt.textContent; renderTx(); };
  $$('[data-sort]').forEach((b) => b.addEventListener('click', () => {
    state.sort = state.sort === b.dataset.sort ? null : b.dataset.sort;
    $$('[data-sort]').forEach((x) => x.setAttribute('aria-pressed', x.dataset.sort === state.sort));
    renderTx();
  }));
  const search = $('#search');
  search.addEventListener('input', () => {
    state.query = search.value.trim().toLowerCase();
    renderTx();
  });
  search.addEventListener('keydown', (e) => { if (e.key === 'Enter' && state.query) $('#tx-card').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); });
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); search.focus(); }
  });

  /* ---------- Modales ---------- */
  let lastFocus = null;
  function openModal(id, opener, payee) {
    const m = $('#' + id);
    lastFocus = opener || document.activeElement;
    if (id === 'pay-modal') {
      const p = DATA.people.find(([n]) => n === payee);
      $('#payee').hidden = !p;
      if (p) { $('#payee').innerHTML = `<img src="assets/img/${p[1]}" alt="" width="48" height="48"><div><b style="font-weight:500">${p[0]}</b><div class="card-sub">Contact favori</div></div>`; $('#pay-to').value = p[0]; }
    }
    m.classList.add('is-open');
    setTimeout(() => m.querySelector(id === 'pay-modal' && payee ? 'input[name=amount]' : 'input, select')?.focus(), 60);
  }
  function closeModal(m) { m.classList.remove('is-open'); m.querySelector('form').reset(); lastFocus?.focus(); }
  $$('[data-modal-open]').forEach((b) => b.addEventListener('click', () => openModal(b.dataset.modalOpen, b)));
  $$('.modal').forEach((m) => {
    m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('[data-modal-close]')) closeModal(m); });
    m.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal(m);
      if (e.key === 'Tab') { // piège de focus
        const f = $$('input, select, button', m).filter((x) => !x.disabled && x.offsetParent);
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
        else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
      }
    });
  });

  $('[data-pay-form]').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const amount = Math.round(+f.get('amount'));
    if (!(amount > 0)) return;
    const to = f.get('to');
    const person = DATA.people.find(([n]) => n === to);
    DATA.tx.unshift({ name: `Virement à ${to}`, date: "Aujourd'hui", amount: -amount, status: 'Terminé', img: person?.[1] });
    const from = state.balance;
    state.balance -= amount; state.spent += amount;
    countTo($('#ov-title'), state.balance, { from, dur: 700 });
    renderTx(); renderLimit();
    closeModal($('#pay-modal'));
    toast(`${eur.format(amount)} envoyés à ${to}.`);
  });
  $('[data-goal-form]').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const months = +f.get('months');
    DATA.goals.push({ name: f.get('name').trim(), saved: Math.max(0, +f.get('saved') || 0), target: +f.get('target'), months, left: monthsLabel(months) });
    renderGoals();
    closeModal($('#goal-modal'));
    toast('Objectif créé. On vous préviendra à chaque palier.');
  });

  /* ---------- Démarrage ---------- */
  $$('[data-count]').forEach((el) => countTo(el, +el.dataset.count, { dur: 1300 }));
  requestAnimationFrame(() => requestAnimationFrame(renderLimit));
  renderCosts(0);
  renderHealth(30);
  renderGoals();
  renderTx();
  // (le graphique est dessiné par le ResizeObserver dès que sa taille est connue)
})();
