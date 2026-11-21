/* =========================================================
   Scène Three.js — « Cellule & hélice » (Aelia)
   Nuage de particules en shader GLSL : une sphère qui « respire »
   (bruit 3D) et une double hélice pour les pages intérieures.
   Usage : <canvas data-scene="cell"></canvas>  (accueil)
           <canvas data-scene="helix"></canvas> (pages intérieures)
   ========================================================= */
import * as THREE from 'three';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Bruit simplex 3D (Ashima Arts / Stefan Gustavson, licence MIT)
const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
`;

const vertex = /* glsl */ `
uniform float uTime; uniform float uAmp; uniform float uSize; uniform float uPixel;
attribute float aRand;
varying float vMix; varying float vAlpha;
${noise}
void main(){
  vec3 p = position;
  float n = snoise(p * 0.9 + uTime * 0.25);
  p += normalize(p) * n * uAmp;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixel * (0.6 + aRand * 0.8) * (6.0 / -mv.z);
  vMix = n * 0.5 + 0.5;
  vAlpha = smoothstep(-7.5, -4.0, mv.z) * 0.75 + 0.25;
}`;

const fragment = /* glsl */ `
uniform vec3 uA; uniform vec3 uB;
varying float vMix; varying float vAlpha;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.1, d) * vAlpha;
  gl_FragColor = vec4(mix(uA, uB, vMix), a);
  #include <colorspace_fragment>
}`;

function fibonacciSphere(n, r) {
  const pos = new Float32Array(n * 3);
  const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const t = g * i;
    const rr = r * (0.92 + Math.random() * 0.16);
    pos.set([Math.cos(t) * rad * rr, y * rr, Math.sin(t) * rad * rr], i * 3);
  }
  return pos;
}

function helix(n, turns, radius, height) {
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const strand = i % 3; // 0 et 1 = brins, 2 = barreaux
    const k = Math.floor(i / 3) / (n / 3);
    const a = k * turns * Math.PI * 2;
    const y = (k - 0.5) * height;
    if (strand < 2) {
      const off = strand * Math.PI;
      pos.set([Math.cos(a + off) * radius + (Math.random() - 0.5) * 0.08, y, Math.sin(a + off) * radius + (Math.random() - 0.5) * 0.08], i * 3);
    } else {
      const s = Math.random() * 2 - 1; // point sur le barreau
      pos.set([Math.cos(a) * radius * s, y, Math.sin(a) * radius * s], i * 3);
    }
  }
  return pos;
}

function initScene(canvas) {
  const kind = canvas.dataset.scene;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const dpr = Math.min(devicePixelRatio, 2);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.z = 6;

  const count = kind === 'cell' ? 16000 : 5000;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(kind === 'cell' ? fibonacciSphere(count, 1.9) : helix(count, 3.2, 0.9, 6), 3));
  const rand = new Float32Array(count).map(() => Math.random());
  geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));

  const uniforms = {
    uTime: { value: 0 },
    uAmp: { value: kind === 'cell' ? 0.28 : 0.08 },
    uSize: { value: kind === 'cell' ? 5.2 : 5 },
    uPixel: { value: dpr },
    uA: { value: new THREE.Color('#0E7C6B') },
    uB: { value: new THREE.Color('#4FB89E') },
  };
  const mat = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms, transparent: true, depthWrite: false });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // Anneau d'orbite autour de la cellule
  let ring;
  if (kind === 'cell') {
    const rc = 1400, rp = new Float32Array(rc * 3);
    for (let i = 0; i < rc; i++) {
      const a = Math.random() * Math.PI * 2, r = 2.7 + Math.random() * 0.35;
      rp.set([Math.cos(a) * r, (Math.random() - 0.5) * 0.12, Math.sin(a) * r], i * 3);
    }
    const rg = new THREE.BufferGeometry();
    rg.setAttribute('position', new THREE.BufferAttribute(rp, 3));
    rg.setAttribute('aRand', new THREE.BufferAttribute(new Float32Array(rc).map(() => Math.random()), 1));
    ring = new THREE.Points(rg, new THREE.ShaderMaterial({
      vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: false,
      uniforms: { ...uniforms, uAmp: { value: 0 }, uSize: { value: 3.4 }, uA: { value: new THREE.Color('#F2A88A') }, uB: { value: new THREE.Color('#0E7C6B') } },
    }));
    ring.rotation.set(1.15, 0, 0.35);
    scene.add(ring);
  } else {
    points.rotation.z = 0.5;
  }

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
    camera.position.z = camera.aspect < 0.9 ? 7.5 : 6;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);

  const clock = new THREE.Clock();
  const render = () => {
    const t = clock.getElapsedTime();
    uniforms.uTime.value = t;
    eased.x += (pointer.x - eased.x) * 0.04;
    eased.y += (pointer.y - eased.y) * 0.04;
    points.rotation.y = t * (kind === 'cell' ? 0.08 : 0.35) + eased.x * 0.4;
    points.rotation.x = eased.y * 0.25;
    if (ring) ring.rotation.z = 0.35 + t * 0.05;
    renderer.render(scene, camera);
  };

  if (reduce) return render();
  renderer.setAnimationLoop(() => visible && render());
}

document.querySelectorAll('canvas[data-scene]').forEach((c) => {
  try { initScene(c); } catch (e) { console.warn('WebGL indisponible :', e); }
});
