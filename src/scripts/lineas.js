/**
 * Motor de la línea de tiempo «De mar a montaña» (portado de diseno/lineas.js).
 *
 * - CaelLines: en un canvas 2D, 40 trazos se transforman entre las figuras
 *   (olas, amonita, volcán, bosque) y las líneas del texto de cada paso,
 *   según el avance del scroll (0 a 7).
 * - CaelMorph: en WebGL, funde una foto con la siguiente con un borde de niebla.
 *
 * Se conserva el algoritmo original del diseño; solo se convirtió en módulo.
 */
// @ts-nocheck

  const M = 40, K = 120;
  const rnd = i => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  const ease = e => e < .5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  const len = p => { let L = 0; for (let i = 1; i < p.length; i++) L += dist(p[i - 1], p[i]); return L; };
  function resample(p, n) {
    if (p.length < 2) p = [p[0], p[0]];
    const L = len(p) || 1, out = []; let seg = 0, acc = 0;
    for (let i = 0; i < n; i++) {
      const t = L * i / (n - 1);
      while (seg < p.length - 2 && acc + dist(p[seg], p[seg + 1]) < t) { acc += dist(p[seg], p[seg + 1]); seg++; }
      const a = p[seg], b = p[seg + 1], sl = dist(a, b) || 1, u = clamp((t - acc) / sl, 0, 1);
      out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
    }
    return out;
  }
  function keepResample(p, n) {
    if (p.length >= n || p.length < 2) return resample(p, n);
    const segs = []; for (let i = 1; i < p.length; i++) segs.push(dist(p[i - 1], p[i]));
    const L = segs.reduce((a, b) => a + b, 0) || 1, extra = n - p.length, cnt = segs.map(s => Math.floor(extra * s / L));
    let left = extra - cnt.reduce((a, b) => a + b, 0);
    const order = segs.map((s, i) => [extra * s / L - cnt[i], i]).sort((a, b) => b[0] - a[0]);
    for (let k = 0; k < left; k++) cnt[order[k % order.length][1]]++;
    const out = [p[0]];
    for (let i = 1; i < p.length; i++) { const a = p[i - 1], b = p[i], c = cnt[i - 1]; for (let j = 1; j <= c; j++) { const u = j / (c + 1); out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]); } out.push(b); }
    return out;
  }
  function splitHalf(p) {
    const L = len(p), half = L / 2; let acc = 0;
    for (let i = 1; i < p.length; i++) { const s = dist(p[i - 1], p[i]); if (acc + s >= half) { const u = (half - acc) / (s || 1), m = [p[i - 1][0] + (p[i][0] - p[i - 1][0]) * u, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * u]; return [p.slice(0, i).concat([m]), [m].concat(p.slice(i))]; } acc += s; }
    return [p, p];
  }
  function normalize(strokes) {
    let s = strokes.filter(x => x.p.length > 1 && len(x.p) > .5);
    if (!s.length) s = [{ p: [[0, 0], [1, 0]], w: 1 }];
    while (s.length > M) { s.sort((a, b) => len(b.p) - len(a.p)); s.pop(); }
    while (s.length < M) {
      let bi = 0, bl = -1; s.forEach((x, i) => { const l = len(x.p); if (l > bl) { bl = l; bi = i; } });
      const x = s[bi], [pa, pb] = splitHalf(x.p);
      s.splice(bi, 1, { p: pa, w: x.w }, { p: pb, w: x.w });
    }
    s = s.map(x => {
      let p = keepResample(x.p, K); if (p[0][0] > p[K - 1][0]) p = p.reverse();
      return { p, w: x.w, cy: p.reduce((a, q) => a + q[1], 0) / K, cx: p.reduce((a, q) => a + q[0], 0) / K };
    });
    s.sort((a, b) => (Math.round(a.cy / 12) - Math.round(b.cy / 12)) || a.cx - b.cx);
    return s;
  }
  const G = {
    waves(w, h) {
      const out = [];
      const rows = [[.4, 3, .11, 0], [.56, 4, .085, 0], [.7, 5, .065, 0]];
      rows.forEach(([yb, n, A, off], ri) => {
        const lam = w * .9 / n, H = h * A, r = H * .5;
        for (let c = 0; c < n; c++) {
          const x0 = w * .03 + c * lam + (ri % 2 ? lam * .0 : 0), xc = x0 + lam * .62, yc = yb * h - H, back = [];
          for (let u = 0; u <= 1; u += .05) back.push([x0 + (xc - x0) * u, yb * h - H * Math.pow(Math.sin(u * Math.PI / 2), 1.6)]);
          for (let f = 0; f <= 1.35 * Math.PI; f += .18) { const rr = r * (1 - f / (1.9 * Math.PI) * .55); back.push([xc + rr * Math.sin(f), yc + r - rr * Math.cos(f) + (r - rr) * .2]); }
          const front = [], fx = xc + r * .55, fy = yc + r * 1.6, ex = x0 + lam;
          for (let u = 0; u <= 1; u += .1) front.push([fx + (ex - fx) * u, fy + (yb * h - fy) * Math.pow(u, .55)]);
          const keep = p => p;
          [back, front].map(keep).forEach(p => { if (p.length > 2) out.push(p); });
        }
      });
      [.8, .87].forEach((y, i) => { const p = []; for (let X = w * .04; X <= w * .96; X += 6) p.push([X, h * y + Math.sin(X / w * 14 + i * 2) * h * .008]); out.push(p); });
      return out;
    },
    ammonite(w, h) {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * .4, b = .14, tMax = 6 * Math.PI, a = R / Math.exp(b * tMax), r = t => a * Math.exp(b * t);
      const sp = []; for (let t = 0; t <= tMax; t += .05) sp.push([cx + r(t) * Math.cos(t), cy + r(t) * Math.sin(t)]);
      const out = [sp];
      for (let t = 2 * Math.PI + .25; t <= tMax; t += .5) { const r0 = r(t - 2 * Math.PI), r1 = r(t); out.push([[cx + r0 * Math.cos(t), cy + r0 * Math.sin(t)], [cx + r1 * Math.cos(t), cy + r1 * Math.sin(t)]]); }
      return out;
    },
    volcano(w, h) {
      const by = h * .86, cx = w / 2, bw = Math.min(w * .94, h * 1.25), tw = bw * .13, ty = h * .44, out = [];
      const half = u => tw / 2 + (bw / 2 - tw / 2) * Math.pow(u, 1.7);
      const flank = (side, seed) => { const p = []; for (let u = 0; u <= 1.0001; u += .025) {
        const bump = Math.sin(u * 19 + seed) * .012 + Math.sin(u * 47 + seed * 2) * .005 + (side < 0 ? Math.exp(-Math.pow((u - .42) / .08, 2)) * .035 : Math.exp(-Math.pow((u - .6) / .1, 2)) * .025);
        p.push([cx + side * (half(u) + bump * bw), ty + (by - ty) * u - (u > .05 ? Math.sin(u * 31 + seed) * h * .004 : 0)]); } return p; };
      const L = flank(-1, 1.3).reverse(), Rr = flank(1, 4.1);
      const crater = [[cx - tw / 2, ty], [cx - tw * .32, ty + h * .012], [cx - tw * .12, ty + h * .04], [cx + tw * .08, ty + h * .034], [cx + tw * .3, ty + h * .008], [cx + tw / 2, ty - h * .006]];
      out.push(L.concat(crater, Rr));
      [[-.78, .1, .62], [-.55, .06, .82], [-.3, .12, .5], [-.08, .2, .9], [.2, .1, .7], [.45, .07, .86], [.7, .14, .58]].forEach(([fr, u0, u1], k) => {
        const p = []; for (let u = u0; u <= u1; u += .03) p.push([cx + fr * half(u) + Math.sin(u * 23 + k) * w * .004, ty + (by - ty) * u]); out.push(p);
      });
      [[0, .06, .035], [.045, .13, .045], [-.03, .21, .055], [.05, .29, .04]].forEach(([dx, dy, rr], k) => { const p = []; for (let a = 0; a <= 5.4; a += .2) { const q = rr * h * (1 - a / 9); p.push([cx + dx * h + Math.cos(a + 2 + k) * q, ty - dy * h + Math.sin(a + 2 + k) * q]); } out.push(p); });
      const g = []; for (let X = w * .02; X <= w * .98; X += 6) g.push([X, by + Math.sin(X / w * 9) * h * .006]); out.push(g);
      return out;
    },
    forest(w, h, v) {
      const base = h * .82, u = Math.min(w, h * 1.2), out = [];
      const trees = [];
      [[.25, .46], [.5, .64], [.75, .5]].forEach(([fx, fh]) => {
        const cx = w * .5 + (fx - .5) * u * 1.15, H = h * fh, top = base - H; trees.push([cx, top, H]); const tiers = [[0, .36, .2], [.22, .58, .29], [.44, .82, .38]];
        [-1, 1].forEach(sd => { const p = [[cx, top]]; tiers.forEach(([a, b, ww], i) => { p.push([cx + sd * H * ww, top + H * b]); p.push([cx + sd * H * (i < 2 ? ww * .42 : .05), top + H * b - (i < 2 ? H * .03 : 0)]); }); out.push(p); });
        out.push([[cx, top + H * .82], [cx, base]]);
      });
      out.push([[w * .04, base], [w * .96, base]]);
      const tris = trees.map(([cx, top, H]) => [cx, top, H]);
      const inside = (x, y) => tris.some(([cx, top, H]) => { if (y < top - 6 || y > base + 4) return false; const hw = H * .38 * Math.min(1, (y - top) / (H * .82)) + 12; return Math.abs(x - cx) < hw; });
      const wind = (x0, y0, L, r, dir, k) => {
        const p = [];
        for (let X = 0; X <= L; X += 5) p.push([x0 + dir * X, y0 + Math.sin(X / L * Math.PI * 1.2 + k) * r * .35]);
        const ex = x0 + dir * L, ey = p[p.length - 1][1], cy = ey + r;
        for (let f = 0; f <= Math.PI * 3; f += .15) { const rr = r * (1 - f / (Math.PI * 3.6)); p.push([ex + dir * Math.sin(f) * rr, cy - Math.cos(f) * rr - (r - rr) * .1]); }
        let seg = []; p.forEach(q => { if (inside(q[0], q[1])) { if (seg.length > 10) out.push(seg); seg = []; } else seg.push(q); }); if (seg.length > 10) out.push(seg);
      };
      const gx = (i, j, f) => trees[i][0] + (trees[j][0] - trees[i][0]) * f;
      [[.03, .07, .22, .036], [.36, .04, .2, .03], [.6, .11, .22, .036], [.05, .25, .13, .028], [.77, .21, .15, .03], [.3, .15, .1, .024]].forEach(([fx, fy, fl, fr], k) => wind(w * fx, h * fy, w * fl, h * fr, 1, k));
      return out;
    }
  };
  function textStrokes(el, cr) {
    const rects = [], wk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), rg = document.createRange(); let n;
    while ((n = wk.nextNode())) {
      if (!n.textContent.trim()) continue; rg.selectNodeContents(n);
      for (const r of rg.getClientRects()) if (r.width > 2) rects.push({ x0: r.left - cr.left, x1: r.right - cr.left, y: (r.top + r.bottom) / 2 - cr.top, h: r.height });
    }
    rects.sort((a, b) => a.y - b.y || a.x0 - b.x0);
    const lines = [];
    for (const r of rects) { const L = lines[lines.length - 1]; if (L && Math.abs(L.y - r.y) < r.h * .4) { L.x0 = Math.min(L.x0, r.x0); L.x1 = Math.max(L.x1, r.x1); } else lines.push({ ...r }); }
    return lines.map(l => ({ p: [[l.x0, l.y], [l.x1, l.y]], w: Math.max(2, l.h * .2) }));
  }
  class CaelLines {
    constructor(canvas, texts, morph, mist) {
      this.mist = mist || 'bancos'; this.morph = morph || null; this.c = canvas; this.ctx = canvas.getContext('2d'); this.texts = texts; this.s = 0; this.cur = 0; this.sets = []; this.visible = true; this.frame = 0; this.color = '#1C2620';
      this.reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.ro = new ResizeObserver(() => this.build()); this.ro.observe(canvas);
      this.io = new IntersectionObserver(es => { this.visible = es[0].isIntersecting; }); this.io.observe(canvas);
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => this.build());
      this.loop = this.loop.bind(this); this.raf = requestAnimationFrame(this.loop);
    }
    destroy() { cancelAnimationFrame(this.raf); this.ro.disconnect(); this.io.disconnect(); if (this.morph) this.morph.destroy(); }
    setProgress(s) { this.s = s; }
    setMist(v) { if (v && v !== this.mist) { this.mist = v; this.build(); } }
    build() {
      const cr = this.c.getBoundingClientRect(); if (!cr.width || !cr.height) return;
      const d = Math.min(2, devicePixelRatio || 1); this.w = cr.width; this.h = cr.height;
      this.c.width = cr.width * d; this.c.height = cr.height * d; this.ctx.setTransform(d, 0, 0, d, 0, 0);
      const T = this.texts.map(el => normalize(textStrokes(el, cr)));
      const S = ['waves', 'ammonite', 'volcano', 'forest'].map(k => normalize(fitted(k, this.w, this.h, this.mist).map(p => ({ p, w: 2 }))));
      this.sets = [S[0], T[0], S[1], T[1], S[2], T[2], S[3], T[3]];
    }
    loop() {
      this.raf = requestAnimationFrame(this.loop);
      if (!this.sets.length || !this.visible) return;
      if (this.frame++ % 30 === 0) this.color = getComputedStyle(this.c).color;
      const now = performance.now(), dt = Math.min(.05, ((now - (this.lt || now)) / 1000)); this.lt = now;
      const tgt = Math.round(this.s), dif = tgt - this.cur, st = dt / 1.5 * (Math.abs(dif) > 1.5 ? 2.2 : 1);
      this.cur = this.reduce ? tgt : (Math.abs(dif) <= st ? tgt : this.cur + Math.sign(dif) * st);
      if (this.morph) { const c0 = clamp(this.cur, 0, 7); let ip = 0; if (c0 > 1) { const j = Math.min(2, Math.floor((c0 - 1) / 2)); ip = j + clamp(c0 - (2 * j + 1), 0, 1); } this.morph.render(ip); }
      const S = this.sets, cur = clamp(this.cur, 0, S.length - 1), k = Math.min(S.length - 2, Math.floor(cur)), f = cur - k, A = S[k], B = S[k + 1], ctx = this.ctx;
      let maxV = 0;
      this.texts.forEach((el, j) => {
        const v = clamp(1 - Math.abs(cur - (2 * j + 1)) / .3, 0, 1); maxV = Math.max(maxV, v);
        const vk = v.toFixed(3); if (el._v !== vk) { el._v = vk; el.style.opacity = vk; el.style.clipPath = v >= 1 ? 'none' : `inset(0 ${((1 - v) * 100).toFixed(1)}% 0 0)`; el.style.pointerEvents = v > .5 ? 'auto' : 'none'; }
      });
      ctx.clearRect(0, 0, this.w, this.h);
      const alpha = 1 - maxV; if (alpha <= .01) return;
      ctx.globalAlpha = alpha; ctx.strokeStyle = this.color; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let i = 0; i < M; i++) {
        const a = A[i], b = B[i], e = clamp((f - .25 * i / M) / .75, 0, 1), q = ease(e), wob = Math.sin(e * Math.PI) * 14 * (i % 2 ? 1 : -1);
        ctx.lineWidth = a.w + (b.w - a.w) * q; ctx.beginPath();
        for (let j = 0; j < K; j++) {
          const x = a.p[j][0] + (b.p[j][0] - a.p[j][0]) * q, y = a.p[j][1] + (b.p[j][1] - a.p[j][1]) * q + wob * Math.sin(j / (K - 1) * Math.PI);
          j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }
  class CaelMorph {
    constructor(canvas, srcs) {
      this.c = canvas; const gl = this.gl = canvas.getContext('webgl', { premultipliedAlpha: false, antialias: false });
      this.ok = !!gl; if (!gl) { canvas.style.display = 'none'; return; }
      const vs = 'attribute vec2 q;varying vec2 uv;void main(){uv=q*.5+.5;gl_Position=vec4(q,0.,1.);}';
      const fs = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 uv;uniform sampler2D ta,tb;uniform vec4 ca,cb;uniform float p;
float h(vec2 x){return fract(sin(dot(x,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 x){vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fb(vec2 x){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(x);x*=2.03;a*=.5;}return v;}
void main(){
 float s=p*p*(3.-2.*p), w=sin(s*3.14159);
 vec2 d=vec2(fb(uv*1.4+3.1),fb(uv*1.4+7.7))-.5;
 vec2 za=(uv-.5)/(1.+s*.08)+.5, zb=(uv-.5)/(1.08-s*.08)+.5;
 vec2 ua=clamp(za+d*s*.1,0.,1.), ub=clamp(zb-d*(1.-s)*.1,0.,1.);
 vec4 A=texture2D(ta,ca.xy+ua*ca.zw), B=texture2D(tb,cb.xy+ub*cb.zw);
 float nz=fb(uv*1.8+d*1.2)*.75+uv.y*.25, e=s*1.5-.25, m=smoothstep(e-.2,e+.2,nz);
 float edge=(1.-smoothstep(0.,.2,abs(nz-e)))*w;
 vec3 c=mix(B.rgb,A.rgb,m);
 c+=vec3(.94,.69,.29)*edge*.18;
 gl_FragColor=vec4(c,1.);}`;
      const sh = (ty, src) => { const s = gl.createShader(ty); gl.shaderSource(s, src); gl.compileShader(s); return s; };
      const pr = this.pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { this.ok = false; canvas.style.display = 'none'; return; }
      gl.useProgram(pr);
      const bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const lq = gl.getAttribLocation(pr, 'q'); gl.enableVertexAttribArray(lq); gl.vertexAttribPointer(lq, 2, gl.FLOAT, false, 0, 0);
      this.u = { p: gl.getUniformLocation(pr, 'p'), ca: gl.getUniformLocation(pr, 'ca'), cb: gl.getUniformLocation(pr, 'cb'), ta: gl.getUniformLocation(pr, 'ta'), tb: gl.getUniformLocation(pr, 'tb') };
      gl.uniform1i(this.u.ta, 0); gl.uniform1i(this.u.tb, 1);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      this.cw = 0; this.ch = 0; this.ro = new ResizeObserver(() => { const r = canvas.getBoundingClientRect(); this.cw = r.width; this.ch = r.height; this.last = -1; }); this.ro.observe(canvas);
      this.tex = srcs.map(() => null); this.asp = srcs.map(() => 1); this.last = -1;
      srcs.forEach((src, i) => { const im = new Image(); im.onload = () => {
        const tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
        this.tex[i] = tx; this.asp[i] = im.naturalWidth / im.naturalHeight; this.last = -1; }; im.src = src; });
    }
    destroy() { if (this.ro) this.ro.disconnect(); }
    cover(ta, cw) { return ta > cw ? [(1 - cw / ta) / 2, 0, cw / ta, 1] : [0, (1 - ta / cw) / 2, 1, ta / cw]; }
    render(pos) {
      if (!this.ok) return;
      const gl = this.gl, d = Math.min(2, devicePixelRatio || 1), W = Math.round(this.cw * d), H = Math.round(this.ch * d);
      if (!W || !H) return;
      const sized = this.c.width !== W || this.c.height !== H; if (sized) { this.c.width = W; this.c.height = H; }
      const j = Math.min(this.tex.length - 2, Math.floor(pos)), p = Math.min(1, pos - j);
      if (!this.tex[j] || !this.tex[j + 1]) return;
      const key = j + p.toFixed(3); if (!sized && key === this.last) return; this.last = key;
      gl.viewport(0, 0, W, H); const cw = W / H;
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.tex[j]);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.tex[j + 1]);
      gl.uniform4fv(this.u.ca, this.cover(this.asp[j], cw)); gl.uniform4fv(this.u.cb, this.cover(this.asp[j + 1], cw)); gl.uniform1f(this.u.p, p);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }
  function fitted(name, w, h, v) {
    const bw = Math.min(w, h * 1.2), bh = bw / 1.2, ox = (w - bw) / 2, oy = (h - bh) / 2;
    return G[name](bw, bh, v).map(p => p.map(q => [q[0] + ox, q[1] + oy]));
  }

export { CaelLines, CaelMorph };
