/* =========================================================
   Mini-graphiques SVG faits main (aucune dépendance)
   Charts.area · Charts.bars · Charts.donut · Charts.spark
   Les couleurs acceptent des variables CSS : 'var(--accent)'
   ========================================================= */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const nf = new Intl.NumberFormat('fr-FR');
  const fmtNum = (n) => nf.format(Math.round(n)).replace(/[  ]/g, ' ');
  const compact = (n) => {
    const a = Math.abs(n);
    if (a >= 1e9) return (n / 1e9).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' Md';
    if (a >= 1e6) return (n / 1e6).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' M';
    if (a >= 1e3) return (n / 1e3).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' k';
    return fmtNum(n);
  };
  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const niceMax = (v) => {
    if (v <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const m = v / p;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p;
  };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let uid = 0;

  function tooltip(host) {
    let t = host.querySelector(':scope > .ch-tip');
    if (!t) { t = document.createElement('div'); t.className = 'ch-tip'; t.setAttribute('role', 'status'); host.appendChild(t); }
    return {
      show(html, x, y) {
        t.innerHTML = html; t.classList.add('is-on');
        const w = t.offsetWidth, hw = host.clientWidth;
        t.style.left = Math.max(0, Math.min(hw - w, x - w / 2)) + 'px';
        t.style.top = Math.max(0, y - t.offsetHeight - 12) + 'px';
      },
      hide() { t.classList.remove('is-on'); },
    };
  }

  // Redessine à chaque changement de largeur
  function responsive(host, draw) {
    host.classList.add('ch');
    let last = 0;
    const run = () => { const w = host.clientWidth; if (w && w !== last) { last = w; draw(w); } };
    host._redraw = () => { last = 0; run(); };
    if (host._ro) host._ro.disconnect();
    host._ro = new ResizeObserver(run); host._ro.observe(host);
    run();
  }

  function axes(svg, { w, h, pad, max, ticks = 4, labels, fmt, step }) {
    const mant = +(max / Math.pow(10, Math.floor(Math.log10(max)))).toFixed(2);
    ticks = mant === 2.5 || mant === 5 ? 5 : 4;
    const g = el('g', { class: 'ch-axis' }, svg);
    for (let i = 0; i <= ticks; i++) {
      const v = (max / ticks) * i, y = pad.t + (h - pad.t - pad.b) * (1 - i / ticks);
      el('line', { x1: pad.l, x2: w - pad.r, y1: y, y2: y, class: 'ch-grid' }, g);
      const t = el('text', { x: pad.l - 10, y: y + 4, 'text-anchor': 'end' }, g); t.textContent = fmt(v);
    }
    const every = Math.ceil(labels.length / Math.max(1, Math.floor((w - pad.l - pad.r) / 58)));
    labels.forEach((lb, i) => {
      if (i % every) return;
      const t = el('text', { x: step(i), y: h - 8, 'text-anchor': 'middle' }, g); t.textContent = lb;
    });
  }

  /* ---------- Courbes / aires ---------- */
  function area(host, o) {
    const fmt = o.format || compact, tipFmt = o.tipFormat || fmtNum;
    const H = o.height || 260;
    responsive(host, (w) => {
      host.querySelectorAll('svg').forEach((s) => s.remove());
      const pad = { t: 16, r: 12, b: 30, l: o.yWidth || 52 };
      const all = o.series.flatMap((s) => s.values);
      const max = niceMax(Math.max(...all) * 1.08);
      const n = o.labels.length;
      const x = (i) => pad.l + ((w - pad.l - pad.r) * i) / Math.max(1, n - 1);
      const y = (v) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
      const svg = el('svg', { viewBox: `0 0 ${w} ${H}`, width: w, height: H, role: 'img', 'aria-label': o.label || 'Graphique' });
      axes(svg, { w, h: H, pad, max, labels: o.labels, fmt, step: x });
      const defs = el('defs', {}, svg);
      o.series.forEach((s, si) => {
        const id = 'g' + ++uid;
        const gr = el('linearGradient', { id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
        el('stop', { offset: '0%', 'stop-color': s.color, 'stop-opacity': s.fill === false ? 0 : (o.fillOpacity ?? 0.28) }, gr);
        el('stop', { offset: '100%', 'stop-color': s.color, 'stop-opacity': 0 }, gr);
        // les valeurs null sont ignorées (ex. série réelle suivie d'une prévision)
        const idx = s.values.map((v, i) => (v == null ? -1 : i)).filter((i) => i >= 0);
        if (!idx.length) return;
        const pts = idx.map((i) => [x(i), y(s.values[i])]);
        // courbe lissée (Catmull-Rom → Bézier)
        let d = `M${pts[0][0]},${pts[0][1]}`;
        for (let i = 0; i < pts.length - 1; i++) {
          const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
          const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
          const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
          d += ` C${c1[0]},${Math.min(y(0), c1[1])} ${c2[0]},${Math.min(y(0), c2[1])} ${p2[0]},${p2[1]}`;
        }
        el('path', { d: `${d} L${x(idx[idx.length - 1])},${y(0)} L${x(idx[0])},${y(0)} Z`, fill: `url(#${id})`, class: 'ch-fill' }, svg);
        const line = el('path', { d, fill: 'none', stroke: s.color, 'stroke-width': s.width || 2.5, 'stroke-linecap': 'round', 'stroke-dasharray': s.dash || '', class: s.dash ? '' : 'ch-line' }, svg);
        if (!reduce && !s.dash) { const L = line.getTotalLength(); line.style.strokeDasharray = L; line.style.strokeDashoffset = L; requestAnimationFrame(() => { line.style.transition = `stroke-dashoffset 1.1s ${si * 0.12}s cubic-bezier(.3,.7,.2,1)`; line.style.strokeDashoffset = 0; }); }
      });
      const guide = el('line', { y1: pad.t, y2: H - pad.b, class: 'ch-guide' }, svg);
      const dots = o.series.map((s) => el('circle', { r: 5, fill: 'var(--ch-bg, #fff)', stroke: s.color, 'stroke-width': 2.5, class: 'ch-dot' }, svg));
      host.appendChild(svg);
      const tip = tooltip(host);
      const move = (ev) => {
        const r = svg.getBoundingClientRect();
        const px = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left;
        const i = Math.max(0, Math.min(n - 1, Math.round(((px - pad.l) / (w - pad.l - pad.r)) * (n - 1))));
        guide.setAttribute('x1', x(i)); guide.setAttribute('x2', x(i)); svg.classList.add('is-hover');
        o.series.forEach((s, si) => { const v = s.values[i]; dots[si].style.display = v == null ? 'none' : ''; if (v != null) { dots[si].setAttribute('cx', x(i)); dots[si].setAttribute('cy', y(v)); } });
        const vis = o.series.filter((s) => s.values[i] != null);
        tip.show(`<b>${o.tipLabels ? o.tipLabels[i] : o.labels[i]}</b>` + vis.map((s) => `<span><i style="background:${s.color}"></i>${s.name} <strong>${tipFmt(s.values[i])}</strong></span>`).join(''), x(i), Math.min(...vis.map((s) => y(s.values[i]))));
      };
      svg.addEventListener('pointermove', move);
      svg.addEventListener('pointerleave', () => { svg.classList.remove('is-hover'); tip.hide(); });
    });
  }

  /* ---------- Barres (groupées ou empilées) ---------- */
  function bars(host, o) {
    const fmt = o.format || compact, tipFmt = o.tipFormat || fmtNum;
    const H = o.height || 260;
    responsive(host, (w) => {
      host.querySelectorAll('svg').forEach((s) => s.remove());
      const pad = { t: 16, r: 8, b: 30, l: o.yWidth || 52 };
      const n = o.labels.length;
      const totals = o.labels.map((_, i) => o.stacked ? o.series.reduce((a, s) => a + s.values[i], 0) : Math.max(...o.series.map((s) => s.values[i])));
      const max = niceMax(Math.max(...totals) * 1.08);
      const slot = (w - pad.l - pad.r) / n;
      const cx = (i) => pad.l + slot * i + slot / 2;
      const y = (v) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
      const svg = el('svg', { viewBox: `0 0 ${w} ${H}`, width: w, height: H, role: 'img', 'aria-label': o.label || 'Graphique en barres' });
      axes(svg, { w, h: H, pad, max, labels: o.labels, fmt, step: cx });
      const bw = Math.min(o.barWidth || 28, slot * (o.stacked ? 0.56 : 0.72) / (o.stacked ? 1 : o.series.length));
      const r = Math.min(o.radius ?? 6, bw / 2);
      const groups = [];
      o.labels.forEach((_, i) => {
        const g = el('g', { class: 'ch-bar' + (o.highlight === i ? ' is-hl' : '') }, svg); groups.push(g);
        let acc = 0;
        o.series.forEach((s, si) => {
          const v = s.values[i];
          const x0 = o.stacked ? cx(i) - bw / 2 : cx(i) - (bw * o.series.length + 3 * (o.series.length - 1)) / 2 + si * (bw + 3);
          const y1 = y(acc + v), y0 = y(acc);
          const hh = Math.max(0, y0 - y1 - (o.stacked && si ? 2 : 0));
          const rect = el('rect', { x: x0, y: y1, width: bw, height: hh, rx: r, fill: s.colors ? s.colors[i] : s.color }, g);
          if (!reduce) { rect.style.transformOrigin = `0 ${y(0)}px`; rect.style.transform = 'scaleY(0)'; requestAnimationFrame(() => { rect.style.transition = `transform .8s ${i * 0.03}s cubic-bezier(.3,.8,.2,1)`; rect.style.transform = 'scaleY(1)'; }); }
          if (o.stacked) acc += v;
        });
      });
      host.appendChild(svg);
      const tip = tooltip(host);
      svg.addEventListener('pointermove', (ev) => {
        const rr = svg.getBoundingClientRect();
        const i = Math.max(0, Math.min(n - 1, Math.floor(((ev.clientX - rr.left) - pad.l) / slot)));
        groups.forEach((g, gi) => g.classList.toggle('is-dim', gi !== i));
        const tot = o.series.reduce((a, s) => a + s.values[i], 0);
        tip.show(`<b>${o.tipLabels ? o.tipLabels[i] : o.labels[i]}</b>` + o.series.map((s) => `<span><i style="background:${s.colors ? s.colors[i] : s.color}"></i>${s.name} <strong>${tipFmt(s.values[i])}</strong></span>`).join('') + (o.stacked && o.series.length > 1 ? `<span class="ch-tot">Total <strong>${tipFmt(tot)}</strong></span>` : ''), cx(i), y(totals[i]));
      });
      svg.addEventListener('pointerleave', () => { groups.forEach((g) => g.classList.remove('is-dim')); tip.hide(); });
    });
  }

  /* ---------- Anneau ---------- */
  function donut(host, o) {
    const size = o.size || 200, th = o.thickness || 22;
    host.classList.add('ch', 'ch-donut');
    host.innerHTML = '';
    const total = o.items.reduce((a, it) => a + it.value, 0);
    const R = size / 2 - th / 2 - 2, C = 2 * Math.PI * R;
    const svg = el('svg', { viewBox: `0 0 ${size} ${size}`, width: size, height: size, role: 'img', 'aria-label': o.label || 'Répartition' });
    el('circle', { cx: size / 2, cy: size / 2, r: R, fill: 'none', stroke: 'var(--ch-track, rgba(127,127,127,.12))', 'stroke-width': th }, svg);
    let off = 0;
    const gap = o.items.length > 1 ? (o.gap ?? 3) : 0;
    const arcs = o.items.map((it, i) => {
      const len = Math.max(0, (it.value / total) * C - gap);
      const c = el('circle', { cx: size / 2, cy: size / 2, r: R, fill: 'none', stroke: it.color, 'stroke-width': th, 'stroke-linecap': o.round ? 'round' : 'butt', 'stroke-dasharray': `${reduce ? len : 0} ${C}`, 'stroke-dashoffset': -off, transform: `rotate(-90 ${size / 2} ${size / 2})`, class: 'ch-arc' }, svg);
      if (!reduce) setTimeout(() => { c.style.transition = 'stroke-dasharray 1s cubic-bezier(.3,.8,.2,1)'; c.setAttribute('stroke-dasharray', `${len} ${C}`); }, 30 + i * 90);
      off += (it.value / total) * C;
      return c;
    });
    host.appendChild(svg);
    const center = document.createElement('div'); center.className = 'ch-center';
    const setCenter = (big, small) => { center.innerHTML = `<strong>${big}</strong><span>${small}</span>`; };
    const def = () => setCenter(o.centerValue ?? (o.format || compact)(total), o.centerLabel || 'Total');
    def(); host.appendChild(center);
    arcs.forEach((a, i) => {
      a.addEventListener('pointerenter', () => { arcs.forEach((b, j) => b.classList.toggle('is-dim', j !== i)); setCenter(Math.round((o.items[i].value / total) * 100) + ' %', o.items[i].label); });
      a.addEventListener('pointerleave', () => { arcs.forEach((b) => b.classList.remove('is-dim')); def(); });
    });
    if (o.legend) {
      o.legend.innerHTML = o.items.map((it) => `<li><i style="background:${it.color}"></i><span>${it.label}</span><b>${Math.round((it.value / total) * 100)} %</b></li>`).join('');
    }
  }

  /* ---------- Mini-courbe ---------- */
  function spark(host, values, color = 'currentColor', o = {}) {
    const w = o.width || 96, h = o.height || 32;
    const mn = Math.min(...values), mx = Math.max(...values), rg = mx - mn || 1;
    const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - 3 - ((v - mn) / rg) * (h - 6)]);
    const d = 'M' + pts.map((p) => p.join(',')).join(' L');
    const id = 's' + ++uid;
    host.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".25"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><path d="${d} L${w},${h} L0,${h} Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  // Compteur animé (0 → valeur)
  function countUp(node, to, fmt = fmtNum, ms = 900) {
    if (reduce) { node.innerHTML = fmt(to); return; }
    const from = 0, t0 = performance.now();
    const step = (t) => { const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3); node.innerHTML = fmt(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  window.Charts = { area, bars, donut, spark, countUp, fmtNum, compact };
})();
