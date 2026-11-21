/* =========================================================
   Scène Three.js — « Orbe d'or » (Halden & Associés)
   Usage : <canvas data-scene="orb"></canvas>  (hero accueil)
           <canvas data-scene="dust"></canvas> (pages intérieures)
   ========================================================= */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Sprite rond et doux pour les particules */
function dotTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,.55)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function initScene(canvas) {
  const variant = canvas.dataset.scene;
  const isOrb = variant === 'orb';

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, isOrb ? 10 : 12);

  const gold = new THREE.Color('#C8A96A');
  const root = new THREE.Group();
  scene.add(root);

  let core, shell, ring, ring2;
  if (isOrb) {
    core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.55, 1),
      new THREE.MeshStandardMaterial({ color: gold, metalness: 1, roughness: 0.22, flatShading: true }),
    );
    root.add(core);

    shell = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.45, 1)),
      new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity: 0.32 }),
    );
    root.add(shell);

    const ringMat = new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0.45 });
    ring = new THREE.Mesh(new THREE.TorusGeometry(3.25, 0.006, 6, 256), ringMat);
    ring.rotation.set(Math.PI / 2.25, 0.3, 0);
    root.add(ring);
    ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.7, 0.004, 6, 256), ringMat.clone());
    ring2.material.opacity = 0.2;
    ring2.rotation.set(Math.PI / 1.8, -0.4, 0);
    root.add(ring2);

    scene.add(new THREE.AmbientLight('#ffffff', 0.15));
    const key = new THREE.DirectionalLight('#fff0d4', 2.4);
    key.position.set(4, 5, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight('#7f93ff', 1.1);
    rim.position.set(-6, -2, -4);
    scene.add(rim);
  }

  /* Poussière d'or */
  const count = isOrb ? 1600 : 900;
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const r = (isOrb ? 2.8 : 1.5) + Math.pow(Math.random(), 0.7) * (isOrb ? 6 : 9);
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    positions.set([r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th) * 0.7, r * Math.cos(ph)], i * 3);
    scales[i] = Math.random();
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: gold, size: isOrb ? 0.06 : 0.05, map: dotTexture(), transparent: true, opacity: 0.85,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  }));
  scene.add(dust);

  /* Interaction souris (parallaxe douce) */
  const pointer = { x: 0, y: 0 };
  const eased = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  /* Redimensionnement */
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Sur mobile (portrait) on recule la caméra pour garder l'orbe entier
    camera.position.z = (isOrb ? 10 : 12) * (camera.aspect < 1 ? 1.35 : 1);
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  /* Pause hors écran */
  let visible = true;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(canvas);

  const clock = new THREE.Clock();
  const render = () => {
    const t = clock.getElapsedTime();
    eased.x += (pointer.x - eased.x) * 0.04;
    eased.y += (pointer.y - eased.y) * 0.04;

    if (isOrb) {
      core.rotation.y = t * 0.18;
      core.rotation.x = Math.sin(t * 0.3) * 0.2;
      shell.rotation.y = -t * 0.08;
      shell.rotation.z = t * 0.05;
      ring.rotation.z = t * 0.1;
      ring2.rotation.z = -t * 0.06;
      core.position.y = Math.sin(t * 0.8) * 0.08;
      root.rotation.y = eased.x * 0.45;
      root.rotation.x = eased.y * 0.3;
    }
    dust.rotation.y = t * 0.02 + eased.x * 0.15;
    dust.rotation.x = eased.y * 0.1;
    renderer.render(scene, camera);
  };

  if (reduce) {
    render();
    window.addEventListener('resize', render);
    return;
  }
  renderer.setAnimationLoop(() => { if (visible) render(); });
}

document.querySelectorAll('canvas[data-scene]').forEach((c) => {
  try { initScene(c); } catch (e) { console.warn('WebGL indisponible :', e); }
});
