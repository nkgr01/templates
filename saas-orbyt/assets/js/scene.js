/* =========================================================
   Scène Three.js — « Blob iridescent » (Orbyt)
   Shader GLSL custom : bruit simplex 3D + recalcul des normales,
   fresnel et dégradé violet/cyan/rose, anneaux de particules.
   Usage : <canvas data-scene="blob"></canvas>  (hero)
           <canvas data-scene="mini"></canvas>  (pages intérieures)
   ========================================================= */
import * as THREE from 'three';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uFreq;
varying vec3 vNormal;
varying vec3 vView;
varying float vDisp;
${NOISE}
float disp(vec3 p){
  vec3 n = normalize(p);
  return (snoise(n * uFreq + uTime * .22) + .35 * snoise(n * uFreq * 2.3 - uTime * .17)) * uAmp;
}
void main(){
  vec3 n = normalize(position);
  float d = disp(position);
  vec3 p = position + n * d;
  // Normales recalculées par différences finies
  vec3 t = normalize(cross(n, abs(n.y) < .99 ? vec3(0., 1., 0.) : vec3(1., 0., 0.)));
  vec3 b = normalize(cross(n, t));
  float e = .015;
  vec3 pt = position + t * e; pt += normalize(pt) * disp(pt);
  vec3 pb = position + b * e; pb += normalize(pb) * disp(pb);
  vec3 nn = normalize(cross(pt - p, pb - p));
  if (dot(nn, n) < 0.) nn = -nn;
  vDisp = d;
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  vView = normalize(-mv.xyz);
  vNormal = normalize(normalMatrix * nn);
  gl_Position = projectionMatrix * mv;
}`;

const fragmentShader = /* glsl */ `
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vView;
varying float vDisp;
void main(){
  vec3 n = normalize(vNormal);
  vec3 v = normalize(vView);
  float fres = pow(1. - max(dot(n, v), 0.), 2.4);
  float m = clamp(vDisp * 2.2 + .5, 0., 1.);
  vec3 col = mix(uC1, uC2, smoothstep(.15, .85, m));
  col = mix(col, uC3, smoothstep(.55, 1., fres + sin(uTime * .4 + n.y * 3.) * .15));
  vec3 L = normalize(vec3(.5, .8, .6));
  float diff = max(dot(n, L), 0.);
  float spec = pow(max(dot(reflect(-L, n), v), 0.), 40.);
  col = col * (.28 + .8 * diff) + spec * .7 + fres * .35;
  gl_FragColor = vec4(col, 1.);
  #include <colorspace_fragment>
}`;

function ringPoints(count, radius, spread, color, size) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = radius + (Math.random() - 0.5) * spread;
    pos.set([Math.cos(a) * r, (Math.random() - 0.5) * spread * 0.25, Math.sin(a) * r], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ color, size, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
}

function initScene(canvas) {
  const mini = canvas.dataset.scene === 'mini';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 7);

  const uniforms = {
    uTime: { value: 0 },
    uAmp: { value: mini ? 0.22 : 0.3 },
    uFreq: { value: 1.25 },
    uC1: { value: new THREE.Color('#5B3DF0') },
    uC2: { value: new THREE.Color('#22D3EE') },
    uC3: { value: new THREE.Color('#F472B6') },
  };
  const blob = new THREE.Mesh(
    new THREE.IcosahedronGeometry(mini ? 1.4 : 1.65, mini ? 48 : 72),
    new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms }),
  );
  scene.add(blob);

  const rings = new THREE.Group();
  if (!mini) {
    const r1 = ringPoints(1400, 2.8, 0.5, '#7C5CFF', 0.022);
    const r2 = ringPoints(900, 3.4, 0.25, '#22D3EE', 0.018);
    r1.rotation.x = 1.2; r2.rotation.x = 1.4; r2.rotation.z = 0.5;
    rings.add(r1, r2);
    scene.add(rings);
  }

  const pointer = { x: 0, y: 0 }, eased = { x: 0, y: 0 };
  let energy = 0;
  window.addEventListener('pointermove', (e) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    energy = Math.min(1, energy + Math.hypot(nx - pointer.x, ny - pointer.y) * 2);
    pointer.x = nx; pointer.y = ny;
  }, { passive: true });

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = camera.aspect < 1 ? 9.5 : 7;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  const baseAmp = uniforms.uAmp.value;
  const clock = new THREE.Clock();
  const render = () => {
    const t = clock.getElapsedTime();
    eased.x += (pointer.x - eased.x) * 0.05;
    eased.y += (pointer.y - eased.y) * 0.05;
    energy *= 0.96;
    uniforms.uTime.value = t;
    uniforms.uAmp.value = baseAmp + energy * 0.18;
    blob.rotation.y = t * 0.12 + eased.x * 0.6;
    blob.rotation.x = eased.y * 0.4;
    rings.rotation.y = t * 0.08;
    rings.rotation.x = eased.y * 0.2;
    renderer.render(scene, camera);
  };

  if (reduce) { render(); return; }
  renderer.setAnimationLoop(() => { if (visible) render(); });
}

document.querySelectorAll('canvas[data-scene]').forEach((c) => {
  try { initScene(c); } catch (e) { console.warn('WebGL indisponible :', e); }
});
