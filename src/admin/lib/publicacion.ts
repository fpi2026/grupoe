/**
 * Estado de la publicación del sitio (GitHub Actions), compartido por el marco del panel
 * (insignia del encabezado) y el tablero. Mientras compila se vuelve a consultar cada 10 s.
 */
import { useEffect, useState } from 'preact/hooks';
import { mensajeDeError, ultimaPublicacion, type Publicacion } from './github';

export interface EstadoPublicacion {
	/** undefined = cargando; null = todavía no hay publicaciones. */
	pub: Publicacion | null | undefined;
	error: string;
}

let estado: EstadoPublicacion = { pub: undefined, error: '' };
const oyentes = new Set<(e: EstadoPublicacion) => void>();
let reloj: ReturnType<typeof setTimeout> | undefined;
/** Commit recién guardado cuya publicación todavía no aparece en Actions. */
let esperando: { sha: string; desde: number } | null = null;

const CADA = 10_000;
/** Si en este tiempo no aparece la ejecución del commit guardado, se deja de esperarla. */
const ESPERA_MAXIMA = 3 * 60_000;

function cambiar(e: EstadoPublicacion) {
	estado = e;
	oyentes.forEach((o) => o(e));
}

async function consultar() {
	clearTimeout(reloj);
	try {
		let pub = await ultimaPublicacion();
		if (esperando) {
			if (pub?.commit === esperando.sha || Date.now() - esperando.desde > ESPERA_MAXIMA) esperando = null;
			// GitHub tarda unos segundos en crear la ejecución: mientras tanto, el cambio está en cola
			else pub = { estado: 'en-cola', commit: esperando.sha, fecha: new Date().toISOString(), url: pub?.url ?? '' };
		}
		cambiar({ pub, error: '' });
		if (pub && (pub.estado === 'en-cola' || pub.estado === 'publicando')) reloj = setTimeout(consultar, CADA);
	} catch (e) {
		cambiar({ ...estado, error: mensajeDeError(e) });
	}
}

/** Vuelve a consultar ya. Con el sha de un commit recién guardado, espera su publicación. */
export function seguirPublicacion(sha?: string) {
	if (sha) {
		esperando = { sha, desde: Date.now() };
		cambiar({ pub: { estado: 'en-cola', commit: sha, fecha: new Date().toISOString(), url: estado.pub?.url ?? '' }, error: '' });
	}
	void consultar();
}

/** Deja de consultar y olvida el estado (al cerrar sesión). */
export function olvidarPublicacion() {
	clearTimeout(reloj);
	esperando = null;
	cambiar({ pub: undefined, error: '' });
}

export function usePublicacion(): EstadoPublicacion {
	const [e, setE] = useState(estado);
	useEffect(() => {
		oyentes.add(setE);
		if (estado.pub === undefined && !estado.error) void consultar();
		return () => {
			oyentes.delete(setE);
		};
	}, []);
	return e;
}
