/* =========================================================
   Pulse Club — petites interactions propres au site
   - [data-billing] : bascule mensuel / annuel des tarifs
   - [data-book]    : réservation d'un créneau (places restantes)
   - [data-bmi]     : calculateur d'IMC
   ========================================================= */
(() => {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const F = (n) => n.toLocaleString('fr-FR') + ' F';

  $$('[data-billing]').forEach((t) => {
    const set = (mode) => {
      t.dataset.mode = mode;
      $$('button', t).forEach((b) => b.setAttribute('aria-pressed', b.dataset.value === mode));
      $$('[data-monthly]').forEach((el) => {
        const m = +el.dataset.monthly;
        el.textContent = F(mode === 'annuel' ? Math.round((m * 0.8) / 500) * 500 : m);
      });
      $$('[data-billing-note]').forEach((el) => (el.hidden = mode !== 'annuel'));
    };
    $$('button', t).forEach((b) => b.addEventListener('click', () => set(b.dataset.value)));
    set(t.dataset.mode || 'mensuel');
  });

  $$('[data-book]').forEach((b) => {
    const spots = b.closest('[data-slot]').querySelector('[data-spots]');
    b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true';
      if (on && +spots.dataset.spots <= 0) return;
      const n = +spots.dataset.spots + (on ? -1 : 1);
      spots.dataset.spots = n;
      spots.textContent = n ? `${n} place${n > 1 ? 's' : ''}` : 'Complet';
      b.setAttribute('aria-pressed', on);
      b.querySelector('span').textContent = on ? 'Réservé ✓' : 'Réserver';
    });
  });

  $$('[data-bmi]').forEach((box) => {
    const h = box.querySelector('[name="taille"]'), w = box.querySelector('[name="poids"]');
    const out = box.querySelector('[data-bmi-value]'), lab = box.querySelector('[data-bmi-label]'), bar = box.querySelector('[data-bmi-bar]');
    const upd = () => {
      const v = +w.value / Math.pow(+h.value / 100, 2);
      out.textContent = v.toFixed(1).replace('.', ',');
      const [t, c] = v < 18.5 ? ['Insuffisance pondérale', 'le programme Prise de masse'] : v < 25 ? ['Corpulence normale', 'le programme Performance'] : v < 30 ? ['Surpoids', 'le programme Remise en forme'] : ['Obésité', 'le programme Santé, accompagné'];
      lab.innerHTML = `<b>${t}</b> — nous vous conseillons ${c}.`;
      bar.style.left = Math.min(100, Math.max(0, ((v - 15) / 25) * 100)) + '%';
    };
    box.addEventListener('input', upd);
    upd();
  });
})();
