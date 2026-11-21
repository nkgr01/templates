/* =========================================================
   Scène Three.js — « Formes iridescentes » (Kinetik)
   Formes en matériau physique (clearcoat + iridescence) éclairées
   par un environnement studio ; elles flottent et suivent la souris.
   Usage : <canvas data-scene="shapes"></canvas> (accueil)
           <canvas data-scene="knot"></canvas>   (pages intérieures)
   ========================================================= */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

function initScene(canvas) {
  const hero = canvas.dataset.scene === 'shapes';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, hero ? 12 : 9);

  // Lumières colorées en contre-jour (lime + violet) pour les reflets
  const rimA = new THREE.PointLight('#D2FF3A', 60, 30); rimA.position.set(-5, 4, 3); scene.add(rimA);
  const rimB = new THREE.PointLight('#9B87FF', 80, 30); rimB.position.set(5, -3, 4); scene.add(rimB);

  const mat = (color, extra = {}) => new THREE.MeshPhysicalMaterial({
    color, roughness: 0.18, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.08,
    iridescence: 1, iridescenceIOR: 1.35, iridescenceThicknessRange: [200, 800], ...extra,
  });

  const group = new THREE.Group();
  scene.add(group);
  const items = [];
  const add = (geo, material, pos, scale, speed) => {
    const m = new THREE.Mesh(geo, material);
    m.position.set(...pos);
    m.scale.setScalar(scale);
    m.userData = { base: new THREE.Vector3(...pos), speed, phase: Math.random() * 10 };
    group.add(m);
    items.push(m);
    return m;
  };

  if (hero) {
    add(new THREE.TorusKnotGeometry(1, 0.34, 220, 32), mat('#E8FF9A'), [2.5, -0.7, 0], 1.15, 0.35);
    add(new THREE.SphereGeometry(1, 64, 64), mat('#9B87FF', { metalness: 0.3 }), [0.4, 2.7, -3], 0.75, 0.5);
    add(new RoundedBoxGeometry(1.4, 1.4, 1.4, 6, 0.32), mat('#F4F4EF', { roughness: 0.3 }), [4.4, 2.4, -2], 0.7, 0.45);
    add(new THREE.TorusGeometry(0.8, 0.28, 32, 96), mat('#D2FF3A'), [-0.2, -2.9, -1], 0.7, 0.6);
    add(new THREE.IcosahedronGeometry(0.6, 0), mat('#9B87FF', { flatShading: true }), [-1.2, 1.2, -4], 0.6, 0.7);
  } else {
    add(new THREE.TorusKnotGeometry(1, 0.32, 260, 36, 3, 5), mat('#E8FF9A'), [0, 0, 0], 1.3, 0.3);
    add(new THREE.SphereGeometry(1, 48, 48), mat('#9B87FF', { metalness: 0.3 }), [2.2, 1.5, -1], 0.45, 0.6);
  }

  // Souris → rotation douce de l'ensemble
  const pointer = { x: 0, y: 0 }, eased = { x: 0, y: 0 };
  addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Sur mobile (portrait), on recule la caméra pour garder les formes dans le cadre
    camera.position.z = (hero ? 12 : 9) * (camera.aspect < 1 ? 1.5 : 1);
    // Desktop : formes décalées à droite du titre. Mobile : remontées au-dessus du texte.
    if (hero) camera.aspect > 1.2 ? group.position.set(1.6, 0, 0) : group.position.set(-1.4, 2.6, 0);
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);

  const clock = new THREE.Clock();
  const render = () => {
    const t = clock.getElapsedTime();
    eased.x += (pointer.x - eased.x) * 0.05;
    eased.y += (pointer.y - eased.y) * 0.05;
    items.forEach((m) => {
      const { base, speed, phase } = m.userData;
      m.position.y = base.y + Math.sin(t * speed + phase) * 0.25;
      m.rotation.x = t * speed * 0.6 + phase;
      m.rotation.y = t * speed * 0.8;
    });
    group.rotation.y = eased.x * 0.35;
    group.rotation.x = eased.y * 0.2;
    renderer.render(scene, camera);
  };

  if (reduce) return render();
  renderer.setAnimationLoop(() => visible && render());
}

document.querySelectorAll('canvas[data-scene]').forEach((c) => {
  try { initScene(c); } catch (e) { console.warn('WebGL indisponible :', e); }
});
