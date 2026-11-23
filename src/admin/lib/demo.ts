/**
 * Modo demostración del panel: imita en el navegador la parte de la API de GitHub que usa
 * lib/github.ts (mismo papel que herramientas/mock-github.mjs, pero sin servidor).
 *
 * - Parte de las noticias e imágenes del sitio publicado (admin/demo-repo.json, generado al compilar).
 * - Los cambios se guardan SOLO en este navegador (localStorage): no llegan al repositorio
 *   ni al sitio. "Restablecer" vuelve al estado publicado.
 * - Usuario y contraseña compartidos (AdminAlpina): si al compilar existe el token general
 *   (PUBLIC_GH_TOKEN, secret CMS_TOKEN en Actions), la sesión guarda y publica de verdad con ese
 *   token; si no existe (por ejemplo, en local), la sesión es de demostración.
 *   La comprobación ocurre en el navegador: es una puerta de práctica, no seguridad.
 */
import { AxiosError, AxiosHeaders, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

const CLAVE_SESION = 'cael_demo';
const CLAVE_DATOS = 'cael-demo-repo';
/** SHA-256 de "usuario:contraseña". Credenciales de práctica: AdminAlpina / Admin123! */
const HUELLA = 'cc06350c3602f2e64378ef01abe8750b50abbdd5a56b64f0e329e04a72650071';
const USUARIO = 'AdminAlpina';
/** Segundos que tarda la "publicación" simulada. */
const DURACION_PUBLICACION = 20;

/** Token general del proyecto, insertado al compilar (vacío en local). */
export const TOKEN_GENERAL: string | undefined = import.meta.env.PUBLIC_GH_TOKEN || undefined;

/** Hay una sesión abierta con el usuario compartido. */
export const sesionCompartida = () => sessionStorage.getItem(CLAVE_SESION) === '1';
/** Sesión de práctica abierta con «Practicar con la demostración» (sin usuario ni contraseña). */
const sesionPractica = () => sessionStorage.getItem(CLAVE_SESION) === 'practica';
/** Los cambios no salen del navegador: práctica, o usuario compartido sin token general. */
export const esDemo = () => sesionPractica() || (sesionCompartida() && !TOKEN_GENERAL);
/** Hay una sesión sin token personal (compartida o de práctica). */
export const sesionSinToken = () => sesionCompartida() || sesionPractica();
export const salirDemo = () => sessionStorage.removeItem(CLAVE_SESION);
export const nombreDemo = () => (esDemo() ? 'Demostración' : USUARIO);

/** Abre la demostración: se puede practicar sin usuario ni contraseña porque nada se publica. */
export const entrarPractica = () => sessionStorage.setItem(CLAVE_SESION, 'practica');

/** Comprueba el usuario y la contraseña compartidos y abre la sesión. */
export async function entrarDemo(usuario: string, clave: string): Promise<boolean> {
	const datos = new TextEncoder().encode(`${usuario.trim()}:${clave}`);
	const huella = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', datos)), (b) => b.toString(16).padStart(2, '0')).join('');
	if (huella !== HUELLA) return false;
	sessionStorage.setItem(CLAVE_SESION, '1');
	return true;
}

/** Borra los cambios hechos en la demostración (vuelve al sitio publicado). */
export const restablecerDemo = () => {
	localStorage.removeItem(CLAVE_DATOS);
	estado = null;
};

// ---------- Estado del repositorio simulado ----------

interface Semilla {
	commit: string;
	fecha: string;
	archivos: { path: string; sha: string; texto?: string }[];
}
interface Commit {
	arbol: string;
	padre: string | null;
	mensaje: string;
	autor: string;
	fecha: string;
}
interface Estado {
	/** Commit del sitio del que parte la demostración; si cambia, se empieza de cero. */
	base: string;
	head: string;
	commits: Record<string, Commit>;
	arboles: Record<string, Record<string, string>>;
	/** Archivos creados en la demostración, en base64. */
	blobs: Record<string, string>;
	publicacion: { sha: string; inicio: number } | null;
}

const OWNER = import.meta.env.PUBLIC_GH_OWNER ?? 'fpi2026';
const REPO = import.meta.env.PUBLIC_GH_REPO ?? 'grupoe';

let semilla: Promise<Semilla> | null = null;
let estado: Estado | null = null;
/** Contenido ya descargado de los archivos del sitio (sha → base64). */
const descargados = new Map<string, Promise<string>>();

const cargarSemilla = () =>
	(semilla ??= fetch(`${import.meta.env.BASE_URL.replace(/\/?$/, '/')}admin/demo-repo.json`).then((r) => {
		if (!r.ok) throw new Error('semilla');
		return r.json() as Promise<Semilla>;
	}));

const id = () => crypto.randomUUID().replace(/-/g, '');

/**
 * Versión de la semilla: el commit y la lista de archivos. Si cambia (nuevo despliegue, o en local
 * al agregar archivos), la demostración vuelve a empezar desde el contenido publicado.
 */
function versionSemilla(s: Semilla): string {
	let h = 0;
	for (const a of s.archivos) for (const c of a.path + a.sha) h = (Math.imul(h, 31) + c.charCodeAt(0)) | 0;
	return `${s.commit}:${(h >>> 0).toString(36)}`;
}

async function obtenerEstado(): Promise<Estado> {
	const s = await cargarSemilla();
	const version = versionSemilla(s);
	if (estado?.base === version) return estado;
	try {
		const guardado = JSON.parse(localStorage.getItem(CLAVE_DATOS) ?? 'null') as Estado | null;
		if (guardado?.base === version) return (estado = guardado);
	} catch {
		/* datos dañados: se empieza de cero */
	}
	const arbol = Object.fromEntries(s.archivos.map((a) => [a.path, a.sha]));
	return (estado = {
		base: version,
		head: 'base',
		commits: { base: { arbol: 'base', padre: null, mensaje: 'Contenido del sitio publicado', autor: 'Sitio publicado', fecha: s.fecha } },
		arboles: { base: arbol },
		blobs: {},
		publicacion: null,
	});
}

function guardarEstado(e: Estado) {
	try {
		localStorage.setItem(CLAVE_DATOS, JSON.stringify(e));
	} catch {
		throw new Error('lleno');
	}
}

const aBase64 = (bytes: Uint8Array) => {
	let s = '';
	for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
	return btoa(s);
};

/** Contenido (base64) de un archivo: creado en la demo, texto de la semilla o descarga del repositorio público. */
async function contenido(e: Estado, sha: string): Promise<string | null> {
	if (e.blobs[sha]) return e.blobs[sha]!;
	const s = await cargarSemilla();
	const archivo = s.archivos.find((a) => a.sha === sha);
	if (!archivo) return null;
	if (archivo.texto !== undefined) return aBase64(new TextEncoder().encode(archivo.texto));
	if (!descargados.has(sha))
		descargados.set(
			sha,
			fetch(`https://raw.githubusercontent.com/${OWNER}/${REPO}/${s.commit}/${archivo.path}`).then(async (r) => {
				if (!r.ok) throw new Error('descarga');
				return aBase64(new Uint8Array(await r.arrayBuffer()));
			}),
		);
	return descargados.get(sha)!;
}

// ---------- Adaptador de axios ----------

function responder(cfg: InternalAxiosRequestConfig, status: number, data: unknown, mensaje?: string): AxiosResponse {
	const r: AxiosResponse = { data, status, statusText: String(status), headers: new AxiosHeaders(), config: cfg, request: {} };
	if (status >= 400) throw new AxiosError(mensaje ?? `Error ${status}`, AxiosError.ERR_BAD_REQUEST, cfg, {}, { ...r, data: { ...((data as object) ?? {}), mensaje } });
	return r;
}

export const adaptadorDemo: AxiosAdapter = async (cfg) => {
	let e: Estado;
	try {
		e = await obtenerEstado();
	} catch {
		return responder(cfg, 503, {}, 'No se pudo cargar el contenido de la demostración. Revisa tu conexión y recarga la página.');
	}
	const metodo = (cfg.method ?? 'get').toUpperCase();
	const ruta = (cfg.url ?? '').split('?')[0]!;
	const cuerpo = typeof cfg.data === 'string' && cfg.data ? JSON.parse(cfg.data) : (cfg.data ?? {});
	const archivos = e.arboles[e.commits[e.head]!.arbol]!;
	let m: RegExpExecArray | null;

	if (metodo === 'GET' && ruta === '') return responder(cfg, 200, { full_name: `${OWNER}/${REPO}`, permissions: { push: true } });

	if (metodo === 'GET' && /^\/git\/trees\/[^/]+$/.test(ruta))
		return responder(cfg, 200, { tree: Object.entries(archivos).map(([path, sha]) => ({ path, sha, type: 'blob' })) });

	if (metodo === 'GET' && (m = /^\/git\/blobs\/(\w+)$/.exec(ruta))) {
		try {
			const c = await contenido(e, m[1]!);
			return c === null ? responder(cfg, 404, {}) : responder(cfg, 200, { content: c, encoding: 'base64' });
		} catch {
			return responder(cfg, 503, {}, 'No se pudo descargar una imagen del sitio. Revisa tu conexión.');
		}
	}

	if (metodo === 'GET' && (m = /^\/contents\/(.+)$/.exec(ruta))) {
		const sha = archivos[decodeURI(m[1]!)];
		return sha ? responder(cfg, 200, { sha }) : responder(cfg, 404, {});
	}

	if (metodo === 'GET' && /^\/git\/ref\/heads\/[^/]+$/.test(ruta)) return responder(cfg, 200, { object: { sha: e.head } });

	if (metodo === 'GET' && (m = /^\/git\/commits\/(\w+)$/.exec(ruta))) {
		const c = e.commits[m[1]!];
		return c ? responder(cfg, 200, { tree: { sha: c.arbol } }) : responder(cfg, 404, {});
	}

	if (metodo === 'POST' && ruta === '/git/blobs') {
		const sha = id();
		e.blobs[sha] = String(cuerpo.content);
		return responder(cfg, 201, { sha });
	}

	if (metodo === 'POST' && ruta === '/git/trees') {
		const t = { ...e.arboles[cuerpo.base_tree] };
		for (const x of cuerpo.tree as { path: string; sha: string | null }[]) {
			if (x.sha === null) delete t[x.path];
			else t[x.path] = x.sha;
		}
		const sha = id();
		e.arboles[sha] = t;
		return responder(cfg, 201, { sha });
	}

	if (metodo === 'POST' && ruta === '/git/commits') {
		const sha = id();
		e.commits[sha] = { arbol: cuerpo.tree, padre: cuerpo.parents?.[0] ?? null, mensaje: cuerpo.message, autor: 'Demostración', fecha: new Date().toISOString() };
		return responder(cfg, 201, { sha });
	}

	if (metodo === 'PATCH' && /^\/git\/refs\/heads\/[^/]+$/.test(ruta)) {
		if (e.commits[cuerpo.sha]?.padre !== e.head) return responder(cfg, 422, {});
		const anterior = { head: e.head, publicacion: e.publicacion };
		e.head = cuerpo.sha;
		e.publicacion = { sha: e.head, inicio: Date.now() };
		// Limpieza: solo se conservan los archivos del estado actual y los árboles de algún commit
		const usados = new Set(Object.values(e.arboles[e.commits[e.head]!.arbol]!));
		const arboles = new Set(Object.values(e.commits).map((c) => c.arbol));
		for (const t of Object.keys(e.arboles)) if (!arboles.has(t)) delete e.arboles[t];
		for (const sha of Object.keys(e.blobs)) if (!usados.has(sha)) delete e.blobs[sha];
		try {
			guardarEstado(e);
		} catch {
			Object.assign(e, anterior);
			return responder(cfg, 507, {}, 'El espacio de la demostración en este navegador se llenó (las fotos ocupan mucho). Usa «Restablecer demostración».');
		}
		return responder(cfg, 200, { object: { sha: e.head } });
	}

	if (metodo === 'GET' && ruta === '/commits') {
		const lista = [];
		const n = Number(cfg.params?.per_page ?? 6);
		for (let sha: string | null = e.head; sha && lista.length < n; sha = e.commits[sha]!.padre) {
			const c = e.commits[sha]!;
			lista.push({ sha, html_url: '#/', commit: { message: c.mensaje, author: { name: c.autor, date: c.fecha } } });
		}
		return responder(cfg, 200, lista);
	}

	if (metodo === 'GET' && ruta === '/actions/runs') {
		// Sin cambios todavía: se muestra como lista la versión publicada
		const p = e.publicacion ?? { sha: 'base', inicio: Date.parse(e.commits.base!.fecha) - DURACION_PUBLICACION * 1000 };
		const listo = Date.now() - p.inicio > DURACION_PUBLICACION * 1000;
		return responder(cfg, 200, {
			workflow_runs: [
				{
					head_sha: p.sha,
					status: listo ? 'completed' : 'in_progress',
					conclusion: listo ? 'success' : null,
					updated_at: new Date(listo ? p.inicio + DURACION_PUBLICACION * 1000 : Date.now()).toISOString(),
					html_url: '#/',
				},
			],
		});
	}

	return responder(cfg, 404, {});
};
