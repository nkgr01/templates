/* =========================================================
   Scène Three.js — « Grille urbaine » (Norden)
   InstancedMesh de blocs en vue isométrique : vague continue
   + onde de choc qui suit la souris (raycast sur le sol).
   Usage : <canvas data-scene="city"></canvas>  (hero accueil)
           <canvas data-scene="mini"></canvas>  (pages intérieures)
   ========================================================= */
import * as THREE from 'three';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

function initScene(canvas) {
  const mini = canvas.dataset.scene === 'mini';
  const N = mini ? 16 : 26;          // blocs par côté
  const GAP = 1.08;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = !mini;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  camera.position.set(30, 28, 30);
  camera.lookAt(0, 0, 0);

  /* Lumières */
  scene.add(new THREE.HemisphereLight('#ffffff', '#b9b2a4', 1.6));
  const sun = new THREE.DirectionalLight('#fff6ea', 2.2);
  sun.position.set(-18, 30, 12);
  sun.castShadow = !mini;
  sun.shadow.mapSize.set(2048, 2048);
  const s = N * 0.75;
  Object.assign(sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 1, far: 90 });
  scene.add(sun);

  /* Sol (reçoit les ombres) */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.12 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  /* Blocs instanciés */
  const geo = new THREE.BoxGeometry(0.92, 1, 0.92);
  geo.translate(0, 0.5, 0);
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.0 });
  const count = N * N;
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.castShadow = !mini;
  mesh.receiveShadow = !mini;
  scene.add(mesh);

  const cells = [];
  const color = new THREE.Color();
  const palette = { base: '#ECE9E2', ink: '#1A1A1A', flame: '#FF5B1F', stone: '#CFC9BD' };
  const off = ((N - 1) * GAP) / 2;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const x = i * GAP - off, z = j * GAP - off;
      const r = Math.random();
      const kind = r < 0.035 ? 'flame' : r < 0.09 ? 'ink' : r < 0.25 ? 'stone' : 'base';
      cells.push({ x, z, d: Math.hypot(x, z), base: 0.25 + Math.random() * 0.6, tall: kind === 'flame' || kind === 'ink' ? 1.8 : 1 });
      mesh.setColorAt(cells.length - 1, color.set(palette[kind]));
    }
  }
  mesh.instanceColor.needsUpdate = true;

  /* Souris -> point sur le sol */
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2(10, 10);
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hit = new THREE.Vector3(999, 0, 999);
  const target = new THREE.Vector3(999, 0, 999);
  let hover = 0, hoverTarget = 0;
  window.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    if (e.clientY < r.top || e.clientY > r.bottom) { hoverTarget = 0; return; }
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    if (raycaster.ray.intersectPlane(plane, target)) hoverTarget = 1;
  }, { passive: true });

  /* Cadrage orthographique responsive */
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    const aspect = w / h;
    let view = N * (mini ? 0.62 : 0.56);
    if (aspect < 1) view /= Math.max(aspect, 0.55) * 1.1;
    camera.left = -view * aspect; camera.right = view * aspect;
    camera.top = view; camera.bottom = -view;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  const dummy = new THREE.Object3D();
  const clock = new THREE.Clock();
  const render = () => {
    const t = clock.getElapsedTime();
    hover += (hoverTarget - hover) * 0.06;
    hit.lerp(target, 0.12);
    for (let k = 0; k < cells.length; k++) {
      const c = cells[k];
      const wave = Math.sin(c.d * 0.55 - t * 1.4) * 0.5 + 0.5;
      const dx = c.x - hit.x, dz = c.z - hit.z;
      const bump = Math.exp(-(dx * dx + dz * dz) / 7) * 4.2 * hover;
      const h = (c.base + wave * 1.1) * c.tall + bump;
      dummy.position.set(c.x, 0, c.z);
      dummy.scale.set(1, h, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(k, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    scene.rotation.y = Math.sin(t * 0.08) * 0.08;
    renderer.render(scene, camera);
  };

  if (reduce) { render(); return; }
  renderer.setAnimationLoop(() => { if (visible) render(); });
}

document.querySelectorAll('canvas[data-scene]').forEach((c) => {
  try { initScene(c); } catch (e) { console.warn('WebGL indisponible :', e); }
});
