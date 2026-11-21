/* =========================================================
   Scène Three.js — « Étoffe suspendue » (Arlo)
   Un pan de tissu accroché à une tringle, animé par le vent dans le
   vertex shader. Le tissage (sergé, toile, maille) est dessiné dans le
   fragment shader : aucune texture à charger. La souris souffle sur le tissu.
   Boutons [data-fabric="laine|lin|denim"] pour changer de matière.
   Usage : <canvas data-scene="fabric"></canvas>
   ========================================================= */
import * as THREE from 'three';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const FABRICS = {
  laine: { c1: '#E9E1D2', c2: '#CFC3AE', scale: 70, twill: 0.25, fuzz: 0.55, slub: 0.1, sheen: 0.55 },
  lin: { c1: '#B4532A', c2: '#CF7A4E', scale: 120, twill: 0.05, fuzz: 0.15, slub: 0.9, sheen: 0.25 },
  denim: { c1: '#1F3561', c2: '#6E87B4', scale: 150, twill: 1.0, fuzz: 0.1, slub: 0.35, sheen: 0.2 },
};

const vert = /* glsl */ `
uniform float uTime;
uniform vec2 uMouse;
uniform float uPush;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vView;

float disp(vec2 uv) {
  float hang = pow(1.0 - uv.y, 1.25);              // fixé en haut, libre en bas
  float t = uTime;
  float pleats = sin(uv.x * 18.0 + sin(uv.y * 3.0 + t * 0.6) * 0.8) * 0.11 + sin(uv.x * 41.0 + 1.3) * 0.02;  // plis verticaux
  float wave = sin(uv.x * 4.5 - t * 1.3 + uv.y * 2.0) * 0.22 + sin(uv.x * 9.0 + t * 0.9) * 0.07;
  float m = exp(-distance(uv, uMouse) * 6.0) * uPush; // souffle de la souris
  return pleats * (0.4 + hang) + (wave + m * 0.9) * hang;
}

void main() {
  vUv = uv;
  vec3 p = position;
  float e = 0.004;
  float d = disp(uv);
  float dx = disp(uv + vec2(e, 0.0)) - d;
  float dy = disp(uv + vec2(0.0, e)) - d;
  p.z += d;
  p.x += sin(uv.y * 3.0 + uTime * 0.7) * 0.05 * pow(1.0 - uv.y, 2.0);
  // normale par différences finies (taille de la plaque : 3.2 x 4.2)
  vec3 n = normalize(vec3(-dx / (e * 3.2), -dy / (e * 4.2), 1.0));
  vNormal = normalize(normalMatrix * n);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vView = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}`;

const frag = /* glsl */ `
uniform vec3 uC1;
uniform vec3 uC2;
uniform float uScale;
uniform float uTwill;
uniform float uFuzz;
uniform float uSlub;
uniform float uSheen;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vView;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}

void main() {
  vec2 g = vUv * vec2(uScale, uScale * 1.3);
  // Tissage : fils de chaîne et de trame + diagonale du sergé
  float warp = 0.5 + 0.5 * sin(g.x * 6.2831);
  float weft = 0.5 + 0.5 * sin(g.y * 6.2831);
  float twill = 0.5 + 0.5 * sin((g.x + g.y) * 3.1416);
  float weave = mix(warp * weft, twill, uTwill);
  float slub = noise(vec2(vUv.x * 6.0, vUv.y * 220.0)) * uSlub;  // irrégularités du fil
  float fuzz = noise(vUv * 900.0) * uFuzz;
  vec3 col = mix(uC1, uC2, clamp(weave * 0.55 + slub * 0.35 - 0.1, 0.0, 1.0));
  col *= 0.9 + fuzz * 0.18;

  vec3 N = normalize(vNormal);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(vView);
  vec3 L = normalize(vec3(-0.85, 0.35, 0.45));
  float diff = max(dot(N, L), 0.0) * 0.95 + 0.28;               // lumière enveloppante
  float sheen = pow(1.0 - max(dot(N, V), 0.0), 3.0) * uSheen;    // reflet velouté des fibres
  float ao = smoothstep(-0.2, 0.6, N.z) * 0.25 + 0.75;
  vec3 c = col * diff * ao + sheen * mix(uC2, vec3(1.0), 0.5) * 0.6;
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}`;

function initScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 11);

  const f0 = FABRICS.laine;
  const uniforms = {
    uTime: { value: 0 }, uMouse: { value: new THREE.Vector2(0.5, 0.5) }, uPush: { value: 0 },
    uC1: { value: new THREE.Color(f0.c1) }, uC2: { value: new THREE.Color(f0.c2) },
    uScale: { value: f0.scale }, uTwill: { value: f0.twill }, uFuzz: { value: f0.fuzz }, uSlub: { value: f0.slub }, uSheen: { value: f0.sheen },
  };
  const cloth = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 4.2, 160, 210),
    new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms, side: THREE.DoubleSide }),
  );
  const group = new THREE.Group();
  group.add(cloth);
  // Tringle + anneaux
  const metal = new THREE.MeshStandardMaterial({ color: '#2A2724', metalness: 0.6, roughness: 0.35 });
  const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 4.2, 16), metal);
  rail.rotation.z = Math.PI / 2; rail.position.y = 2.18;
  group.add(rail);
  for (let i = 0; i < 7; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 8, 24), metal);
    ring.position.set(-1.5 + i * 0.5, 2.13, 0);
    group.add(ring);
  }
  [-2.1, 2.1].forEach((x) => { const k = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), metal); k.position.set(x, 2.18, 0); group.add(k); });
  scene.add(group);
  scene.add(new THREE.AmbientLight('#ffffff', 1.4));
  const key = new THREE.DirectionalLight('#ffffff', 2); key.position.set(-2, 4, 5); scene.add(key);

  /* Changement de matière : transition douce des uniformes */
  let target = f0;
  const tC1 = new THREE.Color(), tC2 = new THREE.Color();
  const caption = document.querySelector('[data-fabric-caption]');
  document.querySelectorAll('[data-fabric]').forEach((b) => b.addEventListener('click', () => {
    target = FABRICS[b.dataset.fabric] || f0;
    document.querySelectorAll('[data-fabric]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    if (caption && b.dataset.caption) caption.textContent = b.dataset.caption;
    if (reduce) { snap(); render(); }
  }));
  const snap = () => {
    uniforms.uC1.value.set(target.c1); uniforms.uC2.value.set(target.c2);
    ['scale', 'twill', 'fuzz', 'slub', 'sheen'].forEach((k) => (uniforms['u' + k[0].toUpperCase() + k.slice(1)].value = target[k]));
  };
  const ease = (k) => {
    uniforms.uC1.value.lerp(tC1.set(target.c1), k);
    uniforms.uC2.value.lerp(tC2.set(target.c2), k);
    uniforms.uScale.value += (target.scale - uniforms.uScale.value) * k;
    uniforms.uTwill.value += (target.twill - uniforms.uTwill.value) * k;
    uniforms.uFuzz.value += (target.fuzz - uniforms.uFuzz.value) * k;
    uniforms.uSlub.value += (target.slub - uniforms.uSlub.value) * k;
    uniforms.uSheen.value += (target.sheen - uniforms.uSheen.value) * k;
  };

  /* Souris : position projetée sur le tissu (en coordonnées UV) */
  const pointer = new THREE.Vector2(), ray = new THREE.Raycaster();
  let push = 0;
  const host = canvas.closest('[data-scene-host]') || canvas;
  host.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObject(cloth)[0];
    if (hit) { uniforms.uMouse.value.lerp(hit.uv, 0.35); push = 0.55; }
  }, { passive: true });

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = camera.aspect < 0.8 ? 12 : 9.2;
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
    uniforms.uTime.value = reduce ? 1.2 : t;
    push *= Math.exp(-dt * 2.4);
    uniforms.uPush.value += (push - uniforms.uPush.value) * (1 - Math.exp(-dt * 5));
    ease(1 - Math.exp(-dt * 4)); // transition de matière ~0,8 s, quelle que soit la fréquence d'affichage
    group.rotation.y = -0.32 + (reduce ? 0 : Math.sin(t * 0.25) * 0.12);
    renderer.render(scene, camera);
  }
  if (reduce) return render();
  renderer.setAnimationLoop(() => visible && render());
}

document.querySelectorAll('canvas[data-scene]').forEach((c) => {
  try { initScene(c); } catch (e) { console.warn('WebGL indisponible :', e); }
});
