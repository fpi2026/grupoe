/**
 * Textos y avisos del sitio (src/content/datos/sitio.json, los edita el panel):
 * aviso temporal, contacto, lema y portada. Se valida al compilar en src/data/editable.ts.
 */
import type { Lang } from '../i18n/ui';
import sitioJson from '../content/datos/sitio.json';
import alojamientoJson from '../content/datos/alojamiento.json';

export interface Sitio {
	aviso: { activo: boolean; tono: 'info' | 'alerta'; texto: { es: string; en: string } };
	contacto: { whatsapp: string; correo: string; horario: { es: string; en: string } };
	lema: { es: string; en: string };
	portada: { antetitulo: { es: string; en: string }; titulo: { es: string; en: string }; texto: { es: string; en: string } };
}

export const sitio = sitioJson as Sitio;

/** Texto en el idioma pedido; si falta la traducción, el español. */
export const enIdioma = (t: { es: string; en: string }, lang: Lang) => (lang === 'en' && t.en.trim() ? t.en : t.es);

/** Horario de atención («7 a.m. a 7 p.m.»). */
export const horario = (lang: Lang) => enIdioma(sitio.contacto.horario, lang);

/** Título de portada partido en la coma: la segunda parte va en cursiva. */
export function tituloPortada(lang: Lang): [string, string] {
	const t = enIdioma(sitio.portada.titulo, lang);
	const i = t.indexOf(',');
	return i < 0 ? [t, ''] : [t.slice(0, i + 1), t.slice(i + 1).trim()];
}

/** Tarifa referencial de una cabaña alpina en dólares, de src/content/datos/alojamiento.json. */
export const tarifaCabana = `$${alojamientoJson.cabanas.tarifa}`;
