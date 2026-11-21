/* =========================================================
   Scène Three.js — « Kettlebell & pulsation » (Pulse Club)
   Un kettlebell en fonte laquée rouge tourne lentement ; des anneaux
   d'énergie battent au rythme d'un cœur. Survoler la scène accélère
   le rythme (affiché dans [data-bpm]). La souris incline l'objet.
   Usage : <canvas data-scene="kettlebell"></canvas>
   ========================================================= */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

function initScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(renderer), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.6, 12);

  const bell = new THREE.Group();
  const lacquer = new THREE.MeshPhysicalMaterial({ color: '#E8281E', metalness: 0.35, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12 });
  const iron = new THREE.MeshStandardMaterial({ color: '#1A1A1A', metalness: 0.9, roughness: 0.35 });
  // Corps (sphère légèrement aplatie à la base)
  const bodyGeo = new THREE.SphereGeometry(1.5, 96, 64);
  const pos = bodyGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); if (y < -1.15) pos.setY(i, -1.15 - (y + 1.15) * 0.15); }
  bodyGeo.computeVertexNormals();
  bell.add(new THREE.Mesh(bodyGeo, lacquer));
  // Poignée : demi-tore + montants
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.2, 32, 96, Math.PI), iron);
  handle.position.y = 1.55; bell.add(handle);
  [-0.95, 0.95].forEach((x) => { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.6, 32), iron); leg.position.set(x, 1.3, 0); bell.add(leg); });
  // Bande gravée « 16 KG »
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.font = 'italic 800 92px "Barlow Condensed", Impact, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('16 KG', 256, 68);
  const label = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.375), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
  label.position.set(0, -0.15, 1.505); bell.add(label);
  bell.position.y = -0.4;
  scene.add(bell);

  // Anneaux d'énergie
  const rings = [];
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(2.4 + i * 0.55, 0.018, 8, 160), new THREE.MeshBasicMaterial({ color: i === 1 ? '#FFFFFF' : '#FF3B2F', transparent: true, opacity: 0.6, depthWrite: false }));
    m.rotation.x = Math.PI / 2 + 0.35; m.rotation.y = i * 0.4;
    scene.add(m); rings.push(m);
  }
  // Particules (sueur / énergie)
  const N = 180, pGeo = new THREE.BufferGeometry(), pArr = new Float32Array(N * 3), seeds = [];
  for (let i = 0; i < N; i++) { const a = Math.random() * 6.28, r = 2.2 + Math.random() * 2.5; pArr.set([Math.cos(a) * r, (Math.random() - 0.5) * 5, Math.sin(a) * r], i * 3); seeds.push(a, r, Math.random()); }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
  const parts = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: '#FF6A5C', size: 0.05, transparent: true, opacity: 0.8, depthWrite: false }));
  scene.add(parts);

  scene.add(new THREE.HemisphereLight('#ffffff', '#330000', 0.6));
  const key = new THREE.DirectionalLight('#ffffff', 2.4); key.position.set(4, 6, 6); scene.add(key);
  const red = new THREE.PointLight('#FF3B2F', 40, 14, 2); red.position.set(-3, -1, 3); scene.add(red);

  /* Rythme cardiaque */
  const bpmEl = document.querySelector('[data-bpm]');
  let bpm = 72, target = 72, phase = 0;
  const host = canvas.closest('[data-scene-host]') || canvas;
  const pointer = new THREE.Vector2(), eased = new THREE.Vector2();
  host.addEventListener('pointerenter', () => (target = 148));
  host.addEventListener('pointerleave', () => { target = 72; pointer.set(0, 0); });
  host.addEventListener('pointermove', (e) => { const r = canvas.getBoundingClientRect(); pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1); }, { passive: true });

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = camera.aspect < 0.8 ? 15 : 12;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
  const clock = new THREE.Clock();
  let last = 0, shownBpm = 72;
  function render() {
    const t = reduce ? 1 : clock.getElapsedTime();
    const dt = Math.min(0.1, t - last); last = t;
    bpm += (target - bpm) * (1 - Math.exp(-dt * 1.5));
    phase += dt * (bpm / 60);
    const p = phase % 1;
    // double battement « lub-dub »
    const beat = Math.exp(-Math.pow((p - 0.05) * 18, 2)) + 0.6 * Math.exp(-Math.pow((p - 0.28) * 18, 2));
    eased.lerp(pointer, 1 - Math.exp(-dt * 4));
    bell.rotation.y = t * 0.5 + eased.x * 0.6;
    bell.rotation.x = eased.y * 0.25;
    bell.rotation.z = Math.sin(t * 0.8) * 0.06;
    bell.scale.setScalar(1 + beat * 0.035);
    rings.forEach((r, i) => {
      const s = 1 + beat * (0.12 + i * 0.05);
      r.scale.setScalar(s);
      r.material.opacity = 0.25 + beat * 0.6;
      r.rotation.z = t * (0.2 + i * 0.1);
    });
    const arr = pGeo.attributes.position.array;
    for (let i = 0; i < N; i++) {
      const a = seeds[i * 3] + t * (0.15 + seeds[i * 3 + 2] * 0.2) * (bpm / 72);
      const r = seeds[i * 3 + 1] + beat * 0.3;
      arr[i * 3] = Math.cos(a) * r; arr[i * 3 + 2] = Math.sin(a) * r;
      arr[i * 3 + 1] += dt * 0.25 * (bpm / 72); if (arr[i * 3 + 1] > 2.6) arr[i * 3 + 1] = -2.6;
    }
    pGeo.attributes.position.needsUpdate = true;
    red.intensity = 30 + beat * 60;
    if (bpmEl && Math.round(bpm) !== shownBpm) { shownBpm = Math.round(bpm); bpmEl.textContent = shownBpm; }
    renderer.render(scene, camera);
  }
  if (reduce) return render();
  renderer.setAnimationLoop(() => visible && render());
}

document.querySelectorAll('canvas[data-scene]').forEach((c) => {
  try { initScene(c); } catch (e) { console.warn('WebGL indisponible :', e); }
});
