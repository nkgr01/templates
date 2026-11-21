/* =========================================================
   Lagune Lodge — calcul du séjour en direct
   - [data-stay] : formulaire de réservation (dates, voyageurs, chambre,
     options) → nombre de nuits, sous-totaux et total ([data-stay-*])
   - pré-remplissage depuis l'URL (barre de réservation de l'accueil)
   ========================================================= */
(() => {
  const F = (n) => n.toLocaleString('fr-FR') + ' F';
  const form = document.querySelector('[data-stay]');
  if (!form) return;
  const q = new URLSearchParams(location.search);
  const $ = (s) => form.querySelector(s);
  const arr = $('[name="arrivee"]'), dep = $('[name="depart"]'), guests = $('[name="voyageurs"]');
  const today = new Date(); const iso = (d) => d.toISOString().slice(0, 10);
  arr.min = iso(today);
  ['arrivee', 'depart', 'voyageurs'].forEach((k) => { if (q.get(k)) form.elements[k].value = q.get(k); });
  if (q.get('chambre')) { const r = form.querySelector(`[name="chambre"][value="${q.get('chambre')}"]`); if (r) r.checked = true; }
  if (!arr.value) { const a = new Date(today); a.setDate(a.getDate() + 14); arr.value = iso(a); }
  if (!dep.value || dep.value <= arr.value) { const d = new Date(arr.value); d.setDate(d.getDate() + 3); dep.value = iso(d); }

  const out = (k, v) => document.querySelectorAll(`[data-stay-${k}]`).forEach((el) => (el.textContent = v));
  const update = () => {
    dep.min = arr.value;
    if (dep.value <= arr.value) { const d = new Date(arr.value); d.setDate(d.getDate() + 1); dep.value = iso(d); }
    const nights = Math.max(1, Math.round((new Date(dep.value) - new Date(arr.value)) / 864e5));
    const room = form.querySelector('[name="chambre"]:checked');
    const price = room ? +room.dataset.price : 0;
    const cap = room ? +room.dataset.capacity : 2;
    const g = +guests.value;
    const warn = document.querySelector('[data-stay-warning]');
    if (warn) warn.hidden = g <= cap;
    let extras = 0;
    form.querySelectorAll('[name="options"]:checked').forEach((o) => { extras += +o.dataset.price * (o.dataset.per === 'nuit' ? nights : o.dataset.per === 'personne' ? g : 1); });
    const lodging = price * nights;
    out('nights', `${nights} nuit${nights > 1 ? 's' : ''}`);
    out('room', room ? room.dataset.name : '—');
    out('lodging', F(lodging));
    out('extras', F(extras));
    out('total', F(lodging + extras));
    out('deposit', F(Math.round((lodging + extras) * 0.3)));
  };
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();
})();
