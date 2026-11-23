/**
 * Edición de los archivos JSON de src/content/datos/ (reconocimientos, menú, textos del sitio…).
 * Mismo esquema que las noticias: se lee el archivo por su sha, se edita en el navegador y se
 * guarda en UN commit junto con las fotos nuevas; si el archivo cambió mientras tanto, avisa.
 *
 * Fotos: en el JSON se escriben como ruta dentro de src/assets/ ("img/cascada.jpg",
 * "subidas/menu-x.webp"). Las que sube el panel van a src/assets/subidas/ y se borran
 * cuando el documento deja de usarlas.
 */
import { useEffect, useState } from 'preact/hooks';
import { Conflicto, aBase64, blobABase64, commitArchivos, leerTexto, mensajeDeError, type Cambio } from './github';
import type { Repo } from './noticias';

export const CARPETA_DATOS = 'src/content/datos';
const SUBIDAS = 'subidas/';

/** Ruta en el repositorio de una foto escrita como en el JSON. */
export const rutaFotoRepo = (ruta: string) => `src/assets/${ruta}`;

/** Nombre nuevo para una foto subida desde el panel. */
export const rutaFotoNueva = (prefijo: string) => `${SUBIDAS}${prefijo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}.webp`;

/** Las claves "_k" solo sirven para ordenar listas en el panel: no se guardan. */
const sinClaves = (_: string, v: unknown) => (_ === '_k' ? undefined : v);
export const aJson = (datos: unknown) => `${JSON.stringify(datos, sinClaves, '\t')}\n`;

let contador = 0;
/** Clave estable para cada elemento de una lista (para arrastrar y para Preact). */
export const conClave = <T extends object>(x: T): T & { _k: string } => ({ ...x, _k: `k${++contador}` });

/** Todas las fotos subidas por el panel que usa un documento. */
function fotosSubidas(datos: unknown): Set<string> {
	const s = new Set<string>();
	JSON.stringify(datos, (_, v) => {
		if (typeof v === 'string' && v.startsWith(SUBIDAS)) s.add(v);
		return v;
	});
	return s;
}

export interface EstadoDocumento<T> {
	/** undefined mientras carga. */
	datos: T | undefined;
	setDatos: (f: (d: T) => T) => void;
	/** Fotos elegidas que todavía no se suben (ruta del JSON → archivo). */
	fotos: Map<string, { blob: Blob; url: string }>;
	agregarFoto: (ruta: string, blob: Blob, url: string) => void;
	sucio: boolean;
	guardando: boolean;
	error: string;
	conflicto: boolean;
	/** Guarda y devuelve el sha del commit (o null si no se guardó). */
	guardar: (mensaje: string) => Promise<string | null>;
	/** Vuelve a la versión guardada. */
	descartar: () => void;
}

/**
 * Lee y guarda src/content/datos/<archivo>. `preparar` agrega lo que el panel necesita
 * para editar (por ejemplo, claves de lista) y se aplica también al descartar.
 */
export function useDocumento<T>(archivo: string, repo: Repo | null, preparar: (d: T) => T = (d) => d): EstadoDocumento<T> {
	const path = `${CARPETA_DATOS}/${archivo}`;
	const [original, setOriginal] = useState<{ datos: T; sha: string; json: string } | null>(null);
	const [datos, setDatosEstado] = useState<T | undefined>(undefined);
	const [fotos, setFotos] = useState(new Map<string, { blob: Blob; url: string }>());
	const [guardando, setGuardando] = useState(false);
	const [error, setError] = useState('');
	const [conflicto, setConflicto] = useState(false);

	useEffect(() => {
		if (!repo) return;
		const sha = repo.archivos.get(path);
		if (!sha) return setError(`No se encontró ${path} en el repositorio.`);
		let vivo = true;
		leerTexto(sha)
			.then((texto) => {
				if (!vivo) return;
				const d = preparar(JSON.parse(texto) as T);
				setOriginal({ datos: d, sha, json: aJson(d) });
				setDatosEstado(d);
			})
			.catch((e) => vivo && setError(e instanceof SyntaxError ? `${path} no es un JSON válido.` : mensajeDeError(e)));
		return () => {
			vivo = false;
		};
	}, [repo, path]);

	// Liberar las vistas previas al salir
	useEffect(() => () => fotos.forEach((f) => URL.revokeObjectURL(f.url)), []);

	const sucio = Boolean(original && datos !== undefined && aJson(datos) !== original.json);

	async function guardar(mensaje: string): Promise<string | null> {
		if (!original || datos === undefined || !repo) return null;
		setGuardando(true);
		setError('');
		setConflicto(false);
		try {
			const usadas = fotosSubidas(datos);
			const cambios: Cambio[] = [{ path, base64: aBase64(aJson(datos)), shaPrevio: original.sha }];
			for (const [ruta, f] of fotos) if (usadas.has(ruta)) cambios.push({ path: rutaFotoRepo(ruta), base64: await blobABase64(f.blob) });
			// Fotos subidas por el panel que este documento dejó de usar
			for (const ruta of fotosSubidas(original.datos)) {
				const sha = repo.archivos.get(rutaFotoRepo(ruta));
				if (!usadas.has(ruta) && sha) cambios.push({ path: rutaFotoRepo(ruta), base64: null, shaPrevio: sha });
			}
			return await commitArchivos(cambios, mensaje);
		} catch (e) {
			setConflicto(e instanceof Conflicto);
			setError(mensajeDeError(e));
			window.scrollTo({ top: 0, behavior: 'smooth' });
			return null;
		} finally {
			setGuardando(false);
		}
	}

	return {
		datos,
		setDatos: (f) => setDatosEstado((d) => (d === undefined ? d : f(d))),
		fotos,
		agregarFoto: (ruta, blob, url) => setFotos((m) => new Map(m).set(ruta, { blob, url })),
		sucio,
		guardando,
		error,
		conflicto,
		guardar,
		descartar: () => original && setDatosEstado(preparar(JSON.parse(original.json) as T)),
	};
}
