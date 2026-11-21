/* =========================================================
   Scène Three.js — « Bol fumant » (Ébène)
   Un bol en céramique émaillée (révolution), un bouillon doré,
   de la vapeur qui monte (particules douces) et des épices qui
   tournoient autour. Lumière chaude de bougie, la souris incline la scène.
   Usage : <canvas data-scene="bowl"></canvas>
   ========================================================= */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

function softSprite() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,.55)'); r.addColorStop(.45, 'rgba(255,255,255,.18)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function initScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(renderer), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

  const root = new THREE.Group();
  scene.add(root);

  // Bol : profil extérieur + lèvre + intérieur
  const pts = [[0, -0.9], [0.9, -0.9], [1.0, -0.82], [1.55, -0.35], [1.95, 0.35], [2.05, 0.55], [1.98, 0.6], [1.85, 0.42], [1.42, -0.2], [0.85, -0.62], [0, -0.66]].map(([x, y]) => new THREE.Vector2(x, y));
  const bowlMat = new THREE.MeshPhysicalMaterial({ color: '#1B1714', roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.18, metalness: 0.05, side: THREE.DoubleSide });
  const bowl = new THREE.Mesh(new THREE.LatheGeometry(pts, 96), bowlMat);
  root.add(bowl);
  // Liseré doré sur la lèvre
  const rim = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.028, 12, 160), new THREE.MeshStandardMaterial({ color: '#D99A3D', metalness: 1, roughness: 0.25 }));
  rim.rotation.x = Math.PI / 2; rim.position.y = 0.58; root.add(rim);
  // Bouillon
  const soupMat = new THREE.MeshPhysicalMaterial({ color: '#C46A26', roughness: 0.15, clearcoat: 1, emissive: '#5A1F05', emissiveIntensity: 0.35 });
  const soup = new THREE.Mesh(new THREE.CircleGeometry(1.72, 96), soupMat);
  soup.rotation.x = -Math.PI / 2; soup.position.y = 0.18; root.add(soup);
  // Garnitures : morceaux, herbes, piment
  const garnish = new THREE.Group(); root.add(garnish);
  const mats = [new THREE.MeshStandardMaterial({ color: '#E9D8B4', roughness: 0.6 }), new THREE.MeshStandardMaterial({ color: '#3F7D4E', roughness: 0.5 }), new THREE.MeshStandardMaterial({ color: '#B8231B', roughness: 0.35 })];
  for (let i = 0; i < 26; i++) {
    const k = i % 3, a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 1.35;
    const geo = k === 0 ? new THREE.DodecahedronGeometry(0.13 + Math.random() * 0.08, 0) : k === 1 ? new THREE.SphereGeometry(0.07, 8, 6) : new THREE.CylinderGeometry(0.035, 0.05, 0.3, 8);
    const m = new THREE.Mesh(geo, mats[k]);
    m.position.set(Math.cos(a) * r, 0.22, Math.sin(a) * r);
    m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    if (k === 1) m.scale.set(1.6, 0.3, 1);
    garnish.add(m);
  }

  // Vapeur
  const steamTex = softSprite();
  const steam = [];
  for (let i = 0; i < 46; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTex, color: '#FFF3E0', transparent: true, depthWrite: false, opacity: 0 }));
    s.userData = { life: Math.random(), speed: 0.12 + Math.random() * 0.1, x: (Math.random() - 0.5) * 1.8, z: (Math.random() - 0.5) * 1.2, sway: Math.random() * 6.28 };
    root.add(s); steam.push(s);
  }
  // Épices en orbite
  const spiceGeo = new THREE.IcosahedronGeometry(0.06, 0);
  const spiceMat = new THREE.MeshStandardMaterial({ color: '#D99A3D', metalness: 0.6, roughness: 0.3, emissive: '#5A3305', emissiveIntensity: 0.4 });
  const spices = new THREE.InstancedMesh(spiceGeo, spiceMat, 120);
  const sp = Array.from({ length: 120 }, () => ({ r: 2.4 + Math.random() * 1.6, a: Math.random() * 6.28, y: -0.6 + Math.random() * 2.6, s: 0.5 + Math.random() * 1.2, v: 0.08 + Math.random() * 0.12 }));
  root.add(spices);
  const dummy = new THREE.Object3D();

  scene.add(new THREE.HemisphereLight('#FFE2B8', '#0E2A22', 0.7));
  const key = new THREE.DirectionalLight('#FFD7A0', 2.6); key.position.set(-3, 5, 4); scene.add(key);
  const candle = new THREE.PointLight('#FF9A3C', 18, 12, 2); candle.position.set(2.5, 1.2, 2.5); scene.add(candle);
  const rimL = new THREE.DirectionalLight('#8FAE95', 1.2); rimL.position.set(3, 2, -4); scene.add(rimL);

  const pointer = new THREE.Vector2(), eased = new THREE.Vector2();
  const host = canvas.closest('[data-scene-host]') || canvas;
  host.addEventListener('pointermove', (e) => { const r = canvas.getBoundingClientRect(); pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1); }, { passive: true });
  host.addEventListener('pointerleave', () => pointer.set(0, 0));

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const d = camera.aspect < 0.8 ? 15 : 11.5;
    camera.position.set(0, d * 0.42, d);
    camera.lookAt(0, 0.6, 0);
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
  const clock = new THREE.Clock();
  let last = 0;
  function render() {
    const t = reduce ? 2 : clock.getElapsedTime();
    const dt = Math.min(0.1, t - last); last = t;
    eased.lerp(pointer, 1 - Math.exp(-dt * 3));
    root.rotation.y = t * 0.12 + eased.x * 0.35;
    root.rotation.x = eased.y * 0.12;
    root.position.y = Math.sin(t * 0.7) * 0.05;
    soupMat.emissiveIntensity = 0.32 + Math.sin(t * 1.7) * 0.05;
    steam.forEach((s) => {
      const u = s.userData;
      u.life += dt * u.speed;
      if (u.life > 1) { u.life = 0; u.x = (Math.random() - 0.5) * 1.8; u.z = (Math.random() - 0.5) * 1.2; }
      const l = u.life;
      s.position.set(u.x + Math.sin(t * 0.8 + u.sway) * 0.35 * l, 0.3 + l * 3.6, u.z + Math.cos(t * 0.6 + u.sway) * 0.25 * l);
      s.scale.setScalar(0.6 + l * 2.4);
      s.material.opacity = Math.sin(l * Math.PI) * 0.22;
    });
    sp.forEach((p, i) => {
      p.a += dt * p.v;
      dummy.position.set(Math.cos(p.a) * p.r, p.y + Math.sin(t * 0.6 + i) * 0.15, Math.sin(p.a) * p.r);
      dummy.rotation.set(t * p.s, t * p.s * 0.7, 0);
      dummy.scale.setScalar(p.s);
      dummy.updateMatrix(); spices.setMatrixAt(i, dummy.matrix);
    });
    spices.instanceMatrix.needsUpdate = true;
    candle.intensity = 17 + Math.sin(t * 9) * 1.5 + Math.sin(t * 23) * 0.8;
    renderer.render(scene, camera);
  }
  if (reduce) return render();
  renderer.setAnimationLoop(() => visible && render());
}

document.querySelectorAll('canvas[data-scene]').forEach((c) => {
  try { initScene(c); } catch (e) { console.warn('WebGL indisponible :', e); }
});
