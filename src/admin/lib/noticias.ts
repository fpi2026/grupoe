/**
 * Noticias en el panel: leer, validar y guardar los archivos
 * src/content/noticias/{es,en}/<slug>.md (mismo formato que src/content.config.ts).
 */
import { parse, stringify } from 'yaml';
import { newsTagIds, type NewsTag } from '../../data/noticias';
import { aBase64, arbol, blobABase64, commitArchivos, leerTexto, type Cambio, type Entrada } from './github';

export const LANGS = ['es', 'en'] as const;
export type Idioma = (typeof LANGS)[number];

const CARPETA = 'src/content/noticias';
const CARPETA_PORTADAS = 'src/assets/noticias';

export interface Texto {
	titulo: string;
	resumen: string;
	portadaAlt: string;
	cuerpo: string;
}

export interface Noticia {
	slug: string;
	fecha: string; // AAAA-MM-DD
	portada: string; // ruta relativa al .md, como en el archivo
	etiquetas: NewsTag[];
	publicado: boolean;
	textos: Record<Idioma, Texto | null>;
	/** sha de cada archivo al abrirlo (para detectar conflictos). */
	shas: Record<Idioma, string | null>;
}

export const textoVacio = (): Texto => ({ titulo: '', resumen: '', portadaAlt: '', cuerpo: '' });

export function noticiaNueva(): Noticia {
	const hoy = new Date();
	const fecha = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
	return {
		slug: '',
		fecha,
		portada: '',
		etiquetas: [],
		publicado: false,
		textos: { es: textoVacio(), en: textoVacio() },
		shas: { es: null, en: null },
	};
}

/** Ruta de un archivo de noticia. */
export const rutaNoticia = (lang: Idioma, slug: string) => `${CARPETA}/${lang}/${slug}.md`;

/** Ruta en el repositorio de una portada escrita como en el .md (relativa a la carpeta del idioma). */
export function rutaPortada(portada: string): string {
	const partes = `${CARPETA}/es`.split('/');
	for (const p of portada.split('/')) {
		if (p === '..') partes.pop();
		else if (p && p !== '.') partes.push(p);
	}
	return partes.join('/');
}

/** "Volcán & Café: ¡Noticias!" → "volcan-cafe-noticias" */
export function slugDe(texto: string): string {
	return texto
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 60)
		.replace(/-+$/, '');
}

// ---------- Archivo .md ----------

function separar(md: string): { datos: Record<string, unknown>; cuerpo: string } {
	const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(md);
	if (!m) return { datos: {}, cuerpo: md };
	return { datos: (parse(m[1]!) ?? {}) as Record<string, unknown>, cuerpo: m[2]!.replace(/^\s*\n/, '') };
}

function fechaISO(v: unknown): string {
	if (v instanceof Date) return v.toISOString().slice(0, 10);
	return String(v ?? '').slice(0, 10);
}

function serializar(n: Noticia, t: Texto): string {
	const datos = {
		titulo: t.titulo.trim(),
		fecha: n.fecha,
		portada: n.portada,
		portadaAlt: t.portadaAlt.trim(),
		resumen: t.resumen.trim(),
		etiquetas: n.etiquetas,
		publicado: n.publicado,
	};
	return `---\n${stringify(datos, { lineWidth: 0 })}---\n\n${t.cuerpo.trim()}\n`;
}

// ---------- Lectura ----------

export interface Repo {
	noticias: Noticia[];
	/** Todos los archivos (para encontrar el sha de las portadas). */
	archivos: Map<string, string>;
}

/** Lee todas las noticias del repositorio, agrupadas por slug. */
export async function cargarNoticias(): Promise<Repo> {
	const todos = await arbol();
	const archivos = new Map(todos.map((e) => [e.path, e.sha]));
	const re = new RegExp(`^${CARPETA}/(es|en)/([^/]+)\\.md$`);
	const mds = todos.flatMap((e: Entrada) => {
		const m = re.exec(e.path);
		return m ? [{ lang: m[1] as Idioma, slug: m[2]!, sha: e.sha }] : [];
	});

	const porSlug = new Map<string, Noticia>();
	await Promise.all(
		mds.map(async ({ lang, slug, sha }) => {
			const { datos, cuerpo } = separar(await leerTexto(sha));
			const n = porSlug.get(slug) ?? { ...noticiaNueva(), slug, textos: { es: null, en: null }, shas: { es: null, en: null } };
			// Los datos compartidos se toman del español si existe
			if (lang === 'es' || !n.portada) {
				n.fecha = fechaISO(datos.fecha);
				n.portada = String(datos.portada ?? '');
				n.etiquetas = (Array.isArray(datos.etiquetas) ? datos.etiquetas : []).filter((t): t is NewsTag =>
					(newsTagIds as readonly string[]).includes(String(t)),
				);
				n.publicado = datos.publicado !== false;
			}
			n.textos[lang] = {
				titulo: String(datos.titulo ?? ''),
				resumen: String(datos.resumen ?? ''),
				portadaAlt: String(datos.portadaAlt ?? ''),
				cuerpo,
			};
			n.shas[lang] = sha;
			porSlug.set(slug, n);
		}),
	);
	const noticias = [...porSlug.values()].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.slug.localeCompare(a.slug));
	return { noticias, archivos };
}

// ---------- Validación ----------

/** Un idioma está vacío si no tiene ningún texto: en ese caso no se guarda (o se borra). */
export const estaVacio = (t: Texto | null) => !t || !(t.titulo.trim() || t.resumen.trim() || t.portadaAlt.trim() || t.cuerpo.trim());

