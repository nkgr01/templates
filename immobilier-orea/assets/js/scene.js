/* =========================================================
   Scène Three.js — « Villa contemporaine » (Orea)
   Maquette architecturale procédurale : volumes en porte-à-faux,
   baies vitrées, piscine, oliviers. Ombres douces, lumière de fin
   de journée, mode Jour / Soir piloté par des boutons [data-villa-mode].
   Usage : <canvas data-scene="villa"></canvas>
   ========================================================= */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

function initScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  // (Scene.environmentIntensity n'existe qu'à partir de r163 : on règle chaque matériau)

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);

  /* ---------- Matériaux ---------- */
  const M = {
    plaster: new THREE.MeshStandardMaterial({ color: '#F3EEE6', roughness: 0.9 }),
    wood: new THREE.MeshStandardMaterial({ color: '#8C6A48', roughness: 0.7 }),
    dark: new THREE.MeshStandardMaterial({ color: '#2A2724', roughness: 0.6 }),
    stone: new THREE.MeshStandardMaterial({ color: '#D8CDBB', roughness: 0.95 }),
    lawn: new THREE.MeshStandardMaterial({ color: '#A3AE8C', roughness: 1 }),
    water: new THREE.MeshPhysicalMaterial({ color: '#5FB4C4', roughness: 0.05, metalness: 0.1, clearcoat: 1, emissive: '#0d3a44', emissiveIntensity: 0.15 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#AFC3C8', roughness: 0.04, metalness: 0.2, transparent: true, opacity: 0.38, emissive: '#FFB869', emissiveIntensity: 0 }),
    leaf: new THREE.MeshStandardMaterial({ color: '#7F8C74', roughness: 0.9, flatShading: true }),
    bark: new THREE.MeshStandardMaterial({ color: '#6B5A48', roughness: 1 }),
  };

  const villa = new THREE.Group();
  scene.add(villa);
  const box = (w, h, d, mat, x, y, z, shadow = true) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y + h / 2, z);
    m.castShadow = shadow; m.receiveShadow = true;
    villa.add(m);
    return m;
  };

  /* Terrain */
  const ground = new THREE.Mesh(new THREE.CircleGeometry(22, 64), M.stone);
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; villa.add(ground);
  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(26, 9), M.lawn);
  lawn.rotation.x = -Math.PI / 2; lawn.position.set(0, 0.01, 7.5); lawn.receiveShadow = true; villa.add(lawn);

  /* Socle + terrasse */
  box(16, 0.35, 9, M.stone, 0, 0, 0);
  box(9, 0.12, 4.2, M.wood, -2.5, 0.35, 5.2);

  /* Rez-de-chaussée : volume enduit + grande baie */
  box(10, 3, 6, M.plaster, -1.5, 0.35, -0.5);
  box(7.4, 2.4, 0.08, M.glass, -2.2, 0.55, 2.52, false);
  [-5.9, -3.4, -1, 1.5].forEach((x) => box(0.1, 2.4, 0.14, M.dark, x, 0.55, 2.55));
  box(7.6, 0.1, 0.14, M.dark, -2.2, 2.95, 2.55);
  box(0.08, 2.2, 3.6, M.glass, 3.52, 0.65, -0.6, false);

  /* Étage en porte-à-faux, bardage bois */
  box(9, 2.7, 5.2, M.wood, 2.2, 3.35, -1.2);
  box(0.08, 2, 4, M.glass, 6.72, 3.7, -1.2, false);
  box(6, 2, 0.08, M.glass, 2.6, 3.7, 1.42, false);
  /* Toitures débordantes */
  box(10.6, 0.22, 6.8, M.plaster, -1.5, 3.35, -0.2);
  box(9.8, 0.22, 6, M.plaster, 2.2, 6.05, -1.2);
  /* Pilier et muret */
  box(0.4, 3, 0.4, M.dark, 6.2, 0.35, 0.9);
  box(0.3, 1.1, 6, M.plaster, -7.6, 0.35, 4.5);

  /* Piscine à débordement */
  box(9.6, 0.3, 3.6, M.stone, 3.4, 0.35, 5.3);
  const pool = box(8.8, 0.08, 2.8, M.water, 3.4, 0.6, 5.3, false);
  pool.receiveShadow = true;

  /* Oliviers */
  const tree = (x, z, s) => {
    const t = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * s, 0.2 * s, 1.6 * s, 6), M.bark);
    trunk.position.y = 0.8 * s; trunk.castShadow = true; t.add(trunk);
    [[0, 2.1, 0, 1], [0.6, 1.8, 0.3, 0.7], [-0.5, 1.9, -0.2, 0.75]].forEach(([x2, y2, z2, r]) => {
      const c = new THREE.Mesh(new THREE.IcosahedronGeometry(r * s, 0), M.leaf);
      c.position.set(x2 * s, y2 * s, z2 * s); c.castShadow = true; t.add(c);
    });
    t.position.set(x, 0, z);
    t.rotation.y = Math.random() * Math.PI;
    villa.add(t);
  };
  tree(-9.5, 3.5, 1.3); tree(10.2, -2.5, 1.1); tree(-10.5, -4, 0.9); tree(9.6, 7.8, 0.8);

  /* ---------- Lumières ---------- */
  const hemi = new THREE.HemisphereLight('#FFF4E6', '#B9A88E', 1.1);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#FFD9A8', 3);
  sun.position.set(-14, 16, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 60 });
  sun.shadow.bias = -0.0004;
  scene.add(sun);
  // Éclairage intérieur (visible le soir à travers les baies)
  const inside = new THREE.PointLight('#FFB25E', 0, 14, 1.6);
  inside.position.set(-2, 1.8, 0.5);
  scene.add(inside);
  const insideUp = new THREE.PointLight('#FFB25E', 0, 12, 1.6);
  insideUp.position.set(3, 4.6, -1);
  scene.add(insideUp);
  const poolLight = new THREE.PointLight('#5FE0F0', 0, 8, 1.5);
  poolLight.position.set(3.4, 0.4, 5.3);
  scene.add(poolLight);

  /* ---------- Mode Jour / Soir ---------- */
  const section = canvas.closest('[data-villa-section]');
  let night = 0, nightTarget = 0;
  document.querySelectorAll('[data-villa-mode]').forEach((b) => {
    b.addEventListener('click', () => {
      nightTarget = b.dataset.villaMode === 'soir' ? 1 : 0;
      document.querySelectorAll('[data-villa-mode]').forEach((x) => x.setAttribute('aria-pressed', x === b));
      section?.classList.toggle('is-night', nightTarget === 1);
      if (reduce) { night = nightTarget; applyMode(); render(); }
    });
  });
  const day = { sun: new THREE.Color('#FFD9A8'), hemi: new THREE.Color('#FFF4E6') };
  const eve = { sun: new THREE.Color('#7C8BC4'), hemi: new THREE.Color('#5B6488') };
  const applyMode = () => {
    sun.intensity = THREE.MathUtils.lerp(3, 0.12, night);
    sun.color.lerpColors(day.sun, eve.sun, night);
    hemi.intensity = THREE.MathUtils.lerp(1.1, 0.14, night);
    hemi.color.lerpColors(day.hemi, eve.hemi, night);
    inside.intensity = insideUp.intensity = 60 * night;
    poolLight.intensity = 18 * night;
    M.glass.emissiveIntensity = 0.9 * night;
    M.glass.opacity = 0.38 + 0.4 * night;
    Object.values(M).forEach((m) => (m.envMapIntensity = THREE.MathUtils.lerp(0.35, 0.02, night)));
    renderer.toneMappingExposure = THREE.MathUtils.lerp(1, 0.95, night);
  };
  applyMode();

  /* ---------- Caméra : orbite lente + influence de la souris ---------- */
  const pointer = { x: 0, y: 0 }, eased = { x: 0, y: 0 };
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = ((e.clientY - r.top) / r.height) * 2 - 1;
  }, { passive: true });
  canvas.addEventListener('pointerleave', () => { pointer.x = pointer.y = 0; });

  let dist = 34;
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    dist = camera.aspect < 1 ? 52 : camera.aspect < 1.4 ? 40 : 34;
    // Sur grand écran, on décale le cadrage vers la droite pour laisser respirer le texte
    if (camera.aspect > 1.3) camera.setViewOffset(w, h, -w * 0.17, 0, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);

  const clock = new THREE.Clock();
  const target = new THREE.Vector3(0, 2.2, 1);
  function render() {
    const t = clock.getElapsedTime();
    night += (nightTarget - night) * 0.05;
    applyMode();
    eased.x += (pointer.x - eased.x) * 0.05;
    eased.y += (pointer.y - eased.y) * 0.05;
    const a = 0.65 + (reduce ? 0 : Math.sin(t * 0.12) * 0.45) + eased.x * 0.5;
    const elev = 0.42 - eased.y * 0.12;
    camera.position.set(Math.sin(a) * dist * Math.cos(elev), Math.sin(elev) * dist, Math.cos(a) * dist * Math.cos(elev));
    camera.lookAt(target);
    renderer.render(scene, camera);
  }

  if (reduce) return render();
  renderer.setAnimationLoop(() => visible && render());
}

document.querySelectorAll('canvas[data-scene]').forEach((c) => {
  try { initScene(c); } catch (e) { console.warn('WebGL indisponible :', e); }
});
