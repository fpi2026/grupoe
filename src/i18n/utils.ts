import { contact, defaultLang, routes, ui, type Lang, type RouteKey, type UIKey } from './ui';

/** BASE_URL sin barra final ('' cuando el sitio está en la raíz). */
const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

/**
 * Ruta interna con BASE_URL. Usar siempre para enlaces y recursos internos.
 * withBase('favicon.svg') → '/grupoe/favicon.svg'
 */
export function withBase(path = ''): string {
	const clean = path.replace(/^\/+/, '');
	return `${base}/${clean}`;
}

/** Devuelve la función de traducción para un idioma. */
export function useTranslations(lang: Lang) {
	return (key: UIKey): string => ui[lang][key] ?? ui[defaultLang][key];
}

/**
 * Enlace a una página en un idioma, con BASE_URL y barra final.
 * localizedPath('alojamiento', 'en', '#reserva') → '/grupoe/en/stay/#reserva'
 */
export function localizedPath(route: RouteKey, lang: Lang, hash = ''): string {
	const slug = routes[route][lang];
	const prefix = lang === defaultLang ? '' : `${lang}/`;
	const path = `${prefix}${slug}`;
	return withBase(path ? `${path.replace(/\/+$/, '')}/` : '') + hash;
}

/** Enlace de WhatsApp con el mensaje prellenado del idioma. */
export function whatsappUrl(lang?: Lang): string {
	const url = `https://wa.me/${contact.whatsapp}`;
	return lang ? `${url}?text=${encodeURIComponent(ui[lang]['whatsapp.message'])}` : url;
}
