/* =========================================================
   Scène Three.js — « Terroir vu du ciel » (JMK Consulting Company)
   Relief agricole procédural découpé en parcelles (cacao, hévéa,
   palmier, anacarde, vivrier), courbes de niveau, balayage satellite
   qui révèle un indice de végétation (NDVI), coopératives repérées.
   Mode « trace » : flux de traçabilité des coopératives vers le port.
   Usage : <canvas data-scene="terrain" data-mode="scan|trace"></canvas>
   Boutons optionnels : [data-layer="relief|parcelles|ndvi"]
   ========================================================= */
import * as THREE from 'three';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const NOISE = /* glsl */ `
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
float height(vec2 p) { return fbm(p * 0.055 + 3.0) * 7.0 + fbm(p * 0.18) * 0.9 - 3.2; }
`;

const vert = /* glsl */ `
${NOISE}
varying vec2 vXY; varying float vH; varying vec3 vN; varying vec3 vWorld;
void main() {
  vec3 p = position;
  float h = height(p.xy);
  float e = 0.2;
  vec3 n = normalize(vec3(-(height(p.xy + vec2(e, 0.0)) - h) / e, -(height(p.xy + vec2(0.0, e)) - h) / e, 1.0));
  p.z = h;
  vXY = p.xy; vH = h;
  vec4 w = modelMatrix * vec4(p, 1.0);
  vWorld = w.xyz;
  vN = normalize(mat3(modelMatrix) * n);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

const frag = /* glsl */ `
${NOISE}
uniform float uTime, uScan, uLayer, uMix;
uniform vec3 uFog;
varying vec2 vXY; varying float vH; varying vec3 vN; varying vec3 vWorld;
vec3 crop(float k) {
  if (k < 0.30) return vec3(0.16, 0.36, 0.20);   // cacao sous ombrage
  if (k < 0.48) return vec3(0.27, 0.47, 0.22);   // hévéa
  if (k < 0.62) return vec3(0.38, 0.55, 0.20);   // palmier à huile
  if (k < 0.76) return vec3(0.62, 0.62, 0.30);   // anacarde
  if (k < 0.88) return vec3(0.55, 0.40, 0.24);   // sol nu / labour
  return vec3(0.20, 0.30, 0.16);                  // forêt
}
vec3 ndviRamp(float v) {
  vec3 a = vec3(0.78, 0.24, 0.16), b = vec3(0.95, 0.75, 0.25), c = vec3(0.18, 0.62, 0.30);
  return v < 0.5 ? mix(a, b, v * 2.0) : mix(b, c, (v - 0.5) * 2.0);
}
void main() {
  // Parcelles : grille déformée
  vec2 q = vXY * 0.16 + vec2(fbm(vXY * 0.08) * 1.4, fbm(vXY * 0.08 + 7.0) * 1.4);
  vec2 cell = floor(q), f = fract(q);
  float k = hash(cell);
  vec3 base = crop(k);
  // rangées de culture dans chaque parcelle
  float dir = hash(cell + 3.1) > 0.5 ? f.x : f.y;
  base *= 0.88 + 0.12 * smoothstep(0.35, 0.65, abs(sin(dir * 38.0)));
  float edge = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y));
  float border = 1.0 - smoothstep(0.0, 0.035, edge);
  // éclairage doux
  vec3 L = normalize(vec3(-0.5, 0.8, 0.45));
  float diff = clamp(dot(normalize(vN), L), 0.0, 1.0) * 0.75 + 0.35;
  vec3 col = base * diff;
  // couches
  float ndvi = clamp(0.25 + k * 0.7 + (fbm(vXY * 0.6) - 0.5) * 0.5 - (k > 0.76 && k < 0.88 ? 0.55 : 0.0), 0.0, 1.0);
  float contour = 1.0 - smoothstep(0.0, 0.06, abs(fract(vH * 1.6) - 0.5) * 2.0 - 0.92);
  vec3 relief = mix(vec3(0.10, 0.16, 0.30), vec3(0.85, 0.72, 0.48), smoothstep(-3.0, 4.5, vH)) * diff;
  relief = mix(relief, vec3(0.95, 0.70, 0.30), contour * 0.9);
  vec3 parcel = mix(col, vec3(0.97, 0.93, 0.82), border * 0.85);
  vec3 sat = mix(ndviRamp(ndvi) * (0.65 + diff * 0.45), vec3(0.06, 0.09, 0.18), border * 0.7);
  // balayage satellite : la couche choisie apparaît derrière la ligne
  float behind = smoothstep(uScan - 0.6, uScan + 0.6, vXY.x);
  vec3 layer = uLayer < 0.5 ? relief : (uLayer < 1.5 ? parcel : sat);
  vec3 outCol = mix(layer, col, uMix * behind);
  float beam = exp(-pow((vXY.x - uScan) * 0.9, 2.0));
  outCol += vec3(0.96, 0.66, 0.26) * beam * 0.55 * uMix;
  // grille de télédétection légère
  vec2 g = abs(fract(vXY * 0.25) - 0.5);
  outCol = mix(outCol, vec3(1.0), (1.0 - smoothstep(0.0, 0.012, min(g.x, g.y))) * 0.08);
  float d = length(vWorld.xz);
  float fog = smoothstep(22.0, 46.0, d);
  gl_FragColor = vec4(mix(outCol, uFog, fog), 1.0);
}`;

function init(canvas) {
  const mode = canvas.dataset.mode || 'scan';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const fogCol = new THREE.Color(canvas.dataset.fog || '#0E1B3D');
  renderer.setClearColor(fogCol, 1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);

  const uniforms = { uTime: { value: 0 }, uScan: { value: -30 }, uLayer: { value: { relief: 0, parcelles: 1, ndvi: 2 }[canvas.dataset.layer] ?? (mode === 'trace' ? 2 : 0) }, uMix: { value: 1 }, uFog: { value: new THREE.Vector3(fogCol.r, fogCol.g, fogCol.b) } };
  const geo = new THREE.PlaneGeometry(90, 90, 260, 260);
  const terrain = new THREE.Mesh(geo, new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms }));
  terrain.rotation.x = -Math.PI / 2;
  scene.add(terrain);

  // hauteur du relief côté CPU (même formule que le shader) pour poser les repères
  const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  const noise = (x, y) => { const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy; const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy); const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1); return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy; };
  const fbm = (x, y) => { let v = 0, a = 0.5; for (let i = 0; i < 5; i++) { v += a * noise(x, y); x *= 2.03; y *= 2.03; a *= 0.5; } return v; };
  const H = (x, y) => fbm(x * 0.055 + 3, y * 0.055 + 3) * 7 + fbm(x * 0.18, y * 0.18) * 0.9 - 3.2;
  // repères de coopératives
  const pins = new THREE.Group(); scene.add(pins);
  const pts = [];
  const rnd = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
  const pinMat = new THREE.MeshBasicMaterial({ color: 0xF2B04A });
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xF2B04A, transparent: true, opacity: 0.35, depthWrite: false });
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xF2B04A, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false });
  const rings = [];
  for (let i = 0; i < 12; i++) {
    const x = (rnd() - 0.5) * 34, y = (rnd() - 0.5) * 26;
    const h = H(x, y);
    const p = new THREE.Vector3(x, h, -y);
    pts.push(p);
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), pinMat); s.position.copy(p).y += 1.8; pins.add(s);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 6), beamMat); beam.position.copy(p).y += 0.9; pins.add(beam);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.42, 32), ringMat.clone()); ring.rotation.x = -Math.PI / 2; ring.position.copy(p).y += 0.05; ring.userData.phase = rnd(); pins.add(ring); rings.push(ring);
  }
  // flux de traçabilité vers le port (mode trace)
  const flows = [];
  if (mode === 'trace') {
    const port = new THREE.Vector3(20, H(20, -14) + 0.2, 14);
    const hub = new THREE.Mesh(new THREE.OctahedronGeometry(0.6), new THREE.MeshBasicMaterial({ color: 0xffffff })); hub.position.copy(port).y += 1.2; scene.add(hub);
    const flowMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uTime: uniforms.uTime },
      vertexShader: 'attribute float aT; varying float vT; void main(){ vT = aT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform float uTime; varying float vT; void main(){ float d = fract(vT * 6.0 - uTime * 0.6); float a = smoothstep(0.0,0.15,d) * (1.0 - smoothstep(0.35,0.5,d)); gl_FragColor = vec4(1.0, 0.78, 0.38, 0.25 + a * 0.75); }' });
    for (const p of pts) {
      const a = p.clone().setY(p.y + 1.8), b = port.clone().setY(port.y + 1.2);
      const mid = a.clone().lerp(b, 0.5); mid.y += 4 + a.distanceTo(b) * 0.12;
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const pos = curve.getPoints(64);
      const g = new THREE.BufferGeometry().setFromPoints(pos);
      g.setAttribute('aT', new THREE.BufferAttribute(new Float32Array(pos.map((_, i) => i / 64)), 1));
      const line = new THREE.Line(g, flowMat); scene.add(line); flows.push(line);
    }
  }

  // couches pilotées par des boutons
  let targetLayer = uniforms.uLayer.value;
  const host = canvas.closest('[data-scene-host]') || document;
  host.querySelectorAll('[data-layer]').forEach((btn) => btn.addEventListener('click', () => {
    targetLayer = { relief: 0, parcelles: 1, ndvi: 2 }[btn.dataset.layer];
    host.querySelectorAll('[data-layer]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    const cap = host.querySelector('[data-layer-caption]'); if (cap) cap.textContent = btn.dataset.caption || '';
    uniforms.uLayer.value = targetLayer; scanFrom = clock.elapsedTime; // nouveau balayage
  }));

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', (e) => { mouse.tx = (e.clientX / innerWidth - 0.5) * 2; mouse.ty = (e.clientY / innerHeight - 0.5) * 2; }, { passive: true });

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < 700 ? 52 : 38;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
  const clock = new THREE.Clock();
  let scanFrom = 0;
  const loop = () => {
    requestAnimationFrame(loop);
    if (!visible) return;
    const t = reduce ? 6 : clock.getElapsedTime();
    uniforms.uTime.value = t;
    // balayage de gauche à droite (le terrain d'origine réapparaît derrière la ligne, en boucle)
    const s = ((t - scanFrom) * 7) % 90;
    uniforms.uScan.value = reduce ? 60 : -45 + s;
    mouse.x += (mouse.tx - mouse.x) * 0.04; mouse.y += (mouse.ty - mouse.y) * 0.04;
    const ang = (reduce ? 0.4 : t * 0.04) + mouse.x * 0.25;
    const r = mode === 'trace' ? 40 : 36;
    camera.position.set(Math.sin(ang) * r, 20 + mouse.y * 3, Math.cos(ang) * r);
    camera.lookAt(0, -1, 0);
    rings.forEach((ring) => { const k = ((t * 0.6 + ring.userData.phase) % 1); ring.scale.setScalar(1 + k * 3); ring.material.opacity = 0.8 * (1 - k); });
    renderer.render(scene, camera);
  };
  loop();
  canvas.addEventListener('webglcontextlost', (e) => e.preventDefault());
}

document.querySelectorAll('canvas[data-scene="terrain"]').forEach((c) => {
  try { init(c); } catch (e) { c.closest('[data-scene-host]')?.classList.add('no-webgl'); console.warn('3D indisponible', e); }
});
