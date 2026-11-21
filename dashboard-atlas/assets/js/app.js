/* =========================================================
   Atlas — gestion d'entreprise (PME de conseil et d'ingénierie)
   Données de démonstration générées localement sur 12 mois.
   Pour brancher la vraie comptabilité : remplacez CLIENTS, INVOICES,
   EXPENSES, PROJECTS et TEAM par vos données ; l'interface suit.
   ========================================================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const { fmtNum, compact } = Charts;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const F = (n) => `${fmtNum(n)} FCFA`;
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const ini = (n) => n.replace(/&/g, '').split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  let seed = 2026;
  const rnd = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const DAY = 864e5;
  const now = new Date();
  const today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const daysBetween = (a, b) => Math.round((b - a) / DAY);
  const mIdx = (d) => d.getFullYear() * 12 + d.getMonth();
  const dFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  const dShort = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
  const mFmt = new Intl.DateTimeFormat('fr-FR', { month: 'short' });
  const mLong = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });
  const VAT = 0.18;

  /* ---------- Clients & prestations ---------- */
  const CLIENTS = [
    ['Cacao Prestige SA', 'San-Pédro'], ['Lagunaire Logistique', 'Vridi'], ['Groupe Akwaba Immobilier', 'Cocody'], ['Clinique Les Palmes', 'Marcory'],
    ['Agro-Sud Négoce', 'Bouaké'], ['Restaurant Ébène', 'Cocody'], ['Lagune Lodge', 'Assinie'], ['Pulse Club', 'Marcory'],
    ['École Les Flamboyants', 'Yopougon'], ['Transports Konan & Fils', 'Abobo'],
  ].map(([name, city], i) => ({ id: 'c' + i, name, city, h: (i * 37 + 200) % 360, w: [5, 4, 3, 3, 2.5, 2, 2, 1.5, 1.5, 1][i] }));
  const C = Object.fromEntries(CLIENTS.map((c) => [c.id, c]));
  const SERVICES = [['Développement d\'application web', 2500000], ['Maintenance et support mensuel', 450000], ['Audit de sécurité informatique', 1800000], ['Formation (par journée)', 350000], ['Conseil en organisation (par jour)', 400000], ['Licence logiciel de gestion (annuelle)', 1200000], ['Hébergement et nom de domaine (annuel)', 180000]];
  const pickW = (arr) => { const t = sum(arr.map((a) => a.w)); let r = rnd() * t; for (const a of arr) if ((r -= a.w) <= 0) return a; return arr[0]; };

  /* ---------- Factures (14 mois, pour que les premiers mois affichés aient leurs encaissements) ---------- */
  const INVOICES = [];
  for (let m = 13; m >= 0; m--) {
    const first = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const daysIn = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const n = 6 + Math.floor(rnd() * 3);
    for (let k = 0; k < n; k++) {
      const date = new Date(first.getFullYear(), first.getMonth(), 1 + Math.floor(rnd() * daysIn));
      if (date > today0) continue;
      const lines = [];
      const nl = 1 + Math.floor(rnd() * 3);
      for (let j = 0; j < nl; j++) { const [label, base] = SERVICES[Math.floor(rnd() * SERVICES.length)]; const qty = label.includes('jour') ? 2 + Math.floor(rnd() * 8) : 1; lines.push({ label, qty, pu: Math.round((base * (0.95 + rnd() * 0.8)) / 25000) * 25000 }); }
      const ht = sum(lines.map((l) => l.qty * l.pu));
      const terms = rnd() < 0.6 ? 30 : 45;
      const due = addDays(date, terms);
      const inv = { client: pickW(CLIENTS), date, terms, due, lines, ht, vat: true, ttc: Math.round(ht * (1 + VAT)) };
      const age = daysBetween(date, today0);
      const r = rnd();
      if (age < 3 && r < 0.4) inv.status = 'draft';
      else if (due >= today0) { inv.status = r < 0.35 ? 'paid' : 'sent'; }
      else if (age < 100 && r < 0.14) inv.status = 'sent';
      else inv.status = 'paid';
      if (inv.status === 'paid') { const pd = addDays(date, Math.max(3, Math.round(terms * (0.4 + rnd() * 1.1)))); inv.paidAt = pd > today0 ? addDays(today0, -1) : pd; }
      INVOICES.push(inv);
    }
  }
  INVOICES.sort((a, b) => a.date - b.date);
  const yearCount = {};
  INVOICES.forEach((inv) => { const y = inv.date.getFullYear(); yearCount[y] = (yearCount[y] || 0) + 1; inv.num = `FA-${y}-${String(yearCount[y]).padStart(3, '0')}`; });
  INVOICES.reverse();
  const isLate = (inv) => inv.status === 'sent' && inv.due < today0;
  const st = (inv) => (isLate(inv) ? 'late' : inv.status);
  const STATUS = { draft: ['Brouillon', '#6B7390'], sent: ['Envoyée', '#2F5BFF'], late: ['En retard', '#F0506E'], paid: ['Payée', '#12A594'] };

  /* ---------- Charges ---------- */
  const EXP_CATS = [['Salaires', '#2F5BFF'], ['Charges sociales', '#7C5CFA'], ['Sous-traitance', '#F5B13D'], ['Loyer', '#12A594'], ['Impôts et taxes', '#F0506E'], ['Logiciels et télécoms', '#5BC0EB'], ['Déplacements', '#A0A8C3']];
  const PAYROLL = 13540000; // = somme des salaires de TEAM
  const EXPENSES = []; // { m (index mois), cat, amount }
  for (let m = 11; m >= -3; m--) {
    const idx = mIdx(now) - m;
    const amounts = [PAYROLL, Math.round(PAYROLL * 0.16 / 5000) * 5000, Math.round((900000 + rnd() * 2100000) / 5000) * 5000, 1500000, Math.round((3200000 + rnd() * 1600000) / 5000) * 5000, 470000, Math.round((250000 + rnd() * 450000) / 5000) * 5000];
    amounts.forEach((a, i) => EXPENSES.push({ m: idx, cat: i, amount: a }));
  }

  /* ---------- Trésorerie ---------- */
  const START_BALANCE = 14000000;
  const LOAN = 850000;
  function monthly() {
    const months = [];
    for (let m = 11; m >= 0; m--) months.push(mIdx(now) - m);
    let bal = START_BALANCE;
    return months.map((mi) => {
      const inflow = sum(INVOICES.filter((i) => i.status === 'paid' && mIdx(i.paidAt) === mi).map((i) => i.ttc)) + 350000;
      const outflow = sum(EXPENSES.filter((e) => e.m === mi).map((e) => e.amount)) + LOAN;
      const ratio = mi === mIdx(now) ? Math.min(1, now.getDate() / 28) : 1;
      bal += inflow - outflow * ratio;
      return { mi, inflow, outflow: Math.round(outflow * ratio), bal };
    });
  }
  let scenario = 'central';
  const SCEN = { prudent: 0.75, central: 1, optimiste: 1.18 };

  /* ---------- Projets ---------- */
  const TEAM = [
    ['Yasmine Koné', 'Directrice générale', 'Direction', 2400000, 'Présent', 12, 2014],
    ['Didier Amani', 'Directeur des projets', 'Projets', 1650000, 'En mission', 8, 2016],
    ['Aïssata Bamba', 'Cheffe de projet', 'Projets', 1150000, 'Présent', 15, 2019],
    ['Koffi N\'Guessan', 'Chef de projet', 'Projets', 1100000, 'Télétravail', 4, 2020],
    ['Inès Yao', 'Développeuse senior', 'Technique', 980000, 'Présent', 21, 2018],
    ['Moussa Traoré', 'Développeur', 'Technique', 720000, 'Présent', 18, 2022],
    ['Grâce Kouamé', 'Développeuse', 'Technique', 690000, 'En congé', 2, 2023],
    ['Hervé Gnagne', 'Administrateur systèmes', 'Technique', 850000, 'Présent', 9, 2017],
    ['Estelle Aka', 'Designer UX', 'Technique', 760000, 'Télétravail', 13, 2021],
    ['Arnaud Brou', 'Responsable commercial', 'Commercial', 1250000, 'En mission', 6, 2019],
    ['Fatou Diabaté', 'Chargée d\'affaires', 'Commercial', 640000, 'Présent', 17, 2023],
    ['Christelle Assi', 'Comptable', 'Administration', 780000, 'Présent', 11, 2015],
    ['Wilfried Kacou', 'Assistant administratif', 'Administration', 420000, 'Présent', 20, 2024],
    ['Salimata Cissé', 'Stagiaire développement', 'Technique', 150000, 'Présent', 0, 2026],
  ].map(([name, role, dep, salary, today, leave, since], i) => ({ id: 'e' + i, name, role, dep, salary, today, leave, since, h: (i * 53 + 20) % 360 }));
  const E = Object.fromEntries(TEAM.map((e) => [e.id, e]));
  const COLS = [['todo', 'À démarrer', '#A0A8C3'], ['doing', 'En cours', '#2F5BFF'], ['review', 'En recette', '#F5B13D'], ['done', 'Livré', '#12A594']];
  const PROJECTS = [
    ['Application de réservation', 'c6', 'doing', 6800000, 0.62, 0.55, 24, ['e2', 'e4', 'e8']],
    ['ERP négoce et stocks', 'c4', 'doing', 14500000, 0.71, 0.48, 46, ['e1', 'e5', 'e7']],
    ['Audit sécurité du système', 'c3', 'review', 3200000, 0.88, 0.9, 6, ['e7']],
    ['Site e-commerce et paiements', 'c7', 'doing', 5400000, 0.35, 0.3, 38, ['e3', 'e5', 'e6']],
    ['Formation des équipes', 'c8', 'todo', 1400000, 0, 0, 30, ['e3']],
    ['Refonte de l\'identité visuelle', 'c0', 'review', 2900000, 0.95, 0.85, -2, ['e8', 'e2']],
    ['Tableau de bord logistique', 'c1', 'todo', 4800000, 0.05, 0, 75, ['e1', 'e4']],
    ['Portail parents et élèves', 'c8', 'done', 3900000, 1, 0.97, -20, ['e3', 'e6']],
    ['Migration des serveurs', 'c9', 'done', 2100000, 1, 1.08, -35, ['e7']],
    ['Site vitrine et réservations', 'c5', 'doing', 2600000, 0.5, 0.58, 12, ['e8', 'e5']],
  ].map(([title, client, col, budget, prog, spent, dueIn, team], i) => ({ id: 'p' + i, title, client, col, budget, prog, spent: Math.round(budget * spent), due: addDays(today0, dueIn), team }));
  const LEAVES = [
    { id: 'l1', e: 'e5', from: addDays(today0, 9), to: addDays(today0, 13), type: 'Congés payés', state: 'pending' },
    { id: 'l2', e: 'e10', from: addDays(today0, 2), to: addDays(today0, 2), type: 'Événement familial', state: 'pending' },
    { id: 'l3', e: 'e4', from: addDays(today0, 21), to: addDays(today0, 32), type: 'Congés payés', state: 'pending' },
  ];

  /* =========================================================
     TABLEAU DE BORD
     ========================================================= */
  function renderHome() {
    const M = monthly();
    const cur = M.at(-1), prev = M.at(-2);
    const curHT = sum(INVOICES.filter((i) => i.status !== 'draft' && mIdx(i.date) === mIdx(now)).map((i) => i.ht));
    const prevHT = sum(INVOICES.filter((i) => i.status !== 'draft' && mIdx(i.date) === mIdx(now) - 1).map((i) => i.ht));
    const unpaid = INVOICES.filter((i) => i.status === 'sent');
    const late = unpaid.filter(isLate);
    const y0 = new Date(now.getFullYear(), 0, 1);
    const ytdHT = sum(INVOICES.filter((i) => i.status !== 'draft' && i.date >= y0).map((i) => i.ht));
    const ytdExp = sum(EXPENSES.filter((e) => e.cat !== 4 && e.m >= mIdx(y0) && e.m <= mIdx(now)).map((e) => e.amount)); // TVA reversée exclue
    const res = ytdHT - ytdExp;
    const pctD = (a, b) => { if (!b) return ''; const v = ((a - b) / Math.abs(b)) * 100; return `<b class="${v >= 0 ? 'up' : 'down'}">${v >= 0 ? '+' : '−'}${Math.abs(v).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %</b>`; };
    const K = [
      ['Trésorerie disponible', cur.bal, 'wallet', 'var(--cobalt)', `${pctD(cur.bal, prev.bal)} depuis fin ${mFmt.format(new Date(now.getFullYear(), now.getMonth() - 1, 1)).replace('.', '')}`],
      ['Facturé ce mois (HT)', curHT, 'invoice', 'var(--violet)', `${pctD(curHT, prevHT)} vs mois dernier`],
      ['À encaisser (TTC)', sum(unpaid.map((i) => i.ttc)), 'clock', 'var(--amber)', `dont <b class="down">${compact(sum(late.map((i) => i.ttc)))}</b> en retard (${late.length} factures)`],
      [`Résultat d'exploitation ${now.getFullYear()}`, res, 'scale', 'var(--teal)', `Marge : <b class="${res >= 0 ? 'up' : 'down'}">${ytdHT ? ((res / ytdHT) * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) : 0} %</b> du chiffre d'affaires`],
    ];
    $('#kpis').innerHTML = K.map(([l, v, ic, c, d], i) => `<article class="kpi" style="--c:${c}"><div class="k-top"><span class="k-ic"><svg class="i"><use href="#i-${ic}"/></svg></span><p class="muted small">${l}</p></div><p class="k-v" data-k="${i}">0</p><p class="k-d">${d}</p></article>`).join('');
    K.forEach(([, v], i) => Charts.countUp($(`[data-k="${i}"]`), v, (x) => `${fmtNum(x)}<small>FCFA</small>`));

    // Trésorerie + prévision 3 mois
    const k = SCEN[scenario];
    const avgOut = sum(M.slice(-4, -1).map((m) => m.outflow)) / 3;
    const fore = []; let bal = cur.bal;
    for (let f = 1; f <= 3; f++) {
      const mi = mIdx(now) + f;
      const expected = sum(unpaid.filter((i) => mIdx(i.due) === mi).map((i) => i.ttc)) + (f === 1 ? sum(unpaid.filter(isLate).map((i) => i.ttc)) * (scenario === 'prudent' ? 0.3 : 0.5) : 0);
      const pipeline = 21000000 * k;
      bal += expected + pipeline - avgOut;
      fore.push(Math.round(bal));
    }
    const labels = [...M.map((m) => mFmt.format(new Date(Math.floor(m.mi / 12), m.mi % 12, 1)).replace('.', '')), ...[1, 2, 3].map((f) => mFmt.format(new Date(now.getFullYear(), now.getMonth() + f, 1)).replace('.', ''))];
    const tips = [...M.map((m, i) => cap(mLong.format(new Date(Math.floor(m.mi / 12), m.mi % 12, 1))) + (i === 11 ? ' (en cours)' : '')), ...[1, 2, 3].map((f) => cap(mLong.format(new Date(now.getFullYear(), now.getMonth() + f, 1))) + ' (prévision)')];
    Charts.area($('#ch-cash'), { labels, tipLabels: tips, height: 270, label: 'Trésorerie',
      series: [
        { name: 'Prévision', values: [...Array(11).fill(null), cur.bal, ...fore], color: '#F5B13D', dash: '6 6', width: 2.4 },
        { name: 'Solde réel', values: [...M.map((m) => m.bal), null, null, null], color: '#2F5BFF' },
      ], tipFormat: F });
    const minF = Math.min(...fore);
    const note = $('#cash-note');
    note.className = 'note' + (minF < 10e6 ? ' warn' : '');
    note.textContent = minF < 10e6
      ? `Scénario ${scenario} : la trésorerie descendrait à ${compact(minF)} FCFA. Pensez à relancer les ${late.length} factures en retard.`
      : `Scénario ${scenario} : ${compact(fore[2])} FCFA prévus fin ${mFmt.format(new Date(now.getFullYear(), now.getMonth() + 3, 1)).replace('.', '')}, soit ${(fore[2] / avgOut).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} mois de charges couverts.`;

    Charts.bars($('#ch-flows'), { labels: labels.slice(0, 12), tipLabels: tips.slice(0, 12), height: 240, barWidth: 12, radius: 4,
      series: [{ name: 'Encaissements', values: M.map((m) => m.inflow), color: '#2F5BFF' }, { name: 'Décaissements', values: M.map((m) => m.outflow), color: '#F0506E' }], tipFormat: F, highlight: 11 });

    const lm = mIdx(now) - 1;
    $('#exp-month').textContent = `${cap(mLong.format(new Date(Math.floor(lm / 12), lm % 12, 1)))}, dernier mois complet`;
    Charts.donut($('#ch-exp'), { items: EXP_CATS.map(([label, color], i) => ({ label, color, value: sum(EXPENSES.filter((e) => e.m === lm && e.cat === i).map((e) => e.amount)) })), size: 176, thickness: 22, legend: $('#lg-exp'), centerLabel: 'FCFA de charges', format: compact });

    renderAgenda(unpaid);

    const byClient = new Map();
    for (const i of unpaid) { const e = byClient.get(i.client) || { total: 0, late: 0 }; e.total += i.ttc; if (isLate(i)) e.late = Math.max(e.late, daysBetween(i.due, today0)); byClient.set(i.client, e); }
    $('#debtors').innerHTML = [...byClient].sort((a, b) => b[1].total - a[1].total).slice(0, 5).map(([c, e]) => `<li><span class="avatar" style="--h:${c.h}">${ini(c.name)}</span><div><p>${esc(c.name)}</p><small>${c.city}</small></div><b>${F(e.total)}${e.late ? `<span class="late">retard max. ${e.late} j</span>` : ''}</b></li>`).join('') || '<li class="muted">Aucune facture en attente.</li>';
    $('#mini-projects').innerHTML = PROJECTS.filter((p) => p.col === 'doing' || p.col === 'review').slice(0, 5).map((p) => { const over = p.spent > p.budget * p.prog + p.budget * 0.08; return `<li><div class="top-line"><div><p>${esc(p.title)}</p><small>${esc(C[p.client].name)} · ${Math.round(p.prog * 100)} % réalisé</small></div><small style="color:${over ? 'var(--rose)' : 'var(--muted)'};font-weight:700">${Math.round((p.spent / p.budget) * 100)} % du budget</small></div><div class="progress" style="--c:${over ? 'var(--rose)' : 'var(--cobalt)'}"><i class="budget" style="--w:${Math.min(100, (p.spent / p.budget) * 100)}%"></i><i style="--w:${p.prog * 100}%"></i></div></li>`; }).join('');
  }
  function renderAgenda(unpaid) {
    const ev = [];
    const nextDay = (dom, label, amount) => { for (let k = 0; k < 2; k++) { const d = new Date(now.getFullYear(), now.getMonth() + k, dom); if (d >= today0 && daysBetween(today0, d) <= 30) ev.push({ d, label, amount }); } };
    const lastM = mIdx(now) - 1;
    nextDay(5, 'Loyer des bureaux', -1500000);
    nextDay(10, 'Échéance du prêt bancaire', -LOAN);
    nextDay(15, 'Déclaration et paiement de la TVA', -Math.round(sum(INVOICES.filter((i) => mIdx(i.date) === lastM && i.status !== 'draft').map((i) => i.ht)) * VAT * 0.8));
    nextDay(15, 'Cotisations sociales (CNPS)', -Math.round(PAYROLL * 0.16 / 5000) * 5000);
    nextDay(28, 'Virement des salaires', -PAYROLL);
    unpaid.filter((i) => i.due >= today0 && daysBetween(today0, i.due) <= 30).forEach((i) => ev.push({ d: i.due, label: `Règlement attendu · ${i.client.name}`, amount: i.ttc, sub: i.num }));
    ev.sort((a, b) => a.d - b.d);
    $('#agenda').innerHTML = ev.slice(0, 7).map((e) => { const dd = daysBetween(today0, e.d); return `<li class="${dd <= 5 && e.amount < 0 ? 'soon' : ''}"><span class="day"><b>${e.d.getDate()}</b><span>${mFmt.format(e.d).replace('.', '')}</span></span><div><p>${esc(e.label)}</p><small>${dd === 0 ? "Aujourd'hui" : dd === 1 ? 'Demain' : `Dans ${dd} jours`}${e.sub ? ' · ' + e.sub : ''}</small></div><span class="amt" style="color:${e.amount < 0 ? 'var(--rose)' : 'var(--teal)'}">${e.amount < 0 ? '−' : '+'}${compact(Math.abs(e.amount))}</span></li>`; }).join('');
  }
  $('#scenario').addEventListener('click', (e) => { const b = e.target.closest('[data-s]'); if (!b) return; scenario = b.dataset.s; $$('#scenario [data-s]').forEach((x) => x.setAttribute('aria-checked', String(x === b))); renderHome(); });

  function renderFY() {
    const y0 = new Date(now.getFullYear(), 0, 1);
    const ytd = sum(INVOICES.filter((i) => i.status !== 'draft' && i.date >= y0).map((i) => i.ht));
    const goal = 340e6;
    $('#fy-val').textContent = `${compact(ytd)} / ${compact(goal)} FCFA`;
    requestAnimationFrame(() => { $('#fy-bar').style.width = Math.min(100, (ytd / goal) * 100) + '%'; });
    $('.side-foot .eyebrow').textContent = `Exercice ${now.getFullYear()}`;
  }

  /* =========================================================
     FACTURES
     ========================================================= */
  let iTab = 'all', iQ = '';
  const TABS = [['all', 'Toutes'], ['draft', 'Brouillons'], ['sent', 'Envoyées'], ['late', 'En retard'], ['paid', 'Payées']];
  function renderInvoices() {
    const open = INVOICES.filter((i) => i.status === 'sent');
    const buckets = [['Non échues', (i) => !isLate(i), '#2F5BFF'], ['Retard 1 à 30 jours', (i) => isLate(i) && daysBetween(i.due, today0) <= 30, '#F5B13D'], ['Retard 31 à 60 jours', (i) => isLate(i) && daysBetween(i.due, today0) > 30 && daysBetween(i.due, today0) <= 60, '#F08A4B'], ['Retard de plus de 60 jours', (i) => isLate(i) && daysBetween(i.due, today0) > 60, '#F0506E']]
      .map(([l, f, c]) => { const list = open.filter(f); return { l, c, n: list.length, v: sum(list.map((i) => i.ttc)) }; });
    const maxB = Math.max(1, ...buckets.map((b) => b.v));
    $('#aging').innerHTML = buckets.map((b) => `<div><span>${b.l} · ${b.n} facture${b.n > 1 ? 's' : ''}</span><b>${F(b.v)}</b><i class="bar" style="--c:${b.c};--w:${(b.v / maxB) * 100}%"></i></div>`).join('');
    const counts = { all: INVOICES.length }; INVOICES.forEach((i) => { counts[st(i)] = (counts[st(i)] || 0) + 1; }); counts.sent = (counts.sent || 0) + (counts.late || 0);
    $('#i-tabs').innerHTML = TABS.map(([k, l]) => `<button type="button" role="tab" data-t="${k}" aria-selected="${iTab === k}" class="${k === 'late' ? 'late' : ''}">${l}<b>${counts[k] || 0}</b></button>`).join('');
    const q = norm(iQ.trim());
    const list = INVOICES.filter((i) => (iTab === 'all' || (iTab === 'sent' ? i.status === 'sent' : st(i) === iTab)) && (!q || norm(i.num).includes(q) || norm(i.client.name).includes(q)));
    $('#i-table').innerHTML = `<thead><tr><th scope="col">Facture</th><th scope="col">Client</th><th scope="col">Émise le</th><th scope="col">Échéance</th><th scope="col" class="num">Montant TTC</th><th scope="col">Statut</th><th scope="col" class="num"><span class="sr">Actions</span></th></tr></thead>
      <tbody>${list.map((i) => { const s = st(i), late = s === 'late' ? daysBetween(i.due, today0) : 0;
        const acts = i.status === 'draft' ? `<button class="btn primary sm" type="button" data-send="${i.num}"><svg class="i"><use href="#i-send"/></svg>Envoyer</button>`
          : i.status === 'sent' ? `<button class="btn ghost sm" type="button" data-remind="${i.num}">Relancer</button><button class="btn ok sm" type="button" data-paid="${i.num}"><svg class="i"><use href="#i-check"/></svg>Encaissée</button>`
          : `<span class="muted small">Réglée le ${dShort.format(i.paidAt)}</span>`;
        return `<tr class="${i.isNew ? 'is-new' : ''}"><td><span class="ref">${i.num}</span><br><span class="muted small">${i.lines.length} ligne${i.lines.length > 1 ? 's' : ''}</span></td><td><div class="who"><span class="avatar sm" style="--h:${i.client.h}">${ini(i.client.name)}</span><div><b>${esc(i.client.name)}</b><span>${i.client.city}</span></div></div></td><td>${dFmt.format(i.date)}</td><td>${dFmt.format(i.due)}${late ? `<span class="days-late">${late} jour${late > 1 ? 's' : ''} de retard</span>` : ''}</td><td class="num"><b>${F(i.ttc)}</b><br><span class="muted small">${fmtNum(i.ht)} HT</span></td><td><span class="status" style="--c:${STATUS[s][1]}">${STATUS[s][0]}</span></td><td><div class="acts">${acts}</div></td></tr>`; }).join('') || '<tr><td colspan="7" class="muted" style="text-align:center;padding:36px">Aucune facture ne correspond.</td></tr>'}</tbody>`;
    const nLate = INVOICES.filter(isLate).length; $('#nav-late').textContent = nLate || '';
  }
  $('#i-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-t]'); if (!b) return; iTab = b.dataset.t; renderInvoices(); });
  $('#i-table').addEventListener('click', (e) => {
    const find = (n) => INVOICES.find((i) => i.num === n);
    const s = e.target.closest('[data-send]'), r = e.target.closest('[data-remind]'), p = e.target.closest('[data-paid]');
    if (s) { const i = find(s.dataset.send); i.status = 'sent'; i.date = today0; i.due = addDays(today0, i.terms); renderInvoices(); toast(`${i.num} envoyée à ${i.client.name}`); }
    if (r) { const i = find(r.dataset.remind); toast(`Relance envoyée à ${i.client.name} pour ${i.num}`); }
    if (p) { const i = find(p.dataset.paid); i.status = 'paid'; i.paidAt = today0; renderInvoices(); renderFY(); toast(`${F(i.ttc)} encaissés · ${i.num}`); }
  });
  $('#q').addEventListener('input', (e) => { iQ = e.target.value; if (current !== 'factures') go('factures'); else renderInvoices(); });

  /* Nouvelle facture */
  const fi = $('#f-inv');
  fi.client.innerHTML = '<option value="">Choisir un client…</option>' + CLIENTS.map((c) => `<option value="${c.id}">${esc(c.name)} · ${c.city}</option>`).join('');
  const dl = document.createElement('datalist'); dl.id = 'services'; dl.innerHTML = SERVICES.map(([l]) => `<option value="${esc(l)}">`).join(''); document.body.appendChild(dl);
  const lineTpl = (l = {}) => `<li><input name="label" list="services" placeholder="Désignation de la prestation" value="${esc(l.label || '')}" aria-label="Désignation"><input name="qty" type="number" min="1" step="1" value="${l.qty || 1}" aria-label="Quantité"><input name="pu" type="number" min="0" step="5000" value="${l.pu || ''}" placeholder="0" aria-label="Prix unitaire HT"><button class="del" type="button" aria-label="Supprimer la ligne"><svg class="i"><use href="#i-trash"/></svg></button></li>`;
  const nextNum = () => { const y = now.getFullYear(); const n = INVOICES.filter((i) => i.num.startsWith(`FA-${y}`)).length + 1; return `FA-${y}-${String(n).padStart(3, '0')}`; };
  const readLines = () => $$('#inv-lines li').map((li) => ({ label: li.querySelector('[name=label]').value.trim(), qty: Math.max(1, Math.round(+li.querySelector('[name=qty]').value || 1)), pu: Math.max(0, Math.round(+li.querySelector('[name=pu]').value || 0)) }));
  function preview() {
    const c = C[fi.client.value];
    const lines = readLines().filter((l) => l.label || l.pu);
    const ht = sum(lines.map((l) => l.qty * l.pu)), vat = fi.vat.checked ? Math.round(ht * VAT) : 0;
    const date = fi.date.value ? new Date(fi.date.value + 'T00:00') : today0;
    $('#inv-paper').innerHTML = `<div class="ph"><div><b>Atlas SARL</b><div class="muted">Conseil &amp; Ingénierie<br>Immeuble Alpha, Plateau · Abidjan</div></div><div class="pt">FACTURE<div class="muted" style="font-size:11px;font-weight:600;color:var(--muted)">${nextNum()}</div></div></div>
      <div class="pp"><div><span>Facturé à</span><br><b>${c ? esc(c.name) : '—'}</b><br>${c ? c.city + ', Côte d\'Ivoire' : ''}</div><div><span>Émise le</span> ${dFmt.format(date)}<br><span>Échéance</span> ${dFmt.format(addDays(date, +fi.terms.value))}</div></div>
      <table><thead><tr><th>Désignation</th><th class="num">Qté</th><th class="num">P.U. HT</th><th class="num">Total HT</th></tr></thead><tbody>${lines.length ? lines.map((l) => `<tr><td>${esc(l.label || '—')}</td><td class="num">${l.qty}</td><td class="num">${fmtNum(l.pu)}</td><td class="num">${fmtNum(l.qty * l.pu)}</td></tr>`).join('') : '<tr><td colspan="4" class="muted">Ajoutez une prestation…</td></tr>'}</tbody></table>
      <div class="tt"><div><span>Total HT</span><span>${fmtNum(ht)}</span></div><div><span>TVA ${fi.vat.checked ? '18 %' : '(non applicable)'}</span><span>${fmtNum(vat)}</span></div><div class="grand"><span>Total TTC</span><span>${F(ht + vat)}</span></div></div>
      <p class="foot">Paiement par virement ou mobile money. RCCM CI-ABJ-00-0000-B00-00000 · CC 0000000 A · Exemple de facture fictive.</p>`;
    return { c, lines, ht, vat, date };
  }
  function openInvoice() {
    fi.reset(); $('#inv-err').textContent = '';
    fi.date.value = `${today0.getFullYear()}-${String(today0.getMonth() + 1).padStart(2, '0')}-${String(today0.getDate()).padStart(2, '0')}`;
    $('#inv-lines').innerHTML = lineTpl();
    $('#inv-num').textContent = `Facture ${nextNum()}`;
    preview(); openModal($('#m-invoice'));
  }
  $$('[data-new-invoice]').forEach((b) => b.addEventListener('click', openInvoice));
  $('#add-line').addEventListener('click', () => { $('#inv-lines').insertAdjacentHTML('beforeend', lineTpl()); $('#inv-lines li:last-child input').focus(); preview(); });
  $('#inv-lines').addEventListener('click', (e) => { const d = e.target.closest('.del'); if (!d) return; if ($$('#inv-lines li').length > 1) d.closest('li').remove(); else d.closest('li').querySelectorAll('input').forEach((i) => (i.value = i.name === 'qty' ? 1 : '')); preview(); });
  $('#inv-lines').addEventListener('input', (e) => { if (e.target.name !== 'label') return; const s = SERVICES.find(([l]) => l === e.target.value); const pu = e.target.closest('li').querySelector('[name=pu]'); if (s && !pu.value) { pu.value = s[1]; preview(); } });
  fi.addEventListener('input', (e) => { e.target.removeAttribute?.('aria-invalid'); $('#inv-err').textContent = ''; preview(); });
  fi.addEventListener('change', (e) => { e.target.removeAttribute?.('aria-invalid'); preview(); });
  fi.addEventListener('submit', (e) => {
    e.preventDefault();
    const mode = e.submitter?.dataset.mode || 'send';
    const { c, lines, ht, vat, date } = preview();
    const okLines = lines.filter((l) => l.label && l.pu > 0);
    fi.client.setAttribute('aria-invalid', String(!c));
    $$('#inv-lines li').forEach((li) => { const lb = li.querySelector('[name=label]'), pu = li.querySelector('[name=pu]'); const any = lb.value || pu.value; lb.setAttribute('aria-invalid', String(!!any && !lb.value.trim())); pu.setAttribute('aria-invalid', String(!!any && !(+pu.value > 0))); });
    if (!c || !okLines.length || okLines.length !== lines.length) { $('#inv-err').textContent = !c ? 'Choisissez un client.' : 'Chaque ligne doit avoir une désignation et un prix.'; (!c ? fi.client : $('#inv-lines [aria-invalid="true"]') || $('#inv-lines input'))?.focus(); return; }
    const inv = { num: nextNum(), client: c, date, terms: +fi.terms.value, due: addDays(date, +fi.terms.value), lines: okLines, ht, vat: fi.vat.checked, ttc: ht + vat, status: mode === 'draft' ? 'draft' : 'sent', isNew: true };
    INVOICES.unshift(inv);
    closeModal($('#m-invoice'));
    iTab = 'all'; iQ = ''; $('#q').value = '';
    go('factures'); renderFY();
    toast(mode === 'draft' ? `${inv.num} enregistrée en brouillon` : `${inv.num} envoyée à ${c.name} · ${F(inv.ttc)}`);
  });

  /* =========================================================
     PROJETS (kanban)
     ========================================================= */
  function renderBoard() {
    $('#board').innerHTML = COLS.map(([k, l, c], ci) => { const list = PROJECTS.filter((p) => p.col === k); return `<section class="col" data-col="${k}" style="--c:${c}" aria-label="${l}"><header class="col-head"><h2>${l}</h2><span>${list.length} · ${compact(sum(list.map((p) => p.budget)))}</span></header>
      ${list.map((p) => { const dd = daysBetween(today0, p.due), late = dd < 0 && k !== 'done', over = p.spent > p.budget;
        return `<article class="pcard" draggable="true" data-p="${p.id}" tabindex="0" aria-label="${esc(p.title)}, ${esc(C[p.client].name)}">
          <div class="pc-top"><div><h3>${esc(p.title)}</h3><p class="client">${esc(C[p.client].name)}</p></div><svg class="i grip" aria-hidden="true"><use href="#i-grip"/></svg></div>
          <div class="progress" style="--c:${c}"><i style="--w:${p.prog * 100}%"></i></div>
          <div class="budget"><span>${Math.round(p.prog * 100)} % réalisé</span><span>Budget <b class="${over ? 'over' : ''}">${compact(p.spent)} / ${compact(p.budget)}</b></span></div>
          <div class="pc-foot"><span class="due ${late ? 'late' : ''}"><svg class="i"><use href="#i-cal"/></svg>${k === 'done' ? 'Livré' : late ? `${-dd} j de retard` : dShort.format(p.due)}</span>
            <div class="avatars">${p.team.map((id) => `<span class="avatar sm" style="--h:${E[id].h}" title="${esc(E[id].name)}">${ini(E[id].name)}</span>`).join('')}</div>
            <div class="move"><button type="button" data-mv="-1" ${ci === 0 ? 'disabled' : ''} aria-label="Déplacer vers ${ci ? COLS[ci - 1][1] : ''}"><svg class="i"><use href="#i-left"/></svg></button><button type="button" data-mv="1" ${ci === COLS.length - 1 ? 'disabled' : ''} aria-label="Déplacer vers ${COLS[ci + 1]?.[1] || ''}"><svg class="i"><use href="#i-right"/></svg></button></div></div>
        </article>`; }).join('')}</section>`; }).join('');
  }
  function moveProject(id, col) {
    const p = PROJECTS.find((x) => x.id === id); if (!p || p.col === col) return;
    p.col = col; if (col === 'done') p.prog = 1; if (col === 'doing' && p.prog === 0) p.prog = 0.05;
    renderBoard(); $(`[data-p="${id}"]`)?.focus();
    toast(`« ${p.title} » → ${COLS.find((c) => c[0] === col)[1]}`);
  }
  let dragId = null;
  const board = $('#board');
  board.addEventListener('dragstart', (e) => { const c = e.target.closest('.pcard'); if (!c) return; dragId = c.dataset.p; c.classList.add('is-drag'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragId); });
  board.addEventListener('dragend', () => { $$('.pcard.is-drag, .col.is-over').forEach((x) => x.classList.remove('is-drag', 'is-over')); });
  board.addEventListener('dragover', (e) => { const col = e.target.closest('.col'); if (!col || !dragId) return; e.preventDefault(); $$('.col.is-over').forEach((x) => x !== col && x.classList.remove('is-over')); col.classList.add('is-over'); });
  board.addEventListener('drop', (e) => { const col = e.target.closest('.col'); if (!col || !dragId) return; e.preventDefault(); const id = dragId; dragId = null; moveProject(id, col.dataset.col); });
  board.addEventListener('click', (e) => { const b = e.target.closest('[data-mv]'); if (!b) return; const p = PROJECTS.find((x) => x.id === b.closest('.pcard').dataset.p); const ci = COLS.findIndex((c) => c[0] === p.col) + +b.dataset.mv; if (COLS[ci]) moveProject(p.id, COLS[ci][0]); });
  const fp = $('#f-proj');
  fp.client.innerHTML = CLIENTS.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
  fp.lead.innerHTML = TEAM.filter((e) => ['Projets', 'Direction'].includes(e.dep)).map((e) => `<option value="${e.id}">${esc(e.name)}</option>`).join('');
  $('#p-new').addEventListener('click', () => { fp.reset(); const d = addDays(today0, 45); fp.due.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; openModal($('#m-project')); });
  fp.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = [fp.title, fp.budget, fp.due].filter((f) => !f.value.trim() || !f.checkValidity());
    [fp.title, fp.budget, fp.due].forEach((f) => f.setAttribute('aria-invalid', String(bad.includes(f))));
    if (bad.length) { bad[0].focus(); return; }
    PROJECTS.unshift({ id: 'p' + Date.now(), title: fp.title.value.trim(), client: fp.client.value, col: 'todo', budget: +fp.budget.value, prog: 0, spent: 0, due: new Date(fp.due.value + 'T00:00'), team: [fp.lead.value] });
    closeModal($('#m-project')); renderBoard(); toast('Projet créé dans « À démarrer »');
  });

  /* =========================================================
     ÉQUIPE
     ========================================================= */
  let dep = 'Tous';
  const PRES = { Présent: '#12A594', Télétravail: '#2F5BFF', 'En mission': '#7C5CFA', 'En congé': '#F5B13D' };
  function renderTeam() {
    const present = TEAM.filter((e) => e.today === 'Présent' || e.today === 'Télétravail').length;
    const off = TEAM.filter((e) => e.today === 'En congé').length;
    const mass = sum(TEAM.map((e) => e.salary));
    $('#t-kpis').innerHTML = [
      ['Effectif', TEAM.length, 'team', 'var(--cobalt)', `${TEAM.filter((e) => e.since >= now.getFullYear() - 1).length} arrivées depuis l'an dernier`],
      ["Au travail aujourd'hui", present, 'check', 'var(--teal)', `dont ${TEAM.filter((e) => e.today === 'Télétravail').length} en télétravail`],
      ['En congé ou en mission', TEAM.length - present, 'cal', 'var(--amber)', `${off} en congé`],
      ['Masse salariale brute', mass, 'wallet', 'var(--violet)', 'par mois, hors charges patronales'],
    ].map(([l, v, ic, c, d], i) => `<article class="kpi" style="--c:${c}"><div class="k-top"><span class="k-ic"><svg class="i"><use href="#i-${ic}"/></svg></span><p class="muted small">${l}</p></div><p class="k-v">${i === 3 ? `${fmtNum(v)}<small>FCFA</small>` : v}</p><p class="k-d">${d}</p></article>`).join('');
    $('#t-today').textContent = cap(new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(now));
    const deps = ['Tous', ...new Set(TEAM.map((e) => e.dep))];
    $('#t-dep').innerHTML = deps.map((d) => `<button type="button" data-dep="${d}" aria-pressed="${dep === d}">${d}</button>`).join('');
    const list = TEAM.filter((e) => dep === 'Tous' || e.dep === dep);
    $('#t-table').innerHTML = `<thead><tr><th scope="col">Collaborateur</th><th scope="col">Département</th><th scope="col">Aujourd'hui</th><th scope="col" class="num">Congés restants</th><th scope="col" class="num">Ancienneté</th></tr></thead>
      <tbody>${list.map((e) => { const y = now.getFullYear() - e.since; return `<tr><td><div class="who"><span class="avatar sm" style="--h:${e.h}">${ini(e.name)}</span><div><b>${esc(e.name)}</b><span>${esc(e.role)}</span></div></div></td><td>${e.dep}</td><td><span class="presence" style="--c:${PRES[e.today]}">${e.today}</span></td><td class="num">${e.leave} j</td><td class="num">${y < 1 ? 'Nouveau' : `${y} an${y > 1 ? 's' : ''}`}</td></tr>`; }).join('')}</tbody>`;
    const byDep = deps.slice(1).map((d) => ({ d, v: sum(TEAM.filter((e) => e.dep === d).map((e) => e.salary)), n: TEAM.filter((e) => e.dep === d).length })).sort((a, b) => b.v - a.v);
    const colors = ['#2F5BFF', '#7C5CFA', '#12A594', '#F5B13D', '#F0506E'];
    $('#payroll').innerHTML = byDep.map((x, i) => `<li><span>${x.d} <span class="muted small">· ${x.n} pers.</span></span><b>${compact(x.v)}</b><span class="progress" style="--c:${colors[i]}"><i style="--w:${(x.v / byDep[0].v) * 100}%"></i></span></li>`).join('');
    renderLeaves();
  }
  function renderLeaves() {
    const range = (l) => (+l.from === +l.to ? `le ${dShort.format(l.from)}` : `du ${dShort.format(l.from)} au ${dShort.format(l.to)}`);
    const days = (l) => { let n = 0; for (let d = new Date(l.from); d <= l.to; d = addDays(d, 1)) if (d.getDay() % 6) n++; return n; };
    $('#leaves').innerHTML = LEAVES.map((l) => { const e = E[l.e]; return `<li><div class="lt"><span class="avatar" style="--h:${e.h}">${ini(e.name)}</span><div><p>${esc(e.name)}</p><small>${l.type} · ${days(l)} jour${days(l) > 1 ? 's' : ''} ${range(l)}</small></div></div>
      ${l.state === 'pending' ? `<div class="la"><button class="btn no sm" type="button" data-leave="${l.id}" data-ok="0">Refuser</button><button class="btn ok sm" type="button" data-leave="${l.id}" data-ok="1"><svg class="i"><use href="#i-check"/></svg>Valider</button></div>` : `<p class="done" style="color:${l.state === 'ok' ? 'var(--teal)' : 'var(--rose)'}">${l.state === 'ok' ? 'Validée, le collaborateur est prévenu' : 'Refusée'}</p>`}</li>`; }).join('');
    const n = LEAVES.filter((l) => l.state === 'pending').length; $('#nav-leave').textContent = n || '';
  }
  $('#t-dep').addEventListener('click', (e) => { const b = e.target.closest('[data-dep]'); if (!b) return; dep = b.dataset.dep; renderTeam(); });
  $('#leaves').addEventListener('click', (e) => {
    const b = e.target.closest('[data-leave]'); if (!b) return;
    const l = LEAVES.find((x) => x.id === b.dataset.leave); l.state = b.dataset.ok === '1' ? 'ok' : 'no';
    if (l.state === 'ok') E[l.e].leave = Math.max(0, E[l.e].leave - Math.max(1, daysBetween(l.from, l.to) + 1));
    renderTeam(); toast(l.state === 'ok' ? `Congé de ${E[l.e].name} validé` : `Demande de ${E[l.e].name} refusée`);
  });

  /* =========================================================
     Fenêtres, menu, navigation, toast
     ========================================================= */
  let lastFocus = null;
  function openModal(m) { lastFocus = document.activeElement; m.hidden = false; document.body.style.overflow = 'hidden'; requestAnimationFrame(() => ($('select, input', m) || m).focus()); }
  function closeModal(m) { m.hidden = true; document.body.style.overflow = ''; if (lastFocus && document.contains(lastFocus) && lastFocus.offsetParent) lastFocus.focus(); }
  $$('.modal').forEach((m) => m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('[data-close]')) closeModal(m); }));
  document.addEventListener('keydown', (e) => {
    const open = $$('.modal').find((m) => !m.hidden);
    if (e.key === 'Escape') { if (open) closeModal(open); else side(false); return; }
    if (e.key === 'Tab' && open) {
      const f = $$('button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])', open).filter((x) => x.offsetParent !== null);
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    }
    if (e.target.matches('.pcard') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { const p = PROJECTS.find((x) => x.id === e.target.dataset.p); const ci = COLS.findIndex((c) => c[0] === p.col) + (e.key === 'ArrowRight' ? 1 : -1); if (COLS[ci]) moveProject(p.id, COLS[ci][0]); }
  });
  function side(on) { $('#side').classList.toggle('is-open', on); $('.scrim').classList.toggle('is-on', on); $('[data-open-side]').setAttribute('aria-expanded', String(on)); if (on) $('#side a').focus(); }
  $('[data-open-side]').addEventListener('click', () => side(true));
  $('[data-close-side]').addEventListener('click', () => side(false));

  const TITLES = { accueil: 'Tableau de bord', factures: 'Factures', projets: 'Projets', equipe: 'Équipe' };
  const RENDER = { accueil: renderHome, factures: renderInvoices, projets: renderBoard, equipe: renderTeam };
  let current = '';
  function go(v, push = true) {
    if (!TITLES[v]) v = 'accueil';
    current = v;
    $$('.view').forEach((s) => (s.hidden = s.dataset.view !== v));
    $$('.nav a').forEach((a) => { if (a.dataset.go === v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    $('#view-title').textContent = TITLES[v];
    document.title = `${TITLES[v]} — Atlas, gestion d'entreprise`;
    RENDER[v]();
    if (push && location.hash !== '#' + v) history.pushState(null, '', '#' + v);
    side(false);
    window.scrollTo({ top: 0 });
  }
  document.addEventListener('click', (e) => { const a = e.target.closest('a[data-go]'); if (!a) return; e.preventDefault(); go(a.dataset.go); });
  window.addEventListener('popstate', () => go(location.hash.slice(1), false));

  let tt;
  function toast(msg) { const t = $('#toast'); t.innerHTML = `<svg class="i"><use href="#i-check"/></svg>${esc(msg)}`; t.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('is-on'), 2600); }

  renderFY(); renderInvoices(); renderLeaves();
  go(location.hash.slice(1) || 'accueil', false);
})();
