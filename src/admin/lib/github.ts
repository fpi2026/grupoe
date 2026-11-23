/**
 * Cliente de la API de GitHub para el panel /admin (Plan del sitio: "El módulo de axios").
 * El token vive solo en sessionStorage: se borra al cerrar la pestaña y nunca va en el código.
 *
 * Diferencia con el plan: para guardar varios archivos a la vez (noticia ES, EN y portada)
 * se usa la API de Git (blobs → árbol → commit → ref). Así cada guardado es UN commit
 * y dispara UNA sola publicación, en vez de un commit por archivo.
 */
import axios, { AxiosError } from 'axios';
import { adaptadorDemo, esDemo } from './demo';

const env = import.meta.env;
export const repo = {
	owner: env.PUBLIC_GH_OWNER ?? 'fpi2026',
	name: env.PUBLIC_GH_REPO ?? 'grupoe',
	branch: env.PUBLIC_GH_BRANCH ?? 'main',
	/** Se puede apuntar a un servidor de prueba con PUBLIC_GH_API. */
	api: env.PUBLIC_GH_API ?? 'https://api.github.com',
};

const TOKEN_KEY = 'gh_token';
export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => sessionStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => sessionStorage.removeItem(TOKEN_KEY);

export const gh = axios.create({
	baseURL: `${repo.api}/repos/${repo.owner}/${repo.name}`,
	headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
	timeout: 30_000,
});

// Añade el token a cada petición. En modo demostración, las peticiones no salen del navegador.
gh.interceptors.request.use((cfg) => {
	if (esDemo()) {
		cfg.adapter = adaptadorDemo;
		return cfg;
	}
	const token = getToken();
	if (token) cfg.headers.Authorization = `Bearer ${token}`;
	return cfg;
});

/** Error con un mensaje en español listo para mostrar. */
export class GhError extends Error {
	constructor(
		message: string,
		readonly status?: number,
	) {
		super(message);
	}
}

/** El archivo cambió en GitHub desde que se abrió en el panel. */
export class Conflicto extends GhError {}

export function mensajeDeError(e: unknown): string {
	if (e instanceof GhError) return e.message;
	if (e instanceof AxiosError) {
		const s = e.response?.status;
		if (!e.response) return 'No hay conexión con GitHub. Revisa tu internet e inténtalo de nuevo.';
		if (typeof e.response.data?.mensaje === 'string') return e.response.data.mensaje; // mensajes del modo demostración
		if (s === 401) return 'El token no es válido o ya venció. Vuelve a iniciar sesión.';
		if (s === 403) return 'El token no tiene permiso para esta acción (revisa los permisos de Contents y Actions).';
		if (s === 404) return 'No se encontró el repositorio o el archivo. ¿El token tiene acceso a este repositorio?';
		if (s === 409 || s === 422) return 'Alguien más cambió el repositorio mientras editabas. Recarga la noticia y vuelve a intentarlo.';
		return `GitHub respondió con un error (${s}).`;
	}
	return 'Ocurrió un error inesperado.';
}

// ---------- Codificación ----------

/** Texto UTF-8 → base64 (btoa solo acepta latin1). */
export const aBase64 = (texto: string) =>
	btoa(Array.from(new TextEncoder().encode(texto), (b) => String.fromCharCode(b)).join(''));

/** base64 → texto UTF-8. */
export const deBase64 = (b64: string) =>
	new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, '')), (c) => c.charCodeAt(0)));

/** Blob (imagen) → base64 sin el prefijo data:. */
export const blobABase64 = (blob: Blob) =>
	new Promise<string>((resolve, reject) => {
		const r = new FileReader();
		r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
		r.onerror = () => reject(r.error);
		r.readAsDataURL(blob);
	});

// ---------- Lectura ----------

export interface Permisos {
	nombre: string;
	escritura: boolean;
}

/** Comprueba el token y que tenga permiso de escritura en el repositorio. */
export async function verificarToken(): Promise<Permisos> {
	const { data } = await gh.get('');
	return { nombre: data.full_name, escritura: Boolean(data.permissions?.push) };
}

export interface Entrada {
	path: string;
	sha: string;
}

/** Todos los archivos del repositorio en la rama (ruta y sha). */
export async function arbol(): Promise<Entrada[]> {
	const { data } = await gh.get(`/git/trees/${repo.branch}`, { params: { recursive: 1 } });
	return (data.tree as { path: string; sha: string; type: string }[])
		.filter((e) => e.type === 'blob')
		.map(({ path, sha }) => ({ path, sha }));
}

