/* =========================================================
   Scène Three.js — « Étagère flottante » (Comptoir Mimosa)
   Objets en céramique émaillée modelés par révolution (LatheGeometry) :
   vases, bol, bougie allumée, boule rayée, anneau. Ils flottent, suivent
   la souris en parallaxe ; au survol, l'objet grossit et affiche son nom
   et son prix ([data-obj-label]) ; au clic, on ouvre sa fiche produit.
   Usage : <canvas data-scene="objects"></canvas>
   ========================================================= */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const lathe = (pts, seg = 64) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg);
const glaze = (color, extra = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.25, sheen: 0.3, sheenColor: new THREE.Color('#ffffff'), side: THREE.DoubleSide, ...extra });

function stripes(a, b) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 16;
  const g = c.getContext('2d');
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(i * 32, 0, 32, 16); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping;
  return t;
}

function initScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(renderer), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 14);

  const root = new THREE.Group();
  scene.add(root);
  const items = [];
  const add = (mesh, pos, meta, scale = 1) => {
    const g = new THREE.Group();
    g.add(mesh);
    g.position.set(...pos);
    g.scale.setScalar(scale);
    g.userData = { ...meta, base: new THREE.Vector3(...pos), phase: Math.random() * 6.28, depth: 0.4 + Math.random() * 0.6, s: scale, hover: 0, spin: (Math.random() - 0.5) * 0.4 };
    g.rotation.set((Math.random() - 0.5) * 0.5, Math.random() * 6, (Math.random() - 0.5) * 0.4);
    root.add(g); items.push(g);
    return g;
  };

  // Vase Galet (cobalt)
  add(new THREE.Mesh(lathe([[0, -1.2], [0.7, -1.15], [1.05, -0.5], [1.0, 0.2], [0.55, 0.85], [0.42, 1.2], [0.5, 1.32], [0.44, 1.34]]), glaze('#3047D9')), [-3.6, 1.3, 0], { id: 'duo-vases', label: 'Duo de vases Galet', price: '48 €' });
  // Vase haut (rose)
  add(new THREE.Mesh(lathe([[0, -1.6], [0.5, -1.55], [0.62, -0.8], [0.4, 0.4], [0.3, 1.2], [0.42, 1.6], [0.36, 1.62]]), glaze('#FF9DB8')), [3.9, 1.6, -1], { id: 'duo-vases', label: 'Vase Col de cygne', price: '48 €' });
  // Bol (jaune mimosa, intérieur crème)
  add(new THREE.Mesh(lathe([[0, -0.55], [0.5, -0.5], [0.95, -0.15], [1.15, 0.35], [1.08, 0.38], [0.88, -0.05], [0.45, -0.38], [0, -0.42]]), glaze('#FFD449')), [-1.2, -2.1, 1], { id: 'tasses-creme', label: 'Bol Soleil', price: '22 €' });
  // Bougie dans son pot + flamme
  const candle = new THREE.Group();
  candle.add(new THREE.Mesh(lathe([[0, -0.7], [0.62, -0.7], [0.66, 0.55], [0.6, 0.55], [0.58, 0.35], [0, 0.35]]), glaze('#2F8F5B')));
  candle.add(new THREE.Mesh(new THREE.CylinderGeometry(0.57, 0.57, 0.04, 40), new THREE.MeshStandardMaterial({ color: '#FFF3DC', roughness: 0.9 })).translateY(0.36));
  const flameMat = new THREE.MeshBasicMaterial({ color: '#FFB347' });
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 12), flameMat);
  flame.scale.set(1, 2.2, 1); flame.position.y = 0.58;
  candle.add(flame);
  const flameLight = new THREE.PointLight('#FFB347', 2.5, 4, 2); flameLight.position.y = 0.8; candle.add(flameLight);
  add(candle, [2.0, -1.7, 0.5], { id: 'bougie-figuier', label: 'Bougie Figuier', price: '32 €' }, 1.1);
  // Boule rayée
  add(new THREE.Mesh(new THREE.SphereGeometry(0.75, 48, 32), glaze('#ffffff', { map: stripes('#2F8F5B', '#FFF6E5') })), [0.6, 2.4, -1.5], { id: 'cactus-rose', label: 'Boule Bonbon', price: '14 €' });
  // Anneau (donut)
  add(new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.24, 32, 64), glaze('#FF7A45')), [-4.4, -1.6, -1], { id: 'mug-nuage', label: 'Porte-encens Anneau', price: '16 €' });
  // Petit pot (crème)
  add(new THREE.Mesh(lathe([[0, -0.6], [0.55, -0.6], [0.7, 0.1], [0.62, 0.5], [0.66, 0.6], [0.6, 0.62]]), glaze('#FFF1D0')), [4.6, -1.2, 0.8], { id: 'mug-nuage', label: 'Mug Nuage', price: '18 €' }, 0.9);

  scene.add(new THREE.HemisphereLight('#FFF6E5', '#F2B84B', 1.2));
  const key = new THREE.DirectionalLight('#ffffff', 2.4); key.position.set(4, 6, 8); scene.add(key);

  /* ---------- Souris : parallaxe + survol ---------- */
  const pointer = new THREE.Vector2(), eased = new THREE.Vector2(), ray = new THREE.Raycaster();
  const label = document.querySelector('[data-obj-label]');
  let hovered = null, inside = false;
  const host = canvas.closest('[data-scene-host]') || canvas;
  host.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    inside = true;
    if (label) { label.style.left = e.clientX - r.left + 'px'; label.style.top = e.clientY - r.top + 'px'; }
  }, { passive: true });
  host.addEventListener('pointerleave', () => { inside = false; pointer.set(0, 0); });
  canvas.addEventListener('click', () => {
    if (hovered) location.href = 'boutique.html#' + hovered.userData.id;
  });

  const pick = () => {
    if (!inside) return null;
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects(items, true)[0];
    if (!hit) return null;
    let o = hit.object; while (o.parent && !items.includes(o)) o = o.parent;
    return o;
  };

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = camera.aspect < 0.6 ? 20 : camera.aspect < 1.2 ? 14.5 : 13;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
  const clock = new THREE.Clock();
  let last = 0;
  function render() {
    const t = reduce ? 1 : clock.getElapsedTime();
    const dt = Math.min(0.1, t - last); last = t;
    eased.lerp(pointer, 1 - Math.exp(-dt * 4));
    const h = pick();
    if (h !== hovered) {
      hovered = h;
      canvas.style.cursor = h ? 'pointer' : '';
      if (label) { label.hidden = !h; if (h) label.innerHTML = `<b>${h.userData.label}</b> ${h.userData.price}`; }
    }
    items.forEach((g) => {
      const u = g.userData;
      u.hover += ((g === hovered ? 1 : 0) - u.hover) * (1 - Math.exp(-dt * 8));
      g.position.x = u.base.x + eased.x * u.depth * 0.8;
      g.position.y = u.base.y + Math.sin(t * 0.9 + u.phase) * 0.18 + eased.y * u.depth * 0.5;
      g.rotation.y += dt * (0.25 + u.spin + u.hover * 2.5);
      g.scale.setScalar(u.s * (1 + u.hover * 0.18));
    });
    flame.scale.y = 2.2 + Math.sin(t * 18) * 0.25 + Math.sin(t * 7) * 0.2;
    flameLight.intensity = 2.3 + Math.sin(t * 13) * 0.4;
    root.rotation.y = eased.x * 0.12;
    root.rotation.x = -eased.y * 0.08;
    renderer.render(scene, camera);
  }
  if (reduce) { render(); host.addEventListener('pointermove', () => requestAnimationFrame(render)); return; }
  renderer.setAnimationLoop(() => visible && render());
}

document.querySelectorAll('canvas[data-scene]').forEach((c) => {
  try { initScene(c); } catch (e) { console.warn('WebGL indisponible :', e); }
});
