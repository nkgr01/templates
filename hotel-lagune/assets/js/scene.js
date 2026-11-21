/* =========================================================
   Scène Three.js — « Lagune au fil du jour » (Lagune Lodge)
   Eau animée (vagues dans le vertex shader, reflets de Fresnel et
   scintillement du soleil), ciel en dégradé avec disque solaire,
   ponton et bungalow sur pilotis. Boutons [data-sky="aube|midi|coucher"].
   Usage : <canvas data-scene="lagoon"></canvas>
   ========================================================= */
import * as THREE from 'three';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const SKIES = {
  aube: { top: '#7C8FB8', hor: '#F7C6A3', sun: '#FFD9B0', deep: '#2E4E6B', shallow: '#7FA9B5', elev: 0.06, az: -0.5, light: 0.8 },
  midi: { top: '#3E8FD0', hor: '#CFEAF5', sun: '#FFFFFF', deep: '#0B6B78', shallow: '#3FC1C0', elev: 0.55, az: 0.2, light: 1.5 },
  coucher: { top: '#2B2A55', hor: '#FF9A5C', sun: '#FFB36B', deep: '#1E2E4A', shallow: '#C76B4E', elev: 0.04, az: 0.35, light: 0.9 },
};

const waterVert = /* glsl */ `
uniform float uTime;
varying vec3 vWorld;
varying vec3 vNormal;
float h(vec2 p) {
  return sin(p.x * 0.35 + uTime * 0.9) * 0.18 + sin(p.y * 0.5 + uTime * 1.2) * 0.12
       + sin((p.x + p.y) * 0.9 + uTime * 1.7) * 0.05 + sin((p.x * 1.7 - p.y * 1.3) + uTime * 2.3) * 0.025;
}
void main() {
  vec3 p = position;
  vec2 q = p.xy;
  float e = 0.15;
  float z = h(q);
  vec3 n = normalize(vec3(-(h(q + vec2(e, 0.0)) - z) / e, -(h(q + vec2(0.0, e)) - z) / e, 1.0));
  p.z += z;
  vec4 w = modelMatrix * vec4(p, 1.0);
  vWorld = w.xyz;
  vNormal = normalize(mat3(modelMatrix) * n);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
const waterFrag = /* glsl */ `
uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uSky; uniform vec3 uSunCol; uniform vec3 uSunDir; uniform float uTime;
varying vec3 vWorld; varying vec3 vNormal;
void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorld);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 4.0);
  float dist = clamp(length(vWorld.xz) / 60.0, 0.0, 1.0);
  vec3 base = mix(uShallow, uDeep, smoothstep(0.0, 0.6, dist));
  vec3 col = mix(base, uSky, fres * 0.85 + dist * 0.25);
  vec3 R = reflect(-V, N);
  float spec = pow(max(dot(R, normalize(uSunDir)), 0.0), 220.0);
  float glint = pow(max(dot(R, normalize(uSunDir)), 0.0), 18.0) * 0.18;
  col += uSunCol * (spec * 2.2 + glint);
  col = mix(col, uSky, smoothstep(0.55, 1.0, dist));
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;
const skyVert = /* glsl */ `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const skyFrag = /* glsl */ `
uniform vec3 uTop; uniform vec3 uHor; uniform vec3 uSunCol; uniform vec3 uSunDir;
varying vec3 vDir;
void main() {
  float y = max(vDir.y, 0.0);
  vec3 col = mix(uHor, uTop, pow(y, 0.55));
  float s = max(dot(normalize(vDir), normalize(uSunDir)), 0.0);
  col += uSunCol * (smoothstep(0.9975, 0.999, s) * 1.6 + pow(s, 60.0) * 0.45 + pow(s, 8.0) * 0.12);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

function initScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 500);
  camera.position.set(0, 3.2, 16);

  const s0 = SKIES.coucher;
  const U = {
    uTime: { value: 0 }, uDeep: { value: new THREE.Color(s0.deep) }, uShallow: { value: new THREE.Color(s0.shallow) },
    uSky: { value: new THREE.Color(s0.hor) }, uSunCol: { value: new THREE.Color(s0.sun) }, uSunDir: { value: new THREE.Vector3() },
    uTop: { value: new THREE.Color(s0.top) }, uHor: { value: new THREE.Color(s0.hor) },
  };
  const water = new THREE.Mesh(new THREE.PlaneGeometry(220, 220, 220, 220), new THREE.ShaderMaterial({ vertexShader: waterVert, fragmentShader: waterFrag, uniforms: U }));
  water.rotation.x = -Math.PI / 2;
  scene.add(water);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(200, 48, 24), new THREE.ShaderMaterial({ vertexShader: skyVert, fragmentShader: skyFrag, uniforms: U, side: THREE.BackSide, depthWrite: false }));
  scene.add(sky);

  // Ponton + bungalow sur pilotis
  const wood = new THREE.MeshStandardMaterial({ color: '#8A6A4A', roughness: 0.85 });
  const thatch = new THREE.MeshStandardMaterial({ color: '#C9A46A', roughness: 1 });
  const glow = new THREE.MeshStandardMaterial({ color: '#FFD8A0', emissive: '#FFB25E', emissiveIntensity: 0 });
  const lodge = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 12), wood); deck.position.set(0, 0.55, 3); lodge.add(deck);
  for (let z = -2.5; z <= 8.5; z += 1.6) [-0.6, 0.6].forEach((x) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.6, 8), wood); p.position.set(x, -0.2, z); lodge.add(p); });
  const platform = new THREE.Mesh(new THREE.BoxGeometry(5, 0.15, 4.4), wood); platform.position.set(0, 0.55, -4.4); lodge.add(platform);
  for (let x = -2; x <= 2; x += 2) for (let z = -6.2; z <= -2.6; z += 1.8) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.8, 8), wood); p.position.set(x, -0.3, z); lodge.add(p); }
  const hut = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.9, 3), new THREE.MeshStandardMaterial({ color: '#EFE3CC', roughness: 0.9 })); hut.position.set(0, 1.58, -4.7); lodge.add(hut);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.1), glow); win.position.set(0, 1.55, -3.19); lodge.add(win);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.4, 2, 4), thatch); roof.rotation.y = Math.PI / 4; roof.position.set(0, 3.5, -4.7); roof.scale.set(1, 1, 0.92); lodge.add(roof);
  lodge.position.set(-5.5, 0, -6); lodge.rotation.y = 0.5;
  scene.add(lodge);
  // Palmiers stylisés sur une île au loin
  const island = new THREE.Group();
  const sandM = new THREE.MeshStandardMaterial({ color: '#D9C9A3', roughness: 1 });
  const isl = new THREE.Mesh(new THREE.SphereGeometry(6, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), sandM); isl.scale.set(1, 0.12, 0.6); island.add(isl);
  const leafM = new THREE.MeshStandardMaterial({ color: '#2F5A3A', roughness: 0.8, side: THREE.DoubleSide });
  [[-2, 0], [0.5, 0.5], [2.5, -0.4]].forEach(([x, z], i) => {
    const h = 3.2 + i * 0.5;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, h, 6), wood); trunk.position.set(x, h / 2, z); trunk.rotation.z = (i - 1) * 0.15; island.add(trunk);
    for (let k = 0; k < 6; k++) { const leaf = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.5), leafM); leaf.position.set(x + (i - 1) * 0.25, h, z); leaf.rotation.set(-0.5, (k / 6) * Math.PI * 2, 0.4); leaf.translateX(1); island.add(leaf); }
  });
  island.position.set(14, 0, -40);
  scene.add(island);

  const hemi = new THREE.HemisphereLight('#ffffff', '#335566', 1); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#ffffff', 1.5); scene.add(sun);

  /* Heure du jour */
  let target = s0, mix = 1;
  const from = { ...s0 };
  const cur = { top: new THREE.Color(), hor: new THREE.Color(), sun: new THREE.Color(), deep: new THREE.Color(), shallow: new THREE.Color(), elev: s0.elev, az: s0.az, light: s0.light };
  const A = {}, B = {};
  const snapshot = (o, s) => { ['top', 'hor', 'sun', 'deep', 'shallow'].forEach((k) => (o[k] = new THREE.Color(s[k]))); o.elev = s.elev; o.az = s.az; o.light = s.light; };
  snapshot(A, s0); snapshot(B, s0);
  const caption = document.querySelector('[data-sky-caption]');
  document.querySelectorAll('[data-sky]').forEach((b) => b.addEventListener('click', () => {
    snapshot(A, { top: '#' + cur.top.getHexString(), hor: '#' + cur.hor.getHexString(), sun: '#' + cur.sun.getHexString(), deep: '#' + cur.deep.getHexString(), shallow: '#' + cur.shallow.getHexString(), elev: cur.elev, az: cur.az, light: cur.light });
    snapshot(B, SKIES[b.dataset.sky]);
    mix = reduce ? 1 : 0;
    document.querySelectorAll('[data-sky]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    if (caption && b.dataset.caption) caption.textContent = b.dataset.caption;
    if (reduce) render();
  }));
  const apply = (k) => {
    ['top', 'hor', 'sun', 'deep', 'shallow'].forEach((c) => cur[c].copy(A[c]).lerp(B[c], k));
    cur.elev = A.elev + (B.elev - A.elev) * k; cur.az = A.az + (B.az - A.az) * k; cur.light = A.light + (B.light - A.light) * k;
    U.uTop.value.copy(cur.top); U.uHor.value.copy(cur.hor); U.uSky.value.copy(cur.hor); U.uSunCol.value.copy(cur.sun);
    U.uDeep.value.copy(cur.deep); U.uShallow.value.copy(cur.shallow);
    U.uSunDir.value.set(Math.sin(cur.az) * Math.cos(cur.elev), Math.sin(cur.elev), -Math.cos(cur.az) * Math.cos(cur.elev));
    sun.position.copy(U.uSunDir.value).multiplyScalar(50); sun.color.copy(cur.sun); sun.intensity = cur.light;
    hemi.color.copy(cur.hor); hemi.intensity = 0.4 + cur.light * 0.4;
    glow.emissiveIntensity = cur.elev < 0.1 ? 1.4 : 0.1;
  };

  const pointer = new THREE.Vector2(), eased = new THREE.Vector2();
  const host = canvas.closest('[data-scene-host]') || canvas;
  host.addEventListener('pointermove', (e) => { const r = canvas.getBoundingClientRect(); pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1); }, { passive: true });

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = camera.aspect < 1 ? 55 : 38;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
  const clock = new THREE.Clock();
  let last = 0;
  function render() {
    const t = reduce ? 3 : clock.getElapsedTime();
    const dt = Math.min(0.1, t - last); last = t;
    mix = Math.min(1, mix + dt / 2.2);
    apply(mix < 1 ? mix * mix * (3 - 2 * mix) : 1);
    U.uTime.value = t;
    eased.lerp(pointer, 1 - Math.exp(-dt * 2.5));
    camera.position.set(Math.sin(t * 0.05) * 1.5 + eased.x * 1.5, 3.2 - eased.y * 0.6, 16);
    camera.lookAt(0, 1.6, -20);
    lodge.position.y = Math.sin(t * 0.9) * 0.03;
    renderer.render(scene, camera);
  }
  if (reduce) return render();
  renderer.setAnimationLoop(() => visible && render());
}

document.querySelectorAll('canvas[data-scene]').forEach((c) => {
  try { initScene(c); } catch (e) { console.warn('WebGL indisponible :', e); }
});
