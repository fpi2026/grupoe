/**
 * Mapa 3D en relieve del Trifinio (portado de diseno/Mapa3D.html).
 *
 * - Relieve: AWS Terrain Tiles (terrarium), zoom 11.
 * - Imagen: Esri World Imagery, zoom 12; si falla, relieve sombreado propio.
 * - Límites: Natural Earth (world-atlas), recortados a la zona al compilar.
 * Exageración vertical ×2.1. Se carga solo cuando la sección se acerca a la pantalla.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type Lng = [number, number];
export interface Place {
	t: 'home' | 'tri' | 'pt' | 'ctry';
	lon: number;
	lat: number;
	label: string;
	sub?: string;
	lift: number;
}
export interface MapOptions {
	stage: HTMLElement;
	labels: HTMLElement;
	borders: Lng[][];
	places: Place[];
	zoomIn: HTMLButtonElement;
	zoomOut: HTMLButtonElement;
	reset: HTMLButtonElement;
}

const B = { w: -89.64, e: -89.12, s: 14.19, n: 14.62 };
const T = 256;
const ZD = 11; // zoom del relieve
const ZI = 12; // zoom de la imagen
const EX = 2.1; // exageración vertical
const SX = 10; // ancho del bloque en unidades de la escena

const wx = (lon: number, z: number) => ((lon + 180) / 360) * T * 2 ** z;
const wy = (lat: number, z: number) => {
	const r = (lat * Math.PI) / 180;
	return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * T * 2 ** z;
};
const loadImg = (src: string) =>
	new Promise<HTMLImageElement>((res, rej) => {
		const i = new Image();
		i.crossOrigin = 'anonymous';
		i.onload = () => res(i);
		i.onerror = rej;
		i.src = src;
	});

interface Frame {
	z: number;
	x0: number;
	y0: number;
	W: number;
	H: number;
}
function frame(z: number): Frame {
	const x0 = Math.floor(wx(B.w, z));
	const y0 = Math.floor(wy(B.n, z));
	return { z, x0, y0, W: Math.ceil(wx(B.e, z)) - x0, H: Math.ceil(wy(B.s, z)) - y0 };
}

async function mosaic(f: Frame, url: (z: number, x: number, y: number) => string) {
	const c = document.createElement('canvas');
	c.width = f.W;
	c.height = f.H;
	const g = c.getContext('2d')!;
	g.imageSmoothingEnabled = false;
	const jobs: Promise<void>[] = [];
	for (let tx = Math.floor(f.x0 / T); tx <= Math.floor((f.x0 + f.W) / T); tx++)
		for (let ty = Math.floor(f.y0 / T); ty <= Math.floor((f.y0 + f.H) / T); ty++)
			jobs.push(loadImg(url(f.z, tx, ty)).then((img) => g.drawImage(img, tx * T - f.x0, ty * T - f.y0)));
	await Promise.all(jobs);
	return c;
}

export async function initTrifinioMap(o: MapOptions): Promise<void> {
	const fd = frame(ZD);
	const fi = frame(ZI);
	const demP = mosaic(fd, (z, x, y) => `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`);
	const satP = mosaic(fi, (z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`).catch(
		() => null,
	);

	// ---------- Elevación ----------
	const demC = await demP;
	const { W, H } = fd;
	const px = demC.getContext('2d')!.getImageData(0, 0, W, H).data;
	const E = new Float32Array(W * H);
	let emin = 1e9;
	for (let i = 0; i < W * H; i++) {
		const e = px[i * 4]! * 256 + px[i * 4 + 1]! + px[i * 4 + 2]! / 256 - 32768;
		E[i] = e;
		if (e < emin) emin = e;
	}
	const eAt = (x: number, y: number) => {
		x = Math.max(0, Math.min(W - 1.001, x));
		y = Math.max(0, Math.min(H - 1.001, y));
		const x0 = x | 0,
			y0 = y | 0,
			fx = x - x0,
			fy = y - y0,
			i = y0 * W + x0;
		return (E[i]! * (1 - fx) + E[i + 1]! * fx) * (1 - fy) + (E[i + W]! * (1 - fx) + E[i + W + 1]! * fx) * fy;
	};
	const s = SX / W;
	const SZ = H * s;
	const mpp = (156543.03 * Math.cos((14.4 * Math.PI) / 180)) / 2 ** ZD;
	const vs = (s / mpp) * EX;
	const BASE = 0.18;
	const hAt = (dx: number, dy: number) => (eAt(dx, dy) - emin) * vs + BASE;
	const toWorld = (lon: number, lat: number, lift = 0) => {
		const dx = wx(lon, ZD) - fd.x0;
		const dy = wy(lat, ZD) - fd.y0;
		return new THREE.Vector3(dx * s - SX / 2, hAt(dx, dy) + lift, dy * s - SZ / 2);
	};

	// ---------- Textura de respaldo: colores por altura + sombreado ----------
	function relief() {
		const k = 2;
		const c = document.createElement('canvas');
		c.width = W;
		c.height = H;
		const g = c.getContext('2d')!;
		const im = g.createImageData(W, H);
		const d = im.data;
		const stops: [number, number[]][] = [
			[0, [128, 150, 96]],
			[500, [104, 136, 78]],
			[900, [78, 116, 62]],
			[1400, [56, 96, 52]],
			[1900, [62, 84, 54]],
			[2300, [112, 104, 86]],
			[2600, [150, 142, 124]],
		];
		const ramp = (e: number) => {
			for (let i = 1; i < stops.length; i++)
				if (e <= stops[i]![0]) {
					const [a, ca] = stops[i - 1]!;
					const [b, cb] = stops[i]!;
					const t = (e - a) / (b - a);
					return ca.map((v, j) => v + (cb[j]! - v) * t);
				}
			return stops.at(-1)![1];
		};
		const L = [-0.55, 0.62, -0.55];
		const ln = Math.hypot(...L);
		L.forEach((v, i) => (L[i] = v / ln));
		for (let y = 0; y < H; y++)
			for (let x = 0; x < W; x++) {
				const i = y * W + x,
					e = E[i]!;
				const xl = E[y * W + Math.max(0, x - 1)]!,
					xr = E[y * W + Math.min(W - 1, x + 1)]!;
				const yu = E[Math.max(0, y - 1) * W + x]!,
					yd = E[Math.min(H - 1, y + 1) * W + x]!;
				const nx = ((xl - xr) / (2 * mpp)) * 1.6,
					nz = ((yu - yd) / (2 * mpp)) * 1.6,
					ny = 1,
					nl = Math.hypot(nx, ny, nz);
				const sh = Math.max(0, (nx * L[0]! + ny * L[1]! - nz * L[2]!) / nl);
				let col: number[];
				const flat = Math.abs(xl - e) + Math.abs(xr - e) + Math.abs(yu - e) + Math.abs(yd - e) < 0.4;
				if (flat && e < 480) col = [70, 108, 128];
				else {
					const m = 0.45 + 0.85 * sh,
						n = 1 + (Math.random() - 0.5) * 0.06;
					col = ramp(e).map((v) => v * m * n);
				}
				d[i * 4] = col[0]!;
				d[i * 4 + 1] = col[1]!;
				d[i * 4 + 2] = col[2]!;
				d[i * 4 + 3] = 255;
			}
		g.putImageData(im, 0, 0);
		const out = document.createElement('canvas');
		out.width = W * k;
		out.height = H * k;
		const og = out.getContext('2d')!;
		og.imageSmoothingQuality = 'high';
		og.drawImage(c, 0, 0, W * k, H * k);
		return out;
	}

	// ---------- Límites de países dibujados sobre la textura ----------
	function withBorders(src: HTMLCanvasElement, f: Frame) {
		const c = document.createElement('canvas');
		c.width = src.width;
		c.height = src.height;
		const g = c.getContext('2d')!;
		g.drawImage(src, 0, 0);
		if (!o.borders.length) return c;
		const sc = src.width / f.W,
			k = c.width / 1000;
		const P = ([lon, lat]: Lng) => [(wx(lon, f.z) - f.x0) * sc, (wy(lat, f.z) - f.y0) * sc] as const;
		g.beginPath();
		for (const line of o.borders)
			line.forEach((p, i) => {
				const [x, y] = P(p);
				if (i) g.lineTo(x, y);
				else g.moveTo(x, y);
			});
		g.lineJoin = 'round';
		g.lineCap = 'round';
		g.strokeStyle = 'rgba(0,0,0,.45)';
		g.lineWidth = 6 * k;
		g.stroke();
		g.strokeStyle = '#fff';
		g.lineWidth = 2.4 * k;
		g.setLineDash([9 * k, 6 * k]);
		g.stroke();
		return c;
	}

	// ---------- Escena ----------
	const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setPixelRatio(Math.min(2, devicePixelRatio));
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.05;
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap; // suave por defecto desde three r18x
	o.stage.appendChild(renderer.domElement);
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
	const HOME = new THREE.Vector3(0.6, 9.4, 12.6);
	const TGT = new THREE.Vector3(0, 0.2, 0.6);
	camera.position.copy(HOME);
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.target.copy(TGT);
	controls.enableDamping = true;
	controls.dampingFactor = 0.08;
	controls.enableZoom = false;
	controls.enablePan = false;
	controls.minPolarAngle = 0.25;
	controls.maxPolarAngle = 1.2;

	scene.add(new THREE.HemisphereLight(0xdfe8f5, 0x4a3b2a, 1.1));
	const sun = new THREE.DirectionalLight(0xfff1dc, 2.4);
	sun.position.set(-6, 9, -5);
	sun.castShadow = true;
	sun.shadow.mapSize.set(2048, 2048);
	Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 30 });
	sun.shadow.bias = -0.0008;
	sun.shadow.normalBias = 0.02;
	scene.add(sun);

	const COLS = 256,
		ROWS = Math.round((COLS * H) / W);
	const geo = new THREE.PlaneGeometry(SX, SZ, COLS, ROWS);
	geo.rotateX(-Math.PI / 2);
	const pos = geo.attributes.position!;
	for (let i = 0; i < pos.count; i++) {
		const x = pos.getX(i),
			z = pos.getZ(i);
		pos.setY(i, hAt((x / SX + 0.5) * W, (z / SZ + 0.5) * H));
	}
	geo.computeVertexNormals();
	const mkTex = (c: HTMLCanvasElement) => {
		const t = new THREE.CanvasTexture(c);
		t.colorSpace = THREE.SRGBColorSpace;
		t.anisotropy = renderer.capabilities.getMaxAnisotropy();
		return t;
	};
	const sat = await satP;
	const tex = sat ? mkTex(withBorders(sat, fi)) : mkTex(withBorders(relief(), fd));
	const terrain = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, metalness: 0 }));
	terrain.castShadow = terrain.receiveShadow = true;
	scene.add(terrain);

	// Paredes del bloque
	const side = new THREE.MeshStandardMaterial({ color: 0x5a4430, roughness: 1, side: THREE.DoubleSide });
	function wall(pts: THREE.Vector3[]) {
		const p: number[] = [];
		for (let i = 0; i < pts.length - 1; i++) {
			const a = pts[i]!,
				b = pts[i + 1]!;
			p.push(a.x, a.y, a.z, a.x, 0, a.z, b.x, b.y, b.z, b.x, b.y, b.z, a.x, 0, a.z, b.x, 0, b.z);
		}
		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
		g.computeVertexNormals();
		scene.add(new THREE.Mesh(g, side));
	}
	const edge = (fn: (t: number) => THREE.Vector3, n: number) => Array.from({ length: n + 1 }, (_, i) => fn(i / n));
	const P3 = (u: number, v: number) => new THREE.Vector3(u * SX - SX / 2, hAt(u * W, v * H), v * SZ - SZ / 2);
	wall(edge((t) => P3(t, 1), COLS));
	wall(edge((t) => P3(1 - t, 0), COLS));
	wall(edge((t) => P3(0, t), ROWS));
	wall(edge((t) => P3(1, 1 - t), ROWS));
	const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.18 }));
	ground.rotation.x = -Math.PI / 2;
	ground.position.y = -0.001;
	ground.receiveShadow = true;
	scene.add(ground);

	// ---------- Etiquetas (HTML sobre el canvas) ----------
	const labels = o.places.map((p) => {
		const el = document.createElement('div');
		el.className = 'l';
		const inner = document.createElement('div');
		if (p.t === 'home') {
			inner.className = 'home';
			const b = document.createElement('b');
			b.append(p.label);
			if (p.sub) {
				const sm = document.createElement('small');
				sm.textContent = p.sub;
				b.append(sm);
			}
			inner.append(b, document.createElement('s'), document.createElement('u'));
		} else if (p.t === 'ctry') {
			inner.className = 'ctry';
			inner.textContent = p.label;
		} else {
			inner.className = p.t === 'tri' ? 'pt tri' : 'pt';
			inner.append(document.createElement('i'), p.label);
		}
		el.append(inner);
		o.labels.append(el);
		return { el, v: toWorld(p.lon, p.lat, p.lift) };
	});

	// ---------- Controles ----------
	let goal = HOME.distanceTo(TGT);
	const zoom = (f: number) => (goal = Math.max(5, Math.min(20, goal * f)));
	o.zoomIn.onclick = () => zoom(0.82);
	o.zoomOut.onclick = () => zoom(1.22);
	o.reset.onclick = () => {
		goal = HOME.distanceTo(TGT);
		camera.position.copy(HOME);
		controls.target.copy(TGT);
	};

	function size() {
		const w = o.stage.clientWidth,
			h = o.stage.clientHeight;
		if (!w || !h) return;
		renderer.setSize(w, h, false);
		renderer.domElement.style.width = w + 'px';
		renderer.domElement.style.height = h + 'px';
		camera.aspect = w / h;
		camera.fov = w / h < 1 ? 46 : 34;
		camera.updateProjectionMatrix();
	}
	new ResizeObserver(size).observe(o.stage);
	size();

	// Solo se dibuja mientras el mapa está en pantalla
	let visible = true;
	new IntersectionObserver((es) => (visible = !!es[0]?.isIntersecting)).observe(o.stage);

	const v = new THREE.Vector3(),
		dir = new THREE.Vector3();
	function tick() {
		requestAnimationFrame(tick);
		if (!visible) return;
		const cur = camera.position.distanceTo(controls.target);
		if (Math.abs(cur - goal) > 0.01) {
			dir.subVectors(camera.position, controls.target).setLength(cur + (goal - cur) * 0.15);
			camera.position.copy(controls.target).add(dir);
		}
		controls.update();
		renderer.render(scene, camera);
		const w = o.stage.clientWidth,
			h = o.stage.clientHeight;
		for (const l of labels) {
			v.copy(l.v).project(camera);
			const vis = v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1;
			l.el.style.display = vis ? '' : 'none';
			if (vis) l.el.style.transform = `translate(${((v.x + 1) / 2) * w}px,${((1 - v.y) / 2) * h}px)`;
		}
	}
	tick();
}
