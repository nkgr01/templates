/* =========================================================
   aurora.js — Fond « aurore » en WebGL pur (sans bibliothèque)
   Fragment shader fBm animé, réactif à la souris.
   Usage : <canvas data-aurora></canvas>
   Script classique : fonctionne même en ouvrant le fichier en local.
   ========================================================= */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FS = `
precision highp float;
uniform vec2 r; uniform float t; uniform vec2 m;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r; vec2 p=uv; p.x*=r.x/r.y;
  float tt=t*.07;
  vec2 q=vec2(fbm(p*1.3+tt), fbm(p*1.3-tt+3.1));
  float f=fbm(p*1.6+q*1.8+m*.35+vec2(tt*.6,-tt*.3));
  vec3 c1=vec3(.486,.361,1.), c2=vec3(.133,.827,.933), c3=vec3(.957,.447,.714);
  vec3 col=mix(c1,c2,smoothstep(.35,.75,f));
  col=mix(col,c3,smoothstep(.6,.95,q.y));
  float band=smoothstep(.25,.85,f)*(.35+.65*smoothstep(1.,.1,abs(uv.y-.45)*1.6));
  vec3 bg=vec3(.027,.027,.043);
  col=mix(bg,col,band*.9);
  col+=(h(gl_FragCoord.xy+t)-.5)*.035;
  gl_FragColor=vec4(col,1.);
}`;

  function init(canvas) {
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return;
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Triangle plein écran
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uR = gl.getUniformLocation(prog, 'r');
    const uT = gl.getUniformLocation(prog, 't');
    const uM = gl.getUniformLocation(prog, 'm');
    const mouse = [0, 0], eased = [0, 0];

    canvas.parentElement.addEventListener('pointermove', (e) => {
      const b = canvas.getBoundingClientRect();
      mouse[0] = (e.clientX - b.left) / b.width - 0.5;
      mouse[1] = 0.5 - (e.clientY - b.top) / b.height;
    });

    const dpr = Math.min(window.devicePixelRatio, 1.5);
    const resize = () => {
      canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    new ResizeObserver(resize).observe(canvas);
    resize();

    let visible = false;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

    const start = performance.now();
    const draw = () => {
      eased[0] += (mouse[0] - eased[0]) * 0.04;
      eased[1] += (mouse[1] - eased[1]) * 0.04;
      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.uniform1f(uT, (performance.now() - start) / 1000 + 20);
      gl.uniform2f(uM, eased[0], eased[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    if (reduce) { draw(); return; }
    const loop = () => { if (visible) draw(); requestAnimationFrame(loop); };
    loop();
  }

  const run = () => document.querySelectorAll('canvas[data-aurora]').forEach((c) => {
    try { init(c); } catch (e) { console.warn('Aurora WebGL :', e); }
  });
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', run) : run();
})();
