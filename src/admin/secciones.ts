/**
 * Secciones del panel con pantalla terminada (menú, tablero y lectura de los commits).
 * Al construir una sección nueva se agrega aquí.
 */
export interface Seccion {
	id: string;
	/** Ruta con hash, sin el «#». */
	ruta: string;
	texto: string;
	/** Archivo JSON en src/content/datos/ (las noticias son .md). */
	archivo?: string;
	/** Cómo la nombra el mensaje del commit: «CMS: Actualiza <esto>». */
	enCommit?: string;
	/** Resumen para el tablero a partir del JSON. */
	resumen?: (datos: any) => string;
}

export const SECCIONES: Seccion[] = [
	{ id: 'tablero', ruta: '/', texto: 'Tablero' },
	{ id: 'noticias', ruta: '/noticias', texto: 'Noticias' },
	{
		id: 'gastronomia',
		ruta: '/gastronomia',
		texto: 'Gastronomía',
		archivo: 'menu.json',
		enCommit: 'el menú de gastronomía',
		resumen: (d) => `${d.platillos.length} ${d.platillos.length === 1 ? 'platillo' : 'platillos'} · ${d.fotos.length} ${d.fotos.length === 1 ? 'foto' : 'fotos'}`,
	},
	{
		id: 'reconocimientos',
		ruta: '/reconocimientos',
		texto: 'Reconocimientos',
		archivo: 'reconocimientos.json',
		enCommit: 'los reconocimientos',
		resumen: (d) => (d.items.length === 1 ? '1 reconocimiento' : `${d.items.length} reconocimientos`),
	},
];

export const seccionActiva = (s: Seccion, ruta: string) => (s.ruta === '/' ? ruta === '/' : ruta === s.ruta || ruta.startsWith(`${s.ruta}/`));