export const MAX_RESUMEN = 200;

export type Errores = Partial<Record<string, string>>;

const EN_IDIOMA: Record<Idioma, string> = { es: 'en español', en: 'en inglés' };

/**
 * Reglas del diseño (Panel-EditorNoticia) y del esquema del sitio (src/content.config.ts):
 * el español es obligatorio; el inglés se puede dejar vacío y completar después, pero si se
 * empieza, necesita título, resumen y descripción de la foto.
 */
export function validar(n: Noticia, ocupados: Set<string>, hayPortada: boolean): Errores {
	const e: Errores = {};
	if (!n.slug) e.slug = 'Escribe la dirección de la página. Ejemplo: premio-wise-2026';
	else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(n.slug)) e.slug = 'Usa solo minúsculas, números y guiones, sin espacios. Ejemplo: premio-wise-2026';
	else if (ocupados.has(n.slug)) e.slug = 'Ya existe otra noticia con esta dirección.';
	if (!/^\d{4}-\d{2}-\d{2}$/.test(n.fecha)) e.fecha = 'Elige una fecha.';
	if (!hayPortada) e.portada = 'Sube una foto de portada.';
	if (!n.etiquetas.length) e.etiquetas = 'Elige al menos una etiqueta.';
	for (const l of LANGS) {
		const t = n.textos[l];
		if (l === 'en' && estaVacio(t)) continue;
		if (!t?.titulo.trim()) e[`${l}.titulo`] = `Escribe un título ${EN_IDIOMA[l]}.`;
		if (!t?.resumen.trim()) e[`${l}.resumen`] = `Escribe un resumen corto ${EN_IDIOMA[l]}.`;
		else if (t.resumen.trim().length > MAX_RESUMEN)
			e[`${l}.resumen`] = `El resumen tiene ${t.resumen.trim().length} caracteres. Acórtalo a ${MAX_RESUMEN} como máximo.`;
		if (!t?.portadaAlt.trim()) e[`${l}.portadaAlt`] = `Describe la foto de portada ${EN_IDIOMA[l]}.`;
	}
	return e;
}

// ---------- Escritura ----------

/**
 * Si la portada fue subida por el panel (src/assets/noticias/) y ninguna otra noticia la usa,
 * devuelve el cambio que la borra; así no se acumulan fotos sin uso en el repositorio.
 */
function borrarPortadaSinUso(portada: string, slug: string, otras: Noticia[], archivos: Map<string, string>): Cambio[] {
	const path = rutaPortada(portada);
	if (!portada || !path.startsWith(`${CARPETA_PORTADAS}/`)) return [];
	if (otras.some((o) => o.slug !== slug && o.portada === portada)) return [];
	const sha = archivos.get(path);
	return sha ? [{ path, base64: null, shaPrevio: sha }] : [];
}

/**
 * Guarda la noticia (ES, EN y portada nueva) en un solo commit y devuelve su sha.
 * Si cambió la dirección (slug), los archivos se mueven en el mismo commit.
 */
export async function guardarNoticia(n: Noticia, portadaNueva: Blob | null, original: Noticia | null, repo: Repo): Promise<string> {
	const cambios: Cambio[] = [];
	let portada = n.portada;
	const viejo = original?.slug;

	if (portadaNueva) {
		const nombre = `${n.slug}-${Date.now().toString(36)}.webp`;
		cambios.push({ path: `${CARPETA_PORTADAS}/${nombre}`, base64: await blobABase64(portadaNueva) });
		portada = `../../../assets/noticias/${nombre}`;
		cambios.push(...borrarPortadaSinUso(n.portada, viejo ?? n.slug, repo.noticias, repo.archivos));
	}

	const final = { ...n, portada };
	const movida = Boolean(viejo && viejo !== n.slug);
	for (const l of LANGS) {
		const t = n.textos[l];
		const path = rutaNoticia(l, n.slug);
		// Al mover, el archivo nuevo no debe existir (null) y el viejo se borra
		if (movida && original!.shas[l]) cambios.push({ path: rutaNoticia(l, viejo!), base64: null, shaPrevio: original!.shas[l] });
		const previo = movida ? null : n.shas[l];
		if (!estaVacio(t)) cambios.push({ path, base64: aBase64(serializar(final, t!)), shaPrevio: previo });
		else if (!movida && n.shas[l]) cambios.push({ path, base64: null, shaPrevio: n.shas[l] }); // se vació ese idioma
	}

	const titulo = n.textos.es!.titulo.trim();
	const accion = original ? 'Actualiza' : 'Agrega';
	const estado = n.publicado ? '' : ' (borrador)';
	return commitArchivos(cambios, `CMS: ${accion} la noticia «${titulo}»${estado}`);
}

/** Borra los archivos de la noticia (y su portada, si la subió el panel y nadie más la usa). Devuelve el sha del commit. */
export async function borrarNoticia(n: Noticia, repo: Repo): Promise<string> {
	const cambios: Cambio[] = LANGS.filter((l) => n.shas[l]).map((l) => ({
		path: rutaNoticia(l, n.slug),
		base64: null,
		shaPrevio: n.shas[l],
	}));
	cambios.push(...borrarPortadaSinUso(n.portada, n.slug, repo.noticias, repo.archivos));
	const titulo = (n.textos.es ?? n.textos.en)?.titulo ?? n.slug;
	return commitArchivos(cambios, `CMS: Borra la noticia «${titulo}»`);
}
