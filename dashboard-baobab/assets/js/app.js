/* =========================================================
   Baobab — caisse et gestion commerciale d'une supérette
   Données de démonstration générées localement (30 jours de tickets).
   Pour brancher le vrai magasin : remplacez PRODUCTS, TICKETS et SLATES
   par les données de votre serveur ; l'interface ne change pas.
   ========================================================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const { fmtNum, compact } = Charts;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const F = (n) => `${fmtNum(n)} FCFA`;
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  let seed = 911;
  const rnd = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const weighted = (items, key = 'w') => { const tot = items.reduce((a, it) => a + it[key], 0); let r = rnd() * tot; for (const it of items) { if ((r -= it[key]) <= 0) return it; } return items[items.length - 1]; };

  /* ---------- Rayons & produits ---------- */
  const CATS = {
    epicerie: { label: 'Épicerie', c: '#D9622B' },
    boissons: { label: 'Boissons', c: '#4C93C9' },
    frais: { label: 'Produits frais', c: '#2E7D5B' },
    boulangerie: { label: 'Boulangerie', c: '#B7811A' },
    hygiene: { label: 'Hygiène & maison', c: '#3B3F8C' },
  };
  const SUP = ['Grossiste Adjamé', 'Laiterie du Sud', 'Le Fournil de Marcory', 'Boissons Treichville', 'Coopérative maraîchère'];
  const PRODUCTS = [
    // réf, nom, rayon, achat, vente, stock, seuil, fournisseur, popularité
    ['EP-101', 'Riz parfumé 5 kg', 'epicerie', 3700, 4250, 34, 10, 0, 6],
    ['EP-102', 'Riz brisé 25 kg', 'epicerie', 12200, 13500, 6, 4, 0, 1.5],
    ['EP-103', 'Huile végétale 1 L', 'epicerie', 1200, 1400, 48, 15, 0, 7],
    ['EP-104', 'Huile végétale 5 L', 'epicerie', 5800, 6500, 3, 5, 0, 1.6],
    ['EP-105', 'Sucre en poudre 1 kg', 'epicerie', 780, 900, 41, 15, 0, 6],
    ['EP-106', 'Sucre en morceaux', 'epicerie', 500, 600, 22, 10, 0, 3],
    ['EP-107', 'Lait concentré sucré', 'epicerie', 370, 450, 64, 20, 1, 8],
    ['EP-108', 'Lait en poudre 400 g', 'epicerie', 1950, 2300, 9, 8, 1, 2.5],
    ['EP-109', 'Concentré de tomate 70 g', 'epicerie', 115, 150, 120, 40, 0, 10],
    ['EP-110', 'Spaghetti 500 g', 'epicerie', 370, 450, 56, 20, 0, 6],
    ['EP-111', "Sardines à l'huile", 'epicerie', 320, 400, 0, 15, 0, 5],
    ['EP-112', 'Farine de blé 1 kg', 'epicerie', 590, 700, 18, 10, 0, 2.5],
    ['EP-113', 'Café soluble 100 g', 'epicerie', 1500, 1800, 12, 6, 0, 1.8],
    ['EP-114', 'Bouillon en cubes', 'epicerie', 820, 1000, 27, 12, 0, 4],
    ['FR-201', 'Attiéké 500 g', 'frais', 380, 500, 26, 15, 4, 9],
    ['FR-202', 'Œufs, plaquette de 30', 'frais', 2300, 2700, 7, 6, 4, 2.5],
    ['FR-203', 'Banane plantain, le tas', 'frais', 750, 1000, 14, 8, 4, 4],
    ['FR-204', 'Oignons 1 kg', 'frais', 600, 800, 4, 8, 4, 3.5],
    ['FR-205', 'Yaourt nature', 'frais', 270, 350, 38, 18, 1, 5],
    ['FR-206', 'Beurre 250 g', 'frais', 1350, 1600, 11, 6, 1, 1.5],
    ['BO-301', 'Eau minérale 1,5 L', 'boissons', 300, 400, 96, 36, 3, 11],
    ['BO-302', 'Eau, pack 6 × 1,5 L', 'boissons', 1750, 2200, 15, 8, 3, 3],
    ['BO-303', 'Jus de bissap 50 cl', 'boissons', 300, 500, 30, 15, 4, 6],
    ['BO-304', 'Jus de gingembre 50 cl', 'boissons', 300, 500, 8, 15, 4, 5],
    ['BO-305', 'Soda 33 cl', 'boissons', 310, 400, 72, 24, 3, 8],
    ['BO-306', 'Boisson maltée 33 cl', 'boissons', 400, 500, 40, 24, 3, 4],
    ['BL-401', 'Pain baguette', 'boulangerie', 115, 150, 85, 40, 2, 16],
    ['BL-402', 'Pain de mie', 'boulangerie', 720, 900, 9, 6, 2, 2],
    ['BL-403', 'Croissant', 'boulangerie', 200, 300, 24, 12, 2, 4],
    ['HY-501', 'Savon de ménage', 'hygiene', 230, 300, 58, 20, 0, 5],
    ['HY-502', 'Lessive en poudre 1 kg', 'hygiene', 1250, 1500, 16, 8, 0, 2.5],
    ['HY-503', 'Eau de javel 1 L', 'hygiene', 450, 600, 21, 10, 0, 2.5],
    ['HY-504', 'Papier toilette × 4', 'hygiene', 950, 1200, 5, 8, 0, 2],
    ['HY-505', 'Dentifrice', 'hygiene', 620, 800, 19, 8, 0, 2],
  ].map(([ref, name, cat, buy, sell, stock, min, sup, w]) => ({ id: ref, ref, name, cat, buy, sell, stock, min, sup: SUP[sup], w }));
  const P = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  const catIcon = (cat) => `<svg class="i"><use href="#c-${cat}"/></svg>`;

  /* ---------- Paiements ---------- */
  const PAYS = [
    { id: 'cash', name: 'Espèces', short: 'F', c: '#2E7D5B', w: 58 },
    { id: 'wave', name: 'Wave', short: 'W', c: '#4C93C9', w: 18 },
    { id: 'om', name: 'Orange Money', label: 'Orange', short: 'OM', c: '#E8772E', w: 12 },
    { id: 'momo', name: 'MTN MoMo', label: 'MoMo', short: 'M', c: '#D9A41E', w: 6 },
    { id: 'card', name: 'Carte', short: 'CB', c: '#3B3F8C', w: 2 },
    { id: 'slate', name: 'Ardoise', short: 'A', c: '#7A7466', w: 4 },
  ];
  const PAY = Object.fromEntries(PAYS.map((p) => [p.id, p]));

  /* ---------- Historique des tickets (30 jours + aujourd'hui) ---------- */
  const now = new Date();
  const today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayAt = (ago) => new Date(today0.getFullYear(), today0.getMonth(), today0.getDate() - ago);
  const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  const HW = [9, 12, 8, 5, 5, 7, 6, 4, 4, 5, 8, 11, 12, 8, 4];
  const CASHIERS = ['Mariam D.', 'Koffi A.'];
  const TICKETS = []; // { ago, date, lines:[{p,q}], pay, total, cost, num, who }
  for (let ago = 30; ago >= 0; ago--) {
    const d = dayAt(ago), dow = d.getDay();
    let n = Math.round((120 + rnd() * 40) * (dow === 6 ? 1.25 : dow === 0 ? 0.8 : 1));
    let num = 0;
    const list = [];
    for (let k = 0; k < n; k++) {
      let hi = 0, r = rnd() * HW.reduce((a, b) => a + b, 0);
      while ((r -= HW[hi]) > 0) hi++;
      const date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), HOURS[hi], Math.floor(rnd() * 60));
      if (date > now) continue;
      const lines = [];
      const nl = rnd() < 0.45 ? 1 : rnd() < 0.6 ? 2 : rnd() < 0.7 ? 3 : 4;
      for (let j = 0; j < nl; j++) {
        const p = weighted(PRODUCTS);
        const q = p.cat === 'boulangerie' && p.sell < 200 ? 1 + Math.floor(rnd() * 5) : rnd() < 0.75 ? 1 : 2;
        const ex = lines.find((l) => l.p === p); if (ex) ex.q += q; else lines.push({ p, q });
      }
      list.push({ ago, date, lines, pay: weighted(PAYS).id, who: CASHIERS[hi < 7 ? 0 : 1] });
    }
    list.sort((a, b) => a.date - b.date).forEach((t) => { t.num = ++num; t.total = t.lines.reduce((a, l) => a + l.q * l.p.sell, 0); t.cost = t.lines.reduce((a, l) => a + l.q * l.p.buy, 0); t.disc = 0; TICKETS.push(t); });
  }
  const todays = () => TICKETS.filter((t) => t.ago === 0);
  const pad4 = (n) => String(n).padStart(4, '0');

  /* ---------- Mouvements de stock ---------- */
  const MOVES = [
    { d: new Date(+now - 26 * 6e4), p: P['BL-401'], q: 60, type: 'in', label: 'Livraison · Le Fournil de Marcory' },
    { d: new Date(+now - 3.2 * 36e5), p: P['FR-205'], q: -3, type: 'out', label: 'Périmés retirés du rayon' },
    { d: new Date(+now - 20 * 36e5), p: P['BO-301'], q: 48, type: 'in', label: 'Livraison · Boissons Treichville' },
    { d: new Date(+now - 26 * 36e5), p: P['EP-101'], q: 20, type: 'in', label: 'Livraison · Grossiste Adjamé' },
    { d: new Date(+now - 27 * 36e5), p: P['EP-103'], q: 24, type: 'in', label: 'Livraison · Grossiste Adjamé' },
    { d: new Date(+now - 30 * 36e5), p: P['HY-501'], q: -2, type: 'out', label: 'Casse en réserve' },
    { d: new Date(+now - 50 * 36e5), p: P['FR-201'], q: 40, type: 'in', label: 'Livraison · Coopérative maraîchère' },
    { d: new Date(+now - 74 * 36e5), p: P['EP-107'], q: 2, type: 'in', label: 'Inventaire : écart corrigé' },
  ];

  /* ---------- Ardoises (crédits clients) ---------- */
  const SLATES = [
    ['Tantie Rose', 'Voisine, rue 12', 50000, 18450, 3, [[-2, 'Riz, huile, sucre', 6350], [-9, 'Remboursement', -10000], [-11, 'Courses de la semaine', 12100]]],
    ['M. Kouadio', 'Garage du carrefour', 80000, 42300, 19, [[-19, 'Remboursement', -15000], [-21, 'Eau × 2 packs, pain', 6900], [-25, 'Riz brisé 25 kg', 13500]]],
    ['Awa Sangaré', 'Coiffeuse, Zone 4', 30000, 4200, 1, [[-1, 'Pain, lait, œufs', 4200], [-6, 'Remboursement', -8000]]],
    ['Famille Bamba', 'Résidence Les Palmiers', 100000, 67800, 24, [[-24, 'Remboursement', -20000], [-27, 'Courses du mois', 38400], [-33, 'Lessive, savon, javel', 4800]]],
    ['Ibrahim Touré', 'Taxi', 20000, 0, 4, [[-4, 'Remboursement', -6500], [-8, 'Boissons, pain', 2600]]],
    ['Mme Ehui', 'Institutrice', 40000, 12650, 8, [[-8, 'Remboursement', -5000], [-10, 'Lait en poudre, café', 4100]]],
    ['Maquis Chez Ange', 'Restaurant, rue 9', 150000, 96500, 15, [[-2, 'Attiéké × 40, oignons', 28000], [-15, 'Remboursement', -50000], [-16, 'Huile 5 L × 3, tomate', 21600]]],
    ['Serge Yapi', 'Étudiant', 15000, 6900, 31, [[-31, 'Pâtes, sardines, pain', 3400], [-38, 'Remboursement', -2000]]],
  ].map(([name, note, limit, due, lastPay, hist], i) => ({ id: 's' + i, name, note, limit, due, lastPay, hist: hist.map(([ago, l, a]) => ({ d: dayAt(-ago), l, a })), h: (i * 47) % 360 }));

  /* ---------- Horloge ---------- */
  const tFmt = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const dLong = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const dShort = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' });
  const tick = () => { const d = new Date(); $('#clock').textContent = tFmt.format(d); $('#date').textContent = cap(dLong.format(d)); };
  tick(); setInterval(tick, 20000);

  /* =========================================================
     CAISSE
     ========================================================= */
  const cart = new Map();
  let disc = 0, pay = 'cash', closed = false, catSel = 'all', filter = '';
  const nextNum = () => (todays().at(-1)?.num || 0) + 1;

  function renderCats() {
    $('#cats').innerHTML = [['all', 'Tout', '#1F1D2B'], ...Object.entries(CATS).map(([k, c]) => [k, c.label, c.c])]
      .map(([k, l, c]) => `<button type="button" data-cat="${k}" aria-pressed="${catSel === k}" style="--c:${c}"><span class="ci">${k === 'all' ? '<svg class="i"><use href="#i-box"/></svg>' : catIcon(k)}</span>${l}</button>`).join('');
  }
  function renderTiles() {
    const f = norm(filter.trim());
    const list = PRODUCTS.filter((p) => (catSel === 'all' || p.cat === catSel) && (!f || norm(p.name).includes(f) || norm(p.ref).includes(f)));
    $('#tiles').innerHTML = list.length ? list.map((p) => {
      const inq = cart.get(p.id) || 0, left = p.stock - inq;
      return `<li class="tile" style="--c:${CATS[p.cat].c}"><button type="button" data-add="${p.id}" ${left <= 0 ? 'disabled' : ''} aria-label="Ajouter ${esc(p.name)}, ${F(p.sell)}">
        <span class="ti">${catIcon(p.cat)}</span><span class="tn">${esc(p.name)}</span>
        <span class="tp"><b>${fmtNum(p.sell)}</b><span class="${left <= p.min ? 'low' : ''}">${left <= 0 ? 'Rupture' : `${left} en stock`}</span></span></button>${inq ? `<span class="inq">${inq}</span>` : ''}</li>`;
    }).join('') : '<li class="empty">Aucun produit trouvé.</li>';
  }
  const totals = () => {
    let sub = 0, n = 0;
    for (const [id, q] of cart) { sub += P[id].sell * q; n += q; }
    const discount = Math.round((sub * disc) / 100 / 5) * 5;
    return { sub, n, discount, total: sub - discount };
  };
  function renderTicket() {
    const { n, discount, total } = totals();
    $('#t-num').textContent = `N° ${pad4(nextNum())}`;
    $('#t-lines').innerHTML = cart.size ? [...cart].map(([id, q]) => {
      const p = P[id];
      return `<li class="t-line"><div><p>${esc(p.name)}</p><span>${q} × ${fmtNum(p.sell)}</span></div>
        <div class="stepper" role="group" aria-label="Quantité de ${esc(p.name)}"><button type="button" data-dec="${id}" aria-label="Retirer un"><svg class="i"><use href="#i-${q > 1 ? 'minus' : 'trash'}"/></svg></button><output>${q}</output><button type="button" data-inc="${id}" aria-label="Ajouter un" ${q >= p.stock ? 'disabled' : ''}><svg class="i"><use href="#i-plus"/></svg></button></div>
        <b>${fmtNum(p.sell * q)}</b></li>`;
    }).join('') : '<li class="empty"><svg class="i" style="width:34px;height:34px"><use href="#i-scan"/></svg>Scannez ou touchez un produit pour l\'ajouter au ticket.</li>';
    $('#t-count').textContent = n + (discount ? ` · remise −${fmtNum(discount)}` : '');
    $('#t-total').textContent = F(total);
    // paiement
    $('#pay').innerHTML = PAYS.map((p) => `<button type="button" role="radio" aria-checked="${pay === p.id}" data-pay="${p.id}" style="--c:${p.c}" aria-label="${p.name}"><i>${p.short}</i>${p.label || p.name}</button>`).join('');
    $('#cash').hidden = pay !== 'cash';
    $('#credit').hidden = pay !== 'slate';
    const given = +$('#given').value || 0;
    const ch = given - total;
    const chEl = $('.change');
    chEl.classList.toggle('is-short', given > 0 && ch < 0);
    chEl.firstChild.textContent = given > 0 && ch < 0 ? 'Il manque ' : 'Monnaie à rendre ';
    $('#change').textContent = F(Math.abs(given ? ch : 0));
    const rounds = [...new Set([total, Math.ceil(total / 500) * 500, Math.ceil(total / 1000) * 1000, Math.ceil(total / 2000) * 2000, Math.ceil(total / 5000) * 5000, Math.ceil(total / 10000) * 10000])].filter((v) => v > 0).slice(0, 5);
    $('#quick').innerHTML = total ? rounds.map((v, i) => `<button type="button" data-given="${v}">${i === 0 ? 'Compte juste' : fmtNum(v)}</button>`).join('') : '';
    const ok = cart.size && !closed && (pay !== 'cash' || given >= total) && (pay !== 'slate' || $('#credit-client').value);
    const btn = $('#checkout');
    btn.disabled = !ok && !closed;
    btn.querySelector('span').textContent = closed ? 'Caisse clôturée · Rouvrir' : `Encaisser ${total ? F(total) : ''}`;
    $('#fab-label').textContent = n ? `Ticket · ${n} article${n > 1 ? 's' : ''} · ${F(total)}` : 'Ticket vide';
  }
  function add(id, dq = 1) {
    const p = P[id]; if (!p) return;
    const q = (cart.get(id) || 0) + dq;
    if (q > p.stock) { toast(`Stock insuffisant pour ${p.name}`, 'alert'); return; }
    if (q <= 0) cart.delete(id); else cart.set(id, q);
    renderTiles(); renderTicket();
  }
  $('#cats').addEventListener('click', (e) => { const b = e.target.closest('[data-cat]'); if (!b) return; catSel = b.dataset.cat; renderCats(); renderTiles(); });
  $('#tiles').addEventListener('click', (e) => { const b = e.target.closest('[data-add]'); if (b) add(b.dataset.add); });
  $('#t-lines').addEventListener('click', (e) => {
    const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]');
    if (inc) add(inc.dataset.inc, 1); if (dec) add(dec.dataset.dec, -1);
  });
  $('#t-clear').addEventListener('click', () => { if (!cart.size) return; cart.clear(); $('#given').value = ''; renderTiles(); renderTicket(); toast('Ticket vidé'); });
  $('#t-disc').addEventListener('click', (e) => { const b = e.target.closest('[data-d]'); if (!b) return; disc = +b.dataset.d; $$('#t-disc [data-d]').forEach((x) => x.setAttribute('aria-checked', String(x === b))); renderTicket(); });
  $('#pay').addEventListener('click', (e) => { const b = e.target.closest('[data-pay]'); if (!b) return; pay = b.dataset.pay; renderTicket(); if (pay === 'cash') $('#given').focus(); });
  $('#given').addEventListener('input', renderTicket);
  $('#quick').addEventListener('click', (e) => { const b = e.target.closest('[data-given]'); if (!b) return; $('#given').value = b.dataset.given; renderTicket(); });
  $('#credit-client').addEventListener('change', renderTicket);
  const scan = $('#scan');
  scan.addEventListener('input', () => { filter = scan.value; renderTiles(); });
  scan.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const f = norm(scan.value.trim()); if (!f) return;
    const hit = PRODUCTS.find((p) => norm(p.ref) === f) || PRODUCTS.find((p) => (catSel === 'all' || p.cat === catSel) && norm(p.name).includes(f) && p.stock > (cart.get(p.id) || 0));
    if (hit) { add(hit.id); scan.value = ''; filter = ''; renderTiles(); toast(`${hit.name} ajouté`); }
    else toast('Aucun produit ne correspond', 'alert');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F2') { e.preventDefault(); go('caisse'); scan.focus(); }
  });
  function fillCreditClients() {
    $('#credit-client').innerHTML = '<option value="">Choisir le client…</option>' + SLATES.map((s) => `<option value="${s.id}">${esc(s.name)} — reste ${fmtNum(s.limit - s.due)} FCFA autorisés</option>`).join('');
  }

  $('#checkout').addEventListener('click', () => {
    if (closed) { closed = false; $('.cashier').classList.remove('is-closed'); $('.cashier span').textContent = 'Mariam D.'; renderTicket(); toast('Caisse rouverte'); return; }
    const { total, discount } = totals();
    if (!cart.size) return;
    const given = +$('#given').value || 0;
    const t = { ago: 0, date: new Date(), lines: [...cart].map(([id, q]) => ({ p: P[id], q })), pay, who: 'Mariam D.', num: nextNum(), disc: discount, isNew: true };
    t.total = total; t.cost = t.lines.reduce((a, l) => a + l.q * l.p.buy, 0);
    if (pay === 'slate') {
      const s = SLATES.find((x) => x.id === $('#credit-client').value);
      s.due += total; s.hist.unshift({ d: new Date(), l: `Ticket N° ${pad4(t.num)}`, a: total }); t.client = s.name;
      if (s.due > s.limit) toast(`Attention : ${s.name} dépasse son plafond`, 'alert');
    }
    TICKETS.push(t);
    for (const l of t.lines) { l.p.stock -= l.q; MOVES.unshift({ d: t.date, p: l.p, q: -l.q, type: 'out', label: `Vente · ticket N° ${pad4(t.num)}`, isNew: true }); }
    showReceipt(t, given);
    cart.clear(); disc = 0; $('#given').value = ''; $('#credit-client').value = '';
    $$('#t-disc [data-d]').forEach((x) => x.setAttribute('aria-checked', String(x.dataset.d === '0')));
    fillCreditClients(); renderTiles(); renderTicket(); updateStockBadge(); sheet(false);
  });

  function showReceipt(t, given) {
    const sub = t.lines.reduce((a, l) => a + l.q * l.p.sell, 0);
    $('#receipt').innerHTML = `<h2 id="r-title">BAOBAB</h2>
      <p class="c">Alimentation générale<br>Marcory Zone 4, Abidjan<br>Tél. +225 27 21 00 00 00</p><hr>
      <div class="l"><span>Ticket N° ${pad4(t.num)}</span><span>${t.date.toLocaleDateString('fr-FR')} ${tFmt.format(t.date)}</span></div>
      <div class="l"><span>Caisse 1 · ${t.who}</span><span></span></div><hr>
      ${t.lines.map((l) => `<div class="l"><span>${esc(l.p.name)}</span><span>${fmtNum(l.q * l.p.sell)}</span></div><div class="l muted"><span>&nbsp;&nbsp;${l.q} × ${fmtNum(l.p.sell)}</span><span></span></div>`).join('')}<hr>
      ${t.disc ? `<div class="l"><span>Sous-total</span><span>${fmtNum(sub)}</span></div><div class="l"><span>Remise</span><span>−${fmtNum(t.disc)}</span></div>` : ''}
      <div class="l big"><span>TOTAL</span><span>${F(t.total)}</span></div>
      <div class="l"><span>Payé par</span><span>${PAY[t.pay].name}${t.client ? ` (${esc(t.client)})` : ''}</span></div>
      ${t.pay === 'cash' ? `<div class="l"><span>Reçu</span><span>${fmtNum(given)}</span></div><div class="l"><span>Rendu</span><span>${fmtNum(given - t.total)}</span></div>` : ''}<hr>
      <p class="c">Merci de votre visite et à bientôt !</p><div class="bars" aria-hidden="true"></div><p class="c">${pad4(t.num)}-${today0.getFullYear()}${String(today0.getMonth() + 1).padStart(2, '0')}${String(today0.getDate()).padStart(2, '0')}</p>`;
    openModal($('#m-receipt'));
  }
  $('#r-print').addEventListener('click', () => window.print());

  // Ticket en panneau sur mobile
  function sheet(on) { $('#ticket').classList.toggle('is-open', on); $('#t-open').setAttribute('aria-expanded', String(on)); }
  $('#t-open').addEventListener('click', () => sheet(true));
  $('#t-close').addEventListener('click', () => sheet(false));

  /* =========================================================
     VENTES
     ========================================================= */
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  let tLimit = 12;
  function renderSales() {
    const T = todays();
    const dow = now.getDay();
    const sameDays = [7, 14, 21, 28].map((ago) => TICKETS.filter((t) => t.ago === ago));
    const lastWeek = TICKETS.filter((t) => t.ago === 7 && (t.date.getHours() < now.getHours() || (t.date.getHours() === now.getHours() && t.date.getMinutes() <= now.getMinutes())));
    const ca = sum(T.map((t) => t.total)), cost = sum(T.map((t) => t.cost)), lw = sum(lastWeek.map((t) => t.total));
    const avg = T.length ? ca / T.length : 0, lwAvg = lastWeek.length ? lw / lastWeek.length : 0;
    const marg = ca - cost;
    $('#v-day').textContent = cap(dLong.format(now));
    const d = (a, b) => { if (!b) return ''; const v = ((a - b) / b) * 100; return `<span class="${v >= 0 ? 'up' : 'down'}">${v >= 0 ? '▲' : '▼'} ${Math.abs(v).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %</span> vs ${new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(now)} dernier, même heure`; };
    $('#v-kpis').innerHTML = [
      ['dark', "Chiffre d'affaires du jour", `${fmtNum(ca)}<small>FCFA</small>`, d(ca, lw), '#E9B44C'],
      ['', 'Tickets', fmtNum(T.length), d(T.length, lastWeek.length), '#4C93C9'],
      ['', 'Panier moyen', `${fmtNum(avg)}<small>FCFA</small>`, d(avg, lwAvg), '#2E7D5B'],
      ['', 'Marge brute', `${fmtNum(marg)}<small>FCFA</small>`, `Taux de marge : <b>${ca ? ((marg / ca) * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) : 0} %</b>`, '#D9622B'],
    ].map(([cls, l, v, dd, c]) => `<article class="kpi ${cls}" style="--c:${c}"><p class="muted small">${l}</p><p class="kv">${v}</p><p class="kd">${dd || '&nbsp;'}</p></article>`).join('');

    const byHour = HOURS.map((h) => sum(T.filter((t) => t.date.getHours() === h).map((t) => t.total)));
    const avgHour = HOURS.map((h) => Math.round(sum(sameDays.map((list) => sum(list.filter((t) => t.date.getHours() === h).map((t) => t.total)))) / 4));
    Charts.bars($('#ch-hours'), { labels: HOURS.map((h) => `${h}h`), tipLabels: HOURS.map((h) => `De ${h} h à ${h + 1} h`), height: 260, radius: 6, barWidth: 16,
      series: [{ name: "Aujourd'hui", values: byHour, color: '#D9622B' }, { name: `Moyenne des ${new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(now)}s`, values: avgHour, color: '#E6DED0' }], tipFormat: F, highlight: HOURS.indexOf(now.getHours()) });
    const byPay = PAYS.map((p) => ({ label: p.name, color: p.c, value: sum(T.filter((t) => t.pay === p.id).map((t) => t.total)) })).filter((x) => x.value);
    if (byPay.length) Charts.donut($('#ch-pay'), { items: byPay, size: 180, thickness: 26, legend: $('#lg-pay'), centerLabel: 'FCFA encaissés', format: compact });
    else { $('#ch-pay').innerHTML = '<p class="muted">Aucune vente pour l\'instant.</p>'; $('#lg-pay').innerHTML = ''; }

    const cats = Object.entries(CATS).map(([k, c]) => {
      let v = 0, m = 0; for (const t of T) for (const l of t.lines) if (l.p.cat === k) { v += l.q * l.p.sell; m += l.q * (l.p.sell - l.p.buy); }
      return { k, c, v, m };
    }).sort((a, b) => b.v - a.v);
    const maxC = Math.max(1, ...cats.map((x) => x.v));
    $('#v-cats').innerHTML = cats.map((x) => `<li style="--c:${x.c.c}"><span class="ci">${catIcon(x.k)}</span><p>${x.c.label}</p><b>${fmtNum(x.v)}</b><span class="bar"><i style="--w:${((x.v - x.m) / maxC) * 100}%"></i><i style="--w:${(x.m / maxC) * 100}%"></i></span><small style="grid-column:2/-1">dont ${fmtNum(x.m)} FCFA de marge</small></li>`).join('');

    const days = [...Array(30)].map((_, i) => 29 - i);
    const dCost = days.map((ago) => sum(TICKETS.filter((t) => t.ago === ago).map((t) => t.cost)));
    const dMarg = days.map((ago, i) => sum(TICKETS.filter((t) => t.ago === ago).map((t) => t.total)) - dCost[i]);
    Charts.bars($('#ch-30'), { labels: days.map((a) => dShort.format(dayAt(a))), tipLabels: days.map((a) => cap(dLong.format(dayAt(a)))), stacked: true, height: 250, barWidth: 14, radius: 4,
      series: [{ name: "Coût d'achat", values: dCost, color: '#3A3747' }, { name: 'Marge brute', values: dMarg, color: '#E9B44C' }], tipFormat: F, highlight: 29 });

    const rows = [...T].reverse();
    $('#v-tcount').textContent = `${fmtNum(rows.length)} tickets · dernier à ${rows[0] ? tFmt.format(rows[0].date) : '—'}`;
    $('#v-tickets').innerHTML = `<thead><tr><th scope="col">N°</th><th scope="col">Heure</th><th scope="col">Articles</th><th scope="col">Paiement</th><th scope="col">Caissier</th><th scope="col" class="num">Total</th></tr></thead>
      <tbody>${rows.slice(0, tLimit).map((t) => `<tr class="${t.isNew ? 'is-new' : ''}"><td class="mono">${pad4(t.num)}</td><td>${tFmt.format(t.date)}</td><td style="white-space:normal;min-width:220px">${t.lines.map((l) => `${l.q} × ${esc(l.p.name)}`).join(', ')}</td><td><span class="tag" style="--c:${PAY[t.pay].c}">${PAY[t.pay].name}</span></td><td>${t.who}</td><td class="num"><b>${F(t.total)}</b></td></tr>`).join('')}</tbody>`
      + (rows.length > tLimit ? `<tfoot><tr><td colspan="6" style="text-align:center"><button class="btn soft sm" type="button" id="t-more">Afficher les ${fmtNum(rows.length - tLimit)} autres</button></td></tr></tfoot>` : '');
  }
  $('#v-tickets').addEventListener('click', (e) => { if (e.target.closest('#t-more')) { tLimit = 1e9; renderSales(); } });

  /* Clôture de caisse */
  const FOND = 25000;
  $('#close-day').addEventListener('click', () => {
    const T = todays();
    const by = (id) => sum(T.filter((t) => t.pay === id).map((t) => t.total));
    const expected = FOND + by('cash');
    $('#cl-body').innerHTML = `<div class="recap">
        <div><span>Fond de caisse</span><b>${F(FOND)}</b></div>
        <div><span>Ventes en espèces</span><b>${F(by('cash'))}</b></div>
        <div style="background:var(--bg)"><span>Espèces attendues dans le tiroir</span><b>${F(expected)}</b></div>
      </div>
      <label class="fld"><span>Espèces comptées</span><input id="counted" type="number" inputmode="numeric" min="0" step="25" value="${expected - 150}"></label>
      <div class="gap-box" id="gap"></div>
      <div class="recap">${PAYS.filter((p) => p.id !== 'cash').map((p) => `<div><span>${p.name}</span><b>${F(by(p.id))}</b></div>`).join('')}<div><span><b>Total encaissé (${T.length} tickets)</b></span><b>${F(sum(T.map((t) => t.total)))}</b></div></div>`;
    const upd = () => { const g = (+$('#counted').value || 0) - expected; const el = $('#gap'); el.className = 'gap-box ' + (Math.abs(g) <= 500 ? 'ok' : 'ko'); el.innerHTML = `<span>${g === 0 ? 'Caisse juste' : g > 0 ? 'Excédent' : 'Manquant'}</span><b>${g > 0 ? '+' : g < 0 ? '−' : ''}${F(Math.abs(g))}</b>`; };
    $('#counted').addEventListener('input', upd); upd();
    openModal($('#m-close'));
  });
  $('#cl-ok').addEventListener('click', () => {
    closed = true; closeModal($('#m-close'));
    $('.cashier').classList.add('is-closed'); $('.cashier span').textContent = 'Clôturée';
    renderTicket(); toast('Caisse clôturée, rapport Z enregistré');
  });

  /* =========================================================
     STOCK
     ========================================================= */
  let sFilter = 'all', sQ = '';
  const soldPerDay = (p) => { let q = 0; for (const t of TICKETS) if (t.ago >= 1 && t.ago <= 28) for (const l of t.lines) if (l.p === p) q += l.q; return q / 28; };
  PRODUCTS.forEach((p) => { p.perDay = soldPerDay(p); });
  const state = (p) => (p.stock <= 0 ? 'out' : p.stock <= p.min ? 'low' : 'ok');
  const ST = { out: ['Rupture', '#C0392B'], low: ['À commander', '#D9622B'], ok: ['En stock', '#2E7D5B'] };
  function updateStockBadge() { const n = PRODUCTS.filter((p) => state(p) !== 'ok').length; const b = $('#nav-stock'); b.hidden = !n; b.textContent = n; }
  function renderStock() {
    const value = sum(PRODUCTS.map((p) => Math.max(0, p.stock) * p.buy));
    const low = PRODUCTS.filter((p) => state(p) === 'low').length, out = PRODUCTS.filter((p) => state(p) === 'out').length;
    const margin = sum(PRODUCTS.map((p) => (p.sell - p.buy) / p.sell)) / PRODUCTS.length;
    $('#s-kpis').innerHTML = [
      ['dark', 'Valeur du stock (prix d\'achat)', `${fmtNum(value)}<small>FCFA</small>`, `${PRODUCTS.length} références`, '#E9B44C'],
      ['', 'À commander', fmtNum(low), 'Sous le seuil d\'alerte', '#D9622B'],
      ['', 'Ruptures', fmtNum(out), out ? 'Ventes perdues en ce moment' : 'Aucune rupture', '#C0392B'],
      ['', 'Marge moyenne', `${(margin * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`, 'Sur le prix de vente', '#2E7D5B'],
    ].map(([cls, l, v, dd, c]) => `<article class="kpi ${cls}" style="--c:${c}"><p class="muted small">${l}</p><p class="kv">${v}</p><p class="kd">${dd}</p></article>`).join('');
    const counts = { all: PRODUCTS.length, low, out };
    $('#s-filter').innerHTML = [['all', 'Tous'], ['low', 'À commander'], ['out', 'Ruptures']].map(([k, l]) => `<button type="button" data-sf="${k}" aria-pressed="${sFilter === k}">${l}<b>${counts[k]}</b></button>`).join('');
    const q = norm(sQ.trim());
    const order = { out: 0, low: 1, ok: 2 };
    const list = PRODUCTS.filter((p) => (sFilter === 'all' || state(p) === sFilter) && (!q || norm(p.name).includes(q) || norm(p.ref).includes(q))).sort((a, b) => order[state(a)] - order[state(b)] || a.ref.localeCompare(b.ref));
    $('#s-table').innerHTML = `<thead><tr><th scope="col">Produit</th><th scope="col" class="num">Achat</th><th scope="col" class="num">Vente</th><th scope="col" class="num">Marge</th><th scope="col">Stock / seuil</th><th scope="col" class="num">Couverture</th><th scope="col">Statut</th></tr></thead>
      <tbody>${list.map((p) => { const s = state(p), cov = p.perDay ? p.stock / p.perDay : 99; const c = ST[s][1];
        return `<tr><td><div class="prod" style="--c:${CATS[p.cat].c}"><span class="ci">${catIcon(p.cat)}</span><div>${esc(p.name)}<span><span class="mono">${p.ref}</span> · ${CATS[p.cat].label}</span></div></div></td><td class="num">${fmtNum(p.buy)}</td><td class="num">${fmtNum(p.sell)}</td><td class="num">${Math.round(((p.sell - p.buy) / p.sell) * 100)} %</td>
          <td><div class="lvl"><span><b>${p.stock}</b> <span class="muted">/ ${p.min}</span></span><span class="bar"><i style="--w:${Math.min(100, (p.stock / (p.min * 3)) * 100)}%;--c:${c}"></i></span></div></td>
          <td class="num">${p.stock <= 0 ? '—' : cov >= 60 ? '+ 60 j' : `${cov.toLocaleString('fr-FR', { maximumFractionDigits: cov < 3 ? 1 : 0 })} j`}</td><td><span class="tag" style="--c:${c}">${ST[s][0]}</span></td></tr>`; }).join('') || '<tr><td colspan="7" class="muted" style="text-align:center;padding:30px">Aucun produit.</td></tr>'}</tbody>`;
    renderMoves();
  }
  const rel = (d) => { const m = (now - d) / 6e4; if (m < 0) return 'à l\'instant'; if (m < 60) return `il y a ${Math.max(1, Math.round(m))} min`; if (m < 60 * 24) return `il y a ${Math.round(m / 60)} h`; const j = Math.round(m / 1440); return j === 1 ? 'hier' : `il y a ${j} j`; };
  function renderMoves() {
    $('#moves').innerHTML = MOVES.slice(0, 14).map((m) => `<li class="${m.isNew ? 'is-new' : ''}"><span class="mi ${m.type}">${m.q > 0 ? '+' : '−'}</span><div><p>${esc(m.p.name)}</p><span>${esc(m.label)} · ${rel(m.d)}</span></div><b style="color:${m.q > 0 ? 'var(--green)' : 'var(--terra-d)'}">${m.q > 0 ? '+' : '−'}${Math.abs(m.q)}</b></li>`).join('');
  }
  $('#s-filter').addEventListener('click', (e) => { const b = e.target.closest('[data-sf]'); if (!b) return; sFilter = b.dataset.sf; renderStock(); });
  $('#s-q').addEventListener('input', (e) => { sQ = e.target.value; renderStock(); });

  // Entrée de stock
  const fin = $('#f-in');
  fin.pid.innerHTML = Object.entries(CATS).map(([k, c]) => `<optgroup label="${c.label}">${PRODUCTS.filter((p) => p.cat === k).map((p) => `<option value="${p.id}">${esc(p.name)} (${p.ref})</option>`).join('')}</optgroup>`).join('');
  fin.sup.innerHTML = SUP.map((s) => `<option>${s}</option>`).join('');
  const inHint = () => { const p = P[fin.pid.value]; const q = +fin.qty.value || 0; $('#in-hint').innerHTML = `Stock actuel : <b>${p.stock}</b> · seuil ${p.min}${q ? ` → nouveau stock : <b>${p.stock + q}</b>` : ''} · coût ${F(q * p.buy)}`; };
  fin.pid.addEventListener('change', () => { fin.sup.value = P[fin.pid.value].sup; inHint(); });
  fin.qty.addEventListener('input', inHint);
  $('#in-open').addEventListener('click', () => { const first = PRODUCTS.find((p) => state(p) !== 'ok') || PRODUCTS[0]; fin.pid.value = first.id; fin.sup.value = first.sup; fin.qty.value = Math.max(first.min * 3 - first.stock, first.min); inHint(); openModal($('#m-in')); });
  fin.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = Math.floor(+fin.qty.value);
    if (!(q > 0)) { fin.qty.setAttribute('aria-invalid', 'true'); fin.qty.focus(); return; }
    fin.qty.removeAttribute('aria-invalid');
    const p = P[fin.pid.value]; p.stock += q;
    MOVES.unshift({ d: new Date(), p, q, type: 'in', label: `Livraison · ${fin.sup.value}`, isNew: true });
    closeModal($('#m-in')); renderStock(); renderTiles(); updateStockBadge();
    toast(`+${q} ${p.name} enregistrés`);
  });

  // Bon de commande automatique
  $('#po-open').addEventListener('click', () => {
    const need = PRODUCTS.filter((p) => state(p) !== 'ok');
    const groups = SUP.map((s) => ({ s, items: need.filter((p) => p.sup === s) })).filter((g) => g.items.length);
    if (!groups.length) { $('#po-body').innerHTML = '<p class="hint">Tous les produits sont au-dessus de leur seuil : rien à commander.</p>'; }
    else {
      $('#po-body').innerHTML = `<p class="hint">Quantités proposées pour couvrir environ 2 semaines de ventes. Ajustez-les avant l'envoi.</p>` + groups.map((g, gi) => `<section class="po-group" data-g="${gi}"><h3>${g.s}<span data-gtot></span></h3><div class="table-wrap"><table class="tbl"><thead><tr><th scope="col">Produit</th><th scope="col" class="num">Stock</th><th scope="col" class="num">Quantité</th><th scope="col" class="num">Prix d'achat</th><th scope="col" class="num">Montant</th></tr></thead><tbody>${g.items.map((p) => { const q = Math.max(Math.ceil(p.perDay * 14 - p.stock), p.min * 2 - p.stock, 1); return `<tr data-buy="${p.buy}"><td>${esc(p.name)}</td><td class="num">${p.stock}</td><td class="num"><input class="po-q" type="number" min="0" step="1" value="${q}" aria-label="Quantité de ${esc(p.name)}" style="width:72px;height:34px;border-radius:10px;border:1.5px solid var(--line-2);padding:0 8px;text-align:right;font-weight:700"></td><td class="num">${fmtNum(p.buy)}</td><td class="num"><b data-amt></b></td></tr>`; }).join('')}</tbody></table></div></section>`).join('') + `<div class="gap-box ok" style="background:var(--ink);color:var(--paper)"><span>Total des commandes</span><b id="po-total"></b></div>`;
    }
    const upd = () => {
      let grand = 0;
      $$('.po-group').forEach((g) => { let t = 0; $$('tr[data-buy]', g).forEach((r) => { const a = (+$('.po-q', r).value || 0) * +r.dataset.buy; t += a; $('[data-amt]', r).textContent = fmtNum(a); }); $('[data-gtot]', g).textContent = F(t); grand += t; });
      if ($('#po-total')) $('#po-total').textContent = F(grand);
    };
    $('#po-body').oninput = upd; upd();
    $('#po-send').hidden = !groups.length;
    openModal($('#m-po'));
  });
  $('#po-send').addEventListener('click', () => { const n = $$('.po-group').length; closeModal($('#m-po')); toast(`${n} bon${n > 1 ? 's' : ''} de commande envoyé${n > 1 ? 's' : ''} par WhatsApp`); });

  /* =========================================================
     ARDOISES
     ========================================================= */
  const dDay = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
  function renderSlates() {
    const tot = sum(SLATES.map((s) => s.due));
    $('#a-total').innerHTML = `Total à recouvrer : <b>${F(tot)}</b>`;
    $('#slates').innerHTML = SLATES.slice().sort((a, b) => b.due - a.due).map((s, i) => {
      const r = s.due / s.limit, late = s.due > 0 && s.lastPay > 14;
      const c = r > 0.85 ? '#C0392B' : r > 0.6 ? '#D9622B' : '#2E7D5B';
      return `<li class="slate ${late ? 'is-late' : ''}" style="animation-delay:${i * 0.04}s">
        <div class="slate-top"><span class="av" style="--h:${s.h}">${s.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}</span><div><b>${esc(s.name)}</b><span>${esc(s.note)}</span></div>${late ? '<span class="tag" style="--c:#C0392B;margin-left:auto">Relance</span>' : ''}</div>
        <div class="due"><span class="muted small">Reste dû</span><b class="${s.due ? '' : 'zero'}">${s.due ? F(s.due) : 'Soldé'}</b></div>
        <div class="lim"><span>Plafond ${F(s.limit)} · ${Math.round(r * 100)} % utilisé</span><span class="bar"><i style="--w:${Math.min(100, r * 100)}%;--c:${c}"></i></span></div>
        <ul class="hist">${s.hist.slice(0, 3).map((h) => `<li><span>${dDay.format(h.d)} · ${esc(h.l)}</span><b style="color:${h.a < 0 ? 'var(--green)' : 'inherit'}">${h.a < 0 ? '−' : '+'}${fmtNum(Math.abs(h.a))}</b></li>`).join('')}</ul>
        <div class="acts"><button class="btn soft sm" type="button" data-remind="${s.id}"><svg class="i"><use href="#i-chat"/></svg>Rappel</button><button class="btn primary sm" type="button" data-repay="${s.id}" ${s.due ? '' : 'disabled'}><svg class="i"><use href="#i-check"/></svg>Remboursement</button></div></li>`;
    }).join('');
  }
  let paySlate = null;
  $('#slates').addEventListener('click', (e) => {
    const rem = e.target.closest('[data-remind]');
    if (rem) { const s = SLATES.find((x) => x.id === rem.dataset.remind); toast(`Rappel WhatsApp préparé pour ${s.name}`); return; }
    const rp = e.target.closest('[data-repay]'); if (!rp) return;
    paySlate = SLATES.find((x) => x.id === rp.dataset.repay);
    $('#pay-title').textContent = `Remboursement · ${paySlate.name}`;
    $('#pay-who').innerHTML = `Reste dû : <b style="color:var(--ink)">${F(paySlate.due)}</b>`;
    const f = $('#f-pay'); f.amount.value = paySlate.due; f.amount.max = paySlate.due;
    $('#pay-quick').innerHTML = [...new Set([paySlate.due, Math.round(paySlate.due / 2 / 500) * 500, 5000, 10000].filter((v) => v > 0 && v <= paySlate.due))].map((v, i) => `<button type="button" data-amt="${v}">${i === 0 ? 'Tout solder' : fmtNum(v)}</button>`).join('');
    openModal($('#m-pay'));
  });
  $('#pay-quick').addEventListener('click', (e) => { const b = e.target.closest('[data-amt]'); if (b) $('#f-pay').amount.value = b.dataset.amt; });
  $('#f-pay').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target, a = Math.round(+f.amount.value);
    if (!(a > 0) || a > paySlate.due) { f.amount.setAttribute('aria-invalid', 'true'); f.amount.focus(); return; }
    f.amount.removeAttribute('aria-invalid');
    paySlate.due -= a; paySlate.lastPay = 0; paySlate.hist.unshift({ d: new Date(), l: 'Remboursement', a: -a });
    closeModal($('#m-pay')); renderSlates(); fillCreditClients();
    toast(paySlate.due ? `${F(a)} reçus de ${paySlate.name}` : `Ardoise de ${paySlate.name} soldée`);
  });

  /* =========================================================
     Fenêtres, navigation, toast
     ========================================================= */
  let lastFocus = null;
  function openModal(m) { lastFocus = document.activeElement; m.hidden = false; requestAnimationFrame(() => ($('input:not([type=hidden]), select', m) || $('[data-close]', m) || m).focus()); }
  function closeModal(m) { m.hidden = true; if (lastFocus && document.contains(lastFocus) && lastFocus.offsetParent) lastFocus.focus(); }
  $$('.modal').forEach((m) => m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('[data-close]')) closeModal(m); }));
  document.addEventListener('keydown', (e) => {
    const open = $$('.modal').find((m) => !m.hidden);
    if (e.key === 'Escape') { if (open) closeModal(open); else if ($('#ticket').classList.contains('is-open')) sheet(false); return; }
    if (e.key === 'Tab' && open) {
      const f = $$('button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])', open).filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    }
  });

  const TITLES = { caisse: 'Caisse', ventes: 'Ventes du jour', stock: 'Stock', ardoises: 'Ardoises' };
  const RENDER = { caisse: () => { renderTiles(); renderTicket(); }, ventes: renderSales, stock: renderStock, ardoises: renderSlates };
  function go(v, push = true) {
    if (!TITLES[v]) v = 'caisse';
    $$('.view').forEach((s) => (s.hidden = s.dataset.view !== v));
    $$('.tabs a').forEach((a) => { if (a.dataset.go === v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    $('#view-title').textContent = TITLES[v];
    document.title = `${TITLES[v]} — Baobab, caisse et gestion`;
    RENDER[v]();
    if (push && location.hash !== '#' + v) history.pushState(null, '', '#' + v);
    window.scrollTo({ top: 0 });
  }
  $$('.tabs a').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); go(a.dataset.go); }));
  window.addEventListener('popstate', () => go(location.hash.slice(1), false));

  let tt;
  function toast(msg, icon = 'check') { const t = $('#toast'); t.innerHTML = `<svg class="i"><use href="#i-${icon}"/></svg>${esc(msg)}`; t.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('is-on'), 2600); }

  fillCreditClients(); renderCats(); updateStockBadge();
  go(location.hash.slice(1) || 'caisse', false);
})();
