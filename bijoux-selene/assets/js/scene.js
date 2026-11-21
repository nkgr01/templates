/* =========================================================
   Scène Three.js — « Solitaire » (Sélène)
   Bague procédurale : anneau en métal précieux, griffes et pierre taillée
   en matériau à transmission (réfraction). Reflets fournis par une
   RoomEnvironment (aucune image HDR à charger). On fait tourner la bague
   à la souris ou au doigt.
   Configurateur : radios name="metal" / name="pierre" (data-ring-config)
   Usage : <canvas data-scene="ring"></canvas>
   ========================================================= */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const METALS = { 'Or jaune': '#F2C46D', 'Or rose': '#EDB096', 'Or blanc': '#E4E6EA' };
const STONES = { Diamant: '#FFFFFF', Saphir: '#2F55E0', 'Émeraude': '#17A06B', Rubis: '#D3123F' };

function starTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.15, 'rgba(255,250,235,.8)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(31, 4, 2, 56); g.fillRect(4, 31, 56, 2);
  return new THREE.CanvasTexture(c);
}

function initScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.02).texture;
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0.6, 8);

  const metal = new THREE.MeshPhysicalMaterial({ color: METALS['Or jaune'], metalness: 1, roughness: 0.16, clearcoat: 0.4, clearcoatRoughness: 0.1 });
  const gemMat = new THREE.MeshPhysicalMaterial({
    color: '#ffffff', metalness: 0, roughness: 0, transmission: 1, thickness: 0.6, ior: 2.42,
    specularIntensity: 1, envMapIntensity: 2.5, flatShading: true, attenuationColor: new THREE.Color('#ffffff'), attenuationDistance: 0.8,
  });

  const ring = new THREE.Group();
  // Anneau
  const band = new THREE.Mesh(new THREE.TorusGeometry(1, 0.11, 48, 180), metal);
  band.scale.z = 1.6;
  ring.add(band);
  // Chaton (support) + 6 griffes
  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.12, 0.28, 24, 1, true), metal);
  seat.position.y = 1.18;
  ring.add(seat);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const prong = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.034, 0.5, 8), metal);
    prong.position.set(Math.cos(a) * 0.27, 1.38, Math.sin(a) * 0.27);
    prong.lookAt(0, 0.2, 0); prong.rotateX(Math.PI / 2);
    ring.add(prong);
  }
  // Pierre : couronne + pavillon (taille brillant simplifiée)
  const gem = new THREE.Group();
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.34, 0.14, 16), gemMat);
  crown.position.y = 0.07;
  const pavilion = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.38, 16), gemMat);
  pavilion.rotation.x = Math.PI; pavilion.position.y = -0.19;
  gem.add(crown, pavilion);
  gem.position.y = 1.52;
  ring.add(gem);
  ring.rotation.set(0.25, 0, 0);
  scene.add(ring);

  // Scintillements
  const sparkGeo = new THREE.BufferGeometry();
  const N = 14, pos = new Float32Array(N * 3), phase = [];
  for (let i = 0; i < N; i++) { pos.set([(Math.random() - 0.5) * 0.7, 1.45 + Math.random() * 0.3, (Math.random() - 0.5) * 0.7], i * 3); phase.push(Math.random() * 6.28); }
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const sparkMat = new THREE.PointsMaterial({ map: starTexture(), size: 0.22, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8 });
  const sparks = new THREE.Points(sparkGeo, sparkMat);
  ring.add(sparks);

  // Ombre douce au sol
  const sh = document.createElement('canvas'); sh.width = sh.height = 128;
  const sg = sh.getContext('2d'); const grd = sg.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(0,0,0,.55)'); grd.addColorStop(1, 'rgba(0,0,0,0)'); sg.fillStyle = grd; sg.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sh), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.45;
  scene.add(shadow);

  const key = new THREE.DirectionalLight('#fff4e0', 2.2); key.position.set(3, 5, 4); scene.add(key);
  const rim = new THREE.DirectionalLight('#ffe2b8', 1.4); rim.position.set(-4, 2, -3); scene.add(rim);

  /* ---------- Configurateur ---------- */
  const tMetal = new THREE.Color(METALS['Or jaune']), tStone = new THREE.Color('#ffffff');
  const apply = () => {
    const m = document.querySelector('input[name="metal"]:checked');
    const s = document.querySelector('input[name="pierre"]:checked');
    if (m && METALS[m.value]) tMetal.set(METALS[m.value]);
    if (s && STONES[s.value]) tStone.set(STONES[s.value]);
    if (reduce) { metal.color.copy(tMetal); gemMat.color.copy(tStone); gemMat.attenuationColor.copy(tStone); render(); }
  };
  document.addEventListener('change', (e) => { if (['metal', 'pierre'].includes(e.target.name)) apply(); });
  apply();

  /* ---------- Rotation à la souris / au doigt ---------- */
  let rotY = 0.6, velY = 0, tilt = 0.25, dragging = false, lastX = 0, lastY = 0, idle = 0;
  canvas.style.touchAction = 'pan-y';
  canvas.style.cursor = 'grab';
  canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing'; });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    velY = (e.clientX - lastX) * 0.008;
    rotY += velY;
    tilt = THREE.MathUtils.clamp(tilt + (e.clientY - lastY) * 0.004, -0.3, 0.9);
    lastX = e.clientX; lastY = e.clientY; idle = 0;
  });
  const up = () => { dragging = false; canvas.style.cursor = 'grab'; };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = camera.aspect < 0.9 ? 10 : 8;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
  const clock = new THREE.Clock();
  let last = 0;
  function render() {
    const t = clock.getElapsedTime();
    const dt = Math.min(0.1, t - last); last = t;
    const k = 1 - Math.exp(-dt * 5);
    metal.color.lerp(tMetal, k);
    gemMat.color.lerp(tStone, k);
    gemMat.attenuationColor.lerp(tStone, k);
    if (!dragging) { idle += dt; velY *= Math.exp(-dt * 3); rotY += velY + (idle > 1.5 && !reduce ? dt * 0.35 : 0); }
    ring.rotation.y = rotY;
    ring.rotation.x = tilt;
    ring.position.y = reduce ? 0 : Math.sin(t * 0.8) * 0.06;
    const sp = sparkGeo.attributes.position;
    sparkMat.opacity = 0.55 + Math.sin(t * 3) * 0.25;
    sparkMat.size = 0.16 + (Math.sin(t * 4.3 + phase[0]) * 0.5 + 0.5) * 0.12;
    sp.needsUpdate = false;
    renderer.render(scene, camera);
  }
  if (reduce) return render();
  renderer.setAnimationLoop(() => visible && render());
}

document.querySelectorAll('canvas[data-scene]').forEach((c) => {
  try { initScene(c); } catch (e) { console.warn('WebGL indisponible :', e); }
});