/** Contenido de un archivo como texto, a partir de su sha. */
export async function leerTexto(sha: string): Promise<string> {
	const { data } = await gh.get(`/git/blobs/${sha}`);
	return deBase64(data.content);
}

/** Contenido de un archivo como Blob (para mostrar imágenes del repositorio). */
export async function leerBlob(sha: string, tipo: string): Promise<Blob> {
	const { data } = await gh.get(`/git/blobs/${sha}`);
	const bytes = Uint8Array.from(atob(String(data.content).replace(/\s/g, '')), (c) => c.charCodeAt(0));
	return new Blob([bytes], { type: tipo });
}

/** sha actual de un archivo en la rama, o null si no existe. */
export async function shaActual(path: string): Promise<string | null> {
	try {
		const { data } = await gh.get(`/contents/${encodeURI(path)}`, { params: { ref: repo.branch } });
		return data.sha;
	} catch (e) {
		if (e instanceof AxiosError && e.response?.status === 404) return null;
		throw e;
	}
}

// ---------- Escritura ----------

export interface Cambio {
	path: string;
	/** Contenido en base64; null borra el archivo. */
	base64: string | null;
	/** sha que tenía el archivo al abrirlo (null si es nuevo). Sirve para detectar conflictos. */
	shaPrevio?: string | null;
}

/** Guarda varios archivos en un solo commit sobre la rama. */
export async function commitArchivos(cambios: Cambio[], mensaje: string): Promise<string> {
	// 1. Avisar si alguien cambió estos archivos mientras se editaban
	for (const c of cambios) {
		if (c.shaPrevio === undefined) continue;
		const actual = await shaActual(c.path);
		if (actual !== c.shaPrevio) {
			throw new Conflicto(
				`El archivo ${c.path} cambió en GitHub desde que abriste la noticia. Recarga la noticia para no sobrescribir esos cambios.`,
			);
		}
	}

	// 2. Commit actual y su árbol
	const { data: ref } = await gh.get(`/git/ref/heads/${repo.branch}`);
	const padre: string = ref.object.sha;
	const { data: commitPadre } = await gh.get(`/git/commits/${padre}`);

	// 3. Blobs de los archivos nuevos o modificados
	const tree = await Promise.all(
		cambios.map(async (c) => {
			if (c.base64 === null) return { path: c.path, mode: '100644', type: 'blob', sha: null };
			const { data: blob } = await gh.post('/git/blobs', { content: c.base64, encoding: 'base64' });
			return { path: c.path, mode: '100644', type: 'blob', sha: blob.sha as string };
		}),
	);

	// 4. Árbol, commit y avance de la rama (sin forzar: si la rama se movió, GitHub responde 422)
	const { data: nuevoArbol } = await gh.post('/git/trees', { base_tree: commitPadre.tree.sha, tree });
	const { data: commit } = await gh.post('/git/commits', { message: mensaje, tree: nuevoArbol.sha, parents: [padre] });
	await gh.patch(`/git/refs/heads/${repo.branch}`, { sha: commit.sha, force: false });
	return commit.sha as string;
}

// ---------- Tablero ----------

export interface CambioReciente {
	sha: string;
	mensaje: string;
	autor: string;
	fecha: string;
	url: string;
}

export async function ultimosCambios(n = 6): Promise<CambioReciente[]> {
	const { data } = await gh.get('/commits', { params: { sha: repo.branch, per_page: n } });
	return (data as any[]).map((c) => ({
		sha: c.sha,
		mensaje: String(c.commit.message).split('\n')[0],
		autor: c.commit.author?.name ?? c.author?.login ?? '—',
		fecha: c.commit.author?.date,
		url: c.html_url,
	}));
}

export interface Publicacion {
	estado: 'en-cola' | 'publicando' | 'en-linea' | 'fallo' | 'cancelada';
	commit: string;
	fecha: string;
	url: string;
}

/** Última ejecución del flujo de publicación en la rama (necesita permiso de lectura en Actions). */
export async function ultimaPublicacion(): Promise<Publicacion | null> {
	const { data } = await gh.get('/actions/runs', { params: { branch: repo.branch, per_page: 1 } });
	const run = data.workflow_runs?.[0];
	if (!run) return null;
	const estado: Publicacion['estado'] =
		run.status === 'queued' || run.status === 'waiting' || run.status === 'pending' || run.status === 'requested'
			? 'en-cola'
			: run.status !== 'completed'
				? 'publicando'
				: run.conclusion === 'success'
					? 'en-linea'
					: run.conclusion === 'cancelled'
						? 'cancelada'
						: 'fallo';
	return { estado, commit: run.head_sha, fecha: run.updated_at, url: run.html_url };
}
