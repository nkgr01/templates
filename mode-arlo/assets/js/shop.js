/* =========================================================
   shop.js — briques e-commerce communes aux templates « Boutiques »
   (identique dans les 3 sites, sans dépendance ; utilise Motion s'il est chargé)

   - Panier latéral        : [data-cart], [data-cart-open], [data-cart-count]
   - Ajout au panier       : [data-add] dans un conteneur [data-product]
                             (data-id, data-name, data-price, data-img)
   - Ajout rapide (carte)  : [data-quick] → ajoute, ou ouvre la fiche s'il faut une taille
   - Favoris               : [data-wish] (+ [data-wish-count])
   - Options produit       : radios dans [data-product] (couleur / taille) + [data-opt-label]
   - Composeur de coffret  : [data-box] (cases [data-box-item] avec data-price)
   - Configurateur         : [data-config] data-base (radios avec data-extra) + [data-config-price]
   Le panier est gardé dans le navigateur du visiteur (localStorage), c'est une démo :
   branchez [data-checkout] sur Shopify, Stripe Checkout, WooCommerce… en production.
   ========================================================= */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const KEY = 'shop-' + (document.body.dataset.shop || 'demo');
  const FREE = +(document.body.dataset.freeShipping || 0);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const M = () => (!reduce && window.Motion) || null;
  const eur = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + ' €';

  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* navigation privée */ } };
  let cart = load(KEY + '-cart', []);
  let wish = new Set(load(KEY + '-wish', []));

  /* ---------- Toast ---------- */
  const toast = document.createElement('div');
  toast.className = 'shop-toast'; toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite');
  document.body.append(toast);
  let tt;
  const say = (msg) => { toast.textContent = msg; toast.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('is-on'), 2800); };

  /* ---------- Panier ---------- */
  const drawer = $('[data-cart]');
  const list = drawer && $('[data-cart-items]', drawer);
  let lastFocus = null;

  function render() {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    const total = cart.reduce((s, i) => s + i.qty * i.price, 0);
    $$('[data-cart-count]').forEach((b) => { b.textContent = count; b.hidden = !count; });
    if (!drawer) return;
    $('[data-cart-total]', drawer).textContent = eur(total);
    $('[data-cart-empty]', drawer).hidden = !!count;
    $('[data-cart-footer]', drawer).hidden = !count;
    const bar = $('[data-free-bar]', drawer), msg = $('[data-free-msg]', drawer);
    if (FREE && bar) {
      bar.style.transform = `scaleX(${Math.min(1, total / FREE)})`;
      msg.textContent = total >= FREE ? 'Livraison offerte 🎉' : `Plus que ${eur(Math.ceil((FREE - total) * 100) / 100)} pour la livraison offerte`;
    }
    list.innerHTML = cart.map((i, n) => `<li class="cart-line" data-line="${n}">
        <img src="${i.img}" alt="" width="80" height="100" class="cart-thumb">
        <div class="min-w-0 flex-1">
          <p class="cart-name">${i.name}</p>
          ${i.variant ? `<p class="cart-var">${i.variant}</p>` : ''}
          <div class="cart-qty" role="group" aria-label="Quantité de ${i.name}">
            <button type="button" data-qty="-1" aria-label="Retirer un">−</button><span>${i.qty}</span><button type="button" data-qty="1" aria-label="Ajouter un">+</button>
          </div>
        </div>
        <div class="text-right"><p class="cart-price">${eur(i.price * i.qty)}</p><button type="button" class="cart-remove" data-remove>Retirer</button></div>
      </li>`).join('');
    save(KEY + '-cart', cart);
  }

  function bump() {
    $$('[data-cart-count]').forEach((b) => {
      const m = M();
      if (m) m.animate(b, { scale: [1, 1.5, 1] }, { duration: 0.45 });
    });
  }

  function openCart() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.hidden = false;
    root.classList.add('cart-open');
    requestAnimationFrame(() => drawer.classList.add('is-open'));
    setTimeout(() => $('[data-cart-close]', drawer).focus(), 50);
  }
  function closeCart() {
    if (!drawer || drawer.hidden) return;
    drawer.classList.remove('is-open');
    root.classList.remove('cart-open');
    setTimeout(() => (drawer.hidden = true), reduce ? 0 : 450);
    lastFocus?.focus?.();
  }

  function add(item) {
    const key = item.id + '|' + (item.variant || '');
    const found = cart.find((i) => i.key === key);
    if (found) found.qty += item.qty || 1; else cart.push({ ...item, key, qty: item.qty || 1 });
    render(); bump();
  }

  if (drawer) {
    $$('[data-cart-open]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); openCart(); }));
    $$('[data-cart-close]', drawer).forEach((b) => b.addEventListener('click', closeCart));
    drawer.addEventListener('click', (e) => {
      if (e.target === drawer) return closeCart();
      const line = e.target.closest('[data-line]');
      if (!line) return;
      const i = cart[+line.dataset.line];
      if (e.target.closest('[data-remove]')) cart.splice(+line.dataset.line, 1);
      const q = e.target.closest('[data-qty]');
      if (q) { i.qty += +q.dataset.qty; if (i.qty < 1) cart.splice(+line.dataset.line, 1); }
      render();
      // le rendu recrée la liste : on remet le focus au bon endroit pour le clavier
      const again = q && $(`[data-line="${line.dataset.line}"] [data-qty="${q.dataset.qty}"]`, drawer);
      (again || $('[data-cart-close]', drawer)).focus();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !drawer.hidden) closeCart(); });
    drawer.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const f = $$('button, a[href], input', drawer).filter((x) => x.offsetParent);
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
        else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
      }
    });
    $('[data-checkout]', drawer)?.addEventListener('click', () => say('Démo : branchez ici votre paiement (Stripe, Shopify…).'));
  }

  /* ---------- Fiche produit : options + ajout ---------- */
  const readProduct = (box) => {
    const d = box.dataset;
    const opts = $$('fieldset[data-opt]', box);
    const missing = opts.find((f) => f.dataset.required !== undefined && !$('input:checked', f));
    const variant = opts.map((f) => $('input:checked', f)?.value).filter(Boolean).join(' · ');
    return { missing, item: { id: d.id, name: d.name, price: +d.price, img: d.img, variant } };
  };

  document.addEventListener('change', (e) => {
    const r = e.target;
    if (r.type !== 'radio') return;
    const fs = r.closest('fieldset[data-opt]');
    const lab = fs && $('[data-opt-label]', fs);
    if (lab) lab.textContent = r.value;
    fs?.classList.remove('is-missing');
  });

  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-add]');
    if (addBtn) {
      e.preventDefault();
      const box = addBtn.closest('[data-product]');
      const { missing, item } = readProduct(box);
      if (missing) {
        missing.classList.add('is-missing');
        const m = M();
        if (m) m.animate(missing, { x: [0, -8, 8, -5, 5, 0] }, { duration: 0.4 });
        $('input', missing)?.focus();
        return say('Choisissez une option : ' + ($('legend', missing)?.textContent.split(':')[0].trim() || 'taille').toLowerCase());
      }
      add(item);
      const modal = addBtn.closest('[data-modal]');
      if (modal) $('[data-modal-close]', modal)?.click();
      setTimeout(openCart, modal ? 480 : 0);
      return;
    }
    const quick = e.target.closest('[data-quick]');
    if (quick) {
      e.preventDefault(); e.stopPropagation();
      const card = quick.closest('[data-product]');
      if (card.dataset.needsOption !== undefined) return $('[data-expand]', card)?.click();
      add(readProduct(card).item);
      quick.classList.add('is-done');
      const old = quick.innerHTML;
      quick.textContent = 'Ajouté ✓';
      setTimeout(() => { quick.classList.remove('is-done'); quick.innerHTML = old; }, 1400);
      say(`« ${card.dataset.name} » ajouté au panier.`);
      return;
    }
    const w = e.target.closest('[data-wish]');
    if (w) {
      e.preventDefault(); e.stopPropagation();
      const id = w.dataset.wish;
      wish.has(id) ? wish.delete(id) : wish.add(id);
      syncWish();
      if (wish.has(id)) { const m = M(); if (m) m.animate(w, { scale: [1, 1.35, 1] }, { type: 'spring', stiffness: 500, damping: 12 }); }
      say(wish.has(id) ? 'Ajouté à vos favoris.' : 'Retiré de vos favoris.');
    }
  });

  function syncWish() {
    $$('[data-wish]').forEach((b) => {
      const on = wish.has(b.dataset.wish);
      b.setAttribute('aria-pressed', on);
    });
    $$('[data-wish-count]').forEach((c) => { c.textContent = wish.size; c.hidden = !wish.size; });
    save(KEY + '-wish', [...wish]);
  }
  // Les favoris présents dans une fiche ouverte (copiée depuis un <template>) doivent aussi se synchroniser
  const mc = $('[data-modal-content]');
  if (mc) new MutationObserver(syncWish).observe(mc, { childList: true });

  /* ---------- Composeur de coffret ---------- */
  $$('[data-box]').forEach((box) => {
    const items = $$('[data-box-item]', box);
    const max = +(box.dataset.max || 3);
    const base = +(box.dataset.base || 0);
    const out = $('[data-box-total]', box), cnt = $('[data-box-count]', box), btn = $('[data-box-add]', box);
    const preview = $('[data-box-preview]', box);
    const update = () => {
      const on = items.filter((i) => i.checked);
      items.forEach((i) => (i.disabled = !i.checked && on.length >= max));
      const total = base + on.reduce((s, i) => s + +i.dataset.price, 0);
      out.textContent = eur(total);
      cnt.textContent = `${on.length} / ${max}`;
      btn.disabled = on.length === 0;
      if (preview) preview.innerHTML = on.map((i) => `<img src="${i.dataset.img}" alt="" width="64" height="64">`).join('') + Array.from({ length: max - on.length }, () => '<span></span>').join('');
      box.dataset.total = total;
    };
    box.addEventListener('change', update);
    btn.addEventListener('click', () => {
      const on = items.filter((i) => i.checked);
      const ribbon = $('input[name="ruban"]:checked', box)?.value;
      add({ id: 'coffret-' + on.map((i) => i.value).join('-'), name: 'Coffret composé', price: +box.dataset.total, img: on[0].dataset.img, variant: on.map((i) => i.dataset.name).join(', ') + (ribbon ? ' · ruban ' + ribbon : '') });
      openCart();
      say('Votre coffret est dans le panier.');
    });
    update();
  });

  /* ---------- Configurateur : le prix suit les options (data-extra sur chaque choix) ---------- */
  $$('[data-config]').forEach((box) => {
    const base = +box.dataset.base;
    const upd = () => {
      const total = base + $$('input:checked', box).reduce((s, i) => s + +(i.dataset.extra || 0), 0);
      box.dataset.price = total;
      $$('[data-config-price]', box).forEach((o) => (o.textContent = eur(total)));
    };
    box.addEventListener('change', upd);
    upd();
  });

  /* ---------- Lien direct vers une fiche : page.html#id-produit ---------- */
  addEventListener('load', () => {
    const id = decodeURIComponent(location.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (target?.matches('[data-expand]')) {
      target.scrollIntoView({ block: 'center' });
      setTimeout(() => target.click(), 350);
    }
  });

  render();
  syncWish();
})();
