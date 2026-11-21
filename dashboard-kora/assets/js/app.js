/* =========================================================
   Kora — back-office e-commerce
   Données de démonstration générées localement (2 ans de commandes).
   Pour brancher la vraie boutique : remplacez PRODUCTS / CUSTOMERS / ORDERS
   par les réponses de votre API, le reste du code ne change pas.
   ========================================================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const { fmtNum, compact } = Charts;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const F = (n) => `${fmtNum(n)} FCFA`;
  const pct = (n, d = 1) => `${n.toLocaleString('fr-FR', { maximumFractionDigits: d, minimumFractionDigits: d })} %`;

  /* ---------- Générateur pseudo-aléatoire stable ---------- */
  let seed = 4127;
  const rnd = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const weighted = (items, wKey = 'w') => { const tot = items.reduce((a, it) => a + it[wKey], 0); let r = rnd() * tot; for (const it of items) { r -= it[wKey]; if (r <= 0) return it; } return items[items.length - 1]; };

  /* ---------- Catalogue ---------- */
  const CATS = ['Vêtements', 'Sacs', 'Accessoires', 'Montres & lunettes'];
  const PRODUCTS = [
    ['Bomber satiné', 'Vêtements', 32000, 14, 'bomber', 'S · M · L · XL', 6],
    ['Veste en jean brut', 'Vêtements', 28500, 4, 'denim', 'S · M · L', 7],
    ['Pull en maille côtelée', 'Vêtements', 22000, 19, 'maille', 'S · M · L', 5],
    ['Pantalon large en lin', 'Vêtements', 19500, 27, 'pantalon', '36 → 44', 9],
    ['Perfecto en cuir', 'Vêtements', 65000, 3, 'perfecto', 'S · M · L', 3],
    ['Sweat à capuche', 'Vêtements', 16500, 32, 'sweat', 'S → XXL', 10],
    ['T-shirt coton bio blanc', 'Vêtements', 8500, 58, 'tee-blanc', 'XS → XXL', 18],
    ['T-shirt coton bio noir', 'Vêtements', 8500, 41, 'tee-noir', 'XS → XXL', 16],
    ['Poncho tissé main', 'Vêtements', 24000, 9, 'poncho', 'Taille unique', 4],
    ['Bonnet en laine', 'Accessoires', 7500, 2, 'bonnet', '3 coloris', 3],
    ['Sac à main cuir rouge', 'Sacs', 45000, 7, 'sac-rouge', 'Rouge · Noir', 6],
    ['Montre classique dorée', 'Montres & lunettes', 38000, 11, 'montre', 'Bracelet cuir', 5],
    ['Lunettes de soleil écaille', 'Montres & lunettes', 15000, 23, 'solaires', 'Écaille · Noir', 11],
    ['Bracelet jonc doré', 'Accessoires', 12000, 16, 'bracelet', 'S · M', 8],
    ['Cabas en raphia', 'Sacs', 18500, 5, 'cabas', 'Naturel', 7],
    ['Sac à dos urbain', 'Sacs', 27000, 12, 'sac-dos', 'Noir · Kaki', 6],
    ['Portefeuille en cuir', 'Accessoires', 14500, 21, 'portefeuille', 'Noir · Cognac', 7],
    ['Collier de perles', 'Accessoires', 21000, 8, 'perles', '45 cm', 5],
  ].map(([name, cat, price, stock, img, variants, w], i) => ({ id: 'p' + (i + 1), name, cat, price, stock, max: Math.max(40, stock + 20), img: `assets/img/${img}.webp`, variants, w, online: true }));

  /* ---------- Clients ---------- */
  const FIRST = ['Aya', 'Koffi', 'Mariam', 'Ibrahim', 'Adjoua', 'Serge', 'Fatou', 'Didier', 'Awa', 'Jean-Marc', 'Christelle', 'Moussa', 'Estelle', 'Yannick', 'Nadège', 'Hervé', 'Salimata', 'Arnaud', 'Grâce', 'Kevin', 'Inès', 'Abdoulaye', 'Laetitia', 'Franck', 'Bintou', 'Wilfried', 'Prisca', 'Cheick', 'Sandrine', 'Ange'];
  const LAST = ['Kouassi', 'Yao', 'Traoré', 'Koné', "N'Dri", 'Bamba', 'Diabaté', 'Konan', 'Gnagne', 'Aka', 'Coulibaly', 'Brou', 'Kouamé', 'Assi', 'Tanoh', 'Cissé', 'Ehui', 'Touré', 'Kacou', 'Diallo', 'Amani', 'Séka', 'Zadi', 'Yapi', 'Dosso', 'Fofana', 'Lago', 'Boni', 'Kra', 'Méité'];
  const ZONES = [
    ['Cocody', 27, 1500], ['Yopougon', 16, 1500], ['Marcory', 12, 1500], ['Plateau', 8, 1500], ['Koumassi', 7, 1500], ['Abobo', 7, 1500],
    ['Treichville', 5, 1500], ['Bingerville', 5, 2000], ['Port-Bouët', 4, 1500], ['Bouaké', 4, 3000], ['Yamoussoukro', 3, 3000], ['San-Pédro', 2, 3000],
  ].map(([name, w, fee]) => ({ name, w, fee }));
  const NDAYS = 730;
  const CUSTOMERS = [];
  { const used = new Set(); while (CUSTOMERS.length < 2500) { const n = `${FIRST[Math.floor(rnd() * FIRST.length)]} ${LAST[Math.floor(rnd() * LAST.length)]}`; if (used.has(n) && used.size < FIRST.length * LAST.length - 5) continue; used.add(n); CUSTOMERS.push({ id: CUSTOMERS.length, name: n, zone: weighted(ZONES), join: Math.floor(rnd() * NDAYS), hue: Math.floor(rnd() * 360) }); } }
  const cWeights = CUSTOMERS.map((_, i) => 1 / Math.pow(i + 60, 0.45));
  const cTotal = cWeights.reduce((a, b) => a + b, 0);
  const pickCustomer = (ago) => { for (let k = 0; k < 12; k++) { let r = rnd() * cTotal, i = 0; while ((r -= cWeights[i]) > 0) i++; if (CUSTOMERS[i].join >= ago) return CUSTOMERS[i]; } for (let k = 0; k < 80; k++) { const c = CUSTOMERS[Math.floor(rnd() * CUSTOMERS.length)]; if (c.join >= ago) return c; } return CUSTOMERS[0]; };

  /* ---------- Commandes (2 ans) ---------- */
  const PAYS = [
    { name: 'Wave', w: 38, c: '#5CC8FF' }, { name: 'Orange Money', w: 24, c: '#FF7A59' }, { name: 'MTN MoMo', w: 14, c: '#FFC857' },
    { name: 'Carte bancaire', w: 10, c: '#9B8CFF' }, { name: 'À la livraison', w: 14, c: '#8B8F98' },
  ];
  const CHANNELS = [{ name: 'Site web', w: 41, c: 'var(--lime)' }, { name: 'WhatsApp', w: 27, c: 'var(--sky)' }, { name: 'Instagram', w: 22, c: 'var(--violet)' }, { name: 'Facebook', w: 10, c: 'var(--coral)' }];
  const STATUS = {
    'a-preparer': { label: 'À préparer', c: '#FFC857' },
    expediee: { label: 'Expédiée', c: '#5CC8FF' },
    livree: { label: 'Livrée', c: '#4ADE80' },
    annulee: { label: 'Annulée', c: '#FF7A59' },
  };
  const now = new Date();
  const today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayAt = (ago) => new Date(today0.getFullYear(), today0.getMonth(), today0.getDate() - ago);
  const monthIdx = (d) => d.getFullYear() * 12 + d.getMonth();
  const VISITS = new Array(NDAYS).fill(0);
  const ORDERS = [];
  for (let ago = NDAYS - 1; ago >= 0; ago--) {
    const d = dayAt(ago), dow = d.getDay(), m = d.getMonth(), t = 1 - ago / NDAYS;
    let base = 4.5 + 12 * t * t + 3 * t;
    if (dow === 6) base *= 1.3; else if (dow === 0) base *= 0.78; else if (dow === 5) base *= 1.12;
    if (m === 11) base *= 1.4; else if (m === 0) base *= 0.85; else if (m === 7) base *= 0.9;
    let n = Math.round(base * (0.72 + rnd() * 0.56));
    let maxHour = 23;
    if (ago === 0) { maxHour = Math.max(8, now.getHours()); n = Math.round(n * Math.min(1, Math.max(0, (now.getHours() - 7) / 15))); }
    VISITS[ago] = Math.round(Math.max(n, base * 0.7) / (0.026 + rnd() * 0.012));
    for (let k = 0; k < n; k++) {
      const c = pickCustomer(ago);
      const date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 8 + Math.floor(rnd() * (maxHour - 7)), Math.floor(rnd() * 60));
      if (date > now) date.setTime(now.getTime() - rnd() * 36e5);
      const lines = [];
      const nl = rnd() < 0.62 ? 1 : rnd() < 0.75 ? 2 : 3;
      for (let j = 0; j < nl; j++) { const p = weighted(PRODUCTS); const ex = lines.find((l) => l.p === p); if (ex) ex.q++; else lines.push({ p, q: rnd() < 0.82 ? 1 : 2 }); }
      const sub = lines.reduce((a, l) => a + l.p.price * l.q, 0);
      const fee = sub >= 50000 ? 0 : c.zone.fee;
      const ageH = (now - date) / 36e5;
      let st = 'livree';
      const r = rnd();
      if (ageH < 20) st = r < 0.86 ? 'a-preparer' : 'expediee';
      else if (ageH < 72) st = r < 0.1 ? 'a-preparer' : r < 0.7 ? 'expediee' : 'livree';
      else st = r < 0.04 ? 'annulee' : 'livree';
      ORDERS.push({ date, ago, c, lines, sub, fee, total: sub + fee, pay: weighted(PAYS), ch: weighted(CHANNELS), st });
    }
  }
  ORDERS.sort((a, b) => a.date - b.date);
  ORDERS.forEach((o, i) => { o.num = 10000 + i; o.id = `KR-${o.num}`; });
  ORDERS.reverse(); // plus récentes en premier
  const valid = (o) => o.st !== 'annulee';

  /* ---------- Formats de date ---------- */
  const dFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
  const dLong = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const dTime = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const dW = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });
  const mFmt = new Intl.DateTimeFormat('fr-FR', { month: 'short' });
  const mLong = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });
  const rel = (d) => { const h = (now - d) / 36e5; if (h < 1) return `il y a ${Math.max(1, Math.round(h * 60))} min`; if (h < 24) return `il y a ${Math.round(h)} h`; const j = Math.round(h / 24); return j === 1 ? 'hier' : j < 30 ? `il y a ${j} j` : j < 365 ? `il y a ${Math.round(j / 30)} mois` : `il y a ${Math.round(j / 365)} an${j >= 730 ? 's' : ''}`; };
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  $('#today').textContent = cap(dLong.format(now));

  /* ---------- Statistiques par période ---------- */
  function periodData(p) {
    let n, bucketOf, labels, tips;
    if (p === '12m') {
      n = 12; const mi = monthIdx(now);
      bucketOf = (o) => mi - monthIdx(o.date);
      labels = []; tips = [];
      for (let i = 11; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); labels.push(mFmt.format(d).replace('.', '')); tips.push(cap(mLong.format(d)) + (i === 0 ? ' (en cours)' : '')); }
    } else {
      n = p === '7j' ? 7 : 30;
      bucketOf = (o) => o.ago;
      labels = []; tips = [];
      for (let i = n - 1; i >= 0; i--) { const d = dayAt(i); labels.push(p === '7j' ? cap(dW.format(d).replace('.', '')) : dFmt.format(d).replace('.', '')); tips.push(cap(dLong.format(d))); }
    }
    const mk = () => ({ ca: new Array(n).fill(0), cnt: new Array(n).fill(0), visits: new Array(n).fill(0), list: [] });
    const cur = mk(), prev = mk();
    for (const o of ORDERS) {
      const b = bucketOf(o);
      if (b >= 2 * n) break; // commandes triées de la plus récente à la plus ancienne
      const tgt = b < n ? cur : prev, idx = n - 1 - (b % n);
      tgt.list.push(o);
      if (valid(o)) { tgt.ca[idx] += o.total; tgt.cnt[idx]++; }
    }
    for (let ago = 0; ago < NDAYS; ago++) {
      const b = p === '12m' ? monthIdx(now) - monthIdx(dayAt(ago)) : ago;
      if (b >= 2 * n) continue;
      (b < n ? cur : prev).visits[n - 1 - (b % n)] += VISITS[ago];
    }
    return { n, labels, tips, cur, prev };
  }
  const sum = (a) => a.reduce((x, y) => x + y, 0);

  /* ---------- Aperçu ---------- */
  let period = '30j';
  const PERIOD_NOTE = { '7j': '7 derniers jours', '30j': '30 derniers jours', '12m': '12 derniers mois' };
  function delta(a, b) { if (!b) return ''; const d = ((a - b) / b) * 100; return `<span class="delta ${d >= 0 ? 'up' : 'down'}"><svg class="i"><use href="#i-${d >= 0 ? 'up' : 'down'}"/></svg>${pct(Math.abs(d))}</span>`; }

  function renderOverview() {
    const D = periodData(period);
    const { cur, prev } = D;
    $('#period-note').textContent = `${PERIOD_NOTE[period]} · comparés à la période précédente`;
    const ca = sum(cur.ca), caP = sum(prev.ca), cnt = sum(cur.cnt), cntP = sum(prev.cnt);
    const vis = sum(cur.visits), visP = sum(prev.visits);
    const avg = cnt ? ca / cnt : 0, avgP = cntP ? caP / cntP : 0;
    const conv = vis ? (cnt / vis) * 100 : 0, convP = visP ? (cntP / visP) * 100 : 0;
    const K = [
      { label: "Chiffre d'affaires", val: ca, fmt: (v) => `${fmtNum(v)}<small>FCFA</small>`, d: delta(ca, caP), icon: 'bag', spark: cur.ca, c: '#0C0D10' },
      { label: 'Commandes', val: cnt, fmt: fmtNum, d: delta(cnt, cntP), icon: 'box', spark: cur.cnt, c: 'var(--sky)' },
      { label: 'Panier moyen', val: avg, fmt: (v) => `${fmtNum(v)}<small>FCFA</small>`, d: delta(avg, avgP), icon: 'store', spark: cur.ca.map((v, i) => (cur.cnt[i] ? v / cur.cnt[i] : 0)), c: 'var(--violet)' },
      { label: 'Taux de conversion', val: conv, fmt: (v) => pct(v, 2), d: delta(conv, convP), icon: 'users', spark: cur.cnt.map((v, i) => (cur.visits[i] ? v / cur.visits[i] : 0)), c: 'var(--coral)' },
    ];
    $('#kpis').innerHTML = K.map((k, i) => `<article class="kpi"><div class="k-top"><p class="muted small">${k.label}</p><span class="k-icon" style="--c:${k.c}"><svg class="i"><use href="#i-${k.icon}"/></svg></span></div><p class="k-val" data-k="${i}">0</p><div class="k-foot">${k.d}<span data-spark="${i}"></span></div></article>`).join('');
    K.forEach((k, i) => {
      const node = $(`[data-k="${i}"]`);
      Charts.countUp(node, k.val, k.fmt);
      Charts.spark($(`[data-spark="${i}"]`), k.spark, i === 0 ? '#0C0D10' : k.c.startsWith('var') ? getComputedStyle(document.documentElement).getPropertyValue(k.c.slice(4, -1)).trim() : k.c, { width: 88, height: 30 });
    });

    Charts.area($('#ch-revenue'), {
      labels: D.labels, tipLabels: D.tips, height: 280, label: "Chiffre d'affaires",
      series: [
        { name: 'Précédente', values: prev.ca, color: '#5E626B', dash: '4 5', width: 1.6, fill: false },
        { name: 'Cette période', values: cur.ca, color: '#C8F65D' },
      ],
      tipFormat: F,
    });

    const byCh = CHANNELS.map((c) => ({ label: c.name, color: getComputedStyle(document.documentElement).getPropertyValue(c.c.slice(4, -1)).trim(), value: 0 }));
    const byPay = PAYS.map((p) => ({ ...p, n: 0 }));
    const byZone = new Map();
    const byProd = new Map();
    for (const o of cur.list) {
      if (!valid(o)) continue;
      byCh[CHANNELS.indexOf(o.ch)].value += o.total;
      byPay[PAYS.indexOf(o.pay)].n++;
      if (o.st === 'livree') byZone.set(o.c.zone.name, (byZone.get(o.c.zone.name) || 0) + 1);
      for (const l of o.lines) { const e = byProd.get(l.p) || { q: 0, ca: 0 }; e.q += l.q; e.ca += l.q * l.p.price; byProd.set(l.p, e); }
    }
    Charts.donut($('#ch-channels'), { items: byCh, size: 190, thickness: 24, legend: $('#lg-channels'), centerLabel: 'FCFA', format: compact, round: true, gap: 10 });

    const addCart = Math.round(vis * (0.105 + 0.01 * Math.sin(cnt)));
    const checkout = Math.round(cnt * 1.48);
    const steps = [['Visites', vis], ['Ajouts au panier', addCart], ['Paiement commencé', checkout], ['Commandes', cnt]];
    $('#funnel').innerHTML = steps.map(([l, v], i) => `<li style="--w:${Math.max(8, (v / vis) * 100)}%;animation-delay:${i * 0.1}s"><span>${l}</span><span><b>${fmtNum(v)}</b><small>${i ? pct((v / vis) * 100) : '100 %'}</small></span></li>`).join('');

    const maxPay = Math.max(...byPay.map((p) => p.n), 1), totPay = sum(byPay.map((p) => p.n)) || 1;
    $('#payments').innerHTML = byPay.sort((a, b) => b.n - a.n).map((p) => `<li><span>${p.name}</span><b>${fmtNum(p.n)} <span class="muted small">· ${Math.round((p.n / totPay) * 100)} %</span></b><span class="bar"><i style="--w:${(p.n / maxPay) * 100}%;--c:${p.c}"></i></span></li>`).join('');
    const zones = [...byZone].sort((a, b) => b[1] - a[1]).slice(0, 6), maxZ = zones[0]?.[1] || 1;
    $('#zones').innerHTML = zones.map(([z, v]) => `<li><span>${z}</span><b>${fmtNum(v)}</b><span class="bar"><i style="--w:${(v / maxZ) * 100}%;--c:var(--violet)"></i></span></li>`).join('');
    const tops = [...byProd].sort((a, b) => b[1].ca - a[1].ca).slice(0, 5);
    $('#tops').innerHTML = tops.map(([p, e], i) => `<li><img src="${p.img}" alt="" loading="lazy" width="44" height="44"><div><span class="rank">N° ${i + 1}</span><p>${esc(p.name)}</p><span>${fmtNum(e.q)} vendus</span></div><b>${compact(e.ca)}<br><span>FCFA</span></b></li>`).join('');

    $('#recent').innerHTML = `<thead><tr><th scope="col">Commande</th><th scope="col">Client</th><th scope="col">Canal</th><th scope="col" class="num">Total</th><th scope="col">Statut</th></tr></thead><tbody>${ORDERS.slice(0, 6).map((o) => `<tr data-order="${o.id}" style="cursor:pointer"><td><span class="oid">${o.id}</span><br><span class="muted small">${rel(o.date)}</span></td><td><div class="who"><span class="avatar sm" style="--h:${o.c.hue}">${initials(o.c.name)}</span><div>${esc(o.c.name)}<span>${o.c.zone.name}</span></div></div></td><td>${o.ch.name}</td><td class="num">${F(o.total)}</td><td>${pill(o.st)}</td></tr>`).join('')}</tbody>`;
  }
  const initials = (n) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const pill = (st) => `<span class="pill" style="--c:${STATUS[st].c}">${STATUS[st].label}</span>`;

  $('#period').addEventListener('click', (e) => {
    const b = e.target.closest('[data-p]'); if (!b) return;
    period = b.dataset.p;
    $$('#period [data-p]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    renderOverview();
  });

  /* ---------- Objectif du mois ---------- */
  function renderGoal() {
    const mi = monthIdx(now);
    const ca = ORDERS.filter((o) => valid(o) && monthIdx(o.date) === mi).reduce((a, o) => a + o.total, 0);
    const goal = 20e6;
    $('.side-card .eyebrow').textContent = `Objectif de ${new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(now)}`;
    $('#goal-val').textContent = (ca / 1e6).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' M';
    requestAnimationFrame(() => { $('#goal-bar').style.width = Math.min(100, (ca / goal) * 100) + '%'; });
    const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
    $('#goal-note').textContent = ca >= goal ? 'Objectif atteint, bravo !' : `${Math.round((ca / goal) * 100)} % atteint · ${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}`;
  }

  /* ---------- Commandes ---------- */
  const oState = { st: 'all', q: '', sort: 'date', dir: -1, limit: 20 };
  const TABS = [['all', 'Toutes'], ['a-preparer', 'À préparer'], ['expediee', 'Expédiées'], ['livree', 'Livrées'], ['annulee', 'Annulées']];
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  function filteredOrders() {
    const q = norm(oState.q.trim());
    let list = ORDERS.filter((o) => (oState.st === 'all' || o.st === oState.st) && (!q || norm(o.id).includes(q) || norm(o.c.name).includes(q)));
    if (oState.sort === 'total') list = [...list].sort((a, b) => (a.total - b.total) * oState.dir);
    else if (oState.dir === 1) list = [...list].reverse();
    return list;
  }
  function renderOrders() {
    const counts = { all: ORDERS.length }; for (const o of ORDERS) counts[o.st] = (counts[o.st] || 0) + 1;
    $('#o-tabs').innerHTML = TABS.map(([k, l]) => `<button role="tab" type="button" data-st="${k}" aria-selected="${oState.st === k}">${l}<b>${fmtNum(counts[k] || 0)}</b></button>`).join('');
    const list = filteredOrders();
    const shown = list.slice(0, oState.limit);
    $('#o-body').innerHTML = shown.length ? shown.map((o) => `<tr data-order="${o.id}" tabindex="0"><td><span class="oid">${o.id}</span><br><span class="muted small">${o.lines.reduce((a, l) => a + l.q, 0)} article${o.lines.reduce((a, l) => a + l.q, 0) > 1 ? 's' : ''} · ${o.ch.name}</span></td><td><div class="who"><span class="avatar sm" style="--h:${o.c.hue}">${initials(o.c.name)}</span><div>${esc(o.c.name)}<span>${o.c.zone.name}</span></div></div></td><td>${dTime.format(o.date)}</td><td><span class="pay"><i style="--c:${o.pay.c}"></i>${o.pay.name}</span></td><td class="num"><b>${F(o.total)}</b></td><td>${pill(o.st)}</td><td>${o.st === 'a-preparer' ? `<button class="btn ghost sm" type="button" data-ship="${o.id}"><svg class="i"><use href="#i-truck"/></svg>Expédier</button>` : ''}</td></tr>`).join('') : `<tr><td colspan="7" class="muted" style="padding:40px;text-align:center">Aucune commande ne correspond.</td></tr>`;
    $('#o-count').textContent = `${fmtNum(shown.length)} sur ${fmtNum(list.length)} commande${list.length > 1 ? 's' : ''}`;
    $('#o-more').hidden = shown.length >= list.length;
    $$('.th-sort').forEach((b) => { if (b.dataset.sort === oState.sort) b.dataset.dir = oState.dir; else delete b.dataset.dir; });
    $('#nav-todo').textContent = counts['a-preparer'] || 0;
  }
  $('#o-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-st]'); if (!b) return; oState.st = b.dataset.st; oState.limit = 20; renderOrders(); });
  $('#o-q').addEventListener('input', (e) => { oState.q = e.target.value; oState.limit = 20; renderOrders(); });
  $('#o-more').addEventListener('click', () => { oState.limit += 20; renderOrders(); });
  $$('.th-sort').forEach((b) => b.addEventListener('click', () => { if (oState.sort === b.dataset.sort) oState.dir *= -1; else { oState.sort = b.dataset.sort; oState.dir = -1; } renderOrders(); }));
  $('#o-export').addEventListener('click', () => {
    const list = filteredOrders();
    const rows = [['Commande', 'Date', 'Client', 'Commune', 'Canal', 'Paiement', 'Articles', 'Sous-total', 'Livraison', 'Total', 'Statut']]
      .concat(list.map((o) => [o.id, o.date.toLocaleString('fr-FR'), o.c.name, o.c.zone.name, o.ch.name, o.pay.name, o.lines.map((l) => `${l.q} x ${l.p.name}`).join(' + '), o.sub, o.fee, o.total, STATUS[o.st].label]));
    const csv = '﻿' + rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = `commandes-kora-${today0.toISOString().slice(0, 10)}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast(`${fmtNum(list.length)} commandes exportées (fichier tableur)`);
  });

  document.addEventListener('click', (e) => {
    const ship = e.target.closest('[data-ship]');
    if (ship) { e.stopPropagation(); setStatus(ship.dataset.ship, 'expediee'); return; }
    const row = e.target.closest('[data-order]');
    if (row) openOrder(row.dataset.order);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('tr[data-order]')) openOrder(e.target.dataset.order); });

  function setStatus(id, st) {
    const o = ORDERS.find((x) => x.id === id); if (!o) return;
    o.st = st;
    if (st === 'expediee') o.shipped = new Date();
    if (st === 'livree') o.delivered = new Date();
    renderOrders(); renderNotifs();
    if (!$('#d-order').hidden) openOrder(id, true);
    toast({ expediee: `${id} marquée comme expédiée`, livree: `${id} livrée`, annulee: `${id} annulée` }[st]);
  }

  /* ---------- Tiroir de commande ---------- */
  let lastFocus = null;
  function openOrder(id, keep) {
    const o = ORDERS.find((x) => x.id === id); if (!o) return;
    const d = $('#d-order');
    $('#d-title').textContent = `Commande ${o.id}`;
    $('#d-date').textContent = `${cap(dLong.format(o.date))} · ${o.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    const steps = [
      ['Commande reçue', o.date, true],
      ['Paiement confirmé', new Date(+o.date + 4 * 6e4), o.st !== 'annulee'],
      ['Expédiée', o.shipped || new Date(+o.date + Math.min(18 * 36e5, (now - o.date) * 0.5)), ['expediee', 'livree'].includes(o.st)],
      ['Livrée', o.delivered || new Date(+o.date + Math.min(42 * 36e5, (now - o.date) * 0.9)), o.st === 'livree'],
    ];
    $('#d-body').innerHTML = `
      <div class="row-between">${pill(o.st)}<span class="muted small">via ${o.ch.name}</span></div>
      <section class="d-sec"><h3>Articles</h3><ul class="d-lines">${o.lines.map((l) => `<li><img src="${l.p.img}" alt="" width="48" height="48"><div><p>${esc(l.p.name)}</p><span>${l.q} × ${F(l.p.price)}</span></div><b>${F(l.q * l.p.price)}</b></li>`).join('')}</ul>
        <div class="d-sum"><div><span class="muted">Sous-total</span><span>${F(o.sub)}</span></div><div><span class="muted">Livraison (${o.c.zone.name})</span><span>${o.fee ? F(o.fee) : 'Offerte'}</span></div><div class="tot"><span>Total</span><span>${F(o.total)}</span></div></div></section>
      <section class="d-sec"><h3>Client & paiement</h3><div class="d-info"><div><span>Client</span>${esc(o.c.name)}</div><div><span>Livraison</span>${o.c.zone.name}</div><div><span>Paiement</span>${o.pay.name}</div><div><span>Téléphone</span>+225 07 ${String(10 + (o.c.id * 37) % 89).padStart(2, '0')} ${String((o.c.id * 53) % 100).padStart(2, '0')} ${String((o.c.id * 71) % 100).padStart(2, '0')} ${String((o.c.id * 13) % 100).padStart(2, '0')}</div></div></section>
      <section class="d-sec"><h3>Suivi</h3><ol class="timeline">${(o.st === 'annulee' ? [steps[0], ['Commande annulée', new Date(+o.date + 6 * 36e5), true]] : steps).map(([l, dt, done]) => `<li class="${done ? 'done' : ''}"><span class="dot">${done ? '<svg class="i"><use href="#i-check"/></svg>' : ''}</span><div>${l}<span>${done ? dTime.format(dt) : 'En attente'}</span></div></li>`).join('')}</ol></section>`;
    const acts = { 'a-preparer': `<button class="btn ghost" type="button" data-set="annulee">Annuler</button><button class="btn lime" type="button" data-set="expediee"><svg class="i"><use href="#i-truck"/></svg>Marquer comme expédiée</button>`, expediee: `<button class="btn lime" type="button" data-set="livree"><svg class="i"><use href="#i-check"/></svg>Confirmer la livraison</button>`, livree: `<button class="btn ghost" type="button" data-receipt>Envoyer le reçu</button>`, annulee: '' };
    $('#d-foot').innerHTML = `<button class="btn ghost" type="button" data-wa><svg class="i"><use href="#i-chat"/></svg>Contacter</button>${acts[o.st]}`;
    $('#d-foot').onclick = (e) => {
      const s = e.target.closest('[data-set]'); if (s) return setStatus(o.id, s.dataset.set);
      if (e.target.closest('[data-wa]')) toast(`Message WhatsApp préparé pour ${o.c.name}`);
      if (e.target.closest('[data-receipt]')) toast(`Reçu envoyé à ${o.c.name}`);
    };
    if (!keep) { lastFocus = document.activeElement; openLayer(d); }
  }

  /* ---------- Couches (tiroir, fenêtre, menu) ---------- */
  function openLayer(el) { el.hidden = false; document.body.style.overflow = 'hidden'; requestAnimationFrame(() => (el.querySelector('[data-close]') || el).focus()); }
  function closeLayer(el) { el.hidden = true; document.body.style.overflow = ''; if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); }
  $$('.drawer, .modal').forEach((el) => el.addEventListener('click', (e) => { if (e.target === el || e.target.closest('[data-close]')) closeLayer(el); }));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = $$('.drawer, .modal').find((el) => !el.hidden);
    if (open) return closeLayer(open);
    if (!$('#notifs').hidden) return toggleNotifs(false);
    if ($('#side').classList.contains('is-open')) return side(false);
  });
  // piège du focus dans les couches ouvertes
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const open = $$('.drawer, .modal').find((el) => !el.hidden); if (!open) return;
    const f = $$('button, input, select, a[href], [tabindex]:not([tabindex="-1"])', open).filter((x) => !x.disabled && x.offsetParent !== null);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });
  $$('[data-open]').forEach((b) => b.addEventListener('click', () => { lastFocus = b; openLayer($(b.dataset.open)); }));

  /* ---------- Produits ---------- */
  const pState = { cat: 'Tous', low: false };
  const LOW = 5;
  function sold30(p) { let q = 0; for (const o of ORDERS) { if (o.ago >= 30) break; if (valid(o)) for (const l of o.lines) if (l.p === p) q += l.q; } return q; }
  function renderProducts() {
    $('#p-cats').innerHTML = ['Tous', ...CATS].map((c) => `<button type="button" data-cat="${c}" aria-pressed="${pState.cat === c}">${c}</button>`).join('');
    const lows = PRODUCTS.filter((p) => p.stock <= LOW);
    const al = $('#p-alert');
    al.hidden = !lows.length;
    al.innerHTML = `<svg class="i"><use href="#i-alert"/></svg><span><b>${lows.length} produit${lows.length > 1 ? 's' : ''} bientôt en rupture :</b> ${lows.map((p) => esc(p.name)).join(', ')}.</span>`;
    const list = PRODUCTS.filter((p) => (pState.cat === 'Tous' || p.cat === pState.cat) && (!pState.low || p.stock <= LOW));
    $('#p-grid').innerHTML = list.length ? list.map((p, i) => {
      const r = p.stock / p.max, c = p.stock <= LOW ? 'var(--amber)' : r < 0.35 ? 'var(--sky)' : 'var(--lime)';
      return `<li class="prod ${p.online ? '' : 'is-off'}" style="animation-delay:${Math.min(i, 12) * 0.035}s" data-pid="${p.id}">
        <div class="ph">${p.img ? `<img src="${p.img}" alt="${esc(p.name)}" loading="lazy" width="320" height="320">` : '<span class="ph-empty"><svg class="i" style="width:40px;height:40px"><use href="#i-box"/></svg></span>'}
          ${!p.online ? '<span class="tag off">Hors ligne</span>' : p.stock <= LOW ? '<span class="tag low">Stock faible</span>' : `<span class="tag">${p.sold ?? sold30(p)} vendus / 30 j</span>`}</div>
        <div class="body"><div><p class="muted small">${p.cat} · ${esc(p.variants || '—')}</p><h3>${esc(p.name)}</h3></div>
          <div class="meta"><span class="price">${F(p.price)}</span></div>
          <div class="stock"><span>Stock : <b style="color:var(--fg)" data-stock>${p.stock}</b> / ${p.max}</span><span class="bar"><i style="--w:${Math.min(100, r * 100)}%;--c:${c}"></i></span></div>
          <div class="foot"><div class="qty" role="group" aria-label="Ajuster le stock de ${esc(p.name)}"><button type="button" data-step="-1" aria-label="Retirer une unité">−</button><output>${p.stock}</output><button type="button" data-step="1" aria-label="Ajouter une unité">+</button></div>
            <label class="switch" title="Visible sur la boutique"><input type="checkbox" data-online ${p.online ? 'checked' : ''} aria-label="En ligne : ${esc(p.name)}"><span></span></label></div></div></li>`;
    }).join('') : '<li class="muted">Aucun produit dans ce filtre.</li>';
  }
  PRODUCTS.forEach((p) => { p.sold = sold30(p); });
  $('#p-cats').addEventListener('click', (e) => { const b = e.target.closest('[data-cat]'); if (!b) return; pState.cat = b.dataset.cat; renderProducts(); });
  $('#p-low').addEventListener('change', (e) => { pState.low = e.target.checked; renderProducts(); });
  $('#p-grid').addEventListener('click', (e) => {
    const b = e.target.closest('[data-step]'); if (!b) return;
    const p = PRODUCTS.find((x) => x.id === b.closest('[data-pid]').dataset.pid);
    p.stock = Math.max(0, p.stock + +b.dataset.step); p.max = Math.max(p.max, p.stock);
    renderProducts(); renderNotifs();
    $(`[data-pid="${p.id}"] [data-step="${b.dataset.step}"]`)?.focus();
  });
  $('#p-grid').addEventListener('change', (e) => {
    if (!e.target.matches('[data-online]')) return;
    const p = PRODUCTS.find((x) => x.id === e.target.closest('[data-pid]').dataset.pid);
    p.online = e.target.checked; renderProducts();
    toast(`${p.name} ${p.online ? 'est en ligne' : 'est retiré de la boutique'}`);
  });
  const fp = $('#f-product');
  fp.cat.innerHTML = CATS.map((c) => `<option>${c}</option>`).join('');
  fp.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = ['name', 'price', 'stock'].filter((n) => !fp[n].checkValidity() || (n === 'name' && !fp[n].value.trim()));
    ['name', 'price', 'stock'].forEach((n) => fp[n].setAttribute('aria-invalid', String(bad.includes(n))));
    if (bad.length) { $('#f-err').textContent = 'Renseignez le nom, un prix d\'au moins 500 FCFA et le stock.'; fp[bad[0]].focus(); return; }
    $('#f-err').textContent = '';
    const p = { id: 'p' + (PRODUCTS.length + 1) + '-' + Date.now(), name: fp.name.value.trim(), cat: fp.cat.value, price: +fp.price.value, stock: +fp.stock.value, max: Math.max(40, +fp.stock.value), img: '', variants: fp.variants.value.trim() || 'Taille unique', online: fp.online.checked, sold: 0, w: 0 };
    PRODUCTS.unshift(p);
    pState.cat = 'Tous'; pState.low = false; $('#p-low').checked = false;
    renderProducts(); closeLayer($('#m-product')); fp.reset();
    toast(`« ${p.name} » ajouté au catalogue`);
  });

  /* ---------- Clients ---------- */
  const SEG = { VIP: '#C8F65D', Fidèle: '#9B8CFF', Nouveau: '#5CC8FF', Occasionnel: '#8B8F98', 'À relancer': '#FF7A59' };
  let cSeg = 'Tous', cLimit = 15;
  function customerStats() {
    const m = new Map();
    for (const o of ORDERS) {
      if (!valid(o)) continue;
      const s = m.get(o.c) || { c: o.c, n: 0, spent: 0, last: o.date, first: o.date };
      s.n++; s.spent += o.total; if (o.date > s.last) s.last = o.date; if (o.date < s.first) s.first = o.date;
      m.set(o.c, s);
    }
    const list = [...m.values()];
    for (const s of list) {
      const lastDays = (now - s.last) / 864e5, firstDays = (now - s.first) / 864e5;
      s.seg = lastDays > 60 ? 'À relancer' : s.spent >= 300000 ? 'VIP' : s.n >= 3 ? 'Fidèle' : firstDays <= 30 ? 'Nouveau' : 'Occasionnel';
    }
    return list.sort((a, b) => b.spent - a.spent);
  }
  function renderClients() {
    const list = customerStats();
    const active = list.filter((s) => (now - s.last) / 864e5 <= 30).length;
    const fresh = list.filter((s) => (now - s.first) / 864e5 <= 30).length;
    const ltv = sum(list.map((s) => s.spent)) / (list.length || 1);
    $('#c-kpis').innerHTML = [
      ['Clients actifs (30 j)', fmtNum(active), 'users', 'var(--lime)'],
      ['Nouveaux clients (30 j)', fmtNum(fresh), 'plus', 'var(--sky)'],
      ['Dépense moyenne par client', `${fmtNum(ltv)}<small>FCFA</small>`, 'star', 'var(--violet)'],
    ].map(([l, v, ic, c]) => `<article class="kpi"><div class="k-top"><p class="muted small">${l}</p><span class="k-icon" style="--c:${c}"><svg class="i"><use href="#i-${ic}"/></svg></span></div><p class="k-val">${v}</p></article>`).join('');
    const counts = {}; list.forEach((s) => (counts[s.seg] = (counts[s.seg] || 0) + 1));
    $('#c-seg').innerHTML = ['Tous', ...Object.keys(SEG)].map((s) => `<button type="button" data-seg="${s}" aria-pressed="${cSeg === s}">${s}</button>`).join('');
    const rows = list.filter((s) => cSeg === 'Tous' || s.seg === cSeg);
    const shown = rows.slice(0, cLimit);
    $('#c-table').innerHTML = `<thead><tr><th scope="col">Client</th><th scope="col" class="num">Commandes</th><th scope="col" class="num">Total dépensé</th><th scope="col">Dernière commande</th><th scope="col">Segment</th><th scope="col"><span class="sr">Action</span></th></tr></thead>
      <tbody>${shown.map((s) => `<tr><td><div class="who"><span class="avatar sm" style="--h:${s.c.hue}">${initials(s.c.name)}</span><div>${esc(s.c.name)}<span>${s.c.zone.name}</span></div></div></td><td class="num">${s.n}</td><td class="num"><b>${F(s.spent)}</b></td><td>${rel(s.last)}</td><td><span class="pill" style="--c:${SEG[s.seg]}">${s.seg}</span></td><td><button class="icon-btn" type="button" data-relance="${esc(s.c.name)}" aria-label="Relancer ${esc(s.c.name)} sur WhatsApp" title="Relancer sur WhatsApp"><svg class="i"><use href="#i-chat"/></svg></button></td></tr>`).join('')}</tbody>
      ${rows.length > shown.length ? `<tfoot><tr><td colspan="6" style="text-align:center"><button class="btn ghost sm" type="button" id="c-more">Afficher plus (${fmtNum(rows.length - shown.length)})</button></td></tr></tfoot>` : ''}`;
    Charts.donut($('#ch-seg'), { items: Object.keys(SEG).map((k) => ({ label: k, value: counts[k] || 0, color: SEG[k] })), size: 180, thickness: 20, legend: $('#lg-seg'), centerLabel: 'clients', format: fmtNum });
    const lost = counts['À relancer'] || 0;
    $('#c-advice').textContent = `${fmtNum(lost)} clients n'ont rien commandé depuis plus de 60 jours. Un code promo envoyé sur WhatsApp en fait revenir en moyenne 1 sur 8.`;
  }
  $('#c-seg').addEventListener('click', (e) => { const b = e.target.closest('[data-seg]'); if (!b) return; cSeg = b.dataset.seg; cLimit = 15; renderClients(); });
  $('#c-table').addEventListener('click', (e) => {
    if (e.target.closest('#c-more')) { cLimit += 15; renderClients(); return; }
    const r = e.target.closest('[data-relance]'); if (r) toast(`Message de relance préparé pour ${r.dataset.relance}`);
  });

  /* ---------- Recherche globale ---------- */
  const q = $('#q'), res = $('#q-results');
  let hits = [], active = -1;
  function search() {
    const t = norm(q.value.trim());
    if (!t) { res.hidden = true; q.setAttribute('aria-expanded', 'false'); return; }
    const prods = PRODUCTS.filter((p) => norm(p.name).includes(t)).slice(0, 3).map((p) => ({ type: 'p', p }));
    const ords = ORDERS.filter((o) => norm(o.id).includes(t) || norm(o.c.name).includes(t)).slice(0, 5).map((o) => ({ type: 'o', o }));
    hits = [...ords, ...prods]; active = -1;
    res.innerHTML = hits.length ? hits.map((h, i) => h.type === 'o'
      ? `<li><button type="button" role="option" data-hit="${i}"><span class="avatar sm" style="--h:${h.o.c.hue}">${initials(h.o.c.name)}</span><span>${h.o.id} · ${esc(h.o.c.name)}</span><small>${F(h.o.total)}</small></button></li>`
      : `<li><button type="button" role="option" data-hit="${i}">${h.p.img ? `<img src="${h.p.img}" alt="">` : '<span class="avatar sm">+</span>'}<span>${esc(h.p.name)}</span><small>Stock ${h.p.stock}</small></button></li>`).join('') : '<li class="empty">Aucun résultat</li>';
    res.hidden = false; q.setAttribute('aria-expanded', 'true');
  }
  function choose(i) {
    const h = hits[i]; if (!h) return;
    res.hidden = true; q.value = ''; q.blur();
    if (h.type === 'o') { lastFocus = q; openOrder(h.o.id); }
    else { pState.cat = 'Tous'; pState.low = false; $('#p-low').checked = false; go('produits'); requestAnimationFrame(() => { const card = $(`[data-pid="${h.p.id}"]`); card?.scrollIntoView({ block: 'center', behavior: 'smooth' }); card?.animate([{ boxShadow: '0 0 0 2px #C8F65D' }, { boxShadow: '0 0 0 2px transparent' }], { duration: 1600 }); }); }
  }
  q.addEventListener('input', search);
  q.addEventListener('focus', search);
  q.addEventListener('keydown', (e) => {
    const btns = $$('[data-hit]', res);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); active = (active + (e.key === 'ArrowDown' ? 1 : -1) + btns.length) % btns.length; btns.forEach((b, i) => b.classList.toggle('is-active', i === active)); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(active >= 0 ? active : 0); }
    else if (e.key === 'Escape') { res.hidden = true; q.blur(); }
  });
  res.addEventListener('click', (e) => { const b = e.target.closest('[data-hit]'); if (b) choose(+b.dataset.hit); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.search')) res.hidden = true; if (!e.target.closest('.pop-wrap')) toggleNotifs(false); });
  document.addEventListener('keydown', (e) => { if (e.key === '/' && !e.target.matches('input, select, textarea')) { e.preventDefault(); q.focus(); } });

  /* ---------- Notifications ---------- */
  function renderNotifs() {
    const todo = ORDERS.filter((o) => o.st === 'a-preparer').length;
    const lows = PRODUCTS.filter((p) => p.stock <= LOW);
    $('#notif-list').innerHTML = [
      todo && ['bag', 'var(--amber)', `${todo} commande${todo > 1 ? 's' : ''} à préparer`, 'À expédier aujourd\'hui'],
      lows.length && ['alert', 'var(--coral)', `${lows.length} produit${lows.length > 1 ? 's' : ''} en stock faible`, lows.slice(0, 2).map((p) => p.name).join(', ') + (lows.length > 2 ? '…' : '')],
      ['star', 'var(--lime)', 'Nouvel avis 5 étoiles', '« Sac magnifique, livré en 24 h à Cocody »'],
    ].filter(Boolean).map(([ic, c, t, s]) => `<li style="--c:${c}"><svg class="i"><use href="#i-${ic}"/></svg><div><p>${esc(t)}</p><span>${esc(s)}</span></div></li>`).join('');
  }
  function toggleNotifs(on) { const p = $('#notifs'); p.hidden = !on; $('#bell').setAttribute('aria-expanded', String(on)); if (on) $('.ping').style.display = 'none'; }
  $('#bell').addEventListener('click', (e) => { e.stopPropagation(); toggleNotifs($('#notifs').hidden); });

  /* ---------- Menu mobile ---------- */
  function side(on) { $('#side').classList.toggle('is-open', on); $('.scrim').classList.toggle('is-on', on); $('[data-open-side]').setAttribute('aria-expanded', String(on)); if (on) $('#side a').focus(); }
  $('[data-open-side]').addEventListener('click', () => side(true));
  $('[data-close-side]').addEventListener('click', () => side(false));

  /* ---------- Navigation entre vues ---------- */
  const TITLES = { apercu: 'Aperçu', commandes: 'Commandes', produits: 'Produits', clients: 'Clients' };
  const RENDER = { apercu: renderOverview, commandes: renderOrders, produits: renderProducts, clients: renderClients };
  function go(v, push = true) {
    if (!TITLES[v]) v = 'apercu';
    $$('.view').forEach((s) => (s.hidden = s.dataset.view !== v));
    $$('[data-go]').forEach((a) => { if (a.closest('.nav')) { if (a.dataset.go === v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); } });
    $('#view-title').textContent = TITLES[v];
    document.title = `${TITLES[v]} — Kora, tableau de bord e-commerce`;
    RENDER[v]();
    if (push && location.hash !== '#' + v) history.pushState(null, '', '#' + v);
    side(false);
    window.scrollTo({ top: 0 });
  }
  document.addEventListener('click', (e) => { const a = e.target.closest('a[data-go]'); if (!a) return; e.preventDefault(); go(a.dataset.go); });
  window.addEventListener('popstate', () => go(location.hash.slice(1), false));

  /* ---------- Toast ---------- */
  let tt;
  function toast(msg) { const t = $('#toast'); t.innerHTML = `<svg class="i"><use href="#i-check"/></svg>${esc(msg)}`; t.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('is-on'), 2600); }

  renderGoal(); renderOrders(); renderNotifs();
  go(location.hash.slice(1) || 'apercu', false);
})();
